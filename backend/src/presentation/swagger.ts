export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Portfolio Management Dashboard API',
    version: '1.0.0',
    description: 'REST API documentation for managing user portfolios, investment assets, buying/selling transactions, and monitoring performance summaries.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide your RS256 signed JWT token to access protected endpoints.',
      },
    },
    schemas: {
      UserRegisterDto: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'investor@example.com',
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'strongpass123',
          },
        },
      },
      UserLoginDto: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'investor@example.com',
          },
          password: {
            type: 'string',
            example: 'strongpass123',
          },
        },
      },
      CreateInvestmentDto: {
        type: 'object',
        required: ['assetId', 'quantity', 'purchasePrice'],
        properties: {
          assetId: {
            type: 'string',
            example: 'asset-stock-1',
          },
          quantity: {
            type: 'number',
            minimum: 0.0001,
            example: 10,
          },
          purchasePrice: {
            type: 'number',
            minimum: 0.01,
            example: 150.5,
          },
          purchaseDate: {
            type: 'string',
            format: 'date-time',
            example: '2026-06-13T12:00:00Z',
          },
        },
      },
      UpdateInvestmentDto: {
        type: 'object',
        properties: {
          quantity: {
            type: 'number',
            minimum: 0.0001,
            example: 12,
          },
          purchasePrice: {
            type: 'number',
            minimum: 0.01,
            example: 155,
          },
        },
      },
      CreateTransactionDto: {
        type: 'object',
        required: ['investmentId', 'transactionType', 'quantity', 'price'],
        properties: {
          investmentId: {
            type: 'string',
            example: 'investment-uuid-123',
          },
          transactionType: {
            type: 'string',
            enum: ['BUY', 'SELL'],
            example: 'BUY',
          },
          quantity: {
            type: 'number',
            minimum: 0.0001,
            example: 5,
          },
          price: {
            type: 'number',
            minimum: 0.01,
            example: 160,
          },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserRegisterDto',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully.',
          },
          400: {
            description: 'Invalid input format or constraints.',
          },
          409: {
            description: 'Email is already registered.',
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate user and retrieve token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserLoginDto',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful. Returns JWT token and profile.',
          },
          400: {
            description: 'Email and password are required.',
          },
          401: {
            description: 'Invalid email or password.',
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Invalidate current user session',
        responses: {
          200: {
            description: 'Logged out successfully.',
          },
          401: {
            description: 'Missing or invalid authentication token.',
          },
        },
      },
    },
    '/api/auth/profile': {
      get: {
        tags: ['Authentication'],
        summary: 'Retrieve currently logged in user profile',
        responses: {
          200: {
            description: 'Returns profile details of the authenticated user.',
          },
          401: {
            description: 'Missing or invalid authentication token.',
          },
          404: {
            description: 'User not found.',
          },
        },
      },
    },
    '/api/assets': {
      get: {
        tags: ['Assets'],
        summary: 'Retrieve all catalog assets available for investment',
        responses: {
          200: {
            description: 'Returns array of assets.',
          },
          401: {
            description: 'Missing or invalid authentication token.',
          },
        },
      },
    },
    '/api/investments': {
      get: {
        tags: ['Investments'],
        summary: 'List all current holdings for the authenticated user',
        responses: {
          200: {
            description: 'Array of user investments.',
          },
          401: {
            description: 'Missing or invalid authentication token.',
          },
        },
      },
      post: {
        tags: ['Investments'],
        summary: 'Create a new investment holding',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateInvestmentDto',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Investment created successfully.',
          },
          400: {
            description: 'Invalid input fields or missing values.',
          },
          401: {
            description: 'Missing or invalid authentication token.',
          },
        },
      },
    },
    '/api/investments/{id}': {
      get: {
        tags: ['Investments'],
        summary: 'Get details for a specific investment holding',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Investment record retrieved.',
          },
          401: {
            description: 'Missing or invalid authentication token.',
          },
          403: {
            description: 'Access denied (investment belongs to another user).',
          },
          404: {
            description: 'Investment not found.',
          },
        },
      },
      put: {
        tags: ['Investments'],
        summary: 'Update quantity and purchase price of an investment holding',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateInvestmentDto',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Investment holding updated.',
          },
          400: {
            description: 'Cannot modify restricted fields (like assetId).',
          },
          401: {
            description: 'Missing or invalid authentication token.',
          },
          403: {
            description: 'Access denied.',
          },
          404: {
            description: 'Investment holding not found.',
          },
        },
      },
      delete: {
        tags: ['Investments'],
        summary: 'Delete an investment holding',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Investment deleted successfully.',
          },
          401: {
            description: 'Missing or invalid authentication token.',
          },
          403: {
            description: 'Access denied.',
          },
          404: {
            description: 'Investment holding not found.',
          },
        },
      },
    },
    '/api/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'List execution history for user transactions',
        parameters: [
          {
            name: 'startDate',
            in: 'query',
            schema: { type: 'string', format: 'date' },
            description: 'Filter transaction date from (inclusive).',
          },
          {
            name: 'endDate',
            in: 'query',
            schema: { type: 'string', format: 'date' },
            description: 'Filter transaction date to (inclusive).',
          },
          {
            name: 'transactionType',
            in: 'query',
            schema: { type: 'string', enum: ['BUY', 'SELL'] },
            description: 'Filter by transaction operation.',
          },
          {
            name: 'assetType',
            in: 'query',
            schema: { type: 'string', enum: ['Stocks', 'Bonds', 'Mutual Funds'] },
            description: 'Filter transactions by target asset category.',
          },
        ],
        responses: {
          200: {
            description: 'Returns array of transaction records.',
          },
          401: {
            description: 'Missing or invalid authentication token.',
          },
        },
      },
      post: {
        tags: ['Transactions'],
        summary: 'Execute a BUY or SELL transaction on a holding',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateTransactionDto',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Transaction processed successfully.',
          },
          400: {
            description: 'Insufficient holding quantity to execute SELL, or invalid fields.',
          },
          401: {
            description: 'Missing or invalid authentication token.',
          },
          403: {
            description: 'Access denied (investment belongs to another user).',
          },
          404: {
            description: 'Investment holding not found.',
          },
        },
      },
    },
    '/api/portfolio': {
      get: {
        tags: ['Portfolio'],
        summary: 'List user holdings enriched with current valuation metrics',
        responses: {
          200: {
            description: 'Array of holdings containing computed values, profit/losses, and returns.',
          },
          401: {
            description: 'Missing or invalid authentication token.',
          },
        },
      },
    },
    '/api/portfolio/summary': {
      get: {
        tags: ['Portfolio'],
        summary: 'Retrieve summary analytics of the overall portfolio',
        responses: {
          200: {
            description: 'Calculated portfolio cost, value, profit/loss, unique assets count, and overall return percentage.',
          },
          401: {
            description: 'Missing or invalid authentication token.',
          },
        },
      },
    },
  },
};
