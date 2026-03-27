type NodeEnv = 'development' | 'production' | 'test';

const normalizeNodeEnv = (value: string | undefined): NodeEnv => {
  const normalized = value?.toLowerCase();

  if (normalized === 'production') {
    return 'production';
  }

  if (normalized === 'test') {
    return 'test';
  }

  return 'development';
};

export const environment = {
  nodeEnv: normalizeNodeEnv(process.env.NODE_ENV),
  port: Number(process.env.PORT ?? 3000),
  apiBaseUrl: process.env.API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`,
  corsOrigin: process.env.CORS_ORIGIN ?? '',
  mongodbUri: process.env.MONGODB_URI ?? '',
  mongodbDb: process.env.MONGODB_DB ?? 'backend',
  redisUrl: process.env.REDIS_URL ?? '',
  hnDefaultLimit: Number(process.env.HN_DEFAULT_LIMIT ?? 30),
  hnTitleWordThreshold: Number(process.env.HN_WORD_THRESHOLD ?? 5),
  hnCacheTtlMs: Number(process.env.HN_CACHE_TTL_MS ?? 30000),
  crawlerRateLimitWindowMs: Number(process.env.CRAWLER_RATE_LIMIT_WINDOW_MS ?? 60000),
  crawlerRateLimitMax: Number(process.env.CRAWLER_RATE_LIMIT_MAX ?? 60),
};

export const validateEnvironment = (): void => {
  if (!Number.isFinite(environment.port) || environment.port <= 0) {
    throw new Error('PORT must be a positive number.');
  }

  if (!environment.apiBaseUrl) {
    throw new Error('API_BASE_URL must be set.');
  }

  try {
    new URL(environment.apiBaseUrl);
  } catch {
    throw new Error('API_BASE_URL must be a valid URL.');
  }

  if (environment.redisUrl) {
    let redisUrl: URL;
    try {
      redisUrl = new URL(environment.redisUrl);
    } catch {
      throw new Error('REDIS_URL must be a valid URL.');
    }

    if (!['redis:', 'rediss:'].includes(redisUrl.protocol)) {
      throw new Error('REDIS_URL must start with redis:// or rediss://.');
    }
  }

  if (!Number.isFinite(environment.hnDefaultLimit) || environment.hnDefaultLimit <= 0) {
    throw new Error('HN_DEFAULT_LIMIT must be a positive number.');
  }

  if (!Number.isFinite(environment.hnTitleWordThreshold) || environment.hnTitleWordThreshold <= 0) {
    throw new Error('HN_WORD_THRESHOLD must be a positive number.');
  }

  if (!Number.isFinite(environment.hnCacheTtlMs) || environment.hnCacheTtlMs < 0) {
    throw new Error('HN_CACHE_TTL_MS must be zero or a positive number.');
  }

  if (
    !Number.isFinite(environment.crawlerRateLimitWindowMs) ||
    environment.crawlerRateLimitWindowMs <= 0
  ) {
    throw new Error('CRAWLER_RATE_LIMIT_WINDOW_MS must be a positive number.');
  }

  if (!Number.isFinite(environment.crawlerRateLimitMax) || environment.crawlerRateLimitMax <= 0) {
    throw new Error('CRAWLER_RATE_LIMIT_MAX must be a positive number.');
  }
};
