"""Flatten Bright Data scrape JSON into Supabase rows (market_data + news)."""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from services.supabase_client import get_supabase

# Matches "0.01%", "-1.2%", "+3%", or bare "-"
_PCT_RE = re.compile(r"^\s*([+-]?\d+(?:\.\d+)?)\s*%?\s*$")


def parse_percent_change(raw: Any) -> float | None:
    """Turn scrape strings like '0.01%' or '-' into a float or None."""
    if raw is None:
        return None
    text = str(raw).strip()
    if not text or text == "-":
        return None
    match = _PCT_RE.match(text)
    if not match:
        return None
    return float(match.group(1))


def flatten_scraped_coins(coins: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Expand each coin's markets[] into one DB row per exchange listing.

    Skips coins with empty/missing markets.
    """
    rows: list[dict[str, Any]] = []
    for coin in coins:
        markets = coin.get("markets") or []
        product_page_url = coin.get("product_page_url")
        input_block = coin.get("input") or {}
        source_input_url = input_block.get("url")

        for market in markets:
            price = market.get("current_price") or {}
            volume = market.get("volume_24h") or {}
            raw_change = market.get("price_change_24h")

            exchange = market.get("exchange_name")
            ticker = market.get("ticker_symbol")
            if not exchange or not ticker:
                continue

            rows.append(
                {
                    "exchange_name": exchange,
                    "ticker_symbol": ticker,
                    "price": price.get("value"),
                    "price_currency": price.get("currency"),
                    "price_symbol": price.get("symbol"),
                    "price_change_24h_raw": (
                        None if raw_change is None else str(raw_change)
                    ),
                    "price_change_24h": parse_percent_change(raw_change),
                    "volume_24h": volume.get("value"),
                    "volume_currency": volume.get("currency"),
                    "volume_symbol": volume.get("symbol"),
                    "product_page_url": product_page_url,
                    "source_input_url": source_input_url,
                }
            )
    return rows


def load_json_file(path: Path) -> list[dict[str, Any]]:
    with path.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, list):
        raise ValueError(f"Expected a JSON array of coins, got {type(data).__name__}")
    return data


def ingest_file(
    path: Path,
    *,
    replace: bool = False,
    batch_size: int = 200,
) -> dict[str, int]:
    """
    Load sample/live scrape JSON into public.market_data.

    replace=True deletes existing rows first (simple full reload for demos).
    """
    coins = load_json_file(path)
    rows = flatten_scraped_coins(coins)
    client = get_supabase()

    deleted = 0
    if replace:
        # Delete all rows: filter that matches everything with a known column.
        result = client.table("market_data").delete().neq("ticker_symbol", "").execute()
        deleted = len(result.data or [])

    inserted = 0
    for start in range(0, len(rows), batch_size):
        chunk = rows[start : start + batch_size]
        client.table("market_data").insert(chunk).execute()
        inserted += len(chunk)

    return {
        "coins": len(coins),
        "rows_prepared": len(rows),
        "rows_inserted": inserted,
        "rows_deleted": deleted,
    }


def is_valid_news_item(item: dict[str, Any]) -> bool:
    """Skip Bright Data rate-limit / crawler error rows and incomplete articles."""
    if item.get("error") or item.get("error_code"):
        return False
    headline = (item.get("headline") or "").strip()
    url = (item.get("url") or "").strip()
    return bool(headline and url)


def flatten_scraped_news(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Map scrape articles to public.news rows."""
    rows: list[dict[str, Any]] = []
    seen_urls: set[str] = set()

    for item in items:
        if not is_valid_news_item(item):
            continue

        url = str(item["url"]).strip()
        if url in seen_urls:
            continue
        seen_urls.add(url)

        input_block = item.get("input") or {}
        rows.append(
            {
                "headline": str(item["headline"]).strip(),
                "source": item.get("source"),
                "published_at": item.get("published_at"),
                "url": url,
                "source_input_url": input_block.get("url"),
            }
        )
    return rows


def load_news_json_file(path: Path) -> list[dict[str, Any]]:
    with path.open(encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, list):
        raise ValueError(f"Expected a JSON array of news items, got {type(data).__name__}")
    return data


def ingest_news_file(
    path: Path,
    *,
    replace: bool = False,
    batch_size: int = 100,
) -> dict[str, int]:
    """
    Load sample/live news scrape JSON into public.news.

    Skips error rows (rate_limit, crawler failures). replace=True clears the table first.
    """
    raw_items = load_news_json_file(path)
    rows = flatten_scraped_news(raw_items)
    client = get_supabase()

    deleted = 0
    if replace:
        result = client.table("news").delete().neq("url", "").execute()
        deleted = len(result.data or [])

    inserted = 0
    for start in range(0, len(rows), batch_size):
        chunk = rows[start : start + batch_size]
        client.table("news").insert(chunk).execute()
        inserted += len(chunk)

    return {
        "raw_items": len(raw_items),
        "rows_prepared": len(rows),
        "rows_inserted": inserted,
        "rows_deleted": deleted,
        "rows_skipped": len(raw_items) - len(rows),
    }
