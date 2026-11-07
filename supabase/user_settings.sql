-- ==============================================================================
-- BANDLABS CLONE: SUPABASE USER SETTINGS SCHEMA
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_settings (
  id TEXT PRIMARY KEY, -- Linked to Firebase Auth UID
  email TEXT,
  display_name TEXT DEFAULT 'Producer',
  avatar_url TEXT,
  default_bpm NUMERIC DEFAULT 120.0,
  default_key TEXT DEFAULT 'C Major',
  default_vocal_preset TEXT DEFAULT 'Studio Rap',
  vocal_preferences JSONB DEFAULT '{
    "autoPitchEnabled": true,
    "correctionSpeed": 80,
    "scale": "Major",
    "key": "C",
    "reverbWet": 0.25,
    "delayWet": 0.15,
    "delayTime": "8n",
    "compressionRatio": 4.0,
    "eqHighBoost": 2.0,
    "eqLowCut": 100
  }'::jsonb,
  beat_preferences JSONB DEFAULT '{
    "defaultKit": "Trap-808",
    "swing": 0.0,
    "masterBeatVolume": 0.85
  }'::jsonb,
  export_preferences JSONB DEFAULT '{
    "format": "mp3",
    "bitrate": 320,
    "normalize": true,
    "sampleRate": 44100
  }'::jsonb,
  saved_presets JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users / API clients to query and mutate settings
CREATE POLICY "Allow read own settings"
  ON public.user_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert own settings"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update own settings"
  ON public.user_settings
  FOR UPDATE
  USING (true);
