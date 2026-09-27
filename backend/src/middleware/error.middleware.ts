import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../common/errors/app-error';

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const parseError = err as Error & { type?: string; status?: number };
  if (parseError.type === 'entity.too.large' || parseError.status === 413) {
    res.status(413).json({ success: false, message: 'Request body vượt quá giới hạn cho phép' });
    return;
  }
  if (err instanceof SyntaxError && parseError.status === 400) {
    res.status(400).json({ success: false, message: 'JSON không hợp lệ' });
    return;
  }
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
    if (err.statusCode >= 500) console.error('Operational server error:', err);
    res.status(err.statusCode).json({
      success: false,
      message: err.statusCode >= 500 ? 'Internal server error' : err.message,
      ...(err.statusCode < 500 && err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Handle generic errors
  const statusCode = 500;
  console.error('Unhandled server error:', err);

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'Internal server error' : err.message || 'An unexpected error occurred',
  });
};
