module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/backend/**/*.ts',
    'src/shared/**/*.ts',
    '!src/backend/**/*.d.ts',
    '!src/shared/**/*.d.ts'
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\.ts$': 'ts-jest'
  }
};
