const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const STORAGE_KEY = 'openrouter-api-key'

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export function getOpenRouterApiKey(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setOpenRouterApiKey(key: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, key)
  } catch {
    // localStorage not available
  }
}

export function clearOpenRouterApiKey(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // localStorage not available
  }
}

export async function callOpenRouterAPI(
  messages: OpenRouterMessage[],
  apiKey: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenRouter API key not found. Please set your API key.')
  }

  const systemPrompt: OpenRouterMessage = {
    role: 'system',
    content: `You are Sahara, an expert AI legal assistant specializing in Indian law and legal procedures. 
You provide guidance on:
- Indian legal rights and procedures
- FIR (First Information Report) filing
- RTI (Right to Information) requests
- Consumer rights and complaints
- Tenant and landlord rights
- Labor and employment laws
- Women's rights and safety
- Cybercrime and digital rights
- Emergency support and resources

Always provide clear, practical guidance tailored to Indian law. When discussing sensitive matters, offer emergency resources and helpline numbers. 
Be empathetic, professional, and accessible to users who may not have legal background.
Disclaimer: This is guidance only, not legal advice. Users should consult qualified lawyers for specific cases.`
  }

  const allMessages = [systemPrompt, ...messages]

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'Sahara Legal Assistant'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: allMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || `OpenRouter API error: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let fullResponse = ''

    if (!reader) {
      throw new Error('No response body from OpenRouter API')
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.trim())

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              fullResponse += delta
              if (onChunk) onChunk(delta)
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }

    return fullResponse
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to call OpenRouter API')
  }
}
