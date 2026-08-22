"""
Load sample-output/example_scraped_data.json into Supabase market_data.

Usage (from backend/ with venv active):

    python scripts/ingest_sample.py
    python scripts/ingest_sample.py --replace
    python scripts/ingest_sample.py --file ../sample-output/example_scraped_data.json
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Allow `python scripts/ingest_sample.py` from backend/
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from services.ingest import ingest_file  # noqa: E402
from services.supabase_client import ConfigError  # noqa: E402

DEFAULT_SAMPLE = Path(__file__).resolve().parents[2] / "sample-output" / "example_scraped_data.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="Ingest Pulse scrape JSON into Supabase")
    parser.add_argument(
        "--file",
        type=Path,
        default=DEFAULT_SAMPLE,
        help="Path to Bright Data JSON array (default: sample-output/…)",
    )
    parser.add_argument(
        "--replace",
        action="store_true",
        help="Delete existing market_data rows before insert",
    )
    args = parser.parse_args()

    path = args.file.resolve()
    if not path.is_file():
        print(f"File not found: {path}", file=sys.stderr)
        return 1

    try:
        stats = ingest_file(path, replace=args.replace)
    except ConfigError as exc:
        print(exc, file=sys.stderr)
        return 1
    except Exception as exc:  # noqa: BLE001
        print(f"Ingest failed: {exc}", file=sys.stderr)
        return 1

    print(
        f"Ingested {stats['rows_inserted']} market rows "
        f"from {stats['coins']} coins "
        f"(prepared={stats['rows_prepared']}, deleted={stats['rows_deleted']})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
