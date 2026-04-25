'use client'

import { Menu, X, Trash2, ChartArea } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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

interface ChartHistoryDrawerProps {
  charts: ChartRecord[]
  activeChartId: string | null
  onSelectChart: (chart: ChartRecord) => void
  onDeleteChart: (id: string) => void
}

export function ChartHistoryDrawer({
  charts,
  activeChartId,
  onSelectChart,
  onDeleteChart,
}: ChartHistoryDrawerProps) {
  const [open, setOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleSelectChart = (chart: ChartRecord) => {
    onSelectChart(chart)
    setOpen(false)
  }

  const confirmDelete = () => {
    if (deleteId) {
      onDeleteChart(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          className="h-10 w-10"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4 border-b border-slate-200">
            <SheetTitle className="flex items-center gap-2">
              <ChartArea className="w-5 h-5" />
              Recent Charts
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-4">
              {charts.length === 0 ? (
                <div className="text-center py-12">
                  <ChartArea className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No charts yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {charts.map((chart) => (
                    <div
                      key={chart.id}
                      className={cn(
                        'group relative p-3 rounded-lg cursor-pointer transition-colors',
                        activeChartId === chart.id
                          ? 'bg-blue-100 text-blue-900'
                          : 'hover:bg-slate-100 text-slate-900'
                      )}
                      onClick={() => handleSelectChart(chart)}
                    >
                      <div className="flex-1 min-w-0 pr-8">
                        <p className="text-sm font-medium truncate">
                          {chart.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatTimestamp(chart.createdAt)}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteId(chart.id)
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
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
                <AlertDialogTitle>Delete Chart</AlertDialogTitle>
                <AlertDialogDescription>
                  This chart will be permanently deleted. You cannot undo this action.
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
        </SheetContent>
      </Sheet>
    </>
  )
}
