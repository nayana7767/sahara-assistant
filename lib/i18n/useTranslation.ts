'use client'

import { useState, useEffect, useCallback } from 'react'
import { getTranslation, type TranslationKey } from '@/lib/i18n/translations'
import type { Language } from '@/lib/i18n/translations'

const STORAGE_KEY = 'sahara-language'

export function useTranslation() {
  const [language, setLanguageState] = useState<Language>('en')
  const [isLoaded, setIsLoaded] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null
      if (stored && ['en', 'hi', 'kn', 'te', 'ta'].includes(stored)) {
        setLanguageState(stored)
      }
    } catch {
      // localStorage not available
    }
    setIsLoaded(true)
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // localStorage not available
    }
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => {
      return getTranslation(language, key)
    },
    [language]
  )

  return { language, setLanguage, t, isLoaded }
}
