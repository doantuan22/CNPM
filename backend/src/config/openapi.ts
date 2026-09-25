export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Hotel Booking Platform API',
    version: '1.0.0',
    description: 'REST API for the Online Hotel Booking Platform (Nền tảng đặt phòng khách sạn trực tuyến).',
  },
  servers: [
    {
      url: '/api',
      description: 'API base path',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Check API and system health status',
        tags: ['Health'],
        responses: {
          '200': {
            description: 'API is running and healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Hotel Booking API is running' },
                    data: {
                      type: 'object',
                      properties: {
                        timestamp: { type: 'string', format: 'date-time' },
                        uptime: { type: 'number' },
                        environment: { type: 'string', example: 'development' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          error: { type: 'object' },
        },
      },
    },
  },
} as const;

export type OpenApiSpec = typeof openApiSpec;
