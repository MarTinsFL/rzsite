import Logo from '../components/Logo'
import PageLink from '../components/PageLink'
import brand, { whatsappUrl } from '../config/brand'
import { glyphs, glyphViewBox } from '../lib/glyphs'
import type { PageMeta, RouteMatch } from '../routes'
import { mainLinks } from './Navigation'

export default function Footer({ match, meta }: { match: RouteMatch; meta: PageMeta }) {
  const whatsapp = whatsappUrl()
  const sheetNumber = { home: '01', projects: '02', project: '02', services: '03', about: '04', contact: '05', notfound: '00' }[match.key]
  return (
    <footer className="footer" data-nav-theme="dark">
      <svg className="footer-giant" viewBox={`-60 -140 ${glyphViewBox.width + 120} ${glyphViewBox.height + 280}`} aria-hidden="true">
        <path d={glyphs.R} /><path d={glyphs.barR} /><path d={glyphs.Z} /><path d={glyphs.barZ} />
        <g className="fg-dims">
          <path d="M0 -70H3374M0 -95V-45M3374 -95V-45" />
          <text x="1687" y="-90" textAnchor="middle">3374</text>
          <path d="M-40 0V1021M-60 0H-20M-60 1021H-20" />
        </g>
      </svg>

      <div className="footer-head">
        <h2 className="display footer-title">Vamos colocar<br />sua marca<br /><em>na rua.</em></h2>
        {match.key !== 'contact' && <PageLink to="/contato" className="btn btn-glow" data-magnetic data-cursor="">Começar um projeto <span className="arrow">↗</span></PageLink>}
      </div>

      <div className="footer-grid">
        <div><Logo className="footer-logo" src="/images/rz-logo-1024.webp" lazy /></div>
        <div>
          <h3>Contato</h3>
          <ul>
            {whatsapp && <li><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="newtab">WhatsApp</a></li>}
            {brand.instagram && <li><a href={brand.instagram} target="_blank" rel="noopener noreferrer" className="newtab">Instagram</a></li>}
            <li><PageLink to="/contato" className="newtab">Pedir orçamento</PageLink></li>
          </ul>
        </div>
        <div>
          <h3>Páginas</h3>
          <ul>
            <li><a href="/">Home</a></li>
            {mainLinks.map(link => <li key={link.to}><PageLink to={link.to} className="newtab">{link.label}</PageLink></li>)}
          </ul>
        </div>
        <div>
          <h3>Fazemos</h3>
          <ul className="body">
            <li>Fachadas em ACM</li><li>Letras caixa</li><li>Letreiros luminosos</li><li>Comunicação visual</li>
          </ul>
        </div>
      </div>

      <div className="titleblock" aria-label="Carimbo da prancha">
        <div>Projeto<b>RZ Design RJ — Comunicação visual</b></div>
        <div>Prancha<b>{meta.sheet}</b></div>
        <div>Folha<b>{sheetNumber} / 05</b></div>
        <div>Local<b>Rio de Janeiro · 22°54′S</b></div>
      </div>

      <div className="footer-base">
        <span>© {new Date().getFullYear()} RZ Design RJ · Construímos o que as pessoas notam.</span>
        <span>Imagens marcadas como conceituais foram geradas por IA e não representam obras executadas.</span>
      </div>
      <div className="footer-beam beam" aria-hidden="true" />
    </footer>
  )
}
