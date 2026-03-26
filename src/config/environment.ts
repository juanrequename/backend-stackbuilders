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
  mongodbUri: process.env.MONGODB_URI ?? '',
  mongodbDb: process.env.MONGODB_DB ?? 'backend',
  hnDefaultLimit: Number(process.env.HN_DEFAULT_LIMIT ?? 30),
  hnTitleWordThreshold: Number(process.env.HN_WORD_THRESHOLD ?? 5),
};
