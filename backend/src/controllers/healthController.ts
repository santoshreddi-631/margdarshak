import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import { isSupabaseConfigured } from '../config/supabase';
import { env } from '../config/env';

export const getHealth = (_req: Request, res: Response): Response => {
  return sendSuccess(
    res,
    {
      status: 'healthy',
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      services: {
        database_configured: isSupabaseConfigured(),
        supabase_url: isSupabaseConfigured() ? env.SUPABASE_URL : 'NOT_CONFIGURED',
        recommendation_service_url: env.RECOMMENDATION_SERVICE_URL,
      },
    },
    'Margdarshak Backend API is operational'
  );
};
