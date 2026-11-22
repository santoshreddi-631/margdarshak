from fastapi import APIRouter, Query, HTTPException, Header
from typing import Optional
from app.schemas.student import StudentInput
from app.schemas.recommendation import RecommendationResponse
from app.services.recommendation_engine import recommendation_engine
from app.core.config import settings

router = APIRouter()

def verify_internal_auth(x_internal_api_key: Optional[str] = Header(None)):
    """Verifies internal API key if configured; transparent in development mode."""
    if settings.INTERNAL_API_KEY and settings.ENVIRONMENT == "production":
        if x_internal_api_key != settings.INTERNAL_API_KEY:
            raise HTTPException(status_code=401, detail="Unauthorized internal service call")
    return True

@router.post("/recommendations", response_model=RecommendationResponse, tags=["Recommendations"])
@router.post("/recommend", response_model=RecommendationResponse, tags=["Recommendations"])
def get_career_recommendations(
    payload: StudentInput,
    limit: int = Query(default=5, ge=1, le=20),
    filter_ineligible: Optional[bool] = Query(default=None),
    _auth: bool = Query(default=True)
):
    """
    Computes personalized career recommendations based on student's education,
    declared skills, interests, and preferences.
    """
    try:
        if filter_ineligible is not None:
            payload.filter_ineligible = filter_ineligible

        recommendations = recommendation_engine.generate_recommendations(
            student_input=payload,
            limit=limit
        )
        return recommendations
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating career recommendations: {str(e)}"
        )
