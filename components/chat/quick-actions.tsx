'use client'

import { FileText, Search, ShieldAlert, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QUICK_ACTIONS, type Language } from '@/lib/types'

const ICONS = {
  FileText,
  Search,
  ShieldAlert,
  Scale,
}

interface QuickActionsProps {
  language: Language
  onSelect: (prompt: string) => void
}

export function QuickActions({ language, onSelect }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
      {QUICK_ACTIONS.map((action) => {
        const Icon = ICONS[action.icon as keyof typeof ICONS]
        return (
          <Button
            key={action.id}
            variant="outline"
            className="h-auto py-4 px-4 flex flex-col items-center gap-2 hover:bg-accent hover:border-primary/50 transition-all"
            onClick={() => onSelect(action.prompt[language])}
          >
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{action.label[language]}</span>
          </Button>
        )
      })}
    </div>
  )
}
