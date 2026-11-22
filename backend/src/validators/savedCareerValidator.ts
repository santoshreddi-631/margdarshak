import { z } from 'zod';

export const saveCareerSchema = z.object({
  career_id: z.string().uuid('Invalid career UUID'),
});

export const getSavedCareersQuerySchema = z.object({
  lang: z.enum(['en', 'te', 'hi']).default('en'),
});
