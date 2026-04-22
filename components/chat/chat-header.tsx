'use client'

import { Scale, Menu, Phone, Globe, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SUPPORTED_LANGUAGES, type Language } from '@/lib/types'

interface ChatHeaderProps {
  language: Language
  onLanguageChange: (lang: Language) => void
  onOpenSidebar: () => void
  onOpenSOS: () => void
  onOpenDocuments: () => void
}

export function ChatHeader({
  language,
  onLanguageChange,
  onOpenSidebar,
  onOpenSOS,
  onOpenDocuments,
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
            <h1 className="text-lg font-semibold text-foreground">NyayBot</h1>
            <p className="text-xs text-muted-foreground">
              {language === 'hi' ? 'आपका कानूनी सहायक' : 'Your Legal Assistant'}
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
            {language === 'hi' ? 'दस्तावेज़' : 'Documents'}
          </span>
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
          <span className="hidden sm:inline">SOS</span>
        </Button>
      </div>
    </header>
  )
}
