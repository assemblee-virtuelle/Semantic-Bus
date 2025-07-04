// Mock de AWS SDK DynamoDB Document Client pour les tests
const mockDocClient = {
  send: jest.fn((command) => {
    // Mock response based on command type
    if (command.constructor.name === 'PutCommand') {
      return Promise.resolve({});
    }
    if (command.constructor.name === 'GetCommand') {
      return Promise.resolve({ Item: null });
    }
    if (command.constructor.name === 'UpdateCommand') {
      return Promise.resolve({});
    }
    if (command.constructor.name === 'QueryCommand') {
      return Promise.resolve({ Items: [] });
    }
    if (command.constructor.name === 'ScanCommand') {
      return Promise.resolve({ Items: [] });
    }
    if (command.constructor.name === 'DeleteCommand') {
      return Promise.resolve({});
    }
    return Promise.resolve({});
  })
};

module.exports = {
  DynamoDBDocumentClient: {
    from: jest.fn(() => mockDocClient)
  },
  
  // Commands
  PutCommand: class PutCommand {
    constructor(params) {
      this.params = params;
    }
  },
  
  GetCommand: class GetCommand {
    constructor(params) {
      this.params = params;
    }
  },
  
  UpdateCommand: class UpdateCommand {
    constructor(params) {
      this.params = params;
    }
  },
  
  QueryCommand: class QueryCommand {
    constructor(params) {
      this.params = params;
    }
  },
  
  ScanCommand: class ScanCommand {
    constructor(params) {
      this.params = params;
    }
  },
  
  DeleteCommand: class DeleteCommand {
    constructor(params) {
      this.params = params;
    }
  }
}; 