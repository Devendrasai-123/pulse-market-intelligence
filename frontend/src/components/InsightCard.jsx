import { useEffect, useState } from 'react'
import { fetchInsight } from '../api/pulse'

export default function InsightCard() {
  const [insight, setInsight] = useState('')
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchInsight()
        if (!cancelled) {
          setInsight(data.insight || '')
          setMeta(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
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
    <section className="card insight">
      <h2>AI insight</h2>
      {loading && <p className="muted">Asking NVIDIA NIM…</p>}
      {error && <p className="err">{error}</p>}
      {!loading && !error && <p>{insight || 'No insight yet.'}</p>}
      {meta && !loading && (
        <p className="muted" style={{ marginTop: 12, fontSize: 12 }}>
          {meta.model} · {meta.price_row_count} prices · {meta.news_row_count} headlines
        </p>
      )}
    </section>
  )
}
