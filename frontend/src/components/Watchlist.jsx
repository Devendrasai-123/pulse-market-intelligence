/**
 * Plain watchlist from live market_data rows.
 * Visual design is out of scope — functional data check only.
 */
export default function Watchlist({ items }) {
  if (!items?.length) {
    return (
      <section>
        <h2>Watchlist</h2>
        <p>No rows.</p>
      </section>
    )
  }

  return (
    <section>
      <h2>Watchlist ({items.length})</h2>
      <ul>
        {items.map((row) => (
          <li key={row.id}>
            {row.exchange_name} | {row.ticker_symbol} | price={row.price}{' '}
            {row.price_currency} | change={row.price_change_24h_raw ?? row.price_change_24h}{' '}
            | volume={row.volume_24h}
          </li>
        ))}
      </ul>
    </section>
  )
}
