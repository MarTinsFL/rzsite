import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import Shell from './app/Shell'
import { allPaths, matchRoute, metaFor, pageLoaders, pageModules } from './routes'

/** Renders one route to static HTML for the prerender step (scripts/prerender.mjs). */
export async function render(pathname: string) {
  const match = matchRoute(pathname)
  const { default: Page } = await pageLoaders[match.key]()
  const html = renderToString(<StrictMode><Shell match={match}><Page match={match} /></Shell></StrictMode>)
  return { html, meta: metaFor(match), module: pageModules[match.key], key: match.key }
}

export { allPaths }
