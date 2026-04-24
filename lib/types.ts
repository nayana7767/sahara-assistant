// Re-export language types from i18n module
export type { Language } from '@/lib/i18n/translations'
export { SUPPORTED_LANGUAGES, SPEECH_LANG_MAP, WHISPER_LANG_MAP } from '@/lib/i18n/translations'

export interface ChatSession {
  id: string
  user_id: string | null
  title: string
  language: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  category: string
  region: string | null
  is_active: boolean
  created_at: string
}

export interface LegalResource {
  id: string
  title: string
  description: string | null
  category: string
  content: string | null
  source_url: string | null
  language: string
  created_at: string
}

export interface GeneratedComplaint {
  id: string
  session_id: string | null
  complaint_type: string
  content: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface PriorityEmergencyContact {
  title: string
  number: string
  category: string
  priority: number
  immediate?: boolean
}

export const PRIORITY_EMERGENCY_CONTACTS: PriorityEmergencyContact[] = [
  // 🥇 Tier 1 — Women Safety (HIGHEST PRIORITY)
  {
    title: "Women Helpline",
    number: "1091",
    category: "women",
    priority: 1
  },
  {
    title: "National Commission for Women",
    number: "7827170170",
    category: "women",
    priority: 1
  },
  
  // 🥈 Tier 2 — Immediate Life-Threatening Emergencies
  {
    title: "National Emergency",
    number: "112",
    category: "emergency",
    priority: 2,
    immediate: true
  },
  {
    title: "Police",
    number: "100",
    category: "police",
    priority: 2,
    immediate: true
  },
  {
    title: "Ambulance",
    number: "102",
    category: "medical",
    priority: 2,
    immediate: true
  },
  
  // 🥉 Tier 3 — Vulnerable Groups Support
  {
    title: "Child Helpline",
    number: "1098",
    category: "child",
    priority: 3
  },
  {
    title: "Senior Citizens Helpline",
    number: "14567",
    category: "senior",
    priority: 3
  },
  
  // 🏅 Tier 4 — Legal & Mental Support
  {
    title: "Legal Aid Services",
    number: "15100",
    category: "legal",
    priority: 4
  },
  {
    title: "Mental Health Helpline (iCALL)",
    number: "9152987821",
    category: "mental_health",
    priority: 4
  },
  
  // 🧠 Tier 5 — Digital & Cyber Safety
  {
    title: "Cyber Crime Helpline",
    number: "1930",
    category: "cyber",
    priority: 5
  }
]

// Category key to translation key mapping
export const CATEGORY_TRANSLATION_MAP: Record<string, string> = {
  police: 'category.police',
  women: 'category.women',
  child: 'category.child',
  medical: 'category.medical',
  emergency: 'category.emergency',
  cyber: 'category.cyber',
  senior: 'category.senior',
  mental_health: 'category.mentalHealth',
  legal: 'category.legal',
} as const
