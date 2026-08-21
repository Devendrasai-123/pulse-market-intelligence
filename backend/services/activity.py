"""Real activity events for the Logs page — never invents scrape/heal rows."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from services.supabase_client import ConfigError, get_supabase


def log_activity(
    event_type: str,
    description: str,
    *,
    collector_id: str | None = None,
) -> None:
    """Best-effort insert. Missing table must not break heal/ingest."""
    try:
        get_supabase().table("activity_events").insert(
            {
                "event_type": event_type,
                "description": description,
                "collector_id": collector_id,
            }
        ).execute()
    except Exception:
        return


def _iso(value: Any) -> str:
    if value is None:
        return datetime.now(timezone.utc).isoformat()
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def fetch_activity(limit: int = 50) -> list[dict[str, Any]]:
    """
    Merge stored activity_events with live table timestamps.

    Price/news ingest times are real; heal rows come from activity_events
    and/or the in-memory latest job (no mock timeline).
    """
    events: list[dict[str, Any]] = []

    try:
        client = get_supabase()
    except ConfigError:
        raise

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
    except Exception:
        pass

    try:
        prices = (
            client.table("market_data")
            .select("id,ingested_at")
            .order("ingested_at", desc=True)
            .limit(1)
            .execute()
        )
        count_res = (
            client.table("market_data")
            .select("id", count="exact")
            .limit(1)
            .execute()
        )
        rows = prices.data or []
        if rows:
            n = count_res.count if count_res.count is not None else 0
            events.append(
                {
                    "id": "ingest-prices",
                    "event_type": "scrape_run",
                    "description": (
                        f"Price scrape ingested — {n} market_data rows in Supabase"
                    ),
                    "collector_id": "c_mswww62b2iig1j1hcj",
                    "occurred_at": _iso(rows[0].get("ingested_at")),
                    "source": "market_data",
                }
            )
    except Exception:
        pass

    try:
        news = (
            client.table("news")
            .select("id,ingested_at")
            .order("ingested_at", desc=True)
            .limit(1)
            .execute()
        )
        count_res = (
            client.table("news").select("id", count="exact").limit(1).execute()
        )
        rows = news.data or []
        if rows:
            n = count_res.count if count_res.count is not None else 0
            events.append(
                {
                    "id": "ingest-news",
                    "event_type": "scrape_run",
                    "description": f"News scrape ingested — {n} CoinDesk articles",
                    "collector_id": "c_msx6tyya20kx5jxsy1",
                    "occurred_at": _iso(rows[0].get("ingested_at")),
                    "source": "news",
                }
            )
    except Exception:
        pass

    try:
        from services.self_heal import get_job

        job = get_job()
        if job:
            status = job.status
            if status == "healing":
                etype = "heal_triggered"
            elif status == "repaired":
                etype = "repaired"
            elif status in ("failed", "error"):
                etype = "failed"
            else:
                etype = "scrape_run"
            ts = job.finished_at or job.started_at
            occurred = datetime.fromtimestamp(ts, tz=timezone.utc).isoformat() if ts else _iso(None)
            events.append(
                {
                    "id": job.job_id,
                    "event_type": etype,
                    "description": job.message or f"Self-heal job {status}",
                    "collector_id": job.collector_id,
                    "occurred_at": occurred,
                    "source": "memory",
                }
            )
    except Exception:
        pass

    events.sort(key=lambda e: e.get("occurred_at") or "", reverse=True)
    return events[:limit]
