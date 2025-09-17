export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Product Service API',
    version: '1.0.0',
    description: 'Swagger/OpenAPI documentation for Product Service',
  },
  servers: [
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
      post: {
        summary: 'Create a new product',
        operationId: 'createProduct',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NewProduct' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Product created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Product created successfully' },
                    id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' }
                  }
                }
              }
            }
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '500': { $ref: '#/components/responses/InternalError' }
        }
      }
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
          count: { type: 'integer', example: 5 }
        },
        required: ['id', 'title', 'price', 'description', 'count'],
      },
      NewProduct: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'New Product' },
          description: { type: 'string', example: 'This is a new product' },
          price: { type: 'number', example: 100 },
          count: { type: 'integer', example: 10 }
        },
        required: ['title', 'description', 'price', 'count']
      }
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
