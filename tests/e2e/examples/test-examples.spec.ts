/**
 * Playwright Test Examples
 *
 * Collection of common test patterns and best practices
 * Use these as templates for writing new tests
 */

import { test, expect } from '@playwright/test'

test.describe('Basic Test Patterns', () => {
  test('navigation test', async ({ page }) => {
    // Navigate to page
    await page.goto('/')

    // Click link
    await page.click('a:has-text("About")')

    // Verify URL changed
    await expect(page).toHaveURL('/about')
  })

  test('form submission test', async ({ page }) => {
    await page.goto('/contact')

    // Fill form
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.fill('textarea[name="message"]', 'Hello!')

    // Submit
    await page.click('button[type="submit"]')

    // Wait for success message
    await expect(page.locator('text=Thank you')).toBeVisible()
  })

  test('element visibility test', async ({ page }) => {
    await page.goto('/dashboard')

    // Check element is visible
    await expect(page.locator('h1')).toBeVisible()

    // Check element contains text
    await expect(page.locator('h1')).toContainText('Dashboard')

    // Check element is hidden
    await expect(page.locator('.loading')).not.toBeVisible()
  })

  test('waiting for network test', async ({ page }) => {
    await page.goto('/data')

    // Click button that triggers API call
    await page.click('button:has-text("Load Data")')

    // Wait for specific API response
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/data') && response.status() === 200
    )

    // Verify data loaded
    await expect(page.locator('[data-testid="data-list"]')).toBeVisible()
  })

  test('screenshot test', async ({ page }) => {
    await page.goto('/dashboard')

    // Take screenshot
    await page.screenshot({ path: 'test-results/dashboard.png' })

    // Screenshot specific element
    const header = page.locator('header')
    await header.screenshot({ path: 'test-results/header.png' })
  })
})

test.describe('Advanced Patterns', () => {
  test('multiple tabs test', async ({ context }) => {
    // Open first page
    const page1 = await context.newPage()
    await page1.goto('/page1')

    // Open second page
    const page2 = await context.newPage()
    await page2.goto('/page2')

    // Interact with both pages
    await page1.click('button')
    await page2.fill('input', 'test')

    // Close tabs
    await page1.close()
    await page2.close()
  })

  test('file upload test', async ({ page }) => {
    await page.goto('/upload')

    // Select file
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles('path/to/file.jpg')

    // Submit
    await page.click('button:has-text("Upload")')

    // Verify success
    await expect(page.locator('text=File uploaded')).toBeVisible()
  })

  test('download test', async ({ page }) => {
    await page.goto('/documents')

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download')
    await page.click('a:has-text("Download PDF")')

    // Wait for download to complete
    const download = await downloadPromise
    const path = await download.path()

    expect(path).toBeTruthy()
  })

  test('local storage test', async ({ page }) => {
    await page.goto('/')

    // Set local storage
    await page.evaluate(() => {
      localStorage.setItem('theme', 'dark')
    })

    // Get local storage
    const theme = await page.evaluate(() => localStorage.getItem('theme'))
    expect(theme).toBe('dark')
  })

  test('mock API test', async ({ page }) => {
    // Mock API response
    await page.route('**/api/users', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' },
        ]),
      })
    })

    await page.goto('/users')

    // Verify mocked data is displayed
    await expect(page.locator('text=John')).toBeVisible()
    await expect(page.locator('text=Jane')).toBeVisible()
  })
})

test.describe('Assertions Examples', () => {
  test('various assertions', async ({ page }) => {
    await page.goto('/dashboard')

    // Text assertions
    await expect(page.locator('h1')).toHaveText('Dashboard')
    await expect(page.locator('.subtitle')).toContainText('Welcome')

    // Visibility
    await expect(page.locator('.main-content')).toBeVisible()
    await expect(page.locator('.loading')).not.toBeVisible()

    // Attributes
    await expect(page.locator('button')).toHaveAttribute('type', 'submit')
    await expect(page.locator('input')).toHaveClass(/input-primary/)

    // Count
    await expect(page.locator('.card')).toHaveCount(3)

    // URL
    await expect(page).toHaveURL('/dashboard')
    await expect(page).toHaveURL(/dashboard/)
  })
})

test.describe('Data-driven Tests', () => {
  const testData = [
    { input: 'apple', expected: 'Apple' },
    { input: 'banana', expected: 'Banana' },
    { input: 'cherry', expected: 'Cherry' },
  ]

  for (const { input, expected } of testData) {
    test(`capitalize ${input}`, async ({ page }) => {
      await page.goto('/tools/capitalize')
      await page.fill('input[name="text"]', input)
      await page.click('button:has-text("Convert")')

      await expect(page.locator('.result')).toHaveText(expected)
    })
  }
})

test.describe('Error Handling', () => {
  test('handle 404 error', async ({ page }) => {
    const response = await page.goto('/nonexistent-page')

    expect(response?.status()).toBe(404)
    await expect(page.locator('text=Not Found')).toBeVisible()
  })

  test('handle network error gracefully', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true)

    await page.goto('/dashboard')

    // Should show offline message
    await expect(page.locator('text=No connection')).toBeVisible()

    // Go back online
    await page.context().setOffline(false)
  })
})

test.describe('Accessibility Tests', () => {
  test('keyboard navigation', async ({ page }) => {
    await page.goto('/form')

    // Navigate with Tab key
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Check focus
    const focusedElement = await page.evaluate(() =>
      document.activeElement?.getAttribute('name')
    )
    expect(focusedElement).toBe('email')
  })

  test('ARIA attributes', async ({ page }) => {
    await page.goto('/dashboard')

    // Check ARIA labels
    await expect(page.locator('button[aria-label="Close"]')).toBeVisible()

    // Check ARIA roles
    await expect(page.locator('[role="navigation"]')).toBeVisible()
  })
})

test.describe('Performance Tests', () => {
  test('page load time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    // Assert load time is reasonable
    expect(loadTime).toBeLessThan(5000) // 5 seconds
  })

  test('measure LCP (Largest Contentful Paint)', async ({ page }) => {
    await page.goto('/dashboard')

    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
            renderTime?: number
            loadTime?: number
          }
          resolve(lastEntry.renderTime || lastEntry.loadTime || 0)
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // Timeout after 10s
        setTimeout(() => resolve(0), 10000)
      })
    })

    // LCP should be under 2.5s for good performance
    expect(lcp).toBeGreaterThan(0)
    expect(lcp).toBeLessThan(2500)
  })
})

test.describe('Mobile Testing', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  })

  test('mobile responsive layout', async ({ page }) => {
    await page.goto('/dashboard')

    // Check mobile menu is visible
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()

    // Desktop navigation should be hidden
    await expect(page.locator('[data-testid="desktop-nav"]')).not.toBeVisible()
  })
})
