from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from app.schemas.student import StudentSkill

SkillStatus = Literal["acquired", "needs_improvement", "missing"]
SkillPriority = Literal["critical", "high", "medium"]

class SkillGapItem(BaseModel):
    name: str
    status: SkillStatus
    current_proficiency: Optional[str] = None
    required_proficiency: str = "intermediate"
    importance: str = "required"
    priority: SkillPriority
    actionable_advice: str

class SkillGapRequest(BaseModel):
    career_id: Optional[str] = None
    career_slug: Optional[str] = None
    student_skills: List[StudentSkill] = Field(default_factory=list)
    language: Literal["en", "te", "hi"] = "en"

class SkillGapResponse(BaseModel):
    career_id: str
    career_name: str
    readiness_percentage: float = Field(..., description="Percentage of required and recommended skills satisfied")
    existing_skills: List[SkillGapItem] = Field(default_factory=list)
    missing_skills: List[SkillGapItem] = Field(default_factory=list)
    skills_to_improve: List[SkillGapItem] = Field(default_factory=list)
    learning_resources: List[dict] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
