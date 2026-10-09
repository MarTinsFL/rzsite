import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'

type Props = { className?: string; src?: string; delay?: number; animate?: boolean; lazy?: boolean }

const parts = ['r', 'barr', 'z', 'barz', 'beam', 'text'] as const

/**
 * Logo original da RZ animada pelos próprios componentes (R → Z → barras → feixe → Design RJ).
 * Cada camada é o MESMO arquivo da logo recortado por região — nada é redesenhado.
 */
export default function Logo({ className = '', src = '/images/rz-logo-512.webp', delay = 0, animate = true, lazy = false }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [state, setState] = useState<'off' | 'on' | undefined>(animate ? 'off' : undefined)
  useEffect(() => {
    if (!animate) return
    if (prefersReducedMotion()) { setState('on'); return }
    let timer = 0
    const observer = new IntersectionObserver(entries => {
      if (!entries[0]?.isIntersecting) return
      observer.disconnect()
      timer = window.setTimeout(() => setState('on'), delay)
    }, { threshold: 0.35 })
    if (ref.current) observer.observe(ref.current)
    return () => { observer.disconnect(); window.clearTimeout(timer) }
  }, [animate, delay])
  return (
    <span ref={ref} className={`logo ${className}`} data-build={state} role="img" aria-label="RZ Design RJ">
      {parts.map(part => <img key={part} className={`logo-${part}`} src={src} alt="" aria-hidden="true" width="3374" height="1610" decoding="async" loading={lazy ? 'lazy' : undefined} />)}
      <span className="logo-shine" aria-hidden="true" />
    </span>
  )
}
