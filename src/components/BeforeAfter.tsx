import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import type { ProjectImage } from '../data/projects'
import { prefersReducedMotion } from '../lib/motion'
import { sound } from '../lib/sound'
import Media from './Media'

type Props = { before: ProjectImage; after: ProjectImage; className?: string; caption?: string }

/**
 * Antes / depois: linha fina, alça pequena, rótulos que acompanham a divisão.
 * Mouse e toque (arrastar), teclado (setas), snap suave em 50% com um pequeno sinal visual.
 */
export default function BeforeAfter({ before, after, className = '', caption = 'Simulação visual · imagens conceituais' }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(50)
  const [centered, setCentered] = useState(false)
  const dragging = useRef(false)
  const value = useRef(50)
  const anim = useRef(0)

  const apply = (next: number) => {
    const clamped = Math.min(100, Math.max(0, next))
    const wasCenter = Math.abs(value.current - 50) < 0.5
    value.current = clamped
    setPosition(clamped)
    const isCenter = Math.abs(clamped - 50) < 0.5
    if (isCenter && !wasCenter) { setCentered(true); sound.click(); window.setTimeout(() => setCentered(false), 700) }
  }
  const animateTo = (target: number, duration = 650) => {
    cancelAnimationFrame(anim.current)
    if (prefersReducedMotion()) { apply(target); return }
    const from = value.current, start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 4)
      apply(from + (target - from) * eased)
      if (t < 1) anim.current = requestAnimationFrame(step)
    }
    anim.current = requestAnimationFrame(step)
  }

  // Ao entrar na tela, a divisão percorre a imagem e assenta no meio (mostra que é interativo).
  useEffect(() => {
    const el = root.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      if (prefersReducedMotion()) return
      apply(82)
      window.setTimeout(() => animateTo(50, 1400), 250)
    }, { threshold: 0.45 })
    observer.observe(el)
    return () => { observer.disconnect(); cancelAnimationFrame(anim.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = root.current!.getBoundingClientRect()
    return ((event.clientX - rect.left) / rect.width) * 100
  }
  const down = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    cancelAnimationFrame(anim.current)
    event.currentTarget.setPointerCapture(event.pointerId)
    apply(fromPointer(event))
  }
  const move = (event: PointerEvent<HTMLDivElement>) => { if (dragging.current) apply(fromPointer(event)) }
  const up = () => {
    if (!dragging.current) return
    dragging.current = false
    if (Math.abs(value.current - 50) < 4.5) animateTo(50, 380)
  }
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, number> = { ArrowLeft: -2, ArrowRight: 2, ArrowDown: -2, ArrowUp: 2, PageDown: -10, PageUp: 10 }
    if (event.key === 'Home') { event.preventDefault(); animateTo(0, 300) }
    else if (event.key === 'End') { event.preventDefault(); animateTo(100, 300) }
    else if (map[event.key]) { event.preventDefault(); apply(value.current + map[event.key]) }
  }

  return (
    <figure className={`ba ${className}`}>
      <div
        ref={root}
        className={`ba-frame${centered ? ' is-center' : ''}`}
        style={{ '--p': `${position}%` } as CSSProperties}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        data-cursor="drag"
      >
        <Media id={before.media} alt={before.alt} className="ba-img ba-before" sizes="(max-width: 959px) 100vw, 92vw" label={false} />
        <Media id={after.media} alt={after.alt} className="ba-img ba-after" sizes="(max-width: 959px) 100vw, 92vw" label={false} />
        <div className="ba-tags" aria-hidden="true">
          <span className="ba-tag ba-tag-before" style={{ opacity: Math.min(1, position / 18) }}>Antes</span>
          <span className="ba-tag ba-tag-after" style={{ opacity: Math.min(1, (100 - position) / 18) }}>Depois</span>
        </div>
        <div className="ba-divider" aria-hidden="true"><i /></div>
        <div
          className="ba-handle"
          role="slider"
          tabIndex={0}
          aria-label="Comparar antes e depois"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${Math.round(100 - position)}% da imagem depois`}
          onKeyDown={key}
        >
          <span aria-hidden="true">‹</span><b aria-hidden="true">50/50</b><span aria-hidden="true">›</span>
        </div>
      </div>
      <figcaption className="ba-caption micro"><span>Arraste a linha</span><span>{caption}</span></figcaption>
    </figure>
  )
}
