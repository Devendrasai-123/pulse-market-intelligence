import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ChartLine,
  CheckCircle,
  Newspaper,
  RefreshCw,
  Shield,
  Sparkles,
  Wrench,
} from 'lucide-react'

import Reveal from '../components/Reveal'

const STEPS = [
  {
    n: '01',
    title: 'The page shifts',
    body: 'A class is renamed or the layout moves. The data is still there — the old selectors are not.',
    Icon: RefreshCw,
  },
  {
    n: '02',
    title: 'The scraper notices',
    body: 'Extraction comes back empty. Pulse sees that from a real Bright Data run, not a fake timeout.',
    Icon: AlertCircle,
  },
  {
    n: '03',
    title: 'Studio repairs the same collector',
    body: 'Heal rewrites extraction in place. Same Collector ID. No new scraper, no API rewrite.',
    Icon: Wrench,
  },
  {
    n: '04',
    title: 'The desk keeps moving',
    body: 'FastAPI and Supabase keep the same contract. Prices and headlines land again.',
    Icon: CheckCircle,
  },
]

const USES = [
  {
    Icon: ChartLine,
    title: 'A desk, not a dump',
    body: 'Public CoinGecko listings become price, change, volume, and venue — in Postgres, ready to chart.',
  },
  {
    Icon: Newspaper,
    title: 'News next to the tape',
    body: 'CoinDesk headlines sit beside the numbers so the brief can cite a real story.',
  },
  {
    Icon: Shield,
    title: 'Heal when the DOM moves',
    body: 'Detect with a live run. Repair with the Bright Data CLI. “Repaired” only when Studio says done.',
  },
]

const EXTRACT = [
  {
    Icon: Sparkles,
    title: 'Prices',
    body: 'Exchange, ticker, price, 24h change, volume, product URL — flattened into market_data.',
  },
  {
    Icon: Newspaper,
    title: 'News',
    body: 'Headline, source, date, URL. Rate-limit noise is dropped. Only real articles ingest.',
  },
  {
    Icon: ChartLine,
    title: 'Insight',
    body: 'A short NIM brief that has to name coins from those tables — not a generic market blurb.',
  },
]

const CREATE_CMD = `brightdata scraper create "https://www.coingecko.com/en/coins" "Extract the coin name, ticker symbol, current price, 24 hour percentage change, and 24 hour trading volume for each cryptocurrency listed in the main table on this page."`

const FAQS = [
  {
    q: 'What does Pulse actually scrape?',
    a: 'Two public pages only: CoinGecko markets and the CoinDesk homepage. No logins, paywalls, or government sites. Custom Scraper Studio collectors — not Bright Data’s pre-built library alone.',
  },
  {
    q: 'Is self-heal real, or a spinner?',
    a: 'Detect runs brightdata scraper run and inspects JSON. Trigger shells brightdata scraper heal on collector c_mswww62b2iig1j1hcj. The UI shows repaired only when Bright Data returns status done. We record that on localhost because Render’s free Python image usually has no Node/CLI.',
  },
  {
    q: 'Can I paste a URL to scrape a new site?',
    a: 'No. Targets are the collectors we already created. A new site means a new Studio scraper, then ingest — not a search box on the dashboard.',
  },
  {
    q: 'Where does the AI insight come from?',
    a: 'CrewAI + NVIDIA NIM reads the same Supabase rows as GET /api/prices and GET /api/news, then writes a short brief that names real tickers.',
  },
]

