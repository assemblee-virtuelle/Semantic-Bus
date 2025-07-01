// Mock pour core/db/scylla_client.js
const mockClient = {
  connect: jest.fn().mockResolvedValue(),
  execute: jest.fn().mockResolvedValue({
    rows: [],
    info: {}
  }),
  shutdown: jest.fn().mockResolvedValue(),
  batch: jest.fn().mockResolvedValue()
};

// Mock de l'objet client Cassandra
module.exports = mockClient;