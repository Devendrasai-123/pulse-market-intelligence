/** Aggregate exchange rows into one watchlist card per base ticker. */

export function baseTicker(symbol) {
  if (!symbol) return ''
  return String(symbol).split('/')[0].trim().toUpperCase()
}

export function formatPrice(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  if (n >= 1000) return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
  if (n >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 4 })
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 })
}

export function formatPct(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return n
}

/**
 * Collapse exchange listings to one row per base ticker (highest 24h volume).
 * @param {Array<object>} items Rows from GET /api/prices
 * @param {number} [limit]
 */
export function aggregateWatchlist(items, limit = 12) {
  const byAsset = new Map()
  for (const row of items || []) {
    const symbol = baseTicker(row.ticker_symbol)
    if (!symbol) continue
    const vol = Number(row.volume_24h) || 0
    const prev = byAsset.get(symbol)
    if (!prev || vol > prev.volume) {
      byAsset.set(symbol, {
        id: row.id || symbol,
        symbol,
        exchange: row.exchange_name,
        price: Number(row.price),
        currency: row.price_currency || 'USD',
        change: formatPct(row.price_change_24h),
        volume: vol,
        ticker: row.ticker_symbol,
      })
    }
  }
  return [...byAsset.values()].sort((a, b) => b.volume - a.volume).slice(0, limit)
}

export function formatClock(date = new Date()) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatCompact(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toFixed(0)
}

const SHARE_COLORS = ['#f4f4f4', '#c8c8c8', '#9a9a9a', '#6e6e6e', '#444444', '#222222']

export function volumeShare(items, limit = 6) {
  const rows = aggregateWatchlist(items, limit)
  const total = rows.reduce((sum, row) => sum + row.volume, 0) || 1
  return {
    total,
    slices: rows.map((row, i) => ({
      ...row,
      value: row.volume,
      pct: (row.volume / total) * 100,
      color: SHARE_COLORS[i % SHARE_COLORS.length],
    })),
  }
}

/**
 * Radar scores from the live tape (breadth, concentration, momentum, stress).
 * Values are 0–100 for the chart, not investment advice.
 */
export function deskRadar(items) {
  const assets = aggregateWatchlist(items, 40)
  const n = assets.length || 1
  const up = assets.filter((a) => a.change != null && a.change >= 0).length
  const down = assets.filter((a) => a.change != null && a.change < 0).length
  const totalVol = assets.reduce((sum, a) => sum + a.volume, 0) || 1
  const avgAbs = assets.reduce((sum, a) => sum + Math.abs(a.change || 0), 0) / n
  const medianVol =
    [...assets].sort((a, b) => a.volume - b.volume)[Math.floor(n / 2)]?.volume || 0
  return [
    { axis: 'Breadth', value: Math.round((up / n) * 100) },
    {
      axis: 'Leadership',
      value: Math.round(((assets[0]?.volume || 0) / totalVol) * 100),
    },
    { axis: 'Cooperation', value: Math.min(100, Math.round(n * 8)) },
    { axis: 'Momentum', value: Math.min(100, Math.round(avgAbs * 10)) },
    {
      axis: 'Liquidity',
      value: Math.min(100, Math.round((medianVol / (assets[0]?.volume || 1)) * 100)),
    },
    { axis: 'Stress', value: Math.round((down / n) * 100) },
  ]
}
