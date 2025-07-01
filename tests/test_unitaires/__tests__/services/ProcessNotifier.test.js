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
        `workspace.${mockWorkspaceId}.process.start`,
        expect.objectContaining({
          processId: processData._id,
          callerId: processData.callerId,
          tracerId: processData.tracerId,
          timeStamp: processData.timeStamp,
          steps: processData.steps
        })
      );
    });

    test('should handle minimal process data', () => {
      const processData = {
        _id: 'process-123'
      };

      processNotifier.start(processData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `workspace.${mockWorkspaceId}.process.start`,
        expect.objectContaining({
          processId: processData._id
        })
      );
    });

    test('should handle missing process data', () => {
      expect(() => {
        processNotifier.start();
      }).not.toThrow();

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `workspace.${mockWorkspaceId}.process.start`,
        expect.any(Object)
      );
    });
  });

  describe('update method', () => {
    test('should send update notification with process updates', () => {
      const updateData = {
        processId: 'process-123',
        componentId: 'comp-1',
        status: 'completed',
        data: { result: 'success' },
        error: null
      };

      processNotifier.update(updateData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `workspace.${mockWorkspaceId}.process.update`,
        expect.objectContaining({
          processId: updateData.processId,
          componentId: updateData.componentId,
          status: updateData.status,
          data: updateData.data,
          error: updateData.error
        })
      );
    });

    test('should handle error in update', () => {
      const updateData = {
        processId: 'process-123',
        componentId: 'comp-1',
        status: 'error',
        error: new Error('Processing failed')
      };

      processNotifier.update(updateData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `workspace.${mockWorkspaceId}.process.update`,
        expect.objectContaining({
          processId: updateData.processId,
          componentId: updateData.componentId,
          status: updateData.status,
          error: expect.any(Error)
        })
      );
    });
  });

  describe('complete method', () => {
    test('should send completion notification', () => {
      const completionData = {
        processId: 'process-123',
        result: { final: 'result' },
        duration: 1500,
        componentsProcessed: 5
      };

      processNotifier.complete(completionData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `workspace.${mockWorkspaceId}.process.complete`,
        expect.objectContaining({
          processId: completionData.processId,
          result: completionData.result,
          duration: completionData.duration,
          componentsProcessed: completionData.componentsProcessed
        })
      );
    });

    test('should handle completion without result data', () => {
      const completionData = {
        processId: 'process-123'
      };

      processNotifier.complete(completionData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `workspace.${mockWorkspaceId}.process.complete`,
        expect.objectContaining({
          processId: completionData.processId
        })
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
        `workspace.${mockWorkspaceId}.process.error`,
        expect.objectContaining({
          processId: errorData.processId,
          componentId: errorData.componentId,
          error: expect.any(Error),
          stack: errorData.stack
        })
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
        `workspace.${mockWorkspaceId}.process.error`,
        expect.objectContaining({
          processId: errorData.processId,
          error: errorData.error
        })
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
        `workspace.${mockWorkspaceId}.process.information`,
        expect.objectContaining({
          processId: infoData._id,
          tracerId: infoData.tracerId,
          information: infoData.information
        })
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
        `workspace.${mockWorkspaceId}.process.information`,
        expect.objectContaining({
          processId: infoData._id,
          information: infoData.information
        })
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
      processNotifier.update({ processId });
      processNotifier.complete({ processId });
      processNotifier.error({ processId });
      processNotifier.information({ _id: processId });

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `workspace.${mockWorkspaceId}.process.start`,
        expect.any(Object)
      );
      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `workspace.${mockWorkspaceId}.process.update`,
        expect.any(Object)
      );
      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `workspace.${mockWorkspaceId}.process.complete`,
        expect.any(Object)
      );
      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `workspace.${mockWorkspaceId}.process.error`,
        expect.any(Object)
      );
      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `workspace.${mockWorkspaceId}.process.information`,
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

      processNotifier.update(complexData);

      expect(mockAmqpClient.publish).toHaveBeenCalledWith(
        'amq.topic',
        `workspace.${mockWorkspaceId}.process.update`,
        expect.objectContaining({
          processId: complexData.processId,
          data: expect.any(Object)
        })
      );
    });

    test('should handle circular references safely', () => {
      const circularData = {
        processId: 'process-123',
        data: {}
      };
      circularData.data.self = circularData.data;

      expect(() => {
        processNotifier.update(circularData);
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
        processNotifier.update(notification);
      });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
      expect(mockAmqpClient.publish).toHaveBeenCalledTimes(100);
    });
  });
});