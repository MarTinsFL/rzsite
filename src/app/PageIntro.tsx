import type { IntroVariant } from '../routes'

/**
 * Transição de abertura de cada página. É CSS puro, presente no HTML pré-renderizado: começa no
 * primeiro quadro, antes do JavaScript, e nunca prende a página. A Home tem uma abertura própria.
 */
export default function PageIntro({ variant }: { variant: IntroVariant }) {
  if (variant === 'home') return null
  return (
    <div className={`page-intro intro-${variant}`} aria-hidden="true">
      {variant === 'plate' && <><div className="pi-plate" /><span className="pi-mark">RZ / Visual Engineering</span></>}
      {variant === 'acm' && <div className="pi-panel" />}
      {variant === 'beam' && <><div className="pi-top" /><div className="pi-bottom" /><div className="pi-line" /></>}
      {variant === 'expand' && <><div className="pi-shade" /><div className="pi-line" /></>}
      {variant === 'flicker' && <div className="pi-shade" />}
    </div>
  )
}
