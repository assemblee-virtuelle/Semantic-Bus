module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.js'],
  collectCoverageFrom: [
    'utils/**/*.js',
    'services/**/*.js',
    'workspaceComponentExecutor/**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  moduleDirectories: [
    'node_modules',
    '<rootDir>/node_modules',
    '<rootDir>/../core/node_modules'
  ],
  testTimeout: 10000,
  passWithNoTests: true
}; 