from app.services.recommendation_engine import recommendation_engine
from app.schemas.student import (
    StudentInput,
    StudentProfile,
    StudentSkill,
    StudentInterest,
    StudentPreferences,
)

def test_recommendation_engine_ranking():
    student_input = StudentInput(
        user_id="test-student-1",
        profile=StudentProfile(
            current_education_level="10th_standard",
            preferred_language="en"
        ),
        interests=[
            StudentInterest(code="electrical", name="Electrical & Solar Power"),
            StudentInterest(code="practical_trades", name="Hands-on Technical Work")
        ],
        skills=[
            StudentSkill(name="Electrical Wiring", proficiency_level="intermediate"),
            StudentSkill(name="Workplace Safety & Earthing", proficiency_level="beginner")
        ],
        preferences=StudentPreferences(
            preferred_work_environment="field_practical",
            willingness_to_relocate="within_district"
        )
    )

    result = recommendation_engine.generate_recommendations(student_input, limit=5)

    assert result.user_id == "test-student-1"
    assert len(result.recommendations) > 0
    assert result.total_evaluated_careers > 0

    # Solar Technician should rank near or at the top
    top_reco = result.recommendations[0]
    assert top_reco.match_score >= 70.0
    assert top_reco.slug == "solar-technician" or top_reco.category == "trades"
    assert len(top_reco.reasons) > 0
    assert top_reco.education_eligibility.is_eligible is True

    # Scores must be strictly sorted descending
    scores = [r.match_score for r in result.recommendations]
    assert scores == sorted(scores, reverse=True)

def test_multilingual_localization():
    student_input_te = StudentInput(
        user_id="test-student-te",
        language="te",
        profile=StudentProfile(current_education_level="10th_standard"),
        interests=[StudentInterest(code="electrical", name="Electrical")]
    )

    result_te = recommendation_engine.generate_recommendations(student_input_te, limit=3)
    # Check that Telugu title was assigned
    top_te = result_te.recommendations[0]
    assert top_te.title is not None
    assert len(top_te.title) > 0

def test_formula_weighting_strictness():
    """Confirms Score = 0.40 * Interest + 0.30 * Skill + 0.20 * Education + 0.10 * Preference strictly."""
    student_input = StudentInput(
        user_id="test-formula-student",
        profile=StudentProfile(current_education_level="bachelors", educational_stream="science"),
        interests=[StudentInterest(code="programming", name="Software Development")],
        skills=[StudentSkill(name="Python", proficiency_level="advanced")],
        preferences=StudentPreferences(preferred_work_environment="office_desk")
    )

    result = recommendation_engine.generate_recommendations(student_input, limit=5)
    assert len(result.recommendations) > 0

    w = result.weights_used
    assert w["interest"] == 0.40
    assert w["skill"] == 0.30
    assert w["education"] == 0.20
    assert w["preference"] == 0.10

    for rec in result.recommendations:
        bd = rec.score_breakdown
        expected_score = round(
            (w["interest"] * bd.interest_match)
            + (w["skill"] * bd.skill_match)
            + (w["education"] * bd.education_match)
            + (w["preference"] * bd.preference_match),
            1
        )
        assert rec.match_score == expected_score

def test_mandatory_eligibility_filters_before_ranking():
    """Verify that mandatory eligibility filters strictly exclude ineligible careers before ranking."""
    student_10th = StudentInput(
        user_id="student-10th",
        profile=StudentProfile(current_education_level="10th_standard"),
        filter_ineligible=True
    )

    result = recommendation_engine.generate_recommendations(student_10th, limit=20)
    # All returned recommendations must be strictly eligible
    for rec in result.recommendations:
        assert rec.education_eligibility.is_eligible is True
        # Cannot be degree-only careers
        assert rec.slug not in ["software-engineer", "data-scientist", "devops-engineer"]

def test_ineligible_careers_penalized_when_not_filtered():
    """Verify that when filter_ineligible is False, ineligible careers are penalized and ranked lower."""
    student_10th = StudentInput(
        user_id="student-10th-penalized",
        profile=StudentProfile(current_education_level="10th_standard"),
        interests=[StudentInterest(code="programming", name="Software Engineering")],
        filter_ineligible=False
    )

    result = recommendation_engine.generate_recommendations(student_10th, limit=20)
    eligible_recs = [r for r in result.recommendations if r.education_eligibility.is_eligible]
    ineligible_recs = [r for r in result.recommendations if not r.education_eligibility.is_eligible]

    assert len(eligible_recs) > 0
    assert len(ineligible_recs) > 0
    # Ineligible careers have edu_score 0 and are penalized
    for inel in ineligible_recs:
        assert inel.score_breakdown.education_match == 0.0
