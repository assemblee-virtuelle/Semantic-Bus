module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.js'],
  collectCoverageFrom: [
    'lib/**/*.js',
    'models/**/*.js',
    'helpers/**/*.js',
    'dataTraitmentLibrary/**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@semantic-bus/core/(.*)$': '<rootDir>/$1',
    
    // Mock des dépendances externes d'infrastructure UNIQUEMENT
    
    // Bases de données (vraie infrastructure externe)
    '^mongoose$': '<rootDir>/__mocks__/mongoose.js',
    '^cassandra-driver$': '<rootDir>/__mocks__/cassandra-driver.js',
    
    // AWS SDK (infrastructure cloud externe)
    '^@aws-sdk/client-dynamodb$': '<rootDir>/__mocks__/@aws-sdk/client-dynamodb.js',
    '^@aws-sdk/lib-dynamodb$': '<rootDir>/__mocks__/@aws-sdk/lib-dynamodb.js',
    
    // Communication réseau (serveurs de mail)
    '^imap$': '<rootDir>/__mocks__/imap.js',
    '^node-imap$': '<rootDir>/__mocks__/node-imap.js',
    
    // OAuth (appels externes vers Google)
    '^passport$': '<rootDir>/__mocks__/passport.js',
    '^passport-google-oauth$': '<rootDir>/__mocks__/passport-google-oauth.js'
    
    // JWT et BCrypt SUPPRIMÉS - librairies purement computationnelles
  },
  testTimeout: 10000
}; 