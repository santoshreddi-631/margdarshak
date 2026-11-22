import { z } from 'zod';

export const assessmentResponseItemSchema = z.object({
  question_id: z.string().uuid('Invalid question ID format'),
  selected_option_ids: z.array(z.string()).default([]),
  rating_value: z.string().optional().nullable(),
  text_response: z.string().optional().nullable(),
});

export const submitAssessmentSchema = z.object({
  responses: z.array(assessmentResponseItemSchema).min(1, 'At least one response is required'),
  is_draft: z.boolean().optional().default(false),
});

export const saveDraftSchema = z.object({
  responses: z.array(assessmentResponseItemSchema).default([]),
  current_step: z.number().int().min(1).max(5).optional().default(1),
});

export const getQuestionsQuerySchema = z.object({
  section: z.enum(['interests', 'skills', 'preferences', 'education']).optional(),
  lang: z.enum(['en', 'te', 'hi']).default('en'),
});
