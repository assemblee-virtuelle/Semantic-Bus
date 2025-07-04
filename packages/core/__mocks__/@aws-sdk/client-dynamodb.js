// Mock de AWS SDK DynamoDB Client pour les tests
const mockClient = {
  send: jest.fn((command) => {
    // Mock response based on command type
    if (command.constructor.name === 'ListTablesCommand') {
      return Promise.resolve({ TableNames: ['mock-table'] });
    }
    if (command.constructor.name === 'DescribeTableCommand') {
      return Promise.resolve({
        Table: {
          TableName: 'mock-table',
          AttributeDefinitions: [],
          KeySchema: [],
          GlobalSecondaryIndexes: []
        }
      });
    }
    if (command.constructor.name === 'CreateTableCommand') {
      return Promise.resolve({});
    }
    if (command.constructor.name === 'DeleteTableCommand') {
      return Promise.resolve({});
    }
    if (command.constructor.name === 'ScanCommand') {
      return Promise.resolve({ Items: [] });
    }
    if (command.constructor.name === 'PutItemCommand') {
      return Promise.resolve({});
    }
    return Promise.resolve({});
  })
};

module.exports = {
  DynamoDBClient: jest.fn(() => mockClient),
  
  // Commands
  ListTablesCommand: class ListTablesCommand {
    constructor(params) {
      this.params = params;
    }
  },
  
  DescribeTableCommand: class DescribeTableCommand {
    constructor(params) {
      this.params = params;
    }
  },
  
  CreateTableCommand: class CreateTableCommand {
    constructor(params) {
      this.params = params;
    }
  },
  
  DeleteTableCommand: class DeleteTableCommand {
    constructor(params) {
      this.params = params;
    }
  },
  
  ScanCommand: class ScanCommand {
    constructor(params) {
      this.params = params;
    }
  },
  
  PutItemCommand: class PutItemCommand {
    constructor(params) {
      this.params = params;
    }
  },
  
  UpdateTableCommand: class UpdateTableCommand {
    constructor(params) {
      this.params = params;
    }
  }
}; 