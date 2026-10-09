import { useRef, type CSSProperties } from 'react'
import BeforeAfter from '../../components/BeforeAfter'
import Media from '../../components/Media'
import PageLink from '../../components/PageLink'
import { categoryLabels, findProject, projects } from '../../data/projects'
import { expandFrom } from '../../lib/expand'
import { useMotion } from '../../lib/motion'
import type { PageProps } from '../../routes'
import './projects.css'

/**
 * Página de projeto. Abre com o hero já ampliado (continuação da imagem clicada) e revela os
 * detalhes aos poucos. Campos sem informação confirmada simplesmente não aparecem.
 */
export default function ProjectPage({ match }: PageProps) {
  const project = findProject(match.slug!)!
  const index = projects.indexOf(project)
  const next = projects[(index + 1) % projects.length]
  const root = useRef<HTMLDivElement>(null)
  const concept = project.status === 'conceito'

  useMotion(root, ({ gsap }) => {
    const q = gsap.utils.selector(root)
    gsap.to(q('.pp-hero .media'), { yPercent: 14, scale: 1.08, ease: 'none', scrollTrigger: { trigger: q('.pp-hero')[0], start: 'top top', end: 'bottom top', scrub: true } })
    gsap.utils.toArray<HTMLElement>(q('.pp-shot')).forEach(shot => {
      const image = shot.querySelector('img')
      gsap.fromTo(shot, { clipPath: 'inset(10% 6% 10% 6%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: shot, start: 'top 95%', end: 'top 40%', scrub: 0.6 } })
      if (image) gsap.fromTo(image, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: shot, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
    gsap.fromTo(q('.pp-spec-row'), { opacity: 0, x: -24 }, { opacity: 1, x: 0, stagger: 0.08, duration: 0.8, scrollTrigger: { trigger: q('.pp-specs')[0], start: 'top 75%' } })
  })

  const meta = [
    { label: 'Categoria', value: project.categories.map(c => categoryLabels[c]).join(' · ') },
    { label: 'Tipo', value: project.type },
    ...(project.location ? [{ label: 'Local', value: project.location }] : []),
    ...(project.year ? [{ label: 'Ano', value: project.year }] : []),
    ...(project.client ? [{ label: 'Cliente', value: project.client }] : []),
    { label: 'Status', value: concept ? 'Estudo conceitual' : 'Obra realizada' },
  ]

  return (
    <div ref={root} className="project-page">
      <section className="pp-hero" data-nav-theme="dark" aria-labelledby="pp-title">
        <Media id={project.hero.media} alt={project.hero.alt} priority sizes="100vw" label={false} />
        <div className="pp-hero-shade" aria-hidden="true" />
        <div className="pp-hero-copy">
          <p className="micro pp-crumb"><a href="/">RZ</a> / <PageLink to="/projetos" sameTab>Projetos</PageLink> / {String(index + 1).padStart(2, '0')}</p>
          <h1 id="pp-title" className="display pp-title" style={{ '--len': project.title.length } as CSSProperties}>{[...project.title].map((c, i) => <span key={i} style={{ '--i': i } as CSSProperties}>{c}</span>)}</h1>
          <p className="lede pp-summary">{project.summary}</p>
        </div>
        <dl className="pp-meta">
          {meta.map(item => <div key={item.label}><dt className="micro">{item.label}</dt><dd>{item.value}</dd></div>)}
        </dl>
        {concept && <span className="tag tag-concept pp-tag">Estudo conceitual · imagens geradas por IA</span>}
      </section>

      {concept && (
        <aside className="pp-disclaimer" data-nav-theme="dark">
          <span className="micro">Nota</span>
          <p>Este é um estudo conceitual da RZ: as imagens são visualizações geradas por IA para explorar material, luz e escala. Não representam uma obra executada nem um cliente real.</p>
        </aside>
      )}

      <section className="pp-story section" data-nav-theme="dark">
        {[['01', 'Conceito', project.concept], ['02', 'Desafio', project.challenge], ['03', 'Solução', project.solution]].map(([n, label, text]) => (
          <div key={n} className="pp-block reveal-up">
            <p className="micro"><span className="index">{n}</span> {label}</p>
            <p className="pp-block-text">{text}</p>
          </div>
        ))}
      </section>

      <section className="pp-specs section light" data-nav-theme="light" aria-label="Ficha técnica">
        <div className="pp-specs-head">
          <p className="micro">Ficha técnica · materiais</p>
          <h2 className="display h2">Materiais.</h2>
        </div>
        <div className="pp-spec-table">
          {project.materials.map((material, i) => (
            <div key={material.name} className="pp-spec-row"><span className="micro">{String(i + 1).padStart(2, '0')}</span><strong>{material.name}</strong><span>{material.spec}</span><i aria-hidden="true" /></div>
          ))}
        </div>
      </section>

      <section className="pp-gallery" data-nav-theme="dark" aria-label="Galeria">
        {project.gallery.map((shot, i) => (
          <figure key={i} className={`pp-shot pp-${shot.layout}`} data-cursor="explore">
            <Media id={shot.media} alt={shot.alt} crop={shot.crop} sizes={shot.layout === 'full' ? '100vw' : '60vw'} />
            {shot.caption && <figcaption className="micro">{String(i + 1).padStart(2, '0')} — {shot.caption}</figcaption>}
          </figure>
        ))}
      </section>

      {project.beforeAfter && (
        <section className="pp-ba section" data-nav-theme="dark" aria-labelledby="pp-ba-title">
          <h2 id="pp-ba-title" className="display h2">Antes <span className="green">/ depois.</span></h2>
          <BeforeAfter before={project.beforeAfter.before} after={project.beforeAfter.after} caption={concept ? 'Simulação conceitual · não é uma obra executada' : 'Fotografias reais'} />
        </section>
      )}

      <section className="pp-next" data-nav-theme="dark">
        <PageLink to={`/projetos/${next.slug}`} className="pp-next-link" data-cursor="project" onClick={expandFrom}>
          <span className="micro">Próximo projeto · {String(projects.indexOf(next) + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
          <span className="display pp-next-title">{next.title} <span className="arrow">→</span></span>
          <Media id={next.hero.media} alt={next.hero.alt} sizes="100vw" label={false} />
        </PageLink>
        <PageLink to="/projetos" sameTab className="link-line pp-all">Todos os projetos</PageLink>
      </section>
    </div>
  )
}
