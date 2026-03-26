import { HnEntry } from '../../types/crawler';
import { countTitleWords } from './wordCount';

const byNumberAsc = (left: HnEntry, right: HnEntry): number => left.number - right.number;

export const filterMoreThanFiveWords = (entries: HnEntry[]): HnEntry[] => {
  return entries
    .filter(entry => countTitleWords(entry.title) > 5)
    .sort((left, right) => {
      if (right.comments !== left.comments) {
        return right.comments - left.comments;
      }
      return byNumberAsc(left, right);
    });
};

export const filterFiveOrLessWords = (entries: HnEntry[]): HnEntry[] => {
  return entries
    .filter(entry => countTitleWords(entry.title) <= 5)
    .sort((left, right) => {
      if (right.points !== left.points) {
        return right.points - left.points;
      }
      return byNumberAsc(left, right);
    });
};
