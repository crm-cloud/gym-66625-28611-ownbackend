/**
 * Swagger/OpenAPI Configuration
 * API documentation setup
 */

export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'GymFlow API',
    version: '1.0.0',
    description: 'Complete gym management system API documentation',
    contact: {
      name: 'GymFlow Support',
      email: 'support@gymflow.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development server',
    },
    {
      url: 'https://api.gymflow.com/v1',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'Error message',
          },
          meta: {
            type: 'object',
            properties: {
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              version: {
                type: 'string',
                example: 'v1',
              },
            },
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
          },
          meta: {
            type: 'object',
            properties: {
              timestamp: {
                type: 'string',
                format: 'date-time',
              },
              version: {
                type: 'string',
                example: 'v1',
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          user_id: {
            type: 'string',
            format: 'uuid',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          full_name: {
            type: 'string',
          },
          role: {
            type: 'string',
            enum: ['super_admin', 'admin', 'manager', 'staff', 'trainer', 'member'],
          },
          phone: {
            type: 'string',
          },
          avatar_url: {
            type: 'string',
            format: 'uri',
          },
          is_active: {
            type: 'boolean',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints',
    },
    {
      name: 'Users',
      description: 'User management endpoints',
    },
    {
      name: 'Members',
      description: 'Member management endpoints',
    },
    {
      name: 'Memberships',
      description: 'Membership plan and subscription management',
    },
    {
      name: 'Classes',
      description: 'Class and session management',
    },
    {
      name: 'Attendance',
      description: 'Member attendance tracking',
    },
    {
      name: 'Payments',
      description: 'Payment processing and invoices',
    },
    {
      name: 'MFA',
      description: 'Multi-factor authentication endpoints',
    },
    {
      name: 'OAuth',
      description: 'Social login with OAuth2.0',
    },
  ],
};

export const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to API docs
};
