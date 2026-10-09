import { useRef, useState, type ComponentType, type CSSProperties } from 'react'
import Media from '../../components/Media'
import PageLink from '../../components/PageLink'
import { services, type Service } from '../../data/services'
import { useMotion } from '../../lib/motion'
import { AcmScene, CustomScene, LetterScene, SignScene, VisualScene } from './scenes'
import './services.css'

const scenes: Record<Service['scene'], ComponentType> = { acm: AcmScene, letter: LetterScene, sign: SignScene, visual: VisualScene, custom: CustomScene }

export default function ServicesPage() {
  const root = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)

  useMotion(root, ({ gsap, ScrollTrigger }) => {
    const q = gsap.utils.selector(root)
    ;(q('.sv-item') as HTMLElement[]).forEach((item, i) => {
      ScrollTrigger.create({ trigger: item, start: 'top 55%', end: 'bottom 55%', onToggle: self => { if (self.isActive) setCurrent(i) } })
    })
    ScrollTrigger.create({ trigger: q('.sv-list')[0], start: 'top 60%', end: 'bottom 40%', toggleClass: { targets: q('.sv-counter')[0], className: 'is-visible' } })
  })

  return (
    <div ref={root} className="services-page">
      <section className="sv-hero" data-nav-theme="dark">
        <p className="micro"><span className="index">A-02</span> Serviços · cinco ofícios, um padrão de acabamento</p>
        <h1 className="display sv-hero-title"><span className="mask-line"><span className="rise-in" style={{ '--d': '1.05s' } as CSSProperties}>Da estrutura</span></span><br /><span className="mask-line"><span className="green rise-in" style={{ '--d': '1.2s' } as CSSProperties}>ao último detalhe.</span></span></h1>
        <div className="sv-hero-foot">
          <p className="lede">Projetamos, fabricamos e instalamos a comunicação visual que fica do lado de fora — e a que acompanha o cliente por dentro.</p>
          <ol className="sv-index">
            {services.map((service, i) => (
              <li key={service.number}>
                <button type="button" onClick={() => document.getElementById(`servico-${service.number}`)?.scrollIntoView({ behavior: 'smooth' })} className={current === i ? 'is-active' : ''}>
                  <span className="micro">{service.number}</span>{service.name}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className={`sv-counter`} aria-hidden="true">
        <span className="sv-counter-track" style={{ '--n': current } as CSSProperties}>{services.map(s => <b key={s.number}>{s.number}</b>)}</span>
        <span className="micro">/ 05</span>
      </div>

      <div className="sv-list">
        {services.map(service => {
          const Scene = scenes[service.scene]
          return (
            <section key={service.number} id={`servico-${service.number}`} className={`sv-item sv-${service.scene}`} data-nav-theme="dark" aria-labelledby={`sv-title-${service.number}`}>
              <header className="sv-copy">
                <p className="micro"><span className="index">Serviço {service.number}</span></p>
                <h2 id={`sv-title-${service.number}`} className="display sv-title">{service.name}</h2>
                <p className="lede sv-lead">{service.lead}</p>
              </header>
              <Scene />
              <div className="sv-detail">
                <p className="body">{service.body}</p>
                <dl className="sv-specs">{service.specs.map(spec => <div key={spec.label}><dt className="micro">{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
                <Media id={service.detail} alt={`Detalhe conceitual · ${service.name.toLowerCase()}`} className="sv-detail-img" sizes="(max-width: 959px) 60vw, 22vw" />
                <PageLink to="/contato" className="link-line newtab" data-magnetic=".15">Orçamento · {service.name}</PageLink>
              </div>
            </section>
          )
        })}
      </div>

      <section className="sv-cta" data-nav-theme="dark">
        <p className="micro">Não encontrou o que procura?</p>
        <h2 className="display sv-cta-title">Se dá para desenhar,<br /><span className="green">dá para construir.</span></h2>
        <PageLink to="/contato" className="btn btn-glow" data-magnetic>Começar um projeto <span className="arrow">↗</span></PageLink>
      </section>
    </div>
  )
}
