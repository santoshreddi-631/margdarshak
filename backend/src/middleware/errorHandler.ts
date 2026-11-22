import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/appError';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Handle Zod Schema Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 'Request validation failed', 400, formattedErrors);
    return;
  }

  // Handle Custom Known Operational AppErrors
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.details);
    return;
  }

  // Handle Supabase/Postgres unique constraint violation
  const pgError = err as { code?: string; details?: string; hint?: string; message?: string };
  if (pgError.code === '23505') {
    sendError(res, 'A duplicate record already exists with these details.', 409, {
      code: pgError.code,
      details: pgError.details,
    });
    return;
  }

  // Handle Supabase/Postgres foreign key violation
  if (pgError.code === '23503') {
    sendError(res, 'Referenced record was not found.', 400, {
      code: pgError.code,
      details: pgError.details,
    });
    return;
  }

  // Unhandled / Internal Server Error
  logger.error('Unhandled internal server error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  sendError(
    res,
    process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred'
      : err.message || 'Internal Server Error',
    500
  );
};
