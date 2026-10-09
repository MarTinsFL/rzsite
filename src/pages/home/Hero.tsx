import { Fragment, useEffect, useRef, type CSSProperties } from 'react'
import Media from '../../components/Media'
import PageLink from '../../components/PageLink'
import { isFinePointer, prefersReducedMotion, useMotion } from '../../lib/motion'

/**
 * Teste A/B de headline. A (escolhida): CONSTRUÍMOS O QUE AS PESSOAS NOTAM.
 * B: SUA MARCA PRECISA SER VISTA. — a palavra final é o próprio letreiro, montado na fachada.
 */
const HEADLINES = {
  // em: largura da palavra em "em" (Archivo 900 / 125%) — dimensiona o letreiro para caber na faixa.
  notam: { lead: ['Construímos o que', 'as pessoas'], sign: 'NOTAM.', em: 6.3, full: 'Construímos o que as pessoas notam.' },
  vista: { lead: ['Sua marca', 'precisa ser'], sign: 'VISTA.', em: 5.35, full: 'Sua marca precisa ser vista.' },
}
export const HEADLINE: keyof typeof HEADLINES = 'notam'

const depth = [7, 6, 5, 4, 3, 2, 1]

/** Letras animadas uma a uma, agrupadas por palavra (a quebra de linha nunca corta uma palavra). */
function Chars({ text, offset = 0 }: { text: string; offset?: number }) {
  let index = offset
  return <>{text.split(' ').map((word, w) => (
    <Fragment key={w}>{w > 0 && ' '}<span className="w">{[...word].map(char => <span key={index} className="ch" style={{ '--i': index++ } as CSSProperties}>{char}</span>)}</span></Fragment>
  ))}</>
}

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const dolly = useRef<HTMLDivElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const headline = HEADLINES[HEADLINE]

  // Parallax físico: cada plano reage ao ponteiro com uma intensidade (ver --depth no CSS).
  useEffect(() => {
    const el = root.current
    if (!el || !isFinePointer() || prefersReducedMotion()) return
    let tx = 0, ty = 0, x = 0, y = 0, frame = 0
    const loop = () => {
      x += (tx - x) * 0.055
      y += (ty - y) * 0.055
      el.style.setProperty('--mx', x.toFixed(4))
      el.style.setProperty('--my', y.toFixed(4))
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.0004 ? requestAnimationFrame(loop) : 0
    }
    const move = (event: PointerEvent) => {
      tx = event.clientX / window.innerWidth - 0.5
      ty = event.clientY / window.innerHeight - 0.5
      if (!frame) frame = requestAnimationFrame(loop)
    }
    const leave = () => { tx = 0; ty = 0; if (!frame) frame = requestAnimationFrame(loop) }
    el.addEventListener('pointermove', move, { passive: true })
    el.addEventListener('pointerleave', leave)
    return () => { cancelAnimationFrame(frame); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [])

  // Ao rolar, a câmera recua e revela a fachada inteira; o texto sobe mais rápido (outro plano).
  useMotion(root, ({ gsap }) => {
    gsap.to(dolly.current, { scale: 0.88, yPercent: 6, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to(copy.current, { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: '70% top', scrub: true } })
  })

  return (
    <section ref={root} className="hero" data-nav-theme="dark" aria-labelledby="hero-title">
      <div className="hero-stage">
        <div className="hero-cam">
          <div ref={dolly} className="hero-dolly">
            <div className="hl hl-photo">
              <Media id="hero-facade-night" priority sizes="(max-width: 959px) 1600px, 130vw" label={false} alt="Visualização conceitual: fachada comercial noturna com faixa de ACM preto e vitrine iluminada" />
            </div>
            <div className="hl hl-facade" aria-hidden="true">
              <Media id="hero-facade-night" sizes="(max-width: 959px) 1600px, 130vw" label={false} alt="" />
            </div>
            <div className="hl hl-sign">
              <div className="sign" aria-hidden="true" style={{ '--em': headline.em } as CSSProperties}>
                <span className="sign-spill" />
                <span className="sign-word">
                  <span className="sign-halo">{headline.sign}</span>
                  {depth.map(d => <span key={d} className={`sign-depth d${d}`} style={{ '--d': d } as CSSProperties}>{headline.sign}</span>)}
                  <span className="sign-face">{headline.sign}</span>
                  <span className="sign-gloss">{headline.sign}</span>
                  <span className="sign-note micro">Letra caixa · face acrílica + halo LED</span>
                  <span className="sign-dim"><i /><b className="micro">h 520</b></span>
                </span>
              </div>
            </div>
            <div className="hl hl-wet" aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className="hero-shade" aria-hidden="true" />

      <div ref={copy} className="hero-copy">
        <h1 id="hero-title" className="sr-only">{headline.full}</h1>
        <p className="hero-lead display" aria-hidden="true">
          <span className="line"><Chars text={headline.lead[0]} /></span>{' '}
          <span className="line"><Chars text={headline.lead[1]} offset={headline.lead[0].length} /></span>
        </p>
        <div className="hero-sub">
          <p className="lede">Fachadas em ACM, letras caixa e letreiros luminosos no Rio de Janeiro. <span>Do projeto à rua.</span></p>
          <div className="hero-ctas">
            <PageLink to="/contato" className="btn btn-glow" data-magnetic>Começar um projeto <span className="arrow">↗</span></PageLink>
            <PageLink to="/projetos" className="link-line newtab" data-magnetic=".15">Ver projetos</PageLink>
          </div>
        </div>
      </div>

      <div className="hero-hud" aria-hidden="true">
        <span className="hud-tl micro">Plano 06 · Interface</span>
        <span className="hud-bl micro">22°54′S · 43°12′W — Rio de Janeiro</span>
        <span className="hud-br micro">Scroll <i /> 01 / 12</span>
        <span className="hud-side micro">Visualização conceitual · IA</span>
        <i className="cross hud-x1" /><i className="cross hud-x2" />
      </div>
    </section>
  )
}
