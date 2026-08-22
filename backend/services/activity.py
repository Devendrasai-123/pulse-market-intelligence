"""Real activity events for the Logs page — never invents scrape/heal rows."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from config import NEWS_COLLECTOR_ID, PRICE_COLLECTOR_ID
from services.supabase_client import ConfigError, get_supabase

logger = logging.getLogger(__name__)


def log_activity(
    event_type: str,
    description: str,
    *,
    collector_id: str | None = None,
) -> None:
    """Insert one activity_events row. Missing table must not break heal or ingest."""
    try:
        get_supabase().table("activity_events").insert(
            {
                "event_type": event_type,
                "description": description,
                "collector_id": collector_id,
            }
        ).execute()
    except Exception as exc:
        logger.warning("activity_events insert skipped: %s", exc)


def _iso(value: Any) -> str:
    """Normalize a timestamp to ISO-8601 for the Logs UI."""
    if value is None:
        return datetime.now(timezone.utc).isoformat()
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def _event_from_latest_ingest(
    client: Any,
    *,
    table: str,
    event_id: str,
    collector_id: str,
    description: str,
) -> dict[str, Any] | None:
    """Build one log row from the newest ingested_at in a scrape table."""
    latest = (
        client.table(table)
        .select("id,ingested_at")
        .order("ingested_at", desc=True)
        .limit(1)
        .execute()
    )
    rows = latest.data or []
    if not rows:
        return None
    count_res = client.table(table).select("id", count="exact").limit(1).execute()
    count = count_res.count if count_res.count is not None else 0
    return {
        "id": event_id,
        "event_type": "scrape_run",
        "description": description.format(count=count),
        "collector_id": collector_id,
        "occurred_at": _iso(rows[0].get("ingested_at")),
        "source": table,
    }


def _event_from_heal_job() -> dict[str, Any] | None:
    """Mirror the in-memory self-heal job so Logs stay in sync without a DB write."""
    from services.self_heal import get_job

    job = get_job()
    if not job:
        return None
    status = job.status
    if status == "healing":
        event_type = "heal_triggered"
    elif status == "repaired":
        event_type = "repaired"
    elif status in ("failed", "error"):
        event_type = "failed"
    else:
        event_type = "scrape_run"
    stamp = job.finished_at or job.started_at
    occurred = datetime.fromtimestamp(stamp, tz=timezone.utc).isoformat() if stamp else _iso(None)
    return {
        "id": job.job_id,
        "event_type": event_type,
        "description": job.message or f"Self-heal job {status}",
        "collector_id": job.collector_id,
        "occurred_at": occurred,
        "source": "memory",
    }


def fetch_activity(limit: int = 50) -> list[dict[str, Any]]:
    """
    Merge stored activity_events with live table timestamps.

    Price/news ingest times are real; heal rows come from activity_events
    and/or the in-memory latest job (no mock timeline).
    """
    events: list[dict[str, Any]] = []
    client = get_supabase()

    try:
        stored = (
            client.table("activity_events")
            .select("*")
            .order("occurred_at", desc=True)
            .limit(limit)
            .execute()
        )
        for row in stored.data or []:
            events.append(
                {
                    "id": row.get("id"),
                    "event_type": row.get("event_type") or "scrape_run",
                    "description": row.get("description") or "",
                    "collector_id": row.get("collector_id"),
                    "occurred_at": _iso(row.get("occurred_at")),
                    "source": "activity_events",
                }
            )
    except Exception as exc:
        logger.info("activity_events table unread (%s) — using ingest timestamps only", exc)

    try:
        price_event = _event_from_latest_ingest(
            client,
            table="market_data",
            event_id="ingest-prices",
            collector_id=PRICE_COLLECTOR_ID,
            description="Price scrape ingested — {count} market_data rows in Supabase",
        )
        if price_event:
            events.append(price_event)
    except Exception as exc:
        logger.warning("Could not read market_data for activity: %s", exc)

    try:
        news_event = _event_from_latest_ingest(
            client,
            table="news",
            event_id="ingest-news",
            collector_id=NEWS_COLLECTOR_ID,
            description="News scrape ingested — {count} CoinDesk articles",
        )
        if news_event:
            events.append(news_event)
    except Exception as exc:
        logger.warning("Could not read news for activity: %s", exc)

    try:
        heal_event = _event_from_heal_job()
        if heal_event:
            events.append(heal_event)
    except Exception as exc:
        logger.debug("No in-memory heal job: %s", exc)

    events.sort(key=lambda event: event.get("occurred_at") or "", reverse=True)
    return events[:limit]
