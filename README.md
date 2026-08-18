# Pulse — Market Intelligence Terminal

Self-healing market intelligence terminal for the **Into the Scrape-Verse** hackathon (WeMakeDevs + Bright Data). Pulse scrapes public crypto prices and financial news with **Bright Data Scraper Studio**, stores structured rows in Supabase, generates a short market insight with CrewAI + NVIDIA NIM, and demos **real self-heal** on the same Collector ID when extraction breaks.

## Description

Pulse is a dark trading-terminal style app (functional data wiring first; visual polish in progress) that:

- Scrapes **CoinGecko** exchange listings (price, 24h change, volume) via a custom Scraper Studio collector
- Scrapes **CoinDesk** headlines (headline, source, published date, URL) via a second custom collector
- Ingests JSON into Postgres (**Supabase**): `market_data` and `news`
- Serves **FastAPI** endpoints for prices, news, AI insight, and self-heal
- Shows a dashboard: watchlist, chart placeholder, AI insight card, news feed, and a **Trigger Self-Heal Demo** control (`failed → healing → repaired`)

Public pages only. No logins, paywalls, or private data.

## Tech Stack

| Layer | Tool |
|-------|------|
| Scrapers | Bright Data Scraper Studio + Bright Data CLI |
| Backend | Python, FastAPI, Uvicorn |
| Database | Supabase (Postgres) |
| AI insight | CrewAI + NVIDIA NIM (LiteLLM) |
| Frontend | React 18, Vite, Recharts |
| Hosting | Vercel (frontend), Render (backend) |

## Setup Instructions

### Prerequisites

- Python 3.12+, Node.js 18+, Bright Data CLI (`npm i -g @brightdata/cli` or `npx @brightdata/cli`)
- Accounts: Bright Data, Supabase, NVIDIA NIM (`build.nvidia.com`)

### Backend

```powershell
cd C:\webscraperhackthon\pulse\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

Fill `backend/.env` (never commit `.env`):

- `SUPABASE_URL`, `SUPABASE_KEY` (service role for ingest)
- `BRIGHT_DATA_API_KEY` (and/or `brightdata login`)
- `NVIDIA_NIM_API_KEY`
- `PRICE_COLLECTOR_ID=c_mswww62b2iig1j1hcj`

Create tables in the Supabase SQL Editor by running `backend/schema.sql`.

Load sample scrapes:

```powershell
python scripts\ingest_sample.py --replace
python scripts\ingest_news_sample.py --replace
```

Start API:

```powershell
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Health: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### Frontend

```powershell
cd C:\webscraperhackthon\pulse\frontend
copy .env.example .env
npm install
npm run dev
```

Default API base: `VITE_API_URL=http://127.0.0.1:8000`

### Self-heal demo (local)

Render’s free Python image typically does not include the Bright Data CLI. Record self-heal against **localhost**. See [docs/self-heal-explanation.md](docs/self-heal-explanation.md) and [docs/demo-script.md](docs/demo-script.md).

```powershell
# preflight
Invoke-RestMethod http://127.0.0.1:8000/api/self-heal/preflight

# detect (real scraper run)
Invoke-RestMethod -Method POST http://127.0.0.1:8000/api/self-heal/detect

# heal (real CLI; can take several minutes)
Invoke-RestMethod -Method POST http://127.0.0.1:8000/api/trigger-self-heal

# poll until repaired or error
Invoke-RestMethod http://127.0.0.1:8000/api/self-heal/status
```

## How Bright Data Scraper Studio Is Used

Pulse does **not** rely only on Bright Data’s pre-built scraper library. Two **custom** Scraper Studio collectors were created with AI Agent mode, then driven from the CLI and backend:

| Scraper | Target (public) | Collector ID | Output |
|---------|-----------------|--------------|--------|
| Prices | https://www.coingecko.com/en | `c_mswww62b2iig1j1hcj` | `sample-output/example_scraped_data.json` |
| News | https://www.coindesk.com/ | `c_msx6tyya20kx5jxsy1` | `sample-output/example_news_data.json` |

Typical loop (same Collector ID after a layout break):

1. `brightdata scraper create <url> "<intent>"` — generate extraction
2. `brightdata scraper run <c_*> <url>` — structured JSON
3. `brightdata scraper heal <c_*> "<what broke>" --url <url>` — repair in place
4. `brightdata scraper approve <c_*>` — accept the proposed fix
5. Re-run the same collector — ingest JSON into Supabase without changing API contracts

The dashboard **Trigger Self-Heal** button calls FastAPI, which shells out to the real CLI (`heal` / `run`). `repaired` is set only when Bright Data returns `status: "done"`. Details: [docs/self-heal-explanation.md](docs/self-heal-explanation.md), [scraper/README.md](scraper/README.md).

## AI Tools Disclosure

AI coding assistants were used during this hackathon (Cursor / agentic coding). Participants reviewed, ran, and verified scrapers, schema, ingest, APIs, and the self-heal CLI path.

| Use | Tool |
|-----|------|
| Scraper generation | Bright Data Scraper Studio AI Agent mode |
| Application code | Cursor (AI pair programmer) under human direction |
| Market insight text | CrewAI agent via NVIDIA NIM (`meta/llama-3.1-8b-instruct`) |

No API keys are hardcoded. Secrets live in `.env` only.

## Sample Output

- Prices: [sample-output/example_scraped_data.json](sample-output/example_scraped_data.json) — CoinGecko coins with `markets[]` (exchange, ticker, price, 24h change, volume)
- News: [sample-output/example_news_data.json](sample-output/example_news_data.json) — 7 CoinDesk articles (`headline`, `source`, `published_at`, `url`)

API after ingest:

- `GET /api/prices` — flattened `market_data` rows
- `GET /api/news` — news rows
- `GET /api/insight` — NIM-generated summary citing real tickers

## Demo Video link

Add the public recording URL here after filming (self-heal on **local** backend):

_TODO: paste YouTube / Drive / Loom link_

Recording steps: [docs/demo-script.md](docs/demo-script.md)

## License

MIT — see [LICENSE](LICENSE).
