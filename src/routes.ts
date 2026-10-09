import type { ComponentType } from 'react'
import { findProject, projects } from './data/projects'

export type PageKey = 'home' | 'projects' | 'project' | 'services' | 'about' | 'contact' | 'notfound'

/** Transição de entrada de cada página — alternada de propósito. */
export type IntroVariant = 'home' | 'plate' | 'acm' | 'beam' | 'expand' | 'flicker'

export type RouteMatch = { key: PageKey; path: string; slug?: string }
export type PageProps = { match: RouteMatch }
export type PageMeta = { title: string; description: string; image: string; intro: IntroVariant; sheet: string; navTheme: 'dark' | 'light' }

export const pageLoaders: Record<PageKey, () => Promise<{ default: ComponentType<PageProps> }>> = {
  home: () => import('./pages/home/HomePage'),
  projects: () => import('./pages/projects/ProjectsPage'),
  project: () => import('./pages/projects/ProjectPage'),
  services: () => import('./pages/services/ServicesPage'),
  about: () => import('./pages/about/AboutPage'),
  contact: () => import('./pages/contact/ContactPage'),
  notfound: () => import('./pages/NotFoundPage'),
}

/** Usado pelo prerender para injetar CSS e modulepreload de cada página. */
export const pageModules: Record<PageKey, string> = {
  home: 'src/pages/home/HomePage.tsx',
  projects: 'src/pages/projects/ProjectsPage.tsx',
  project: 'src/pages/projects/ProjectPage.tsx',
  services: 'src/pages/services/ServicesPage.tsx',
  about: 'src/pages/about/AboutPage.tsx',
  contact: 'src/pages/contact/ContactPage.tsx',
  notfound: 'src/pages/NotFoundPage.tsx',
}

export function normalizePath(pathname: string) {
  let path = pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '')
  if (path.length > 1) path = path.replace(/\/+$/, '')
  try { path = decodeURIComponent(path) } catch { /* keep raw path */ }
  return path.toLowerCase() || '/'
}

export function matchRoute(pathname: string): RouteMatch {
  const path = normalizePath(pathname)
  if (path === '/') return { key: 'home', path }
  if (path === '/projetos') return { key: 'projects', path }
  if (path === '/servicos') return { key: 'services', path }
  if (path === '/sobre') return { key: 'about', path }
  if (path === '/contato') return { key: 'contact', path }
  const project = path.match(/^\/projetos\/([a-z0-9-]+)$/)
  if (project && findProject(project[1])) return { key: 'project', path, slug: project[1] }
  return { key: 'notfound', path }
}

const site = 'RZ Design RJ'

export function metaFor(match: RouteMatch): PageMeta {
  switch (match.key) {
    case 'home': return { title: `${site} — Construímos o que as pessoas notam`, description: 'Fachadas em ACM, letras caixa, letreiros luminosos e comunicação visual no Rio de Janeiro. Do projeto à rua.', image: '/media/hero-facade-night-1600.webp', intro: 'home', sheet: 'A-00 · HOME', navTheme: 'dark' }
    case 'projects': return { title: `Projetos — ${site}`, description: 'Projetos que ocupam espaço: fachadas, ACM, letras caixa, letreiros e iluminação.', image: '/media/restaurante-mar-1600.webp', intro: 'acm', sheet: 'A-01 · PROJETOS', navTheme: 'dark' }
    case 'project': {
      const project = findProject(match.slug!)!
      const kind = project.status === 'conceito' ? 'Estudo conceitual' : project.type
      return { title: `${project.title} — ${kind} · ${site}`, description: `${project.summary} ${project.type}.`, image: `/media/${project.hero.media}-1600.webp`, intro: 'expand', sheet: `A-01.${String(projects.indexOf(project) + 1).padStart(2, '0')} · ${project.title.toUpperCase()}`, navTheme: 'dark' }
    }
    case 'services': return { title: `Serviços — ${site}`, description: 'Da estrutura ao último detalhe: fachadas em ACM, letras caixa, letreiros luminosos, comunicação visual e projetos personalizados.', image: '/media/acm-junta-1600.webp', intro: 'beam', sheet: 'A-02 · SERVIÇOS', navTheme: 'dark' }
    case 'about': return { title: `Sobre — ${site}`, description: 'Por trás da fachada: projeto, produção, instalação e acabamento da RZ Design RJ.', image: '/media/atras-do-letreiro-1600.webp', intro: 'plate', sheet: 'A-03 · SOBRE', navTheme: 'dark' }
    case 'contact': return { title: `Orçamento — ${site}`, description: 'Vamos construir algo que seja visto? Conte sobre o seu projeto em poucos passos.', image: '/media/hero-facade-night-1600.webp', intro: 'acm', sheet: 'A-04 · CONTATO', navTheme: 'dark' }
    default: return { title: `Fachada não encontrada — ${site}`, description: 'Essa fachada ainda não existe.', image: '/images/rz-logo.png', intro: 'flicker', sheet: 'A-404', navTheme: 'dark' }
  }
}

/** Todas as rotas estáticas geradas no build. */
export function allPaths() {
  return ['/', '/projetos', '/servicos', '/sobre', '/contato', ...projects.map(project => `/projetos/${project.slug}`)]
}
