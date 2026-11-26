import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/appError';
import { sendSuccess } from './utils/response';

export const createApp = (): Application => {
  const app = express();

  // 1. Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );

  // 2. CORS Policy
  app.use(
    cors({
      origin: (origin, callback) => {
        const isVercelDeployment = Boolean(
          origin && /^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.vercel\.app$/i.test(origin)
        );
        // Allow mobile apps, curl, postman (no origin), Vercel web deployments, or explicitly allowed hosts
        if (
          !origin ||
          env.ALLOWED_ORIGINS_ARRAY.includes('*') ||
          env.ALLOWED_ORIGINS_ARRAY.includes(origin) ||
          isVercelDeployment ||
          env.NODE_ENV !== 'production'
        ) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Dev-User-Id', 'Accept', 'X-Requested-With'],
    })
  );

  // 3. HTTP Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // 4. Request Body Parsers
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // 5. Root Welcome & Documentation Route
  app.get('/', (_req: Request, res: Response) => {
    return sendSuccess(res, {
      name: 'Margdarshak Backend API',
      version: '1.0.0',
      description: 'AI-Powered Multilingual Career Guidance System REST API',
      health_check: '/api/v1/health',
      documentation_base: '/api/v1',
      supported_languages: ['en', 'te', 'hi'],
    });
  });

  // 6. Mount API v1 Routers
  app.use('/api/v1', apiRouter);

  // 7. Catch 404 for undefined routes
  app.use((req: Request) => {
    throw new NotFoundError(`Endpoint ${req.method} ${req.originalUrl} does not exist`);
  });

  // 8. Centralized Error Handler
  app.use(errorHandler);

  return app;
};
