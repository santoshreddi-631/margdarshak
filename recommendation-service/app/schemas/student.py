from typing import List, Optional, Literal, Any, Union, Dict
from pydantic import BaseModel, Field, field_validator, model_validator

EducationLevel = Literal[
    "below_10th",
    "10th_standard",
    "12th_standard",
    "vocational_iti",
    "diploma",
    "bachelors",
    "masters"
]

ProficiencyLevel = Literal["beginner", "intermediate", "advanced"]

class StudentSkill(BaseModel):
    skill_id: Optional[str] = None
    name: str
    category: Optional[str] = None
    proficiency_level: ProficiencyLevel = "beginner"

class StudentInterest(BaseModel):
    interest_id: Optional[str] = None
    code: Optional[str] = None
    name: str

class StudentPreferences(BaseModel):
    preferred_work_environment: Optional[Literal["field_practical", "office_desk", "hybrid"]] = "field_practical"
    willingness_to_relocate: Optional[Literal["within_district", "within_state", "anywhere_in_india"]] = "within_state"
    preferred_learning_method: Optional[Literal["practical_hands_on", "classroom", "online", "apprenticeship"]] = "practical_hands_on"

class StudentProfile(BaseModel):
    id: Optional[str] = None
    full_name: Optional[str] = None
    current_education_level: str = "10th_standard"
    educational_stream: Optional[str] = None
    graduation_year: Optional[str] = None
    preferred_language: Literal["en", "te", "hi"] = "en"
    state: Optional[str] = None
    district: Optional[str] = None

    @field_validator("current_education_level", mode="before")
    @classmethod
    def normalize_education(cls, v):
        if not v:
            return "10th_standard"
        s = str(v).lower().strip().replace("-", "_").replace(" ", "_")
        if "below" in s:
            return "below_10th"
        if "10th" in s or "matric" in s:
            return "10th_standard"
        if "12th" in s or "inter" in s:
            return "12th_standard"
        if "iti" in s or "vocational" in s:
            return "vocational_iti"
        if "diploma" in s or "polytechnic" in s:
            return "diploma"
        if "degree" in s or "bachelor" in s or "graduate" in s:
            return "bachelors"
        if "master" in s or "post" in s:
            return "masters"
        return "10th_standard"

class AssessmentResponseItem(BaseModel):
    question_id: str
    selected_option_ids: List[str] = Field(default_factory=list)
    rating_value: Optional[str] = None
    text_response: Optional[str] = None

class StudentInput(BaseModel):
    user_id: Optional[str] = "guest"
    profile: Optional[StudentProfile] = None
    skills: List[StudentSkill] = Field(default_factory=list)
    interests: List[StudentInterest] = Field(default_factory=list)
    preferences: Optional[StudentPreferences] = None
    assessment_responses: List[AssessmentResponseItem] = Field(default_factory=list)
    language: Literal["en", "te", "hi"] = "en"
    filter_ineligible: bool = True

    @model_validator(mode="before")
    @classmethod
    def normalize_inputs(cls, data: Any):
        if not isinstance(data, dict):
            return data

        # Normalize interests if passed as list of strings or dicts
        raw_interests = data.get("interests", [])
        norm_interests = []
        if isinstance(raw_interests, list):
            for idx, item in enumerate(raw_interests):
                if isinstance(item, StudentInterest):
                    norm_interests.append(item)
                elif isinstance(item, str):
                    norm_interests.append({
                        "interest_id": f"i-{idx}",
                        "code": item,
                        "name": item.replace("_", " ").title(),
                    })
                elif isinstance(item, dict):
                    name = item.get("name") or item.get("code") or f"interest-{idx}"
                    norm_interests.append({
                        "interest_id": item.get("interest_id") or f"i-{idx}",
                        "code": item.get("code") or str(name).lower(),
                        "name": str(name),
                    })
                elif hasattr(item, "name"):
                    norm_interests.append(item)
            data["interests"] = norm_interests

        # Normalize skills if passed as dict of key-value or list of strings
        raw_skills = data.get("skills", [])
        norm_skills = []
        if isinstance(raw_skills, dict):
            for k, v in raw_skills.items():
                prof = v if v in ["beginner", "intermediate", "advanced"] else "intermediate"
                norm_skills.append({
                    "name": k.replace("_", " ").title(),
                    "proficiency_level": prof,
                })
            data["skills"] = norm_skills
        elif isinstance(raw_skills, list):
            for idx, s in enumerate(raw_skills):
                if isinstance(s, StudentSkill):
                    norm_skills.append(s)
                elif isinstance(s, str):
                    norm_skills.append({
                        "name": s.replace("_", " ").title(),
                        "proficiency_level": "intermediate",
                    })
                elif isinstance(s, dict):
                    name = s.get("name") or s.get("skill_name") or f"skill-{idx}"
                    prof = s.get("proficiency_level") or "intermediate"
                    if prof not in ["beginner", "intermediate", "advanced"]:
                        prof = "intermediate"
                    norm_skills.append({
                        "skill_id": s.get("skill_id"),
                        "name": str(name),
                        "category": s.get("category"),
                        "proficiency_level": prof,
                    })
                elif hasattr(s, "name"):
                    norm_skills.append(s)
            data["skills"] = norm_skills

        # Normalize preferences work environment
        prefs = data.get("preferences")
        if isinstance(prefs, dict):
            we = prefs.get("preferred_work_environment")
            if we in ["field_outdoor", "field_work", "practical"]:
                prefs["preferred_work_environment"] = "field_practical"
            elif we in ["remote_desk", "desk", "office"]:
                prefs["preferred_work_environment"] = "office_desk"

        return data

