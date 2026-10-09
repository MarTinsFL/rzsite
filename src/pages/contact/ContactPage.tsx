import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react'
import brand, { whatsappUrl } from '../../config/brand'
import { sound } from '../../lib/sound'
import './contact.css'

type Answers = { name: string; company: string; location: string; types: string[]; phone: string }
type StepKey = 'name' | 'company' | 'location' | 'types' | 'photo' | 'phone'

const steps: { key: StepKey; question: string; hint: string }[] = [
  { key: 'name', question: 'Qual seu nome?', hint: 'Como podemos te chamar.' },
  { key: 'company', question: 'Qual sua empresa?', hint: 'Olhe ao lado: é assim que ela começa a aparecer.' },
  { key: 'location', question: 'Onde será o projeto?', hint: 'Bairro e cidade já ajudam.' },
  { key: 'types', question: 'O que você deseja?', hint: 'Pode marcar mais de um.' },
  { key: 'photo', question: 'Envie uma foto do local.', hint: 'Opcional — mas ajuda muito a imaginar.' },
  { key: 'phone', question: 'Seu WhatsApp?', hint: 'Com DDD. É por lá que a RZ responde.' },
]
const typeOptions = ['Fachada', 'ACM', 'Letra caixa', 'Letreiro', 'Outro']
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const maxImageBytes = 10 * 1024 * 1024

function summary(a: Answers, photo: File | null) {
  return [
    'BRIEFING — RZ DESIGN RJ', '',
    `Nome: ${a.name}`, `Empresa: ${a.company}`, `Local do projeto: ${a.location}`,
    `Deseja: ${a.types.join(', ')}`, `WhatsApp: ${a.phone}`, '',
    photo ? `Foto do local: ${photo.name} (enviarei na conversa).` : 'Foto do local: não incluída.',
  ].join('\n')
}

