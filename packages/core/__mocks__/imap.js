// Mock de IMAP pour les tests
const EventEmitter = require('events');

class MockImap extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
  }
  
  connect() {
    setTimeout(() => this.emit('ready'), 10);
  }
  
  end() {
    setTimeout(() => this.emit('end'), 10);
  }
  
  openBox(name, openReadOnly, callback) {
    if (typeof openReadOnly === 'function') {
      callback = openReadOnly;
      openReadOnly = false;
    }
    setTimeout(() => callback(null, { name }), 10);
  }
  
  search(criteria, callback) {
    setTimeout(() => callback(null, []), 10);
  }
  
  fetch(messages, options) {
    const mockFetch = new EventEmitter();
    setTimeout(() => {
      mockFetch.emit('end');
    }, 10);
    return mockFetch;
  }
}

module.exports = MockImap; 