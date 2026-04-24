'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { SPEECH_LANG_MAP } from '@/lib/i18n/translations'
import type { Language } from '@/lib/i18n/translations'

interface UseSpeechOptions {
  language: Language
  onTranscript?: (text: string) => void
  continuous?: boolean
}

export function useSpeech({ language, onTranscript, continuous = false }: UseSpeechOptions) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [sttSupported, setSttSupported] = useState(false)
  const [ttsSupported, setTtsSupported] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSttSupported(!!SpeechRecognition)
    setTtsSupported('speechSynthesis' in window)
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = SPEECH_LANG_MAP[language] || 'en-IN'
    recognition.interimResults = true
    recognition.continuous = continuous
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }
      
      const currentTranscript = finalTranscript || interimTranscript
      setTranscript(currentTranscript)
      
      if (finalTranscript && onTranscript) {
        onTranscript(finalTranscript)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [language, onTranscript, continuous])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return

    // Cancel any current speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = SPEECH_LANG_MAP[language] || 'en-IN'
    utterance.rate = 0.9
    utterance.pitch = 1

    // Try to find a voice for the language
    const voices = window.speechSynthesis.getVoices()
    const langCode = SPEECH_LANG_MAP[language]
    const matchingVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]))
    if (matchingVoice) {
      utterance.voice = matchingVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    synthRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [language])

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return {
    isListening,
    isSpeaking,
    transcript,
    sttSupported,
    ttsSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  }
}
