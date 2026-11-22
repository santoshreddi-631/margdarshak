-- ====================================================================
-- MIGRATION: Roadmap Step Enhancements & Resource Bookmarks
-- Project: AI-Powered Multilingual Career Guidance System (Margdarshak)
-- ====================================================================

-- 1. Add learning_objectives, estimated_duration, and resource_links to roadmap_steps
ALTER TABLE public.roadmap_steps 
ADD COLUMN IF NOT EXISTS learning_objectives JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS estimated_duration TEXT DEFAULT '4-6 Weeks',
ADD COLUMN IF NOT EXISTS resource_links JSONB DEFAULT '[]'::jsonb;

-- 2. Create saved_resources table for student bookmarking
CREATE TABLE IF NOT EXISTS public.saved_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resource_id TEXT,
    title TEXT NOT NULL,
    provider_name TEXT,
    url TEXT NOT NULL,
    resource_type TEXT NOT NULL DEFAULT 'portal',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, url)
);

CREATE INDEX IF NOT EXISTS idx_saved_resources_user ON public.saved_resources(user_id);

-- Enable RLS
ALTER TABLE public.saved_resources ENABLE ROW LEVEL SECURITY;

-- Ownership RLS policies
CREATE POLICY "Users can view own saved resources" 
ON public.saved_resources FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved resources" 
ON public.saved_resources FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved resources" 
ON public.saved_resources FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions on newly created table to PostgREST roles
GRANT ALL ON TABLE public.saved_resources TO anon, authenticated, service_role;

