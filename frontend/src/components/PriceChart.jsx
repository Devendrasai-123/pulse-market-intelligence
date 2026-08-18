/**
 * Temporary text stand-in for a price chart — same /api/prices payload.
 * Charts/UI come later from the design pass.
 */
export default function PriceChart({ items }) {
  const sample = (items || []).slice(0, 20)

  return (
    <section>
      <h2>PriceChart (raw sample)</h2>
      {sample.length === 0 ? (
        <p>No price rows to chart yet.</p>
      ) : (
        <ul>
          {sample.map((row) => (
            <li key={row.id}>
              {row.ticker_symbol} @ {row.exchange_name}: {row.price} (
              {row.price_currency}) vol={row.volume_24h}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
