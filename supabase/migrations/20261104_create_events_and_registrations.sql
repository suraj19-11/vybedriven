-- Supabase SQL Migration: Events and Registrations (Unstop style)

-- 1. Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  tag TEXT NOT NULL,
  description TEXT NOT NULL,
  overview TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  format TEXT NOT NULL,
  prize TEXT,
  perks JSONB DEFAULT '[]'::jsonb,
  image TEXT NOT NULL,
  organizer TEXT NOT NULL,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organizer_email TEXT,
  organizer_phone TEXT,
  registration_deadline TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  team_size TEXT NOT NULL,
  fee TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Registration open',
  registration_type TEXT NOT NULL DEFAULT 'direct',
  registration_url TEXT,
  group_url TEXT,
  schedule JSONB DEFAULT '[]'::jsonb,
  contacts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Registrations Table
CREATE TABLE IF NOT EXISTS public.registrations (
  id TEXT PRIMARY KEY,
  opportunity_slug TEXT NOT NULL,
  opportunity_title TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  college_or_company TEXT NOT NULL,
  team_type TEXT NOT NULL,
  team_name TEXT,
  team_size TEXT,
  team_members TEXT,
  experience_level TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  project_idea TEXT,
  status TEXT NOT NULL DEFAULT 'Registered',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Events Policies:
-- Anyone can view published events
CREATE POLICY "Public read events" ON public.events
  FOR SELECT USING (true);

-- Authenticated users can host events
CREATE POLICY "Authenticated users can create events" ON public.events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id);

-- Organizers can update their own events
CREATE POLICY "Organizers can update own events" ON public.events
  FOR UPDATE TO authenticated USING (auth.uid() = organizer_id);

-- Organizers can delete their own events
CREATE POLICY "Organizers can delete own events" ON public.events
  FOR DELETE TO authenticated USING (auth.uid() = organizer_id);

-- Registrations Policies:
-- Anyone or authenticated can register
CREATE POLICY "Users can create registrations" ON public.registrations
  FOR INSERT WITH CHECK (true);

-- Users can view their own registrations
CREATE POLICY "Users view own registrations" ON public.registrations
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = email);

-- Organizers can view registrations for their events
CREATE POLICY "Organizers view event registrations" ON public.registrations
  FOR SELECT TO authenticated
  USING (
    opportunity_slug IN (
      SELECT slug FROM public.events WHERE organizer_id = auth.uid()
    )
  );

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE ON public.registrations TO authenticated;
GRANT INSERT ON public.registrations TO anon;

