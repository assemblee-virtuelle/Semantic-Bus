// Mock de Passport pour les tests
module.exports = {
  use: jest.fn((strategy) => {
    // Mock the use method to avoid "Authentication strategies must have a name" error
    return;
  }),
  
  authenticate: jest.fn((strategy, options) => {
    return (req, res, next) => {
      // Mock middleware that just calls next
      if (typeof options === 'function') {
        options(req, res, next);
      } else {
        next();
      }
    };
  }),
  
  initialize: jest.fn(() => {
    return (req, res, next) => next();
  }),
  
  session: jest.fn(() => {
    return (req, res, next) => next();
  })
}; 