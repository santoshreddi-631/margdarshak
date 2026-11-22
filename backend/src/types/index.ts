import { Request } from 'express';

export type LanguageCode = 'en' | 'te' | 'hi';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  token?: string;
}

// ----------------------------------------------------
// Database & Entity Types
// ----------------------------------------------------

export interface Profile {
  id: string;
  full_name: string;
  phone?: string | null;
  preferred_language: LanguageCode;
  current_education_level: string;
  educational_stream?: string | null;
  course_or_specialization?: string | null;
  graduation_year?: string | null;
  state: string;
  district: string;
  willingness_to_relocate: 'within_district' | 'within_state' | 'anywhere_in_india';
  preferred_learning_method?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'trade' | 'digital';
  description?: string | null;
  created_at: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency_level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  skill?: Skill;
}

export interface Interest {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  created_at: string;
}

export interface UserInterest {
  id: string;
  user_id: string;
  interest_id: string;
  created_at: string;
  interest?: Interest;
}

export interface AssessmentOption {
  id: string;
  question_id: string;
  option_key: string;
  option_text: string;
  option_text_hi?: string | null;
  option_text_te?: string | null;
  subtext?: string | null;
  display_order: number;
}

export interface AssessmentQuestion {
  id: string;
  section: 'interests' | 'skills' | 'preferences' | 'education';
  question_key: string;
  question_text: string;
  question_text_hi?: string | null;
  question_text_te?: string | null;
  question_type: 'multi_choice' | 'single_choice' | 'rating' | 'chips';
  display_order: number;
  options?: AssessmentOption[];
}

export interface AssessmentResponse {
  id: string;
  user_id: string;
  question_id: string;
  selected_option_ids: string[];
  rating_value?: string | null;
  text_response?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CareerCategory {
  id: string;
  code: string;
  name: string;
  name_hi?: string | null;
  name_te?: string | null;
  icon_name?: string | null;
  display_order: number;
}

export interface Career {
  id: string;
  category_id: string;
  slug: string;
  title: string;
  minimum_education: string;
  estimated_salary_range: string;
  training_duration: string;
  growth_demand: 'high' | 'steady' | 'emerging';
  is_active: boolean;
  created_at: string;
  category?: CareerCategory;
  translation?: CareerTranslation;
  skills?: Array<{
    skill_id: string;
    importance: 'required' | 'recommended' | 'optional';
    name: string;
    category: string;
    description?: string | null;
  }>;
}

export interface CareerTranslation {
  id: string;
  career_id?: string;
  language_code?: LanguageCode;
  title: string;
  description: string;
  job_responsibilities?: string | null;
  pathway_summary?: string | null;
}

export interface CareerRecommendation {
  id: string;
  user_id: string;
  career_id: string;
  match_score: number;
  match_reasons: string[];
  status: 'active' | 'viewed' | 'saved' | 'dismissed';
  generated_at: string;
  career?: Career;
}

export interface LearningResource {
  id: string;
  career_id?: string | null;
  title: string;
  title_hi?: string | null;
  title_te?: string | null;
  resource_type: 'video' | 'course' | 'pdf_guide' | 'training_center' | 'portal';
  provider_name: string;
  url: string;
  is_free: boolean;
  language: string;
}

export interface RoadmapResourceLink {
  title: string;
  url: string;
  type?: string;
  provider?: string;
  is_free?: boolean;
}

export interface RoadmapStep {
  id: string;
  roadmap_id: string;
  step_number: number;
  title: string;
  title_hi?: string | null;
  title_te?: string | null;
  description: string;
  description_hi?: string | null;
  description_te?: string | null;
  learning_objectives: string[];
  estimated_duration: string;
  resource_links: RoadmapResourceLink[];
  action_cta?: string | null;
  schemes_applicable: string[];
  user_progress?: {
    status: 'not_started' | 'in_progress' | 'completed';
    completed_at?: string | null;
    notes?: string | null;
  } | null;
}

export interface Roadmap {
  id: string;
  career_id: string;
  title: string;
  total_stages: number;
  estimated_duration: string;
  steps?: RoadmapStep[];
}

export interface UserProgress {
  id: string;
  user_id: string;
  roadmap_step_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  notes?: string | null;
  completed_at?: string | null;
  updated_at: string;
}

export type OpportunityCategory =
  | 'internship'
  | 'job'
  | 'scholarship'
  | 'skilling'
  | 'free_course'
  | 'training_program'
  | 'apprenticeship'
  | 'self_employment';

export interface Opportunity {
  id: string;
  title: string;
  title_hi?: string | null;
  title_te?: string | null;
  ministry_or_agency: string;
  category: OpportunityCategory;
  financial_benefit: string;
  eligibility_criteria: string;
  portal_url: string;
  deadline_notice?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SavedCareer {
  id: string;
  user_id: string;
  career_id: string;
  created_at: string;
  career?: Career;
}

export interface SavedResource {
  id: string;
  user_id: string;
  resource_id?: string | null;
  title: string;
  provider_name?: string | null;
  url: string;
  resource_type: string;
  created_at: string;
}
