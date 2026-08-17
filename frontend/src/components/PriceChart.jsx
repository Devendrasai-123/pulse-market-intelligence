import { useState } from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const RANGES = ['1D', '1W', '1M']

export default function PriceChart({ series }) {
  const [range, setRange] = useState('1D')

  return (
    <section className="panel price-chart">
      <header className="panel__header">
        <h2>BTC / USD</h2>
        <div className="range-toggles" role="group" aria-label="Chart range">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              className={range === r ? 'active' : ''}
              onClick={() => setRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </header>
      <div className="price-chart__canvas">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={series}>
            <CartesianGrid stroke="var(--grid)" vertical={false} />
            <XAxis dataKey="time" stroke="var(--muted)" tickLine={false} />
            <YAxis
              yAxisId="price"
              orientation="right"
              stroke="var(--muted)"
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <YAxis yAxisId="vol" hide domain={[0, 'dataMax']} />
            <Tooltip
              contentStyle={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: 4,
              }}
            />
            <Bar
              yAxisId="vol"
              dataKey="volume"
              fill="var(--volume)"
              opacity={0.35}
              barSize={28}
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="panel__hint">Dummy series — range toggle UI only until history API exists.</p>
    </section>
  )
}
