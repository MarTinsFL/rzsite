import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { glyphs, glyphViewBox } from '../../lib/glyphs'
import { sound } from '../../lib/sound'

const pieces = ['R', 'barR', 'Z', 'barZ'] as const
const depth = [6, 5, 4, 3, 2, 1]

/**
 * LIGHT / ON — o cursor vira uma fonte de luz. Perto da peça, o LED começa a despertar;
 * no clique (ou toque), o letreiro acende por inteiro e a luz do ambiente muda.
 */
export default function LightOn() {
  const root = useRef<HTMLElement>(null)
  const sign = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = root.current, target = sign.current
    if (!el || !target) return
    let frame = 0, x = 0.5, y = 0.42, tx = 0.5, ty = 0.42
    const paint = () => {
      x += (tx - x) * 0.16; y += (ty - y) * 0.16
      const rect = el.getBoundingClientRect(), s = target.getBoundingClientRect()
      const cx = (s.left + s.width / 2 - rect.left) / rect.width, cy = (s.top + s.height / 2 - rect.top) / rect.height
      const d = Math.hypot((x - cx) * rect.width, (y - cy) * rect.height) / Math.max(rect.width, rect.height)
      el.style.setProperty('--lx', `${(x * 100).toFixed(2)}%`)
      el.style.setProperty('--ly', `${(y * 100).toFixed(2)}%`)
      el.style.setProperty('--near', Math.max(0, 1 - d / 0.42).toFixed(3))
      // reflexo nas faces: posição da luz em coordenadas da peça
      const gx = ((x * rect.width + rect.left - s.left) / s.width) * glyphViewBox.width
      const gy = ((y * rect.height + rect.top - s.top) / s.height) * glyphViewBox.height
      target.style.setProperty('--gx', gx.toFixed(0))
      target.querySelector('#lo-spec')?.setAttribute('cx', gx.toFixed(0))
      target.querySelector('#lo-spec')?.setAttribute('cy', gy.toFixed(0))
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.0008 ? requestAnimationFrame(paint) : 0
    }
    const move = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      tx = (event.clientX - rect.left) / rect.width
      ty = (event.clientY - rect.top) / rect.height
      if (!frame) frame = requestAnimationFrame(paint)
    }
    el.addEventListener('pointermove', move, { passive: true })
    el.addEventListener('pointerdown', move, { passive: true })
    paint()
    return () => { cancelAnimationFrame(frame); el.removeEventListener('pointermove', move); el.removeEventListener('pointerdown', move) }
  }, [])

  const toggle = () => {
    const next = !on
    setOn(next)
    if (next) sound.lightOn(); else sound.click()
  }

  return (
    <section ref={root} className={`lighton${on ? ' is-on' : ''}`} data-nav-theme="dark" data-cursor="light" aria-labelledby="lighton-title" style={{ '--near': 0 } as CSSProperties}>
      <div className="lo-wall" aria-hidden="true" />
      <div className="lo-ambient" aria-hidden="true" />
      <div className="lo-torch" aria-hidden="true" />
      <header className="lo-head">
        <p className="micro"><span className="index">09</span> Interativo</p>
        <h2 id="lighton-title" className="display lo-title">Light <span className="lo-slash">/</span> <span className="lo-state">{on ? 'On' : 'Off'}</span></h2>
      </header>
      <div ref={sign} className="lo-sign" onClick={toggle} aria-hidden="true">
        <svg viewBox={`0 0 ${glyphViewBox.width} ${glyphViewBox.height}`} className="lo-halo"><g>{pieces.map(p => <path key={p} d={glyphs[p]} className={`lo-${p}`} />)}</g></svg>
        {depth.map(d => <svg key={d} viewBox={`0 0 ${glyphViewBox.width} ${glyphViewBox.height}`} className="lo-depth" style={{ '--d': d } as CSSProperties}>{pieces.map(p => <path key={p} d={glyphs[p]} />)}</svg>)}
        <svg viewBox={`0 0 ${glyphViewBox.width} ${glyphViewBox.height}`} className="lo-face">
          <defs>
            <radialGradient id="lo-spec" gradientUnits="userSpaceOnUse" cx="1600" cy="400" r="900"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
          </defs>
          {pieces.map(p => <path key={p} d={glyphs[p]} className={`lo-${p}`} />)}
          <g className="lo-spec">{pieces.map(p => <path key={p} d={glyphs[p]} fill="url(#lo-spec)" />)}</g>
        </svg>
      </div>
      <div className="lo-foot">
        <p className="lede">{on ? 'Assim a sua marca fica depois do pôr do sol.' : 'Aproxime a luz da peça. Depois clique para acender.'}</p>
        <button type="button" className="btn btn-ghost lo-switch" aria-pressed={on} onClick={toggle} data-magnetic>{on ? 'Apagar' : 'Acender o letreiro'} <span className="arrow">●</span></button>
      </div>
    </section>
  )
}
