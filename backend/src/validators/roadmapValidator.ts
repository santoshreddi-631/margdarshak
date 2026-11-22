import { z } from 'zod';

export const updateRoadmapProgressSchema = z.object({
  roadmap_step_id: z.string().uuid('Invalid roadmap step UUID'),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  notes: z.string().max(1000).optional().nullable(),
});

export const roadmapQuerySchema = z.object({
  lang: z.enum(['en', 'te', 'hi']).default('en'),
});
