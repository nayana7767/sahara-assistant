'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/types'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  language: Language
  disabled?: boolean
}

export function ChatInput({ onSend, isLoading, language, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Check voice support on mount
  useEffect(() => {
    const supported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
    setVoiceSupported(supported)
  }, [])

  const placeholder = language === 'hi' 
    ? 'अपनी समस्या यहां बताएं...' 
    : 'Tell me your legal problem...'

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setIsTranscribing(true)
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        
        try {
          const formData = new FormData()
          formData.append('audio', audioBlob)
          formData.append('language', language)

          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          })

          if (response.ok) {
            const { text } = await response.json()
            setInput((prev) => prev + (prev ? ' ' : '') + text)
          }
        } catch (error) {
          console.error('Transcription error:', error)
        } finally {
          setIsTranscribing(false)
          stream.getTracks().forEach(track => track.stop())
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-t border-border/50 glass-card p-4"
    >
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading || disabled || isTranscribing}
            className="min-h-[56px] max-h-[200px] resize-none pr-14 py-4 rounded-2xl glass-card border-border/50 focus:border-primary/50 text-base"
            rows={1}
          />
          
          {/* Voice input button */}
          <AnimatePresence>
            {voiceSupported && (
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
                  disabled={isLoading || disabled || isTranscribing}
                  className={cn(
                    'h-9 w-9 rounded-full transition-all',
                    isRecording && 'bg-red-500 text-white hover:bg-red-600'
                  )}
                  aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
                >
                  {isTranscribing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isRecording ? (
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
          
          {!voiceSupported && (
            <p className="absolute right-3 bottom-4 text-[10px] text-muted-foreground">
              Voice not supported
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
        {language === 'hi' 
          ? 'सहारा केवल सूचनात्मक उद्देश्यों के लिए है। जटिल मामलों के लिए वकील से परामर्श करें।'
          : 'Sahara is for informational purposes only. Consult a lawyer for complex matters.'}
      </motion.p>
    </motion.div>
  )
}
