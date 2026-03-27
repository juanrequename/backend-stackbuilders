import { randomUUID } from 'crypto';
import { fetchHnHtml, HN_BASE_URL } from '../libs/crawler/hnClient';
import { parseHnEntries } from '../libs/crawler/hnParser';
import { filterFiveOrLessWords, filterMoreThanFiveWords } from '../libs/crawler/hnFilters';
import { CrawlerFilterType, HnEntry } from '../types/crawler';
import { UsageLogAttributes, UsageLogModel } from '../models/usageLog.model';
import { environment } from '../config/environment';

class CrawlerService {
  async scrape(limit = environment.hnDefaultLimit): Promise<HnEntry[]> {
    const html = await fetchHnHtml();
    return parseHnEntries(html, limit);
  }

  applyFilter(filterType: CrawlerFilterType, entries: HnEntry[]): HnEntry[] {
    if (filterType === 'more_than_five_words') {
      return filterMoreThanFiveWords(entries);
    }

    if (filterType === 'five_or_less_words') {
      return filterFiveOrLessWords(entries);
    }

    return entries;
  }

  async logUsage(attributes: Omit<UsageLogAttributes, 'requestId'>): Promise<void> {
    // Generate a unique requestId for this usage entry and use the provided
    // sourceUrl when available; otherwise default to the Hacker News base URL.
    // Keeping requestId here ensures logs can be correlated across systems.
    await UsageLogModel.create({
      requestId: randomUUID(),
      ...attributes,
      sourceUrl: attributes.sourceUrl ?? HN_BASE_URL,
    });
  }

  async getUsageLogs(limit: number): Promise<UsageLogAttributes[]> {
    // If no MongoDB URI is configured, the application runs without persistence.
    // Return an empty list rather than throwing so callers can handle absence
    // of DB gracefully (useful in local/dev environments).
    if (!environment.mongodbUri) {
      return [];
    }

    const logs = await UsageLogModel.find({}, { _id: 0, __v: 0 })
      .sort({ requestedAt: -1 })
      .limit(limit)
      .lean<UsageLogAttributes[]>();

    return logs;
  }
}

export default new CrawlerService();
