import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Toaster } from 'sonner'
import { Drawer } from 'vaul'

import { API_BASE } from '../api/client'
import { formatClock } from '../lib/market'

const REPO = 'https://github.com/Devendrasai-123/pulse-market-intelligence'

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/logs', label: 'Logs' },
  { to: '/about', label: 'About' },
  { to: '/architecture', label: 'Architecture' },
  { to: '/team', label: 'Team' },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const [clock, setClock] = useState(formatClock())
  const [live, setLive] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setClock(formatClock()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function ping() {
      try {
        const res = await fetch(`${API_BASE}/health`)
        if (!cancelled) setLive(res.ok)
      } catch {
        if (!cancelled) setLive(false)
      }
    }
    ping()
    const t = setInterval(ping, 30000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [])

  return (
    <div className="shell">
      <Toaster
        theme="dark"
        richColors
        position="top-center"
        closeButton
        toastOptions={{
          style: {
            background: '#10121a',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        }}
      />
      <header className="topnav">
        <NavLink to="/" className="wordmark">
          <img src="/logo.png" alt="" />
          Pulse
        </NavLink>
        <nav className="nav-links">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-end">
          <a className="github-btn" href={REPO} target="_blank" rel="noreferrer">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 3.54c.68 0 1.36.09 2 .26 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
            GitHub
          </a>
          <div className="nav-status">
            <span className={live ? 'status-dot' : 'status-dot off'} />
            <span>{live ? 'LIVE' : 'OFFLINE'}</span>
            <span>{clock}</span>
          </div>
          <Drawer.Root open={open} onOpenChange={setOpen}>
            <Drawer.Trigger asChild>
              <button type="button" className="burger" aria-label="Menu">
                <Menu size={18} />
              </button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="vaul-overlay" />
              <Drawer.Content className="vaul-content">
                <div className="vaul-handle" />
                <Drawer.Title className="vaul-title">Pulse</Drawer.Title>
                <nav className="vaul-nav">
                  {LINKS.map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      end={l.end}
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </NavLink>
                  ))}
                  <a href={REPO} target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                </nav>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
