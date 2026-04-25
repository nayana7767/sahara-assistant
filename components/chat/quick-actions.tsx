'use client'

import { motion } from 'framer-motion'
import type { Language } from '@/lib/types'
import type { TranslationKey } from '@/lib/i18n/translations'

// Suggested prompt chips
interface QuickActionsProps {
  language: Language
  onSelect: (prompt: string) => void
  t: (key: TranslationKey) => string
}

export function QuickActions({ language, onSelect, t }: QuickActionsProps) {
  const chips = [
    { id: 'landlord', key: 'prompt.landlord' as TranslationKey },
    { id: 'salary', key: 'prompt.salary' as TranslationKey },
    { id: 'police', key: 'prompt.police' as TranslationKey },
    { id: 'rights', key: 'prompt.rights' as TranslationKey },
  ]

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="flex flex-wrap justify-center gap-3">
        {chips.map((chip, index) => (
          <motion.button
            key={chip.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(t(chip.key))}
            className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border bg-white hover:bg-primary/5 hover:border-primary/30 transition-all shadow-sm cursor-pointer text-foreground"
          >
            {t(chip.key)}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
