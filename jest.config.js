const { config } = require('dotenv');
config();
const environment = process.env.NODE_ENV || 'development';

module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'cobertura'],
};
