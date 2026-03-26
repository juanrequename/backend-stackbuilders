import mongoose from 'mongoose';
import logger from './logger';
import { environment } from './environment';

export const connectDatabase = async (): Promise<void> => {
  if (!environment.mongodbUri) {
    logger.warn('MongoDB URI is not configured; usage logs will be skipped.');
    return;
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(environment.mongodbUri, {
    dbName: environment.mongodbDb,
  });

  logger.info('Connected to MongoDB');
};
