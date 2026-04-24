/**
 * OpenAPI/Swagger Configuration
 * Issue #669: Create Comprehensive API Documentation
 * 
 * Generates OpenAPI 3.0 specification for the Ajo API with complete
 * documentation, examples, authentication, and error codes.
 */

export const openAPISpec = {
  openapi: '3.0.0',
  info: {
    title: 'Ajo API',
    description: 'Decentralized Savings Groups Platform API',
    version: '1.0.0',
    contact: {
      name: 'Ajo Support',
      email: 'support@ajo.app',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: 'https://api.ajo.app/v1',
      description: 'Production',
    },
    {
      url: 'https://staging-api.ajo.app/v1',
      description: 'Staging',
    },
    {
      url: 'http://localhost:3001/v1',
      description: 'Development',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from authentication endpoint',
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for service-to-service authentication',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          message: { type: 'string', example: 'Invalid request parameters' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
          timestamp: { type: 'string', format: 'date-time' },
          requestId: { type: 'string' },
        },
      },
      Group: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          contributionAmount: { type: 'number' },
          frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
          maxMembers: { type: 'integer' },
          currentMembers: { type: 'integer' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          walletAddress: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          trustScore: { type: 'number', minimum: 0, maximum: 100 },
          kycLevel: { type: 'integer', enum: [0, 1, 2, 3] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Contribution: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          groupId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          amount: { type: 'number' },
          status: { type: 'string', enum: ['pending', 'confirmed', 'failed'] },
          txHash: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          data: { type: 'array' },
          pagination: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              page: { type: 'integer' },
              limit: { type: 'integer' },
              pages: { type: 'integer' },
            },
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad Request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request parameters',
              details: [{ field: 'email', message: 'Invalid email format' }],
              timestamp: '2024-04-24T15:04:29Z',
              requestId: 'req-123',
            },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              code: 'UNAUTHORIZED',
              message: 'Missing or invalid authentication token',
              timestamp: '2024-04-24T15:04:29Z',
              requestId: 'req-123',
            },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              code: 'FORBIDDEN',
              message: 'Insufficient permissions',
              timestamp: '2024-04-24T15:04:29Z',
              requestId: 'req-123',
            },
          },
        },
      },
      NotFound: {
        description: 'Not Found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              code: 'NOT_FOUND',
              message: 'Resource not found',
              timestamp: '2024-04-24T15:04:29Z',
              requestId: 'req-123',
            },
          },
        },
      },
      TooManyRequests: {
        description: 'Too Many Requests',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Rate limit exceeded. Max 100 requests per minute',
              timestamp: '2024-04-24T15:04:29Z',
              requestId: 'req-123',
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              code: 'INTERNAL_ERROR',
              message: 'An unexpected error occurred',
              timestamp: '2024-04-24T15:04:29Z',
              requestId: 'req-123',
            },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User login',
        description: 'Authenticate user with wallet address and signature',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  walletAddress: { type: 'string' },
                  signature: { type: 'string' },
                  message: { type: 'string' },
                },
                required: ['walletAddress', 'signature', 'message'],
              },
              example: {
                walletAddress: 'GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJJBBQ5GGMHXQWVVVVVVVVVVV',
                signature: '0x...',
                message: 'Sign this message to login',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/groups': {
      get: {
        tags: ['Groups'],
        summary: 'List groups',
        description: 'Get paginated list of savings groups with optional filters',
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
            description: 'Page number',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 },
            description: 'Items per page',
          },
          {
            name: 'q',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search query',
          },
          {
            name: 'isActive',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filter by active status',
          },
        ],
        responses: {
          '200': {
            description: 'Groups retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Group' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        pages: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
      post: {
        tags: ['Groups'],
        summary: 'Create group',
        description: 'Create a new savings group',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1, maxLength: 100 },
                  description: { type: 'string', maxLength: 500 },
                  contributionAmount: { type: 'number', minimum: 0 },
                  frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
                  maxMembers: { type: 'integer', minimum: 2, maximum: 100 },
                },
                required: ['name', 'contributionAmount', 'frequency', 'maxMembers'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Group created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Group' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/groups/{groupId}': {
      get: {
        tags: ['Groups'],
        summary: 'Get group details',
        parameters: [
          {
            name: 'groupId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Group retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Group' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/search': {
      get: {
        tags: ['Search'],
        summary: 'Full-text search',
        description: 'Search across groups, users, and transactions',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            schema: { type: 'string', minLength: 2 },
            description: 'Search query',
          },
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string', enum: ['groups', 'users', 'transactions'] },
            description: 'Filter by entity type',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 },
          },
        ],
        responses: {
          '200': {
            description: 'Search results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    groups: { type: 'array', items: { $ref: '#/components/schemas/Group' } },
                    users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    transactions: { type: 'array' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '429': { $ref: '#/components/responses/TooManyRequests' },
          '500': { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication endpoints',
    },
    {
      name: 'Groups',
      description: 'Savings group management',
    },
    {
      name: 'Search',
      description: 'Full-text search capabilities',
    },
  ],
}

export const ERROR_CODES = {
  // Authentication errors (1000-1099)
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    status: 401,
    message: 'Missing or invalid authentication token',
  },
  INVALID_SIGNATURE: {
    code: 'INVALID_SIGNATURE',
    status: 401,
    message: 'Invalid wallet signature',
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    status: 401,
    message: 'Authentication token has expired',
  },

  // Validation errors (2000-2099)
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    status: 400,
    message: 'Invalid request parameters',
  },
  INVALID_EMAIL: {
    code: 'INVALID_EMAIL',
    status: 400,
    message: 'Invalid email format',
  },
  INVALID_WALLET_ADDRESS: {
    code: 'INVALID_WALLET_ADDRESS',
    status: 400,
    message: 'Invalid wallet address format',
  },

  // Resource errors (3000-3099)
  NOT_FOUND: {
    code: 'NOT_FOUND',
    status: 404,
    message: 'Resource not found',
  },
  DUPLICATE_RESOURCE: {
    code: 'DUPLICATE_RESOURCE',
    status: 409,
    message: 'Resource already exists',
  },

  // Permission errors (4000-4099)
  FORBIDDEN: {
    code: 'FORBIDDEN',
    status: 403,
    message: 'Insufficient permissions',
  },
  NOT_GROUP_MEMBER: {
    code: 'NOT_GROUP_MEMBER',
    status: 403,
    message: 'User is not a member of this group',
  },

  // Rate limiting (5000-5099)
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    status: 429,
    message: 'Rate limit exceeded',
  },

  // Server errors (6000-6099)
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    status: 500,
    message: 'An unexpected error occurred',
  },
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    status: 500,
    message: 'Database operation failed',
  },
  BLOCKCHAIN_ERROR: {
    code: 'BLOCKCHAIN_ERROR',
    status: 500,
    message: 'Blockchain operation failed',
  },
}

export const RATE_LIMITS = {
  default: {
    requests: 100,
    window: 60, // seconds
  },
  auth: {
    requests: 5,
    window: 60,
  },
  search: {
    requests: 30,
    window: 60,
  },
  upload: {
    requests: 10,
    window: 60,
  },
}
