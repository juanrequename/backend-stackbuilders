import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import crawlerRoutes from './routes/crawler.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import logger from './config/logger';
import { environment } from './config/environment';
import { connectDatabase } from './config/database';

const app: Express = express();
const port = environment.port;

// Connect to database
connectDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// API Routes
app.use(`${apiBasePath}/crawler`, crawlerRoutes);

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handling middleware - must be last
app.use(errorHandler);

// Start server only when running as entrypoint
if (require.main === module) {
  void connectDatabase().catch(error => {
    logger.error({ error }, 'Failed to connect to MongoDB');
    process.exit(1);
  });

  app.listen(port, () => {
    logger.info(`[server]: Server is running`);
    logger.info(
      `[docs]: API documentation available at /api-docs. E.g: http://localhost:${port}/api-docs`
    );
  });
}

export default app;
