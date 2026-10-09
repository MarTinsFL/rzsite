import { useRef, useState } from 'react'
import AcmShader, { finishes } from '../../components/AcmShader'
import { sound } from '../../lib/sound'

const options = [
  { key: 'black', label: 'Black', name: 'Preto fosco', swatch: '#121212', reflect: '04%', rough: '0.26', aniso: '0.00' },
  { key: 'brushed', label: 'Brushed', name: 'Alumínio escovado', swatch: 'linear-gradient(90deg,#9a9d9f,#d6d8d9,#8e9193)', reflect: '62%', rough: '0.30', aniso: '0.88' },
  { key: 'white', label: 'White', name: 'Branco brilho', swatch: '#e6e6e2', reflect: '06%', rough: '0.20', aniso: '0.00' },
  { key: 'green', label: 'RZ Green', name: 'Verde RZ', swatch: '#a9cf46', reflect: '09%', rough: '0.28', aniso: '0.00' },
] as const

type Key = typeof options[number]['key']

/** MATERIAL REACTOR — um painel de ACM que responde à luz e ao acabamento. */
export default function MaterialReactor() {
  const [finish, setFinish] = useState<Key>('black')
  const lightX = useRef<HTMLSpanElement>(null)
  const lightY = useRef<HTMLSpanElement>(null)
  const current = options.find(option => option.key === finish)!
  return (
    <section className="reactor" data-nav-theme="dark" aria-labelledby="reactor-title">
      <div className="rx-head">
        <p className="micro"><span className="index">05</span> Materiais · em tempo real</p>
        <h2 id="reactor-title" className="display rx-title">Material<br /><span className="outline-text">Reactor</span></h2>
        <p className="lede">Mova a luz. Troque o acabamento. O ACM muda de caráter com cada fonte de luz — por isso escolhemos material olhando a rua, não o catálogo.</p>
      </div>
      <div className="rx-stage">
        <AcmShader finish={finishes[finish]} onLight={(x, y) => {
          if (lightX.current) lightX.current.textContent = x.toFixed(2)
          if (lightY.current) lightY.current.textContent = y.toFixed(2)
        }} />
        <div className="rx-fallback" aria-hidden="true" data-finish={finish} />
        <i className="cross rx-x1" /><i className="cross rx-x2" />
        <span className="micro rx-hint">Mova o cursor · a luz acompanha</span>
        <dl className="rx-readout">
          <div><dt className="micro">Acabamento</dt><dd>{current.name}</dd></div>
          <div><dt className="micro">Reflexão</dt><dd>{current.reflect}</dd></div>
          <div><dt className="micro">Rugosidade</dt><dd>{current.rough}</dd></div>
          <div><dt className="micro">Anisotropia</dt><dd>{current.aniso}</dd></div>
          <div><dt className="micro">Luz x / y</dt><dd><span ref={lightX}>0.62</span> / <span ref={lightY}>0.38</span></dd></div>
        </dl>
      </div>
      <div className="rx-switch" role="group" aria-label="Acabamento do painel de ACM">
        {options.map(option => (
          <button key={option.key} type="button" aria-pressed={finish === option.key} className={finish === option.key ? 'is-active' : ''} onClick={() => { setFinish(option.key); sound.click() }} data-magnetic=".12">
            <i style={{ background: option.swatch }} />
            <span className="rx-label">{option.label}</span>
            <span className="micro">{option.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
