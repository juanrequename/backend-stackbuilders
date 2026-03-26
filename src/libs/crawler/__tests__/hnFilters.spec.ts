import { filterFiveOrLessWords, filterMoreThanFiveWords } from '../hnFilters';
import { HnEntry } from '../../../types/crawler';

const entries: HnEntry[] = [
  { number: 1, title: 'Short title', points: 10, comments: 5 },
  { number: 2, title: 'This title has exactly six words now', points: 5, comments: 20 },
  { number: 3, title: 'Another short one', points: 30, comments: 3 },
  { number: 4, title: 'More than five words go here', points: 15, comments: 20 },
];

describe('hnFilters', () => {
  it('filters and sorts entries with more than five words by comments', () => {
    const result = filterMoreThanFiveWords(entries);
    expect(result.map(entry => entry.number)).toEqual([2, 4]);
  });

  it('filters and sorts entries with five or fewer words by points', () => {
    const result = filterFiveOrLessWords(entries);
    expect(result.map(entry => entry.number)).toEqual([3, 1]);
  });
});
