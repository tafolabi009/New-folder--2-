const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Results Server API',
    version: '1.0.0',
    description: 'API for saving and retrieving JSON results.'
  },
  servers: [
    { url: '/' }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Healthcheck',
        responses: {
          '200': { description: 'OK' }
        }
      }
    },
    '/api/results': {
      get: {
        summary: 'List results',
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 200 }, required: false },
          { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0 }, required: false }
        ],
        responses: {
          '200': {
            description: 'List of results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    results: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer' },
                          created_at: { type: 'string', format: 'date-time' },
                          payload: { type: 'object', additionalProperties: true }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a result',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', additionalProperties: true },
              example: { message: 'Hello world' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    created_at: { type: 'string', format: 'date-time' },
                    payload: { type: 'object', additionalProperties: true }
                  }
                }
              }
            }
          },
          '400': { description: 'Invalid input' }
        }
      }
    }
  }
};

module.exports = openapi;


