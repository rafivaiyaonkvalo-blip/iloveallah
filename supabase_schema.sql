-- ==============================================================================
-- Supabase Schema for SafeZone Prayer & Habit Tracker
-- Run this in your Supabase SQL Editor (supabase.com -> SQL Editor -> New Query)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.app_state (
  id TEXT PRIMARY KEY DEFAULT 'global_store',
  records JSONB DEFAULT '{}'::jsonb,
  security JSONB DEFAULT '{"isPasswordEnabled": true, "savedPassword": "iloveAllah", "savedPin": "313", "isUnlocked": true}'::jsonb,
  last_updated BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access for the anon key
DROP POLICY IF EXISTS "Allow public read app_state" ON public.app_state;
CREATE POLICY "Allow public read app_state" ON public.app_state FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert app_state" ON public.app_state;
CREATE POLICY "Allow public insert app_state" ON public.app_state FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update app_state" ON public.app_state;
CREATE POLICY "Allow public update app_state" ON public.app_state FOR UPDATE USING (true);

-- Seed initial row
INSERT INTO public.app_state (id, records, security, last_updated)
VALUES ('global_store', '{}'::jsonb, '{"isPasswordEnabled": true, "savedPassword": "iloveAllah", "savedPin": "313", "isUnlocked": true}'::jsonb, 0)
ON CONFLICT (id) DO NOTHING;
