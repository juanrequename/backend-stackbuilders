import swaggerJsdoc from 'swagger-jsdoc';
import { environment } from './environment';

const apiDocsGlobs =
  environment.nodeEnv === 'production'
    ? ['./dist/routes/*.js', './dist/controllers/*.js']
    : ['./src/routes/*.ts', './src/controllers/*.ts'];

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Backend API',
      version: '1.0.0',
      description: 'RESTful API documentation for the application',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `${environment.apiBaseUrl}/api/v1`,
        description: `${environment.nodeEnv} server (v1)`,
      },
    ],
    tags: [
      {
        name: 'Crawler',
        description: 'Hacker News crawler endpoints',
      },
    ],
    components: {
      schemas: {
        HnEntry: {
          type: 'object',
          required: ['number', 'title', 'points', 'comments'],
          properties: {
            number: {
              type: 'integer',
              example: 1,
            },
            title: {
              type: 'string',
              example: 'Example story title',
            },
            points: {
              type: 'integer',
              example: 120,
            },
            comments: {
              type: 'integer',
              example: 42,
            },
          },
        },
        UsageLog: {
          type: 'object',
          properties: {
            requestedAt: {
              type: 'string',
              format: 'date-time',
            },
            filterType: {
              type: 'string',
              enum: ['more_than_five_words', 'five_or_less_words', 'none'],
            },
            requestId: {
              type: 'string',
            },
            entryCount: {
              type: 'integer',
            },
            resultCount: {
              type: 'integer',
            },
            durationMs: {
              type: 'integer',
            },
            sourceUrl: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['success', 'error'],
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
            },
            error: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: apiDocsGlobs,
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
