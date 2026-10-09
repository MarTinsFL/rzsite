import { useRef, useState } from 'react'
import { mediaUrl } from '../../data/media'
import { sound } from '../../lib/sound'
import { useMotion } from '../../lib/motion'

/**
 * Efeito CONSTRUÇÃO — uma fachada montada no scroll, na mesma viewport (seção pinada).
 * O desenho técnico foi traçado sobre a geometria real da foto (2048 × 1152), então o projeto
 * "vira" a fotografia: 0 wireframe · 20 estrutura · 40 ACM · 60 letras · 80 luz · 100 rua.
 */
const W = 2048, H = 1152
const FX0 = 74, FX1 = 2022, FY0 = 287, FY1 = 640
const module = (FX1 - FX0) / 15
const joints = Array.from({ length: 16 }, (_, i) => FX0 + i * module)
const rails = [322, 463, 604]
const stages = [
  { key: 'wire', label: 'Wireframe', spec: 'Levantamento · 18 750 × 3 400 mm' },
  { key: 'struct', label: 'Estrutura', spec: 'Subestrutura metálica · módulo 1 250' },
  { key: 'acm', label: 'ACM', spec: 'Painéis de ACM · 15 módulos · preto fosco' },
  { key: 'letters', label: 'Letras caixa', spec: 'Letra caixa · face acrílica · h 520' },
  { key: 'light', label: 'Luz', spec: 'LED · halo + face · luz indireta' },
]

