'use client'

import { Phone, X, AlertTriangle, Zap, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  EMERGENCY_CATEGORIES, 
  PRIORITY_EMERGENCY_CONTACTS, 
  type Language, 
  type PriorityEmergencyContact 
} from '@/lib/types'
import { cn } from '@/lib/utils'

interface SOSModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  language: Language
}

export function SOSModal({ open, onOpenChange, language }: SOSModalProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleCall = (number: string) => {
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.location.href = `tel:${number}`;
    } else {
      alert("Calling works only on mobile devices 📱");
    }
  }

  const title = language === 'hi' ? 'आपातकालीन संपर्क' : 'Emergency Contacts'
  const subtitle = language === 'hi' 
    ? 'तत्काल सहायता के लिए नीचे दिए गए नंबरों पर कॉल करें'
    : 'Tap to call immediately'

  const getCategoryColor = (category: string) => {
    const cat = EMERGENCY_CATEGORIES[category as keyof typeof EMERGENCY_CATEGORIES]
    return cat?.color || 'gray'
  }

  // Custom Modal Component
  const CustomModal = () => {
    if (!open) return null

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onOpenChange(false)
      }
    }

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={handleBackdropClick}
      >
        <div 
          className={cn(
            "bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden",
            isMobile ? "w-full max-w-sm h-[90vh]" : "w-[420px] max-h-[80vh]"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-red-50/95 backdrop-blur-sm border-b border-red-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-bold text-red-800">
                  {title}
                </h2>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 rounded-full text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-red-700 mt-1 font-medium">{subtitle}</p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {/* Women Safety Section */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  {language === 'hi' ? 'महिला सुरक्षा' : 'Women Safety'}
                </div>
                {PRIORITY_EMERGENCY_CONTACTS
                  .filter(contact => contact.priority === 1 && contact.category === 'women')
                  .map((contact, index) => {
                    const category = EMERGENCY_CATEGORIES[contact.category as keyof typeof EMERGENCY_CATEGORIES]
                    
                    return (
                      <motion.div
                        key={`women-${contact.number}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer border border-red-200 rounded-lg bg-red-50/80 hover:bg-red-100/80"
                        onClick={() => handleCall(contact.number)}
                      >
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 text-sm">
                                  {contact.title}
                                </h3>
                                <motion.div
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="ml-1"
                                >
                                  <Shield className="h-3 w-3 text-red-500" />
                                </motion.div>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2">
                                {category && (
                                  <Badge className="bg-pink-100 text-pink-800 border-pink-200 px-2 py-0.5 text-xs">
                                    {category.label[language]}
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-lg font-mono font-bold text-gray-900">
                                {contact.number}
                              </p>
                            </div>

                            <button
                              className="shrink-0 ml-3 bg-green-500 hover:bg-green-600 text-white rounded-full h-8 w-8 shadow-md hover:scale-105 transition-transform flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCall(contact.number)
                              }}
                            >
                              <Phone className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="h-1 bg-gradient-to-r from-red-400 to-pink-400" />
                      </motion.div>
                    )
                  })}
              </div>

              {/* Immediate Emergency Section */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-orange-700 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  {language === 'hi' ? 'तत्काल आपातकाल' : 'Immediate Emergency'}
                </div>
                {PRIORITY_EMERGENCY_CONTACTS
                  .filter(contact => contact.priority === 2)
                  .map((contact, index) => {
                    const category = EMERGENCY_CATEGORIES[contact.category as keyof typeof EMERGENCY_CATEGORIES]
                    
                    return (
                      <motion.div
                        key={`emergency-${contact.number}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (index + 2) * 0.1, duration: 0.3 }}
                        className="relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer border border-orange-200 rounded-lg bg-orange-50/80 hover:bg-orange-100/80"
                        onClick={() => handleCall(contact.number)}
                      >
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 text-sm">
                                  {contact.title}
                                </h3>
                                <div className="flex items-center gap-1">
                                  <Zap className="h-3 w-3 text-orange-500" />
                                  <Badge className="bg-orange-100 text-orange-800 border-orange-200 px-2 py-0.5 text-xs">
                                    {language === 'hi' ? 'तत्काल' : 'Immediate'}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2">
                                {category && (
                                  <Badge className="bg-orange-100 text-orange-800 border-orange-200 px-2 py-0.5 text-xs">
                                    {category.label[language]}
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-lg font-mono font-bold text-gray-900">
                                {contact.number}
                              </p>
                            </div>

                            <button
                              className="shrink-0 ml-3 bg-green-500 hover:bg-green-600 text-white rounded-full h-8 w-8 shadow-md hover:scale-105 transition-transform flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCall(contact.number)
                              }}
                            >
                              <Phone className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="h-1 bg-gradient-to-r from-orange-400 to-yellow-400" />
                      </motion.div>
                    )
                  })}
              </div>

              {/* Other Contacts Section */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  {language === 'hi' ? 'अन्य संपर्क' : 'Other Contacts'}
                </div>
                {PRIORITY_EMERGENCY_CONTACTS
                  .filter(contact => contact.priority > 2)
                  .map((contact, index) => {
                    const category = EMERGENCY_CATEGORIES[contact.category as keyof typeof EMERGENCY_CATEGORIES]
                    
                    return (
                      <motion.div
                        key={`other-${contact.number}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (index + 5) * 0.1, duration: 0.3 }}
                        className="relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer border border-gray-200 rounded-lg bg-white hover:bg-gray-50"
                        onClick={() => handleCall(contact.number)}
                      >
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 text-sm">
                                  {contact.title}
                                </h3>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2">
                                {category && (
                                  <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                                    {category.label[language]}
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-lg font-mono font-bold text-gray-900">
                                {contact.number}
                              </p>
                            </div>

                            <button
                              className="shrink-0 ml-3 bg-green-500 hover:bg-green-600 text-white rounded-full h-8 w-8 shadow-md hover:scale-105 transition-transform flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCall(contact.number)
                              }}
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
                    )
                  })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-600 text-center">
              {language === 'hi'
                ? 'जीवन के लिए खतरनाक आपातकाल में, तुरंत 112 पर कॉल करें।'
                : 'For life-threatening emergencies, call 112 immediately.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (typeof window === 'undefined') {
    return null
  }

  return createPortal(<CustomModal />, document.body)
}
