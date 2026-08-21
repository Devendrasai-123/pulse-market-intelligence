import { useEffect, useState } from 'react'
import { fetchNews } from '../api/pulse'

export default function NewsFeed() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await fetchNews({ limit: 12 })
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

  return (
    <section className="card">
      <h2>News</h2>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="err">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="muted">No news rows in Supabase yet.</p>
      )}
      {items.map((item) => (
        <article className="news-item" key={item.id || item.url}>
          <a href={item.url} target="_blank" rel="noreferrer">
            {item.headline}
          </a>
          <div className="muted" style={{ fontSize: 12 }}>
            {item.source} · {item.published_at}
          </div>
        </article>
      ))}
    </section>
  )
}
