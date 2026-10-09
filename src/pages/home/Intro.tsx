import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { glyphs } from '../../lib/glyphs'
import { sound } from '../../lib/sound'

/**
 * Abertura da Home — tela preta → RZ / VISUAL ENGINEERING → ponto verde → linha → wireframe →
 * estrutura → ACM → letras → luz → a câmera atravessa a letra acesa e entra no hero.
 * Toda a coreografia é CSS (começa no primeiro quadro, antes do JS). Na mesma sessão, roda a versão curta.
 */
const studs = Array.from({ length: 16 }, (_, i) => 100 + i * 66.66)
const panels = Array.from({ length: 15 }, (_, i) => 100 + i * 66.66)

export default function Intro() {
  const [gone, setGone] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const html = document.documentElement
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setGone(true); return }
    const seen = html.hasAttribute('data-intro-seen')
    const total = seen ? 1300 : 4300
    const light = window.setTimeout(() => sound.lightOn(), seen ? 300 : 2950)
    const done = window.setTimeout(() => finish(), total)
    function finish() {
      try { sessionStorage.setItem('rz-intro', '1') } catch { /* private mode */ }
      setGone(true)
    }
    const skip = (event: KeyboardEvent) => { if (event.key === 'Escape') { html.classList.add('intro-skip'); finish() } }
    document.addEventListener('keydown', skip)
    return () => { window.clearTimeout(light); window.clearTimeout(done); document.removeEventListener('keydown', skip) }
  }, [])
  if (gone) return null
  return (
    <div ref={root} className="intro" aria-hidden="true">
      <div className="intro-hud">
        <span className="intro-type">RZ / Visual Engineering</span>
        <span className="intro-coords">22°54′S · 43°12′W</span>
        <span className="intro-load" />
      </div>
      <div className="intro-stage">
        <svg className="intro-svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="ip-acm" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#2c2d2a" /><stop offset=".5" stopColor="#151614" /><stop offset="1" stopColor="#222320" /></linearGradient>
            <linearGradient id="ip-cone" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff1d2" stopOpacity=".42" /><stop offset="1" stopColor="#fff1d2" stopOpacity="0" /></linearGradient>
            <linearGradient id="ip-glass" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ffe3b3" stopOpacity=".34" /><stop offset=".6" stopColor="#ffd394" stopOpacity=".14" /><stop offset="1" stopColor="#ffd394" stopOpacity=".05" /></linearGradient>
            <filter id="ip-glow" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="9" /></filter>
          </defs>
          <g className="ip-grid">{Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${i * 100} 0V700`} />)}{Array.from({ length: 8 }, (_, i) => <path key={`h${i}`} d={`M0 ${i * 100}H1200`} />)}</g>
          <path className="ip-line ip-outline" pathLength={1} d="M600 350V600H100V120H1100V600H600" />
          <path className="ip-line ip-fascia" pathLength={1} d="M100 200H1100M100 330H1100" />
          <path className="ip-line ip-glass" pathLength={1} d="M160 370H1040V600M160 370V600M330 370V600M870 370V600M540 370V600M660 370V600M600 400V600M160 400H1040" />
          <g className="ip-struct">{studs.map(x => <path key={x} d={`M${x} 200V330`} />)}<path d="M100 225H1100M100 305H1100" />{studs.map(x => <circle key={`c${x}`} cx={x} cy={225} r="2.5" />)}</g>
          <g className="ip-acm">{panels.map((x, i) => <rect key={x} x={x + 1.5} y={201.5} width={63.66} height={127} fill="url(#ip-acm)" style={{ '--i': i } as CSSProperties} />)}</g>
          <g className="ip-wash">{[210, 390, 810, 990].map(x => <g key={x}><path className="cone" d={`M${x - 6} 333L${x - 70} 600H${x + 70}L${x + 6} 333Z`} /><rect className="fixture" x={x - 7} y={331} width={14} height={3} /></g>)}</g>
          <rect className="ip-glasslight" x="161" y="371" width="878" height="228" />
          <g className="ip-letters" transform="translate(447 218) scale(.0905)">
            <g className="ip-halo" filter="url(#ip-glow)"><path d={glyphs.R} /><path d={glyphs.barR} /><path d={glyphs.Z} /><path d={glyphs.barZ} /></g>
            <path className="ip-r" pathLength={1} d={glyphs.R} /><path className="ip-r" pathLength={1} d={glyphs.barR} />
            <path className="ip-z" pathLength={1} d={glyphs.Z} /><path className="ip-z" pathLength={1} d={glyphs.barZ} />
          </g>
          <g className="ip-dims"><path d="M100 70H1100M100 62V78M1100 62V78" /><text x="600" y="60">18 750</text><path d="M60 200V330M52 200H68M52 330H68" /><text x="44" y="270" transform="rotate(-90 44 270)">3 400</text></g>
        </svg>
        <i className="intro-dot" />
      </div>
      <div className="intro-stages">
        {['Wireframe', 'Estrutura', 'ACM', 'Letras', 'Luz'].map((stage, i) => <span key={stage} style={{ '--i': i } as CSSProperties}>0{i + 1} {stage}</span>)}
      </div>
      <div className="intro-flash" />
    </div>
  )
}
