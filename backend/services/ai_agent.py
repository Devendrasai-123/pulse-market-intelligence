"""
CrewAI market analyst powered by NVIDIA NIM (via LiteLLM).

Reads recent prices (+ news when available) and writes a short insight that
cites real tickers and % moves from the scrape — not generic market filler.
"""

from __future__ import annotations

import os
import re
from collections import defaultdict
from typing import Any

from dotenv import load_dotenv

from services.data_access import fetch_recent_news, fetch_recent_prices
from services.supabase_client import ConfigError

load_dotenv()

# CrewAI / LiteLLM look for this name for hosted NIM.
_ENV_KEY = "NVIDIA_NIM_API_KEY"
# Sensible default on build.nvidia.com; override with NVIDIA_NIM_MODEL.
_DEFAULT_MODEL = "nvidia_nim/meta/llama-3.1-8b-instruct"


class InsightError(RuntimeError):
    """Raised when the insight crew cannot run."""


def _require_nim_key() -> str:
    key = os.getenv(_ENV_KEY, "").strip()
    if not key or key.startswith("your_"):
        raise InsightError(
            f"Set {_ENV_KEY} in backend/.env (NVIDIA NIM / build.nvidia.com API key)."
        )
    # LiteLLM also accepts NVIDIA_API_KEY; keep both in sync for compatibility.
    os.environ[_ENV_KEY] = key
    if not os.getenv("NVIDIA_API_KEY"):
        os.environ["NVIDIA_API_KEY"] = key
    return key


def _base_asset(ticker: str) -> str:
    """DOGE/USDT -> DOGE."""
    if not ticker:
        return ""
    return ticker.split("/", 1)[0].strip().upper()


def _summarize_prices(rows: list[dict[str, Any]], top_n: int = 12) -> str:
    """
    Collapse exchange rows into per-asset lines the LLM can cite.

    Uses volume-weighted average price and the best-available % change.
    """
    by_asset: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        asset = _base_asset(str(row.get("ticker_symbol") or ""))
        if asset:
            by_asset[asset].append(row)

    summaries: list[tuple[float, str]] = []
    for asset, items in by_asset.items():
        vols = [float(i["volume_24h"]) for i in items if i.get("volume_24h") is not None]
        prices = [float(i["price"]) for i in items if i.get("price") is not None]
        changes = [
            float(i["price_change_24h"])
            for i in items
            if i.get("price_change_24h") is not None
        ]
        if not prices:
            continue
        total_vol = sum(vols) if vols else 0.0
        avg_price = sum(prices) / len(prices)
        avg_chg = sum(changes) / len(changes) if changes else None
        top_ex = max(
            items,
            key=lambda r: float(r["volume_24h"] or 0),
        )
        chg_txt = f"{avg_chg:+.2f}%" if avg_chg is not None else "n/a"
        line = (
            f"{asset}: ~{avg_price:.6g} {top_ex.get('price_currency') or 'USD'}, "
            f"24h {chg_txt}, "
            f"top venue {top_ex.get('exchange_name')} "
            f"({top_ex.get('ticker_symbol')}), "
            f"agg_volume={total_vol:.0f}"
        )
        summaries.append((total_vol, line))

    summaries.sort(key=lambda x: x[0], reverse=True)
    return "\n".join(line for _, line in summaries[:top_n]) or "No price rows available."


def _summarize_news(rows: list[dict[str, Any]], top_n: int = 8) -> str:
    if not rows:
        return "No news rows available yet."
    lines: list[str] = []
    for row in rows[:top_n]:
        headline = row.get("headline") or row.get("title") or "(no headline)"
        source = row.get("source") or "unknown"
        published = row.get("published_at") or row.get("published_date") or ""
        url = row.get("url") or row.get("article_url") or ""
        lines.append(f"- [{source}] {headline} ({published}) {url}".strip())
    return "\n".join(lines)


def build_market_brief(
    *,
    price_limit: int = 80,
    news_limit: int = 15,
) -> dict[str, Any]:
    """Pull live DB context (same tables as /api/prices and /api/news)."""
    try:
        prices = fetch_recent_prices(limit=price_limit)
        news = fetch_recent_news(limit=news_limit)
    except ConfigError as exc:
        raise InsightError(str(exc)) from exc

    return {
        "price_row_count": len(prices),
        "news_row_count": len(news),
        "price_brief": _summarize_prices(prices),
        "news_brief": _summarize_news(news),
        "sample_tickers": sorted(
            {
                _base_asset(str(r.get("ticker_symbol") or ""))
                for r in prices
                if r.get("ticker_symbol")
            }
        )[:20],
    }


def generate_market_insight() -> dict[str, Any]:
    """
    Run a one-agent CrewAI crew on NVIDIA NIM and return structured insight JSON.
    """
    _require_nim_key()
    brief = build_market_brief()

    try:
        from crewai import Agent, Crew, LLM, Task
    except ImportError as exc:
        raise InsightError(
            'CrewAI is not installed. Run: pip install "crewai[litellm]"'
        ) from exc

    model = os.getenv("NVIDIA_NIM_MODEL", _DEFAULT_MODEL).strip() or _DEFAULT_MODEL
    if not model.startswith("nvidia_nim/"):
        model = f"nvidia_nim/{model}"

    llm = LLM(model=model, temperature=0.2, max_tokens=400)

    analyst = Agent(
        role="Crypto market desk analyst",
        goal=(
            "Write one short, specific market insight grounded only in the "
            "provided scrape numbers and headlines."
        ),
        backstory=(
            "You cover crypto exchange listings for traders. You never invent "
            "prices or percentages. You name coins/tickers that appear in the brief."
        ),
        llm=llm,
        verbose=False,
        allow_delegation=False,
    )

    task = Task(
        description=(
            "Using ONLY the data below, write 2–4 sentences of plain-language "
            "market insight for a trading terminal.\n"
            "Rules:\n"
            "- Mention at least two real base assets/tickers from the price brief "
            "(e.g. BTC, ETH, DOGE) with their 24h % when available.\n"
            "- Call out which assets are leading or lagging on volume or % change.\n"
            "- If news is present, tie one headline to the price action; "
            "if news says none available, skip news.\n"
            "- No generic filler like 'markets are volatile' without naming coins.\n"
            "- Output plain text only (no markdown headings).\n\n"
            f"PRICE BRIEF (aggregated from live scrape):\n{brief['price_brief']}\n\n"
            f"NEWS BRIEF:\n{brief['news_brief']}\n"
        ),
        expected_output="A 2–4 sentence plain-language market insight citing real tickers.",
        agent=analyst,
    )

    crew = Crew(agents=[analyst], tasks=[task], verbose=False)

    try:
        raw = crew.kickoff()
    except Exception as exc:  # noqa: BLE001
        raise InsightError(f"NVIDIA NIM / CrewAI run failed: {exc}") from exc

    text = str(raw).strip()
    # Strip accidental code fences if the model adds them.
    text = re.sub(r"^```\w*\n?", "", text)
    text = re.sub(r"\n?```$", "", text).strip()

    return {
        "insight": text,
        "model": model,
        "price_row_count": brief["price_row_count"],
        "news_row_count": brief["news_row_count"],
        "tickers_considered": brief["sample_tickers"],
    }
