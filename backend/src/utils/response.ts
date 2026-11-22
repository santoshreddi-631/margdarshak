import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200,
  meta?: ApiResponse['meta']
): Response => {
  const payload: ApiResponse<T> = {
    success: true,
  };

  if (message) payload.message = message;
  if (data !== undefined) payload.data = data;
  if (meta) payload.meta = meta;

  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  message = 'An unexpected error occurred',
  statusCode = 500,
  errors?: unknown
): Response => {
  const payload: ApiResponse = {
    success: false,
    message,
  };

  if (errors !== undefined) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};
