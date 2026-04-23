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

export type Language = 'en' | 'hi'

export interface LanguageConfig {
  code: Language
  name: string
  nativeName: string
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
]

export const QUICK_ACTIONS = [
  {
    id: 'fir',
    label: { en: 'Draft FIR', hi: 'FIR का मसौदा' },
    icon: 'FileText',
    prompt: { 
      en: 'Help me draft an FIR (First Information Report)', 
      hi: 'मुझे FIR (प्रथम सूचना रिपोर्ट) का मसौदा तैयार करने में मदद करें' 
    },
  },
  {
    id: 'rti',
    label: { en: 'File RTI', hi: 'RTI दाखिल करें' },
    icon: 'Search',
    prompt: { 
      en: 'Help me file an RTI (Right to Information) application', 
      hi: 'RTI (सूचना का अधिकार) आवेदन दाखिल करने में मेरी मदद करें' 
    },
  },
  {
    id: 'consumer',
    label: { en: 'Consumer Complaint', hi: 'उपभोक्ता शिकायत' },
    icon: 'ShieldAlert',
    prompt: { 
      en: 'Help me file a consumer complaint', 
      hi: 'उपभोक्ता शिकायत दर्ज करने में मेरी मदद करें' 
    },
  },
  {
    id: 'rights',
    label: { en: 'Know My Rights', hi: 'मेरे अधिकार जानें' },
    icon: 'Scale',
    prompt: { 
      en: 'Explain my fundamental rights as an Indian citizen', 
      hi: 'एक भारतीय नागरिक के रूप में मेरे मौलिक अधिकारों की व्याख्या करें' 
    },
  },
]

export const EMERGENCY_CATEGORIES = {
  police: { label: { en: 'Police', hi: 'पुलिस' }, color: 'blue' },
  women: { label: { en: 'Women Helpline', hi: 'महिला हेल्पलाइन' }, color: 'pink' },
  child: { label: { en: 'Child Helpline', hi: 'बाल हेल्पलाइन' }, color: 'green' },
  medical: { label: { en: 'Medical', hi: 'चिकित्सा' }, color: 'red' },
  emergency: { label: { en: 'Emergency', hi: 'आपातकाल' }, color: 'orange' },
  cyber: { label: { en: 'Cyber Crime', hi: 'साइबर अपराध' }, color: 'purple' },
  senior: { label: { en: 'Senior Citizens', hi: 'वरिष्ठ नागरिक' }, color: 'teal' },
  mental_health: { label: { en: 'Mental Health', hi: 'मानसिक स्वास्थ्य' }, color: 'indigo' },
  legal: { label: { en: 'Legal Aid', hi: 'कानूनी सहायता' }, color: 'amber' },
} as const

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
