'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Mic, MicOff, Loader2, AudioLines } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useSpeech } from '@/hooks/useSpeech'
import type { Language } from '@/lib/types'
import type { TranslationKey } from '@/lib/i18n/translations'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  language: Language
  disabled?: boolean
  t: (key: TranslationKey) => string
}

export function ChatInput({ onSend, isLoading, language, disabled, t }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleTranscript = useCallback((text: string) => {
    setInput(prev => prev + (prev ? ' ' : '') + text)
  }, [])

  const { 
    isListening, 
    sttSupported, 
    startListening, 
    stopListening,
    transcript
  } = useSpeech({ 
    language, 
    onTranscript: handleTranscript 
  })

  // Show interim transcript
  useEffect(() => {
    if (isListening && transcript) {
      // Show the interim text as user types
    }
  }, [transcript, isListening])

  const handleSubmit = () => {
    if (!input.trim() || isLoading || disabled) return
    onSend(input.trim())
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  const toggleRecording = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t border-border/50 glass-card p-4"
    >
      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center gap-2 pb-3"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <AudioLines className="h-5 w-5 text-red-500" />
            </motion.div>
            <span className="text-sm font-medium text-red-500">
              {t('chat.listening')}
            </span>
            <div className="flex gap-1">
              <motion.div className="w-1.5 h-1.5 rounded-full bg-red-500" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} />
              <motion.div className="w-1.5 h-1.5 rounded-full bg-red-500" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
              <motion.div className="w-1.5 h-1.5 rounded-full bg-red-500" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            disabled={isLoading || disabled}
            className="min-h-[56px] max-h-[200px] resize-none pr-14 py-4 rounded-2xl glass-card border-border/50 focus:border-primary/50 text-base"
            rows={1}
          />
          
          {/* Voice input button */}
          <AnimatePresence>
            {sttSupported && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 bottom-3"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={toggleRecording}
                  disabled={isLoading || disabled}
                  className={cn(
                    'h-9 w-9 rounded-full transition-all',
                    isListening && 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30'
                  )}
                  aria-label={isListening ? 'Stop recording' : 'Start voice input'}
                >
                  {isListening ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <MicOff className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!sttSupported && (
            <p className="absolute right-3 bottom-4 text-[10px] text-muted-foreground">
              {t('chat.voiceNotSupported')}
            </p>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading || disabled}
            size="icon"
            className="h-14 w-14 shrink-0 rounded-2xl shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </motion.div>
      </div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-[11px] text-muted-foreground text-center mt-3"
      >
        {t('chat.disclaimer')}
      </motion.p>
    </motion.div>
  )
}
