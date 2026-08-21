import { aggregateWatchlist } from '../lib/market'

export default function GainersLosers({ items }) {
  const assets = aggregateWatchlist(items, 40).filter((a) => a.change != null)
  const sorted = [...assets].sort((a, b) => b.change - a.change)
  const gainers = sorted.filter((a) => a.change >= 0).slice(0, 3)
  const losers = sorted.filter((a) => a.change < 0).slice(-3).reverse()

  return (
    <div className="gl">
      <section className="card">
        <h2>Gainers</h2>
        <ul>
          {gainers.map((a) => (
            <li key={a.symbol}>
              <span>{a.symbol}</span>
              <span className="up">+{a.change.toFixed(2)}%</span>
            </li>
          ))}
          {gainers.length === 0 && <li className="muted">None</li>}
        </ul>
      </section>
      <section className="card">
        <h2>Losers</h2>
        <ul>
          {losers.map((a) => (
            <li key={a.symbol}>
              <span>{a.symbol}</span>
              <span className="down">{a.change.toFixed(2)}%</span>
            </li>
          ))}
          {losers.length === 0 && <li className="muted">None</li>}
        </ul>
      </section>
    </div>
  )
}
