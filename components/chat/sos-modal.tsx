'use client'

import { Phone, X, AlertTriangle, Zap, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Badge } from '@/components/ui/badge'
import { 
  PRIORITY_EMERGENCY_CONTACTS,
  CATEGORY_TRANSLATION_MAP,
  type Language, 
} from '@/lib/types'
import { cn } from '@/lib/utils'
import type { TranslationKey } from '@/lib/i18n/translations'

interface SOSModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  language: Language
  t: (key: TranslationKey) => string
}

export function SOSModal({ open, onOpenChange, language, t }: SOSModalProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleCall = (number: string) => {
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = `tel:${number}`
    } else {
      alert(t('sos.callOnMobile'))
    }
  }

  const getCategoryLabel = (category: string): string => {
    const translationKey = CATEGORY_TRANSLATION_MAP[category]
    return translationKey ? t(translationKey as TranslationKey) : category
  }

  const CustomModal = () => {
    if (!open) return null

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onOpenChange(false)
      }
    }

    return (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={handleBackdropClick}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "bg-background rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border",
            isMobile ? "w-full max-w-sm max-h-[90vh]" : "w-[420px] max-h-[80vh]"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-destructive/10 border-b border-destructive/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <h2 className="text-lg font-bold text-foreground">
                  {t('sos.title')}
                </h2>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-destructive font-medium mt-1">{t('sos.subtitle')}</p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {/* Women Safety Section */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  {t('sos.womenSafety')}
                </div>
                {PRIORITY_EMERGENCY_CONTACTS
                  .filter(contact => contact.priority === 1 && contact.category === 'women')
                  .map((contact, index) => (
                    <motion.div
                      key={`women-${contact.number}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer border border-destructive/20 rounded-lg bg-destructive/5 hover:bg-destructive/10"
                      onClick={() => handleCall(contact.number)}
                    >
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground text-sm">
                                {contact.title}
                              </h3>
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="ml-1"
                              >
                                <Shield className="h-3 w-3 text-destructive" />
                              </motion.div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-800 px-2 py-0.5 text-xs">
                                {getCategoryLabel(contact.category)}
                              </Badge>
                            </div>
                            <p className="text-lg font-mono font-bold text-foreground">
                              {contact.number}
                            </p>
                          </div>
                          <button
                            className="shrink-0 ml-3 bg-green-500 hover:bg-green-600 text-white rounded-full h-8 w-8 shadow-md hover:scale-105 transition-transform flex items-center justify-center"
                            onClick={(e) => { e.stopPropagation(); handleCall(contact.number) }}
                          >
                            <Phone className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="h-1 bg-gradient-to-r from-red-400 to-pink-400" />
                    </motion.div>
                  ))}
              </div>

              {/* Immediate Emergency Section */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  {t('sos.immediateEmergency')}
                </div>
                {PRIORITY_EMERGENCY_CONTACTS
                  .filter(contact => contact.priority === 2)
                  .map((contact, index) => (
                    <motion.div
                      key={`emergency-${contact.number}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (index + 2) * 0.1, duration: 0.3 }}
                      className="relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50/80 dark:bg-orange-900/20 hover:bg-orange-100/80 dark:hover:bg-orange-900/30"
                      onClick={() => handleCall(contact.number)}
                    >
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground text-sm">
                                {contact.title}
                              </h3>
                              <div className="flex items-center gap-1">
                                <Zap className="h-3 w-3 text-orange-500" />
                                <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800 px-2 py-0.5 text-xs">
                                  {t('sos.immediate')}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800 px-2 py-0.5 text-xs">
                                {getCategoryLabel(contact.category)}
                              </Badge>
                            </div>
                            <p className="text-lg font-mono font-bold text-foreground">
                              {contact.number}
                            </p>
                          </div>
                          <button
                            className="shrink-0 ml-3 bg-green-500 hover:bg-green-600 text-white rounded-full h-8 w-8 shadow-md hover:scale-105 transition-transform flex items-center justify-center"
                            onClick={(e) => { e.stopPropagation(); handleCall(contact.number) }}
                          >
                            <Phone className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className="h-1 bg-gradient-to-r from-orange-400 to-yellow-400" />
                    </motion.div>
                  ))}
              </div>

              {/* Other Contacts Section */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t('sos.otherContacts')}
                </div>
                {PRIORITY_EMERGENCY_CONTACTS
                  .filter(contact => contact.priority > 2)
                  .map((contact, index) => (
                    <motion.div
                      key={`other-${contact.number}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (index + 5) * 0.1, duration: 0.3 }}
                      className="relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer border border-border rounded-lg bg-card hover:bg-muted/50"
                      onClick={() => handleCall(contact.number)}
                    >
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground text-sm">
                                {contact.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                                {getCategoryLabel(contact.category)}
                              </Badge>
                            </div>
                            <p className="text-lg font-mono font-bold text-foreground">
                              {contact.number}
                            </p>
                          </div>
                          <button
                            className="shrink-0 ml-3 bg-green-500 hover:bg-green-600 text-white rounded-full h-8 w-8 shadow-md hover:scale-105 transition-transform flex items-center justify-center"
                            onClick={(e) => { e.stopPropagation(); handleCall(contact.number) }}
                          >
                            <Phone className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <div className={cn(
                        "h-1",
                        contact.priority === 3 && "bg-gradient-to-r from-blue-400 to-cyan-400",
                        contact.priority === 4 && "bg-gradient-to-r from-purple-400 to-indigo-400",
                        contact.priority === 5 && "bg-gradient-to-r from-gray-400 to-slate-400"
                      )} />
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 bg-muted/50 border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground text-center">
              {t('sos.footer')}
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!mounted) return null

  return createPortal(<CustomModal />, document.body)
}
