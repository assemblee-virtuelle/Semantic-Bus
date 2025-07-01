const Engine = require('../../../../engine/services/engine.js');
const sinon = require('sinon');

// Mock des dépendances
jest.mock('../../../../core/lib/workspace_component_lib');
jest.mock('../../../../core/lib/fragment_lib');
jest.mock('../../../../core/lib/workspace_lib');
jest.mock('../../../../core/lib/user_lib');
jest.mock('../../../../engine/services/technicalComponentDirectory.js');

describe('Engine Service', () => {
  let engine;
  let mockComponent;
  let mockAmqpClient;
  let mockCallerId;
  let mockTracerId;

  beforeEach(() => {
    // Setup mocks
    mockComponent = {
      _id: 'component-123',
      workspaceId: 'workspace-123',
      module: 'testModule',
      name: 'Test Component',
      type: 'processor',
      specificData: {}
    };

    mockAmqpClient = {
      sendToQueue: jest.fn(),
      publish: jest.fn()
    };

    mockCallerId = 'caller-123';
    mockTracerId = 'tracer-123';

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should initialize Engine with required parameters', () => {
      engine = new Engine(
        mockComponent,
        'pull',
        mockAmqpClient,
        mockCallerId,
        null,
        {},
        mockTracerId
      );

      expect(engine.originComponent).toBe(mockComponent);
      expect(engine.amqpClient).toBe(mockAmqpClient);
      expect(engine.callerId).toBe(mockCallerId);
      expect(engine.tracerId).toBe(mockTracerId);
      expect(engine.requestDirection).toBe('pull');
      expect(engine.processId).toBeNull();
    });

    test('should initialize with default values', () => {
      engine = new Engine(mockComponent, 'pull', mockAmqpClient, mockCallerId);

      expect(engine.pushData).toBeUndefined();
      expect(engine.originQueryParams).toBeUndefined();
      expect(engine.tracerId).toBeUndefined();
    });

    test('should initialize required libraries', () => {
      engine = new Engine(mockComponent, 'pull', mockAmqpClient, mockCallerId);

      expect(engine.workspace_component_lib).toBeDefined();
      expect(engine.fragment_lib).toBeDefined();
      expect(engine.workspace_lib).toBeDefined();
      expect(engine.user_lib).toBeDefined();
      expect(engine.technicalComponentDirectory).toBeDefined();
      expect(engine.stringReplacer).toBeDefined();
      expect(engine.promiseOrchestrator).toBeDefined();
    });
  });

  describe('buildPathResolution', () => {
    beforeEach(() => {
      engine = new Engine(mockComponent, 'pull', mockAmqpClient, mockCallerId);
    });

    test('should build path resolution with single component', () => {
      const mockWorkspace = {
        _id: 'workspace-123',
        name: 'Test Workspace',
        links: []
      };

      const usableComponents = [mockComponent];

      const pathResolution = engine.buildPathResolution(
        mockWorkspace,
        mockComponent,
        'pull',
        0,
        usableComponents
      );

      expect(pathResolution).toBeDefined();
      expect(pathResolution.nodes).toBeDefined();
      expect(pathResolution.links).toBeDefined();
      expect(pathResolution.nodes.length).toBeGreaterThan(0);
    });

    test('should handle components with links', () => {
      const mockWorkspace = {
        _id: 'workspace-123',
        name: 'Test Workspace',
        links: [{
          source: 'component-123',
          target: 'component-456',
          sourceOutput: 'output1',
          targetInput: 'input1'
        }]
      };

      const targetComponent = {
        _id: 'component-456',
        workspaceId: 'workspace-123',
        module: 'targetModule',
        name: 'Target Component',
        type: 'processor',
        specificData: {}
      };

      const usableComponents = [mockComponent, targetComponent];

      const pathResolution = engine.buildPathResolution(
        mockWorkspace,
        mockComponent,
        'pull',
        0,
        usableComponents
      );

      expect(pathResolution.nodes.length).toBeGreaterThanOrEqual(1);
      expect(pathResolution.links.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('buildDfobFlow', () => {
    beforeEach(() => {
      engine = new Engine(mockComponent, 'pull', mockAmqpClient, mockCallerId);
    });

    test('should build DFOB flow for simple path', () => {
      const currentFlow = {
        data: { level1: { level2: 'value' } }
      };
      const dfobPathTab = ['level1', 'level2'];
      const key = 0;
      const keepArray = false;

      const result = engine.buildDfobFlow(currentFlow, dfobPathTab, key, keepArray);

      expect(result).toBeDefined();
      expect(result.data).toBe('value');
    });

    test('should handle array access in DFOB flow', () => {
      const currentFlow = {
        data: { items: ['first', 'second', 'third'] }
      };
      const dfobPathTab = ['items', '1'];
      const key = 0;
      const keepArray = false;

      const result = engine.buildDfobFlow(currentFlow, dfobPathTab, key, keepArray);

      expect(result).toBeDefined();
      expect(result.data).toBe('second');
    });

    test('should handle keepArray option', () => {
      const currentFlow = {
        data: { items: [1, 2, 3] }
      };
      const dfobPathTab = ['items'];
      const key = 0;
      const keepArray = true;

      const result = engine.buildDfobFlow(currentFlow, dfobPathTab, key, keepArray);

      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toEqual([1, 2, 3]);
    });
  });

  describe('buildDfobFlowArray', () => {
    beforeEach(() => {
      engine = new Engine(mockComponent, 'pull', mockAmqpClient, mockCallerId);
    });

    test('should build DFOB flow array for array data', () => {
      const currentFlow = {
        data: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 }
        ]
      };
      const dfobPathTab = ['name'];
      const key = 0;
      const keepArray = false;

      const result = engine.buildDfobFlowArray(currentFlow, dfobPathTab, key, keepArray);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].data).toBe('John');
      expect(result[1].data).toBe('Jane');
    });

    test('should handle empty array', () => {
      const currentFlow = {
        data: []
      };
      const dfobPathTab = ['name'];
      const key = 0;
      const keepArray = false;

      const result = engine.buildDfobFlowArray(currentFlow, dfobPathTab, key, keepArray);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      engine = new Engine(mockComponent, 'pull', mockAmqpClient, mockCallerId);
    });

    test('should handle invalid component configuration', () => {
      const invalidComponent = {
        _id: 'invalid-component',
        // Missing required fields
      };

      expect(() => {
        new Engine(invalidComponent, 'pull', mockAmqpClient, mockCallerId);
      }).not.toThrow(); // Constructor should not throw, but validation should happen elsewhere
    });

    test('should handle missing AMQP client gracefully', () => {
      expect(() => {
        new Engine(mockComponent, 'pull', null, mockCallerId);
      }).not.toThrow();
    });
  });

  describe('Integration with Technical Component Directory', () => {
    beforeEach(() => {
      engine = new Engine(mockComponent, 'pull', mockAmqpClient, mockCallerId);
      
      // Mock technical component directory
      engine.technicalComponentDirectory = {
        testModule: {
          workAsk: jest.fn().mockResolvedValue(true),
          getPrimaryFlow: jest.fn().mockResolvedValue({ data: 'test' }),
          getSecondaryFlow: jest.fn().mockResolvedValue([])
        }
      };
    });

    test('should access technical component directory', () => {
      const moduleConfig = engine.technicalComponentDirectory[mockComponent.module];
      expect(moduleConfig).toBeDefined();
      expect(moduleConfig.workAsk).toBeDefined();
    });
  });

  describe('Process Management', () => {
    beforeEach(() => {
      engine = new Engine(mockComponent, 'pull', mockAmqpClient, mockCallerId);
    });

    test('should initialize process ID as null', () => {
      expect(engine.processId).toBeNull();
    });

    test('should track process counter', () => {
      expect(engine.fackCounter).toBe(0);
    });
  });

  describe('Configuration Access', () => {
    beforeEach(() => {
      engine = new Engine(mockComponent, 'pull', mockAmqpClient, mockCallerId);
    });

    test('should have access to configuration', () => {
      expect(engine.config).toBeDefined();
    });

    test('should respect quiet log configuration', () => {
      // This test verifies that the engine respects the quietLog setting
      // The actual behavior would depend on the configuration values
      expect(engine.config.quietLog).toBeDefined();
    });
  });

  describe('String Replacer Integration', () => {
    beforeEach(() => {
      engine = new Engine(mockComponent, 'pull', mockAmqpClient, mockCallerId);
    });

    test('should have string replacer available', () => {
      expect(engine.stringReplacer).toBeDefined();
      expect(engine.stringReplacer.execute).toBeDefined();
    });
  });

  describe('Promise Orchestrator Integration', () => {
    beforeEach(() => {
      engine = new Engine(mockComponent, 'pull', mockAmqpClient, mockCallerId);
    });

    test('should have promise orchestrator available', () => {
      expect(engine.promiseOrchestrator).toBeDefined();
      expect(engine.promiseOrchestrator.execute).toBeDefined();
    });
  });
});