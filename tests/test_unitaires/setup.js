// Configuration de test pour Semantic Bus
const path = require('path');
const fs = require('fs');

// Mock de la configuration pour les tests
const mockConfig = {
  mongoUrl: 'mongodb://localhost:27017/semanticbus_test',
  amqpHost: 'amqp://localhost',
  socketServer: 'amqp://localhost',
  privateScript: [],
  free: true,
  quietLog: true,
  test: true
};

// Créer le fichier configuration.js pour les tests
const configPath = path.join(__dirname, '../../engine/configuration.js');
const configContent = 'module.exports = ' + JSON.stringify(mockConfig, null, 2);

// Créer le fichier seulement s'il n'existe pas déjà ou si nous sommes en mode test
if (!fs.existsSync(configPath) || process.env.NODE_ENV === 'test') {
  fs.writeFileSync(configPath, configContent);
}

// Timeout pour les tests
if (typeof jest !== 'undefined') {
  jest.setTimeout(30000);
}

// Variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.APP_PORT = '3001';