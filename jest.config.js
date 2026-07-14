module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.claude/'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {tsconfig: 'tsconfig.test.json'}]
  },
  moduleNameMapper: {
    '^@actions/core$': '<rootDir>/__mocks__/@actions/core.ts',
    '^@actions/github$': '<rootDir>/__mocks__/@actions/github.ts'
  },
  verbose: true
}
