import { useEffect, useState } from 'react'
import Watchlist from '../components/Watchlist'
import PriceChart from '../components/PriceChart'
import NewsFeed from '../components/NewsFeed'
import InsightCard from '../components/InsightCard'
import SelfHealButton from '../components/SelfHealButton'
import { fetchPrices } from '../api/pulse'

/**
 * Functional dashboard — wires live APIs, no visual design.
 */
export default function Dashboard() {
  const [items, setItems] = useState([])
  const [count, setCount] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchPrices({ limit: 100 })
        if (!cancelled) {
          setItems(data.items || [])
          setCount(data.count ?? 0)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
          setItems([])
          setCount(0)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <h1>Pulse — functional data check</h1>
      <p>
        Prices: GET /api/prices — count={count} loading={String(loading)}
      </p>
      {error && (
        <p>
          Prices error: {error} (Is uvicorn running on port 8000?)
        </p>
      )}

      <SelfHealButton />
      <InsightCard />
      <Watchlist items={items} />
      <PriceChart items={items} />
      <NewsFeed />
    </div>
  )
}
