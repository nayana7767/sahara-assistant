'use client'

import { Scale, User, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-4',
        isUser ? 'bg-transparent' : 'bg-muted/30'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full',
          isUser ? 'bg-secondary' : 'bg-primary'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-secondary-foreground" />
        ) : (
          <Scale className="h-4 w-4 text-primary-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">
            {isUser ? 'You' : 'NyayBot'}
          </span>
          {isStreaming && (
            <span className="text-xs text-muted-foreground animate-pulse">
              typing...
            </span>
          )}
        </div>

        <div className="prose prose-sm max-w-none text-foreground">
          <MessageContent content={content} />
        </div>

        {!isUser && content && !isStreaming && (
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function MessageContent({ content }: { content: string }) {
  // Simple markdown-like rendering
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
              <span className="text-primary">•</span>
              <span>{formatInlineText(line.slice(2))}</span>
            </div>
          )
        }
        
        // Numbered lists
        const numberedMatch = line.match(/^(\d+)\.\s+(.*)/)
        if (numberedMatch) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-primary font-medium min-w-[1.5rem]">{numberedMatch[1]}.</span>
              <span>{formatInlineText(numberedMatch[2])}</span>
            </div>
          )
        }
        
        // Regular paragraph
        return <p key={i} className="leading-relaxed">{formatInlineText(line)}</p>
      })}
    </div>
  )
}

function formatInlineText(text: string): React.ReactNode {
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
          <span key={`${i}-${j}`} className="bg-accent text-accent-foreground px-1 rounded text-sm font-mono">
            {p}
          </span>
        )
      }
      return p
    })
  })
}
