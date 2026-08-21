import { aggregateWatchlist, formatPrice } from '../lib/market'

export default function Watchlist({ items }) {
  const rows = aggregateWatchlist(items, 10)

  return (
    <section className="card">
      <h2>Watchlist</h2>
      {rows.length === 0 ? (
        <p className="muted">No price rows yet.</p>
      ) : (
        rows.map((row) => {
          const up = row.change != null && row.change >= 0
          const width = Math.min(100, Math.abs(row.change || 0) * 18)
          return (
            <div className="watch-item" key={row.symbol}>
              <div>
                <span className="ticker">{row.symbol}</span>
                <span className="exch">{row.exchange}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="num">
                  {formatPrice(row.price)}
                </div>
                <div className={`num ${row.change == null ? 'muted' : up ? 'up' : 'down'}`}>
                  {row.change == null
                    ? '—'
                    : `${up ? '+' : ''}${row.change.toFixed(2)}%`}
                </div>
              </div>
              <div className="chgbar">
                <span
                  style={{
                    width: `${width}%`,
                    background: up ? 'var(--green)' : 'var(--red)',
                  }}
                />
              </div>
            </div>
          )
        })
      )}
    </section>
  )
}
