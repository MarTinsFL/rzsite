import manifest from './media.json'

/**
 * Registro de imagens. Os arquivos otimizados (AVIF/WebP em várias larguras) são gerados por
 * `npm run images` a partir de `media-src/` e descritos em `media.json`.
 *
 * kind 'ia'   → visualização conceitual gerada por IA (o site identifica como conceitual)
 * kind 'foto' → fotografia real da RZ
 */
export type MediaId =
  | 'hero-facade-night'
  | 'esquina-noturna'
  | 'restaurante-mar'
  | 'letras-nova'
  | 'bar-noturno'
  | 'varejo-moda'
  | 'varejo-antes'
  | 'academia-pulso'
  | 'totem-120'
  | 'acm-junta'
  | 'acm-chapas'
  | 'letra-retorno-halo'
  | 'led-interno'
  | 'atras-do-letreiro'
  | 'cnc-acm'
  | 'fachada-instalacao'
  | 'comunicacao-lobby'
  | 'estrutura-metalon'

export type MediaEntry = { w: number; h: number; widths: number[]; lqip: string; kind: 'ia' | 'foto' }

export const media = manifest as Partial<Record<MediaId, MediaEntry>>

export const mediaUrl = (id: MediaId, width: number, format: 'avif' | 'webp') => `/media/${id}-${width}.${format}`

export function srcSet(id: MediaId, format: 'avif' | 'webp') {
  const entry = media[id]
  return entry ? entry.widths.map(width => `${mediaUrl(id, width, format)} ${width}w`).join(', ') : ''
}

/** Melhor largura disponível para um tamanho de exibição aproximado. */
export function bestWidth(id: MediaId, target = 1600) {
  const widths = media[id]?.widths ?? []
  return widths.find(width => width >= target) ?? widths[widths.length - 1] ?? 0
}