function FaqList() {
  const [open, setOpen] = useState(0)

  return (
    <div className="faq">
      {FAQS.map((item, i) => {
        const isOpen = open === i
        return (
          <div className={`faq-item${isOpen ? ' is-open' : ''}`} key={item.q}>
            <button
              type="button"
              className="faq-q"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              <span>{item.q}</span>
              <i aria-hidden="true" />
            </button>
            <div className="faq-a">
              <div className="faq-a-inner">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function About() {
  return (
    <main className="page about-page">
      <Reveal>
        <div className="kicker">Bright Data · Scraper Studio</div>
        <h1 className="page-title">
          The page will change. The desk should not go quiet.
        </h1>
        <p className="page-sub about-lede">
          Pulse is a market terminal on two public scrapes — CoinGecko prices and CoinDesk
          headlines. We store them, NIM explains them, and when a layout shift breaks
          extraction, Studio heals the same collector. You own the scraper. The AI repairs
          it.
        </p>
        <div className="hero-actions">
          <Link to="/" className="cta-btn">
            Open the desk
          </Link>
          <Link to="/logs" className="cta-btn ghost">
            See live activity
          </Link>
        </div>
      </Reveal>

      <div className="metrics about-metrics">
        {[
          ['2', 'Studio collectors'],
          ['Public', 'Pages only — no login'],
          ['Same c_*', 'Heal does not mint a new ID'],
          ['NIM', 'Insight from real rows'],
        ].map(([value, label], i) => (
          <Reveal key={label} className="metric" delay={i * 70}>
            <label>{label}</label>
            <strong>{value}</strong>
          </Reveal>
        ))}
      </div>

      <section className="band">
        <Reveal>
          <h2 className="sec-title">Built for a desk that has to stay on</h2>
          <p className="sec-sub">
            Not a generic scrape API. One pipeline you can click: tape, news, brief, and a
            heal you can watch.
          </p>
        </Reveal>
        <div className="usecases">
          {USES.map((u, i) => (
            <Reveal key={u.title} delay={i * 80}>
              <article className="card lift">
                <u.Icon size={18} />
                <h3>{u.title}</h3>
                <p>{u.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band">
        <Reveal>
          <h2 className="sec-title">How Pulse stays alive</h2>
          <p className="sec-sub">
            Frozen CSS paths fail silently. We describe fields in language, then let
            Studio find them again after the DOM moves.
          </p>
        </Reveal>
        <div className="timeline">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90} className="timeline-item">
              <s.Icon size={16} />
              <span className="step-num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band">
        <Reveal>
          <h2 className="sec-title">Proof, not a claim</h2>
          <p className="sec-sub">
            Same Collector IDs before and after heal. Nothing downstream is rewritten.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <article className="card proof-card">
            <div className="ids">
              <div className="id-row">
                <span>Prices</span>
                <code>c_mswww62b2iig1j1hcj</code>
              </div>
              <div className="id-row">
                <span>News</span>
                <code>c_msx6tyya20kx5jxsy1</code>
              </div>
            </div>
            <Link to="/logs" className="text-link">
              See it happen live →
            </Link>
          </article>
        </Reveal>
      </section>

      <section className="band">
        <Reveal>
          <h2 className="sec-title">How the scraper was created</h2>
          <p className="sec-sub">Bright Data CLI · AI Agent mode · public CoinGecko</p>
        </Reveal>
        <Reveal delay={60}>
          <pre className="code-shell">
            <code>{CREATE_CMD}</code>
          </pre>
        </Reveal>
      </section>

      <section className="band">
        <Reveal>
          <h2 className="sec-title">What we extract</h2>
        </Reveal>
        <div className="usecases">
          {EXTRACT.map((u, i) => (
            <Reveal key={u.title} delay={i * 80}>
              <article className="card lift">
                <u.Icon size={16} />
                <h3>{u.title}</h3>
                <p>{u.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="band why">
        <Reveal>
          <h2 className="sec-title">Why this matters</h2>
          <p className="sec-sub why-copy">
            Most scrape tutorials stop when the first JSON comes back. The real failure is
            a week later, when the site ships a redesign and the pipeline returns empty
            with no alarm. Pulse makes that repair visible: detect, heal, and only then
            call it done.
          </p>
        </Reveal>
      </section>

      <section className="band">
        <Reveal>
          <h2 className="sec-title">Questions judges actually ask</h2>
        </Reveal>
        <Reveal delay={80}>
          <FaqList />
        </Reveal>
      </section>

      <Reveal>
        <section className="card cta">
          <p className="kicker" style={{ justifyContent: 'center' }}>
            Demo on the dashboard
          </p>
          <Link to="/" className="cta-btn">
            Trigger a Self-Heal →
          </Link>
          <a
            className="cta-link"
            href="https://github.com/Devendrasai-123/pulse-market-intelligence"
            target="_blank"
            rel="noreferrer"
          >
            View the GitHub repo
          </a>
        </section>
      </Reveal>
    </main>
  )
}
