import { useEffect, type RefObject } from 'react'

/**
 * Motion runtime: GSAP + plugins are loaded once, on demand, and shared by every page.
 * Components describe their animation in `useMotion`; everything created inside is reverted
 * automatically on unmount (gsap.context), so no ScrollTrigger or tween is ever leaked.
 */
export type Motion = {
  gsap: typeof import('gsap')['gsap']
  ScrollTrigger: typeof import('gsap/ScrollTrigger')['ScrollTrigger']
  SplitText: typeof import('gsap/SplitText')['SplitText']
  Flip: typeof import('gsap/Flip')['Flip']
}

let runtime: Promise<Motion> | null = null

export function loadMotion(): Promise<Motion> {
  runtime ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/SplitText'), import('gsap/Flip')]).then(([g, st, sp, fl]) => {
    const gsap = g.gsap
    gsap.registerPlugin(st.ScrollTrigger, sp.SplitText, fl.Flip)
    st.ScrollTrigger.config({ ignoreMobileResize: true })
    gsap.defaults({ ease: 'power3.out' })
    return { gsap, ScrollTrigger: st.ScrollTrigger, SplitText: sp.SplitText, Flip: fl.Flip }
  })
  return runtime
}

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const isFinePointer = () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine) and (hover: hover)').matches
export const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 960px)').matches

type Setup = (motion: Motion) => void | (() => void)

/**
 * Runs `setup` inside a gsap.context scoped to `scope`. With `lazy`, GSAP is only requested when
 * the section approaches the viewport. Reduced motion skips the setup entirely unless `always`.
 */
export function useMotion(scope: RefObject<HTMLElement | null>, setup: Setup, options: { lazy?: boolean; always?: boolean } = {}) {
  useEffect(() => {
    if (!options.always && prefersReducedMotion()) return
    let disposed = false
    let release: void | (() => void)
    let context: { revert: () => void } | undefined
    const start = () => loadMotion().then(motion => {
      if (disposed) return
      context = motion.gsap.context(() => { release = setup(motion) }, scope.current ?? undefined)
    }).catch(() => { /* The static composition stays readable without motion. */ })
    let observer: IntersectionObserver | undefined
    if (options.lazy && scope.current) {
      observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return
        observer?.disconnect()
        start()
      }, { rootMargin: '600px 0px' })
      observer.observe(scope.current)
    } else start()
    return () => {
      disposed = true
      observer?.disconnect()
      if (typeof release === 'function') release()
      context?.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/** Shared scroll state written by the smooth-scroll driver and read by velocity-reactive elements. */
export const scrollState = { velocity: 0, smoothed: 0 }

export const clamp = (min: number, max: number, value: number) => Math.min(max, Math.max(min, value))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** Maps progress inside a [start, end] window to 0–1. */
export const range = (progress: number, start: number, end: number) => clamp(0, 1, (progress - start) / (end - start))
