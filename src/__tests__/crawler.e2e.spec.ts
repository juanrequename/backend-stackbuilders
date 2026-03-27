import request from 'supertest';
import app from '../index';
import crawlerService from '../services/crawler.service';
import { fetchHnHtml } from '../libs/crawler/hnClient';
import { HnEntry } from '../types/crawler';
import { AppError } from '../errors/appError';
import { UsageLogAttributes } from '../models/usageLog.model';

jest.mock('../libs/crawler/hnClient', () => ({
  fetchHnHtml: jest.fn(),
  HN_BASE_URL: 'https://news.ycombinator.com/',
}));

const mockedFetchHnHtml = fetchHnHtml as jest.MockedFunction<typeof fetchHnHtml>;
const logUsageSpy: jest.MockedFunction<typeof crawlerService.logUsage> = jest
  .fn()
  .mockResolvedValue(undefined);
const getUsageLogsSpy: jest.MockedFunction<typeof crawlerService.getUsageLogs> = jest
  .fn()
  .mockResolvedValue([]);
const originalLogUsage = crawlerService.logUsage;
const originalGetUsageLogs = crawlerService.getUsageLogs;
crawlerService.logUsage = logUsageSpy;
crawlerService.getUsageLogs = getUsageLogsSpy;

const sampleHnHtml = `
  <table>
    <tr class="athing" id="1">
      <td class="title"><span class="rank">1.</span></td>
      <td class="title">
        <span class="titleline">
          <a href="https://example.com/1">Understanding the beauty of distributed computing</a>
        </span>
      </td>
    </tr>
    <tr>
      <td class="subtext">
        <span class="score" id="score_1">10 points</span>
        <a href="user?id=1">user1</a>
        <a href="item?id=1">5 comments</a>
      </td>
    </tr>

    <tr class="athing" id="2">
      <td class="title"><span class="rank">2.</span></td>
      <td class="title">
        <span class="titleline">
          <a href="https://example.com/2">Short idea</a>
        </span>
      </td>
    </tr>
    <tr>
      <td class="subtext">
        <span class="score" id="score_2">20 points</span>
        <a href="user?id=2">user2</a>
        <a href="item?id=2">1 comment</a>
      </td>
    </tr>

    <tr class="athing" id="3">
      <td class="title"><span class="rank">3.</span></td>
      <td class="title">
        <span class="titleline">
          <a href="https://example.com/3">Another absolutely expansive explanation on networks</a>
        </span>
      </td>
    </tr>
    <tr>
      <td class="subtext">
        <span class="score" id="score_3">15 points</span>
        <a href="user?id=3">user3</a>
        <a href="item?id=3">7 comments</a>
      </td>
    </tr>

    <tr class="athing" id="4">
      <td class="title"><span class="rank">4.</span></td>
      <td class="title">
        <span class="titleline">
          <a href="https://example.com/4">Edge case</a>
        </span>
      </td>
    </tr>
    <tr>
      <td class="subtext">
        <span class="score" id="score_4">25 points</span>
        <a href="user?id=4">user4</a>
        <a href="item?id=4">discuss</a>
      </td>
    </tr>
  </table>
`;

const normalizedEntries: HnEntry[] = [
  {
    number: 1,
    title: 'Understanding the beauty of distributed computing',
    points: 10,
    comments: 5,
  },
  {
    number: 2,
    title: 'Short idea',
    points: 20,
    comments: 1,
  },
  {
    number: 3,
    title: 'Another absolutely expansive explanation on networks',
    points: 15,
    comments: 7,
  },
  {
    number: 4,
    title: 'Edge case',
    points: 25,
    comments: 0,
  },
];

const basePath = '/api/v1/crawler';
const moreThanFiveEntries = [normalizedEntries[2], normalizedEntries[0]];
const fiveOrLessEntries = [normalizedEntries[3], normalizedEntries[1]];
const usageLogsFixture: UsageLogAttributes[] = [
  {
    requestedAt: '2024-01-10T10:00:00.000Z' as unknown as Date,
    filterType: 'more_than_five_words',
    requestId: 'req-1',
    entryCount: 30,
    resultCount: 12,
    durationMs: 120,
    sourceUrl: 'https://news.ycombinator.com/',
    status: 'success',
  },
  {
    requestedAt: '2024-01-10T10:02:00.000Z' as unknown as Date,
    filterType: 'five_or_less_words',
    requestId: 'req-2',
    durationMs: 95,
    sourceUrl: 'https://news.ycombinator.com/',
    status: 'error',
  },
];

