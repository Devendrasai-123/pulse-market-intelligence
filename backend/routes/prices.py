"""GET /api/prices — read flattened market_data from Supabase."""

from fastapi import APIRouter, HTTPException, Query

from models.market import MarketDataRow, PricesResponse
from services.supabase_client import ConfigError, get_supabase

router = APIRouter(prefix="/api", tags=["prices"])


@router.get("/prices", response_model=PricesResponse)
def list_prices(
    limit: int = Query(100, ge=1, le=1000, description="Max rows to return"),
    ticker: str | None = Query(
        None, description="Filter by exact ticker_symbol, e.g. DOGE/USDT"
    ),
    exchange: str | None = Query(
        None, description="Filter by exact exchange_name, e.g. Binance"
    ),
) -> PricesResponse:
    """Return recent exchange-level market rows from Supabase."""
    try:
        client = get_supabase()
    except ConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    query = (
        client.table("market_data")
        .select("*")
        .order("volume_24h", desc=True)
        .limit(limit)
    )
    if ticker:
        query = query.eq("ticker_symbol", ticker)
    if exchange:
        query = query.eq("exchange_name", exchange)

    try:
        result = query.execute()
    except Exception as exc:  # noqa: BLE001 — surface Supabase errors cleanly
        raise HTTPException(
            status_code=502,
            detail=f"Supabase query failed: {exc}",
        ) from exc

    items = [MarketDataRow.model_validate(row) for row in (result.data or [])]
    return PricesResponse(count=len(items), items=items)
