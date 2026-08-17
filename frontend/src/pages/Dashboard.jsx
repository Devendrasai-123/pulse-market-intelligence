import Watchlist from '../components/Watchlist'
import PriceChart from '../components/PriceChart'
import NewsFeed from '../components/NewsFeed'
import InsightCard from '../components/InsightCard'
import GainersLosers from '../components/GainersLosers'
import { WATCHLIST, CHART_SERIES, NEWS, INSIGHT } from '../data/dummy'

/**
 * Pulse terminal shell — layout only.
 * Self-heal floating button lands on Day 5.
 */
export default function Dashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard__top">
        <div className="brand">
          <span className="brand__mark">PULSE</span>
          <span className="brand__sub">Market intelligence</span>
        </div>
        <div className="dashboard__status">
          <span className="status-dot" aria-hidden />
          scraper: idle · dummy data
        </div>
      </header>

      <Watchlist assets={WATCHLIST} />

      <div className="dashboard__mid">
        <PriceChart series={CHART_SERIES} />
        <aside className="dashboard__side">
          <InsightCard text={INSIGHT} />
          <NewsFeed items={NEWS} />
        </aside>
      </div>

      <GainersLosers assets={WATCHLIST} />
    </div>
  )
}
