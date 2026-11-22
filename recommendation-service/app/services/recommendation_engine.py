import json
import os
from typing import List, Optional
from app.core.config import settings
from app.schemas.career import CareerCatalogItem
from app.schemas.student import StudentInput
from app.schemas.recommendation import (
    CareerRecommendationItem,
    RecommendationResponse,
    ScoreBreakdown,
)
from app.services.eligibility import check_eligibility
from app.services.interest_matching import calculate_interest_match
from app.services.skill_matching import calculate_skill_match

class RecommendationEngine:
    def __init__(self, catalog_path: Optional[str] = None):
        self.catalog_path = catalog_path or settings.CAREER_CATALOG_PATH
        self.careers: List[CareerCatalogItem] = []
        self.load_catalog()

    def load_catalog(self):
        """Loads and parses the career catalog from the JSON data file."""
        if not os.path.exists(self.catalog_path):
            raise FileNotFoundError(f"Career catalog JSON file not found at: {self.catalog_path}")

        with open(self.catalog_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)

        self.careers = [CareerCatalogItem(**item) for item in raw_data]

    def calculate_preference_match(self, student_input: StudentInput, career: CareerCatalogItem) -> float:
        """Calculates normalized preference alignment score (0 - 100)."""
        prefs = student_input.preferences
        if not prefs:
            return 75.0

        env_score = 70.0
        student_env = prefs.preferred_work_environment or "field_practical"
        career_envs = career.preferred_work_environment or ["field_practical", "hybrid"]

        if student_env in career_envs:
            env_score = 100.0
        elif "hybrid" in career_envs:
            env_score = 85.0
        else:
            env_score = 50.0

        reloc_score = 80.0
        reloc = prefs.willingness_to_relocate or "within_state"
        if reloc == "anywhere_in_india":
            reloc_score = 100.0
        elif reloc == "within_state":
            reloc_score = 85.0
        elif reloc == "within_district":
            # Certain careers (solar, cctv, dairy) are exceptionally suited for local district practice
            if career.category in ["trades", "agriculture"]:
                reloc_score = 90.0
            else:
                reloc_score = 65.0

        method_score = 80.0
        if prefs.preferred_learning_method == "practical_hands_on" and career.category in ["trades", "agriculture"]:
            method_score = 95.0

        weighted_pref = (0.50 * env_score) + (0.30 * reloc_score) + (0.20 * method_score)
        return round(min(100.0, max(0.0, weighted_pref)), 2)

    def generate_recommendations(
        self,
        student_input: StudentInput,
        limit: int = 5
    ) -> RecommendationResponse:
        """
        Executes multi-stage recommendation pipeline:
        Stage 1: Load Catalog
        Stage 2: Eligibility Filtering
        Stage 3: Weighted Multi-Factor Matching
        Stage 4: Career Ranking & Rationale Generation
        """
        w_interest = settings.WEIGHT_INTEREST
        w_skill = settings.WEIGHT_SKILL
        w_education = settings.WEIGHT_EDUCATION
        w_preference = settings.WEIGHT_PREFERENCE

        weights_used = {
            "interest": w_interest,
            "skill": w_skill,
            "education": w_education,
            "preference": w_preference,
        }

        lang = student_input.language or "en"
        student_edu_level = student_input.profile.current_education_level if student_input.profile else "10th_standard"
        student_stream = student_input.profile.educational_stream if student_input.profile else None

        filter_ineligible = getattr(student_input, "filter_ineligible", True)
        if filter_ineligible is None:
            filter_ineligible = True

        candidates = []

        for career in self.careers:
            # Stage 2: Eligibility Filtering
            is_eligible, edu_info, edu_score = check_eligibility(
                student_education_level=student_edu_level,
                student_stream=student_stream,
                career=career
            )

            # Skip careers that strictly fail essential eligibility when filter_ineligible is active
            if filter_ineligible and not is_eligible:
                continue

            # Stage 3: Component Scoring
            interest_score, matched_interests = calculate_interest_match(
                student_interests=student_input.interests,
                career_interests=career.relevant_interests
            )

            skill_score, matched_skills, missing_skills = calculate_skill_match(
                student_skills=student_input.skills,
                career=career
            )

            pref_score = self.calculate_preference_match(student_input, career)

            # Weighted Formula: strictly 0.40 * Interest + 0.30 * Skill + 0.20 * Education + 0.10 * Preference
            composite_score = (
                (w_interest * interest_score)
                + (w_skill * skill_score)
                + (w_education * edu_score)
                + (w_preference * pref_score)
            )

            # Penalize ineligible careers if retaining them in non-filter mode
            if not is_eligible:
                composite_score = max(0.0, composite_score * 0.70)

            composite_score = round(min(100.0, max(0.0, composite_score)), 1)

            # Stage 4: Construct Understandable Explanations
            reasons = []
            if matched_interests:
                reasons.append(f"Directly matches your interest in {', '.join(matched_interests[:2])}")
            if matched_skills:
                reasons.append(f"Leverages your existing skills: {', '.join(matched_skills[:2])}")
            if not edu_info.is_eligible:
                reasons.append(f"Requires advancement to {edu_info.required_level.replace('_', ' ').title()}")
            elif edu_info.is_eligible:
                reasons.append(f"Fully eligible with your {student_edu_level.replace('_', ' ').title()} qualification")
            if career.growth_demand == "high":
                reasons.append(f"High regional hiring demand and active government training schemes")
            elif career.growth_demand == "emerging":
                reasons.append(f"Fast-growing future technology field with high entrepreneurship potential")

            if len(reasons) < 2:
                reasons.append(f"Practical pathway with structured {career.training_duration} vocational certification")

            # Localized Title & Description
            title = career.name
            description = ""
            if lang in career.translations:
                title = career.translations[lang].title
                description = career.translations[lang].description
            elif "en" in career.translations:
                title = career.translations["en"].title
                description = career.translations["en"].description

            candidates.append({
                "career": career,
                "composite_score": composite_score,
                "breakdown": ScoreBreakdown(
                    interest_match=interest_score,
                    skill_match=skill_score,
                    education_match=edu_score,
                    preference_match=pref_score
                ),
                "reasons": reasons[:4],
                "matching_interests": matched_interests,
                "matching_skills": matched_skills,
                "missing_skills": missing_skills,
                "education_eligibility": edu_info,
                "title": title,
                "description": description,
            })

        # Rank candidates by composite score descending
        candidates.sort(key=lambda x: x["composite_score"], reverse=True)

        # Select alternative careers (closely related or fallback stepping stones)
        recommendation_items: List[CareerRecommendationItem] = []
        for rank_idx, item in enumerate(candidates[:limit]):
            c: CareerCatalogItem = item["career"]

            # Pick alternative options from same category or related careers
            same_cat = [other.name for other in self.careers if other.category == c.category and other.id != c.id]
            other_names = [other.name for other in self.careers if other.id != c.id and other.name not in same_cat]
            alternatives = (same_cat + other_names)[:2]

            rec_item = CareerRecommendationItem(
                career_id=c.id,
                slug=c.slug,
                title=item["title"],
                category=c.category,
                match_score=item["composite_score"],
                score_breakdown=item["breakdown"],
                reasons=item["reasons"],
                matching_interests=item["matching_interests"],
                matching_skills=item["matching_skills"],
                missing_skills=item["missing_skills"],
                education_eligibility=item["education_eligibility"],
                alternative_career_options=alternatives,
                salary_range=c.estimated_salary_range,
                training_duration=c.training_duration,
                growth_demand=c.growth_demand,
                description=item["description"],
            )
            recommendation_items.append(rec_item)

        return RecommendationResponse(
            user_id=student_input.user_id or "guest",
            recommendations=recommendation_items,
            total_evaluated_careers=len(candidates),
            weights_used=weights_used
        )

# Singleton engine instance
recommendation_engine = RecommendationEngine()
