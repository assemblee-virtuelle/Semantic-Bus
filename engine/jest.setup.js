// Configuration de setup pour les tests du module engine

// Polyfills pour Node.js < 18
const { Readable } = require('stream');
const { ReadableStream } = require('stream/web') || { ReadableStream: Readable };
global.ReadableStream = ReadableStream;
global.WritableStream = global.WritableStream || class WritableStream {};
global.TransformStream = global.TransformStream || class TransformStream {};

// Mock global pour les modules externes problématiques
jest.mock('mongodb', () => ({
  MongoClient: {
    connect: jest.fn()
  }
}));

jest.mock('amqp-connection-manager', () => ({
  connect: jest.fn()
}));

// Mock Cassandra driver
jest.mock('cassandra-driver', () => ({
  Client: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    execute: jest.fn(),
    shutdown: jest.fn()
  })),
  types: {
    Uuid: {
      random: jest.fn(() => 'mock-uuid')
    }
  }
}));

// Mock UUID module
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-12345'),
  v1: jest.fn(() => 'mock-uuid-v1-12345')
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