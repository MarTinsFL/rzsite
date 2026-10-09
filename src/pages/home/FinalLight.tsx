import { useRef } from 'react'
import Media from '../../components/Media'
import PageLink from '../../components/PageLink'
import { sound } from '../../lib/sound'
import { useMotion } from '../../lib/motion'

/**
 * Último momento: tela escura, só a silhueta de um prédio. Com o scroll, a iluminação da
 * fachada acende por partes — e a pergunta aparece.
 */
export default function FinalLight() {
  const root = useRef<HTMLElement>(null)
  useMotion(root, ({ gsap }) => {
    const q = gsap.utils.selector(root)
    const el = root.current!
    gsap.set(el, { '--r1': '0%', '--r2': '0%', '--r3': '0%', '--r4': '0%', '--all': '0%' })
    gsap.set(q('.fl-title .mask-line > span'), { yPercent: 115 })
    gsap.set(q('.fl-cta'), { opacity: 0, y: 30 })
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: '+=220%', pin: true, scrub: 0.8, anticipatePin: 1 } })
    tl.to(el, { '--sil': 1, duration: 10 }, 0)
      .to(el, { '--r1': '34%', duration: 8, ease: 'steps(4)' }, 12).add(() => sound.lightOn(), 12)
      .to(el, { '--r2': '36%', duration: 8, ease: 'steps(4)' }, 22)
      .to(el, { '--r3': '40%', duration: 8, ease: 'steps(4)' }, 31)
      .to(el, { '--r4': '46%', duration: 9, ease: 'power2.out' }, 40)
      .to(el, { '--all': '140%', duration: 18, ease: 'power2.inOut' }, 50)
      .to(q('.fl-shade'), { opacity: 0.6, duration: 12 }, 66)
      .to(q('.fl-title .mask-line > span'), { yPercent: 0, duration: 12, stagger: 4, ease: 'power3.out' }, 70)
      .to(q('.fl-cta'), { opacity: 1, y: 0, duration: 10, ease: 'power3.out' }, 84)
  })
  return (
    <section ref={root} className="final" data-nav-theme="dark" aria-labelledby="final-title">
      <div className="fl-viewport">
        <div className="fl-photo fl-dark" aria-hidden="true"><Media id="esquina-noturna" alt="" sizes="100vw" label={false} /></div>
        <div className="fl-photo fl-lit"><Media id="esquina-noturna" alt="Visualização conceitual: prédio de esquina em ACM preto acendendo a iluminação da fachada à noite" sizes="100vw" label="Visualização conceitual · IA" /></div>
        <div className="fl-shade" aria-hidden="true" />
        <div className="fl-copy">
          <h2 id="final-title" className="display fl-title"><span className="mask-line"><span>Sua empresa</span></span> <span className="mask-line"><span>pode ser</span></span> <span className="mask-line"><span className="green">a próxima</span></span> <span className="mask-line"><span className="green">a acender.</span></span></h2>
          <div className="fl-cta">
            <PageLink to="/contato" className="btn btn-glow fl-button" data-magnetic=".3">Começar um projeto <span className="arrow">↗</span></PageLink>
            <span className="micro">Briefing direto no WhatsApp da RZ</span>
          </div>
        </div>
      </div>
    </section>
  )
}
