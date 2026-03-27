export const filterCrawlerSchema = {
  type: 'object',
  properties: {
    filterType: {
      type: 'string',
      enum: ['word_count_gt', 'word_count_lte', 'none'],
    },
  },
  required: ['filterType'],
  additionalProperties: false,
} as const;
