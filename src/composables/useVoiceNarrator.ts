import { readonly, shallowRef } from 'vue'
import { VOICE_MANIFEST, normalizeVoiceKey } from '@/data/voiceManifest'
import { assetUrl } from '@/utils/assets'

const voiceEnabled = shallowRef(true)
const isSpeaking = shallowRef(false)
const lastSpokenText = shallowRef('')

let activeAudio: HTMLAudioElement | null = null
let cachedSpanishVoice: SpeechSynthesisVoice | null = null

const FEMALE_VOICE_HINTS = [
  'dalia',
  'lorena',
  'salome',
  'sabina',
  'elvira',
  'ximena',
  'paulina',
  'helena',
  'laura',
  'monica',
  'paloma',
  'sofia',
  'camila',
  'valentina',
  'lucia',
  'carmen',
  'conchita',
  'lupe',
  'penelope',
  'google español',
  'natural',
]

const MALE_VOICE_EXCLUSIONS = [
  'raul',
  'pablo',
  'jorge',
  'alvaro',
  'diego',
  'alonso',
  'rodrigo',
  'tomas',
  'emilio',
  'gonzalo',
  'enrique',
  'mateo',
  'miguel',
  'carlos',
]

function pickFemaleSpanishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  if (cachedSpanishVoice) return cachedSpanishVoice

  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const spanishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('es'))
  if (!spanishVoices.length) return null

  const notMale = spanishVoices.filter((v) => {
    const lower = v.name.toLowerCase()
    return !MALE_VOICE_EXCLUSIONS.some((male) => lower.includes(male))
  })
  const pool = notMale.length ? notMale : spanishVoices

  const preferredLangs = ['es-mx', 'es-sv', 'es-419', 'es-us', 'es-co', 'es-es']

  // 1) Female hint + preferred Latin American / Spanish locale
  for (const lang of preferredLangs) {
    const femaleMatch = pool.find(
      (v) =>
        v.lang.toLowerCase() === lang &&
        FEMALE_VOICE_HINTS.some((hint) => v.name.toLowerCase().includes(hint)),
    )
    if (femaleMatch) {
      cachedSpanishVoice = femaleMatch
      return femaleMatch
    }
  }

  // 2) Any female hint in Spanish
  const anyFemale = pool.find((v) =>
    FEMALE_VOICE_HINTS.some((hint) => v.name.toLowerCase().includes(hint)),
  )
  if (anyFemale) {
    cachedSpanishVoice = anyFemale
    return anyFemale
  }

  // 3) Preferred locale among non-male Spanish voices
  for (const lang of preferredLangs) {
    const langMatch = pool.find((v) => v.lang.toLowerCase() === lang)
    if (langMatch) {
      cachedSpanishVoice = langMatch
      return langMatch
    }
  }

  cachedSpanishVoice = pool[0]
  return pool[0]
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedSpanishVoice = null
    pickFemaleSpanishVoice()
  }
}

function stopActiveAudio(): void {
  if (activeAudio) {
    activeAudio.onplay = null
    activeAudio.onended = null
    activeAudio.onpause = null
    activeAudio.onerror = null
    activeAudio.pause()
    activeAudio.currentTime = 0
    activeAudio = null
  }
}

function speakWithWebSpeechFallback(clean: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(clean)
  const voice = pickFemaleSpanishVoice()
  if (voice) {
    utterance.voice = voice
    utterance.lang = voice.lang
  } else {
    utterance.lang = 'es-MX'
  }

  utterance.rate = 0.94
  utterance.pitch = 1.12
  utterance.volume = 0.95

  utterance.onstart = () => {
    isSpeaking.value = true
  }
  utterance.onend = () => {
    isSpeaking.value = false
  }
  utterance.onerror = () => {
    isSpeaking.value = false
  }

  window.speechSynthesis.speak(utterance)
}

export function useVoiceNarrator() {
  function stop(): void {
    stopActiveAudio()
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    isSpeaking.value = false
  }

  function speak(text: string): void {
    const clean = text.trim()
    if (!clean) return
    lastSpokenText.value = clean

    if (!voiceEnabled.value || typeof window === 'undefined') return

    stop()

    const clipUrl = VOICE_MANIFEST[normalizeVoiceKey(clean)]
    if (clipUrl) {
      const audio = new Audio(assetUrl(clipUrl))
      activeAudio = audio
      audio.volume = 0.95

      audio.onplay = () => {
        if (activeAudio === audio) {
          isSpeaking.value = true
        }
      }
      audio.onended = () => {
        if (activeAudio === audio) {
          isSpeaking.value = false
          activeAudio = null
        }
      }
      audio.onpause = () => {
        if (activeAudio === audio) {
          isSpeaking.value = false
        }
      }
      audio.onerror = () => {
        if (activeAudio === audio) {
          activeAudio = null
          isSpeaking.value = false
        }
        speakWithWebSpeechFallback(clean)
      }

      const playPromise = audio.play()
      if (playPromise) {
        void playPromise.catch(() => {
          // Browser blocked autoplay before user interaction; fail silently without console noise
          if (activeAudio === audio) {
            isSpeaking.value = false
            activeAudio = null
          }
        })
      }
      return
    }

    speakWithWebSpeechFallback(clean)
  }

  function replay(): void {
    if (!lastSpokenText.value) return
    if (!voiceEnabled.value) {
      voiceEnabled.value = true
    }
    speak(lastSpokenText.value)
  }

  function toggleVoice(): void {
    voiceEnabled.value = !voiceEnabled.value
    if (!voiceEnabled.value) {
      stop()
    } else if (lastSpokenText.value) {
      speak(lastSpokenText.value)
    }
  }

  return {
    voiceEnabled: readonly(voiceEnabled),
    isSpeaking: readonly(isSpeaking),
    lastSpokenText: readonly(lastSpokenText),
    speak,
    stop,
    replay,
    toggleVoice,
  }
}
