const HN_BASE_URL = 'https://news.ycombinator.com/';
const DEFAULT_TIMEOUT_MS = 10_000;

export const fetchHnHtml = async (timeoutMs = DEFAULT_TIMEOUT_MS): Promise<string> => {
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
      throw new Error(`HN request failed with status ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
};

export { HN_BASE_URL };
