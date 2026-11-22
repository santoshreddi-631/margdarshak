from fastapi import APIRouter
from app.core.config import settings
from app.services.recommendation_engine import recommendation_engine

router = APIRouter()

@router.get("/health", tags=["Health"])
def get_health():
    """Returns the operational status and configuration of the recommendation engine."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "loaded_careers_count": len(recommendation_engine.careers),
        "weights": {
            "interest": settings.WEIGHT_INTEREST,
            "skill": settings.WEIGHT_SKILL,
            "education": settings.WEIGHT_EDUCATION,
            "preference": settings.WEIGHT_PREFERENCE,
        }
    }
