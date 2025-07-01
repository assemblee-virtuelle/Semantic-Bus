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
    '^@/(.*)$': '<rootDir>/$1'
  },
  testTimeout: 10000
}; 