-- SalesCoach AI Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'seller' CHECK (role IN ('seller', 'supervisor', 'admin')),
  avatar_url TEXT,
  team_id UUID REFERENCES teams(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calls table
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  client_name TEXT,
  audio_url TEXT,
  duration_seconds INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analyses table
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE UNIQUE NOT NULL,
  transcription TEXT,
  summary TEXT,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  closing_probability INTEGER CHECK (closing_probability >= 0 AND closing_probability <= 100),
  strengths JSONB DEFAULT '[]',
  errors JSONB DEFAULT '[]',
  objections JSONB DEFAULT '[]',
  techniques_used JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  next_steps JSONB DEFAULT '[]',
  timeline JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seller skills table
CREATE TABLE seller_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  explanation TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);

-- Weekly goals table
CREATE TABLE weekly_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  calls_target INTEGER DEFAULT 25,
  calls_completed INTEGER DEFAULT 0,
  quality_target INTEGER DEFAULT 80,
  quality_average DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number, year)
);

-- Indexes
CREATE INDEX idx_calls_user_id ON calls(user_id);
CREATE INDEX idx_calls_created_at ON calls(created_at DESC);
CREATE INDEX idx_analyses_call_id ON analyses(call_id);
CREATE INDEX idx_seller_skills_user_id ON seller_skills(user_id);
CREATE INDEX idx_weekly_goals_user_id ON weekly_goals(user_id);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_goals ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Calls policies
CREATE POLICY "Users can view own calls" ON calls
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calls" ON calls
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calls" ON calls
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calls" ON calls
  FOR DELETE USING (auth.uid() = user_id);

-- Analyses policies (users can view analyses of their calls)
CREATE POLICY "Users can view own analyses" ON analyses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM calls WHERE calls.id = analyses.call_id AND calls.user_id = auth.uid())
  );

CREATE POLICY "Users can insert analyses" ON analyses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM calls WHERE calls.id = analyses.call_id AND calls.user_id = auth.uid())
  );

-- Skills policies
CREATE POLICY "Users can view own skills" ON seller_skills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own skills" ON seller_skills
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills" ON seller_skills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Weekly goals policies
CREATE POLICY "Users can view own goals" ON weekly_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON weekly_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON weekly_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
