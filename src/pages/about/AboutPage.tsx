import { useRef, type CSSProperties } from 'react'
import MagneticGrid from '../../components/MagneticGrid'
import Media from '../../components/Media'
import PageLink from '../../components/PageLink'
import type { MediaId } from '../../data/media'
import { useMotion } from '../../lib/motion'
import './about.css'

const steps: { n: string; title: string; text: string; media?: MediaId; drawing?: boolean }[] = [
  { n: '01', title: 'Briefing', text: 'Visita, medidas, fotos do local e o que a marca precisa dizer para quem passa.', media: 'varejo-antes' },
  { n: '02', title: 'Projeto', text: 'Desenho técnico, simulação, escolha de material e de luz. Antes de cortar, a fachada já existe no papel.', drawing: true },
  { n: '03', title: 'Produção', text: 'Corte, dobra e montagem das peças. Cada painel e cada letra saem com medida de encaixe.', media: 'cnc-acm' },
  { n: '04', title: 'Instalação', text: 'Subestrutura, fixação e alinhamento no lugar — o desenho encontra a parede de verdade.', media: 'fachada-instalacao' },
  { n: '05', title: 'Acabamento', text: 'Juntas, vedação, teste de luz e limpeza. O detalhe é o que faz a fachada parecer inevitável.', media: 'acm-junta' },
]

const materials = ['ACM', 'Aço inox', 'Alumínio', 'Acrílico', 'PVC expandido', 'LED', 'Vinil', 'Vidro']

