import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Margdarshak Career Recommendation Service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")
    
    # Internal API Secret for backend-to-service communication
    INTERNAL_API_KEY: str = os.getenv("INTERNAL_API_KEY", "")
    
    # Configurable Recommendation Weights
    WEIGHT_INTEREST: float = float(os.getenv("WEIGHT_INTEREST", "0.40"))
    WEIGHT_SKILL: float = float(os.getenv("WEIGHT_SKILL", "0.30"))
    WEIGHT_EDUCATION: float = float(os.getenv("WEIGHT_EDUCATION", "0.20"))
    WEIGHT_PREFERENCE: float = float(os.getenv("WEIGHT_PREFERENCE", "0.10"))
    
    # Path to structured career catalog
    CAREER_CATALOG_PATH: str = os.getenv(
        "CAREER_CATALOG_PATH", 
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "careers.json")
    )

settings = Settings()
