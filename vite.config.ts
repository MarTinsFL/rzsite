import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * `vite preview` com URLs limpas, como uma hospedagem estática bem configurada:
 * /projetos → dist/projetos/index.html e rotas inexistentes → dist/404.html (status 404).
 */
function cleanUrls(): Plugin {
  return {
    name: 'rz-clean-urls',
    configurePreviewServer(server) {
      const dist = path.resolve(server.config.root, server.config.build.outDir)
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '/').split('?')[0]
        if (url === '/' || path.extname(url)) return next()
        const clean = url.replace(/\/+$/, '')
        const page = path.join(dist, clean, 'index.html')
        if (fs.existsSync(page)) { req.url = `${clean}/index.html`; return next() }
        const notFound = path.join(dist, '404.html')
        if (fs.existsSync(notFound)) { res.statusCode = 404; res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(fs.readFileSync(notFound)); return }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), cleanUrls()],
  build: {
    // O manifesto permite ao prerender injetar o CSS e o modulepreload de cada página no HTML estático.
    manifest: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/gsap')) return 'gsap'
          if (id.includes('node_modules/lenis')) return 'lenis'
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react'
        },
      },
    },
  },
})
