/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line import/no-default-export
export default {
  verbose: true,
  preset: 'ts-jest',
  resolver: 'ts-jest-resolver',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  roots: ['<rootDir>/test'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  transform: {
    '^.+\\.ts?$': ['ts-jest', { useESM: true }],
  },
};
