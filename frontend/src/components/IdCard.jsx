import { useEffect, useRef, useState } from 'react'

function Barcode() {
  const bars = [2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1]
  return (
    <svg className="id-barcode" viewBox="0 0 92 28" aria-hidden="true">
      {bars.map((w, i) => {
        const x = bars.slice(0, i).reduce((a, n) => a + n + 1, 0)
        return <rect key={i} x={x} y="0" width={w} height="28" fill="currentColor" />
      })}
    </svg>
  )
}

export default function IdCard({ member, selected, onFocusMember }) {
  const stageRef = useRef(null)
  const tiltRef = useRef(null)
  const [photoOk, setPhotoOk] = useState(Boolean(member.photo))
  const reduceMotion = useRef(false)

  useEffect(() => {
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  function resetTilt() {
    const el = tiltRef.current
    if (!el) return
    el.style.transition = 'transform 420ms cubic-bezier(0.23, 1, 0.32, 1)'
    el.style.transform = 'rotateX(0deg) rotateY(0deg)'
  }

  function activate() {
    onFocusMember?.()
  }

  function onMove(e) {
    if (reduceMotion.current) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const stage = stageRef.current
    const el = tiltRef.current
    if (!stage || !el) return
    const r = stage.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    const rx = (0.5 - y) * 16
    const ry = (x - 0.5) * 20
    el.style.transition = 'transform 80ms linear'
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
  }

  return (
    <div
      className={`id-stage${selected ? ' is-selected' : ''}`}
      ref={stageRef}
      onMouseEnter={activate}
      onMouseMove={onMove}
      onMouseLeave={resetTilt}
      onFocus={activate}
    >
      <div className="id-lanyard" aria-hidden="true">
        <span className="id-strap" />
        <span className="id-clip" />
      </div>
      <article
        className="id-card"
        ref={tiltRef}
        tabIndex={0}
        aria-pressed={selected}
      >
        <header className="id-head">
          <span>PULSE</span>
          <span className="id-badge">{member.badge}</span>
          <span className="id-mark">&lt;/&gt;</span>
        </header>
        <div className="id-photo">
          {photoOk ? (
            <img
              src={member.photo}
              alt={member.name}
              onError={() => setPhotoOk(false)}
            />
          ) : (
            <div className="id-photo-fallback">{member.initials}</div>
          )}
        </div>
        <div className="id-body">
          <h2>{member.name}</h2>
          <p className="id-title">{member.title}</p>
          <p className="id-sub">{member.subtitle}</p>
        </div>
        <footer className="id-foot">
          <span>{member.code}</span>
          <Barcode />
        </footer>
      </article>
    </div>
  )
}
