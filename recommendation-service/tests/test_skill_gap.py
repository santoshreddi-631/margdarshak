import pytest
from app.services.skill_gap import analyze_skill_gap
from app.schemas.student import StudentSkill
from app.schemas.career import CareerCatalogItem, EligibilityRequirements, CareerSkillRequirement

@pytest.fixture
def career():
    return CareerCatalogItem(
        id="c-gap-1",
        slug="web-dev",
        name="Junior Web Developer",
        category="technical",
        growth_demand="high",
        estimated_salary_range="₹25,000",
        training_duration="6 Months",
        required_education="12th_standard",
        eligibility_requirements=EligibilityRequirements(min_education_level="12th_standard"),
        required_skills=[
            CareerSkillRequirement(name="HTML & CSS", importance="required", weight=1.0),
            CareerSkillRequirement(name="JavaScript Fundamentals", importance="required", weight=1.0)
        ],
        recommended_skills=[
            CareerSkillRequirement(name="React Basics", importance="recommended", weight=0.5)
        ]
    )

def test_skill_gap_classification(career):
    student_skills = [
        StudentSkill(name="HTML & CSS", proficiency_level="intermediate"),
        StudentSkill(name="JavaScript Fundamentals", proficiency_level="beginner")
        # Missing React Basics
    ]

    analysis = analyze_skill_gap(student_skills, career)

    # HTML & CSS should be acquired
    assert any(s.name == "HTML & CSS" and s.status == "acquired" for s in analysis.existing_skills)
    
    # JavaScript should need improvement (beginner)
    assert any(s.name == "JavaScript Fundamentals" and s.status == "needs_improvement" for s in analysis.skills_to_improve)
    
    # React Basics should be missing
    assert any(s.name == "React Basics" and s.status == "missing" for s in analysis.missing_skills)

    # Readiness should be between 30% and 80%
    assert 30.0 <= analysis.readiness_percentage <= 80.0
    assert len(analysis.recommendations) > 0

def test_skill_gap_all_acquired(career):
    student_skills = [
        StudentSkill(name="HTML & CSS", proficiency_level="advanced"),
        StudentSkill(name="JavaScript Fundamentals", proficiency_level="intermediate"),
        StudentSkill(name="React Basics", proficiency_level="intermediate")
    ]

    analysis = analyze_skill_gap(student_skills, career)
    assert analysis.readiness_percentage == 100.0
    assert len(analysis.existing_skills) == 3
    assert len(analysis.missing_skills) == 0
    assert len(analysis.skills_to_improve) == 0

def test_skill_gap_none_acquired(career):
    analysis = analyze_skill_gap([], career)
    assert analysis.readiness_percentage == 0.0
    assert len(analysis.existing_skills) == 0
    assert len(analysis.missing_skills) == 3
    # Check that critical advice is given for required skills
    critical_items = [s for s in analysis.missing_skills if s.priority == "critical"]
    assert len(critical_items) == 2
    for item in critical_items:
        assert "Mandatory requirement" in item.actionable_advice
