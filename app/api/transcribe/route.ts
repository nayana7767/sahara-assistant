import { NextResponse } from 'next/server'

const WHISPER_LANG_MAP: Record<string, string> = {
  en: 'en',
  hi: 'hi',
  kn: 'kn',
  te: 'te',
  ta: 'ta',
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audio = formData.get('audio') as Blob
    const language = (formData.get('language') as string) || 'en'

    if (!audio) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 })
    }

    const arrayBuffer = await audio.arrayBuffer()

    // Use OpenAI Whisper for transcription
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: (() => {
        const form = new FormData()
        form.append('file', new Blob([arrayBuffer], { type: 'audio/webm' }), 'audio.webm')
        form.append('model', 'whisper-1')
        form.append('language', WHISPER_LANG_MAP[language] || 'en')
        return form
      })(),
    })

    if (!response.ok) {
      // Fallback message in the user's language
      const fallbacks: Record<string, string> = {
        en: 'Please type your question',
        hi: 'कृपया अपना प्रश्न टाइप करें',
        kn: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ',
        te: 'దయచేసి మీ ప్రశ్నను టైప్ చేయండి',
        ta: 'உங்கள் கேள்வியை டைப் செய்யவும்',
      }
      return NextResponse.json({ 
        text: fallbacks[language] || fallbacks.en
      })
    }

    const result = await response.json()
    return NextResponse.json({ text: result.text })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    )
  }
}
