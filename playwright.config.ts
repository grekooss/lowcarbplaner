import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.e2e file for E2E tests
dotenv.config({ path: path.resolve(__dirname, '.env.e2e') })

/**
 * Playwright E2E Test Configuration for LowCarbPlaner
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Run tests sequentially to avoid DB conflicts (Supabase)
  fullyParallel: false,

  // Fail CI build if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Single worker to ensure DB consistency
  workers: process.env.CI ? 1 : 1,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
  ],

  // Shared settings for all tests
  use: {
    // Base URL for navigation
    baseURL: 'http://localhost:3000',

    // Collect trace on first retry for debugging
    trace: 'on-first-retry',

    // Screenshots on failure
    screenshot: 'only-on-failure',

    // Video recording on failure
    video: 'retain-on-failure',

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors (for local dev)
    ignoreHTTPSErrors: true,

    // Default navigation timeout
    navigationTimeout: 30000,

    // Default action timeout
    actionTimeout: 10000,
  },

  // Run local dev server before tests
  webServer: {
    // Używamy dotenv-cli do załadowania .env.e2e PRZED startem Next.js
    command: 'npx dotenv-cli -e .env.e2e -- npm run dev',
    url: 'http://localhost:3000',
    timeout: 120 * 1000,
    // WAŻNE: Zawsze restartuj serwer aby załadować .env.e2e
    reuseExistingServer: false,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // Test projects for different browsers
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },

    // Tablet
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Global timeout for each test
  timeout: 60 * 1000,

  // Expect timeout for assertions
  expect: {
    timeout: 10000,
  },
})
