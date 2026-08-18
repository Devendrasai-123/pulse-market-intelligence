"""Pydantic models for flattened market_data rows."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class MarketDataRow(BaseModel):
    """One exchange listing row as stored in Supabase `market_data`."""

    id: Optional[UUID] = None
    exchange_name: str
    ticker_symbol: str
    price: Optional[float] = None
    price_currency: Optional[str] = None
    price_symbol: Optional[str] = None
    price_change_24h_raw: Optional[str] = None
    price_change_24h: Optional[float] = None
    volume_24h: Optional[float] = None
    volume_currency: Optional[str] = None
    volume_symbol: Optional[str] = None
    product_page_url: Optional[str] = None
    source_input_url: Optional[str] = None
    ingested_at: Optional[datetime] = None


class PricesResponse(BaseModel):
    count: int
    items: list[MarketDataRow] = Field(default_factory=list)
