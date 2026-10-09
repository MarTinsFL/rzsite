import type { MouseEvent } from 'react'
import { prefersReducedMotion } from './motion'
import { sound } from './sound'

/**
 * Abrir projeto: a imagem clicada cresce até preencher a tela enquanto a nova aba abre.
 * A nova página começa com o hero já ampliado — a continuidade é simulada nas duas pontas.
 * Só reage a clique simples (Ctrl/Cmd/Shift/botão do meio abrem em segundo plano, sem animação).
 */
export function expandFrom(event: MouseEvent<HTMLAnchorElement>) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  if (prefersReducedMotion()) return
  const image = event.currentTarget.querySelector('img')
  if (!image) return
  const rect = image.getBoundingClientRect()
  const ghost = document.createElement('div')
  ghost.className = 'expand-ghost'
  ghost.setAttribute('aria-hidden', 'true')
  Object.assign(ghost.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, backgroundImage: `url("${image.currentSrc || image.src}")` })
  document.body.appendChild(ghost)
  sound.swoosh()
  requestAnimationFrame(() => requestAnimationFrame(() => ghost.classList.add('is-open')))
  let done = false
  const close = () => {
    if (done) return
    done = true
    ghost.classList.add('is-closing')
    window.setTimeout(() => ghost.remove(), 700)
    document.removeEventListener('visibilitychange', onVisible)
  }
  const onVisible = () => { if (document.visibilityState === 'visible') window.setTimeout(close, 250) }
  document.addEventListener('visibilitychange', onVisible)
  window.setTimeout(() => { if (document.visibilityState === 'visible') close() }, 1500)
}
