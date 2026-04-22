'use client'

import { motion } from 'framer-motion'
import type { Language } from '@/lib/types'

// Suggested prompt chips as specified in the design
const PROMPT_CHIPS = [
  {
    id: 'landlord',
    label: { en: 'My landlord is evicting me', hi: 'मेरा मकान मालिक मुझे निकाल रहा है' },
  },
  {
    id: 'salary',
    label: { en: 'My employer hasn\'t paid my salary', hi: 'मेरे नियोक्ता ने मेरा वेतन नहीं दिया' },
  },
  {
    id: 'police',
    label: { en: 'I need to file a police complaint', hi: 'मुझे पुलिस शिकायत दर्ज करनी है' },
  },
]

interface QuickActionsProps {
  language: Language
  onSelect: (prompt: string) => void
}

export function QuickActions({ language, onSelect }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {PROMPT_CHIPS.map((chip, index) => (
        <motion.button
          key={chip.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(chip.label[language])}
          className="glass-card px-4 py-3 rounded-2xl text-sm text-foreground hover:bg-primary/5 hover:border-primary/30 transition-colors shadow-sm cursor-pointer"
        >
          {chip.label[language]}
        </motion.button>
      ))}
    </div>
  )
}
