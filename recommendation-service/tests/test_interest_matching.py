from app.services.interest_matching import calculate_interest_match
from app.schemas.student import StudentInterest

def test_interest_high_overlap():
    student_interests = [
        StudentInterest(code="electrical", name="Electrical & Energy"),
        StudentInterest(code="trades", name="Practical Trades & Field Work")
    ]
    career_interests = ["electrical", "renewable_energy", "field_work"]
    
    score, matched = calculate_interest_match(student_interests, career_interests)
    assert score >= 80.0
    assert len(matched) >= 2

def test_interest_no_overlap():
    student_interests = [
        StudentInterest(code="design", name="Fashion Design & Arts")
    ]
    career_interests = ["electrical", "renewable_energy"]
    
    score, matched = calculate_interest_match(student_interests, career_interests)
    assert score <= 35.0
    assert len(matched) == 0

def test_empty_student_interests_returns_neutral():
    score, matched = calculate_interest_match([], ["electrical", "renewable_energy"])
    assert score == 50.0
    assert matched == []
