import { z } from 'zod';

export const createCareerSchema = z.object({
  category_id: z.string().uuid(),
  slug: z.string().min(2),
  title: z.string().min(2),
  minimum_education: z.string().default('10th Pass'),
  estimated_salary_range: z.string().default('₹15,000 - ₹30,000 / month'),
  training_duration: z.string().default('3 to 6 months'),
  growth_demand: z.enum(['high', 'steady', 'emerging']).default('high'),
  is_active: z.boolean().default(true),
  verification_status: z.string().default('OFFICIAL_VERIFIED'),
  source_url: z.string().optional().nullable(),
  official_occupational_code: z.string().optional().nullable(),
  translations: z.object({
    en: z.object({
      title: z.string(),
      description: z.string(),
      job_responsibilities: z.string().optional(),
      pathway_summary: z.string().optional(),
    }).optional(),
    hi: z.object({
      title: z.string(),
      description: z.string(),
      job_responsibilities: z.string().optional(),
      pathway_summary: z.string().optional(),
    }).optional(),
    te: z.object({
      title: z.string(),
      description: z.string(),
      job_responsibilities: z.string().optional(),
      pathway_summary: z.string().optional(),
    }).optional(),
  }).optional(),
});

export const updateCareerSchema = createCareerSchema.partial();

export const createSkillSchema = z.object({
  name: z.string().min(2),
  category: z.enum(['technical', 'soft', 'trade', 'digital']),
  description: z.string().optional().nullable(),
  name_hi: z.string().optional().nullable(),
  name_te: z.string().optional().nullable(),
});

export const updateSkillSchema = createSkillSchema.partial();

export const createResourceSchema = z.object({
  career_id: z.string().uuid().optional().nullable(),
  title: z.string().min(2),
  title_hi: z.string().optional().nullable(),
  title_te: z.string().optional().nullable(),
  resource_type: z.enum(['video', 'course', 'pdf_guide', 'training_center', 'portal']),
  provider_name: z.string().min(2),
  url: z.string().url(),
  is_free: z.boolean().default(true),
  language: z.string().default('en'),
  verification_status: z.string().default('OFFICIAL_VERIFIED'),
});

export const updateResourceSchema = createResourceSchema.partial();

export const createSchemeSchema = z.object({
  title: z.string().min(2),
  title_hi: z.string().optional().nullable(),
  title_te: z.string().optional().nullable(),
  ministry_or_agency: z.string().min(2),
  category: z.enum([
    'skilling',
    'apprenticeship',
    'self_employment',
    'scholarship',
    'job',
    'internship',
    'free_course',
    'training_program',
    'government_scheme',
  ]),
  financial_benefit: z.string(),
  eligibility_criteria: z.string(),
  portal_url: z.string().url(),
  deadline_notice: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  verification_status: z.string().default('OFFICIAL_VERIFIED'),
});

export const updateSchemeSchema = createSchemeSchema.partial();
