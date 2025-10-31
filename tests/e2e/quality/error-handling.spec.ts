import { test, expect } from '../fixtures/auth'

test.describe('Error Handling', () => {
  test('should handle API timeout gracefully', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Simulate slow network by throttling
    const client = await page.context().newCDPSession(page)
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (50 * 1024) / 8, // 50kb/s
      uploadThroughput: (50 * 1024) / 8,
      latency: 3000, // 3s latency
    })

    // Try to perform action that requires API call
    const swapButton = page.locator('button:has-text("Zamień")').first()
    if (await swapButton.isVisible()) {
      await swapButton.click()

      // Should either show loading state or timeout error
      const loadingOrError = page.locator(
        'text=/ładowanie|loading|timeout|błąd|error/i'
      )
      await expect(loadingOrError).toBeVisible({ timeout: 15000 })
    }

    // Cleanup
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    })
  })

  test('should show error message on failed save', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Intercept API request and force failure
    await page.route('**/api/planned-meals*', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    })

    // Try to edit ingredient
    const mealCard = page.locator('[data-meal-type="breakfast"]')
    if (await mealCard.isVisible()) {
      // Expand ingredients
      const expandButton = mealCard.locator('button:has-text("Składniki")')
      if (await expandButton.isVisible()) {
        await expandButton.click()

        // Edit ingredient
        const editButton = mealCard
          .locator('button[aria-label="Edytuj"]')
          .first()
        if (await editButton.isVisible()) {
          await editButton.click()

          const quantityInput = mealCard.locator('input[type="number"]').first()
          await quantityInput.fill('999')

          const saveButton = mealCard
            .locator('button:has-text("Zapisz")')
            .first()
          await saveButton.click()

          // Should show error message
          await expect(
            page.locator('text=/błąd|error|nie udało/i')
          ).toBeVisible({ timeout: 10000 })
        }
      }
    }
  })

  test('should retry on network error', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    let requestCount = 0

    // Intercept and fail first request, succeed on retry
    await page.route('**/api/planned-meals*', (route) => {
      requestCount++
      if (requestCount === 1) {
        // Fail first attempt
        route.abort('failed')
      } else {
        // Succeed on retry
        route.continue()
      }
    })

    // Try to perform action
    const mealCard = page.locator('[data-meal-type="breakfast"]')
    if (await mealCard.isVisible()) {
      const expandButton = mealCard.locator('button:has-text("Składniki")')
      if (await expandButton.isVisible()) {
        await expandButton.click()

        const editButton = mealCard
          .locator('button[aria-label="Edytuj"]')
          .first()
        if (await editButton.isVisible()) {
          await editButton.click()

          const quantityInput = mealCard.locator('input[type="number"]').first()
          await quantityInput.fill('150')

          const saveButton = mealCard
            .locator('button:has-text("Zapisz")')
            .first()
          await saveButton.click()

          // Should eventually succeed (after retry)
          await page.waitForLoadState('networkidle')

          // Check that multiple requests were made
          expect(requestCount).toBeGreaterThan(1)
        }
      }
    }
  })

  test('should handle offline mode', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Go offline
    await page.context().setOffline(true)

    // Try to navigate
    await page.goto('/recipes')

    // Should show offline message
    await expect(
      page.locator('text=/offline|brak połączenia|no connection/i')
    ).toBeVisible({ timeout: 10000 })

    // Go back online
    await page.context().setOffline(false)
  })

  test('should handle invalid form data', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')

    // Find form inputs
    const weightInput = page.locator(
      'input[name="weight_kg"], input[name="weight"]'
    )

    if (await weightInput.isVisible()) {
      // Enter invalid data (string instead of number)
      await weightInput.fill('abc')

      const saveButton = page.locator('button[type="submit"]').first()
      await saveButton.click()

      // Should show validation error
      await expect(
        page.locator('text=/nieprawidłow|invalid|number|liczb/i')
      ).toBeVisible({ timeout: 5000 })
    }
  })

  test('should handle database constraint violations', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Intercept and return constraint violation error
    await page.route('**/api/**', (route) => {
      if (
        route.request().method() === 'POST' ||
        route.request().method() === 'PUT'
      ) {
        route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Constraint violation' }),
        })
      } else {
        route.continue()
      }
    })

    // Try to perform action that requires POST/PUT
    const swapButton = page.locator('button:has-text("Zamień")').first()
    if (await swapButton.isVisible()) {
      await swapButton.click()

      // Select replacement
      const replacementCard = page
        .locator('[data-testid="replacement-card"]')
        .first()
      if (await replacementCard.isVisible()) {
        await replacementCard.click()

        // Should show error
        await expect(page.locator('text=/błąd|error|conflict/i')).toBeVisible({
          timeout: 10000,
        })
      }
    }
  })

  test('should handle session expiration', async ({ page }) => {
    // Navigate to protected page without authentication
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Should redirect to auth page
    await expect(page).toHaveURL('/auth', { timeout: 10000 })
  })
})
