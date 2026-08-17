export default function InsightCard({ text }) {
  return (
    <section className="panel insight-card">
      <header className="panel__header">
        <h2>AI Insight</h2>
        <span className="badge">CrewAI · NIM</span>
      </header>
      <p className="insight-card__body">{text}</p>
      <p className="panel__hint">Placeholder copy — Day 4 wires live generation.</p>
    </section>
  )
}
