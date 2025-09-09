// lib/openapi/openapi.ts
export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Product Service API',
    version: '1.0.0',
    description: 'Swagger/OpenAPI documentation for Product Service',
  },
  servers: [
    // Можеш підставити реальний URL після деплою або лишити відносні шляхи
    { url: '/' }
  ],
  paths: {
    '/products': {
      get: {
        summary: 'Get all products',
        operationId: 'getProducts',
        responses: {
          '200': {
            description: 'List of products',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Product' },
                },
              },
            },
          },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/products/{productId}': {
      get: {
        summary: 'Get product by ID',
        operationId: 'getProductById',
        parameters: [
          {
            name: 'productId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Product found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
  },
  components: {
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1' },
          title: { type: 'string', example: 'Gold Ring with Diamond' },
          price: { type: 'number', example: 49.9 },
          description: { type: 'string', example: 'Elegant 14K gold ring featuring a 0.5 carat natural diamond. A timeless choice for special occasions.' },
        },
        required: ['id', 'title', 'price', 'description'],
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
      NotFound: {
        description: 'Product not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
      InternalError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
} as const;
