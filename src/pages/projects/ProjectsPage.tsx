import { useMemo, useRef, useState } from 'react'
import Media from '../../components/Media'
import PageLink from '../../components/PageLink'
import { categoryLabels, projects, type ProjectCategory } from '../../data/projects'
import { expandFrom } from '../../lib/expand'
import { loadMotion, prefersReducedMotion, useMotion } from '../../lib/motion'
import { sound } from '../../lib/sound'
import './projects.css'

const filters: ('todos' | ProjectCategory)[] = ['todos', 'fachadas', 'acm', 'letras-caixa', 'letreiros', 'iluminacao']

/** Ritmo editorial: larguras, alinhamentos e proporções diferentes a cada posição. */
const slots = ['s-a', 's-b', 's-c', 's-d', 's-e', 's-f', 's-g']

export default function ProjectsPage() {
  const root = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<(typeof filters)[number]>('todos')
  const counts = useMemo(() => Object.fromEntries(filters.map(f => [f, f === 'todos' ? projects.length : projects.filter(p => p.categories.includes(f)).length])), [])
  const visible = projects.filter(project => filter === 'todos' || project.categories.includes(filter))

  useMotion(root, ({ gsap, ScrollTrigger }) => {
    const q = gsap.utils.selector(root)
    ScrollTrigger.batch(q('.pj-item'), {
      start: 'top 88%',
      once: true,
      onEnter: batch => gsap.fromTo(batch, { clipPath: 'inset(18% 0% 18% 0%)', y: 60 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.3, ease: 'expo.out', stagger: 0.12, clearProps: 'clipPath' }),
    })
    gsap.utils.toArray<HTMLElement>(q('.pj-media img')).forEach(image => gsap.fromTo(image, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: image, start: 'top bottom', end: 'bottom top', scrub: true } }))
  })

  const choose = (next: (typeof filters)[number]) => {
    if (next === filter) return
    sound.click()
    if (prefersReducedMotion() || !grid.current) { setFilter(next); return }
    loadMotion().then(({ Flip, gsap, ScrollTrigger }) => {
      const items = gsap.utils.toArray<HTMLElement>(grid.current!.querySelectorAll('.pj-item'))
      const state = Flip.getState(items, { props: 'opacity' })
      setFilter(next)
      requestAnimationFrame(() => {
        Flip.from(state, {
          duration: 0.9, ease: 'expo.inOut', absolute: true, nested: true, prune: true,
          onEnter: elements => gsap.fromTo(elements, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.7, delay: 0.25 }),
          onLeave: elements => gsap.to(elements, { opacity: 0, scale: 0.94, duration: 0.4 }),
          onComplete: () => ScrollTrigger.refresh(),
        })
      })
    })
  }

  return (
    <div ref={root} className="projects-page">
      <section className="pj-hero" data-nav-theme="dark">
        <p className="micro pj-kicker"><span className="index">A-01</span> Portfólio · {String(projects.length).padStart(2, '0')} estudos</p>
        <h1 className="display pj-title">
          <span className="pj-line pj-line-1">Projetos que</span>
          <span className="pj-line pj-line-2">Ocupam espaço.</span>
        </h1>
        <div className="pj-intro">
          <p className="lede">Uma seleção de projetos pensados para transformar presença em percepção.</p>
          <p className="pj-notice micro"><span className="tag tag-concept">Estudos conceituais</span> As imagens desta seleção são visualizações geradas por IA para mostrar possibilidades de material, luz e escala. Não representam obras executadas. As fotos dos projetos reais da RZ entram aqui.</p>
        </div>
        <div className="pj-filters" role="group" aria-label="Filtrar projetos por categoria">
          {filters.map(f => (
            <button key={f} type="button" className={filter === f ? 'is-active' : ''} aria-pressed={filter === f} onClick={() => choose(f)}>
              {f === 'todos' ? 'Todos' : categoryLabels[f]}<sup>{String(counts[f]).padStart(2, '0')}</sup>
            </button>
          ))}
        </div>
      </section>

      <div ref={grid} className="pj-grid" aria-live="polite">
        {visible.map((project, i) => (
          <article key={project.slug} className={`pj-item ${slots[i % slots.length]}`} data-flip-id={project.slug}>
            <PageLink to={`/projetos/${project.slug}`} className="pj-link" data-cursor="project" onClick={expandFrom}>
              <div className="pj-media">
                <Media id={project.hero.media} alt={project.hero.alt} focus={project.hero.focus} sizes="(max-width: 959px) 92vw, 70vw" label={false} />
                <span className="pj-shade" aria-hidden="true" />
                <span className="pj-cross" aria-hidden="true" />
                <span className="pj-counter micro" aria-hidden="true">{String(projects.indexOf(project) + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
                {project.status === 'conceito' && <span className="tag tag-concept pj-tag">Estudo conceitual</span>}
              </div>
              <div className="pj-meta">
                <h2 className="display pj-name">{project.title}</h2>
                <p className="body pj-summary">{project.summary}</p>
                <p className="micro">{project.type} · {project.categories.map(c => categoryLabels[c]).join(' · ')}</p>
              </div>
            </PageLink>
          </article>
        ))}
      </div>

      <section className="pj-cta" data-nav-theme="dark">
        <p className="micro">O próximo da lista</p>
        <PageLink to="/contato" className="display pj-cta-title" data-cursor="open">Seu projeto pode<br />ser o <span className="green">próximo.</span></PageLink>
      </section>
    </div>
  )
}
