"""GET /api/insight — CrewAI + NVIDIA NIM market summary."""

from fastapi import APIRouter, HTTPException

from models.insight import InsightResponse
from services.ai_agent import InsightError, generate_market_insight

router = APIRouter(prefix="/api", tags=["insight"])


@router.get("/insight", response_model=InsightResponse)
def get_insight() -> InsightResponse:
    """
    Generate a short market insight from recent Supabase prices (and news if present).

    Requires NVIDIA_NIM_API_KEY. First call can take 10–30s while NIM responds.
    """
    try:
        payload = generate_market_insight()
    except InsightError as exc:
        # 503 = not configured / dependency missing; 502 = upstream NIM failure
        message = str(exc)
        status = 503 if "Set NVIDIA_NIM_API_KEY" in message or "not installed" in message else 502
        raise HTTPException(status_code=status, detail=message) from exc

    return InsightResponse.model_validate(payload)
