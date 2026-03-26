import * as cheerio from 'cheerio';
import { HnEntry } from '../../types/crawler';

export const parseHnEntries = (html: string, limit = 30): HnEntry[] => {
  const $ = cheerio.load(html);
  const entries: HnEntry[] = [];

  $('tr.athing').each((_index, element) => {
    if (entries.length >= limit) {
      return false;
    }

    const rankText = $(element).find('span.rank').first().text().replace('.', '').trim();
    const number = Number(rankText);
    const title = $(element).find('span.titleline a').first().text().trim();
    const subtext = $(element).next().find('td.subtext');
    const pointsText = subtext.find('span.score').first().text().trim();
    const points = Number.parseInt(pointsText, 10) || 0;
    const commentsText = subtext.find('a').last().text().trim();
    const commentsMatch = commentsText.match(/(\d+)/);
    const comments = commentsMatch ? Number.parseInt(commentsMatch[1], 10) : 0;

    if (!title || Number.isNaN(number)) {
      return true;
    }

    entries.push({
      number,
      title,
      points,
      comments,
    });

    return true;
  });

  return entries;
};
