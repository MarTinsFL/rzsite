import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Logo from '../components/Logo'
import PageLink from '../components/PageLink'
import SoundToggle from '../components/SoundToggle'
import type { PageMeta, RouteMatch } from '../routes'

export const mainLinks = [
  { label: 'Projetos', to: '/projetos', key: 'projects' },
  { label: 'Serviços', to: '/servicos', key: 'services' },
  { label: 'Sobre', to: '/sobre', key: 'about' },
  { label: 'Contato', to: '/contato', key: 'contact' },
] as const

export default function Navigation({ match, meta }: { match: RouteMatch; meta: PageMeta }) {
  const [open, setOpen] = useState(false)
  const [pressed, setPressed] = useState<string | null>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const current = match.key === 'project' ? 'projects' : match.key
  const logoDelay = match.key !== 'home' ? 500 : typeof document !== 'undefined' && document.documentElement.hasAttribute('data-intro-seen') ? 1300 : 4300

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    document.documentElement.style.overflow = 'hidden'
    menu.current?.querySelector<HTMLElement>('a, button')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
      if (event.key === 'Tab' && menu.current) {
        const items = [...menu.current.querySelectorAll<HTMLElement>('a, button')]
        const first = items[0], last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    // A página escolhida abre em outra aba; ao voltar, o menu já está fechado.
    const onHidden = () => { if (document.visibilityState === 'hidden') window.setTimeout(() => { setOpen(false); setPressed(null) }, 200) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onHidden)
    return () => {
      document.documentElement.style.overflow = ''
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('visibilitychange', onHidden)
      ;(previous ?? menuButton.current)?.focus?.()
    }
  }, [open])

  return (
    <>
      <header className="nav" data-theme={meta.navTheme} data-nav>
        <a className="nav-logo" href="/" aria-label="RZ Design RJ — início" data-cursor="">
          <Logo delay={logoDelay} />
        </a>
        <span className="nav-sheet" aria-hidden="true">{meta.sheet}</span>
        <nav className="nav-links" aria-label="Navegação principal">
          {mainLinks.map(link => (
            <PageLink key={link.to} to={link.to} className="nav-link newtab" aria-current={current === link.key ? 'page' : undefined}>{link.label}</PageLink>
          ))}
        </nav>
        <div className="nav-tools">
          <SoundToggle />
          {match.key !== 'contact' && <PageLink to="/contato" className="btn nav-cta" data-magnetic>Orçamento <span className="arrow">↗</span></PageLink>}
        </div>
        <button ref={menuButton} type="button" className="menu-button" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(true)}>Menu <i aria-hidden="true" /></button>
      </header>

      <div ref={menu} id="menu" className={`menu${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!open} data-lenis-prevent>
        <div className="menu-top">
          <a className="nav-logo" href="/" tabIndex={open ? 0 : -1} aria-label="RZ Design RJ — início"><Logo animate={false} /></a>
          <button type="button" className="menu-close" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>Fechar ×</button>
        </div>
        <nav className="menu-list" aria-label="Navegação móvel">
          <a href="/" className={`menu-item${pressed === '/' ? ' is-pressed' : ''}`} style={{ '--i': 0 } as CSSProperties} tabIndex={open ? 0 : -1} onPointerDown={() => setPressed('/')} aria-current={current === 'home' ? 'page' : undefined}><small>01</small>Home</a>
          {mainLinks.map((link, index) => (
            <PageLink key={link.to} to={link.to} className={`menu-item${pressed === link.to ? ' is-pressed' : ''}`} style={{ '--i': index + 1 } as CSSProperties} tabIndex={open ? 0 : -1} onPointerDown={() => setPressed(link.to)} onPointerCancel={() => setPressed(null)} aria-current={current === link.key ? 'page' : undefined}>
              <small>0{index + 2}</small>{link.label}
            </PageLink>
          ))}
        </nav>
        <div className="menu-foot">
          <SoundToggle tabIndex={open ? 0 : -1} />
          <span className="micro">RZ / Visual Engineering · Rio de Janeiro</span>
        </div>
      </div>
    </>
  )
}
