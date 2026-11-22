import { z } from 'zod';

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Full name must have at least 2 characters').max(100),
  phone: z.string().optional().nullable(),
  preferred_language: z.enum(['en', 'te', 'hi']).default('en'),
  current_education_level: z.string().min(1, 'Education level is required'),
  educational_stream: z.string().optional().nullable(),
  course_or_specialization: z.string().optional().nullable(),
  graduation_year: z.string().optional().nullable(),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  willingness_to_relocate: z
    .enum(['within_district', 'within_state', 'anywhere_in_india'])
    .default('within_district'),
  preferred_learning_method: z.string().optional().nullable(),
});

export const addUserSkillSchema = z.object({
  skill_id: z.string().uuid('Invalid skill UUID'),
  proficiency_level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
});

export const addUserInterestSchema = z.object({
  interest_id: z.string().uuid('Invalid interest UUID'),
});

export const batchUserSkillsSchema = z.object({
  skills: z.array(
    z.object({
      skill_id: z.string().uuid('Invalid skill UUID'),
      proficiency_level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    })
  ),
});

export const batchUserInterestsSchema = z.object({
  interest_ids: z.array(z.string().uuid('Invalid interest UUID')),
});
