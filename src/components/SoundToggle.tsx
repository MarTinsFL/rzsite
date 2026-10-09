import { useEffect, useState } from 'react'
import { sound } from '../lib/sound'

/** SOUND OFF/ON — desligado por padrão; só toca depois que o visitante liga. */
export default function SoundToggle({ tabIndex }: { tabIndex?: number }) {
  const [on, setOn] = useState(false)
  useEffect(() => { setOn(sound.enabled); return sound.subscribe(setOn) }, [])
  return (
    <button type="button" className="sound-toggle" aria-pressed={on} onClick={() => sound.set(!on)} tabIndex={tabIndex} data-magnetic>
      <span className="sound-bars" aria-hidden="true"><i /><i /><i /><i /></span>
      Sound <span aria-hidden="true">{on ? 'On' : 'Off'}</span>
      <span className="sr-only">{on ? '(ligado)' : '(desligado)'}</span>
    </button>
  )
}
