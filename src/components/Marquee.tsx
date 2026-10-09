import { useEffect, useRef } from 'react'
import { prefersReducedMotion, scrollState } from '../lib/motion'

type Props = { items: string[]; className?: string; speed?: number; label: string }

/**
 * Faixa contínua que reage à velocidade do scroll: devagar em repouso, acelera com a rolagem,
 * inclina de leve na alta velocidade e desacelera suavemente quando o visitante para.
 */
export default function Marquee({ items, className = '', speed = 38, label }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = root.current, line = track.current
    if (!el || !line || prefersReducedMotion()) return
    let visible = false, frame = 0, x = 0, last = performance.now(), boost = 0, direction = 1, skew = 0
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const v = scrollState.smoothed
      if (Math.abs(v) > 0.4) direction = v > 0 ? 1 : -1
      boost += (Math.min(60, Math.abs(v)) * 22 - boost) * 0.08
      skew += (Math.max(-7, Math.min(7, -v * 0.35)) - skew) * 0.1
      const width = line.scrollWidth / 2
      x -= (speed + boost) * dt * direction
      if (x <= -width) x += width
      if (x > 0) x -= width
      line.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`
      frame = visible ? requestAnimationFrame(loop) : 0
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !frame) { last = performance.now(); frame = requestAnimationFrame(loop) }
    })
    observer.observe(el)
    return () => { observer.disconnect(); cancelAnimationFrame(frame) }
  }, [speed])
  const row = items.map((item, i) => <span key={i} className={i % 2 ? 'mq-outline' : ''}>{item}<i aria-hidden="true" /></span>)
  return (
    <div ref={root} className={`marquee ${className}`} role="img" aria-label={label}>
      <div ref={track} className="marquee-track" aria-hidden="true"><div>{row}</div><div>{row}</div></div>
    </div>
  )
}
