from typing import Optional, Tuple
from app.schemas.career import CareerCatalogItem
from app.schemas.recommendation import EducationEligibilityInfo

EDUCATION_HIERARCHY = {
    "below_10th": 0,
    "10th_standard": 1,
    "10th": 1,
    "vocational_iti": 2,
    "iti": 2,
    "12th_standard": 2,
    "12th": 2,
    "diploma": 3,
    "polytechnic": 3,
    "degree": 4,
    "bachelors": 4,
    "graduate": 4,
    "masters": 5,
}

def get_education_rank(edu_level: Optional[str]) -> int:
    """
    Parses education level or requirement string into a standardized hierarchy rank:
      0: below_10th
      1: 10th_standard / matriculation
      2: 12th_standard / ITI / vocational
      3: diploma / polytechnic
      4: bachelors / degree / graduation
      5: masters / postgraduate
    """
    if not edu_level:
        return 1

    clean = edu_level.strip().lower().replace("-", "_").replace(" ", "_")
    if clean in EDUCATION_HIERARCHY:
        return EDUCATION_HIERARCHY[clean]

    text = edu_level.lower()
    if "below" in text:
        return 0
    if "10th" in text or "matric" in text:
        return 1
    if "12th" in text or "intermediate" in text or "iti" in text or "vocational" in text:
        return 2
    if "diploma" in text or "polytechnic" in text:
        return 3
    if any(k in text for k in ["bachelor", "degree", "b.tech", "b.sc", "bca", "b.com", "bba", "b.ed", "graduate"]):
        return 4
    if any(k in text for k in ["master", "mca", "m.tech", "postgraduate"]):
        return 5
    return 1

def check_eligibility(
    student_education_level: str,
    student_stream: Optional[str],
    career: CareerCatalogItem
) -> Tuple[bool, EducationEligibilityInfo, float]:
    """
    Evaluates student educational eligibility against mandatory career rules.
    
    Returns:
        (is_eligible: bool, eligibility_info: EducationEligibilityInfo, education_score: float)
    """
    req_level = career.eligibility_requirements.min_education_level or career.required_education
    student_rank = get_education_rank(student_education_level)
    req_rank = get_education_rank(req_level)

    # 1. Mandatory Minimum Education Level Check
    if student_rank < req_rank:
        info = EducationEligibilityInfo(
            is_eligible=False,
            student_level=student_education_level,
            required_level=req_level,
            is_preferred_stream=False,
            notes=f"Requires at least {req_level.replace('_', ' ').title()}. Current level ({student_education_level.replace('_', ' ').title()}) is below requirement."
        )
        return False, info, 0.0

    # 2. Mandatory Stream Check (if restricted)
    allowed_streams = [s.lower() for s in career.eligibility_requirements.allowed_streams]
    stream_match = True
    if "any" not in allowed_streams:
        if student_stream:
            clean_stream = student_stream.lower()
            if not any(allowed in clean_stream for allowed in allowed_streams):
                # If stream is strictly mandated in mandatory rules, mark ineligible
                if any("stream" in rule.lower() for rule in career.eligibility_requirements.mandatory_rules):
                    info = EducationEligibilityInfo(
                        is_eligible=False,
                        student_level=student_education_level,
                        required_level=req_level,
                        is_preferred_stream=False,
                        notes=f"Mandatory stream required: {', '.join(allowed_streams).title()}. Student stream: {student_stream}."
                    )
                    return False, info, 25.0
                else:
                    stream_match = False
        else:
            stream_match = False

    # 3. Calculate Normalized Education Score (0 - 100)
    score = 80.0  # Base for meeting requirement
    
    if student_rank == req_rank:
        score = 95.0  # Ideal target fit
    elif student_rank == req_rank + 1:
        score = 100.0  # Strong foundational fit
    elif student_rank > req_rank + 1:
        score = 85.0  # Higher qualification than required

    if stream_match and "any" not in allowed_streams:
        score = min(100.0, score + 10.0)
    elif not stream_match:
        score = max(50.0, score - 15.0)

    notes = f"Eligible. Meets educational requirement of {req_level.replace('_', ' ').title()}."
    if career.eligibility_requirements.preferred_qualifications:
        notes += f" Preferred: {'; '.join(career.eligibility_requirements.preferred_qualifications[:2])}."

    info = EducationEligibilityInfo(
        is_eligible=True,
        student_level=student_education_level,
        required_level=req_level,
        is_preferred_stream=stream_match,
        notes=notes
    )

    return True, info, score
