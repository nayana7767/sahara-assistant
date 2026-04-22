'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat, type UIMessage } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Scale } from 'lucide-react'
import { ChatHeader } from './chat-header'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { QuickActions } from './quick-actions'
import { SOSModal } from './sos-modal'
import { ChatSidebar } from './chat-sidebar'
import { ComplaintGenerator } from './complaint-generator'
import { FloatingSOS } from './floating-sos'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Language, ChatSession } from '@/lib/types'

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ''
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}

export function ChatContainer() {
  const [language, setLanguage] = useState<Language>('en')
  const [sosOpen, setSOSOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [complaintOpen, setComplaintOpen] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
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

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
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

  const handleSendMessage = (content: string) => {
    sendMessage({ text: content })
  }

  const handleQuickAction = (prompt: string) => {
    sendMessage({ text: prompt })
  }

  const handleDeleteSession = async (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (activeSessionId === id) {
      setActiveSessionId(null)
      setMessages([])
    }
  }

  const handleSelectSession = async (id: string) => {
    setActiveSessionId(id)
    // Load messages for this session
    try {
      const response = await fetch(`/api/sessions/${id}/messages`)
      if (response.ok) {
        const data = await response.json()
        // Convert to UIMessage format
        const uiMessages: UIMessage[] = data.map((msg: { id: string; role: 'user' | 'assistant'; content: string }) => ({
          id: msg.id,
          role: msg.role,
          parts: [{ type: 'text' as const, text: msg.content }],
        }))
        setMessages(uiMessages)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const welcomeTitle = language === 'hi' 
    ? 'नमस्ते! मैं न्यायबोट हूं' 
    : 'Namaste! I am NyayBot'
  
  const welcomeSubtitle = language === 'hi'
    ? 'आपका AI कानूनी सहायक। मैं भारतीय कानून, आपके अधिकारों, और कानूनी प्रक्रियाओं में आपकी मदद कर सकता हूं।'
    : 'Your AI legal assistant. I can help you with Indian law, your rights, and legal procedures.'

  const quickActionsLabel = language === 'hi' ? 'त्वरित कार्य' : 'Quick Actions'

  return (
    <div className="flex h-screen overflow-hidden">
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
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          language={language}
          onLanguageChange={setLanguage}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenSOS={() => setSOSOpen(true)}
          onOpenDocuments={() => setComplaintOpen(true)}
        />

        {/* Messages Area */}
        <ScrollArea 
          ref={scrollRef}
          className="flex-1 chat-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground text-center mb-2 text-balance">
                {welcomeTitle}
              </h2>
              <p className="text-muted-foreground text-center max-w-md mb-8 text-pretty">
                {welcomeSubtitle}
              </p>
              
              <div className="w-full max-w-lg">
                <p className="text-sm font-medium text-muted-foreground text-center mb-4">
                  {quickActionsLabel}
                </p>
                <QuickActions 
                  language={language} 
                  onSelect={handleQuickAction} 
                />
              </div>
            </div>
          ) : (
            <div className="pb-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role as 'user' | 'assistant'}
                  content={getUIMessageText(message)}
                  isStreaming={status === 'streaming' && message === messages[messages.length - 1] && message.role === 'assistant'}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoading}
          language={language}
        />
      </div>

      {/* SOS Modal */}
      <SOSModal
        open={sosOpen}
        onOpenChange={setSOSOpen}
        language={language}
      />

      {/* Complaint Generator Modal */}
      <ComplaintGenerator
        open={complaintOpen}
        onOpenChange={setComplaintOpen}
        language={language}
        sessionId={activeSessionId}
      />

      {/* Floating SOS Button for Mobile */}
      <FloatingSOS onClick={() => setSOSOpen(true)} />
    </div>
  )
}
