import type { CSSProperties } from 'react'
import { bestWidth, media, mediaUrl, srcSet, type MediaId } from '../data/media'
import type { Crop } from '../data/projects'

type Props = {
  id: MediaId
  alt: string
  sizes?: string
  priority?: boolean
  crop?: Crop
  className?: string
  /** Selo "Imagem conceitual" (exibido automaticamente em imagens geradas por IA). */
  label?: boolean | string
  style?: CSSProperties
  /** Ponto de foco do recorte (CSS object-position). */
  focus?: string
}

/**
 * Imagem responsiva (AVIF → WebP) com placeholder borrado. Se a imagem ainda não existir,
 * mostra um espaço reservado técnico pronto para receber a fotografia real.
 */
export default function Media({ id, alt, sizes = '100vw', priority = false, crop, className = '', label = true, style, focus }: Props) {
  const entry = media[id]
  if (!entry) {
    return (
      <div className={`media media-placeholder ${className}`} style={style} role="img" aria-label={alt}>
        <span>Espaço reservado<br />foto real da RZ<br />[{id}]</span>
      </div>
    )
  }
  const cropStyle = crop ? ({ '--fx': `${crop.x}%`, '--fy': `${crop.y}%`, '--zoom': crop.zoom } as CSSProperties) : undefined
  const effectiveSizes = crop && crop.zoom > 1.2 ? '100vw' : sizes
  return (
    <div className={`media${crop ? ' media-crop' : ''} ${className}`} style={{ ...cropStyle, ...style }}>
      <picture>
        <source type="image/avif" srcSet={srcSet(id, 'avif')} sizes={effectiveSizes} />
        <source type="image/webp" srcSet={srcSet(id, 'webp')} sizes={effectiveSizes} />
        <img
          src={mediaUrl(id, bestWidth(id, 1024), 'webp')}
          alt={alt}
          width={entry.w}
          height={entry.h}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : undefined}
          style={{ backgroundImage: `url(${entry.lqip})`, objectPosition: focus }}
        />
      </picture>
      {label && entry.kind === 'ia' && <span className="media-label">{typeof label === 'string' ? label : 'Imagem conceitual · IA'}</span>}
    </div>
  )
}
