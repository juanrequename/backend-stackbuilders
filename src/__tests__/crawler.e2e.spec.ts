import request from 'supertest';
import app from '../index';
import crawlerService from '../services/crawler.service';
import { fetchHnHtml } from '../libs/crawler/hnClient';
import { HnEntry } from '../types/crawler';

jest.mock('../libs/crawler/hnClient', () => ({
  fetchHnHtml: jest.fn(),
  HN_BASE_URL: 'https://news.ycombinator.com/',
}));

const mockedFetchHnHtml = fetchHnHtml as jest.MockedFunction<typeof fetchHnHtml>;
const logUsageSpy: jest.MockedFunction<typeof crawlerService.logUsage> = jest
  .fn()
  .mockResolvedValue(undefined);
const originalLogUsage = crawlerService.logUsage;
crawlerService.logUsage = logUsageSpy;

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

describe('Crawler API end-to-end', () => {
  beforeEach(() => {
    mockedFetchHnHtml.mockReset();
    mockedFetchHnHtml.mockResolvedValue(sampleHnHtml);
    logUsageSpy.mockClear();
  });

  afterAll(() => {
    crawlerService.logUsage = originalLogUsage;
  });

  it('filters entries with more than five words and logs usage', async () => {
    const response = await request(app)
      .post(`${basePath}/filter`)
      .send({ filterType: 'more_than_five_words' });
    expect(response.status).toBe(200);
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
});
