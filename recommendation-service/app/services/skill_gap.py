from typing import List
from app.schemas.student import StudentSkill
from app.schemas.career import CareerCatalogItem
from app.schemas.skill_gap import SkillGapItem, SkillGapResponse
from app.services.skill_matching import clean_text, skill_names_match

def analyze_skill_gap(
    student_skills: List[StudentSkill],
    career: CareerCatalogItem,
    language: str = "en"
) -> SkillGapResponse:
    """
    Performs comprehensive skill gap analysis comparing student's declared skills
    against career required and recommended standards.
    """
    existing_skills: List[SkillGapItem] = []
    missing_skills: List[SkillGapItem] = []
    skills_to_improve: List[SkillGapItem] = []

    # Map student skills by normalized name
    student_map = {}
    for s in student_skills:
        student_map[clean_text(s.name)] = s

    total_requirements = len(career.required_skills) + len(career.recommended_skills)
    points_earned = 0.0

    # 1. Evaluate Required Skills
    for req in career.required_skills:
        matched_student_skill = None
        for s_clean, s in student_map.items():
            if skill_names_match(s_clean, req.name):
                matched_student_skill = s
                break

        if matched_student_skill:
            prof = matched_student_skill.proficiency_level.lower()
            if prof in ["intermediate", "advanced"]:
                points_earned += 1.0
                existing_skills.append(
                    SkillGapItem(
                        name=req.name,
                        status="acquired",
                        current_proficiency=prof.title(),
                        required_proficiency="Intermediate",
                        importance="required",
                        priority="medium",
                        actionable_advice="Verified competency. Continue real-world projects to maintain fluency."
                    )
                )
            else:  # Beginner
                points_earned += 0.5
                skills_to_improve.append(
                    SkillGapItem(
                        name=req.name,
                        status="needs_improvement",
                        current_proficiency="Beginner",
                        required_proficiency="Intermediate",
                        importance="required",
                        priority="high",
                        actionable_advice=f"Foundational understanding exists. Advance to intermediate competency through hands-on lab practice."
                    )
                )
        else:
            missing_skills.append(
                SkillGapItem(
                    name=req.name,
                    status="missing",
                    current_proficiency=None,
                    required_proficiency="Intermediate",
                    importance="required",
                    priority="critical",
                    actionable_advice=f"Mandatory requirement. Must prioritize certified training in {req.name} via PMKVY or government ITI."
                )
            )

    # 2. Evaluate Recommended Skills
    for rec in career.recommended_skills:
        matched_student_skill = None
        for s_clean, s in student_map.items():
            if skill_names_match(s_clean, rec.name):
                matched_student_skill = s
                break

        if matched_student_skill:
            prof = matched_student_skill.proficiency_level.lower()
            if prof in ["intermediate", "advanced"]:
                points_earned += 1.0
                existing_skills.append(
                    SkillGapItem(
                        name=rec.name,
                        status="acquired",
                        current_proficiency=prof.title(),
                        required_proficiency="Intermediate",
                        importance="recommended",
                        priority="medium",
                        actionable_advice="Strong value-add skill acquired. Sets you apart in interviews."
                    )
                )
            else:
                points_earned += 0.5
                skills_to_improve.append(
                    SkillGapItem(
                        name=rec.name,
                        status="needs_improvement",
                        current_proficiency="Beginner",
                        required_proficiency="Intermediate",
                        importance="recommended",
                        priority="medium",
                        actionable_advice=f"Good start in {rec.name}. Supplementary online practice will boost your portfolio."
                    )
                )
        else:
            missing_skills.append(
                SkillGapItem(
                    name=rec.name,
                    status="missing",
                    current_proficiency=None,
                    required_proficiency="Intermediate",
                    importance="recommended",
                    priority="high",
                    actionable_advice=f"Recommended for faster career growth. Consider free online modules."
                )
            )

    # 3. Calculate Overall Readiness Percentage
    if total_requirements > 0:
        readiness_pct = (points_earned / total_requirements) * 100.0
    else:
        readiness_pct = 75.0

    readiness_pct = round(min(100.0, max(0.0, readiness_pct)), 1)

    # 4. Generate Strategic Action Steps
    recommendations = []
    if missing_skills:
        critical_count = sum(1 for m in missing_skills if m.priority == "critical")
        if critical_count > 0:
            recommendations.append(
                f"Bridge {critical_count} critical required skills before applying for full-time positions."
            )
        else:
            recommendations.append(
                "You have met all mandatory core skills. Focus on recommended tools to maximize starting pay."
            )

    if skills_to_improve:
        recommendations.append(
            f"Upgrade {len(skills_to_improve)} existing beginner skills to intermediate level through structured apprenticeships."
        )

    if readiness_pct >= 70.0:
        recommendations.append("High job-readiness. You are well positioned to apply for entry-level traineeships.")
    elif readiness_pct >= 40.0:
        recommendations.append("Moderate readiness. A 3-month focused vocational program will make you job-ready.")
    else:
        recommendations.append("Early stage. Complete foundational skilling courses before seeking immediate placement.")

    # Localized career title
    career_name = career.name
    if language in career.translations:
        career_name = career.translations[language].title

    return SkillGapResponse(
        career_id=career.id,
        career_name=career_name,
        readiness_percentage=readiness_pct,
        existing_skills=existing_skills,
        missing_skills=missing_skills,
        skills_to_improve=skills_to_improve,
        learning_resources=[res.model_dump() for res in career.learning_resources],
        recommendations=recommendations
    )
