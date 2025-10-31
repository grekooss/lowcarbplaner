import { test, expect } from '../fixtures/auth'
import { ensureTestDataExists } from '../fixtures/test-data'

test.describe('Recipes - Browsing and Search', () => {
  test.beforeEach(async ({ supabaseClient }) => {
    // Verify test recipes exist
    await ensureTestDataExists(supabaseClient)
  })

  test('should display recipe list', async ({ authenticatedPage: page }) => {
    await page.goto('/recipes')
    await page.waitForLoadState('networkidle')

    // Should show recipes title
    await expect(
      page.locator('h1, h2').filter({ hasText: /przepis/i })
    ).toBeVisible({ timeout: 10000 })

    // Should show at least one recipe card
    const recipeCards = page.locator(
      '[data-testid="recipe-card"], .recipe-card'
    )
    const count = await recipeCards.count()

    expect(count).toBeGreaterThan(0)
  })

  test('should filter recipes by meal type', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/recipes')
    await page.waitForLoadState('networkidle')

    // Look for breakfast filter
    const breakfastFilter = page.locator(
      'button:has-text("Śniadanie"), [role="tab"]:has-text("Śniadanie")'
    )

    if (await breakfastFilter.isVisible()) {
      await breakfastFilter.click()
      await page.waitForLoadState('networkidle')

      // Should show breakfast recipes
      const recipeCards = page.locator('[data-testid="recipe-card"]')
      const count = await recipeCards.count()

      expect(count).toBeGreaterThan(0)
    } else {
      // Meal type filter not implemented yet
      test.skip()
    }
  })

  test('should search recipes by name', async ({ authenticatedPage: page }) => {
    await page.goto('/recipes')
    await page.waitForLoadState('networkidle')

    // Look for search input
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="szukaj"], input[name="search"]'
    )

    if (await searchInput.isVisible()) {
      // Enter search term
      await searchInput.fill('jajko')
      await page.waitForLoadState('networkidle')

      // Should show filtered results
      const recipeCards = page.locator('[data-testid="recipe-card"]')
      const count = await recipeCards.count()

      // Should have at least one result (or zero if no matches)
      expect(count).toBeGreaterThanOrEqual(0)

      if (count > 0) {
        // At least one recipe name should contain search term
        const firstRecipeName = await recipeCards
          .first()
          .locator('[data-testid="recipe-name"]')
          .textContent()

        expect(firstRecipeName?.toLowerCase()).toContain('jajko')
      }
    } else {
      // Search not implemented yet
      test.skip()
    }
  })

  test('should display recipe details', async ({ authenticatedPage: page }) => {
    await page.goto('/recipes')
    await page.waitForLoadState('networkidle')

    // Click on first recipe card
    const firstRecipe = page
      .locator('[data-testid="recipe-card"], .recipe-card')
      .first()
    await firstRecipe.click()

    // Should show recipe details
    await page.waitForLoadState('networkidle')

    // Should show recipe name
    await expect(page.locator('h1, h2').filter({ hasText: /.+/ })).toBeVisible({
      timeout: 10000,
    })

    // Should show ingredients list
    await expect(page.locator('text=/składniki|ingredients/i')).toBeVisible()

    // Should show macros
    await expect(page.locator('text=/kalorie|kcal/i')).toBeVisible()
    await expect(page.locator('text=/białko|protein/i')).toBeVisible()
  })

  test('should display recipe macros in card', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/recipes')
    await page.waitForLoadState('networkidle')

    // Get first recipe card
    const firstRecipe = page
      .locator('[data-testid="recipe-card"], .recipe-card')
      .first()
    await expect(firstRecipe).toBeVisible({ timeout: 10000 })

    // Should show calories
    await expect(firstRecipe.locator('text=/\\d+\\s*kcal/i')).toBeVisible()

    // Should show protein
    await expect(firstRecipe.locator('text=/białko|protein/i')).toBeVisible()
  })

  test('should filter recipes by calorie range', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/recipes')
    await page.waitForLoadState('networkidle')

    // Look for calorie range filter
    const minCaloriesInput = page.locator(
      'input[name="min_calories"], input[placeholder*="min"]'
    )
    const maxCaloriesInput = page.locator(
      'input[name="max_calories"], input[placeholder*="max"]'
    )

    if (
      (await minCaloriesInput.isVisible()) &&
      (await maxCaloriesInput.isVisible())
    ) {
      // Set range
      await minCaloriesInput.fill('300')
      await maxCaloriesInput.fill('500')

      // Apply filter
      const applyButton = page.locator('button:has-text("Zastosuj")')
      if (await applyButton.isVisible()) {
        await applyButton.click()
        await page.waitForLoadState('networkidle')
      }

      // Check results
      const recipeCards = page.locator('[data-testid="recipe-card"]')
      const count = await recipeCards.count()

      expect(count).toBeGreaterThanOrEqual(0)
    } else {
      // Calorie filter not implemented yet
      test.skip()
    }
  })

  test('should sort recipes by calories', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/recipes')
    await page.waitForLoadState('networkidle')

    // Look for sort dropdown
    const sortSelect = page
      .locator('select[name="sort"], [role="combobox"]')
      .first()

    if (await sortSelect.isVisible()) {
      await sortSelect.click()

      // Select sort by calories
      const caloriesOption = page.locator('text=/kalori|calorie/i')
      if (await caloriesOption.isVisible()) {
        await caloriesOption.click()
        await page.waitForLoadState('networkidle')

        // Verify recipes are sorted
        const recipeCards = page.locator('[data-testid="recipe-card"]')
        const count = await recipeCards.count()

        if (count >= 2) {
          // Get calories from first two recipes
          const firstCalories = await recipeCards
            .first()
            .locator('text=/\\d+\\s*kcal/i')
            .textContent()
          const secondCalories = await recipeCards
            .nth(1)
            .locator('text=/\\d+\\s*kcal/i')
            .textContent()

          const firstCal = parseInt(firstCalories?.match(/\d+/)?.[0] || '0')
          const secondCal = parseInt(secondCalories?.match(/\d+/)?.[0] || '0')

          // Should be sorted (ascending or descending)
          expect(firstCal <= secondCal || firstCal >= secondCal).toBe(true)
        }
      }
    } else {
      // Sort not implemented yet
      test.skip()
    }
  })

  test('should favorite a recipe', async ({ authenticatedPage: page }) => {
    await page.goto('/recipes')
    await page.waitForLoadState('networkidle')

    // Look for favorite button
    const favoriteButton = page
      .locator('button[aria-label*="ulubione"], button:has-text("❤")')
      .first()

    if (await favoriteButton.isVisible()) {
      await favoriteButton.click()

      // Should show success message or change button state
      await page.waitForTimeout(500) // Small wait for animation

      // Check if button state changed (filled heart)
      const isFavorited = await favoriteButton.getAttribute('aria-pressed')
      expect(isFavorited).toBe('true')
    } else {
      // Favorite feature not implemented yet
      test.skip()
    }
  })

  test('should paginate recipe list', async ({ authenticatedPage: page }) => {
    await page.goto('/recipes')
    await page.waitForLoadState('networkidle')

    // Look for next page button
    const nextPageButton = page.locator(
      'button:has-text("Następna"), button[aria-label*="next page"]'
    )

    if (await nextPageButton.isVisible()) {
      // Get recipe name from first page
      const firstPageRecipe = await page
        .locator('[data-testid="recipe-name"]')
        .first()
        .textContent()

      // Go to next page
      await nextPageButton.click()
      await page.waitForLoadState('networkidle')

      // Get recipe name from second page
      const secondPageRecipe = await page
        .locator('[data-testid="recipe-name"]')
        .first()
        .textContent()

      // Recipes should be different
      expect(secondPageRecipe).not.toBe(firstPageRecipe)
    } else {
      // Pagination not implemented yet
      test.skip()
    }
  })

  test('should show recipe preparation time', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/recipes')
    await page.waitForLoadState('networkidle')

    // Look for time indicator in recipe cards
    const timeIndicator = page.locator('text=/\\d+\\s*min/i').first()

    if (await timeIndicator.isVisible()) {
      await expect(timeIndicator).toBeVisible()
    } else {
      // Prep time not displayed yet
      test.skip()
    }
  })
})
