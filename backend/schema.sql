-- Pulse: market_data table matched to Bright Data CoinGecko scrape output.
-- Run this in the Supabase SQL Editor once per project.
--
-- Source shape (per coin):
--   { "product_page_url", "input": { "url" }, "markets": [
--       { exchange_name, ticker_symbol,
--         current_price: { value, currency, symbol },
--         price_change_24h: "0.01%" | "-",
--         volume_24h: { value, currency, symbol } } ] }

create extension if not exists "pgcrypto";

create table if not exists public.market_data (
  id uuid primary key default gen_random_uuid(),

  -- Exchange row (from markets[])
  exchange_name text not null,
  ticker_symbol text not null,

  -- Flattened current_price
  price numeric,
  price_currency text,
  price_symbol text,

  -- Raw scrape string (e.g. "0.01%", "-") plus parsed number when possible
  price_change_24h_raw text,
  price_change_24h numeric,

  -- Flattened volume_24h
  volume_24h numeric,
  volume_currency text,
  volume_symbol text,

  -- Coin-level context
  product_page_url text,
  source_input_url text,

  ingested_at timestamptz not null default now()
);

create index if not exists market_data_ticker_idx
  on public.market_data (ticker_symbol);

create index if not exists market_data_exchange_idx
  on public.market_data (exchange_name);

create index if not exists market_data_ingested_at_idx
  on public.market_data (ingested_at desc);

create index if not exists market_data_volume_idx
  on public.market_data (volume_24h desc nulls last);

-- Public read for the Pulse dashboard API (anon key). Tighten later if needed.
alter table public.market_data enable row level security;

drop policy if exists "Allow public read market_data" on public.market_data;
create policy "Allow public read market_data"
  on public.market_data
  for select
  using (true);

-- Ingest script uses the service role key (bypasses RLS) for inserts.
-- If you prefer anon inserts for local demos, uncomment:
-- drop policy if exists "Allow public insert market_data" on public.market_data;
-- create policy "Allow public insert market_data"
--   on public.market_data for insert with check (true);

-- ---------------------------------------------------------------------------
-- Pulse: news table matched to Bright Data CoinDesk scrape output.
-- Run this block in the Supabase SQL Editor after market_data (or standalone).
--
-- Source shape (per article):
--   { headline, source, published_at, url, input: { url } }
-- Rate-limit / crawler error rows are filtered out before ingest.

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),

  headline text not null,
  source text,
  published_at text,
  url text not null,
  source_input_url text,

  ingested_at timestamptz not null default now()
);

create unique index if not exists news_url_idx on public.news (url);

create index if not exists news_ingested_at_idx
  on public.news (ingested_at desc);

alter table public.news enable row level security;

drop policy if exists "Allow public read news" on public.news;
create policy "Allow public read news"
  on public.news
  for select
  using (true);
