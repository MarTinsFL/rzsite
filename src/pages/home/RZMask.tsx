import { useRef } from 'react'
import Media from '../../components/Media'
import type { MediaId } from '../../data/media'
import { glyphs, glyphViewBox } from '../../lib/glyphs'
import { useMotion } from '../../lib/motion'

const strip: MediaId[] = ['academia-pulso', 'restaurante-mar', 'totem-120', 'bar-noturno', 'letras-nova']

/**
 * RZ maior que a tela: começamos DENTRO do R (só imagem), atravessamos as letras e elas se
 * revelam como janelas para os projetos. Recorte em SVG com regra evenodd sobre as fotos.
 */
export default function RZMask() {
  const root = useRef<HTMLElement>(null)
  const cut = `M-30000 -30000H33374V31040H-30000Z ${glyphs.R} ${glyphs.barR} ${glyphs.Z} ${glyphs.barZ}`
  useMotion(root, ({ gsap }) => {
    const q = gsap.utils.selector(root)
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root.current, start: 'top top', end: '+=230%', pin: true, scrub: 0.8, anticipatePin: 1 } })
    tl.fromTo(q('.rm-cut'), { scale: 34 }, { scale: 1, duration: 60, ease: 'power3.inOut' }, 0)
      .fromTo(q('.rm-strip'), { xPercent: 0 }, { xPercent: -42, duration: 100 }, 0)
      .fromTo(q('.rm-title .mask-line > span'), { yPercent: 115 }, { yPercent: 0, duration: 14, stagger: 4, ease: 'power3.out' }, 64)
      .fromTo(q('.rm-outline'), { opacity: 0 }, { opacity: 1, duration: 16 }, 40)
      .fromTo(q('.rm-dims'), { opacity: 0 }, { opacity: 1, duration: 10 }, 56)
      .to(q('.rm-cut'), { scale: 0.86, duration: 40, ease: 'power1.inOut' }, 60)
  })
  return (
    <section ref={root} className="rzmask" data-nav-theme="dark" aria-labelledby="rzmask-title">
      <div className="rm-viewport">
        <div className="rm-strip" aria-hidden="true">
          {strip.map(id => <Media key={id} id={id} alt="" sizes="60vw" label={false} />)}
        </div>
        <svg className="rm-cut" viewBox={`0 0 ${glyphViewBox.width} ${glyphViewBox.height}`} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
          <path d={cut} fillRule="evenodd" />
          <g className="rm-outline"><path d={glyphs.R} /><path d={glyphs.barR} /><path d={glyphs.Z} /><path d={glyphs.barZ} /></g>
          <g className="rm-dims">
            <path d="M0 -60H3374M0 -80V-40M3374 -80V-40" />
            <path d="M-60 0V1021M-80 0H-40M-80 1021H-40" />
          </g>
        </svg>
        <div className="rm-copy">
          <p className="micro"><span className="index">08</span> Dentro de cada letra, um projeto</p>
          <h2 id="rzmask-title" className="display rm-title"><span className="mask-line"><span>A marca é</span></span> <span className="mask-line"><span className="green">o material.</span></span></h2>
        </div>
      </div>
    </section>
  )
}
