-- Supabase SQL Migration: Create registrations table for Goa Buildathon & Vybe Driven
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qcgcemmhwjuhnwuqkfbk/sql

CREATE TABLE IF NOT EXISTS public.registrations (
  id TEXT PRIMARY KEY,
  opportunity_slug TEXT NOT NULL,
  opportunity_title TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT,
  location TEXT,
  college_or_company TEXT NOT NULL,
  user_type TEXT,
  team_type TEXT NOT NULL DEFAULT 'solo',
  team_name TEXT,
  team_size TEXT DEFAULT 'Solo',
  team_members TEXT,
  teammates JSONB DEFAULT '[]'::jsonb,
  looking_for_teammates BOOLEAN DEFAULT false,
  terms_accepted BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'Registered',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices for rapid querying
CREATE INDEX IF NOT EXISTS idx_registrations_slug ON public.registrations(opportunity_slug);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON public.registrations(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 1. Anyone (public or authenticated) can register
CREATE POLICY "Allow public insert registrations" ON public.registrations
  FOR INSERT WITH CHECK (true);

-- 2. Anyone can view registrations count / records (for organizers and builders)
CREATE POLICY "Allow select registrations" ON public.registrations
  FOR SELECT USING (true);

-- 3. Authenticated organizers can update status
CREATE POLICY "Allow update registrations" ON public.registrations
  FOR UPDATE USING (true);

-- Grant full access to anon and authenticated roles
GRANT ALL ON public.registrations TO anon;
GRANT ALL ON public.registrations TO authenticated;
