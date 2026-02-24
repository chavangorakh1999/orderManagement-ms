export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.js'],
  testMatch: ['**/__tests__/**/*.test.{js,jsx}'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!src/main.jsx'],
};
