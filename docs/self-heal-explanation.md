# How Pulse self-heal works

Pulse uses Bright Data Scraper Studio's built-in **self-healing** flow — not a custom repair script we invent. When a target page layout changes and extraction returns empty or wrong fields, we repair the scraper **in place** so the same Collector ID (`c_*`) keeps working for every run, schedule, and API call.

Official flow (Bright Data CLI): **run → inspect → heal → approve → re-run**.  
Docs: [Build with the Bright Data CLI](https://docs.brightdata.com/datasets/scraper-studio/build-with-the-cli) · [Self-Healing tool](https://docs.brightdata.com/datasets/scraper-studio/self-healing-tool)

---

## Honesty audit (what is real vs not)

| Piece | Real? | Notes |
|-------|-------|--------|
| **Failure detection** | **Yes (after fix)** | `POST /api/self-heal/detect` runs live `brightdata scraper run` and inspects JSON. Old `mark-failed` that only set a flag was **staged** and has been replaced. |
| **Heal trigger** | **Yes** | `POST /api/trigger-self-heal` shells out to `brightdata scraper heal c_mswww62b2iig1j1hcj ...` |
| **Status while healing** | **Partial** | We store `healing` in memory while the CLI subprocess runs. We do **not** separately poll a Bright Data progress API mid-flight; the CLI polls Bright Data internally. |
| **Repaired** | **Yes (strict)** | Set only when the CLI JSON envelope has `status: "done"`. We no longer treat bare exit code 0 as success. |
| **Timers / fake progress** | **None** | No `sleep`-based fake transitions. |

### Demo recording note (local backend)

For the hackathon **demo video**, we trigger self-heal against the **local** FastAPI
backend (`http://127.0.0.1:8000`), not the free Render deploy.

**Why:** Render’s free Python image typically does not include Node.js or the
Bright Data CLI (`brightdata`). Pulse’s heal endpoint shells out to that CLI for a
*real* Scraper Studio self-heal on collector `c_mswww62b2iig1j1hcj`. Running heal
locally is the honest, reliable path for the recording.

If a live detect returns **`healthy`**, do **not** claim the site was broken on camera —
either heal anyway as a “repair exercise” with that disclosed, or wait until output
truly fails detection.

---

## What stays stable

| Concept | Meaning |
|---------|---------|
| **Collector ID** (`c_*`) | Stable handle for this Scraper Studio scraper. Self-heal does **not** create a new scraper. |
| **Output schema** | Fields we care about (`asset_name`, `symbol`, `price`, `percent_change_24h`, `volume_24h`). Heal rewrites extraction against that intent. |
| **Downstream app** | FastAPI / Supabase / dashboard keep using the same collector — no URL rewrite in our code when selectors change. |

---

## Bright Data mechanism (actual steps)

### 1. Detect (we are the detector)

Bright Data does not auto-decide that a scraper is "broken." **You (or Pulse) inspect a run.** Typical signals:

- Fields that used to be numbers are `null` or missing
- Row count drops to near zero while the page still loads
- Wrong types (e.g. ads/UI chrome scraped as "assets")

In Pulse, the dashboard **Trigger Self-Heal Demo** button starts from this "failed" state after a bad or empty scrape.

### 2. Heal — `brightdata scraper heal`

```powershell
brightdata scraper heal <collector_id> `
  "The price and percent_change_24h fields return null after a layout change. Re-extract asset_name, symbol, price, percent_change_24h, volume_24h from the public CoinGecko markets table." `
  --url "https://www.coingecko.com/en"
```

Under the hood this triggers Scraper Studio's AI refactor (`refactor_template`): the AI rewrites extraction from a **plain-language description** of the fields (max ~1000 characters on the prompt). The CLI polls progress.

By default, heal **stops at an approval gate** (`status: "awaiting_approval"`) and returns:

- `preview_result` — sample rows from the proposed fix  
- `view_url` — open the collector in the Bright Data control panel  
- `next_step` — the approve command to run next  

Optional: `--auto-approve` skips the gate (useful for automation; for demos we prefer the manual gate so judges see human-in-the-loop).

### 3. Approve or reject — `brightdata scraper approve`

```powershell
# Commit the fix (same collector_id)
brightdata scraper approve <collector_id> --url "https://www.coingecko.com/en"

# Or discard and heal again with a clearer prompt
brightdata scraper approve <collector_id> --reject
```

On approve, `status` becomes `done` and the template is updated in place. On reject, nothing changes.

### 4. Re-run — verify repair

```powershell
brightdata scraper run <collector_id> "https://www.coingecko.com/en" --pretty
```

Confirm previously broken fields are populated again. Same `c_*` id throughout.

---

## How Pulse demonstrates this (not a black box)

| Demo state | API `status` | What it maps to |
|------------|--------------|-----------------|
| **failed** | `failed` | Live scrape inspected and looks empty/broken |
| **healthy** | `healthy` | Live scrape looks valid — do not claim breakage |
| **healing** | `healing` | Real `brightdata scraper heal` running (or awaiting_approval) |
| **repaired** | `repaired` | Bright Data envelope `status=done` only |

Local demo endpoints:

1. `GET /api/self-heal/preflight` — CLI + auth  
2. `POST /api/self-heal/detect` — **real** scrape + inspect (`/mark-failed` is an alias)  
3. `POST /api/trigger-self-heal` — **real** heal (default `auto_approve=true`)  
4. `GET /api/self-heal/status` — in-memory job updated when the CLI finishes  

---

## What we deliberately do *not* claim

- We do **not** claim silent auto-heal on every layout change without a trigger. Detection + heal prompt + (usually) approval are part of the product story.
- We do **not** rebuild a new scraper to "fix" breakage — that would break every integration that stores the old `c_*` id.
- Self-heal is **Bright Data Scraper Studio AI**, not a Pulse-written selector rewriter.

---

## Demo cheat sheet (local video)

1. Preflight: `GET /api/self-heal/preflight` → `ok: true`  
2. Detect: `POST /api/self-heal/detect` → expect **failed** (or disclose **healthy**)  
3. Heal: `POST /api/trigger-self-heal?auto_approve=true` → **healing**  
4. Poll: `GET /api/self-heal/status` until **repaired** with `repaired_from_bright_data_done: true`  
5. Optional: `brightdata scraper run c_mswww62b2iig1j1hcj "https://www.coingecko.com/en" --pretty`

Keep this file linked from the root README under "How Bright Data Scraper Studio Is Used."