const formatPhone = (value: string) => {
  const d = value.replace(/\D/g, '').slice(0, 13)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  if (d.length <= 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  return `+${d.slice(0, d.length - 11)} (${d.slice(-11, -9)}) ${d.slice(-9, -4)}-${d.slice(-4)}`
}

/** Letreiro de pré-visualização: o nome da empresa vira letra caixa e acende no final. */
function SignPreview({ text, stage, lit }: { text: string; stage: number; lit: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const word = useRef<HTMLSpanElement>(null)
  const [size, setSize] = useState(120)
  const label = (text.trim() || 'Sua marca').toUpperCase().slice(0, 28)
  useLayoutEffect(() => {
    const fit = () => {
      if (!box.current || !word.current) return
      word.current.style.fontSize = '100px'
      const available = box.current.clientWidth * 0.84
      const height = box.current.clientHeight * 0.5
      setSize(Math.max(18, Math.min(height, (available / Math.max(1, word.current.scrollWidth)) * 100)))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [label])
  return (
    <div className={`sp stage-${stage}${lit ? ' is-lit' : ''}${text.trim() ? '' : ' is-empty'}`} aria-hidden="true">
      <div className="sp-head micro"><span>Pré-visualização · letra caixa</span><span>{lit ? 'LED · on' : 'LED · off'}</span></div>
      <div ref={box} className="sp-fascia">
        <span className="sp-grid" />
        <span className="sp-joints">{Array.from({ length: 7 }, (_, i) => <i key={i} />)}</span>
        <span className="sp-glow" style={{ fontSize: size } as CSSProperties}>{label}</span>
        <span className="sp-depth" style={{ fontSize: size } as CSSProperties}>{label}</span>
        <span ref={word} className="sp-word" style={{ fontSize: size } as CSSProperties}>{label}</span>
      </div>
      <div className="sp-dims micro"><span>← testeira →</span><span>escala ilustrativa</span></div>
      <p className="sp-note micro">Medidas, materiais e luz reais saem da visita técnica.</p>
    </div>
  )
}

export default function ContactPage() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [answers, setAnswers] = useState<Answers>({ name: '', company: '', location: '', types: [], phone: '' })
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const photoInput = useRef<HTMLInputElement>(null)
  const photoVersion = useRef(0)
  const current = steps[step]

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])
  useEffect(() => { const t = window.setTimeout(() => input.current?.focus({ preventScroll: true }), 420); return () => window.clearTimeout(t) }, [step, done])

  const validate = (key: StepKey) => {
    if (key === 'name' && answers.name.trim().length < 2) return 'Conta pra gente como podemos te chamar.'
    if (key === 'company' && answers.company.trim().length < 2) return 'Qual o nome da empresa?'
    if (key === 'location' && answers.location.trim().length < 3) return 'Diga o bairro ou a cidade do projeto.'
    if (key === 'types' && answers.types.length === 0) return 'Escolha pelo menos uma opção.'
    if (key === 'phone') { const d = answers.phone.replace(/\D/g, ''); if (d.length < 10 || d.length > 13) return 'Informe um WhatsApp válido com DDD.' }
    return ''
  }
  const go = (delta: number) => {
    if (delta > 0) {
      const problem = validate(current.key)
      if (problem) { setError(problem); sound.buzz(); return }
    }
    setError('')
    setDirection(delta)
    sound.click()
    if (delta > 0 && step === steps.length - 1) { setDone(true); sound.lightOn(); return }
    setStep(s => Math.min(steps.length - 1, Math.max(0, s + delta)))
  }
  const onKey = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && !(event.target instanceof HTMLButtonElement)) { event.preventDefault(); go(1) }
  }
  const set = (key: keyof Answers) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = key === 'phone' ? formatPhone(event.target.value) : event.target.value
    setAnswers(a => ({ ...a, [key]: value }))
    if (error) setError('')
  }
  const toggleType = (type: string) => {
    setAnswers(a => ({ ...a, types: a.types.includes(type) ? a.types.filter(t => t !== type) : [...a.types, type] }))
    setError('')
    sound.click()
  }
  async function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    const version = ++photoVersion.current
    setPhotoError(''); setPhoto(null); setPreview(null)
    if (!file) return
    if (!imageTypes.has(file.type)) { setPhotoError('Selecione uma foto JPG, PNG, WebP ou AVIF.'); event.target.value = ''; return }
    if (file.size > maxImageBytes || file.size === 0) { setPhotoError('A foto deve ter até 10 MB.'); event.target.value = ''; return }
    const url = URL.createObjectURL(file)
    const valid = await new Promise<boolean>(resolve => { const img = new Image(); img.onload = () => resolve(img.naturalWidth > 0); img.onerror = () => resolve(false); img.src = url })
    if (version !== photoVersion.current) { URL.revokeObjectURL(url); return }
    if (!valid) { URL.revokeObjectURL(url); setPhotoError('Não conseguimos abrir esta imagem. Escolha outra foto.'); return }
    setPhoto(file); setPreview(url)
  }
  function removePhoto() { photoVersion.current += 1; setPhoto(null); setPreview(null); setPhotoError(''); if (photoInput.current) photoInput.current.value = '' }

  async function send(event?: FormEvent) {
    event?.preventDefault()
    const text = summary(answers, photo)
    if (brand.quoteEndpoint) {
      const payload = new FormData()
      payload.append('name', answers.name); payload.append('company', answers.company); payload.append('location', answers.location)
      payload.append('type', answers.types.join(', ')); payload.append('phone', answers.phone)
      if (photo) payload.append('photo', photo, photo.name)
      setSending(true); setStatus('')
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 20000)
      try {
        const response = await fetch(brand.quoteEndpoint, { method: 'POST', body: payload, signal: controller.signal })
        if (!response.ok || (response.headers.get('content-type') || '').includes('text/html')) throw new Error('not confirmed')
        if ((response.headers.get('content-type') || '').includes('application/json')) {
          const result = await response.json() as { success?: boolean; ok?: boolean } | null
          if (result?.success === false || result?.ok === false) throw new Error('rejected')
        }
        setStatus('Briefing enviado. A RZ vai falar com você pelo WhatsApp informado.')
      } catch {
        setStatus('Não foi possível confirmar o envio agora. Baixe o briefing ou fale direto pelo WhatsApp.')
      } finally { window.clearTimeout(timeout); setSending(false) }
      return
    }
    const wa = whatsappUrl(text)
    if (wa) {
      window.open(wa, '_blank', 'noopener,noreferrer')
      setStatus(photo ? 'Abrimos a conversa com a RZ no WhatsApp. Envie a mensagem e anexe a foto do local por lá.' : 'Abrimos a conversa com a RZ no WhatsApp. É só enviar a mensagem.')
      return
    }
    download(text)
    setStatus('O envio direto ainda não está configurado: baixamos o seu briefing para você enviar à RZ.')
  }
  function download(text = summary(answers, photo)) {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
    const a = document.createElement('a'); a.href = url; a.download = 'briefing-rz-design-rj.txt'; document.body.appendChild(a); a.click(); a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const stage = done ? 7 : step + 1

  return (
    <div className={`contact-page${done ? ' is-done' : ''}`}>
        <section className="ct-wrap" data-nav-theme="dark" aria-labelledby="ct-title">
          <div className="ct-left">
            <p className="micro"><span className="index">A-04</span> Orçamento · 06 perguntas · ~1 minuto</p>
            <h1 id="ct-title" className="display ct-title">Vamos construir<br />algo que <span className="green">seja visto?</span></h1>

            <div className="ct-progress" aria-label={`Etapa ${Math.min(step + 1, 6)} de 6`}>
              <span className="micro">01</span>
              <span className="ct-ruler"><i style={{ transform: `scaleX(${done ? 1 : step / (steps.length - 1)})` }} />{steps.map((s, i) => <b key={s.key} className={i <= step || done ? 'is-on' : ''} />)}</span>
              <span className="micro">06</span>
            </div>

            {!done ? (
              <form className="ct-form" onSubmit={e => { e.preventDefault(); go(1) }} onKeyDown={onKey} noValidate>
                <div key={current.key} className={`ct-step ${direction > 0 ? 'is-forward' : 'is-back'}`}>
                    <p className="micro ct-count">Step {String(step + 1).padStart(2, '0')} / 06</p>
                    <label className="ct-question" htmlFor={`ct-${current.key}`}>{current.question}</label>
                    <p className="body ct-hint">{current.hint}</p>
                    {current.key === 'types' ? (
                      <div className="ct-choices" role="group" aria-label="Tipo de projeto">
                        {typeOptions.map(type => <button key={type} type="button" className={answers.types.includes(type) ? 'is-on' : ''} aria-pressed={answers.types.includes(type)} onClick={() => toggleType(type)} data-magnetic=".1">{type}</button>)}
                      </div>
                    ) : current.key === 'photo' ? (
                      <div className="ct-photo">
                        <label className="ct-drop" htmlFor="ct-photo" data-cursor="explore">
                          {preview ? <img src={preview} alt="Prévia da foto do local" /> : <><b>+</b><span>Escolher foto</span><small className="micro">JPG, PNG, WebP ou AVIF · até 10 MB</small></>}
                        </label>
                        <input ref={photoInput} id="ct-photo" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={selectPhoto} className="sr-only" />
                        {photo && <button type="button" className="link-line" onClick={removePhoto}>Remover foto</button>}
                        {photoError && <p className="ct-error" role="alert">{photoError}</p>}
                      </div>
                    ) : (
                      <input
                        ref={input}
                        id={`ct-${current.key}`}
                        className="ct-input"
                        value={answers[current.key as 'name' | 'company' | 'location' | 'phone']}
                        onChange={set(current.key as keyof Answers)}
                        autoComplete={{ name: 'name', company: 'organization', location: 'address-level2', phone: 'tel' }[current.key as 'name']}
                        inputMode={current.key === 'phone' ? 'tel' : 'text'}
                        type={current.key === 'phone' ? 'tel' : 'text'}
                        placeholder={{ name: 'Seu nome', company: 'Nome da empresa', location: 'Ex.: Botafogo, Rio de Janeiro', phone: '(21) 99999-9999' }[current.key as 'name']}
                        maxLength={current.key === 'phone' ? 22 : 80}
                        aria-invalid={!!error}
                        aria-describedby="ct-error"
                      />
                    )}
                </div>
                <p id="ct-error" className="ct-error" role="alert" aria-live="assertive">{error}</p>
                <div className="ct-nav">
                  <button type="button" className="link-line" onClick={() => go(-1)} disabled={step === 0}>← Voltar</button>
                  <span className="micro ct-enter">Enter ↵ para avançar</span>
                  <button type="submit" className="btn" data-magnetic>{step === steps.length - 1 ? 'Finalizar' : current.key === 'photo' && !photo ? 'Pular' : 'Próximo'} <span className="arrow">→</span></button>
                </div>
              </form>
            ) : (
              <div className="ct-final">
                <p className="display ct-ready">Pronto.<br /><span className="green">Agora deixa com a RZ.</span></p>
                <dl className="ct-summary">
                  <div><dt className="micro">Nome</dt><dd>{answers.name}</dd></div>
                  <div><dt className="micro">Empresa</dt><dd>{answers.company}</dd></div>
                  <div><dt className="micro">Local</dt><dd>{answers.location}</dd></div>
                  <div><dt className="micro">Deseja</dt><dd>{answers.types.join(', ')}</dd></div>
                  <div><dt className="micro">Foto</dt><dd>{photo ? photo.name : 'Não incluída'}</dd></div>
                  <div><dt className="micro">WhatsApp</dt><dd>{answers.phone}</dd></div>
                </dl>
                <div className="ct-send">
                  <button type="button" className="btn btn-glow" onClick={() => send()} disabled={sending} data-magnetic>{sending ? 'Enviando…' : brand.quoteEndpoint ? 'Enviar briefing' : brand.whatsapp ? 'Enviar pelo WhatsApp' : 'Baixar briefing'} <span className="arrow">↗</span></button>
                  <button type="button" className="link-line" onClick={() => { setDone(false); setStep(0) }}>Revisar respostas</button>
                  {!brand.quoteEndpoint && brand.whatsapp && <button type="button" className="link-line" onClick={() => download()}>Baixar briefing (.txt)</button>}
                </div>
                {status && <p className="ct-status" role="status">{status}</p>}
              </div>
            )}
          </div>
          <div className="ct-right">
            <SignPreview text={answers.company} stage={stage} lit={done} />
            <div className="ct-direct">
              {whatsappUrl() && <a className="link-line newtab" href={whatsappUrl()!} target="_blank" rel="noopener noreferrer">Prefere conversar direto? WhatsApp</a>}
              {brand.instagram && <a className="link-line newtab" href={brand.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
            </div>
          </div>
        </section>
    </div>
  )
}
