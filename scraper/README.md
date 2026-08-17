# Pulse scrapers (Bright Data Scraper Studio)

Public pages only. Never commit API keys.

CLI auth: `brightdata login` or env `BRIGHTDATA_API_KEY`  
Backend `.env` name: `BRIGHT_DATA_API_KEY` (different spelling)

## Price scraper — CoinGecko

**Target:** `https://www.coingecko.com/en`  
**Fields:** `asset_name`, `symbol`, `price`, `percent_change_24h`, `volume_24h`  
**Collector ID:** _(paste after `scraper create` succeeds)_ `c_…`

### Create (AI Agent mode — 5–15+ minutes)

```powershell
cd C:\webscraperhackthon\pulse

brightdata scraper create "https://www.coingecko.com/en" `
  "From the public CoinGecko homepage markets table, extract a list of cryptocurrencies. For each row extract: asset_name (full coin name), symbol (ticker), price (current USD price as a number), percent_change_24h (24-hour percent change as a number), volume_24h (24-hour trading volume as a number). Skip ads, sponsored rows, and UI chrome. Return a JSON array of objects using those exact field names." `
  --name pulse-coingecko-prices `
  --timeout 1500 `
  -o scraper/price-scraper/create.json
```

### Run → sample output

```powershell
brightdata scraper run <collector_id> "https://www.coingecko.com/en" --pretty -o sample-output/example_scraped_data.json
```

### Self-heal (same collector id)

```powershell
brightdata scraper heal <collector_id> `
  "The price and percent_change_24h fields return null after a layout change. Re-extract asset_name, symbol, price, percent_change_24h, volume_24h from the public CoinGecko markets table." `
  --url "https://www.coingecko.com/en"

brightdata scraper approve <collector_id> --url "https://www.coingecko.com/en"

brightdata scraper run <collector_id> "https://www.coingecko.com/en" --pretty
```

See [docs/self-heal-explanation.md](../docs/self-heal-explanation.md).

## News scraper

Target TBD Day 2–3 (public listing only). Schema: `headline`, `source`, `published_at`, `url`.
