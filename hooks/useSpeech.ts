'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { SPEECH_LANG_MAP } from '@/lib/i18n/translations'
import type { Language } from '@/lib/i18n/translations'

interface UseSpeechOptions {
  language: Language
  onTranscript?: (text: string) => void
  continuous?: boolean
}

let currentAudio: HTMLAudioElement | null = null
let voicesCache: SpeechSynthesisVoice[] = []

// 🔊 Load voices with guaranteed availability
async function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined') return []

  const synth = window.speechSynthesis
  const existing = synth.getVoices()

  if (existing.length > 0) {
    voicesCache = existing
    console.log('[TTS] Voices cached:', existing.length)
    return existing
  }

  return new Promise((resolve) => {
    let resolved = false

    const handleVoicesChanged = () => {
      if (resolved) return
      resolved = true

      const voices = synth.getVoices()
      voicesCache = voices
      console.log('[TTS] Voices loaded (voiceschanged):', voices.length)
      synth.removeEventListener('voiceschanged', handleVoicesChanged)
      resolve(voices)
    }

    synth.addEventListener('voiceschanged', handleVoicesChanged)

    setTimeout(() => {
      if (resolved) return
      resolved = true

      const voices = synth.getVoices()
      voicesCache = voices
      console.log('[TTS] Voices loaded (timeout):', voices.length)
      synth.removeEventListener('voiceschanged', handleVoicesChanged)
      resolve(voices)
    }, 200)
  })
}

// Clean text: remove markdown, preserve language characters
function cleanText(text: string): string {
  return text
    .replace(/#{1,6}\s?/g, '')     // Remove headings
    .replace(/\*+/g, '')           // Remove asterisks
    .replace(/[-_]{2,}/g, '')      // Remove dashes/underscores
    .replace(/[0-9]+/g, '')        // Remove numbers
    .replace(/\s+/g, ' ')          // Normalize spaces
    .trim()
}

// Select voice by language with intelligent fallback
function selectVoice(voices: SpeechSynthesisVoice[], language: Language): SpeechSynthesisVoice | null {
  const targetLang = SPEECH_LANG_MAP[language]
  console.log(`[TTS] Selecting voice for: ${language} (${targetLang})`)

  // Try exact match
  let voice = voices.find(v => v.lang === targetLang)
  if (voice) {
    console.log(`[TTS] ✓ Exact match: ${voice.name} (${voice.lang})`)
    return voice
  }

  // Try language prefix (e.g., kn, te, hi, ta, en)
  const prefix = language.toLowerCase()
  voice = voices.find(v => v.lang.toLowerCase().startsWith(prefix + '-'))
  if (voice) {
    console.log(`[TTS] ✓ Prefix match: ${voice.name} (${voice.lang})`)
    return voice
  }

  // For Indian languages, try any Indian voice
  if (['kn', 'te', 'ta', 'hi'].includes(language)) {
    voice = voices.find(v => v.lang.includes('-IN'))
    if (voice) {
      console.log(`[TTS] ✓ Indian fallback: ${voice.name} (${voice.lang})`)
      return voice
    }
  }

  console.log(`[TTS] ⚠ No voice found, using browser default`)
  return null
}

// Browser speech synthesis
async function speakWithBrowser(text: string, language: Language): Promise<void> {
  const synth = window.speechSynthesis

  // Cancel previous speech
  synth.cancel()

  // Load voices
  const voices = await loadVoices()

  // Select voice
  const voice = selectVoice(voices, language)

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = SPEECH_LANG_MAP[language]
  if (voice) utterance.voice = voice
  utterance.rate = 0.9
  utterance.pitch = 1.0
  utterance.volume = 1.0

  console.log(`[TTS] Speaking (${language}): "${text.substring(0, 40)}..."`)

  return new Promise((resolve, reject) => {
    utterance.onend = () => {
      console.log('[TTS] ✓ Speech finished')
      resolve()
    }

    utterance.onerror = (e) => {
      console.error('[TTS] ✗ Error:', e.error)
      reject(e)
    }

    synth.speak(utterance)
  })
}

// ElevenLabs TTS
async function speakWithElevenLabs(text: string) {
  const API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY

  if (!API_KEY) {
    console.error('[TTS] ✗ ElevenLabs API key missing')
    return
  }

  const response = await fetch(
    'https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL',
    {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
      }),
    }
  )

  if (!response.ok) {
    console.error('[TTS] ✗ API error:', response.status)
    return
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)

  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }

  currentAudio = new Audio(url)
  await currentAudio.play().catch(e => console.error('[TTS] ✗ Playback error:', e))
}

export function useSpeech({ language, onTranscript, continuous = false }: UseSpeechOptions) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [sttSupported, setSttSupported] = useState(false)

  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    setSttSupported(!!SpeechRecognition)
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = SPEECH_LANG_MAP[language] || 'en-IN'
    recognition.continuous = continuous

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1][0].transcript
      setTranscript(result)
      if (onTranscript) onTranscript(result)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [language, onTranscript, continuous])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const speak = useCallback(
    async (text: string) => {
      if (!text) return

      const cleaned = cleanText(text)
      if (!cleaned) return

      setIsSpeaking(true)

      try {
        if (language === 'kn' || language === 'te') {
          await speakWithBrowser(cleaned, language)
        } else {
          await speakWithElevenLabs(cleaned)
        }
      } catch (error) {
        console.error('[TTS] ✗ Speak error:', error)
      } finally {
        setIsSpeaking(false)
      }
    },
    [language]
  )

  const stopSpeaking = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return {
    isListening,
    isSpeaking,
    transcript,
    sttSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  }
}
