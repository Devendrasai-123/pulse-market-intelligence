import { useEffect, useState } from 'react'

import { fetchPrices } from '../api/pulse'
import DeskRadar from '../components/DeskRadar'
import GainersLosers from '../components/GainersLosers'
import HeatStrip from '../components/HeatStrip'
import InsightCard from '../components/InsightCard'
import NewsFeed from '../components/NewsFeed'
import PriceChart from '../components/PriceChart'
import SelfHealButton from '../components/SelfHealButton'
import VolumeShare from '../components/VolumeShare'
import Watchlist from '../components/Watchlist'
import { aggregateWatchlist, formatPrice } from '../lib/market'

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchPrices({ limit: 100 })
        if (!cancelled) setItems(data.items || [])
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const tape = aggregateWatchlist(items, 10)
  const withChange = tape.filter((r) => r.change != null)
  const top = withChange
    .slice()
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0]
  const leader = tape[0]

  return (
    <main className="page">
      <div className="kicker">Self-healing market intel</div>
      <h1 className="page-title">The desk is live.</h1>
      <p className="page-sub">
        CoinGecko prices and CoinDesk headlines, scraped with Bright Data, stored in
        Supabase
        {loading ? ' — syncing…' : '.'}
      </p>
      <div className="metrics">
        <div className="metric">
          <label>Listings</label>
          <strong className="num">{items.length}</strong>
        </div>
        <div className="metric">
          <label>Top volume</label>
          <strong>{leader?.symbol || '—'}</strong>
        </div>
        <div className="metric">
          <label>Mover</label>
          <strong className={top && top.change >= 0 ? 'up' : 'down'}>
            {top
              ? `${top.symbol} ${top.change >= 0 ? '+' : ''}${top.change.toFixed(2)}%`
              : '—'}
          </strong>
        </div>
        <div className="metric">
          <label>Status</label>
          <strong>{loading ? 'SYNC' : 'LIVE'}</strong>
        </div>
      </div>
      {tape.length > 0 && (
        <div className="tape">
          <div className="tape-track">
            {[...tape, ...tape].map((row, i) => (
              <span key={`${row.symbol}-${i}`}>
                <b>{row.symbol}</b> {formatPrice(row.price)}{' '}
                <span className={row.change >= 0 ? 'up' : 'down'}>
                  {row.change == null
                    ? ''
                    : `${row.change >= 0 ? '+' : ''}${row.change.toFixed(2)}%`}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
      {error && <p className="err">{error}</p>}
      <div className="grid-dash">
        <Watchlist items={items} />
        <div className="dash-main">
          <PriceChart items={items} />
          <div className="dash-under">
            <InsightCard />
            <NewsFeed />
          </div>
        </div>
      </div>
      <div className="grid-charts">
        <VolumeShare items={items} />
        <DeskRadar items={items} />
      </div>
      <HeatStrip items={items} />
      <GainersLosers items={items} />
      <SelfHealButton />
    </main>
  )
}
