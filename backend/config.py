"""Runtime settings from the environment. Collector IDs are public; keys are not."""

from __future__ import annotations

import os

from dotenv import load_dotenv

load_dotenv()

PRICE_COLLECTOR_ID = (
    os.getenv("PRICE_COLLECTOR_ID", "c_mswww62b2iig1j1hcj").strip() or "c_mswww62b2iig1j1hcj"
)
NEWS_COLLECTOR_ID = (
    os.getenv("NEWS_COLLECTOR_ID", "c_msx6tyya20kx5jxsy1").strip() or "c_msx6tyya20kx5jxsy1"
)
PRICE_SCRAPER_URL = (
    os.getenv("PRICE_SCRAPER_URL", "https://www.coingecko.com/en").strip()
    or "https://www.coingecko.com/en"
)
