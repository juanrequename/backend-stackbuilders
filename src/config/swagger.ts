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
