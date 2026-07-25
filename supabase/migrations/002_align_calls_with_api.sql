-- Align the existing database with the current FastAPI calls API.
-- Safe to run after 001_initial_schema.sql or supabase_schema.sql.

ALTER TABLE public.calls
  ADD COLUMN IF NOT EXISTS audio_path TEXT,
  ADD COLUMN IF NOT EXISTS progress INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS progress_text TEXT NOT NULL DEFAULT '';

-- The API uses a demo user identifier rather than the auth users table.
ALTER TABLE public.calls DROP CONSTRAINT IF EXISTS calls_user_id_fkey;
ALTER TABLE public.calls ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.calls ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE public.calls ALTER COLUMN user_id SET DEFAULT 'demo-user';
UPDATE public.calls SET user_id = 'demo-user' WHERE user_id IS NULL;
ALTER TABLE public.calls ALTER COLUMN user_id SET NOT NULL;

UPDATE public.calls SET status = 'uploading' WHERE status = 'pending';
UPDATE public.calls SET status = 'analyzing' WHERE status = 'processing';
ALTER TABLE public.calls DROP CONSTRAINT IF EXISTS calls_status_check;
ALTER TABLE public.calls
  ADD CONSTRAINT calls_status_check
  CHECK (status IN ('uploading', 'transcribing', 'analyzing', 'completed', 'error'));

ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS seller_behavior JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS client_sentiment JSONB NOT NULL DEFAULT '[]'::jsonb;
