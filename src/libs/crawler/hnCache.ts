import logger from '../../config/logger';
import { getRedisClient } from '../../config/redis';

const HN_CACHE_KEY = 'hn:frontpage';

export class HnCache {
  async get(ttlMs: number): Promise<string | null> {
    if (ttlMs <= 0) {
      return null;
    }

    const client = getRedisClient();
    if (!client) {
      return null;
    }

    try {
      const cached = await client.get(HN_CACHE_KEY);
      return cached ?? null;
    } catch (error) {
      logger.warn({ error }, 'Failed to read HN cache');
      return null;
    }
  }

  async set(html: string, ttlMs: number): Promise<void> {
    if (ttlMs <= 0) {
      return;
    }

    const client = getRedisClient();
    if (!client) {
      return;
    }

    try {
      await client.set(HN_CACHE_KEY, html, 'PX', ttlMs);
    } catch (error) {
      logger.warn({ error }, 'Failed to write HN cache');
    }
  }

  async clear(): Promise<void> {
    const client = getRedisClient();
    if (!client) {
      return;
    }

    try {
      await client.del(HN_CACHE_KEY);
    } catch (error) {
      logger.warn({ error }, 'Failed to clear HN cache');
    }
  }
}

export const hnCache = new HnCache();
