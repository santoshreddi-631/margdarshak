-- ====================================================================
-- SUPABASE POSTGRESQL MIGRATION: Schema Creation with Strict RLS
-- Project: AI-Powered Multilingual Career Guidance System (Margdarshak)
-- ====================================================================

-- Enable pgcrypto / uuid extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 1. PROFILES (Extends Supabase auth.users)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'te', 'hi')),
    current_education_level TEXT NOT NULL,
    educational_stream TEXT,
    course_or_specialization TEXT,
    graduation_year TEXT,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    willingness_to_relocate TEXT NOT NULL DEFAULT 'within_district' CHECK (willingness_to_relocate IN ('within_district', 'within_state', 'anywhere_in_india')),
    preferred_learning_method TEXT DEFAULT 'practical_hands_on',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_district_state ON public.profiles(district, state);

-- --------------------------------------------------------------------
-- 2. SKILLS (Master Taxonomy)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('technical', 'soft', 'trade', 'digital')),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);

-- --------------------------------------------------------------------
-- 3. USER_SKILLS (Student declared & self-rated skills)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    proficiency_level TEXT NOT NULL DEFAULT 'beginner' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_user_skills_user ON public.user_skills(user_id);

-- --------------------------------------------------------------------
-- 4. INTERESTS (Master Taxonomy)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- 5. USER_INTERESTS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interest_id UUID NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, interest_id)
);

CREATE INDEX IF NOT EXISTS idx_user_interests_user ON public.user_interests(user_id);

-- --------------------------------------------------------------------
-- 6. ASSESSMENT QUESTIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section TEXT NOT NULL CHECK (section IN ('interests', 'skills', 'preferences', 'education')),
    question_key TEXT NOT NULL UNIQUE,
    question_text TEXT NOT NULL,
    question_text_hi TEXT,
    question_text_te TEXT,
    question_type TEXT NOT NULL CHECK (question_type IN ('multi_choice', 'single_choice', 'rating', 'chips')),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessment_questions_section ON public.assessment_questions(section, display_order);

-- --------------------------------------------------------------------
-- 7. ASSESSMENT OPTIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessment_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
    option_key TEXT NOT NULL,
    option_text TEXT NOT NULL,
    option_text_hi TEXT,
    option_text_te TEXT,
    subtext TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(question_id, option_key)
);

CREATE INDEX IF NOT EXISTS idx_assessment_options_question ON public.assessment_options(question_id, display_order);

-- --------------------------------------------------------------------
-- 8. ASSESSMENT RESPONSES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
    selected_option_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    rating_value TEXT,
    text_response TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessment_responses_user ON public.assessment_responses(user_id);

-- --------------------------------------------------------------------
-- 9. CAREER CATEGORIES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_hi TEXT,
    name_te TEXT,
    icon_name TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- 10. CAREERS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.careers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.career_categories(id) ON DELETE RESTRICT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    minimum_education TEXT NOT NULL,
    estimated_salary_range TEXT NOT NULL,
    training_duration TEXT NOT NULL,
    growth_demand TEXT NOT NULL DEFAULT 'high' CHECK (growth_demand IN ('high', 'steady', 'emerging')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_careers_category ON public.careers(category_id);
CREATE INDEX IF NOT EXISTS idx_careers_active ON public.careers(is_active);

-- --------------------------------------------------------------------
-- 11. CAREER_SKILLS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_id UUID NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    importance TEXT NOT NULL DEFAULT 'required' CHECK (importance IN ('required', 'recommended', 'optional')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(career_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_career_skills_career ON public.career_skills(career_id);

-- --------------------------------------------------------------------
-- 12. CAREER TRANSLATIONS (English, Telugu, Hindi)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_id UUID NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
    language_code TEXT NOT NULL CHECK (language_code IN ('en', 'te', 'hi')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    job_responsibilities TEXT,
    pathway_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(career_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_career_translations_lookup ON public.career_translations(career_id, language_code);

-- --------------------------------------------------------------------
-- 13. CAREER RECOMMENDATIONS (Computed by Reco Service)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    career_id UUID NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
    match_score NUMERIC(5,2) NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    match_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'viewed', 'saved', 'dismissed')),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_career_recommendations_user ON public.career_recommendations(user_id, match_score DESC);

-- --------------------------------------------------------------------
-- 14. LEARNING RESOURCES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_id UUID REFERENCES public.careers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_hi TEXT,
    title_te TEXT,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'course', 'pdf_guide', 'training_center', 'portal')),
    provider_name TEXT NOT NULL,
    url TEXT NOT NULL,
    is_free BOOLEAN NOT NULL DEFAULT true,
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_resources_career ON public.learning_resources(career_id);

-- --------------------------------------------------------------------
-- 15. ROADMAPS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_id UUID NOT NULL UNIQUE REFERENCES public.careers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    total_stages INTEGER NOT NULL DEFAULT 4,
    estimated_duration TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- 16. ROADMAP STEPS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roadmap_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    title_hi TEXT,
    title_te TEXT,
    description TEXT NOT NULL,
    description_hi TEXT,
    description_te TEXT,
    action_cta TEXT,
    schemes_applicable JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(roadmap_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_roadmap_steps_order ON public.roadmap_steps(roadmap_id, step_number);

-- --------------------------------------------------------------------
-- 17. USER PROGRESS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    roadmap_step_id UUID NOT NULL REFERENCES public.roadmap_steps(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    notes TEXT,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, roadmap_step_id)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);

-- --------------------------------------------------------------------
-- 18. OPPORTUNITIES (Schemes, Apprenticeships, Government Grants)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_hi TEXT,
    title_te TEXT,
    ministry_or_agency TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('skilling', 'apprenticeship', 'self_employment', 'scholarship')),
    financial_benefit TEXT NOT NULL,
    eligibility_criteria TEXT NOT NULL,
    portal_url TEXT NOT NULL,
    deadline_notice TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_category ON public.opportunities(category);

