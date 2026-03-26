import { environment } from '../../config/environment';
import { AppError } from '../../errors/appError';

export const HN_BASE_URL = 'https://news.ycombinator.com/';
const DEFAULT_TIMEOUT_MS = 10_000;

class HnCache {
  private html: string | null = null;
  private cachedAt = 0;

  get(ttlMs: number): string | null {
    if (this.html && ttlMs > 0 && Date.now() - this.cachedAt < ttlMs) {
      return this.html;
    }
    return null;
  }

  set(html: string): void {
    this.html = html;
    this.cachedAt = Date.now();
  }

  clear(): void {
    this.html = null;
    this.cachedAt = 0;
  }
}

export const hnCache = new HnCache();

export const fetchHnHtml = async (timeoutMs = DEFAULT_TIMEOUT_MS): Promise<string> => {
  const cached = hnCache.get(environment.hnCacheTtlMs);
  if (cached) {
    return cached;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(HN_BASE_URL, {
      headers: {
        'User-Agent': 'backend-stackbuilders-crawler/1.0',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AppError(
        `HN request failed with status ${response.status}`,
        502,
        'HN_UPSTREAM_ERROR'
      );
    }

    const html = await response.text();
    if (environment.hnCacheTtlMs > 0) {
      hnCache.set(html);
    }
    return html;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AppError('HN request timed out', 504, 'HN_TIMEOUT');
    }
    throw new AppError('Failed to fetch Hacker News', 502, 'HN_FETCH_FAILED');
  } finally {
    clearTimeout(timeout);
  }
};
