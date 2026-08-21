import { Link } from 'react-router-dom'

const STACK = [
  {
    name: 'Bright Data Scraper Studio',
    line: 'Custom collectors. AI Agent create. Heal in place on the same c_* ID.',
  },
  {
    name: 'FastAPI',
    line: 'Prices, news, insight, detect, heal, activity — one Python API.',
  },
  {
    name: 'Supabase',
    line: 'Postgres for market_data, news, and optional activity_events.',
  },
  {
    name: 'React + Vite',
    line: 'Five-page terminal: desk, logs, about, architecture, team.',
  },
  {
    name: 'CrewAI + NVIDIA NIM',
    line: 'Insight that must cite real tickers from those tables.',
  },
  {
    name: 'Cursor',
    line: 'AI-assisted build, disclosed in the README.',
  },
]

export default function Architecture() {
  return (
    <main className="page">
      <div className="kicker">System</div>
      <h1 className="page-title">From a public URL to a desk that can heal.</h1>
      <p className="page-sub" style={{ fontSize: 16, maxWidth: 640 }}>
        Bright Data fetches the page. FastAPI owns the contract. Supabase holds
        the rows. React is only the glass. NIM reads the same glass. Heal never
        forks a new collector.
      </p>

      <div className="flow">
        <div className="card lift">Studio</div>
        <span className="arrow">→</span>
        <div className="card lift">CLI run / heal</div>
        <span className="arrow">→</span>
        <div className="card lift">FastAPI</div>
        <span className="arrow">→</span>
        <div className="card lift">Supabase</div>
        <span className="arrow">→</span>
        <div className="card lift">React</div>
      </div>
      <p className="muted" style={{ marginTop: -12, marginBottom: 36 }}>
        CrewAI + NVIDIA NIM branches off FastAPI into the insight card. Self-heal
        is demonstrated on localhost (CLI + Node), not on free Render Python.
      </p>

      <h2 className="page-title" style={{ fontSize: 22 }}>
        Layers
      </h2>
      <div className="stack-grid">
        {STACK.map((s) => (
          <article className="card lift" key={s.name}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                background: '#3d8bfd',
                marginBottom: 12,
              }}
            />
            <strong>{s.name}</strong>
            <p className="muted" style={{ margin: '8px 0 0', fontSize: 14 }}>
              {s.line}
            </p>
          </article>
        ))}
      </div>

      <section className="band">
        <h2 className="page-title" style={{ fontSize: 22 }}>
          What stays stable
        </h2>
        <p className="muted" style={{ maxWidth: 720 }}>
          Collector IDs do not change when Studio heals. GET /api/prices and
          GET /api/news keep the same JSON shape. That is the point of in-place
          repair: the product does not get a new backend every time CoinGecko
          ships a class rename.
        </p>
        <Link to="/about" className="text-link" style={{ display: 'inline-block', marginTop: 12 }}>
          Read how self-heal works →
        </Link>
      </section>
    </main>
  )
}
