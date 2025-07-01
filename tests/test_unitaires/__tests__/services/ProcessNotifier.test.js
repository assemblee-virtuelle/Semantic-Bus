const ProcessNotifier = require('../../../../engine/services/ProcessNotifier.js');

describe('ProcessNotifier Service', () => {
  let processNotifier;
  let mockAmqpClient;
  let mockWorkspaceId;

  beforeEach(() => {
    mockAmqpClient = {
      sendToQueue: jest.fn(),
      publish: jest.fn().mockResolvedValue(true)
    };
    mockWorkspaceId = 'workspace-123';

    processNotifier = new ProcessNotifier(mockAmqpClient, mockWorkspaceId);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize ProcessNotifier with required parameters', () => {
      expect(processNotifier.amqpClient).toBe(mockAmqpClient);
      expect(processNotifier.workspaceId).toBe(mockWorkspaceId);
    });

    test('should handle missing AMQP client', () => {
      expect(() => {
        new ProcessNotifier(null, mockWorkspaceId);
      }).not.toThrow();
    });

    test('should handle missing workspace ID', () => {
      expect(() => {
        new ProcessNotifier(mockAmqpClient, null);
      }).not.toThrow();
    });
  });

  describe('start method', () => {
    test('should send start notification with valid process data', () => {
      const processData = {
        _id: 'process-123',
        callerId: 'caller-123',
        tracerId: 'tracer-123',
        timeStamp: new Date(),
        steps: [
          { componentId: 'comp-1', status: 'waiting' },
          { componentId: 'comp-2', status: 'waiting' }
        ]
      };

      processNotifier.start(processData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-start.${mockWorkspaceId}`,
        processData
      );
    });

    test('should handle minimal process data', () => {
      const processData = {
        _id: 'process-123'
      };

      processNotifier.start(processData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-start.${mockWorkspaceId}`,
        processData
      );
    });

    test('should handle missing process data', () => {
      expect(() => {
        processNotifier.start();
      }).not.toThrow();

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-start.${mockWorkspaceId}`,
        undefined
      );
    });
  });

  describe('progress method', () => {
    test('should send progress notification with process updates', () => {
      const progressData = {
        processId: 'process-123',
        componentId: 'comp-1',
        status: 'completed',
        data: { result: 'success' },
        error: null
      };

      processNotifier.progress(progressData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-progress.${mockWorkspaceId}`,
        progressData
      );
    });

    test('should handle error in progress', () => {
      const progressData = {
        processId: 'process-123',
        componentId: 'comp-1',
        status: 'error',
        error: new Error('Processing failed')
      };

      processNotifier.progress(progressData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-progress.${mockWorkspaceId}`,
        progressData
      );
    });
  });

  describe('end method', () => {
    test('should send end notification', () => {
      const endData = {
        processId: 'process-123',
        result: { final: 'result' },
        duration: 1500,
        componentsProcessed: 5
      };

      processNotifier.end(endData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-end.${mockWorkspaceId}`,
        endData
      );
    });

    test('should handle end without result data', () => {
      const endData = {
        processId: 'process-123'
      };

      processNotifier.end(endData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-end.${mockWorkspaceId}`,
        endData
      );
    });
  });

  describe('error method', () => {
    test('should send error notification', () => {
      const errorData = {
        processId: 'process-123',
        componentId: 'comp-1',
        error: new Error('Critical failure'),
        stack: 'Error stack trace'
      };

      processNotifier.error(errorData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-error.${mockWorkspaceId}`,
        errorData
      );
    });

    test('should handle string error messages', () => {
      const errorData = {
        processId: 'process-123',
        error: 'Simple error message'
      };

      processNotifier.error(errorData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-error.${mockWorkspaceId}`,
        errorData
      );
    });
  });

  describe('information method', () => {
    test('should send information notification', () => {
      const infoData = {
        _id: 'process-123',
        tracerId: 'tracer-123',
        information: 'Process is running smoothly'
      };

      processNotifier.information(infoData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-information.${mockWorkspaceId}`,
        infoData
      );
    });

    test('should handle information without tracer ID', () => {
      const infoData = {
        _id: 'process-123',
        information: 'General information'
      };

      processNotifier.information(infoData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-information.${mockWorkspaceId}`,
        infoData
      );
    });
  });

  describe('persist method', () => {
    test('should send persist notification', () => {
      const persistData = {
        processId: 'process-123',
        componentId: 'comp-1',
        data: { persisted: 'data' }
      };

      processNotifier.persist(persistData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-persist.${mockWorkspaceId}`,
        persistData
      );
    });
  });

  describe('processCleaned method', () => {
    test('should send processCleaned notification', () => {
      const cleanedData = {
        processId: 'process-123',
        cleanedAt: new Date()
      };

      processNotifier.processCleaned(cleanedData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `workflow-processCleaned.${mockWorkspaceId}`,
        cleanedData
      );
    });
  });

  describe('AMQP Publishing', () => {
    test('should handle AMQP publish failures gracefully', async () => {
      mockAmqpClient.publish.mockRejectedValue(new Error('AMQP connection failed'));

      expect(() => {
        processNotifier.start({ _id: 'process-123' });
      }).not.toThrow();

      expect(mockAmqpClient.publish).toHaveBeenCalled();
    });

    test('should use correct routing keys for different notification types', () => {
      const processId = 'process-123';

      processNotifier.start({ _id: processId });
      processNotifier.progress({ processId });
      processNotifier.end({ processId });
      processNotifier.error({ processId });
      processNotifier.information({ _id: processId });
      processNotifier.persist({ processId });
      processNotifier.processCleaned({ processId });

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-start.${mockWorkspaceId}`,
        expect.any(Object)
      );
      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-progress.${mockWorkspaceId}`,
        expect.any(Object)
      );
      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-end.${mockWorkspaceId}`,
        expect.any(Object)
      );
      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-error.${mockWorkspaceId}`,
        expect.any(Object)
      );
      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-information.${mockWorkspaceId}`,
        expect.any(Object)
      );
      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-persist.${mockWorkspaceId}`,
        expect.any(Object)
      );
      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `workflow-processCleaned.${mockWorkspaceId}`,
        expect.any(Object)
      );
    });
  });

  describe('Data Serialization', () => {
    test('should handle complex objects in notifications', () => {
      const complexData = {
        processId: 'process-123',
        data: {
          nested: {
            array: [1, 2, 3],
            object: { key: 'value' },
            date: new Date(),
            null: null,
            undefined: undefined
          }
        }
      };

      processNotifier.progress(complexData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-progress.${mockWorkspaceId}`,
        complexData
      );
    });

    test('should handle circular references safely', () => {
      const circularData = {
        processId: 'process-123',
        data: {}
      };
      circularData.data.self = circularData.data;

      expect(() => {
        processNotifier.progress(circularData);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('should handle high frequency notifications', () => {
      const notifications = Array.from({ length: 100 }, (_, i) => ({
        processId: `process-${i}`,
        componentId: `comp-${i}`,
        status: 'processing'
      }));

      const startTime = Date.now();
      notifications.forEach(notification => {
        processNotifier.progress(notification);
      });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
      expect(mockAmqpClient.publish).toHaveBeenCalledTimes(100);
    });
  });

  describe('Private publish method', () => {
    test('should format routing key correctly', () => {
      const testData = { test: 'data' };
      
      // Test the publish method through a public method
      processNotifier.start(testData);
      
      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `process-start.${mockWorkspaceId}`,
        testData
      );
    });

    test('should handle publish promise resolution', async () => {
      const testData = { test: 'data' };
      mockAmqpClient.publish.mockResolvedValue(true);
      
      expect(() => {
        processNotifier.start(testData);
      }).not.toThrow();
    });

    test('should handle publish promise rejection', async () => {
      const testData = { test: 'data' };
      mockAmqpClient.publish.mockRejectedValue(new Error('Publish failed'));
      
      // Should not throw error, but should log it
      expect(() => {
        processNotifier.start(testData);
      }).not.toThrow();
    });
  });
});