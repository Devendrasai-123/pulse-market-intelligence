import { aggregateWatchlist } from '../lib/market'

export default function HeatStrip({ items }) {
  const rows = aggregateWatchlist(items, 12)

  return (
    <section className="card chart-card">
      <div className="chart-head">
        <h2>24h heat</h2>
        <span className="chart-range is-on">CHANGE</span>
      </div>
      {rows.length === 0 ? (
        <p className="muted">No tape yet.</p>
      ) : (
        <div className="heat-grid">
          {rows.map((row) => {
            const mag = Math.min(1, Math.abs(row.change || 0) / 8)
            const up = (row.change || 0) >= 0
            return (
              <div
                key={row.symbol}
                className="heat-cell"
                style={{
                  background: up
                    ? `rgba(34, 197, 94, ${0.12 + mag * 0.55})`
                    : `rgba(239, 68, 68, ${0.12 + mag * 0.55})`,
                }}
              >
                <b>{row.symbol}</b>
                <span className={up ? 'up' : 'down'}>
                  {row.change == null
                    ? '—'
                    : `${up ? '+' : ''}${row.change.toFixed(1)}%`}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
