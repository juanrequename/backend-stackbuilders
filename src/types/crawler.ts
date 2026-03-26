export type HnEntry = {
  number: number;
  title: string;
  points: number;
  comments: number;
};

export type CrawlerFilterType = 'more_than_five_words' | 'five_or_less_words' | 'none';
