-- SalesCoach AI Database Schema
-- Supabase project: https://izjjmaxrnouisbnyxxeg.supabase.co
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. CALLS TABLE - stores call records
-- ============================================================
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'demo-user',
  title TEXT,
  client_name TEXT,
  audio_url TEXT,
  audio_path TEXT,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'uploading'
    CHECK (status IN ('uploading', 'transcribing', 'analyzing', 'completed', 'error')),
  progress INTEGER DEFAULT 0,
  progress_text TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. ANALYSES TABLE - stores analysis results
-- ============================================================
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  transcription TEXT,
  summary TEXT,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  closing_probability INTEGER CHECK (closing_probability >= 0 AND closing_probability <= 100),
  strengths JSONB DEFAULT '[]'::jsonb,
  errors JSONB DEFAULT '[]'::jsonb,
  objections JSONB DEFAULT '[]'::jsonb,
  techniques_used JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  corrections JSONB DEFAULT '[]'::jsonb,
  next_steps JSONB DEFAULT '[]'::jsonb,
  timeline JSONB DEFAULT '[]'::jsonb,
  seller_behavior JSONB DEFAULT '[]'::jsonb,
  client_sentiment JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Keep an existing installation compatible with the current API too.
ALTER TABLE calls
  ADD COLUMN IF NOT EXISTS audio_path TEXT,
  ADD COLUMN IF NOT EXISTS progress INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS progress_text TEXT NOT NULL DEFAULT '';

ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS corrections JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS seller_behavior JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS client_sentiment JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_call_id ON analyses(call_id);

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Permissive policies for demo-user (no real auth yet)
-- These allow full CRUD for the demo user
CREATE POLICY "Demo user can do everything on calls"
  ON calls
  FOR ALL
  USING (user_id = 'demo-user')
  WITH CHECK (user_id = 'demo-user');

CREATE POLICY "Demo user can do everything on analyses"
  ON analyses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = analyses.call_id
        AND calls.user_id = 'demo-user'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = analyses.call_id
        AND calls.user_id = 'demo-user'
    )
  );

-- ============================================================
-- 5. STORAGE BUCKET for audio files
-- ============================================================
-- Run this via Supabase Dashboard > Storage > New Bucket
-- Bucket name: call-audios
-- Public: Yes
-- File size limit: 100MB
-- Allowed MIME types: audio/mpeg, audio/wav, audio/ogg, audio/webm, audio/mp4

-- Alternatively, insert via SQL (Supabase specific):
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'call-audios',
  'call-audios',
  true,
  104857600, -- 100MB
  ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policy: allow public read access
CREATE POLICY "Public read access for call audios"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'call-audios');

-- Storage policy: allow demo-user to upload
CREATE POLICY "Demo user can upload call audios"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'call-audios');

-- Storage policy: allow demo-user to delete their files
CREATE POLICY "Demo user can delete call audios"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'call-audios');
