import { useEffect, type CSSProperties } from 'react'
import { sound } from '../lib/sound'
import './notfound.css'

/** 404 — um letreiro com mau contato. */
export default function NotFoundPage() {
  useEffect(() => {
    const timer = window.setInterval(() => { if (Math.random() > 0.55) sound.buzz() }, 2600)
    return () => window.clearInterval(timer)
  }, [])
  return (
    <section className="nf" data-nav-theme="dark" aria-labelledby="nf-title">
      <div className="nf-wall" aria-hidden="true" />
      <p className="micro nf-kicker"><span className="index">A-404</span> Prancha não encontrada</p>
      <div className="nf-sign" aria-hidden="true">
        {['4', '0', '4'].map((digit, i) => (
          <span key={i} className={`nf-digit${i === 1 ? ' is-faulty' : ''}`} style={{ '--i': i } as CSSProperties}>
            <span className="nf-halo">{digit}</span>
            {[5, 4, 3, 2, 1].map(d => <span key={d} className="nf-depth" style={{ '--d': d } as CSSProperties}>{digit}</span>)}
            <span className="nf-face">{digit}</span>
          </span>
        ))}
      </div>
      <h1 id="nf-title" className="display nf-title">Essa fachada<br /><span className="green">ainda não existe.</span></h1>
      <div className="nf-actions">
        <a href="/" className="btn btn-glow" data-magnetic>Voltar para RZ <span className="arrow">↗</span></a>
        <span className="micro">Mas se você quiser, a gente constrói.</span>
      </div>
    </section>
  )
}
