'use client'

import { Phone, X, AlertTriangle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EMERGENCY_CATEGORIES, type Language, type EmergencyContact } from '@/lib/types'

interface SOSModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  language: Language
}

export function SOSModal({ open, onOpenChange, language }: SOSModalProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      fetchContacts()
    }
  }, [open])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/emergency')
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (error) {
      console.error('Failed to fetch emergency contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const title = language === 'hi' ? 'आपातकालीन संपर्क' : 'Emergency Contacts'
  const subtitle = language === 'hi' 
    ? 'तत्काल सहायता के लिए नीचे दिए गए नंबरों पर कॉल करें'
    : 'Call the numbers below for immediate assistance'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => {
                const category = EMERGENCY_CATEGORIES[contact.category as keyof typeof EMERGENCY_CATEGORIES]
                return (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground truncate">
                          {contact.name}
                        </span>
                        {category && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {category.label[language]}
                          </Badge>
                        )}
                      </div>
                      <p className="text-lg font-mono font-semibold text-primary">
                        {contact.phone}
                      </p>
                      {contact.region && (
                        <p className="text-xs text-muted-foreground">
                          {contact.region}
                        </p>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="default"
                      className="shrink-0 ml-3 bg-success hover:bg-success/90"
                      onClick={() => handleCall(contact.phone)}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            {language === 'hi'
              ? 'जीवन के लिए खतरनाक आपातकाल में, तुरंत 112 पर कॉल करें।'
              : 'For life-threatening emergencies, call 112 immediately.'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
