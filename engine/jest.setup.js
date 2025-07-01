// Configuration globale pour les tests Jest

// Mock du fichier de configuration par défaut
jest.mock('./config.json', () => ({
  quietLog: true,
  database: {
    type: 'mock'
  }
}), { virtual: true });

// Mock global pour les modules externes problématiques
jest.mock('mongodb', () => ({
  MongoClient: {
    connect: jest.fn()
  }
}));

jest.mock('amqp-connection-manager', () => ({
  connect: jest.fn()
}));

// Mock des modules core manquants
jest.mock('../core/lib/file_lib_scylla.js', () => ({
  create: jest.fn(),
  get: jest.fn()
}), { virtual: true });

jest.mock('../core/dataTraitmentLibrary/file_convertor.js', () => ({
  data_from_file: jest.fn()
}), { virtual: true });

jest.mock('../core/model_schemas/file_schema_scylla.js', () => {
  return jest.fn().mockImplementation((data) => ({
    id: 'mock-file-id',
    ...data
  }));
}, { virtual: true });

jest.mock('../core/lib/fragment_lib_scylla.js', () => ({
  // Mock des fonctions nécessaires
}), { virtual: true });

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