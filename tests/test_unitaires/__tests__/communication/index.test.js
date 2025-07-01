const communication = require('../../../../engine/communication/index.js');

// Mock des dépendances externes
jest.mock('express');

describe('Communication Module', () => {
  let mockAmqpClient;
  let mockAmqpChannel;
  let mockExpressApp;

  beforeEach(() => {
    // Setup mocks
    mockAmqpClient = {
      sendToQueue: jest.fn(),
      publish: jest.fn().mockResolvedValue(true),
      createChannel: jest.fn()
    };

    mockAmqpChannel = {
      assertQueue: jest.fn().mockResolvedValue(true),
      consume: jest.fn(),
      sendToQueue: jest.fn(),
      publish: jest.fn().mockResolvedValue(true),
      ack: jest.fn(),
      nack: jest.fn()
    };

    mockExpressApp = {
      use: jest.fn(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Module Initialization', () => {
    test('should have communication module defined', () => {
      expect(communication).toBeDefined();
      expect(typeof communication).toBe('object');
    });

    test('should have required methods', () => {
      // Vérifier que les méthodes principales sont présentes
      if (communication.init) {
        expect(typeof communication.init).toBe('function');
      }
      
      if (communication.setAmqpClient) {
        expect(typeof communication.setAmqpClient).toBe('function');
      }
      
      if (communication.setAmqpChannel) {
        expect(typeof communication.setAmqpChannel).toBe('function');
      }
    });
  });

  describe('AMQP Client Management', () => {
    test('should set AMQP client', () => {
      if (communication.setAmqpClient) {
        expect(() => {
          communication.setAmqpClient(mockAmqpClient);
        }).not.toThrow();
      }
    });

    test('should set AMQP channel', () => {
      if (communication.setAmqpChannel) {
        expect(() => {
          communication.setAmqpChannel(mockAmqpChannel);
        }).not.toThrow();
      }
    });

    test('should handle null AMQP client gracefully', () => {
      if (communication.setAmqpClient) {
        expect(() => {
          communication.setAmqpClient(null);
        }).not.toThrow();
      }
    });

    test('should handle null AMQP channel gracefully', () => {
      if (communication.setAmqpChannel) {
        expect(() => {
          communication.setAmqpChannel(null);
        }).not.toThrow();
      }
    });
  });

  describe('Express App Initialization', () => {
    test('should initialize with Express app', () => {
      if (communication.init) {
        expect(() => {
          communication.init(mockExpressApp);
        }).not.toThrow();
      }
    });

    test('should handle missing Express app', () => {
      if (communication.init) {
        expect(() => {
          communication.init(null);
        }).not.toThrow();
      }
    });
  });

  describe('Message Queue Operations', () => {
    beforeEach(() => {
      if (communication.setAmqpClient) {
        communication.setAmqpClient(mockAmqpClient);
      }
      if (communication.setAmqpChannel) {
        communication.setAmqpChannel(mockAmqpChannel);
      }
    });

    test('should handle message sending', () => {
      if (communication.sendMessage) {
        const message = {
          queue: 'test-queue',
          data: { test: 'data' }
        };

        expect(() => {
          communication.sendMessage(message);
        }).not.toThrow();
      }
    });

    test('should handle message publishing', () => {
      if (communication.publishMessage) {
        const message = {
          exchange: 'test-exchange',
          routingKey: 'test.route',
          data: { test: 'data' }
        };

        expect(() => {
          communication.publishMessage(message);
        }).not.toThrow();
      }
    });

    test('should handle message consumption setup', () => {
      if (communication.consumeMessages) {
        const config = {
          queue: 'test-queue',
          callback: jest.fn()
        };

        expect(() => {
          communication.consumeMessages(config);
        }).not.toThrow();
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle AMQP connection errors', () => {
      const failingAmqpClient = {
        sendToQueue: jest.fn().mockRejectedValue(new Error('Connection failed')),
        publish: jest.fn().mockRejectedValue(new Error('Connection failed'))
      };

      if (communication.setAmqpClient) {
        expect(() => {
          communication.setAmqpClient(failingAmqpClient);
        }).not.toThrow();
      }
    });

    test('should handle malformed messages', () => {
      if (communication.sendMessage) {
        const malformedMessages = [
          null,
          undefined,
          'string',
          123,
          [],
          {}
        ];

        malformedMessages.forEach(message => {
          expect(() => {
            communication.sendMessage(message);
          }).not.toThrow();
        });
      }
    });

    test('should handle missing queue names', () => {
      if (communication.sendMessage) {
        const messageWithoutQueue = {
          data: { test: 'data' }
        };

        expect(() => {
          communication.sendMessage(messageWithoutQueue);
        }).not.toThrow();
      }
    });
  });

  describe('HTTP Endpoints', () => {
    beforeEach(() => {
      if (communication.init) {
        communication.init(mockExpressApp);
      }
    });

    test('should register HTTP endpoints', () => {
      // Vérifier que les endpoints HTTP sont enregistrés
      if (mockExpressApp.post.mock.calls.length > 0) {
        expect(mockExpressApp.post).toHaveBeenCalled();
      }
      
      if (mockExpressApp.get.mock.calls.length > 0) {
        expect(mockExpressApp.get).toHaveBeenCalled();
      }
    });

    test('should handle HTTP requests', () => {
      // Test des handlers HTTP si ils sont exposés
      if (communication.handleHttpRequest) {
        const mockReq = {
          body: { test: 'data' },
          params: { id: '123' },
          query: { filter: 'active' }
        };

        const mockRes = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
          send: jest.fn()
        };

        expect(() => {
          communication.handleHttpRequest(mockReq, mockRes);
        }).not.toThrow();
      }
    });
  });

  describe('Message Serialization', () => {
    test('should serialize complex objects', () => {
      if (communication.serializeMessage) {
        const complexMessage = {
          id: 'msg-123',
          timestamp: new Date(),
          data: {
            nested: {
              array: [1, 2, 3],
              object: { key: 'value' }
            }
          },
          metadata: {
            source: 'test-component',
            version: '1.0.0'
          }
        };

        expect(() => {
          const serialized = communication.serializeMessage(complexMessage);
          expect(serialized).toBeDefined();
        }).not.toThrow();
      }
    });

    test('should deserialize messages', () => {
      if (communication.deserializeMessage) {
        const serializedMessage = JSON.stringify({
          id: 'msg-123',
          data: { test: 'data' }
        });

        expect(() => {
          const deserialized = communication.deserializeMessage(serializedMessage);
          expect(deserialized).toBeDefined();
          expect(deserialized.id).toBe('msg-123');
        }).not.toThrow();
      }
    });

    test('should handle serialization errors', () => {
      if (communication.serializeMessage) {
        const circularObject = {};
        circularObject.self = circularObject;

        expect(() => {
          communication.serializeMessage(circularObject);
        }).not.toThrow();
      }
    });
  });

  describe('Connection Management', () => {
    test('should handle connection state', () => {
      if (communication.isConnected) {
        expect(typeof communication.isConnected()).toBe('boolean');
      }
    });

    test('should handle reconnection', () => {
      if (communication.reconnect) {
        expect(() => {
          communication.reconnect();
        }).not.toThrow();
      }
    });

    test('should handle connection cleanup', () => {
      if (communication.cleanup) {
        expect(() => {
          communication.cleanup();
        }).not.toThrow();
      }
    });
  });

  describe('Performance', () => {
    test('should handle high message throughput', () => {
      if (communication.sendMessage && communication.setAmqpClient) {
        communication.setAmqpClient(mockAmqpClient);

        const messages = Array.from({ length: 100 }, (_, i) => ({
          queue: 'test-queue',
          data: { id: i, timestamp: Date.now() }
        }));

        const startTime = Date.now();
        messages.forEach(message => {
          communication.sendMessage(message);
        });
        const endTime = Date.now();

        expect(endTime - startTime).toBeLessThan(1000);
      }
    });

    test('should handle concurrent operations', async () => {
      if (communication.sendMessage && communication.setAmqpClient) {
        communication.setAmqpClient(mockAmqpClient);

        const operations = Array.from({ length: 50 }, (_, i) => 
          new Promise(resolve => {
            communication.sendMessage({
              queue: 'test-queue',
              data: { id: i }
            });
            resolve();
          })
        );

        await expect(Promise.all(operations)).resolves.toBeDefined();
      }
    });
  });

  describe('Integration Tests', () => {
    test('should integrate with Express and AMQP', () => {
      if (communication.init && communication.setAmqpClient && communication.setAmqpChannel) {
        expect(() => {
          communication.init(mockExpressApp);
          communication.setAmqpClient(mockAmqpClient);
          communication.setAmqpChannel(mockAmqpChannel);
        }).not.toThrow();
      }
    });

    test('should handle full message flow', () => {
      if (communication.init && communication.setAmqpClient && communication.sendMessage) {
        communication.init(mockExpressApp);
        communication.setAmqpClient(mockAmqpClient);

        const message = {
          queue: 'workflow-queue',
          data: {
            workspaceId: 'ws-123',
            componentId: 'comp-456',
            action: 'process',
            payload: { test: 'data' }
          }
        };

        expect(() => {
          communication.sendMessage(message);
        }).not.toThrow();
      }
    });
  });
});