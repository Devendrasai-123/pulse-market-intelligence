# Pulse scrapers (Bright Data)

Public pages only. Never commit API keys.

The Bright Data CLI (`brightdata` / `bdata`) **AI Agent mode** is `scraper create`: you pass a public URL and a natural-language description. Bright Data generates the schema and scraper JavaScript and returns a stable collector id (`c_*`). Self-heal later uses that same id.

CLI auth uses `brightdata login` or env `BRIGHTDATA_API_KEY`. The backend `.env` name is `BRIGHT_DATA_API_KEY` — different spelling; do not mix them up.

Price target: `https://www.coingecko.com/en`  
News target: TBD (Day 2)

Run the PowerShell commands from Day 1 yourself (generation takes 5–15 minutes and uses account credits). Save `collector_id` from `create.json` after a successful create. `create.json` is gitignored.
