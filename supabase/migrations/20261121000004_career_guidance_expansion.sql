-- ====================================================================
-- SUPABASE POSTGRESQL MIGRATION: Schema Expansion for Job Portals,
-- Localized Skills/Interests, and Data Verification Audit Fields
-- Project: AI-Powered Multilingual Career Guidance System (Margdarshak)
-- ====================================================================

-- 1. Expand opportunities category CHECK constraint
ALTER TABLE public.opportunities 
DROP CONSTRAINT IF EXISTS opportunities_category_check;

ALTER TABLE public.opportunities 
ADD CONSTRAINT opportunities_category_check 
CHECK (category IN (
    'skilling', 'apprenticeship', 'self_employment', 'scholarship',
    'job', 'internship', 'free_course', 'training_program', 'government_scheme'
));

-- 2. Add localized translations to skills master taxonomy
ALTER TABLE public.skills 
ADD COLUMN IF NOT EXISTS name_hi TEXT,
ADD COLUMN IF NOT EXISTS name_te TEXT;

-- 3. Add localized translations to interests master taxonomy
ALTER TABLE public.interests 
ADD COLUMN IF NOT EXISTS name_hi TEXT,
ADD COLUMN IF NOT EXISTS name_te TEXT;

-- 4. Add verification & research metadata to careers
ALTER TABLE public.careers 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'OFFICIAL_VERIFIED',
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS official_occupational_code TEXT,
ADD COLUMN IF NOT EXISTS last_verified_date DATE DEFAULT CURRENT_DATE;

-- 5. Add verification metadata to opportunities
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'OFFICIAL_VERIFIED',
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS last_verified_date DATE DEFAULT CURRENT_DATE;

-- 6. Add verification metadata to learning_resources
ALTER TABLE public.learning_resources 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'OFFICIAL_VERIFIED',
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS last_verified_date DATE DEFAULT CURRENT_DATE;

-- 7. Create Job Portals Directory table
CREATE TABLE IF NOT EXISTS public.job_portals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    url TEXT NOT NULL,
    portal_type TEXT NOT NULL CHECK (portal_type IN ('government', 'private', 'hybrid', 'apprenticeship', 'skilling')),
    description TEXT NOT NULL,
    description_hi TEXT,
    description_te TEXT,
    target_users TEXT NOT NULL,
    opportunity_categories JSONB DEFAULT '[]'::jsonb,
    geographic_coverage TEXT NOT NULL DEFAULT 'Pan-India',
    application_method TEXT NOT NULL DEFAULT 'Online Portal',
    language_availability JSONB DEFAULT '["en", "hi"]'::jsonb,
    verification_status TEXT NOT NULL DEFAULT 'OFFICIAL_VERIFIED',
    last_checked_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for portal lookup
CREATE INDEX IF NOT EXISTS idx_job_portals_type ON public.job_portals(portal_type);

-- Enable RLS and grants
ALTER TABLE public.job_portals ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'job_portals' AND policyname = 'Public read job_portals'
    ) THEN
        CREATE POLICY "Public read job_portals" ON public.job_portals FOR SELECT USING (true);
    END IF;
END $$;

GRANT ALL ON TABLE public.job_portals TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
