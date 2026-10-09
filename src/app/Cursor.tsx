import { useEffect, useRef } from 'react'
import { sound } from '../lib/sound'

const labels: Record<string, string> = {
  view: 'View →',
  project: 'View project →',
  drag: 'Drag ↔',
  explore: 'Explore +',
  play: 'Play ▶',
  open: 'Open ↗',
}

/**
 * Cursor contextual (apenas desktop com mouse). O estado vem de [data-cursor] no elemento sob o
 * ponteiro; [data-magnetic] contrai o cursor e atrai o elemento.
 */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine) and (hover: hover)').matches) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const html = document.documentElement
    html.classList.add('has-cursor')
    const el = root.current!
    let x = -100, y = -100, cx = -100, cy = -100, frame = 0, mode = ''
    let magnet: HTMLElement | null = null
    const setMode = (next: string) => {
      if (next === mode) return
      mode = next
      el.dataset.mode = next
      if (label.current && labels[next]) label.current.textContent = labels[next]
    }
    const loop = () => {
      cx += (x - cx) * (reduce ? 1 : 0.22)
      cy += (y - cy) * (reduce ? 1 : 0.22)
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      frame = Math.abs(x - cx) + Math.abs(y - cy) > 0.1 ? requestAnimationFrame(loop) : 0
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      x = event.clientX; y = event.clientY
      if (!frame) frame = requestAnimationFrame(loop)
      if (magnet) {
        const rect = magnet.getBoundingClientRect()
        const strength = Number(magnet.dataset.magnetic || 0.25) || 0.25
        magnet.style.translate = `${(x - rect.left - rect.width / 2) * strength}px ${(y - rect.top - rect.height / 2) * strength}px`
      }
    }
    const over = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null
      const contextual = target?.closest<HTMLElement>('[data-cursor]')
      const magnetic = target?.closest<HTMLElement>('[data-magnetic]') ?? null
      if (magnetic !== magnet) {
        if (magnet) magnet.style.translate = ''
        magnet = magnetic
        if (magnet) sound.click()
      }
      setMode(contextual?.dataset.cursor || (magnet ? 'magnet' : ''))
    }
    const down = () => el.classList.add('is-down')
    const up = () => el.classList.remove('is-down')
    const leave = () => { x = -100; y = -100; if (!frame) frame = requestAnimationFrame(loop) }
    document.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerover', over, { passive: true })
    document.addEventListener('pointerdown', down, { passive: true })
    document.addEventListener('pointerup', up, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      html.classList.remove('has-cursor')
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointerdown', down)
      document.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('pointerleave', leave)
      if (magnet) magnet.style.translate = ''
    }
  }, [])
  return (
    <div ref={root} className="cursor" aria-hidden="true">
      <span className="cursor-ring" />
      <span ref={label} className="cursor-label" />
    </div>
  )
}