describe('Crawler API end-to-end', () => {
  beforeEach(() => {
    mockedFetchHnHtml.mockReset();
    mockedFetchHnHtml.mockResolvedValue(sampleHnHtml);
    logUsageSpy.mockClear();
    getUsageLogsSpy.mockClear();
    getUsageLogsSpy.mockResolvedValue(usageLogsFixture);
  });

  afterAll(() => {
    crawlerService.logUsage = originalLogUsage;
    crawlerService.getUsageLogs = originalGetUsageLogs;
  });

  it('filters entries with more than five words and logs usage', async () => {
    const response = await request(app)
      .post(`${basePath}/filter`)
      .send({ filterType: 'more_than_five_words' });
    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.body).toEqual({
      success: true,
      data: {
        entries: moreThanFiveEntries,
      },
    });
    expect(mockedFetchHnHtml).toHaveBeenCalledTimes(1);
    expect(logUsageSpy).toHaveBeenCalledTimes(1);
    expect(logUsageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        filterType: 'more_than_five_words',
        entryCount: normalizedEntries.length,
        resultCount: moreThanFiveEntries.length,
        status: 'success',
        durationMs: expect.any(Number),
      })
    );
  });

  it('filters entries with five or less words and logs usage', async () => {
    const response = await request(app)
      .post(`${basePath}/filter`)
      .send({ filterType: 'five_or_less_words' });
    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.body).toEqual({
      success: true,
      data: {
        entries: fiveOrLessEntries,
      },
    });
    expect(mockedFetchHnHtml).toHaveBeenCalledTimes(1);
    expect(logUsageSpy).toHaveBeenCalledTimes(1);
    expect(logUsageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        filterType: 'five_or_less_words',
        entryCount: normalizedEntries.length,
        resultCount: fiveOrLessEntries.length,
        status: 'success',
        durationMs: expect.any(Number),
      })
    );
  });

  it('returns a validation error for invalid filter type', async () => {
    const response = await request(app).post(`${basePath}/filter`).send({ filterType: 'bad' });
    expect(response.status).toBe(400);
    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
      })
    );
  });

  it('returns all entries unfiltered for filterType none', async () => {
    const response = await request(app).post(`${basePath}/filter`).send({ filterType: 'none' });
    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.body).toEqual({
      success: true,
      data: {
        entries: normalizedEntries,
      },
    });
    expect(logUsageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        filterType: 'none',
        entryCount: normalizedEntries.length,
        resultCount: normalizedEntries.length,
        status: 'success',
      })
    );
  });

  it('returns an upstream error code when HN fetch fails', async () => {
    mockedFetchHnHtml.mockRejectedValueOnce(
      new AppError('HN request failed with status 503', 502, 'HN_UPSTREAM_ERROR')
    );

    const response = await request(app)
      .post(`${basePath}/filter`)
      .send({ filterType: 'more_than_five_words' });

    expect(response.status).toBe(502);
    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        code: 'HN_UPSTREAM_ERROR',
      })
    );
  });

  it('returns usage logs with default limit', async () => {
    const response = await request(app).get(`${basePath}/usage`);
    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.body).toEqual({
      success: true,
      data: {
        logs: usageLogsFixture,
      },
    });
    expect(getUsageLogsSpy).toHaveBeenCalledTimes(1);
    expect(getUsageLogsSpy).toHaveBeenCalledWith(50);
  });

  it('caps usage log limit at 100', async () => {
    const response = await request(app).get(`${basePath}/usage?limit=800`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(getUsageLogsSpy).toHaveBeenCalledWith(100);
  });

  it('returns validation error for invalid usage log limit', async () => {
    const response = await request(app).get(`${basePath}/usage?limit=-1`);
    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        code: 'VALIDATION_ERROR',
      })
    );
  });
});
