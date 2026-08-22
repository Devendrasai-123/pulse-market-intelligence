import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { deskRadar } from '../lib/market'
import { tooltipStyle } from './chartTheme'

export default function DeskRadar({ items }) {
  const data = deskRadar(items)

  return (
    <section className="card chart-card">
      <div className="chart-head">
        <h2>Desk behaviour</h2>
        <span className="chart-range is-on">LIVE</span>
      </div>
      {items.length === 0 ? (
        <p className="muted">Waiting on listings.</p>
      ) : (
        <>
          <div className="radar-bars">
            {data.map((d) => (
              <div key={d.axis}>
                <span>{d.axis}</span>
                <i>
                  <b style={{ width: `${d.value}%` }} />
                </i>
              </div>
            ))}
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: '#888', fontSize: 11 }} />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  dataKey="value"
                  stroke="#60a5fa"
                  fill="#60a5fa"
                  fillOpacity={0.22}
                  dot={{ r: 3, fill: '#60a5fa' }}
                />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  )
}
