import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default defineConfig({
  testDir: './tests/ui',
  outputDir: './test-results/ui',
  timeout: 30000,
  retries: process.env.CI ? 2 : 1,
  fullyParallel: true,
  workers: process.env.CI ? 1 : 4,
  
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

  reporter: [
    ['html', { outputFolder: 'playwright-report/ui' }],
    ['json', { outputFile: 'test-results/ui/results.json' }],
    ['junit', { outputFile: 'test-results/ui/junit.xml' }],
    ['line'],
  ],
});