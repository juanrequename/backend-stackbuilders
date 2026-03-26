import { countTitleWords } from '../wordCount';

describe('countTitleWords', () => {
  it('counts only tokens with alphanumeric characters', () => {
    const title = 'This is - a self-explained example';
    expect(countTitleWords(title)).toBe(5);
  });

  it('returns zero for empty strings', () => {
    expect(countTitleWords('')).toBe(0);
  });
});
