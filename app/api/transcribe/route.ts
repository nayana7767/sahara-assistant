import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audio = formData.get('audio') as Blob
    const language = formData.get('language') as string || 'en'

    if (!audio) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 })
    }

    // Convert blob to base64
    const arrayBuffer = await audio.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')

    // Use OpenAI Whisper through the AI Gateway for transcription
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: (() => {
        const form = new FormData()
        form.append('file', new Blob([arrayBuffer], { type: 'audio/webm' }), 'audio.webm')
        form.append('model', 'whisper-1')
        form.append('language', language === 'hi' ? 'hi' : 'en')
        return form
      })(),
    })

    if (!response.ok) {
      // Fallback: Return a message asking user to type
      return NextResponse.json({ 
        text: language === 'hi' 
          ? 'कृपया अपना प्रश्न टाइप करें' 
          : 'Please type your question'
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
