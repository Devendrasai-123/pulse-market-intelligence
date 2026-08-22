"""Supabase client factory. Credentials come from environment only."""

import os
from functools import lru_cache

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()


class ConfigError(RuntimeError):
    """Missing or invalid environment configuration."""


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    """Return a cached Supabase client. Raises ConfigError if URL/key are missing."""
    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_KEY", "").strip()
    if not url or not key or "your_supabase" in url or "your_supabase" in key:
        raise ConfigError(
            "Set SUPABASE_URL and SUPABASE_KEY in backend/.env "
            "(copy from .env.example). Use the service role key for ingest."
        )
    return create_client(url, key)
