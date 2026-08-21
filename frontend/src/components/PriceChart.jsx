import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { aggregateWatchlist, formatCompact } from '../lib/market'
import { tooltipStyle } from './chartTheme'

export default function PriceChart({ items }) {
  const data = aggregateWatchlist(items, 12).map((row) => ({
    name: row.symbol,
    volume: row.volume,
    change: row.change ?? 0,
  }))

  return (
    <section className="card chart-card chart-card-lg">
      <div className="chart-head">
        <h2>Volume × change</h2>
        <div className="chart-ranges">
          <span>1H</span>
          <span>4H</span>
          <span className="is-on">24H</span>
          <span>7D</span>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="muted">No price rows to chart yet.</p>
      ) : (
        <div className="chart-stage">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} barCategoryGap="22%">
              <defs>
                <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis yAxisId="vol" hide />
              <YAxis yAxisId="chg" orientation="right" hide />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={tooltipStyle}
                formatter={(value, key) =>
                  key === 'volume'
                    ? [formatCompact(value), 'Volume']
                    : [`${Number(value).toFixed(2)}%`, '24h']
                }
              />
              <Area
                yAxisId="vol"
                type="monotone"
                dataKey="volume"
                stroke="none"
                fill="url(#volFill)"
              />
              <Bar yAxisId="vol" dataKey="volume" fill="#3b82f6" radius={0} />
              <Line
                yAxisId="chg"
                type="monotone"
                dataKey="change"
                stroke="#f4f4f4"
                strokeWidth={2}
                dot={{ r: 3, fill: '#fff' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
