import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/motion'

/**
 * Grade de projeto: pontos técnicos que se deslocam levemente em direção ao cursor (ou ao toque).
 * Canvas único, só desenha quando visível e enquanto há movimento.
 */
export default function MagneticGrid({ spacing = 28, radius = 170, className = '' }: { spacing?: number; radius?: number; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const el = canvas.current
    const host = el?.parentElement
    if (!el || !host) return
    const ctx = el.getContext('2d')
    if (!ctx) return
    const reduce = prefersReducedMotion()
    let w = 0, h = 0, dpr = 1, points: Float32Array = new Float32Array(0)
    let px = -9999, py = -9999, active = false, visible = false, frame = 0
    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = host.getBoundingClientRect()
      w = rect.width; h = rect.height
      el.width = Math.round(w * dpr); el.height = Math.round(h * dpr)
      const cols = Math.ceil(w / spacing) + 1, rows = Math.ceil(h / spacing) + 1
      points = new Float32Array(cols * rows * 4)
      let i = 0
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { points[i++] = c * spacing + (r % 2 ? spacing / 2 : 0); points[i++] = r * spacing; points[i++] = 0; points[i++] = 0 }
      draw()
    }
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      let moving = false
      for (let i = 0; i < points.length; i += 4) {
        const bx = points[i], by = points[i + 1]
        const dx = px - bx, dy = py - by
        const d = Math.hypot(dx, dy)
        let tx = 0, ty = 0, glow = 0
        if (d < radius && !reduce) { const f = Math.pow(1 - d / radius, 2); tx = dx * f * 0.22; ty = dy * f * 0.22; glow = f }
        points[i + 2] += (tx - points[i + 2]) * 0.14
        points[i + 3] += (ty - points[i + 3]) * 0.14
        if (Math.abs(tx - points[i + 2]) + Math.abs(ty - points[i + 3]) > 0.05) moving = true
        const x = bx + points[i + 2], y = by + points[i + 3]
        ctx.fillStyle = glow > 0.05 ? `rgba(169, 207, 70, ${0.25 + glow * 0.65})` : 'rgba(236, 235, 230, 0.16)'
        const s = 1.2 + glow * 1.4
        ctx.fillRect(x - s / 2, y - s / 2, s, s)
      }
      return moving
    }
    const loop = () => { const moving = draw(); frame = visible && (moving || active) ? requestAnimationFrame(loop) : 0 }
    const kick = () => { if (!frame && visible) frame = requestAnimationFrame(loop) }
    const move = (event: PointerEvent) => { const rect = host.getBoundingClientRect(); px = event.clientX - rect.left; py = event.clientY - rect.top; active = true; kick() }
    const leave = () => { active = false; px = -9999; py = -9999; kick() }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) build() })
    observer.observe(host)
    const resize = new ResizeObserver(build)
    resize.observe(host)
    host.addEventListener('pointermove', move, { passive: true })
    host.addEventListener('pointerleave', leave)
    return () => { cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect(); host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave) }
  }, [spacing, radius])
  return <canvas ref={canvas} className={`magnetic-grid ${className}`} aria-hidden="true" />
}
