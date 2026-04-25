'use client'

import { Scale, Phone, Globe, FileText, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SUPPORTED_LANGUAGES, type Language } from '@/lib/types'
import type { TranslationKey } from '@/lib/i18n/translations'

interface ChatHeaderProps {
  language: Language
  onLanguageChange: (lang: Language) => void
  onOpenSOS: () => void
  onOpenDocuments: () => void
  onOpenAPIKey: () => void
  t: (key: TranslationKey) => string
}

export function ChatHeader({
  language,
  onLanguageChange,
  onOpenSOS,
  onOpenDocuments,
  onOpenAPIKey,
  t,
}: ChatHeaderProps) {
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language)

  return (
    <header className="w-full bg-white border-b border-border shadow-sm px-6 py-3">
      <div className="flex items-center justify-between">
        {/* LEFT: Logo + App Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            <Scale className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Sahara</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {t('nav.subtitle')}
            </p>
          </div>
        </div>

        {/* CENTER: Empty for balance */}
        <div className="flex-1" />

        {/* RIGHT: Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenDocuments}
            className="gap-2 hidden sm:flex"
            title={t('nav.documents')}
          >
            <FileText className="h-4 w-4" />
            <span>{t('nav.documents')}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAPIKey}
            className="gap-2 hidden sm:flex"
            title="Configure OpenRouter API Key"
          >
            <Key className="h-4 w-4" />
            <span>API Key</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{currentLang?.nativeName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className={language === lang.code ? 'bg-accent' : ''}
                >
                  {lang.nativeName} ({lang.name})
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="destructive"
            size="sm"
            onClick={onOpenSOS}
            className="gap-2"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">{t('nav.sos')}</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
