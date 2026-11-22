from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, recommendations, skill_gap

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Internal Python Recommendation Service for Margdarshak Career Guidance System",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Middleware (Internal REST communication with Node.js backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root service endpoint
@app.get("/", tags=["Root"])
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }

# Mount API v1 Routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(skill_gap.router, prefix=settings.API_V1_STR)

# Direct root-level health alias for convenience (e.g. /health -> /api/v1/health)
@app.get("/health", tags=["Health"], include_in_schema=False)
def root_health():
    return health.get_health()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )
