from fastapi import APIRouter, HTTPException
from app.schemas.skill_gap import SkillGapRequest, SkillGapResponse
from app.services.skill_gap import analyze_skill_gap
from app.services.recommendation_engine import recommendation_engine

router = APIRouter()

@router.post("/skill-gap", response_model=SkillGapResponse, tags=["Skill Gap"])
def get_skill_gap_analysis(payload: SkillGapRequest):
    """
    Performs skill gap analysis for a student targeting a specific career pathway.
    Identifies existing, missing, and to-improve skills with actionable learning advice.
    """
    target_career = None

    if payload.career_id:
        for c in recommendation_engine.careers:
            if c.id == payload.career_id:
                target_career = c
                break

    if not target_career and payload.career_slug:
        for c in recommendation_engine.careers:
            if c.slug == payload.career_slug:
                target_career = c
                break

    if not target_career:
        raise HTTPException(
            status_code=404,
            detail=f"Target career not found for ID: '{payload.career_id}' or Slug: '{payload.career_slug}'"
        )

    try:
        analysis = analyze_skill_gap(
            student_skills=payload.student_skills,
            career=target_career,
            language=payload.language
        )
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error performing skill gap analysis: {str(e)}"
        )
