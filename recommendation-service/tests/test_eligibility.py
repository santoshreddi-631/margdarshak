import pytest
from app.services.eligibility import check_eligibility, EDUCATION_HIERARCHY
from app.schemas.career import CareerCatalogItem, EligibilityRequirements, CareerSkillRequirement

@pytest.fixture
def sample_career():
    return CareerCatalogItem(
        id="c-test-1",
        slug="solar-technician",
        name="Solar PV Technician",
        category="trades",
        growth_demand="high",
        estimated_salary_range="₹18,000 - ₹32,000",
        training_duration="3 Months",
        required_education="10th_standard",
        eligibility_requirements=EligibilityRequirements(
            min_education_level="10th_standard",
            allowed_streams=["any"],
            mandatory_rules=["Completed 10th Standard"],
            preferred_qualifications=["ITI Electrician"]
        ),
        required_skills=[
            CareerSkillRequirement(name="Electrical Wiring", importance="required", weight=1.0)
        ]
    )

@pytest.fixture
def stream_restricted_career():
    return CareerCatalogItem(
        id="c-test-2",
        slug="medical-lab-technician",
        name="Medical Laboratory Technician",
        category="healthcare",
        growth_demand="high",
        estimated_salary_range="₹16,000 - ₹30,000",
        training_duration="1 Year",
        required_education="12th_standard",
        eligibility_requirements=EligibilityRequirements(
            min_education_level="12th_standard",
            allowed_streams=["science", "vocational"],
            mandatory_rules=["Must have passed 12th in science stream"],
            preferred_qualifications=["Biology focus"]
        ),
        required_skills=[
            CareerSkillRequirement(name="Specimen Handling", importance="required", weight=1.0)
        ]
    )

def test_eligible_exact_education_match(sample_career):
    is_eligible, info, score = check_eligibility("10th_standard", "any", sample_career)
    assert is_eligible is True
    assert score >= 90.0
    assert "Eligible" in info.notes

def test_eligible_higher_education(sample_career):
    is_eligible, info, score = check_eligibility("12th_standard", "science", sample_career)
    assert is_eligible is True
    assert score >= 85.0

def test_ineligible_below_education(sample_career):
    is_eligible, info, score = check_eligibility("below_10th", None, sample_career)
    assert is_eligible is False
    assert score == 0.0
    assert "below requirement" in info.notes

def test_stream_restricted_career_science_eligible(stream_restricted_career):
    is_eligible, info, score = check_eligibility("12th_standard", "science (MPC)", stream_restricted_career)
    assert is_eligible is True
    assert info.is_preferred_stream is True

def test_stream_restricted_career_arts_ineligible(stream_restricted_career):
    is_eligible, info, score = check_eligibility("12th_standard", "arts", stream_restricted_career)
    assert is_eligible is False
    assert "Mandatory stream required" in info.notes

def test_degree_career_rejects_10th_standard():
    degree_career = CareerCatalogItem(
        id="c-degree-test",
        slug="software-engineer-test",
        name="Software Engineer",
        category="engineering",
        growth_demand="high",
        estimated_salary_range="₹40,000",
        training_duration="4 Years",
        required_education="degree",
        eligibility_requirements=EligibilityRequirements(
            min_education_level="Bachelor Degree in Computer Science or IT",
            allowed_streams=["any"],
            mandatory_rules=["Bachelor degree required"]
        ),
        required_skills=[CareerSkillRequirement(name="Coding", importance="required", weight=1.0)]
    )

    is_eligible, info, score = check_eligibility("10th_standard", None, degree_career)
    assert is_eligible is False
    assert score == 0.0
    assert "below requirement" in info.notes

def test_diploma_eligible_for_polytechnic_career():
    diploma_career = CareerCatalogItem(
        id="c-diploma-test",
        slug="backend-developer-test",
        name="Backend Developer",
        category="engineering",
        growth_demand="high",
        estimated_salary_range="₹30,000",
        training_duration="6 Months",
        required_education="degree",
        eligibility_requirements=EligibilityRequirements(
            min_education_level="Polytechnic Diploma / B.Sc / BCA / B.Tech",
            allowed_streams=["any"],
            mandatory_rules=[]
        ),
        required_skills=[CareerSkillRequirement(name="Node.js", importance="required", weight=1.0)]
    )

    is_eligible, info, score = check_eligibility("diploma", None, diploma_career)
    assert is_eligible is True
    assert score >= 90.0
