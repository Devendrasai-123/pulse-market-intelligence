# How Pulse self-heal works

Pulse uses Bright Data Scraper Studio's built-in **self-healing** flow — not a custom repair script we invent. When a target page layout changes and extraction returns empty or wrong fields, we repair the scraper **in place** so the same Collector ID (`c_*`) keeps working for every run, schedule, and API call.

Official flow (Bright Data CLI): **run → inspect → heal → approve → re-run**.  
Docs: [Build with the Bright Data CLI](https://docs.brightdata.com/datasets/scraper-studio/build-with-the-cli) · [Self-Healing tool](https://docs.brightdata.com/datasets/scraper-studio/self-healing-tool)

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

| Demo state | What it maps to |
|------------|-----------------|
| **failed** | A run returned empty/null fields (or we simulate that failure for the live demo) |
| **healing** | `scraper heal` is running / awaiting approval |
| **repaired** | `scraper approve` succeeded and a re-run returns valid rows |

The floating **Trigger Self-Heal Demo** button on the dashboard walks through these states so judges can see:

1. Failure is visible (missing data / failed status)  
2. Repair uses Bright Data's real heal + approve path  
3. The collector id never changes — only extraction logic does  

We document the exact `collector_id` and commands in `scraper/README.md` so the demo is reproducible.

---

## What we deliberately do *not* claim

- We do **not** claim silent auto-heal on every layout change without a trigger. Detection + heal prompt + (usually) approval are part of the product story.
- We do **not** rebuild a new scraper to "fix" breakage — that would break every integration that stores the old `c_*` id.
- Self-heal is **Bright Data Scraper Studio AI**, not a Pulse-written selector rewriter.

---

## Demo cheat sheet (live)

1. Show a bad or empty scrape → UI **failed**  
2. Run heal (or trigger from the app) → UI **healing**  
3. Approve after preview looks good → UI **repaired**  
4. Re-run → watchlist/chart refill with the same collector id  

Keep this file linked from the root README under "How Bright Data Scraper Studio Is Used."
