import Redis from 'ioredis';
import logger from './logger';
import { environment } from './environment';

let redisClient: Redis | null = null;
let connectionPromise: Promise<void> | null = null;
let listenersAttached = false;

const attachConnectionListeners = (client: Redis): void => {
  if (listenersAttached) return;
  listenersAttached = true;

  client.on('ready', () => {
    logger.info('Connected to Redis');
  });

  client.on('error', error => {
    logger.error({ error }, 'Redis connection error');
  });

  client.on('end', () => {
    logger.warn('Redis connection ended');
  });

  client.on('reconnecting', () => {
    logger.warn('Redis reconnecting');
  });
};

export const getRedisClient = (): Redis | null => {
  if (!redisClient || redisClient.status !== 'ready') {
    return null;
  }

  return redisClient;
};

export const connectRedis = async (): Promise<void> => {
  if (!environment.redisUrl) {
    logger.warn('Redis URL is not configured; HN cache will be skipped.');
    return;
  }

  if (redisClient?.status === 'ready') {
    return;
  }

  if (!redisClient) {
    redisClient = new Redis(environment.redisUrl, {
      lazyConnect: true,
      enableReadyCheck: true,
      maxRetriesPerRequest: 2,
    });
    attachConnectionListeners(redisClient);
  }

  if (!connectionPromise) {
    connectionPromise = redisClient.connect().catch(error => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
};

export const disconnectRedis = async (): Promise<void> => {
  if (!environment.redisUrl || !redisClient) {
    return;
  }

  try {
    await redisClient.quit();
  } catch (error) {
    logger.error({ error }, 'Failed to disconnect from Redis');
    redisClient.disconnect();
  } finally {
    redisClient = null;
    connectionPromise = null;
    listenersAttached = false;
  }
};
