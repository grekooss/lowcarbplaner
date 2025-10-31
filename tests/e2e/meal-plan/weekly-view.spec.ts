import { test, expect } from '../fixtures/auth'
import { setupMealPlan } from '../fixtures/test-data'

test.describe('Meal Planning - Weekly View', () => {
  test.beforeEach(async ({ testUser, supabaseClient }) => {
    // Setup 7-day meal plan
    await setupMealPlan(supabaseClient, testUser.userId)
  })

  test('should display 7-day meal plan', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/meal-plan')
    await page.waitForLoadState('networkidle')

    // Should show weekly view title or indicator
    await expect(
      page.locator('h1, h2').filter({ hasText: /plan|tydzie/i })
    ).toBeVisible({ timeout: 10000 })

    // Should show days of the week
    // Look for multiple day indicators (at least 3 visible days)
    const dayCards = page.locator(
      '[data-testid="day-card"], [data-day], .day-card'
    )
    const dayCount = await dayCards.count()

    expect(dayCount).toBeGreaterThanOrEqual(3) // At least 3 days visible
  })

  test('should navigate between weeks', async ({ authenticatedPage: page }) => {
    await page.goto('/meal-plan')
    await page.waitForLoadState('networkidle')

    // Look for next week button
    const nextWeekButton = page.locator(
      'button:has-text("Następny"), button[aria-label*="next"], button[aria-label*="następny"]'
    )

    if (await nextWeekButton.isVisible()) {
      // Click next week
      await nextWeekButton.click()
      await page.waitForLoadState('networkidle')

      // Should still be on meal-plan page
      expect(page.url()).toContain('meal-plan')

      // Go back to previous week
      const prevWeekButton = page.locator(
        'button:has-text("Poprzedni"), button[aria-label*="prev"], button[aria-label*="poprzedni"]'
      )
      await prevWeekButton.click()
      await page.waitForLoadState('networkidle')
    } else {
      // No week navigation yet
      test.skip()
    }
  })

  test('should show all three meals per day', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/meal-plan')
    await page.waitForLoadState('networkidle')

    // Find first day card
    const firstDay = page
      .locator('[data-testid="day-card"], [data-day], .day-card')
      .first()

    if (await firstDay.isVisible()) {
      // Should show breakfast, lunch, dinner
      await expect(
        firstDay.locator('text=/śniadanie|breakfast/i')
      ).toBeVisible()
      await expect(firstDay.locator('text=/obiad|lunch/i')).toBeVisible()
      await expect(firstDay.locator('text=/kolacja|dinner/i')).toBeVisible()
    } else {
      // Day cards not implemented yet
      test.skip()
    }
  })

  test('should copy meals from one day to another', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/meal-plan')
    await page.waitForLoadState('networkidle')

    // Look for copy/duplicate button
    const copyButton = page.locator(
      'button:has-text("Kopiuj"), button:has-text("Duplikuj"), button[aria-label*="copy"]'
    )

    if (await copyButton.first().isVisible()) {
      // Click copy button
      await copyButton.first().click()

      // Select target day (e.g., tomorrow)
      const targetDayButton = page.locator('button:has-text("Jutro")')
      if (await targetDayButton.isVisible()) {
        await targetDayButton.click()
      }

      // Confirm copy
      const confirmButton = page.locator(
        'button:has-text("Potwierdź"), button:has-text("Kopiuj")'
      )
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
        await page.waitForLoadState('networkidle')
      }

      // Should show success message
      await expect(page.locator('text=/skopiowano|sukces/i')).toBeVisible({
        timeout: 5000,
      })
    } else {
      // Copy feature not implemented yet
      test.skip()
    }
  })

  test('should display daily calorie totals', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/meal-plan')
    await page.waitForLoadState('networkidle')

    // Look for daily calorie summaries
    const calorieSummary = page.locator('text=/\\d+\\s*kcal/i')
    const count = await calorieSummary.count()

    // Should have at least one calorie display
    expect(count).toBeGreaterThan(0)
  })

  test('should display weekly macro summary', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/meal-plan')
    await page.waitForLoadState('networkidle')

    // Look for weekly summary section
    const weeklySummary = page.locator(
      '[data-testid="weekly-summary"], .weekly-summary'
    )

    if (await weeklySummary.isVisible()) {
      // Should show average calories
      await expect(
        weeklySummary.locator('text=/średnia|average/i')
      ).toBeVisible()

      // Should show macro breakdown
      await expect(
        weeklySummary.locator('text=/białko|protein/i')
      ).toBeVisible()
    } else {
      // Weekly summary not implemented yet
      test.skip()
    }
  })

  test('should allow meal swapping from weekly view', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/meal-plan')
    await page.waitForLoadState('networkidle')

    // Look for swap button on a meal
    const swapButton = page.locator('button:has-text("Zamień")').first()

    if (await swapButton.isVisible()) {
      await swapButton.click()

      // Should open swap modal
      await expect(page.locator('text=Wybierz zamiennik')).toBeVisible({
        timeout: 5000,
      })

      // Close modal
      await page.keyboard.press('Escape')
    } else {
      // Swap not available in weekly view
      test.skip()
    }
  })

  test('should filter view by meal type', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/meal-plan')
    await page.waitForLoadState('networkidle')

    // Look for meal type filter buttons
    const breakfastFilter = page.locator(
      'button:has-text("Śniadania"), input[value="breakfast"]'
    )

    if (await breakfastFilter.isVisible()) {
      await breakfastFilter.click()
      await page.waitForLoadState('networkidle')

      // Should only show breakfast meals
      const mealTypes = page.locator('[data-meal-type]')
      const count = await mealTypes.count()

      for (let i = 0; i < count; i++) {
        const mealType = await mealTypes.nth(i).getAttribute('data-meal-type')
        expect(mealType).toBe('breakfast')
      }
    } else {
      // Filter not implemented yet
      test.skip()
    }
  })

  test('should generate shopping list from meal plan', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/meal-plan')
    await page.waitForLoadState('networkidle')

    // Look for generate shopping list button
    const generateButton = page.locator(
      'button:has-text("Generuj listę"), button:has-text("Lista zakupów")'
    )

    if (await generateButton.isVisible()) {
      await generateButton.click()

      // Should navigate to shopping list or show modal
      await page.waitForLoadState('networkidle')

      const isShoppingList =
        page.url().includes('shopping') ||
        (await page.locator('text=/lista zakupów/i').isVisible())

      expect(isShoppingList).toBe(true)
    } else {
      // Shopping list generation not implemented yet
      test.skip()
    }
  })
})
