import { useEffect, useRef, useState } from 'react'

export default function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOn(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal${on ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
