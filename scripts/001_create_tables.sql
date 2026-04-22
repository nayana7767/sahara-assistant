-- NyayBot Database Schema
-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL,
  region TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legal resources table
CREATE TABLE IF NOT EXISTS legal_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  content TEXT,
  source_url TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated complaints table
CREATE TABLE IF NOT EXISTS generated_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
  complaint_type TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_complaints ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions (users can only access their own sessions, anonymous users can use null user_id)
CREATE POLICY "Users can view their own sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for chat_messages (based on session ownership)
CREATE POLICY "Users can view messages in their sessions" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND (auth.uid() = chat_sessions.user_id OR chat_sessions.user_id IS NULL)
    )
  );

CREATE POLICY "Users can insert messages in their sessions" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND (auth.uid() = chat_sessions.user_id OR chat_sessions.user_id IS NULL)
    )
  );

-- Public read access for emergency contacts and legal resources
CREATE POLICY "Anyone can view emergency contacts" ON emergency_contacts
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view legal resources" ON legal_resources
  FOR SELECT USING (true);

-- RLS for generated complaints
CREATE POLICY "Users can view their complaints" ON generated_complaints
  FOR SELECT USING (
    session_id IS NULL OR
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = generated_complaints.session_id 
      AND (auth.uid() = chat_sessions.user_id OR chat_sessions.user_id IS NULL)
    )
  );

CREATE POLICY "Users can create complaints" ON generated_complaints
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_category ON emergency_contacts(category);
CREATE INDEX IF NOT EXISTS idx_legal_resources_category ON legal_resources(category);
