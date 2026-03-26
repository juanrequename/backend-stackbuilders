import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { environment } from '../config/environment';

interface ErrorResponse {
  success: false;
  message: string;
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
      error: 'A resource with that value already exists',
    };
    res.status(409).json(response);
    return;
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const response: ErrorResponse = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Include error details and stack trace in development
  if (environment.nodeEnv === 'development') {
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
  });
};
