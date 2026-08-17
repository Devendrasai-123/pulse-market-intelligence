/** Placeholder market data until Day 3+ wires FastAPI / Bright Data. */

export const WATCHLIST = [
  {
    asset_name: 'Bitcoin',
    symbol: 'BTC',
    price: 68420.55,
    percent_change_24h: 2.34,
    volume_24h: 28_400_000_000,
    sparkline: [65000, 66200, 65800, 67100, 66900, 68000, 68420],
  },
  {
    asset_name: 'Ethereum',
    symbol: 'ETH',
    price: 3450.12,
    percent_change_24h: -1.12,
    volume_24h: 12_100_000_000,
    sparkline: [3520, 3480, 3510, 3460, 3440, 3475, 3450],
  },
  {
    asset_name: 'Solana',
    symbol: 'SOL',
    price: 178.9,
    percent_change_24h: 5.67,
    volume_24h: 3_200_000_000,
    sparkline: [160, 165, 162, 170, 172, 175, 179],
  },
  {
    asset_name: 'XRP',
    symbol: 'XRP',
    price: 0.62,
    percent_change_24h: -0.45,
    volume_24h: 1_800_000_000,
    sparkline: [0.64, 0.63, 0.625, 0.63, 0.61, 0.615, 0.62],
  },
]

export const CHART_SERIES = [
  { time: '00:00', price: 66800, volume: 420 },
  { time: '04:00', price: 67200, volume: 380 },
  { time: '08:00', price: 66950, volume: 510 },
  { time: '12:00', price: 67800, volume: 620 },
  { time: '16:00', price: 68100, volume: 490 },
  { time: '20:00', price: 68420, volume: 550 },
]

export const NEWS = [
  {
    headline: 'Bitcoin holds above $68k as traders watch Fed minutes',
    source: 'CoinDesk',
    published_at: '2026-08-17T06:00:00Z',
    url: 'https://www.coindesk.com/',
  },
  {
    headline: 'Ethereum staking inflows rise ahead of network upgrade talk',
    source: 'The Block',
    published_at: '2026-08-17T04:30:00Z',
    url: 'https://www.theblock.co/',
  },
  {
    headline: 'Solana DeFi volumes tick higher on weekend activity',
    source: 'Decrypt',
    published_at: '2026-08-16T22:15:00Z',
    url: 'https://decrypt.co/',
  },
]

export const INSIGHT =
  'BTC leads majors with a firm overnight bid while ETH lags. Volume is concentrated in BTC and SOL — watch whether SOL strength continues into the US open. News tone is constructive but event-driven around macro releases.'
