// Configuration de setup pour les tests du module main

// Mock global pour les modules externes problématiques
jest.mock('express', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    listen: jest.fn(),
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }))
}));

// Configuration des timeouts
jest.setTimeout(10000);

// Supprimer les logs pendant les tests
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});
