# Demo script — Pulse (Into the Scrape-Verse)

Record **locally**. Self-heal needs the Bright Data CLI on your machine (not typical on Render free Python).

Target length: **2–3 minutes**. Show data first, then the heal loop.

---

## Before you hit record

1. Backend running:

   ```powershell
   cd C:\webscraperhackthon\pulse\backend
   .\.venv\Scripts\Activate.ps1
   uvicorn main:app --host 127.0.0.1 --port 8000
   ```

2. Frontend running (`npm run dev` in `frontend/`).
3. Confirm in a browser:
   - http://127.0.0.1:8000/health
   - http://127.0.0.1:8000/api/news  → `"count": 7`
   - http://127.0.0.1:8000/api/prices → rows present
4. Preflight (CLI found):

   ```powershell
   Invoke-RestMethod http://127.0.0.1:8000/api/self-heal/preflight
   ```

   `ok` must be `true`.

5. Screen: dashboard + a terminal or Network tab so judges see real HTTP, not a fake spinner.

---

## On camera (talking points)

### 1. What it is (15s)

Pulse scrapes public CoinGecko prices and CoinDesk news with **custom Bright Data Scraper Studio** collectors, stores them in Supabase, and shows them on a terminal dashboard. Insight is generated from **those rows**, not generic filler.

### 2. Live data (30s)

- Watchlist / prices from `GET /api/prices`
- News list from `GET /api/news` (real CoinDesk headlines)
- Insight card from `GET /api/insight` (names real tickers)

### 3. Self-heal — the hero (60–90s)

Say this clearly: **same Collector ID** (`c_mswww62b2iig1j1hcj`). Heal does not create a new scraper. Downstream FastAPI/Supabase code does not change.

**Sequence to show (failed → healing → repaired):**

1. Click **Trigger Self-Heal** (or run the POSTs below).
2. **Detect** runs a real `brightdata scraper run` and inspects JSON.
   - If status is `failed`: say the scrape looked empty/broken.
   - If status is `healthy`: say honestly “the site is healthy right now; we still run heal as a repair exercise on the same collector.” Do **not** claim CoinGecko is broken.
3. Status moves to **healing** while `brightdata scraper heal` runs (can take several minutes — keep talking over it: CLI, Collector ID, approve/re-run).
4. When Bright Data returns `status: "done"`, UI shows **repaired**.

Manual API (same as the button):

```powershell
Invoke-RestMethod -Method POST http://127.0.0.1:8000/api/self-heal/detect
Invoke-RestMethod -Method POST http://127.0.0.1:8000/api/trigger-self-heal

# poll every 10s until status is repaired or error
do {
  Start-Sleep -Seconds 10
  $s = Invoke-RestMethod http://127.0.0.1:8000/api/self-heal/status
  $s.status
} while ($s.status -eq "healing")
$s | ConvertTo-Json -Depth 5
```

Optional CLI overlay (proves it is not mocked):

```powershell
brightdata scraper heal c_mswww62b2iig1j1hcj --url "https://www.coingecko.com/en"
brightdata scraper approve c_mswww62b2iig1j1hcj --url "https://www.coingecko.com/en"
```

### 4. Close (15s)

Same `c_*` ID, public data only, keys in `.env`. Point to `docs/self-heal-explanation.md` in the repo.

---

## Honesty rules for the recording

- Do not fake `failed` with a timer.
- `repaired` only when Bright Data says `done`.
- If detect is `healthy`, disclose that; heal is still a real Studio repair job.

Paste the video URL into the README **Demo Video link** section when uploaded.
