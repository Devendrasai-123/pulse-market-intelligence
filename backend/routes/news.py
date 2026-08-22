"""GET /api/news — read news rows from Supabase."""

from fastapi import APIRouter, HTTPException, Query

from models.insight import NewsItem, NewsResponse
from services.data_access import fetch_recent_news
from services.supabase_client import ConfigError

router = APIRouter(prefix="/api", tags=["news"])


@router.get("/news", response_model=NewsResponse)
def list_news(
    limit: int = Query(20, ge=1, le=200, description="Max news rows to return"),
) -> NewsResponse:
    """Return recent news. Empty list if the news table is not loaded yet."""
    try:
        rows = fetch_recent_news(limit=limit)
    except ConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"News query failed: {exc}") from exc

    items = [NewsItem.model_validate(row) for row in rows]
    return NewsResponse(count=len(items), items=items)
