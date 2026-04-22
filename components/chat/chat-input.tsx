'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff, Loader2 } from 'lucide-react'
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const placeholder = language === 'hi' 
    ? 'अपना प्रश्न यहां लिखें...' 
    : 'Type your legal question here...'

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
    // Auto-resize
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
    <div className="border-t border-border bg-card p-4">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading || disabled || isTranscribing}
            className="min-h-[52px] max-h-[200px] resize-none pr-12 py-3"
            rows={1}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleRecording}
            disabled={isLoading || disabled || isTranscribing}
            className={cn(
              'absolute right-2 bottom-2 h-8 w-8',
              isRecording && 'text-destructive voice-recording'
            )}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            {isTranscribing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading || disabled}
          size="icon"
          className="h-[52px] w-[52px] shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-2">
        {language === 'hi' 
          ? 'NyayBot केवल सूचनात्मक उद्देश्यों के लिए है। जटिल मामलों के लिए वकील से परामर्श करें।'
          : 'NyayBot is for informational purposes only. Consult a lawyer for complex matters.'}
      </p>
    </div>
  )
}
