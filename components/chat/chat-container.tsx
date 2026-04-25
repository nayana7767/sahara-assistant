'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { type UIMessage } from '@ai-sdk/react'
import { Scale } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatHeader } from './chat-header'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { QuickActions } from './quick-actions'
import { SOSModal } from './sos-modal'
import { ChatSidebar } from './chat-sidebar'
import { ChartHistorySidebar } from './chart-history-sidebar'
import { ChartHistoryDrawer } from './chart-history-drawer'
import { ComplaintGenerator } from './complaint-generator'
import { FloatingSOS } from './floating-sos'
import { APIKeyModal } from './api-key-modal'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { useChartHistory } from '@/hooks/useChartHistory'
import { callOpenRouterAPI, getOpenRouterApiKey, type OpenRouterMessage } from '@/lib/openrouter'
import type { ChatSession } from '@/lib/types'
import type { ChartRecord } from '@/lib/chart-storage'

interface StoredMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function getUIMessageText(msg: UIMessage | StoredMessage): string {
  // Case 1: AI SDK message (has parts)
  if ('parts' in msg && msg.parts && Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('')
  }

  // Case 2: Stored message (has content)
  if ('content' in msg) {
    return msg.content || ''
  }

  // Fallback
  return ''
}

export function ChatContainer() {
  const { language, setLanguage, t, isLoaded } = useTranslation()
  const { charts, saveChart, deleteChart, loadChart } = useChartHistory()
  
  const [sosOpen, setSOSOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [complaintOpen, setComplaintOpen] = useState(false)
  const [apiKeyOpen, setApiKeyOpen] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [activeChartId, setActiveChartId] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [messages, setMessages] = useState<StoredMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Check for API key on mount
  useEffect(() => {
    const hasKey = !!getOpenRouterApiKey()
    setHasApiKey(hasKey)
  }, [apiKeyOpen])

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
        setActiveChartId(null)
      }
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const handleSelectChart = (chart: ChartRecord) => {
    setActiveChartId(chart.id)
    setMessages([
      {
        id: `${chart.id}-display`,
        role: 'assistant',
        content: chart.content,
      },
    ])
  }

  const handleDeleteChart = (id: string) => {
    deleteChart(id)
    if (activeChartId === id) {
      setActiveChartId(null)
      setMessages([])
    }
  }

  const handleSendMessage = useCallback(
    async (content: string) => {
      const apiKey = getOpenRouterApiKey()
      if (!apiKey) {
        alert('Please configure your OpenRouter API key first')
        setApiKeyOpen(true)
        return
      }

      // Auto-create session if none exists
      let currentSessionId = activeSessionId
      if (!currentSessionId) {
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
            currentSessionId = session.id
          }
        } catch (error) {
          console.error('Failed to create session:', error)
          return
        }
      }

      // Add user message
      const userMessage: StoredMessage = {
        id: `${Date.now()}-user`,
        role: 'user',
        content,
      }
      setMessages((prev) => [...prev, userMessage])

      // Save user message
      if (currentSessionId) {
        try {
          await fetch(`/api/sessions/${currentSessionId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'user', content }),
          })
        } catch (error) {
          console.error('Failed to save user message:', error)
        }
      }

      // Call AI
      setIsLoading(true)
      const assistantMessage: StoredMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: '',
      }
      setMessages((prev) => [...prev, assistantMessage])

      try {
        const conversationMessages: OpenRouterMessage[] = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
        conversationMessages.push({
          role: 'user',
          content,
        })

        let assistantContent = ''
        await callOpenRouterAPI(conversationMessages, apiKey, (chunk) => {
          assistantContent += chunk
          setMessages((prev) => {
            const updated = [...prev]
            if (updated[updated.length - 1]?.role === 'assistant') {
              updated[updated.length - 1].content = assistantContent
            }
            return updated
          })
        })

        // Save chart history
        if (assistantContent) {
          const chart = saveChart(assistantContent, language)
          setActiveChartId(chart.id)
        }

        // Save assistant message
        if (currentSessionId && assistantContent) {
          try {
            await fetch(`/api/sessions/${currentSessionId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: 'assistant', content: assistantContent }),
            })
          } catch (error) {
            console.error('Failed to save assistant message:', error)
          }

          // Auto-title the session from the first user message
          try {
            const title = content.slice(0, 50) || 'New Chat'
            await fetch(`/api/sessions/${currentSessionId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title }),
            }).then(() => {
              setSessions((prev) =>
                prev.map((s) => (s.id === currentSessionId ? { ...s, title } : s))
              )
            })
          } catch (error) {
            console.error('Failed to update title:', error)
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to get response from AI'
        console.error('Chat error:', error)
        setMessages((prev) => {
          const updated = [...prev]
          if (updated[updated.length - 1]?.role === 'assistant') {
            updated[updated.length - 1].content = `Error: ${errorMessage}`
          }
          return updated
        })
      } finally {
        setIsLoading(false)
      }
    },
    [activeSessionId, language, messages, saveChart]
  )

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
    }
  }

  const handleSelectSession = async (id: string) => {
    setActiveSessionId(id)
    setActiveChartId(null)
    try {
      const response = await fetch(`/api/sessions/${id}/messages`)
      if (response.ok) {
        const data = await response.json()
        const loadedMessages: StoredMessage[] = data.map(
          (msg: { id: string; role: 'user' | 'assistant'; content: string }) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
          })
        )
        setMessages(loadedMessages)
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
      {/* Chart History Sidebar (Desktop) */}
      <ChartHistorySidebar
        charts={charts}
        activeChartId={activeChartId}
        onSelectChart={handleSelectChart}
        onNewChart={createNewSession}
        onDeleteChart={handleDeleteChart}
      />

      {/* Chat Sidebar */}
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
          onOpenAPIKey={() => setApiKeyOpen(true)}
          t={t}
        />

        {/* Messages Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto chat-scrollbar px-4 pb-24"
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

                {!hasApiKey && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="w-full max-w-md mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                  >
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                      ⚠️ OpenRouter API key not configured
                    </p>
                    <button
                      onClick={() => setApiKeyOpen(true)}
                      className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      Configure API Key
                    </button>
                  </motion.div>
                )}

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
              <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    isStreaming={isLoading && message === messages[messages.length - 1] && message.role === 'assistant'}
                    language={language}
                    t={t}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoading}
          language={language}
          t={t}
        />
      </div>

      {/* Chart History Drawer (Mobile) */}
      <ChartHistoryDrawer
        charts={charts}
        activeChartId={activeChartId}
        onSelectChart={handleSelectChart}
        onDeleteChart={handleDeleteChart}
      />

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

      {/* API Key Modal */}
      <APIKeyModal
        open={apiKeyOpen}
        onOpenChange={(open) => {
          setApiKeyOpen(open)
          if (!open) {
            setHasApiKey(!!getOpenRouterApiKey())
          }
        }}
      />

      {/* Floating SOS Button */}
      <FloatingSOS onClick={() => setSOSOpen(true)} />
    </div>
  )
}

interface StoredMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function getUIMessageText(msg: UIMessage | StoredMessage): string {
  // Case 1: AI SDK message (has parts)
  if ('parts' in msg && msg.parts && Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('')
  }

  // Case 2: Stored message (has content)
  if ('content' in msg) {
    return msg.content || ''
  }

  // Fallback
  return ''
}

export function ChatContainer() {
  const { language, setLanguage, t, isLoaded } = useTranslation()
  const [sosOpen, setSOSOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [complaintOpen, setComplaintOpen] = useState(false)
  const [apiKeyOpen, setApiKeyOpen] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [messages, setMessages] = useState<StoredMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Check for API key on mount
  useEffect(() => {
    const hasKey = !!getOpenRouterApiKey()
    setHasApiKey(hasKey)
  }, [apiKeyOpen])

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
      }
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const handleSendMessage = useCallback(
    async (content: string) => {
      const apiKey = getOpenRouterApiKey()
      if (!apiKey) {
        alert('Please configure your OpenRouter API key first')
        setApiKeyOpen(true)
        return
      }

      // Auto-create session if none exists
      let currentSessionId = activeSessionId
      if (!currentSessionId) {
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
            currentSessionId = session.id
          }
        } catch (error) {
          console.error('Failed to create session:', error)
          return
        }
      }

      // Add user message
      const userMessage: StoredMessage = {
        id: `${Date.now()}-user`,
        role: 'user',
        content,
      }
      setMessages((prev) => [...prev, userMessage])

      // Save user message
      if (currentSessionId) {
        try {
          await fetch(`/api/sessions/${currentSessionId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'user', content }),
          })
        } catch (error) {
          console.error('Failed to save user message:', error)
        }
      }

      // Call AI
      setIsLoading(true)
      const assistantMessage: StoredMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: '',
      }
      setMessages((prev) => [...prev, assistantMessage])

      try {
        const conversationMessages: OpenRouterMessage[] = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
        conversationMessages.push({
          role: 'user',
          content,
        })

        let assistantContent = ''
        await callOpenRouterAPI(conversationMessages, apiKey, (chunk) => {
          assistantContent += chunk
          setMessages((prev) => {
            const updated = [...prev]
            if (updated[updated.length - 1]?.role === 'assistant') {
              updated[updated.length - 1].content = assistantContent
            }
            return updated
          })
        })

        // Save assistant message
        if (currentSessionId && assistantContent) {
          try {
            await fetch(`/api/sessions/${currentSessionId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: 'assistant', content: assistantContent }),
            })
          } catch (error) {
            console.error('Failed to save assistant message:', error)
          }

          // Auto-title the session from the first user message
          try {
            const title = content.slice(0, 50) || 'New Chat'
            await fetch(`/api/sessions/${currentSessionId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title }),
            }).then(() => {
              setSessions((prev) =>
                prev.map((s) => (s.id === currentSessionId ? { ...s, title } : s))
              )
            })
          } catch (error) {
            console.error('Failed to update title:', error)
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to get response from AI'
        console.error('Chat error:', error)
        setMessages((prev) => {
          const updated = [...prev]
          if (updated[updated.length - 1]?.role === 'assistant') {
            updated[updated.length - 1].content = `Error: ${errorMessage}`
          }
          return updated
        })
      } finally {
        setIsLoading(false)
      }
    },
    [activeSessionId, language, messages]
  )

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
    }
  }

  const handleSelectSession = async (id: string) => {
    setActiveSessionId(id)
    try {
      const response = await fetch(`/api/sessions/${id}/messages`)
      if (response.ok) {
        const data = await response.json()
        const loadedMessages: StoredMessage[] = data.map(
          (msg: { id: string; role: 'user' | 'assistant'; content: string }) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
          })
        )
        setMessages(loadedMessages)
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
          onOpenAPIKey={() => setApiKeyOpen(true)}
          t={t}
        />

        {/* Messages Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto chat-scrollbar px-4 pb-24"
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

                {!hasApiKey && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="w-full max-w-md mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                  >
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                      ⚠️ OpenRouter API key not configured
                    </p>
                    <button
                      onClick={() => setApiKeyOpen(true)}
                      className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      Configure API Key
                    </button>
                  </motion.div>
                )}

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
              <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    isStreaming={isLoading && message === messages[messages.length - 1] && message.role === 'assistant'}
                    language={language}
                    t={t}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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

      {/* API Key Modal */}
      <APIKeyModal
        open={apiKeyOpen}
        onOpenChange={(open) => {
          setApiKeyOpen(open)
          if (!open) {
            setHasApiKey(!!getOpenRouterApiKey())
          }
        }}
      />

      {/* Floating SOS Button */}
      <FloatingSOS onClick={() => setSOSOpen(true)} />
    </div>
  )
}
