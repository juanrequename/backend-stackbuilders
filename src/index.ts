import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';
import { swaggerSpec } from './config/swagger';
import crawlerRoutes from './routes/crawler.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { requestContext } from './middleware/request.middleware';
import logger from './config/logger';
import { environment, validateEnvironment } from './config/environment';
import { connectDatabase, disconnectDatabase } from './config/database';

const app: Express = express();
const port = environment.port;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: environment.corsOrigin
      ? environment.corsOrigin.split(',').map(o => o.trim())
      : false,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestContext);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Basic health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

const apiBasePath = '/api/v1';
const crawlerLimiter = rateLimit({
  windowMs: environment.crawlerRateLimitWindowMs,
  max: environment.crawlerRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

// API Routes
app.use(`${apiBasePath}/crawler`, crawlerLimiter, crawlerRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handling middleware - must be last
app.use(errorHandler);

// Start server only when running as entrypoint
if (require.main === module) {
  validateEnvironment();

  void connectDatabase()
    .then(() => {
      const server = app.listen(port, () => {
        logger.info(`[server]: Server is running`);
        logger.info(
          `[docs]: API documentation available at /api-docs. E.g: http://localhost:${port}/api-docs`
        );
      });

      const shutdown = (signal: string) => {
        logger.info({ signal }, 'Shutdown signal received');
        server.close(() => {
          void disconnectDatabase()
            .catch(error => {
              logger.error({ error }, 'Failed to disconnect from MongoDB');
            })
            .finally(() => {
              process.exit(0);
            });
        });

        setTimeout(() => {
          logger.warn('Forcefully exiting after shutdown timeout');
          process.exit(1);
        }, 10_000).unref();
      };

      process.on('SIGTERM', () => shutdown('SIGTERM'));
      process.on('SIGINT', () => shutdown('SIGINT'));
    })
    .catch(error => {
      logger.error({ error }, 'Failed to connect to MongoDB');
      process.exit(1);
    });
}

export default app;
