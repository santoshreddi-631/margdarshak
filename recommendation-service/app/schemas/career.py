from typing import List, Optional, Dict, Literal
from pydantic import BaseModel, Field

class CareerSkillRequirement(BaseModel):
    name: str
    importance: Literal["required", "recommended", "optional"] = "required"
    weight: float = 1.0

class EligibilityRequirements(BaseModel):
    min_education_level: str
    allowed_streams: List[str] = Field(default_factory=lambda: ["any"])
    mandatory_rules: List[str] = Field(default_factory=list)
    preferred_qualifications: List[str] = Field(default_factory=list)

class LearningResourceItem(BaseModel):
    title: str
    provider: str
    url: str
    type: str
    is_free: bool = True

class CareerTranslationItem(BaseModel):
    title: str
    description: str
    job_responsibilities: Optional[str] = None

class CareerCatalogItem(BaseModel):
    id: str
    slug: str
    name: str
    category: str
    growth_demand: Literal["high", "steady", "emerging"] = "high"
    estimated_salary_range: str
    training_duration: str
    required_education: str
    eligibility_requirements: EligibilityRequirements
    required_skills: List[CareerSkillRequirement]
    recommended_skills: List[CareerSkillRequirement] = Field(default_factory=list)
    relevant_interests: List[str] = Field(default_factory=list)
    preferred_work_environment: List[str] = Field(default_factory=list)
    learning_resources: List[LearningResourceItem] = Field(default_factory=list)
    career_pathways: Dict[str, str] = Field(default_factory=dict)
    translations: Dict[str, CareerTranslationItem] = Field(default_factory=dict)
    sample_data_verification: Optional[Dict[str, object]] = None
