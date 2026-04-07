import { Express } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Drips API',
      version: '1.0.0',
      description: 'Backend API for Drips - Decentralized Savings Groups Platform',
      contact: {
        name: 'Drips Team',
        email: 'support@drips.app',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Groups', description: 'Savings group management' },
      { name: 'Analytics', description: 'Analytics and insights' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const setupSwagger = (app: Express): void => {
  const specs = swaggerJsdoc(swaggerOptions);
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
  }));
};
