'use client'

import { MessageSquare, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import type { ChatSession, Language } from '@/lib/types'
import type { TranslationKey } from '@/lib/i18n/translations'

interface ChatSidebarProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onNewChat: () => void
  onDeleteSession: (id: string) => void
  language: Language
  isOpen: boolean
  onClose: () => void
  t: (key: TranslationKey) => string
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
  t,
}: ChatSidebarProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const confirmDelete = () => {
    if (deleteId) {
      onDeleteSession(deleteId)
      setDeleteId(null)
    }
  }

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
            <h2 className="font-semibold text-sidebar-foreground">{t('sidebar.history')}</h2>
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
              {t('sidebar.newChat')}
            </Button>
          </div>

          {/* Sessions List */}
          <ScrollArea className="flex-1 px-3">
            <div className="space-y-1 pb-4">
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('sidebar.noChats')}
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
                        setDeleteId(session.id)
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
              {t('sidebar.footer')}
            </p>
          </div>
        </div>
      </aside>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('sidebar.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('sidebar.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('sidebar.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('sidebar.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
