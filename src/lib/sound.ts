/**
 * Micro-sons sintetizados (WebAudio) — nada é baixado e nada toca sem o visitante ligar o som.
 * Desligado por padrão; a preferência fica salva neste navegador.
 */
type Listener = (enabled: boolean) => void

let context: AudioContext | null = null
let master: GainNode | null = null
let enabled = false
const listeners = new Set<Listener>()

try { enabled = localStorage.getItem('rz-sound') === 'on' } catch { /* storage unavailable */ }

function audio() {
  if (!enabled || typeof window === 'undefined') return null
  if (!context) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    context = new Ctor()
    master = context.createGain()
    master.gain.value = 0.16
    master.connect(context.destination)
  }
  if (context.state === 'suspended') void context.resume()
  return context
}

function noiseBuffer(ctx: AudioContext, seconds: number) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function envelope(ctx: AudioContext, peak: number, attack: number, decay: number) {
  const gain = ctx.createGain()
  const now = ctx.currentTime
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(peak, now + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay)
  gain.connect(master!)
  return gain
}

function tone(ctx: AudioContext, frequency: number, type: OscillatorType, peak: number, attack: number, decay: number, detune = 0) {
  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.value = frequency
  osc.detune.value = detune
  osc.connect(envelope(ctx, peak, attack, decay))
  osc.start()
  osc.stop(ctx.currentTime + attack + decay + 0.05)
}

function burst(ctx: AudioContext, frequency: number, q: number, peak: number, decay: number) {
  const source = ctx.createBufferSource()
  source.buffer = noiseBuffer(ctx, decay + 0.05)
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = frequency
  filter.Q.value = q
  source.connect(filter).connect(envelope(ctx, peak, 0.002, decay))
  source.start()
}

export const sound = {
  get enabled() { return enabled },
  set(next: boolean) {
    enabled = next
    try { localStorage.setItem('rz-sound', next ? 'on' : 'off') } catch { /* storage unavailable */ }
    if (next) { audio(); sound.click() }
    listeners.forEach(listener => listener(enabled))
  },
  subscribe(listener: Listener) { listeners.add(listener); return () => { listeners.delete(listener) } },
  /** Clique metálico curto. */
  click() {
    const ctx = audio(); if (!ctx) return
    burst(ctx, 3600, 9, 0.5, 0.045)
    tone(ctx, 2240, 'sine', 0.18, 0.001, 0.08)
  },
  /** Relé + zumbido elétrico baixo: luz acendendo. */
  lightOn() {
    const ctx = audio(); if (!ctx) return
    burst(ctx, 180, 1.2, 0.9, 0.08)
    tone(ctx, 100, 'sawtooth', 0.035, 0.08, 0.9)
    tone(ctx, 50, 'sine', 0.12, 0.05, 1.1)
    window.setTimeout(() => { if (context) tone(context, 1760, 'sine', 0.06, 0.004, 0.5) }, 120)
  },
  /** Passagem de painel: varredura de ruído filtrado. */
  swoosh() {
    const ctx = audio(); if (!ctx) return
    const source = ctx.createBufferSource()
    source.buffer = noiseBuffer(ctx, 0.6)
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = 2.4
    filter.frequency.setValueAtTime(380, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(2600, ctx.currentTime + 0.45)
    source.connect(filter).connect(envelope(ctx, 0.35, 0.12, 0.38))
    source.start()
  },
  /** Zumbido de letreiro com mau contato. */
  buzz() {
    const ctx = audio(); if (!ctx) return
    tone(ctx, 120, 'square', 0.025, 0.004, 0.12)
  },
}
