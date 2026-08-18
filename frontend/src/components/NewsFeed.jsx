import { useEffect, useState } from 'react'
import { fetchNews } from '../api/pulse'

/**
 * Functional NewsFeed — GET /api/news (no styling).
 * Shows empty list until news rows are ingested into Supabase.
 */
export default function NewsFeed() {
  const [items, setItems] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchNews({ limit: 20 })
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
    <section>
      <h2>NewsFeed</h2>
      <p>
        Source: GET /api/news — count={count} loading={String(loading)}
      </p>
      {error && <p>Error: {error}</p>}
      {!error && !loading && count === 0 && (
        <p>
          No news rows in Supabase yet. Endpoint is wired; ingest news scrape
          when ready.
        </p>
      )}
      <ul>
        {items.map((item) => (
          <li key={item.id || item.url || item.headline}>
            {item.headline || '(no headline)'} | {item.source || '?'} |{' '}
            {item.published_at || ''} |{' '}
            {item.url ? (
              <a href={item.url} target="_blank" rel="noreferrer">
                {item.url}
              </a>
            ) : (
              '(no url)'
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
