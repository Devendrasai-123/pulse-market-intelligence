export default function NewsFeed({ items }) {
  return (
    <section className="panel news-feed">
      <header className="panel__header">
        <h2>News</h2>
      </header>
      <ul className="news-feed__list">
        {items.map((item) => (
          <li key={item.url + item.headline}>
            <a href={item.url} target="_blank" rel="noreferrer">
              {item.headline}
            </a>
            <div className="news-feed__meta">
              <span>{item.source}</span>
              <span>{new Date(item.published_at).toLocaleString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
