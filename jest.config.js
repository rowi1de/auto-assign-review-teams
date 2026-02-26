module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.claude/'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true
}