export default function Construction() {
  const root = useRef<HTMLElement>(null)
  const counter = useRef<HTMLSpanElement>(null)
  const [stage, setStage] = useState(-1)
  const photo = mediaUrl('hero-facade-night', 2048, 'webp')

  useMotion(root, ({ gsap }) => {
    const q = gsap.utils.selector(root)
    const mobile = window.matchMedia('(max-width: 959px)').matches
    gsap.set(q('.cs-wire, .cs-dims, .cs-letters-stroke'), { opacity: 1 })
    gsap.set(q('.cs-grid'), { opacity: 0 })
    gsap.set(q('.cs-wire path, .cs-dims path'), { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.set(q('.cs-dims text, .cs-note'), { opacity: 0 })
    gsap.set(q('.cs-stud'), { scaleY: 0, transformOrigin: '50% 0%' })
    gsap.set(q('.cs-rail'), { scaleX: 0, transformOrigin: '0% 50%' })
    gsap.set(q('.cs-anchor'), { scale: 0, transformOrigin: '50% 50%' })
    gsap.set(q('.cs-clip rect'), { attr: { height: 0 } })
    gsap.set(q('.cs-full'), { opacity: 0 })
    gsap.set(q('.cs-letters-stroke'), { strokeDasharray: 1400, strokeDashoffset: 1400 })
    gsap.set(q('.cs-letters-face'), { fillOpacity: 0, fill: '#1c1d1a' })
    gsap.set(q('.cs-halo, .cs-spill, .cs-cones, .cs-wet'), { opacity: 0 })
    gsap.set(q('.cs-final'), { opacity: 0, yPercent: 20 })
    gsap.set(q('.cs-cam'), { rotateX: 9, rotateY: -12, scale: 0.84 })

    const tl = gsap.timeline({ defaults: { ease: 'none' } })
    tl.to(q('.cs-grid'), { opacity: 1, duration: 4 }, 0)
      .to(q('.cs-wire path'), { strokeDashoffset: 0, duration: 10, stagger: 0.6, ease: 'power2.inOut' }, 0)
      .to(q('.cs-dims path'), { strokeDashoffset: 0, duration: 6 }, 6)
      .to(q('.cs-dims text, .cs-note-wire'), { opacity: 1, duration: 3 }, 9)
      .to(q('.cs-stud'), { scaleY: 1, duration: 6, stagger: 0.35, ease: 'power2.out' }, 18)
      .to(q('.cs-rail'), { scaleX: 1, duration: 7, stagger: 1.4, ease: 'power2.inOut' }, 21)
      .to(q('.cs-anchor'), { scale: 1, duration: 2, stagger: 0.08, ease: 'back.out(3)' }, 26)
      .to(q('.cs-note-struct'), { opacity: 1, duration: 3 }, 24)
      .to(q('.cs-note-wire'), { opacity: 0, duration: 2 }, 24)
      .to(q('.cs-clip rect'), { attr: { height: FY1 - FY0 - 4 }, duration: 5, stagger: 0.95, ease: 'power3.inOut' }, 38)
      .to(q('.cs-note-acm'), { opacity: 1, duration: 3 }, 42)
      .to(q('.cs-note-struct'), { opacity: 0, duration: 2 }, 42)
      .to(q('.cs-letters-stroke'), { strokeDashoffset: 0, duration: 9, ease: 'power2.inOut' }, 58)
      .to(q('.cs-letters-face'), { fillOpacity: 1, duration: 5 }, 64)
      .to(q('.cs-note-letters'), { opacity: 1, duration: 3 }, 60)
      .to(q('.cs-note-acm'), { opacity: 0, duration: 2 }, 60)
      .to(q('.cs-full'), { opacity: 1, duration: 9, ease: 'power1.inOut' }, 77)
      .to(q('.cs-letters-face'), { fill: '#f3f8e4', duration: 0.8, ease: 'steps(1)' }, 80)
      .to(q('.cs-letters-face'), { fill: '#3c4135', duration: 0.6, ease: 'steps(1)' }, 81)
      .to(q('.cs-letters-face'), { fill: '#f3f8e4', duration: 0.6, ease: 'steps(1)' }, 82)
      .to(q('.cs-halo'), { opacity: 0.95, duration: 3 }, 82)
      .to(q('.cs-spill, .cs-cones, .cs-wet'), { opacity: 1, duration: 6 }, 83)
      .to(q('.cs-letters-stroke'), { opacity: 0, duration: 4 }, 84)
      .to(q('.cs-note-light'), { opacity: 1, duration: 3 }, 80)
      .to(q('.cs-note-letters'), { opacity: 0, duration: 2 }, 80)
      .to(q('.cs-wire, .cs-dims, .cs-grid'), { opacity: 0.12, duration: 6 }, 90)
      .to(q('.cs-note-light'), { opacity: 0, duration: 3 }, 92)
      .to(q('.cs-final'), { opacity: 1, yPercent: 0, duration: 6, ease: 'power3.out' }, 93)
      .to(q('.cs-stages, .cs-count'), { opacity: 0.12, duration: 4 }, 91)
      .to(q('.cs-cam'), { rotateX: 0, rotateY: 0, scale: 1, duration: 88, ease: 'power1.inOut' }, 0)
      .to(q('.cs-cam'), { scale: 1.07, duration: 12, ease: 'power2.in' }, 88)

    let last = -1
    tl.eventCallback('onUpdate', () => {
      const p = tl.progress()
      if (counter.current) counter.current.textContent = String(Math.round(p * 100)).padStart(3, '0')
      const next = p < 0.02 ? -1 : Math.min(4, Math.floor(p * 5.1))
      if (next !== last) { last = next; setStage(next); if (next === 4) sound.lightOn(); else if (next >= 0) sound.click() }
    })
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: mobile ? '+=240%' : '+=330%', pin: true, scrub: 0.7, anticipatePin: 1 } }).add(tl)
  })

  return (
    <section ref={root} className="construction" data-nav-theme="dark" aria-labelledby="construction-title">
      <div className="cs-viewport">
        <div className="cs-hud">
          <p className="micro cs-kicker"><span className="index">02</span> Construção · Da ideia à rua</p>
          <h2 id="construction-title" className="sr-only">Do projeto à rua: como uma fachada é construída</h2>
          <p className="cs-count" aria-hidden="true"><span ref={counter}>000</span><small>%</small></p>
          <ol className="cs-stages">
            {stages.map((item, i) => <li key={item.key} className={i === stage ? 'is-active' : i < stage ? 'is-done' : ''}><span className="micro">0{i + 1}</span>{item.label}<small>{item.spec}</small></li>)}
          </ol>
        </div>

        <div className="cs-stagewrap">
          <div className="cs-cam">
            <svg className="cs-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Desenho técnico de uma fachada que recebe estrutura, painéis de ACM, letras caixa e iluminação até virar a fachada pronta">
              <defs>
                <clipPath id="cs-clip" className="cs-clip">{joints.slice(0, -1).map(x => <rect key={x} x={x + 2} y={FY0 + 2} width={module - 4} height={FY1 - FY0 - 4} />)}</clipPath>
                <pattern id="cs-grid" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0H0V64" fill="none" stroke="rgba(236,235,230,.07)" strokeWidth="1" /></pattern>
                <filter id="cs-blur" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="22" /></filter>
                <filter id="cs-soft" x="-40%" y="-10%" width="180%" height="120%"><feGaussianBlur stdDeviation="16" /></filter>
                <linearGradient id="cs-cone" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#fff1d2" stopOpacity=".5" /><stop offset="1" stopColor="#fff1d2" stopOpacity="0" /></linearGradient>
                <radialGradient id="cs-spill" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#a9cf46" stopOpacity=".42" /><stop offset="1" stopColor="#a9cf46" stopOpacity="0" /></radialGradient>
              </defs>
              <rect width={W} height={H} fill="#0b0b0a" />
              <rect className="cs-grid" width={W} height={H} fill="url(#cs-grid)" opacity="0" />
              <g className="cs-struct">
                {joints.map(x => <rect key={x} className="cs-stud" x={x - 4} y={FY0 + 8} width="8" height={FY1 - FY0 - 16} />)}
                {rails.map(y => <rect key={y} className="cs-rail" x={FX0} y={y - 4} width={FX1 - FX0} height="8" />)}
                {joints.flatMap(x => rails.map(y => <circle key={`${x}-${y}`} className="cs-anchor" cx={x} cy={y} r="6" />))}
              </g>
              <image className="cs-photo" href={photo} width={W} height={H} clipPath="url(#cs-clip)" preserveAspectRatio="xMidYMid slice" />
              <image className="cs-full" href={photo} width={W} height={H} preserveAspectRatio="xMidYMid slice" />
              <g className="cs-cones" filter="url(#cs-soft)">{[330, 640, 1408, 1718].map(x => <path key={x} d={`M${x - 10} 646L${x - 120} 930H${x + 120}L${x + 10} 646Z`} fill="url(#cs-cone)" />)}</g>
              <ellipse className="cs-spill" cx="1048" cy="463" rx="900" ry="230" fill="url(#cs-spill)" />
              <ellipse className="cs-wet" cx="1048" cy="1000" rx="760" ry="60" fill="url(#cs-spill)" />
              <text className="cs-halo cs-letters" x="1048" y="541" filter="url(#cs-blur)">SUA MARCA</text>
              <text className="cs-letters cs-letters-face" x="1048" y="541">SUA MARCA</text>
              <text className="cs-letters cs-letters-stroke" x="1048" y="541">SUA MARCA</text>
              <g className="cs-wire">
                <path pathLength={1} d={`M0 934H${W}`} />
                <path pathLength={1} d={`M${FX0} 934V${FY0}H${FX1}V934`} />
                <path pathLength={1} d={`M100 ${FY0}V135H1945V${FY0}`} />
                <path pathLength={1} d={`M${FX0} ${FY1}H${FX1}`} />
                <path pathLength={1} d="M205 651H1884V921H205Z" />
                <path pathLength={1} d="M205 689H1884M476 651V921M870 651V921M1014 651V921M1244 651V921M1131 689V921" />
                <path pathLength={1} d={joints.slice(1, -1).map(x => `M${x} ${FY0}V${FY1}`).join('')} />
                <path pathLength={1} d={`M0 1050H${W}`} />
              </g>
              <g className="cs-dims">
                <path pathLength={1} d={`M${FX0} 96H${FX1}M${FX0} 82V110M${FX1} 82V110`} />
                <text x="1048" y="78">18 750</text>
                <path pathLength={1} d={`M34 ${FY0}V${FY1}M20 ${FY0}H48M20 ${FY1}H48`} />
                <text x="22" y="470" transform="rotate(-90 22 470)">3 400</text>
              </g>
              <g className="cs-notes">
                <text className="cs-note cs-note-wire" x={FX0} y="250">LEVANTAMENTO · MEDIDAS REAIS DA FACHADA</text>
                <text className="cs-note cs-note-struct" x={FX0} y="250">METALON GALVANIZADO · CHUMBADORES · MÓDULO 1 250</text>
                <text className="cs-note cs-note-acm" x={FX0} y="250">ACM 4 MM · PRETO FOSCO · DOBRAS + JUNTAS DE 10 MM</text>
                <text className="cs-note cs-note-letters" x={FX0} y="250">LETRA CAIXA · FACE ACRÍLICA · RETORNO EM AÇO</text>
                <text className="cs-note cs-note-light" x={FX0} y="250">LED · HALO + FACE · LUZ INDIRETA NA VITRINE</text>
              </g>
            </svg>
          </div>
        </div>

        <p className="cs-final display" aria-hidden="true">Do projeto <span>à rua.</span></p>
      </div>
    </section>
  )
}
