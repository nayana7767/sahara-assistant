'use client'

import { Phone } from 'lucide-react'
import { motion } from 'framer-motion'

interface FloatingSOSProps {
  onClick: () => void
}

export function FloatingSOS({ onClick }: FloatingSOSProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-24 right-4 z-[9999] h-16 w-16 rounded-full shadow-2xl bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
      aria-label="Emergency SOS"
    >
      {/* Pulse rings */}
      <motion.span
        className="absolute inset-0 rounded-full bg-red-500"
        animate={{
          scale: [1, 1.4, 1.4],
          opacity: [0.7, 0, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
      <motion.span
        className="absolute inset-0 rounded-full bg-red-500"
        animate={{
          scale: [1, 1.25, 1.25],
          opacity: [0.5, 0, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
          delay: 0.3,
        }}
      />
      
      {/* Icon with subtle scale animation */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Phone className="h-7 w-7" />
      </motion.div>
      
      {/* SOS text label */}
      <span className="absolute -top-1 -right-1 bg-white text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
        SOS
      </span>
    </motion.button>
  )
}
