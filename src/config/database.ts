import mongoose from 'mongoose';
import logger from './logger';
import { environment } from './environment';

let connectionPromise: Promise<typeof mongoose> | null = null;
let listenersAttached = false;

const attachConnectionListeners = (): void => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on('connected', () => {
    logger.info('Connected to MongoDB');
  });

  mongoose.connection.on('error', error => {
    logger.error({ error }, 'MongoDB connection error');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection disconnected');
  });
};

export const connectDatabase = async (): Promise<void> => {
  if (!environment.mongodbUri) {
    logger.warn('MongoDB URI is not configured; usage logs will be skipped.');
    return;
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  attachConnectionListeners();

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(environment.mongodbUri, {
        dbName: environment.mongodbDb,
        serverSelectionTimeoutMS: 5000,
      })
      .catch(error => {
        connectionPromise = null;
        throw error;
      });
  }

  await connectionPromise;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (!environment.mongodbUri) {
    return;
  }

  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.connection.close(false);
};
