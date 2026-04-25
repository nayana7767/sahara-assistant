'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ChartRecord } from '@/lib/chart-storage'
import {
  saveChart as storeSaveChart,
  getCharts,
  deleteChart as storeDeleteChart,
  clearAllCharts as storeClearAllCharts,
} from '@/lib/chart-storage'
import type { Language } from '@/lib/types'

export function useChartHistory() {
  const [charts, setCharts] = useState<ChartRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loaded = getCharts()
    setCharts(loaded)
    setIsLoading(false)
  }, [])

  const saveChart = useCallback((content: string, language: Language) => {
    const chart = storeSaveChart(content, language)
    setCharts(prev => {
      const filtered = prev.filter(c => c.content !== content)
      return [chart, ...filtered]
    })
    return chart
  }, [])

  const deleteChart = useCallback((id: string) => {
    storeDeleteChart(id)
    setCharts(prev => prev.filter(c => c.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    storeClearAllCharts()
    setCharts([])
  }, [])

  const loadChart = useCallback((id: string): ChartRecord | null => {
    return charts.find(c => c.id === id) || null
  }, [charts])

  return {
    charts,
    isLoading,
    saveChart,
    deleteChart,
    clearAll,
    loadChart,
  }
}
