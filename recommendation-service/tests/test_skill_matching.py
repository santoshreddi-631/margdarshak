import pytest
from app.services.skill_matching import calculate_skill_match
from app.schemas.student import StudentSkill
from app.schemas.career import CareerCatalogItem, EligibilityRequirements, CareerSkillRequirement

@pytest.fixture
def career():
    return CareerCatalogItem(
        id="c-sk-1",
        slug="solar-tech",
        name="Solar Technician",
        category="trades",
        growth_demand="high",
        estimated_salary_range="₹20,000",
        training_duration="3 Months",
        required_education="10th_standard",
        eligibility_requirements=EligibilityRequirements(
            min_education_level="10th_standard"
        ),
        required_skills=[
            CareerSkillRequirement(name="Electrical Wiring", importance="required", weight=1.0),
            CareerSkillRequirement(name="Solar Installation", importance="required", weight=1.0)
        ],
        recommended_skills=[
            CareerSkillRequirement(name="Multimeter Tools", importance="recommended", weight=0.5)
        ]
    )

def test_skill_match_perfect_advanced(career):
    skills = [
        StudentSkill(name="Electrical Wiring", proficiency_level="advanced"),
        StudentSkill(name="Solar Installation", proficiency_level="advanced"),
        StudentSkill(name="Multimeter Tools", proficiency_level="advanced"),
    ]
    score, matched, missing = calculate_skill_match(skills, career)
    assert score >= 95.0
    assert len(matched) == 3
    assert len(missing) == 0

def test_skill_match_beginner_vs_advanced(career):
    skills_adv = [StudentSkill(name="Electrical Wiring", proficiency_level="advanced")]
    skills_beg = [StudentSkill(name="Electrical Wiring", proficiency_level="beginner")]

    score_adv, _, _ = calculate_skill_match(skills_adv, career)
    score_beg, _, _ = calculate_skill_match(skills_beg, career)

    assert score_adv > score_beg

def test_skill_match_empty_skills(career):
    score, matched, missing = calculate_skill_match([], career)
    assert score == 40.0  # Foundational baseline
    assert len(matched) == 0
    assert "Electrical Wiring" in missing
    assert "Solar Installation" in missing
