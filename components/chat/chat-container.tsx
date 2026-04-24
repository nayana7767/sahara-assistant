'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat, type UIMessage } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Scale } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatHeader } from './chat-header'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { QuickActions } from './quick-actions'
import { SOSModal } from './sos-modal'
import { ChatSidebar } from './chat-sidebar'
import { ComplaintGenerator } from './complaint-generator'
import { FloatingSOS } from './floating-sos'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslation } from '@/lib/i18n/useTranslation'
import type { ChatSession } from '@/lib/types'

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ''
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

export function ChatContainer() {
  const { language, setLanguage, t, isLoaded } = useTranslation()
  const [sosOpen, setSOSOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [complaintOpen, setComplaintOpen] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ 
      api: '/api/chat',
      body: { language },
    }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Load sessions on mount
  useEffect(() => {
    loadSessions()
  }, [])

  // Persist messages to the backend after streaming completes
  const lastMessageCountRef = useRef(0)
  useEffect(() => {
    if (status === 'ready' && activeSessionId && messages.length > lastMessageCountRef.current) {
      const newMessages = messages.slice(lastMessageCountRef.current)
      lastMessageCountRef.current = messages.length
      
      // Save each new message
      for (const msg of newMessages) {
        const content = getUIMessageText(msg)
        if (content) {
          fetch(`/api/sessions/${activeSessionId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: msg.role, content }),
          }).catch(err => console.error('Failed to save message:', err))
        }
      }

      // Auto-title the session from the first user message
      if (messages.length >= 1) {
        const firstUserMsg = messages.find(m => m.role === 'user')
        if (firstUserMsg) {
          const title = getUIMessageText(firstUserMsg).slice(0, 50) || 'New Chat'
          fetch(`/api/sessions/${activeSessionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
          }).then(() => {
            setSessions(prev => prev.map(s => 
              s.id === activeSessionId ? { ...s, title } : s
            ))
          }).catch(err => console.error('Failed to update title:', err))
        }
      }
    }
  }, [status, messages, activeSessionId])

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setIsInitialLoad(false)
    }
  }

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      })
      if (response.ok) {
        const session = await response.json()
        setSessions((prev) => [session, ...prev])
        setActiveSessionId(session.id)
        setMessages([])
        lastMessageCountRef.current = 0
      }
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const handleSendMessage = useCallback(async (content: string) => {
    // Auto-create session if none exists
    if (!activeSessionId) {
      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language }),
        })
        if (response.ok) {
          const session = await response.json()
          setSessions((prev) => [session, ...prev])
          setActiveSessionId(session.id)
          lastMessageCountRef.current = 0
        }
      } catch (error) {
        console.error('Failed to create session:', error)
      }
    }
    sendMessage({ text: content })
  }, [activeSessionId, language, sendMessage])

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt)
  }

  const handleDeleteSession = async (id: string) => {
    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (activeSessionId === id) {
      setActiveSessionId(null)
      setMessages([])
      lastMessageCountRef.current = 0
    }
  }

  const handleSelectSession = async (id: string) => {
    setActiveSessionId(id)
    try {
      const response = await fetch(`/api/sessions/${id}/messages`)
      if (response.ok) {
        const data = await response.json()
        const uiMessages: UIMessage[] = data.map((msg: { id: string; role: 'user' | 'assistant'; content: string }) => ({
          id: msg.id,
          role: msg.role,
          parts: [{ type: 'text' as const, text: msg.content }],
        }))
        setMessages(uiMessages)
        lastMessageCountRef.current = uiMessages.length
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  // Full-screen loading spinner
  if (isInitialLoad || !isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center gradient-bg">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Scale className="h-8 w-8 text-primary" />
            </motion.div>
          </div>
          <p className="text-muted-foreground">{t('loading.app')}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden gradient-bg">
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={createNewSession}
        onDeleteSession={handleDeleteSession}
        language={language}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        t={t}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          language={language}
          onLanguageChange={setLanguage}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenSOS={() => setSOSOpen(true)}
          onOpenDocuments={() => setComplaintOpen(true)}
          t={t}
        />

        {/* Messages Area */}
        <ScrollArea 
          ref={scrollRef}
          className="flex-1 chat-scrollbar"
        >
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col items-center justify-center min-h-full px-4 py-12"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="flex items-center justify-center w-20 h-20 rounded-full glass-card mb-6 shadow-lg"
                >
                  <Scale className="h-10 w-10 text-primary" />
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-3 text-balance"
                >
                  {t('welcome.title')}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground text-center max-w-md mb-8 text-pretty leading-relaxed"
                >
                  {t('welcome.subtitle')}
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full max-w-lg"
                >
                  <p className="text-sm font-medium text-muted-foreground text-center mb-4">
                    {t('welcome.suggested')}
                  </p>
                  <QuickActions 
                    language={language} 
                    onSelect={handleQuickAction}
                    t={t}
                  />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="pb-4"
              >
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role as 'user' | 'assistant'}
                    content={getUIMessageText(message)}
                    isStreaming={status === 'streaming' && message === messages[messages.length - 1] && message.role === 'assistant'}
                    language={language}
                    t={t}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Input Area */}
        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoading}
          language={language}
          t={t}
        />
      </div>

      {/* SOS Modal */}
      <SOSModal
        open={sosOpen}
        onOpenChange={setSOSOpen}
        language={language}
        t={t}
      />

      {/* Complaint Generator Modal */}
      <ComplaintGenerator
        open={complaintOpen}
        onOpenChange={setComplaintOpen}
        language={language}
        sessionId={activeSessionId}
        t={t}
      />

      {/* Floating SOS Button */}
      <FloatingSOS onClick={() => setSOSOpen(true)} />
    </div>
  )
}
