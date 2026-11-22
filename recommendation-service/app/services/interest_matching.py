from typing import List, Tuple
from app.schemas.student import StudentInterest

def normalize_token(text: str) -> str:
    return text.lower().replace("_", " ").replace("-", " ").strip()

def calculate_interest_match(
    student_interests: List[StudentInterest],
    career_interests: List[str]
) -> Tuple[float, List[str]]:
    """
    Computes interest alignment score between student declared interests and career requirements.
    
    Returns:
        (score: float between 0.0 and 100.0, matching_interests: List[str])
    """
    if not career_interests:
        return 70.0, []

    if not student_interests:
        # Neutral fallback when student has not yet completed interest module
        return 50.0, []

    student_tokens = set()
    for si in student_interests:
        if si.name:
            for part in normalize_token(si.name).split():
                if len(part) > 2:
                    student_tokens.add(part)
        if si.code:
            student_tokens.add(normalize_token(si.code))

    matched_interests = []
    
    for ci in career_interests:
        clean_ci = normalize_token(ci)
        ci_parts = clean_ci.split()
        
        # Check direct substring or token intersection
        if clean_ci in student_tokens or any(part in student_tokens for part in ci_parts):
            matched_interests.append(ci.replace("_", " ").title())

    overlap_count = len(matched_interests)
    total_career_interests = len(career_interests)

    if overlap_count == 0:
        # Check broader category relevance
        return 30.0, []

    # Proportional score with progressive curve
    ratio = overlap_count / total_career_interests
    if ratio >= 0.7:
        score = 95.0 + (ratio - 0.7) * 16.6
    elif ratio >= 0.4:
        score = 80.0 + (ratio - 0.4) * 50.0
    else:
        score = 60.0 + ratio * 50.0

    score = min(100.0, max(0.0, score))
    return round(score, 2), matched_interests
