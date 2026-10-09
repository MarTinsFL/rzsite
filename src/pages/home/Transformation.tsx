import { useRef } from 'react'
import BeforeAfter from '../../components/BeforeAfter'
import PageLink from '../../components/PageLink'
import { findProject } from '../../data/projects'
import { useMotion } from '../../lib/motion'

/** O mesmo lugar, outra presença — o título começa enorme e se ajusta enquanto a imagem chega. */
export default function Transformation() {
  const root = useRef<HTMLElement>(null)
  const project = findProject('fachada-acm-varejo')!
  useMotion(root, ({ gsap }) => {
    const q = gsap.utils.selector(root)
    gsap.fromTo(q('.tf-title'), { scale: 2.6, xPercent: -2 }, { scale: 1, xPercent: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'top 15%', scrub: 0.6 } })
    gsap.fromTo(q('.ba-frame'), { clipPath: 'inset(12% 8% 12% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: q('.ba')[0], start: 'top 90%', end: 'top 35%', scrub: 0.6 } })
  }, { lazy: true })
  return (
    <section ref={root} className="transform section" data-nav-theme="dark" aria-labelledby="transform-title">
      <header className="tf-head">
        <p className="micro"><span className="index">07</span> Transformação</p>
        <h2 id="transform-title" className="display tf-title">O mesmo lugar.<br /><span>Outra presença.</span></h2>
      </header>
      <BeforeAfter before={project.beforeAfter!.before} after={project.beforeAfter!.after} caption="Simulação conceitual · não é uma obra executada" />
      <div className="tf-foot">
        <p className="lede">Reboco cansado, fiação aparente e um luminoso apagado viram um plano único de ACM com letras caixa. O endereço é o mesmo. A percepção, não.</p>
        <PageLink to={`/projetos/${project.slug}`} className="link-line newtab" data-cursor="project">Ver o estudo completo</PageLink>
      </div>
    </section>
  )
}
