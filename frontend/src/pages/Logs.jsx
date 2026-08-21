import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'
import { fetchActivity } from '../api/pulse'

const LABELS = {
  scrape_run: 'Scrape Run',
  heal_triggered: 'Self-Heal Triggered',
  repaired: 'Repaired',
  failed: 'Failed',
}

export default function Logs() {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await fetchActivity({ limit: 50 })
        if (!cancelled) {
          setItems(data.items || [])
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      }
    }
    load()
    const t = setInterval(load, 30000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [])

  return (
    <main className="page">
      <div className="kicker">Activity</div>
      <h1 className="page-title">Activity Log</h1>
      <p className="page-sub">Real-time scraper runs and self-heal events</p>
      {error && <p className="err">{error}</p>}
      {!error && items.length === 0 && (
        <div className="empty">
          <Activity size={28} />
          <p>No activity yet — trigger a scrape to see logs here</p>
        </div>
      )}
      <ul className="timeline">
        {items.map((ev) => {
          const type = ev.event_type || 'scrape_run'
          return (
            <li key={`${ev.id}-${ev.occurred_at}`} className={type}>
              <span className={`pill ${type}`}>{LABELS[type] || type}</span>
              <div className="muted" style={{ fontSize: 12 }}>
                {ev.occurred_at ? new Date(ev.occurred_at).toLocaleString() : ''}
              </div>
              <div>{ev.description}</div>
              {ev.collector_id && (
                <div className="muted" style={{ fontSize: 12 }}>
                  {ev.collector_id}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </main>
  )
}
