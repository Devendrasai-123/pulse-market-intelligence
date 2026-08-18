"""Insight API response models."""

from typing import Optional

from pydantic import BaseModel, Field


class InsightResponse(BaseModel):
    insight: str
    model: str
    price_row_count: int = 0
    news_row_count: int = 0
    tickers_considered: list[str] = Field(default_factory=list)


class NewsItem(BaseModel):
    id: Optional[str] = None
    headline: Optional[str] = None
    source: Optional[str] = None
    published_at: Optional[str] = None
    url: Optional[str] = None
    ingested_at: Optional[str] = None


class NewsResponse(BaseModel):
    count: int
    items: list[NewsItem] = Field(default_factory=list)
