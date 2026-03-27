export type HnEntry = {
  number: number;
  title: string;
  points: number;
  comments: number;
};

export type CrawlerFilterType = 'word_count_gt' | 'word_count_lte' | 'none';
