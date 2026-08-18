# Pulse scrapers (Bright Data Scraper Studio)

Public pages only. Never commit API keys.

CLI auth: `brightdata login` or env `BRIGHTDATA_API_KEY`  
Backend `.env` name: `BRIGHT_DATA_API_KEY` (different spelling)

## Price scraper — CoinGecko

**Target:** `https://www.coingecko.com/en` (live run used coin pages under `/en/coins`)  
**Actual scrape shape:** each item has `product_page_url`, `input.url`, and `markets[]` with  
`exchange_name`, `ticker_symbol`, `current_price{value,currency,symbol}`, `price_change_24h` (string), `volume_24h{…}`.  
Flattened into Supabase `market_data` — see `backend/schema.sql`.  
**Collector ID:** `c_mswww62b2iig1j1hcj` (also `PRICE_COLLECTOR_ID` in backend `.env`)


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

## News scraper — CoinDesk

**Target:** `https://www.coindesk.com/` (public homepage)  
**Collector ID:** `c_msx6tyya20kx5jxsy1`  
**Shape:** `headline`, `source`, `published_at`, `url` (plus `input.url`). Error/rate-limit rows are skipped on ingest.  
**Sample:** `sample-output/example_news_data.json` (7 articles). Table: `public.news` in `backend/schema.sql`.

```powershell
brightdata scraper run c_msx6tyya20kx5jxsy1 "https://www.coindesk.com/" --pretty -o sample-output/example_news_data.json
```
