import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const requestContext = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = randomUUID();
  const startedAt = Date.now();

  res.locals.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    logger.info(
      {
        requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
      },
      'Request completed'
    );
  });

  next();
};
