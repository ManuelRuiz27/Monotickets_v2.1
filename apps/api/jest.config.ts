import type { Config } from 'jest';

const config: Config = {
  rootDir: '.',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { useESM: true }]
  },
  moduleNameMapper: {
    '^(.*)\\.js$': '$1'
  },
  coverageDirectory: '../coverage',
  collectCoverageFrom: ['src/**/*.ts']
};

export default config;
