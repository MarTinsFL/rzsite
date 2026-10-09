import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { glyphs } from '../../lib/glyphs'
import { sound } from '../../lib/sound'
import { useMotion } from '../../lib/motion'

/**
 * EXPLODED VIEW — a letra R da marca como peça industrial. As seis camadas se separam no eixo Z,
 * ficam suspensas e voltam a se encaixar; ao fechar, o LED acende através do acrílico.
 */
const VB = '0 0 1680 1030'
const layers = [
  { key: 'face', label: 'Face', spec: 'Moldura frontal · aço escovado', z: 280 },
  { key: 'acrylic', label: 'Acrílico', spec: 'Face leitosa · difusão sem pontos', z: 190 },
  { key: 'structure', label: 'Estrutura', spec: 'Laterais em alumínio · profundidade', z: 100 },
  { key: 'led', label: 'LED', spec: 'Módulos 6500K · distribuição uniforme', z: 34 },
  { key: 'back', label: 'Fundo', spec: 'Base em ACM · vedação', z: -60 },
  { key: 'fix', label: 'Fixação', spec: 'Espaçadores e pinos · afastamento', z: -160 },
]
const assembled: Record<string, number> = { face: 46, acrylic: 44, structure: 4, led: 8, back: 0, fix: -26 }
const studs = [[230, 220], [980, 220], [1500, 330], [1010, 800], [1450, 930], [520, 980]]

function Plane({ name, children, index }: { name: string; children: ReactNode; index: number }) {
  return (
    <div className={`ex-layer ex-${name}`} data-layer={name}>
      {children}
      <i className="ex-anchor" data-anchor={index} style={{ top: `${8 + index * 13}%` }} />
    </div>
  )
}

