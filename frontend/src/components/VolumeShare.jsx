import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useState } from 'react'
import { formatCompact, volumeShare } from '../lib/market'
import { tooltipStyle } from './chartTheme'

export default function VolumeShare({ items }) {
  const { total, slices } = volumeShare(items, 6)
  const [active, setActive] = useState(0)
  const focus = slices[active] || slices[0]

  return (
    <section className="card chart-card">
      <div className="chart-head">
        <h2>Volume share</h2>
        <span className="chart-range is-on">24H</span>
      </div>
      {slices.length === 0 ? (
        <p className="muted">No volume to split yet.</p>
      ) : (
        <>
          <div className="ring-wrap">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="symbol"
                  innerRadius={68}
                  outerRadius={96}
                  paddingAngle={2}
                  stroke="#000"
                  strokeWidth={3}
                  onMouseEnter={(_, i) => setActive(i)}
                >
                  {slices.map((s) => (
                    <Cell
                      key={s.symbol}
                      fill={s.color}
                      opacity={s.symbol === focus?.symbol ? 1 : 0.55}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v, _, item) => [
                    `${formatCompact(v)} · ${item.payload.pct.toFixed(1)}%`,
                    item.payload.symbol,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            {focus && (
              <div className="ring-center">
                <strong className="num">{formatCompact(total)}</strong>
                <span>Tape volume</span>
              </div>
            )}
          </div>
          <ul className="share-legend">
            {slices.map((s, i) => (
              <li
                key={s.symbol}
                className={i === active ? 'is-on' : ''}
                onMouseEnter={() => setActive(i)}
              >
                <i style={{ background: s.color }} />
                <b>{s.symbol}</b>
                <span className="num">{formatCompact(s.volume)}</span>
                <em>{s.pct.toFixed(0)}%</em>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
