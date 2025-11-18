import { beforeAll, afterAll, afterEach } from 'vitest';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
});

afterEach(() => {
  // Clean up any test data if needed
});

afterAll(async () => {
  // Close any open connections
});
