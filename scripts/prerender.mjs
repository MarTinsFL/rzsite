// Gera um HTML estático completo para cada rota (conteúdo disponível antes do JavaScript),
// com metadados próprios, CSS e modulepreload do chunk da página, sitemap e robots.
import fs from 'node:fs'
import path from 'node:path'
import { createServer, loadEnv } from 'vite'

const dist = path.resolve('dist')
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
const manifest = JSON.parse(fs.readFileSync(path.join(dist, '.vite', 'manifest.json'), 'utf8'))
const env = loadEnv('production', process.cwd(), 'VITE_')
let origin = ''
try { if (env.VITE_SITE_URL) origin = new URL(env.VITE_SITE_URL).origin } catch { throw new Error('VITE_SITE_URL deve ser uma URL válida.') }

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

/** CSS e JS (transitivos) necessários para um módulo de página. */
function assetsFor(moduleId) {
  const css = new Set(), js = new Set(), seen = new Set()
  const visit = key => {
    if (!key || seen.has(key) || !manifest[key]) return
    seen.add(key)
    const chunk = manifest[key]
    js.add(chunk.file)
    chunk.css?.forEach(file => css.add(file))
    chunk.imports?.forEach(visit)
  }
  visit(moduleId)
  return { css: [...css], js: [...js] }
}

const entryKey = Object.keys(manifest).find(key => manifest[key].isEntry)
const entryAssets = assetsFor(entryKey)

function schema() {
  const data = { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'RZ Design RJ', description: 'Fachadas comerciais, fachadas em ACM, letras caixa, letreiros luminosos e comunicação visual no Rio de Janeiro.', areaServed: { '@type': 'City', name: 'Rio de Janeiro' }, serviceType: ['Fachadas comerciais', 'Fachadas em ACM', 'Letras caixa', 'Letreiros luminosos', 'Comunicação visual', 'Projetos personalizados'] }
  if (origin) { data.url = `${origin}/`; data.logo = `${origin}/images/rz-logo.png` }
  const whatsapp = (env.VITE_WHATSAPP || '').replace(/\D/g, '')
  if (/^[1-9]\d{9,14}$/.test(whatsapp)) data.telephone = `+${whatsapp}`
  if (env.VITE_INSTAGRAM_URL) data.sameAs = [env.VITE_INSTAGRAM_URL]
  return JSON.stringify(data).replaceAll('<', '\\u003c')
}

/** Preload responsivo da foto do hero: o navegador escolhe o mesmo arquivo que o <picture> usará. */
function heroPreload() {
  const media = JSON.parse(fs.readFileSync(path.resolve('src/data/media.json'), 'utf8'))['hero-facade-night']
  if (!media) return ''
  const set = media.widths.map(width => `/media/hero-facade-night-${width}.avif ${width}w`).join(', ')
  return `<link rel="preload" as="image" type="image/avif" imagesrcset="${set}" imagesizes="(max-width: 959px) 1600px, 130vw" fetchpriority="high" />`
}

const server = await createServer({ mode: 'production', appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false }, ssr: { noExternal: ['gsap', 'lenis'] } })
const written = []
try {
  const { render, allPaths } = await server.ssrLoadModule('/src/entry-server.tsx')
  const routes = [...allPaths(), '/404']
  for (const route of routes) {
    const rendered = await render(route)
    const { meta, module, key } = rendered
    // O React 19 emite <link rel="preload"> de imagens no início do markup; eles pertencem ao <head>.
    const hoisted = []
    const html = rendered.html.replace(/^(?:<link [^>]*\/?>)+/, match => { hoisted.push(match); return '' })
    const page = assetsFor(module)
    const url = origin ? `${origin}${route === '/' ? '/' : route}` : ''
    const image = origin ? `${origin}${meta.image}` : meta.image
    const head = [
      `<meta name="description" content="${escape(meta.description)}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:locale" content="pt_BR" />`,
      `<meta property="og:site_name" content="RZ Design RJ" />`,
      `<meta property="og:title" content="${escape(meta.title)}" />`,
      `<meta property="og:description" content="${escape(meta.description)}" />`,
      `<meta property="og:image" content="${escape(image)}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:image" content="${escape(image)}" />`,
      url && key !== 'notfound' ? `<link rel="canonical" href="${escape(url)}" /><meta property="og:url" content="${escape(url)}" />` : '',
      key === 'notfound' ? '<meta name="robots" content="noindex" />' : '',
      ...page.js.filter(file => !entryAssets.js.includes(file)).map(file => `<link rel="modulepreload" href="/${file}" />`),
      key === 'home' ? heroPreload() : '',
      ...hoisted,
      `<script type="application/ld+json">${schema()}</script>`,
    ].filter(Boolean).join('\n    ')
    // O CSS da página entra depois do CSS base (ordem da cascata igual à do app em desenvolvimento).
    const pageCss = page.css.filter(file => !entryAssets.css.includes(file)).map(file => `<link rel="stylesheet" href="/${file}" />`).join('\n    ')
    const document = template
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(meta.title)}</title>`)
      .replace('<!--rz:meta-->', head)
      .replace('</head>', `  ${pageCss}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
    const target = route === '/404' ? path.join(dist, '404.html') : path.join(dist, route, 'index.html')
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, document)
    // Também /rota.html: hospedagens com "URLs limpas" resolvem /projetos → /projetos.html.
    if (route !== '/' && route !== '/404') fs.writeFileSync(path.join(dist, `${route}.html`), document)
    written.push(route)
  }
} finally { await server.close() }

const indexable = written.filter(route => route !== '/404')
if (origin) fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map(route => `  <url><loc>${origin}${route === '/' ? '/' : route}</loc></url>`).join('\n')}\n</urlset>\n`)
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}/sitemap.xml\n` : ''}`)
console.log(`Prerender: ${written.length} páginas estáticas (${written.join(', ')})${origin ? ' + sitemap' : ''}.`)
