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
    <div className="hidden lg:flex flex-col w-72 bg-white border-r border-border h-screen flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewChart}
          variant="default"
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Charts List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {charts.length === 0 ? (
            <div className="text-center py-8">
              <ChartArea className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No chats yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {charts.map((chart) => (
                <div
                  key={chart.id}
                  className={cn(
                    'group relative p-3 rounded-lg cursor-pointer transition-colors',
                    activeChartId === chart.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-foreground'
                  )}
                  onClick={() => onSelectChart(chart)}
                >
                  <div className="flex-1 min-w-0 pr-8">
                    <p className="text-sm font-medium truncate">
                      {chart.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(chart.createdAt)}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteId(chart.id)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

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
