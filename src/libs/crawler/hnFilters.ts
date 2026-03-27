import { HnEntry } from '../../types/crawler';
import { countTitleWords } from './wordCount';
import { environment } from '../../config/environment';

const byNumberAsc = (left: HnEntry, right: HnEntry): number => left.number - right.number;

export const filterMoreThanNWords = (entries: HnEntry[]): HnEntry[] => {
  const threshold = environment.hnTitleWordThreshold;
  return entries
    .filter(entry => countTitleWords(entry.title) > threshold)
    .sort((left, right) => {
      if (right.comments !== left.comments) {
        return right.comments - left.comments;
      }
      return byNumberAsc(left, right);
    });
};

export const filterLessEqualThanNWords = (entries: HnEntry[]): HnEntry[] => {
  const threshold = environment.hnTitleWordThreshold;
  return entries
    .filter(entry => countTitleWords(entry.title) <= threshold)
    .sort((left, right) => {
      if (right.points !== left.points) {
        return right.points - left.points;
      }
      return byNumberAsc(left, right);
    });
};
