export default function GainersLosers({ assets }) {
  const sorted = [...assets].sort(
    (a, b) => b.percent_change_24h - a.percent_change_24h,
  )
  const gainers = sorted.filter((a) => a.percent_change_24h >= 0).slice(0, 3)
  const losers = sorted
    .filter((a) => a.percent_change_24h < 0)
    .slice(-3)
    .reverse()

  return (
    <section className="panel gainers-losers">
      <div className="gl__col">
        <header className="panel__header">
          <h2>Gainers</h2>
        </header>
        <ul>
          {gainers.map((a) => (
            <li key={a.symbol}>
              <span>{a.symbol}</span>
              <span className="up">+{a.percent_change_24h.toFixed(2)}%</span>
            </li>
          ))}
          {gainers.length === 0 && <li className="empty">None</li>}
        </ul>
      </div>
      <div className="gl__col">
        <header className="panel__header">
          <h2>Losers</h2>
        </header>
        <ul>
          {losers.map((a) => (
            <li key={a.symbol}>
              <span>{a.symbol}</span>
              <span className="down">{a.percent_change_24h.toFixed(2)}%</span>
            </li>
          ))}
          {losers.length === 0 && <li className="empty">None</li>}
        </ul>
      </div>
    </section>
  )
}
