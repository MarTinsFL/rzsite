import { useRef } from 'react'
import Media from '../../components/Media'
import PageLink from '../../components/PageLink'
import { categoryLabels, findProject, projects, selectedSlugs } from '../../data/projects'
import { expandFrom } from '../../lib/expand'
import { scrollState, useMotion } from '../../lib/motion'

/** SELECTED WORK — somente os três projetos mais fortes, deslizando na horizontal. */
export default function SelectedWork() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const items = selectedSlugs.map(slug => findProject(slug)!).filter(Boolean)

  useMotion(root, ({ gsap }) => {
    const q = gsap.utils.selector(root)
    const mm = gsap.matchMedia()
    mm.add('(min-width: 960px)', () => {
      const el = track.current!
      const distance = () => Math.max(0, el.scrollWidth - window.innerWidth)
      const tween = gsap.to(el, { x: () => -distance(), ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.9, invalidateOnRefresh: true, anticipatePin: 1 } })
      const cards = q('.sw-card') as HTMLElement[]
      cards.forEach(card => {
        const image = card.querySelector('img')
        if (image) gsap.fromTo(image, { xPercent: -7, scale: 1.16 }, { xPercent: 7, scale: 1.16, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
        gsap.fromTo(card.querySelector('.sw-media'), { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', ease: 'power2.out', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 95%', end: 'left 45%', scrub: true } })
      })
      gsap.fromTo(q('.sw-title .w'), { xPercent: 0 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${distance()}`, scrub: true } })
      // Inclinação sutil conforme a velocidade do scroll.
      const skewers = (q('.sw-media') as HTMLElement[]).map(media => gsap.quickTo(media, 'skewX', { duration: 0.5, ease: 'power3' }))
      const tick = () => { const v = Math.max(-5, Math.min(5, scrollState.smoothed * -0.22)); skewers.forEach(set => set(v)) }
      gsap.ticker.add(tick)
      // Teclado: ao focar um card fora da tela, rola até a posição em que ele aparece no trilho.
      const onFocus = (event: FocusEvent) => {
        const card = (event.target as HTMLElement).closest<HTMLElement>('.sw-card, .sw-end')
        const st = tween.scrollTrigger
        if (!card || !st) return
        const x = card.offsetLeft - (window.innerWidth - card.offsetWidth) / 2
        const y = st.start + gsap.utils.clamp(0, 1, x / Math.max(1, distance())) * (st.end - st.start)
        const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o: object) => void } }).__lenis
        if (lenis) lenis.scrollTo(y, { immediate: true }); else window.scrollTo(0, y)
      }
      el.addEventListener('focusin', onFocus)
      return () => { gsap.ticker.remove(tick); el.removeEventListener('focusin', onFocus) }
    })
    return () => mm.revert()
  })

  return (
    <section ref={root} className="selected" data-nav-theme="dark" aria-labelledby="selected-title">
      <div ref={track} className="sw-track">
        <div className="sw-intro">
          <p className="micro"><span className="index">03</span> Portfólio · Seleção</p>
          <h2 id="selected-title" className="display sw-title"><span className="w">Selected</span><span className="w outline-text">Work.</span></h2>
          <p className="lede">Três estudos. Uma mesma obsessão: fazer a marca existir do lado de fora.</p>
          <span className="micro sw-count">0{items.length} / {String(projects.length).padStart(2, '0')}</span>
        </div>
        {items.map((project, i) => (
          <PageLink key={project.slug} to={`/projetos/${project.slug}`} className={`sw-card sw-card-${i + 1}`} data-cursor="project" onClick={expandFrom}>
            <div className="sw-media">
              <Media id={project.hero.media} alt={project.hero.alt} sizes="(max-width: 959px) 86vw, 70vw" label={false} />
              <span className="sw-line" aria-hidden="true" />
              <span className="tag tag-concept sw-tag">Estudo conceitual</span>
            </div>
            <div className="sw-meta">
              <span className="micro">{String(i + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
              <h3 className="display sw-name">{project.title}</h3>
              <span className="micro">{project.type} · {project.categories.map(c => categoryLabels[c]).join(' · ')}</span>
            </div>
          </PageLink>
        ))}
        <PageLink to="/projetos" className="sw-end" data-cursor="open">
          <span className="micro">Arquivo completo</span>
          <span className="display sw-end-title">Explorar todos<br />os projetos <span className="arrow">→</span></span>
          <span className="micro">{String(projects.length).padStart(2, '0')} estudos · fachadas · ACM · letras · luz</span>
        </PageLink>
      </div>
    </section>
  )
}
