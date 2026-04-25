'use client'

import { Plus, Trash2, ChartArea } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatTimestamp } from '@/lib/chart-storage'
import type { ChartRecord } from '@/lib/chart-storage'
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
import { useState } from 'react'

interface ChartHistorySidebarProps {
  charts: ChartRecord[]
  activeChartId: string | null
  onSelectChart: (chart: ChartRecord) => void
  onNewChart: () => void
  onDeleteChart: (id: string) => void
}

// Truncate title to max 30 characters with ellipsis
const truncateTitle = (title: string, maxLength: number = 30): string => {
  if (title.length <= maxLength) return title
  return title.substring(0, maxLength) + '...'
}

export function ChartHistorySidebar({
  charts,
  activeChartId,
  onSelectChart,
  onNewChart,
  onDeleteChart,
}: ChartHistorySidebarProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const confirmDelete = () => {
    if (deleteId) {
      onDeleteChart(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className="hidden lg:flex flex-col w-[280px] bg-white border-r border-gray-200 h-screen flex-shrink-0 shadow-sm">
      {/* Header - NEW CHAT BUTTON (STICKY) */}
      <div className="p-4 border-b border-gray-200">
        <Button
          onClick={onNewChart}
          variant="default"
          className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* RECENT CHATS LABEL */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Recent Chats
        </p>
      </div>

      {/* Charts List */}
      <ScrollArea className="flex-1">
        <div className="px-3 pb-4 space-y-1">
          {charts.length === 0 ? (
            <div className="text-center py-8 px-2">
              <ChartArea className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No chats yet</p>
            </div>
          ) : (
            charts.map((chart) => (
              <div
                key={chart.id}
                className={cn(
                  'group relative px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150',
                  'flex items-center gap-2 min-w-0',
                  activeChartId === chart.id
                    ? 'bg-blue-50 border border-blue-200 text-blue-900'
                    : 'hover:bg-gray-100 text-gray-700'
                )}
                onClick={() => onSelectChart(chart)}
              >
                {/* Chat Icon */}
                <div className="flex-shrink-0 w-4 h-4">
                  <ChartArea className="w-4 h-4 text-gray-400" />
                </div>

                {/* Chat Title - TRUNCATED, NO OVERFLOW */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate overflow-hidden whitespace-nowrap">
                    {truncateTitle(chart.title)}
                  </p>
                  <p className="text-xs text-gray-400 truncate overflow-hidden whitespace-nowrap">
                    {formatTimestamp(chart.createdAt)}
                  </p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteId(chart.id)
                  }}
                  className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          Organize your chats
        </p>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              This chat will be permanently deleted. You cannot undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
