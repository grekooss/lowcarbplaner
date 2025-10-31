import { test, expect } from '../fixtures/auth'
import { setupMealPlan } from '../fixtures/test-data'

test.describe('Performance Tests', () => {
  test('dashboard should load under 3 seconds', async ({
    authenticatedPage: page,
    testUser,
    supabaseClient,
  }) => {
    // Setup meal plan
    await setupMealPlan(supabaseClient, testUser.userId)

    // Measure load time
    const startTime = Date.now()

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Wait for critical content to be visible
    await page
      .locator('[data-testid="meal-card"]')
      .first()
      .waitFor({ state: 'visible' })

    const loadTime = Date.now() - startTime

    console.log(`Dashboard load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(3000) // 3 seconds max
  })

  test('macro recalculation should complete under 500ms', async ({
    authenticatedPage: page,
    testUser,
    supabaseClient,
  }) => {
    await setupMealPlan(supabaseClient, testUser.userId)

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Expand ingredients
    const mealCard = page.locator('[data-meal-type="breakfast"]')
    const expandButton = mealCard.locator('button:has-text("Składniki")')

    if (await expandButton.isVisible()) {
      await expandButton.click()

      const editButton = mealCard.locator('button[aria-label="Edytuj"]').first()
      if (await editButton.isVisible()) {
        await editButton.click()

        const quantityInput = mealCard.locator('input[type="number"]').first()
        await quantityInput.fill('200')

        // Measure macro recalculation time
        const startTime = Date.now()

        const saveButton = mealCard.locator('button:has-text("Zapisz")').first()
        await saveButton.click()

        // Wait for macro update
        await page.waitForResponse((response) =>
          response.url().includes('/api/planned-meals')
        )

        const recalcTime = Date.now() - startTime

        console.log(`Macro recalculation time: ${recalcTime}ms`)
        expect(recalcTime).toBeLessThan(500) // 500ms max
      }
    }
  })

  test('recipe swap should complete under 2 seconds', async ({
    authenticatedPage: page,
    testUser,
    supabaseClient,
  }) => {
    await setupMealPlan(supabaseClient, testUser.userId)

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const swapButton = page.locator('button:has-text("Zamień")').first()

    if (await swapButton.isVisible()) {
      await swapButton.click()

      // Wait for modal
      await page
        .locator('[data-testid="replacement-card"]')
        .first()
        .waitFor({ state: 'visible' })

      // Measure swap time
      const startTime = Date.now()

      const replacementCard = page
        .locator('[data-testid="replacement-card"]')
        .first()
      await replacementCard.click()

      // Wait for swap to complete
      await page.waitForResponse(
        (response) =>
          response.url().includes('/api/planned-meals') &&
          response.status() === 200
      )

      const swapTime = Date.now() - startTime

      console.log(`Recipe swap time: ${swapTime}ms`)
      expect(swapTime).toBeLessThan(2000) // 2 seconds max
    }
  })

  test('initial page load should have good Core Web Vitals', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Measure performance metrics
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')

      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: paint.find((p) => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint:
          paint.find((p) => p.name === 'first-contentful-paint')?.startTime ||
          0,
      }
    })

    console.log('Performance metrics:', metrics)

    // Core Web Vitals thresholds
    expect(metrics.firstContentfulPaint).toBeLessThan(1800) // FCP < 1.8s (good)
    expect(metrics.domContentLoaded).toBeLessThan(1500) // DOM load < 1.5s
  })

  test('recipe list should scroll smoothly with many items', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/recipes')
    await page.waitForLoadState('networkidle')

    // Wait for recipes to load
    const recipeCards = page.locator(
      '[data-testid="recipe-card"], .recipe-card'
    )
    const count = await recipeCards.count()

    if (count > 10) {
      // Measure scroll performance
      const startTime = Date.now()

      // Scroll to bottom
      await page.evaluate(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      })

      // Wait for scroll to complete
      await page.waitForTimeout(1000)

      // Scroll back to top
      await page.evaluate(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })

      await page.waitForTimeout(1000)

      const scrollTime = Date.now() - startTime

      console.log(`Scroll time: ${scrollTime}ms`)
      expect(scrollTime).toBeLessThan(3000) // Smooth scroll under 3s
    } else {
      test.skip()
    }
  })

  test('bundle size should be reasonable', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Measure transferred resources
    const resources = await page.evaluate(() => {
      return performance
        .getEntriesByType('resource')
        .filter((r) => r.name.includes('.js'))
        .reduce(
          (total, r: PerformanceResourceTiming) => total + r.transferSize,
          0
        )
    })

    const bundleSizeKB = resources / 1024

    console.log(`JavaScript bundle size: ${bundleSizeKB.toFixed(2)} KB`)

    // Reasonable threshold for Next.js app
    expect(bundleSizeKB).toBeLessThan(500) // 500 KB max initial JS
  })

  test('image loading should be optimized', async ({ page }) => {
    await page.goto('/recipes')
    await page.waitForLoadState('networkidle')

    // Check for lazy loading
    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map((img) => ({
        loading: img.loading,
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      }))
    })

    if (images.length > 0) {
      // At least some images should use lazy loading
      const lazyImages = images.filter((img) => img.loading === 'lazy')
      expect(lazyImages.length).toBeGreaterThan(0)

      console.log(
        `${lazyImages.length}/${images.length} images use lazy loading`
      )
    }
  })

  test('API requests should be minimal', async ({
    authenticatedPage: page,
    testUser,
    supabaseClient,
  }) => {
    await setupMealPlan(supabaseClient, testUser.userId)

    // Track API requests
    const apiRequests: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url())
      }
    })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    console.log(`API requests made: ${apiRequests.length}`)
    console.log('Requests:', apiRequests)

    // Reasonable number of API calls for dashboard load
    expect(apiRequests.length).toBeLessThan(10) // Max 10 API calls
  })

  test('memory usage should be reasonable', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Get memory usage
    const memoryUsage = await page.evaluate(() => {
      if ('memory' in performance) {
        const mem = (
          performance as {
            memory: {
              usedJSHeapSize: number
              totalJSHeapSize: number
              jsHeapSizeLimit: number
            }
          }
        ).memory
        return {
          usedJSHeapSize: mem.usedJSHeapSize / 1024 / 1024, // MB
          totalJSHeapSize: mem.totalJSHeapSize / 1024 / 1024, // MB
          jsHeapSizeLimit: mem.jsHeapSizeLimit / 1024 / 1024, // MB
        }
      }
      return null
    })

    if (memoryUsage) {
      console.log('Memory usage:', memoryUsage)

      // Reasonable memory limits
      expect(memoryUsage.usedJSHeapSize).toBeLessThan(100) // <100 MB heap
    }
  })
})
