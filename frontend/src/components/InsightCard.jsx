import { useEffect, useState } from 'react'
import { fetchInsight } from '../api/pulse'

/**
 * Functional InsightCard — GET /api/insight (no styling).
 */
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
          setInsight('')
          setMeta(null)
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
    <section>
      <h2>AI Insight</h2>
      <p>Source: GET /api/insight — loading={String(loading)}</p>
      {error && <p>Error: {error}</p>}
      {!error && !loading && (
        <>
          <p>{insight || '(empty insight)'}</p>
          {meta && (
            <p>
              model={meta.model} prices={meta.price_row_count} news=
              {meta.news_row_count} tickers=
              {(meta.tickers_considered || []).join(', ')}
            </p>
          )}
        </>
      )}
    </section>
  )
}
