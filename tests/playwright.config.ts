import { defineConfig, devices } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:5000';

export default defineConfig({
  testDir: './e2e',
  timeout: 45 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  use: {
    baseURL: API_BASE_URL,
  },
  projects: [
    {
      name: 'API Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
