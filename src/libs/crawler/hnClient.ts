import { environment } from '../../config/environment';
import { AppError } from '../../errors/appError';
import { hnCache } from './hnCache';

export const HN_BASE_URL = 'https://news.ycombinator.com/';
const DEFAULT_TIMEOUT_MS = 10_000;

export const fetchHnHtml = async (timeoutMs = DEFAULT_TIMEOUT_MS): Promise<string> => {
  const cached = await hnCache.get(environment.hnCacheTtlMs);
  if (cached) {
    return cached;
  }

  const controller = new AbortController();
  // Use AbortController to enforce a fetch timeout. This avoids hanging
  // network requests and lets us map timeouts to a clear error for callers.
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
    // Only cache when TTL is positive; allows disabling cache via config.
    if (environment.hnCacheTtlMs > 0) {
      await hnCache.set(html, environment.hnCacheTtlMs);
    }
    return html;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    // Distinguish aborts (client-side timeouts) from other network errors so
    // callers get a clear 504 timeout vs a generic upstream failure.
    if (error instanceof Error && error.name === 'AbortError') {
      throw new AppError('HN request timed out', 504, 'HN_TIMEOUT');
    }
    throw new AppError('Failed to fetch Hacker News', 502, 'HN_FETCH_FAILED');
  } finally {
    clearTimeout(timeout);
  }
};
