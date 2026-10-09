import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/base.css'
import Shell from './app/Shell'
import { matchRoute, pageLoaders } from './routes'

const match = matchRoute(window.location.pathname)

pageLoaders[match.key]().then(({ default: Page }) => {
  const app = <StrictMode><Shell match={match}><Page match={match} /></Shell></StrictMode>
  const root = document.getElementById('root')!
  // Hidrata só se o HTML estático for desta rota (alguns hosts devolvem a Home para qualquer URL).
  const prerendered = root.querySelector<HTMLElement>('main[data-page]')?.dataset.page
  if (prerendered === match.key) hydrateRoot(root, app)
  else { root.textContent = ''; createRoot(root).render(app) }
  ;(window as unknown as { __rzReady?: boolean }).__rzReady = true
})
