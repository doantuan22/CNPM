import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../common/errors/app-error';
import { env } from '../config/env';

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Handle known operational AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Handle generic errors
  const statusCode = (err as { status?: number; statusCode?: number }).statusCode || 500;
  if (statusCode >= 500) {
    console.error('Unhandled server error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 && env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'An unexpected error occurred',
  });
};
