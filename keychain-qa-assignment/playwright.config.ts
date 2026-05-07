import { defineConfig, devices } from '@playwright/test';
import { ENV } from './src/core/env.config';

/**
 * Playwright configuration for Conduit test suite.
 * 
 * Configured for both API and UI testing with domain-driven structure.
 * Uses custom fixtures for authentication and test data management.
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],

  use: {
    baseURL: ENV.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
  },

  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: undefined,
});
