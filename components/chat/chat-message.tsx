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

export function ChatMessage({ role, content, isStreaming, lawReference, timestamp, language, t }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = role === 'user'

  const { isSpeaking, ttsSupported, speak, stopSpeaking } = useSpeech({ language })

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSpeak = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking()
    } else {
      speak(content)
    }
  }, [isSpeaking, content, speak, stopSpeaking])

  const formattedTime = timestamp 
    ? new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
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
        {/* Avatar - only show for AI */}
        {!isUser && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex-shrink-0 flex items-start justify-center w-10 h-10 rounded-full bg-primary shadow-lg"
          >
            <Scale className="h-5 w-5 text-primary-foreground mt-2.5" />
          </motion.div>
        )}

        <div className="flex flex-col">
          {/* Message bubble */}
          <div
            className={cn(
              'px-4 py-3 shadow-sm',
              isUser 
                ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md' 
                : 'glass-card rounded-2xl rounded-bl-md'
            )}
          >
            {isStreaming && !content ? (
              <TypingIndicator thinkingText={t('chat.thinking')} />
            ) : (
              <div className={cn(
                'text-sm leading-relaxed',
                isUser ? 'text-primary-foreground' : 'text-foreground'
              )}>
                <MessageContent content={content} isUser={isUser} />
              </div>
            )}
          </div>

          {/* Law reference badge - only for AI messages */}
          {!isUser && lawReference && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-2"
            >
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                <Scale className="h-3 w-3 mr-1.5" />
                {lawReference}
              </span>
            </motion.div>
          )}

          {/* Timestamp and actions */}
          <div className={cn(
            'flex items-center gap-2 mt-1.5 px-1',
            isUser ? 'justify-end' : 'justify-start'
          )}>
            <span className="text-[10px] text-muted-foreground">
              {formattedTime}
            </span>
            
            {!isUser && content && !isStreaming && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>

                {/* TTS Button */}
                {ttsSupported && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSpeak}
                    className={cn(
                      "h-5 w-5 p-0 transition-colors",
                      isSpeaking 
                        ? "text-primary hover:text-primary/80" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title={isSpeaking ? t('tts.stop') : t('tts.play')}
                  >
                    {isSpeaking ? (
                      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                        <VolumeX className="h-3 w-3" />
                      </motion.div>
                    ) : (
                      <Volume2 className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function TypingIndicator({ thinkingText }: { thinkingText: string }) {
  return (
    <div className="flex items-center gap-1 py-1 px-2">
      <span className="text-xs text-muted-foreground mr-2">{thinkingText}</span>
      <div className="typing-dot w-2 h-2 rounded-full bg-primary/60" />
      <div className="typing-dot w-2 h-2 rounded-full bg-primary/60" />
      <div className="typing-dot w-2 h-2 rounded-full bg-primary/60" />
    </div>
  )
}

function MessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  const lines = content.split('\n')
  
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />
        
        // Headers
        if (line.startsWith('### ')) {
          return <h4 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(4)}</h4>
        }
        if (line.startsWith('## ')) {
          return <h3 key={i} className="font-semibold text-lg mt-4 mb-2">{line.slice(3)}</h3>
        }
        if (line.startsWith('# ')) {
          return <h2 key={i} className="font-bold text-xl mt-4 mb-2">{line.slice(2)}</h2>
        }
        
        // Bullet points
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className={isUser ? 'text-primary-foreground/70' : 'text-primary'}>•</span>
              <span>{formatInlineText(line.slice(2), isUser)}</span>
            </div>
          )
        }
        
        // Numbered lists
        const numberedMatch = line.match(/^(\d+)\.\s+(.*)/)
        if (numberedMatch) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className={cn(
                'font-medium min-w-[1.5rem]',
                isUser ? 'text-primary-foreground/70' : 'text-primary'
              )}>
                {numberedMatch[1]}.
              </span>
              <span>{formatInlineText(numberedMatch[2], isUser)}</span>
            </div>
          )
        }
        
        // Regular paragraph
        return <p key={i} className="leading-relaxed">{formatInlineText(line, isUser)}</p>
      })}
    </div>
  )
}

function formatInlineText(text: string, isUser: boolean): React.ReactNode {
  // Handle bold text **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    }
    // Handle placeholders [TEXT]
    const placeholderParts = part.split(/(\[[^\]]+\])/g)
    return placeholderParts.map((p, j) => {
      if (p.startsWith('[') && p.endsWith(']')) {
        return (
          <span 
            key={`${i}-${j}`} 
            className={cn(
              'px-1.5 py-0.5 rounded text-xs font-mono',
              isUser 
                ? 'bg-primary-foreground/20 text-primary-foreground' 
                : 'bg-accent/50 text-accent-foreground'
            )}
          >
            {p}
          </span>
        )
      }
      return p
    })
  })
}
