import { useRef } from 'react'
import { useMotion } from '../../lib/motion'

const words = ['Antes', 'de', 'entrar,', 'seu', 'cliente', 'já', 'viu', 'a', 'sua', 'marca.']

/** Manifesto: as palavras nascem em contorno e são preenchidas no ritmo do scroll. */
export default function Statement() {
  const root = useRef<HTMLElement>(null)
  useMotion(root, ({ gsap }) => {
    const q = gsap.utils.selector(root)
    gsap.fromTo(q('.stm-fill'), { clipPath: 'inset(-10% 100% -10% 0)' }, { clipPath: 'inset(-10% 0% -10% 0)', stagger: 0.6, ease: 'none', scrollTrigger: { trigger: q('.stm-title')[0], start: 'top 78%', end: 'bottom 42%', scrub: 0.5 } })
    gsap.fromTo(q('.stm-rule'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 60%', end: 'bottom 70%', scrub: true } })
  }, { lazy: true })
  return (
    <section ref={root} className="statement light section" data-nav-theme="light" aria-labelledby="statement-title">
      <p className="micro stm-kicker"><span className="index">01</span> Percepção · a primeira impressão acontece do lado de fora</p>
      <h2 id="statement-title" className="display stm-title">
        <span className="sr-only">{words.join(' ')}</span>
        {words.map((word, i) => (
          <span key={i} className={`stm-w${i === words.length - 1 ? ' stm-last' : ''}`} aria-hidden="true">
            <span className="stm-outline">{word}</span>
            <span className="stm-fill">{word}</span>
          </span>
        ))}
      </h2>
      <div className="stm-rule" aria-hidden="true" />
      <div className="stm-notes">
        <p className="lede">Uma fachada não é acabamento. <strong>É posicionamento.</strong></p>
        <p className="body">A RZ transforma identidade em matéria — painel, letra, luz — para que um endereço vire ponto de referência.</p>
        <span className="micro stm-coord">Lida da calçada oposta · em movimento · de dia e de noite</span>
      </div>
    </section>
  )
}
