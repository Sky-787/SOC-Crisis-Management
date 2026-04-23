const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SOC Crisis Management — API',
      version: '1.0.0',
      description:
        'API REST del Crisis_Server. Permite inspeccionar el estado de las salas activas sin usar WebSockets.',
    },
    servers: [{ url: 'http://localhost:3001', description: 'Servidor local' }],
    components: {
      schemas: {
        TrafficEntry: {
          type: 'object',
          properties: {
            ip: { type: 'string', example: '192.168.1.101' },
            volume: { type: 'integer', example: 120 },
          },
        },
        CrisisState: {
          type: 'object',
          properties: {
            encryptionPercentage: { type: 'integer', minimum: 0, maximum: 100, example: 35 },
            trafficMap: {
              type: 'array',
              items: { $ref: '#/components/schemas/TrafficEntry' },
            },
            accessLog: {
              type: 'array',
              items: { type: 'string' },
              example: ['[2025-01-01T00:00:00.000Z] ALERT: Ransomware encrypted 2% more files'],
            },
            availableProtocols: {
              type: 'array',
              items: { type: 'string' },
              example: ['isolate-network', 'generate-decryption-key', 'block-ip'],
            },
          },
        },
        RoomSummary: {
          type: 'object',
          properties: {
            room_id: { type: 'string', example: 'ALPHA-01' },
            playerCount: { type: 'integer', example: 2 },
            encryptionPercentage: { type: 'integer', example: 35 },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Room not found' },
          },
        },
      },
    },
    paths: {
      '/api/rooms': {
        get: {
          summary: 'Lista todas las rooms activas',
          tags: ['Rooms'],
          responses: {
            200: {
              description: 'Array de rooms activas con resumen',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/RoomSummary' },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Crea una room vacía',
          tags: ['Rooms'],
          responses: {
            201: {
              description: 'Room creada exitosamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { room_id: { type: 'string', example: 'ALPHA-01' } },
                  },
                },
              },
            },
          },
        },
      },
      '/api/rooms/{room_id}': {
        get: {
          summary: 'Obtiene el CrisisState completo de una room',
          tags: ['Rooms'],
          parameters: [
            {
              name: 'room_id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              example: 'ALPHA-01',
            },
          ],
          responses: {
            200: {
              description: 'CrisisState completo de la room',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/CrisisState' } },
              },
            },
            404: {
              description: 'Room no encontrada',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };
