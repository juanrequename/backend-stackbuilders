export const filterCrawlerSchema = {
  type: 'object',
  properties: {
    filterType: {
      type: 'string',
      enum: ['more_than_five_words', 'five_or_less_words', 'none'],
    },
  },
  required: ['filterType'],
  additionalProperties: false,
} as const;
