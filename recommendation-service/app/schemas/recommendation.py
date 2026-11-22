from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class ScoreBreakdown(BaseModel):
    interest_match: float
    skill_match: float
    education_match: float
    preference_match: float

class EducationEligibilityInfo(BaseModel):
    is_eligible: bool
    student_level: str
    required_level: str
    is_preferred_stream: bool
    notes: str

class CareerRecommendationItem(BaseModel):
    career_id: str
    slug: str
    title: str
    category: str
    match_score: float = Field(..., description="Normalized weighted compatibility score from 0 to 100")
    score_breakdown: ScoreBreakdown
    reasons: List[str] = Field(default_factory=list)
    matching_interests: List[str] = Field(default_factory=list)
    matching_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    education_eligibility: EducationEligibilityInfo
    alternative_career_options: List[str] = Field(default_factory=list)
    salary_range: str
    training_duration: str
    growth_demand: str
    description: str

class RecommendationResponse(BaseModel):
    user_id: str
    recommendations: List[CareerRecommendationItem]
    total_evaluated_careers: int
    weights_used: Dict[str, float]
    disclaimer: str = (
        "Match scores represent programmatic suitability and alignment with student declarations, "
        "not guaranteed employment probabilities or job guarantees."
    )
