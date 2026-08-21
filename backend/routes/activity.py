"""GET /api/activity — real scrape/heal events for the Logs page."""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from services.activity import fetch_activity
from services.supabase_client import ConfigError

router = APIRouter(prefix="/api", tags=["activity"])


class ActivityEvent(BaseModel):
    id: str | None = None
    event_type: str
    description: str
    collector_id: str | None = None
    occurred_at: str | None = None
    source: str | None = None


class ActivityResponse(BaseModel):
    count: int
    items: list[ActivityEvent] = Field(default_factory=list)


@router.get("/activity", response_model=ActivityResponse)
def list_activity(
    limit: int = Query(50, ge=1, le=200),
) -> ActivityResponse:
    try:
        rows = fetch_activity(limit=limit)
    except ConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    items = [ActivityEvent.model_validate(row) for row in rows]
    return ActivityResponse(count=len(items), items=items)
