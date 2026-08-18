"""Shared Supabase reads used by API routes and the CrewAI insight agent."""

from __future__ import annotations

from typing import Any

from services.supabase_client import ConfigError, get_supabase


def fetch_recent_prices(limit: int = 80) -> list[dict[str, Any]]:
    """Same source as GET /api/prices — highest-volume exchange rows first."""
    client = get_supabase()
    result = (
        client.table("market_data")
        .select("*")
        .order("volume_24h", desc=True)
        .limit(limit)
        .execute()
    )
    return list(result.data or [])


def fetch_recent_news(limit: int = 20) -> list[dict[str, Any]]:
    """
    Same source as GET /api/news.

    Returns [] if the news table is missing or empty (news scraper may land later).
    """
    try:
        client = get_supabase()
        result = (
            client.table("news")
            .select("*")
            .order("ingested_at", desc=True)
            .limit(limit)
            .execute()
        )
        return list(result.data or [])
    except ConfigError:
        raise
    except Exception:
        return []