-- --------------------------------------------------------------------
-- 19. SAVED CAREERS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_careers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    career_id UUID NOT NULL REFERENCES public.careers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, career_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_careers_user ON public.saved_careers(user_id);


-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- 1. Enable RLS on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_careers ENABLE ROW LEVEL SECURITY;

-- 2. PUBLIC / READ-ONLY CATALOG POLICIES
-- Accessible to authenticated and anonymous users
CREATE POLICY "Public read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Public read interests" ON public.interests FOR SELECT USING (true);
CREATE POLICY "Public read assessment_questions" ON public.assessment_questions FOR SELECT USING (true);
CREATE POLICY "Public read assessment_options" ON public.assessment_options FOR SELECT USING (true);
CREATE POLICY "Public read career_categories" ON public.career_categories FOR SELECT USING (true);
CREATE POLICY "Public read active careers" ON public.careers FOR SELECT USING (is_active = true);
CREATE POLICY "Public read career_skills" ON public.career_skills FOR SELECT USING (true);
CREATE POLICY "Public read career_translations" ON public.career_translations FOR SELECT USING (true);
CREATE POLICY "Public read learning_resources" ON public.learning_resources FOR SELECT USING (true);
CREATE POLICY "Public read roadmaps" ON public.roadmaps FOR SELECT USING (true);
CREATE POLICY "Public read roadmap_steps" ON public.roadmap_steps FOR SELECT USING (true);
CREATE POLICY "Public read opportunities" ON public.opportunities FOR SELECT USING (is_active = true);

-- 3. USER OWNERSHIP POLICIES
-- Profiles: Users can only see and manage their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- User Skills: Owner only
CREATE POLICY "Users can view own skills" ON public.user_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own skills" ON public.user_skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skills" ON public.user_skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own skills" ON public.user_skills FOR DELETE USING (auth.uid() = user_id);

-- User Interests: Owner only
CREATE POLICY "Users can view own interests" ON public.user_interests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interests" ON public.user_interests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own interests" ON public.user_interests FOR DELETE USING (auth.uid() = user_id);

-- Assessment Responses: Owner only
CREATE POLICY "Users can view own responses" ON public.assessment_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own responses" ON public.assessment_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own responses" ON public.assessment_responses FOR UPDATE USING (auth.uid() = user_id);

-- Career Recommendations: Owner only
CREATE POLICY "Users can view own recommendations" ON public.career_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations" ON public.career_recommendations FOR UPDATE USING (auth.uid() = user_id);

-- User Progress: Owner only
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress" ON public.user_progress FOR DELETE USING (auth.uid() = user_id);

-- Saved Careers: Owner only
CREATE POLICY "Users can view own saved careers" ON public.saved_careers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved careers" ON public.saved_careers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved careers" ON public.saved_careers FOR DELETE USING (auth.uid() = user_id);
