import { Language } from './types'

export interface ChartRecord {
  id: string
  title: string
  content: string
  language: Language
  createdAt: number
}

const STORAGE_KEY = 'sahara_chart_history'
const MAX_CHARTS = 20

export function generateChartTitle(content: string): string {
  return content
    .split('\n')[0]
    .replace(/[#*`\[\]()]/g, '')
    .trim()
    .split(' ')
    .slice(0, 8)
    .join(' ')
    .substring(0, 60) || 'Untitled Chart'
}

export function saveChart(content: string, language: Language): ChartRecord {
  const chart: ChartRecord = {
    id: crypto.getRandomUUID?.() || Date.now().toString(),
    title: generateChartTitle(content),
    content,
    language,
    createdAt: Date.now(),
  }

  const charts = getCharts()
  const filtered = charts.filter(c => c.content !== content)
  const updated = [chart, ...filtered].slice(0, MAX_CHARTS)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('[Chart Storage] Save failed:', error)
  }

  return chart
}

export function getCharts(): ChartRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('[Chart Storage] Load failed:', error)
    return []
  }
}

export function deleteChart(id: string): void {
  const charts = getCharts()
  const updated = charts.filter(c => c.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('[Chart Storage] Delete failed:', error)
  }
}

export function clearAllCharts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('[Chart Storage] Clear failed:', error)
  }
}

export function formatTimestamp(ms: number): string {
  const date = new Date(ms)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}
