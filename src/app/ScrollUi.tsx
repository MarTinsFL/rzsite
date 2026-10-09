import { useEffect, useRef } from 'react'
import { loadMotion, prefersReducedMotion, scrollState } from '../lib/motion'

/**
 * Driver global de scroll: rolagem com inércia (Lenis, desktop), barra de progresso com o feixe RZ,
 * régua lateral, velocidade compartilhada, navegação que se esconde/retorna e revelações simples.
 */
export default function ScrollUi() {
  const bar = useRef<HTMLDivElement>(null)
  const ruler = useRef<HTMLDivElement>(null)
  const rulerLabel = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('[data-nav]')
    const reduce = prefersReducedMotion()
    let disposed = false
    let lastY = window.scrollY
    let destroySmooth: (() => void) | undefined

    const paint = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`
      if (ruler.current) ruler.current.style.setProperty('--p', progress.toFixed(4))
      if (rulerLabel.current) rulerLabel.current.textContent = String(Math.round(progress * 100)).padStart(3, '0')
      const y = window.scrollY
      if (nav && !document.querySelector('.menu.is-open')) nav.classList.toggle('is-hidden', y > 160 && y > lastY + 2)
      if (nav && y < lastY - 2) nav.classList.remove('is-hidden')
      lastY = y
    }

    // Velocidade (px/frame) suavizada — usada por marquee e skew de imagens.
    let raf = 0, previous = window.scrollY
    const track = () => {
      const y = window.scrollY
      const raw = y - previous
      previous = y
      scrollState.velocity = raw
      scrollState.smoothed += (raw - scrollState.smoothed) * 0.12
      raf = requestAnimationFrame(track)
    }
    if (!reduce) raf = requestAnimationFrame(track)

    // Tema da navegação conforme a seção sob ela (seções claras pedem texto escuro).
    const themed = [...document.querySelectorAll<HTMLElement>('[data-nav-theme]')]
    const themeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && nav) nav.dataset.theme = (entry.target as HTMLElement).dataset.navTheme || 'dark'
      })
    }, { rootMargin: '0px 0px -96% 0px' })
    themed.forEach(section => themeObserver.observe(section))

    // Revelações leves para blocos de texto marcados com .reveal-up
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-in'); revealObserver.unobserve(entry.target) } })
    }, { rootMargin: '0px 0px -8% 0px' })
    document.querySelectorAll('.reveal-up').forEach(element => revealObserver.observe(element))

    window.addEventListener('scroll', paint, { passive: true })
    window.addEventListener('resize', paint)
    paint()

    const smooth = window.matchMedia('(min-width: 960px) and (pointer: fine)').matches && !reduce
    if (smooth) {
      Promise.all([loadMotion(), import('lenis')]).then(([{ gsap, ScrollTrigger }, { default: Lenis }]) => {
        if (disposed) return
        const lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95, prevent: node => !!node.closest('[data-lenis-prevent]') })
        lenis.on('scroll', ScrollTrigger.update)
        const tick = (time: number) => lenis.raf(time * 1000)
        gsap.ticker.add(tick)
        gsap.ticker.lagSmoothing(0)
        ;(window as unknown as { __lenis?: unknown }).__lenis = lenis
        document.fonts?.ready.then(() => { if (!disposed) ScrollTrigger.refresh() })
        destroySmooth = () => { gsap.ticker.remove(tick); lenis.destroy() }
      }).catch(() => { /* Rolagem nativa continua disponível. */ })
    } else {
      loadMotion().then(({ ScrollTrigger }) => { document.fonts?.ready.then(() => { if (!disposed) ScrollTrigger.refresh() }) }).catch(() => {})
    }

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      destroySmooth?.()
      themeObserver.disconnect()
      revealObserver.disconnect()
      window.removeEventListener('scroll', paint)
      window.removeEventListener('resize', paint)
    }
  }, [])

  return (
    <>
      <div ref={bar} className="progress" aria-hidden="true" />
      <div ref={ruler} className="ruler" aria-hidden="true"><span className="ruler-mark"><span ref={rulerLabel}>000</span></span></div>
    </>
  )
}
