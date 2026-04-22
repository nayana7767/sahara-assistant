'use client'

import { MessageSquare, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { ChatSession, Language } from '@/lib/types'

interface ChatSidebarProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onNewChat: () => void
  onDeleteSession: (id: string) => void
  language: Language
  isOpen: boolean
  onClose: () => void
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  language,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const newChatLabel = language === 'hi' ? 'नई चैट' : 'New Chat'
  const historyLabel = language === 'hi' ? 'चैट इतिहास' : 'Chat History'

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out',
          'md:transform-none',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <h2 className="font-semibold text-sidebar-foreground">{historyLabel}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* New Chat Button */}
          <div className="p-3">
            <Button
              onClick={onNewChat}
              className="w-full gap-2"
              variant="default"
            >
              <Plus className="h-4 w-4" />
              {newChatLabel}
            </Button>
          </div>

          {/* Sessions List */}
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-1 pb-4">
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {language === 'hi' ? 'कोई चैट नहीं' : 'No chats yet'}
                </p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors',
                      activeSessionId === session.id
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                    )}
                    onClick={() => {
                      onSelectSession(session.id)
                      onClose()
                    }}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate text-sm">
                      {session.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSession(session.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <p className="text-xs text-muted-foreground text-center">
              {language === 'hi' 
                ? 'भारतीय कानून सहायता' 
                : 'Indian Law Assistance'}
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
