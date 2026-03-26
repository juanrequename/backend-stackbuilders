const entrySchema = {
  type: 'object',
  properties: {
    number: { type: 'integer', minimum: 1 },
    title: { type: 'string', minLength: 1 },
    points: { type: 'integer', minimum: 0 },
    comments: { type: 'integer', minimum: 0 },
  },
  required: ['number', 'title', 'points', 'comments'],
  additionalProperties: false,
} as const;

export const filterCrawlerSchema = {
  type: 'object',
  properties: {
    filterType: {
      type: 'string',
      enum: ['more_than_five_words', 'five_or_less_words', 'none'],
    },
    entries: {
      type: 'array',
      items: entrySchema,
      maxItems: 30,
    },
  },
  required: ['filterType'],
  additionalProperties: false,
} as const;