export default function AboutPage() {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  useMotion(root, ({ gsap }) => {
    const q = gsap.utils.selector(root)
    // As palavras passam por trás da fotografia.
    gsap.fromTo(q('.ab-word-back'), { yPercent: 40 }, { yPercent: -95, ease: 'none', scrollTrigger: { trigger: q('.ab-hero')[0], start: 'top top', end: 'bottom top', scrub: true } })
    gsap.fromTo(q('.ab-band .media'), { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: q('.ab-hero')[0], start: 'top top', end: 'bottom top', scrub: true } })
    const mm = gsap.matchMedia()
    mm.add('(min-width: 960px)', () => {
      const el = track.current!
      const distance = () => Math.max(0, el.scrollWidth - window.innerWidth)
      const tween = gsap.to(el, { x: () => -distance(), ease: 'none', scrollTrigger: { trigger: q('.ab-process')[0], start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 } })
      ;(q('.ab-step') as HTMLElement[]).forEach(step => {
        gsap.fromTo(step.querySelector('.ab-step-num'), { xPercent: 60 }, { xPercent: -20, ease: 'none', scrollTrigger: { trigger: step, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
      })
    })
    gsap.fromTo(q('.ab-principle'), { '--w': '62%' }, { '--w': '112%', ease: 'none', stagger: 0.2, scrollTrigger: { trigger: q('.ab-principles')[0], start: 'top 80%', end: 'bottom 50%', scrub: true } })
    return () => mm.revert()
  })

  return (
    <div ref={root} className="about-page">
      <section className="ab-hero" data-nav-theme="dark" aria-labelledby="ab-title">
        <p className="micro ab-kicker"><span className="index">A-03</span> Sobre a RZ · bastidores</p>
        <h1 id="ab-title" className="sr-only">Por trás da fachada</h1>
        <p className="display ab-word ab-word-front" aria-hidden="true"><span className="mask-line"><span className="rise-in" style={{ '--d': '.9s' } as CSSProperties}>Por trás</span></span></p>
        <div className="ab-band">
          <Media id="atras-do-letreiro" alt="Visualização conceitual: estrutura metálica, cabos e fonte de LED por trás de um letreiro iluminado" priority sizes="100vw" />
        </div>
        <p className="display ab-word ab-word-back" aria-hidden="true">da fachada.</p>
        <p className="lede ab-hero-lede">Antes de uma fachada acender, existe medida, desenho, corte, estrutura e cabo. Essa parte ninguém vê. É dela que a gente gosta.</p>
      </section>

      <section className="ab-manifesto light section" data-nav-theme="light">
        <p className="micro">Quem somos</p>
        <p className="ab-statement">A RZ Design RJ faz comunicação visual no Rio de Janeiro: <strong>fachadas em ACM, letras caixa, letreiros</strong> e peças sob medida.</p>
        <div className="ab-columns">
          <p className="body">O trabalho começa antes do material — entender a rua, a distância de leitura e a luz do lugar.</p>
          <p className="body">E termina depois da instalação: quando a marca acende e o endereço vira referência.</p>
        </div>
      </section>

      <section className="ab-process" data-nav-theme="dark" aria-labelledby="ab-process-title">
        <MagneticGrid spacing={30} />
        <div ref={track} className="ab-track">
          <div className="ab-process-head">
            <p className="micro"><span className="index">Processo</span> 05 etapas</p>
            <h2 id="ab-process-title" className="display ab-process-title">Do primeiro<br />traço à <span className="green">rua.</span></h2>
          </div>
          {steps.map(step => (
            <article key={step.n} className="ab-step">
              <span className="ab-step-num display" aria-hidden="true">{step.n}</span>
              <div className="ab-step-media">
                {step.media ? <Media id={step.media} alt={`Visualização conceitual: ${step.title.toLowerCase()}`} sizes="(max-width: 959px) 80vw, 34vw" /> : (
                  <svg viewBox="0 0 400 300" className="ab-drawing" role="img" aria-label="Desenho técnico de uma fachada com cotas">
                    <path d="M20 250H380M40 250V70H360V250M40 110H360M40 150H360M90 150V250M310 150V250M150 175H250V250" />
                    <path className="ab-dim" d="M40 40H360M40 32V48M360 32V48M18 70V250M10 70H26M10 250H26" />
                    <text x="200" y="30">18 750</text><text x="14" y="168" transform="rotate(-90 14 168)">3 400</text>
                    <text x="200" y="136" className="ab-sign">SUA MARCA</text>
                  </svg>
                )}
              </div>
              <h3 className="h3">{step.title}</h3>
              <p className="body">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ab-materials section" data-nav-theme="dark" aria-labelledby="ab-mat-title">
        <div className="ab-mat-media" data-cursor="explore"><Media id="acm-chapas" alt="Visualização conceitual: chapas de ACM em preto, escovado, branco e verde" sizes="(max-width: 959px) 100vw, 55vw" /></div>
        <div className="ab-mat-copy">
          <p className="micro">Material</p>
          <h2 id="ab-mat-title" className="display h2">Escolhido<br />olhando a rua.</h2>
          <p className="body">Sol, maresia, chuva, distância e luz da noite: o material certo depende do lugar onde a marca vai morar.</p>
          <ul className="ab-chips">{materials.map(m => <li key={m}>{m}</li>)}</ul>
        </div>
      </section>

      <section className="ab-principles section" data-nav-theme="dark" aria-label="Princípios">
        {[['Precisão', 'Medida antes de opinião. Desenho antes de corte.'], ['Acabamento', 'Juntas alinhadas, bordas limpas, luz sem pontos.'], ['Presença', 'A marca precisa ser vista — de perto, de longe, de dia e de noite.']].map(([title, text], i) => (
          <div key={title} className="ab-principle" style={{ '--w': '100%' } as CSSProperties}>
            <span className="micro">0{i + 1}</span>
            <strong className="display">{title}</strong>
            <p className="body">{text}</p>
          </div>
        ))}
      </section>

      <section className="ab-cta section" data-nav-theme="dark">
        <h2 className="display ab-cta-title">Vamos tirar sua<br />marca do papel?</h2>
        <PageLink to="/contato" className="btn btn-glow" data-magnetic>Contar sobre o projeto <span className="arrow">↗</span></PageLink>
      </section>
    </div>
  )
}
