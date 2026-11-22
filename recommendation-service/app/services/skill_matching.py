from typing import List, Tuple
from app.schemas.student import StudentSkill
from app.schemas.career import CareerCatalogItem

PROFICIENCY_WEIGHTS = {
    "beginner": 0.60,
    "intermediate": 0.85,
    "advanced": 1.00,
}

def clean_text(text: str) -> str:
    return text.lower().replace("-", " ").replace("_", " ").strip()

def skill_names_match(student_skill_name: str, target_skill_name: str) -> bool:
    s = clean_text(student_skill_name)
    t = clean_text(target_skill_name)
    
    if s == t or s in t or t in s:
        return True

    # Token overlap check (e.g. "Python Programming" and "Python")
    s_tokens = set(s.split())
    t_tokens = set(t.split())
    common = s_tokens.intersection(t_tokens)
    
    # Ignore generic filler words
    common.discard("and")
    common.discard("basic")
    common.discard("fundamentals")
    common.discard("tools")
    
    return len(common) > 0

def calculate_skill_match(
    student_skills: List[StudentSkill],
    career: CareerCatalogItem
) -> Tuple[float, List[str], List[str]]:
    """
    Computes weighted skill match score between student declared skills and career requirements.
    Required skills carry double weight compared to recommended skills.
    
    Returns:
        (score: float between 0.0 and 100.0, matching_skills: List[str], missing_skills: List[str])
    """
    required_skills = career.required_skills
    recommended_skills = career.recommended_skills

    if not required_skills and not recommended_skills:
        return 75.0, [], []

    total_max_points = 0.0
    accumulated_points = 0.0

    matching_skills: List[str] = []
    missing_skills: List[str] = []

    # Map student skills for quick lookup
    student_skill_map = {}
    for sk in student_skills:
        student_skill_map[clean_text(sk.name)] = sk

    # 1. Evaluate Required Skills (Weight multiplier: 2.0)
    for req in required_skills:
        weight = req.weight * 2.0
        total_max_points += weight
        
        found = False
        for sk_clean, sk in student_skill_map.items():
            if skill_names_match(sk_clean, req.name):
                found = True
                prof_mult = PROFICIENCY_WEIGHTS.get(sk.proficiency_level.lower(), 0.60)
                accumulated_points += weight * prof_mult
                matching_skills.append(f"{req.name} ({sk.proficiency_level.title()})")
                break
        
        if not found:
            missing_skills.append(req.name)

    # 2. Evaluate Recommended Skills (Weight multiplier: 1.0)
    for rec in recommended_skills:
        weight = rec.weight * 1.0
        total_max_points += weight
        
        found = False
        for sk_clean, sk in student_skill_map.items():
            if skill_names_match(sk_clean, rec.name):
                found = True
                prof_mult = PROFICIENCY_WEIGHTS.get(sk.proficiency_level.lower(), 0.60)
                accumulated_points += weight * prof_mult
                matching_skills.append(f"{rec.name} ({sk.proficiency_level.title()})")
                break
        
        if not found:
            # We only add to missing_skills if required or critical
            pass

    if total_max_points == 0.0:
        return 75.0, matching_skills, missing_skills

    raw_ratio = accumulated_points / total_max_points
    
    # Scale score: Even with zero declared skills, training is designed to build skills
    # Raw ratio 1.0 -> 100%, 0.5 -> 75%, 0.0 -> 35%
    if len(student_skills) == 0:
        final_score = 40.0  # Baseline when student has not populated skills
    else:
        final_score = 35.0 + (raw_ratio * 65.0)

    final_score = min(100.0, max(0.0, final_score))
    return round(final_score, 2), matching_skills, missing_skills
