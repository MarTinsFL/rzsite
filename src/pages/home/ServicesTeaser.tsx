import { useEffect, useRef, useState } from 'react'
import MagneticGrid from '../../components/MagneticGrid'
import Media from '../../components/Media'
import PageLink from '../../components/PageLink'
import { services } from '../../data/services'
import { isFinePointer } from '../../lib/motion'

/** Alguns serviços (não todos): uma lista cinética sobre a grade de projeto. */
export default function ServicesTeaser() {
  const root = useRef<HTMLElement>(null)
  const preview = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(-1)
  const shown = services.slice(0, 4)

  useEffect(() => {
    const el = root.current, card = preview.current
    if (!el || !card || !isFinePointer()) return
    let x = 0, y = 0, tx = 0, ty = 0, frame = 0
    const loop = () => {
      x += (tx - x) * 0.14; y += (ty - y) * 0.14
      card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${(tx - x) * 0.03}deg)`
      frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(loop) : 0
    }
    const move = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      tx = event.clientX - rect.left; ty = event.clientY - rect.top
      if (!frame) frame = requestAnimationFrame(loop)
    }
    el.addEventListener('pointermove', move, { passive: true })
    return () => { cancelAnimationFrame(frame); el.removeEventListener('pointermove', move) }
  }, [])

  return (
    <section ref={root} className="teaser" data-nav-theme="dark" aria-labelledby="teaser-title">
      <MagneticGrid />
      <header className="st-head">
        <p className="micro"><span className="index">06</span> Serviços · alguns dos nossos ofícios</p>
        <h2 id="teaser-title" className="display st-title">O que a RZ<br /><span className="outline-text">constrói.</span></h2>
      </header>
      <ul className={`st-list${hovered >= 0 ? ' has-hover' : ''}`}>
        {shown.map((service, i) => (
          <li key={service.number} className={hovered === i ? 'is-hovered' : ''} onPointerEnter={() => setHovered(i)} onPointerLeave={() => setHovered(-1)}>
            <PageLink to="/servicos" className="st-row" data-cursor="explore">
              <span className="index">{service.number}</span>
              <span className="st-name">{service.name}</span>
              <span className="st-desc body">{service.short}</span>
              <span className="st-arrow" aria-hidden="true">↗</span>
              <Media id={service.media} alt="" className="st-thumb" sizes="30vw" label={false} />
            </PageLink>
          </li>
        ))}
      </ul>
      <div ref={preview} className={`st-preview${hovered >= 0 ? ' is-visible' : ''}`} aria-hidden="true">
        {shown.map((service, i) => <Media key={service.number} id={service.media} alt="" className={hovered === i ? 'is-current' : ''} sizes="28vw" label={false} />)}
      </div>
      <div className="st-foot">
        <span className="micro">+ projetos personalizados · totens · painéis · peças sob medida</span>
        <PageLink to="/servicos" className="btn" data-magnetic>Explorar serviços <span className="arrow">↗</span></PageLink>
      </div>
    </section>
  )
}
