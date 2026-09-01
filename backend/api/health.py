from fastapi import APIRouter

from backend.services.ai_service import ai_service

router = APIRouter(tags=["health"])


@router.get("/api/health")
def health_check():
    return {"status": "ok", "service": "ContractIQ API"}


@router.get("/api/health/ai")
def ai_health_check():
    return ai_service.health_check()
