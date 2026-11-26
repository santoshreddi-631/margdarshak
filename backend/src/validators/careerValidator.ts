import { z } from 'zod';

export const careerQuerySchema = z.object({
  lang: z.enum(['en', 'te', 'hi']).default('en'),
  category_id: z.string().uuid().optional(),
  category_code: z.string().optional(),
  search: z.string().optional(),
  growth: z.enum(['high', 'steady', 'emerging']).optional(),
  education: z.string().optional(),
  page: z.string().optional().transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(200, Math.max(1, parseInt(v, 10))) : 100)),
});

export const careerDetailQuerySchema = z.object({
  lang: z.enum(['en', 'te', 'hi']).default('en'),
});
