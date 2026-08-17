import { LineChart, Line, ResponsiveContainer } from 'recharts'

function formatPrice(n) {
  if (n >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  return `$${n.toFixed(n < 1 ? 4 : 2)}`
}

export default function Watchlist({ assets }) {
  return (
    <section className="panel watchlist">
      <header className="panel__header">
        <h2>Watchlist</h2>
      </header>
      <div className="watchlist__grid">
        {assets.map((asset) => {
          const up = asset.percent_change_24h >= 0
          const sparkData = asset.sparkline.map((v, i) => ({ i, v }))
          return (
            <article key={asset.symbol} className="asset-card">
              <div className="asset-card__top">
                <div>
                  <div className="asset-card__symbol">{asset.symbol}</div>
                  <div className="asset-card__name">{asset.asset_name}</div>
                </div>
                <div className={`asset-card__chg ${up ? 'up' : 'down'}`}>
                  {up ? '+' : ''}
                  {asset.percent_change_24h.toFixed(2)}%
                </div>
              </div>
              <div className="asset-card__price">{formatPrice(asset.price)}</div>
              <div className="asset-card__spark">
                <ResponsiveContainer width="100%" height={36}>
                  <LineChart data={sparkData}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={up ? 'var(--gain)' : 'var(--loss)'}
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
