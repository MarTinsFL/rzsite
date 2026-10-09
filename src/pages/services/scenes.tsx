import { useRef, type CSSProperties } from 'react'
import Media from '../../components/Media'
import { mediaUrl } from '../../data/media'
import { glyphs } from '../../lib/glyphs'
import { sound } from '../../lib/sound'
import { useMotion } from '../../lib/motion'

/* ------------------------------------------------------------------------------------------------
 * 01 · FACHADA EM ACM — o painel inteiro se divide nas placas reais da foto (juntas medidas na
 * imagem), revela juntas, estrutura, dobras e fixação, e volta a fechar a fachada.
 * --------------------------------------------------------------------------------------------- */
const IMG_W = 2048, IMG_H = 1152
const FAS = { x: 154, y: 180, w: 1722, h: 410 }
const cols = [0, 157, 353, 566, 791, 1021, 1228, 1321, 1525, 1722]
const rows = [0, 120, 199, 281, 410]

export function AcmScene() {
  const root = useRef<HTMLDivElement>(null)
  const src = mediaUrl('varejo-moda', 2048, 'webp')
  const tiles = rows.slice(0, -1).flatMap((y0, r) => cols.slice(0, -1).map((x0, c) => {
    const x1 = cols[c + 1], y1 = rows[r + 1]
    const w = x1 - x0, h = y1 - y0
    return {
      key: `${r}-${c}`, r, c,
      box: { left: `${(x0 / FAS.w) * 100}%`, top: `${(y0 / FAS.h) * 100}%`, width: `${(w / FAS.w) * 100}%`, height: `${(h / FAS.h) * 100}%` },
      img: { width: `${(IMG_W / w) * 100}%`, height: `${(IMG_H / h) * 100}%`, left: `${(-(FAS.x + x0) / w) * 100}%`, top: `${(-(FAS.y + y0) / h) * 100}%` },
    }
  }))
  useMotion(root, ({ gsap }) => {
    const q = gsap.utils.selector(root)
    const tileEls = q('.acm-tile') as HTMLElement[]
    const rand = gsap.utils.random(-1, 1, 0.01, true)
    gsap.set(q('.acm-cam'), { scale: 1, yPercent: 0 })
    gsap.set(q('.acm-wall, .acm-struct, .acm-note'), { opacity: 0 })
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root.current, start: 'top top', end: '+=260%', pin: true, scrub: 0.8, anticipatePin: 1 } })
    tl.to(q('.acm-cam'), { scale: 1.32, yPercent: 16.3, duration: 18, ease: 'power2.inOut' }, 0)
      .to(q('.acm-wall'), { opacity: 1, duration: 4 }, 16)
      .to(q('.acm-struct'), { opacity: 1, duration: 8 }, 22)
      .add(() => sound.swoosh(), 18)
    tileEls.forEach((tile, i) => {
      const r = Number(tile.dataset.r), c = Number(tile.dataset.c)
      tl.to(tile, { z: 60 + Math.abs(rand()) * 110 + r * 12, rotateX: rand() * 14, rotateY: rand() * 18, x: (c - 4) * 9, y: (r - 1.5) * 12, duration: 22, ease: 'power3.inOut' }, 18 + (c + r) * 0.6)
      tl.to(tile, { z: 0, rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 20, ease: 'power3.inOut' }, 64 + (8 - c) * 0.4 + i * 0.05)
    })
    tl.to(q('.acm-note'), { opacity: 1, duration: 4, stagger: 3 }, 34)
      .to(q('.acm-note'), { opacity: 0, duration: 4 }, 62)
      .to(q('.acm-struct'), { opacity: 0, duration: 6 }, 78)
      .to(q('.acm-wall'), { opacity: 0, duration: 4 }, 84)
      .to(q('.acm-cam'), { scale: 1, yPercent: 0, duration: 16, ease: 'power2.inOut' }, 84)
  })
  return (
    <div ref={root} className="scene scene-acm" aria-hidden="true">
      <div className="acm-cam">
        <Media id="varejo-moda" alt="" sizes="100vw" className="acm-base" label="Visualização conceitual · IA" />
        <div className="acm-fascia" style={{ left: `${(FAS.x / IMG_W) * 100}%`, top: `${(FAS.y / IMG_H) * 100}%`, width: `${(FAS.w / IMG_W) * 100}%`, height: `${(FAS.h / IMG_H) * 100}%` }}>
          <div className="acm-wall" />
          <svg className="acm-struct" viewBox={`0 0 ${FAS.w} ${FAS.h}`} preserveAspectRatio="none">
            {cols.map(x => <rect key={`c${x}`} x={x - 5} y={-10} width="10" height={FAS.h + 20} />)}
            {[60, 205, 345].map(y => <rect key={`r${y}`} x={-10} y={y - 4} width={FAS.w + 20} height="8" />)}
            {cols.flatMap(x => [60, 205, 345].map(y => <circle key={`${x}-${y}`} cx={x} cy={y} r="5" />))}
          </svg>
          {tiles.map(tile => (
            <div key={tile.key} className="acm-tile" data-r={tile.r} data-c={tile.c} style={tile.box}>
              <span className="acm-face"><img src={src} alt="" style={tile.img} decoding="async" loading="lazy" /></span>
            </div>
          ))}
          <span className="acm-note micro" style={{ left: '2%', top: '-14%' }}>Junta seca · 10 mm</span>
          <span className="acm-note micro" style={{ left: '38%', top: '104%' }}>Dobra 90° · bandeja</span>
          <span className="acm-note micro" style={{ right: '2%', top: '-14%' }}>Subestrutura · fixação oculta</span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
 * 02 · LETRAS CAIXA — a câmera passa pela lateral da letra, entra nela (o LED aparece) e sai pela face.
 * --------------------------------------------------------------------------------------------- */
export function LetterScene() {
  const root = useRef<HTMLDivElement>(null)
  const walls = Array.from({ length: 22 }, (_, i) => i)
  useMotion(root, ({ gsap }) => {
    const q = gsap.utils.selector(root)
    gsap.set(q('.lt-obj'), { rotateY: 78, rotateX: 4, x: '18vw', z: -300 })
    gsap.set(q('.lt-face'), { opacity: 1 })
    gsap.set(q('.lt-led'), { opacity: 0.25 })
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root.current, start: 'top top', end: '+=280%', pin: true, scrub: 0.8, anticipatePin: 1 } })
    tl.to(q('.lt-obj'), { rotateY: 18, x: '-6vw', z: -80, duration: 30, ease: 'power2.inOut' }, 0)
      .to(q('.lt-note-side'), { opacity: 1, duration: 4 }, 6).to(q('.lt-note-side'), { opacity: 0, duration: 4 }, 26)
      .to(q('.lt-obj'), { rotateY: 0, x: 0, z: 520, duration: 22, ease: 'power2.in' }, 30)
      .to(q('.lt-face'), { opacity: 0.06, duration: 10 }, 38)
      .to(q('.lt-led'), { opacity: 1, duration: 8 }, 42).add(() => sound.lightOn(), 44)
      .to(q('.lt-note-in'), { opacity: 1, duration: 4 }, 46).to(q('.lt-note-in'), { opacity: 0, duration: 4 }, 60)
      .to(q('.lt-obj'), { z: 0, rotateY: -12, duration: 26, ease: 'power2.out' }, 58)
      .to(q('.lt-face'), { opacity: 1, duration: 10 }, 60)
      .to(q('.lt-scene'), { '--lit': 1, duration: 10 }, 66)
      .to(q('.lt-note-face'), { opacity: 1, duration: 4 }, 76)
  })
  return (
    <div ref={root} className="scene scene-letter" aria-hidden="true">
      <div className="lt-scene" style={{ '--lit': 0 } as CSSProperties}>
        <div className="lt-obj">
          <svg className="lt-back" viewBox="1690 -20 1700 1060"><defs><pattern id="lt-ledgrid" width="90" height="90" patternUnits="userSpaceOnUse"><rect x="30" y="38" width="30" height="14" rx="3" fill="#f7ffe2" /></pattern><clipPath id="lt-clip"><path d={glyphs.Z} /><path d={glyphs.barZ} /></clipPath></defs><path d={glyphs.Z} className="lt-back-plate" /><path d={glyphs.barZ} className="lt-back-plate" /><rect className="lt-led" x="1690" y="-20" width="1700" height="1060" fill="url(#lt-ledgrid)" clipPath="url(#lt-clip)" /></svg>
          {walls.map(i => <svg key={i} className="lt-wall" viewBox="1690 -20 1700 1060" style={{ '--k': i } as CSSProperties}><path d={glyphs.Z} /><path d={glyphs.barZ} /></svg>)}
          <svg className="lt-face" viewBox="1690 -20 1700 1060"><path d={glyphs.Z} /><path d={glyphs.barZ} /></svg>
        </div>
        <span className="lt-note lt-note-side micro">Lateral · retorno em alumínio · 120 mm</span>
        <span className="lt-note lt-note-in micro">Interior · módulos de LED distribuídos</span>
        <span className="lt-note lt-note-face micro">Face · acrílico leitoso · luz uniforme</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
 * 03 · LETREIRO — cena noturna: 5% um brilho, 30% LED parcial, 60% letreiro, 100% fachada.
 * --------------------------------------------------------------------------------------------- */
export function SignScene() {
  const root = useRef<HTMLDivElement>(null)
  const pct = useRef<HTMLSpanElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  useMotion(root, ({ gsap }) => {
    const q = gsap.utils.selector(root)
    const el = q('.sg-stage')[0] as HTMLElement
    gsap.set(el, { '--g': '0%', '--s': '0%', '--f': '0%' })
    const steps: [number, string][] = [[0, 'Escuro'], [5, 'Primeiro brilho'], [30, 'LED parcial'], [60, 'Letreiro'], [100, 'Fachada iluminada']]
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root.current, start: 'top top', end: '+=220%', pin: true, scrub: 0.6, anticipatePin: 1 } })
    tl.to(el, { '--g': '9%', duration: 5, ease: 'steps(3)' }, 2)
      .to(el, { '--s': '42%', duration: 25, ease: 'steps(9)' }, 6)
      .to(el, { '--s': '100%', duration: 28, ease: 'power2.out' }, 32)
      .to(el, { '--f': '150%', duration: 38, ease: 'power2.inOut' }, 60)
    tl.eventCallback('onUpdate', () => {
      const p = Math.round(tl.progress() * 100)
      if (pct.current) pct.current.textContent = String(p).padStart(3, '0')
      const step = [...steps].reverse().find(([at]) => p >= at)!
      if (label.current && label.current.textContent !== step[1]) label.current.textContent = step[1]
    })
  })
  return (
    <div ref={root} className="scene scene-sign">
      <div className="sg-stage">
        <Media id="bar-noturno" alt="" className="sg-dark" sizes="100vw" label={false} />
        <Media id="bar-noturno" alt="Visualização conceitual: letreiro luminoso acendendo em fachada noturna" className="sg-lit" sizes="100vw" label="Visualização conceitual · IA" />
        <div className="sg-hud" aria-hidden="true"><span className="sg-pct" ref={pct}>000</span><span className="micro" ref={label}>Escuro</span></div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
 * 04 · COMUNICAÇÃO VISUAL — uma linguagem em várias superfícies: rolagem horizontal.
 * --------------------------------------------------------------------------------------------- */
export function VisualScene() {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const frames = [
    { id: 'comunicacao-lobby' as const, label: 'Sinalização interna', note: 'Placas em aço escovado · pictogramas · setas' },
    { id: 'acm-chapas' as const, label: 'Materiais', note: 'ACM preto, escovado, branco e verde' },
    { id: 'estrutura-metalon' as const, label: 'Perfis e acabamento', note: 'Corte, dobra e borda limpa' },
  ]
  useMotion(root, ({ gsap }) => {
    const mm = gsap.matchMedia()
    mm.add('(min-width: 960px)', () => {
      const el = track.current!
      const distance = () => Math.max(0, el.scrollWidth - el.parentElement!.clientWidth)
      gsap.to(el, { x: () => -distance(), ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 12%', end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true } })
    })
    return () => mm.revert()
  })
  return (
    <div ref={root} className="scene scene-visual">
      <div ref={track} className="vs-track">
        {frames.map((frame, i) => (
          <figure key={frame.id} className={`vs-frame vs-frame-${i + 1}`} data-cursor="explore">
            <Media id={frame.id} alt={`Visualização conceitual: ${frame.label.toLowerCase()}`} sizes="(max-width: 959px) 86vw, 46vw" />
            <figcaption><span className="micro">0{i + 1}</span><strong>{frame.label}</strong><span className="micro">{frame.note}</span></figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------------
 * 05 · PROJETOS PERSONALIZADOS — o desenho técnico se desenha e vira a peça fotografada.
 * --------------------------------------------------------------------------------------------- */
export function CustomScene() {
  const root = useRef<HTMLDivElement>(null)
  useMotion(root, ({ gsap }) => {
    const q = gsap.utils.selector(root)
    gsap.set(q('.cu-draw'), { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.set(q('.cu-photo'), { clipPath: 'inset(0 100% 0 0)' })
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root.current, start: 'top 75%', end: 'bottom 30%', scrub: 0.7 } })
    tl.to(q('.cu-draw'), { strokeDashoffset: 0, duration: 50, stagger: 4, ease: 'power2.inOut' }, 0)
      .to(q('.cu-text'), { opacity: 1, duration: 10, stagger: 3 }, 30)
      .to(q('.cu-photo'), { clipPath: 'inset(0 0% 0 0)', duration: 40, ease: 'power2.inOut' }, 60)
  }, { lazy: true })
  return (
    <div ref={root} className="scene scene-custom">
      <div className="cu-frame">
        <svg className="cu-svg" viewBox="0 0 2048 1152" aria-hidden="true">
          <path className="cu-draw" pathLength={1} d="M0 1070H2048" />
          <path className="cu-draw" pathLength={1} d="M862 1070V62H1060V1070" />
          <path className="cu-draw" pathLength={1} d="M1052 140V1000" />
          <path className="cu-draw" pathLength={1} d="M890 180H1030V290H890Z" />
          <path className="cu-draw" pathLength={1} d="M800 62V1070M780 62H820M780 1070H820" />
          <path className="cu-draw" pathLength={1} d="M862 1110H1060M862 1095V1125M1060 1095V1125" />
          <text className="cu-text" x="760" y="566" transform="rotate(-90 760 566)">6 000</text>
          <text className="cu-text" x="961" y="1146">900</text>
          <text className="cu-text" x="1110" y="236">NÚMEROS · ALUMÍNIO ESCOVADO</text>
          <text className="cu-text" x="1110" y="560">RASGO RETROILUMINADO · LED VERDE</text>
          <text className="cu-text" x="1110" y="880">ACM PRETO FOSCO · ESTRUTURA INTERNA</text>
        </svg>
        <Media id="totem-120" alt="Visualização conceitual: totem em ACM preto com números em alumínio e rasgo de luz verde" className="cu-photo" sizes="(max-width: 959px) 100vw, 60vw" />
      </div>
    </div>
  )
}
