'use client'

import { Scale, Menu, Phone, Globe, FileText, Key } from 'lucide-react'
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
  onOpenSidebar: () => void
  onOpenSOS: () => void
  onOpenDocuments: () => void
  onOpenAPIKey: () => void
  t: (key: TranslationKey) => string
}

export function ChatHeader({
  language,
  onLanguageChange,
  onOpenSidebar,
  onOpenSOS,
  onOpenDocuments,
  onOpenAPIKey,
  t,
}: ChatHeaderProps) {
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language)

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSidebar}
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
            <Scale className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground">{t('nav.title')}</h1>
            <p className="text-xs text-muted-foreground">
              {t('nav.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenDocuments}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">
            {t('nav.documents')}
          </span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenAPIKey}
          className="gap-2"
          title="Configure OpenRouter API Key"
        >
          <Key className="h-4 w-4" />
          <span className="hidden sm:inline">API Key</span>
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
          className="gap-2 bg-sos hover:bg-sos/90 text-sos-foreground sos-pulse"
        >
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline">{t('nav.sos')}</span>
        </Button>
      </div>
    </header>
  )
}
