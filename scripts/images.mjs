// Gera as versões otimizadas das imagens do site (AVIF + WebP, várias larguras) e o manifesto
// src/data/media.json. Fonte: media-src/sources.json + arquivos originais em media-src/.
//
// Para trocar uma imagem conceitual por uma foto real: coloque o arquivo em media-src/, aponte
// "file" no sources.json, mude "kind" para "foto" e rode `npm run images`. Fotos reais não
// recebem o selo "Imagem conceitual" e podem desativar o ajuste de cor com "grade": false.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const sourceDir = path.join(root, 'media-src')
const outDir = path.join(root, 'public', 'media')
const manifestFile = path.join(root, 'src', 'data', 'media.json')
const widths = [640, 1024, 1600, 2048]
const force = process.argv.includes('--force')

const sources = JSON.parse(fs.readFileSync(path.join(sourceDir, 'sources.json'), 'utf8'))
const previous = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : {}
fs.mkdirSync(outDir, { recursive: true })

const manifest = {}
for (const [id, source] of Object.entries(sources)) {
  const file = path.join(sourceDir, source.file)
  if (!fs.existsSync(file)) {
    // Sem a fonte, preserva a versão já otimizada (se existir) em vez de apagá-la do manifesto.
    if (previous[id]) { manifest[id] = previous[id]; console.warn(`· ${id}: fonte ausente (${source.file}) — mantendo a versão otimizada existente.`) }
    else console.warn(`· ${id}: arquivo ausente (${source.file}) — o site mostrará um espaço reservado.`)
    continue
  }
  const meta = await sharp(file).metadata()
  const sizes = widths.filter(width => width < meta.width).concat(Math.min(meta.width, widths.at(-1)))
  const unique = [...new Set(sizes)].sort((a, b) => a - b)
  const sourceTime = fs.statSync(file).mtimeMs
  const upToDate = !force && previous[id] && unique.every(width => ['avif', 'webp'].every(format => {
    const target = path.join(outDir, `${id}-${width}.${format}`)
    return fs.existsSync(target) && fs.statSync(target).mtimeMs > sourceTime
  }))
  // Ajuste de cor comum a todas as imagens para manter uma única direção de fotografia.
  const graded = () => {
    let image = sharp(file).rotate()
    if (source.grade !== false) image = image.modulate({ saturation: 0.9 }).linear(1.03, -3)
    return image
  }
  if (!upToDate) {
    for (const width of unique) {
      const base = graded().resize({ width, withoutEnlargement: true })
      await base.clone().avif({ quality: 50, effort: 5, chromaSubsampling: '4:2:0' }).toFile(path.join(outDir, `${id}-${width}.avif`))
      await base.clone().webp({ quality: 74, effort: 5 }).toFile(path.join(outDir, `${id}-${width}.webp`))
    }
    console.log(`✓ ${id}: ${unique.join(', ')}px`)
  } else console.log(`= ${id}: atualizado`)
  const lqip = await graded().resize({ width: 24 }).blur(1.2).webp({ quality: 42 }).toBuffer()
  const height = Math.round(meta.height * Math.min(meta.width, widths.at(-1)) / meta.width)
  manifest[id] = { w: Math.min(meta.width, widths.at(-1)), h: height, widths: unique, lqip: `data:image/webp;base64,${lqip.toString('base64')}`, kind: source.kind === 'foto' ? 'foto' : 'ia' }
}

fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n')

// Logo: versão maior para o rodapé (o arquivo original é preservado sem alterações).
const logo = path.join(root, 'public', 'images', 'rz-logo.png')
const logoOut = path.join(root, 'public', 'images', 'rz-logo-1024.webp')
if (fs.existsSync(logo) && (force || !fs.existsSync(logoOut))) await sharp(logo).resize({ width: 1024 }).webp({ quality: 90, alphaQuality: 100 }).toFile(logoOut)

console.log(`Manifesto: ${Object.keys(manifest).length} imagens em src/data/media.json`)
