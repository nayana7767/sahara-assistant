'use client'

import { Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FloatingSOSProps {
  onClick: () => void
}

export function FloatingSOS({ onClick }: FloatingSOSProps) {
  return (
    <Button
      variant="destructive"
      size="icon"
      onClick={onClick}
      className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full shadow-lg bg-sos hover:bg-sos/90 text-sos-foreground sos-pulse md:hidden"
      aria-label="Emergency SOS"
    >
      <Phone className="h-6 w-6" />
    </Button>
  )
}
