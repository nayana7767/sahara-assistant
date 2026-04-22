import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { language = 'en' } = await req.json()

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      title: 'New Chat',
      language,
      user_id: null, // Anonymous sessions for now
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
