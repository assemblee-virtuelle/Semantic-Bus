// Mock de Cassandra Driver pour les tests
const cassandra = {
  Client: class MockClient {
    constructor(options) {
      this.options = options;
    }
    
    connect() {
      return Promise.resolve();
    }
    
    shutdown() {
      return Promise.resolve();
    }
    
    execute(query, params) {
      return Promise.resolve({
        rows: [],
        rowLength: 0
      });
    }
  },
  
  types: {
    distance: {
      local: 'local',
      remote: 'remote'
    }
  },
  
  auth: {
    PlainTextAuthProvider: class PlainTextAuthProvider {
      constructor(username, password) {
        this.username = username;
        this.password = password;
      }
    }
  },
  
  policies: {
    loadBalancing: {
      RoundRobinPolicy: class RoundRobinPolicy {}
    }
  }
};

module.exports = cassandra; 