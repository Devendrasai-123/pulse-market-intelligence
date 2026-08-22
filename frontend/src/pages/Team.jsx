import { useState } from 'react'
import IdCard from '../components/IdCard'

const TEAM = [
  {
    name: 'Devendra',
    headline: 'Backend Lead',
    badge: 'BACKEND',
    title: 'BACKEND',
    subtitle: 'API · INGEST · SELF-HEAL',
    code: 'PUL-001',
    initials: 'DE',
    photo: '/team/devendra.png?v=2',
    bio: 'Devendra is the backend architect behind Scrape-Verse, having engineered scraping pipelines that process 10,000+ pages/hour without breaking a sweat. With deep expertise in distributed systems and API design, he has built infrastructure that laughs in the face of rate limits. Known across the team for writing backend code that “just works” — the first time.',
    tags: ['SYSTEM ARCHITECT', 'API DESIGN', 'PERFORMANCE'],
  },
  {
    name: 'Hardeep',
    headline: 'UI/UX Design Lead',
    badge: 'UI/UX DESIGN',
    title: 'UI/UX DESIGN',
    subtitle: 'LAYOUT · MOTION · TERMINAL',
    code: 'PUL-002',
    initials: 'HA',
    photo: '/team/harideep.png',
    bio: 'Hardeep is the design force behind Scrape-Verse’s interface, turning raw scraped data into something people actually enjoy looking at. With an eye for micro-interactions and motion design, Hardeep has crafted a UI so smooth that testers forget they’re staring at a data tool. 100+ component iterations later, every pixel earns its place.',
    tags: ['UI/UX', 'MOTION DESIGN', 'DESIGN SYSTEMS'],
  },
  {
    name: 'Poornesh',
    headline: 'Team Lead & AI Infra Structure',
    badge: 'TEAM LEAD · AI INFRA',
    title: 'TEAM LEAD, PULSE',
    subtitle: 'AI INFRA STRUCTURE',
    code: 'PUL-003',
    initials: 'PO',
    photo: '/team/poornesh.png',
    bio: 'Poornesh leads Scrape-Verse from the front, architecting the AI infrastructure that turns scraped chaos into structured intelligence. A natural at cross-functional coordination, Poornesh keeps four moving parts shipping on one unified roadmap — while personally owning the pipeline that feeds scraped data into the AI layer.',
    tags: ['TEAM LEAD', 'AI INFRASTRUCTURE', 'SYSTEM DESIGN'],
  },
  {
    name: 'Ashish',
    headline: 'DBMS Lead',
    badge: 'DBMS',
    title: 'DBMS',
    subtitle: 'SUPABASE · SCHEMA · STORAGE',
    code: 'PUL-004',
    initials: 'AS',
    photo: '/team/Ashish.png',
    bio: 'Ashish is the data backbone of Scrape-Verse, designing a database layer built to handle millions of scraped records without breaking a sweat. Obsessed with query optimization and clean schema design, Ashish makes sure every byte of scraped data is fast to store and even faster to retrieve.',
    tags: ['DATABASE DESIGN', 'QUERY OPTIMIZATION', 'DATA INTEGRITY'],
  },
]

export default function Team() {
  const [active, setActive] = useState(TEAM[0])

  return (
    <main className="page">
      <div className="kicker">Into the Scrape-Verse · Aug 2026</div>
      <h1 className="page-title">The Team</h1>
      <p className="page-sub">
        Hover a badge. The brief below follows whoever you are looking at.
      </p>
      <div className="team-grid">
        {TEAM.map((member) => (
          <IdCard
            key={member.code}
            member={member}
            selected={active.code === member.code}
            onFocusMember={() => setActive(member)}
          />
        ))}
      </div>
      <section className="bio-panel" aria-live="polite">
        <div className="bio-panel-inner" key={active.code}>
          <div className="kicker">Selected</div>
          <h2 className="bio-name">
            {active.name}
            <span> — {active.headline}</span>
          </h2>
          <p className="bio-copy">{active.bio}</p>
          <ul className="bio-tags">
            {active.tags.map((tag, i) => (
              <li key={tag} style={{ animationDelay: `${80 + i * 50}ms` }}>
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
