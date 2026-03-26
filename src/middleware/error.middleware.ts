import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { environment } from '../config/environment';
import { AppError } from '../errors/appError';

interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  error?: string;
  stack?: string;
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error & { statusCode?: number; code?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error({ err }, 'Error');

  // Duplicate key error
  if (err.code === 11000) {
    const response: ErrorResponse = {
      success: false,
      message: 'Duplicate field value',
      code: 'DUPLICATE_KEY',
      error: 'A resource with that value already exists',
    };
    res.status(409).json(response);
    return;
  }

  // Default error
  const isProd = environment.nodeEnv === 'production';
  const statusCode = err instanceof AppError ? err.statusCode : err.statusCode || 500;
  const response: ErrorResponse = {
    success: false,
    message: isProd ? 'Internal Server Error' : err.message || 'Internal Server Error',
    code: err instanceof AppError ? err.code : 'INTERNAL_ERROR',
  };

  // Include error details and stack trace in development
  if (!isProd) {
    response.error = err.toString();
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    code: 'NOT_FOUND',
  });
};
