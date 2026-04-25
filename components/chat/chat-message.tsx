'use client'

import { Scale, Copy, Check, Volume2, VolumeX } from 'lucide-react'
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useSpeech } from '@/hooks/useSpeech'
import type { Language } from '@/lib/types'
import type { TranslationKey } from '@/lib/i18n/translations'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  lawReference?: string
  timestamp?: string
  language: Language
  t: (key: TranslationKey) => string
}

export function ChatMessage({
  role,
  content,
  isStreaming,
  lawReference,
  timestamp,
  language,
  t
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = role === 'user'

  // ✅ DO NOT depend on ttsSupported anymore
  const { isSpeaking, speak, stopSpeaking } = useSpeech({ language })

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSpeak = useCallback(() => {
    if (!content) return

    if (isSpeaking) {
      stopSpeaking()
    } else {
      speak(content)
    }
  }, [isSpeaking, content, speak, stopSpeaking])

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex w-full px-4 py-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'flex gap-3 max-w-[85%] md:max-w-[75%]',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        {/* Avatar */}
        {!isUser && (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Scale className="h-5 w-5 text-white" />
          </div>
        )}

        <div className="flex flex-col">
          {/* Message */}
          <div
            className={cn(
              'px-4 py-3 shadow-sm',
              isUser
                ? 'bg-primary text-white rounded-2xl rounded-br-md'
                : 'glass-card rounded-2xl rounded-bl-md'
            )}
          >
            {isStreaming && !content ? (
              <TypingIndicator thinkingText={t('chat.thinking')} />
            ) : (
              <div className="text-sm leading-relaxed">
                <MessageContent content={content} isUser={isUser} />
              </div>
            )}
          </div>

          {/* Law reference */}
          {!isUser && lawReference && !isStreaming && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                <Scale className="h-3 w-3 mr-1" />
                {lawReference}
              </span>
            </div>
          )}

          {/* Actions */}
          <div
            className={cn(
              'flex items-center gap-2 mt-1 px-1',
              isUser ? 'justify-end' : 'justify-start'
            )}
          >
            <span className="text-[10px] text-muted-foreground">
              {formattedTime}
            </span>

            {!isUser && content && !isStreaming && (
              <div className="flex items-center gap-1">
                {/* Copy */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-5 w-5 p-0"
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>

                {/* 🔊 ALWAYS SHOW VOICE BUTTON */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSpeak}
                  className="h-5 w-5 p-0"
                >
                  {isSpeaking ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                    >
                      <VolumeX className="h-3 w-3 text-red-500" />
                    </motion.div>
                  ) : (
                    <Volume2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ====================== */

function TypingIndicator({ thinkingText }: { thinkingText: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs">{thinkingText}</span>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
    </div>
  )
}

/* ====================== */

function MessageContent({
  content,
  isUser
}: {
  content: string
  isUser: boolean
}) {
  const lines = content.split('\n')

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />

        if (line.startsWith('### '))
          return <h4 key={i}>{line.slice(4)}</h4>

        if (line.startsWith('## '))
          return <h3 key={i}>{line.slice(3)}</h3>

        if (line.startsWith('# '))
          return <h2 key={i}>{line.slice(2)}</h2>

        if (line.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2">
              <span>•</span>
              <span>{line.slice(2)}</span>
            </div>
          )
        }

        return <p key={i}>{line}</p>
      })}
    </div>
  )
}