export default function Exploded() {
  const root = useRef<HTMLElement>(null)
  const object = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(-1)

  useMotion(root, ({ gsap }) => {
    const q = gsap.utils.selector(root)
    const mobile = window.matchMedia('(max-width: 959px)').matches
    const spread = mobile ? 0.62 : 1
    const layerEls = layers.map(layer => q(`[data-layer="${layer.key}"]`)[0] as HTMLElement)
    layerEls.forEach((el, i) => gsap.set(el, { z: assembled[layers[i].key] }))
    gsap.set(object.current, { '--rx': '14deg', '--ry': '-58deg', '--s': 0.86 })
    const tl = gsap.timeline({ defaults: { ease: 'none' } })
    tl.to(object.current, { '--rx': '8deg', '--ry': '-40deg', '--s': 1, duration: 16, ease: 'power2.inOut' }, 0)
    layerEls.forEach((el, i) => {
      tl.to(el, { z: layers[i].z * spread, duration: 30, ease: 'power3.inOut' }, 12 + i * 2)
    })
    tl.to(object.current, { '--ry': '-24deg', '--rx': '4deg', duration: 22, ease: 'power1.inOut' }, 42)
    tl.to(q('.ex-shadow'), { opacity: 0.25, scale: 1.3, duration: 20 }, 12)
    layerEls.forEach((el, i) => tl.to(el, { z: assembled[layers[i].key], duration: 20, ease: 'power3.inOut' }, 66 + (layers.length - i) * 1.2))
    tl.to(q('.ex-shadow'), { opacity: 1, scale: 1, duration: 16 }, 70)
    tl.to(object.current, { '--ry': '-30deg', '--rx': '6deg', duration: 18, ease: 'power2.inOut' }, 74)
    tl.add(() => sound.lightOn(), 90)
    tl.to(root.current, { '--lit': 1, duration: 6, ease: 'steps(3)' }, 90)
    tl.to(root.current, { '--lit': 1, duration: 4 }, 96)
    let last = -2
    // Linhas-guia: da chamada (coluna fixa) até a âncora projetada de cada camada.
    const scene = q('.ex-scene')[0] as HTMLElement
    const callouts = q('.ex-callout') as HTMLElement[]
    const paths = [...root.current!.querySelectorAll<SVGPathElement>('.ex-lines path')]
    const dots = [...root.current!.querySelectorAll<SVGCircleElement>('.ex-lines circle')]
    const anchors = layers.map((_, i) => q(`[data-anchor="${i}"]`)[0] as HTMLElement)
    const drawLines = () => {
      const box = scene.getBoundingClientRect()
      anchors.forEach((anchor, i) => {
        const a = anchor.getBoundingClientRect(), c = callouts[i].getBoundingClientRect()
        const ax = a.left - box.left, ay = a.top - box.top, cx = c.left - box.left - 6, cy = c.top - box.top + 10
        paths[i].setAttribute('d', `M${cx} ${cy}H${cx - 24}L${ax} ${ay}`)
        dots[i].setAttribute('cx', String(ax)); dots[i].setAttribute('cy', String(ay))
      })
    }
    tl.eventCallback('onUpdate', () => {
      const t = tl.time()
      const next = t < 26 ? -1 : t > 66 ? (t > 90 ? 6 : -1) : Math.min(5, Math.floor((t - 26) / 6))
      if (next !== last) { last = next; setActive(next) }
      const open = t > 24 && t < 70
      q('.ex-callouts')[0]?.classList.toggle('is-open', open)
      callouts.forEach((callout, i) => callout.classList.toggle('is-on', open && t > 26 + i * 3))
      if (open) drawLines()
    })
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: mobile ? '+=200%' : '+=280%', pin: true, scrub: 0.8, anticipatePin: 1 } }).add(tl)
  })

  return (
    <section ref={root} className="exploded light" data-nav-theme="light" aria-labelledby="exploded-title" style={{ '--lit': 0 } as CSSProperties}>
      <div className="ex-viewport">
        <header className="ex-head">
          <p className="micro"><span className="index">04</span> Anatomia · Letra caixa</p>
          <h2 id="exploded-title" className="display ex-title">Uma letra.<br /><span>Seis camadas.</span></h2>
          <p className="lede">Antes de acender, uma letra caixa é engenharia: cada camada tem uma função, uma espessura e um encaixe.</p>
        </header>

        <div className="ex-scene" aria-hidden="true">
          <div className="ex-shadow" />
          <div ref={object} className="ex-object">
            <Plane name="fix" index={5}>
              {studs.map(([x, y], i) => <span key={i} className="ex-stud" style={{ left: `${(x / 1680) * 100}%`, top: `${(y / 1030) * 100}%` }}>{Array.from({ length: 8 }, (_, k) => <i key={k} style={{ '--k': k } as CSSProperties} />)}</span>)}
            </Plane>
            <Plane name="back" index={4}>
              <svg viewBox={VB}><path d={glyphs.R} /></svg>
            </Plane>
            <Plane name="led" index={3}>
              <svg viewBox={VB}>
                <defs>
                  <pattern id="ex-led" width="70" height="70" patternUnits="userSpaceOnUse"><rect x="22" y="28" width="26" height="14" rx="3" className="ex-led-chip" /></pattern>
                  <clipPath id="ex-r"><path d={glyphs.R} /></clipPath>
                </defs>
                <path d={glyphs.R} className="ex-led-board" />
                <rect width="1680" height="1030" fill="url(#ex-led)" clipPath="url(#ex-r)" className="ex-led-grid" />
              </svg>
            </Plane>
            <Plane name="structure" index={2}>
              {Array.from({ length: 13 }, (_, k) => <svg key={k} viewBox={VB} className="ex-wall" style={{ '--k': k } as CSSProperties}><path d={glyphs.R} /></svg>)}
            </Plane>
            <Plane name="acrylic" index={1}>
              <svg viewBox={VB}><path d={glyphs.R} /></svg>
            </Plane>
            <Plane name="face" index={0}>
              <svg viewBox={VB}><defs><linearGradient id="ex-steel" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#f1f2ee" /><stop offset=".45" stopColor="#9fa39b" /><stop offset=".55" stopColor="#d9dbd5" /><stop offset="1" stopColor="#7d817a" /></linearGradient></defs><path d={glyphs.R} /></svg>
            </Plane>
            <div className="ex-halo"><svg viewBox={VB}><path d={glyphs.R} /></svg></div>
          </div>
          <div className="ex-callouts">
            <svg className="ex-lines">{layers.map(layer => <g key={layer.key}><path /><circle r="3.5" /></g>)}</svg>
            {layers.map((layer, i) => (
              <span key={layer.key} className="ex-callout" style={{ top: `${14 + i * 12.5}%` }}><b className="micro">0{i + 1}</b><strong>{layer.label}</strong><small className="micro">{layer.spec}</small></span>
            ))}
          </div>
        </div>

        <ol className="ex-legend">
          {layers.map((layer, i) => <li key={layer.key} className={active === i || active === 6 ? 'is-active' : ''}><span className="micro">0{i + 1}</span>{layer.label}</li>)}
        </ol>
        <p className="micro ex-foot">Desenho ilustrativo · a composição varia conforme o projeto</p>
      </div>
    </section>
  )
}
