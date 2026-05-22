import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Next.js 가 .env / tsconfig paths / next/babel 등을 자동 적용
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/.vercel/',
    '/public/',
  ],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    '!components/ui/**',
    '!**/*.test.{ts,tsx}',
    '!**/__tests__/**',
  ],
};

export default createJestConfig(config);
