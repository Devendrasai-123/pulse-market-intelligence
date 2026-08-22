"""GET /api/activity — real scrape/heal events for the Logs page."""

from fastapi import APIRouter, HTTPException, Query

from models.activity import ActivityEvent, ActivityResponse
from services.activity import fetch_activity
from services.supabase_client import ConfigError

router = APIRouter(prefix="/api", tags=["activity"])


@router.get("/activity", response_model=ActivityResponse)
def list_activity(
    limit: int = Query(50, ge=1, le=200, description="Max events to return"),
) -> ActivityResponse:
    """Return merged ingest timestamps, optional activity_events rows, and the latest heal job."""
    try:
        rows = fetch_activity(limit=limit)
    except ConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Activity query failed: {exc}",
        ) from exc
    items = [ActivityEvent.model_validate(row) for row in rows]
    return ActivityResponse(count=len(items), items=items)
