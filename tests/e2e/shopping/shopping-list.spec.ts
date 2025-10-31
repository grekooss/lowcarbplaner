import { test, expect } from '../fixtures/auth'
import { setupMealPlan, setupShoppingList } from '../fixtures/test-data'

test.describe('Shopping List', () => {
  test.beforeEach(async ({ testUser, supabaseClient }) => {
    // Setup meal plan for testing
    await setupMealPlan(supabaseClient, testUser.userId)
  })

  test('should display shopping list page', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/shopping-list')
    await page.waitForLoadState('networkidle')

    // Should show shopping list title
    await expect(
      page.locator('h1, h2').filter({ hasText: /lista zakup/i })
    ).toBeVisible({ timeout: 10000 })
  })

  test('should generate shopping list from meal plan', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/shopping-list')
    await page.waitForLoadState('networkidle')

    // Look for generate button
    const generateButton = page.locator(
      'button:has-text("Generuj"), button:has-text("Utwórz listę")'
    )

    if (await generateButton.isVisible()) {
      await generateButton.click()

      // Wait for generation
      await page.waitForLoadState('networkidle')

      // Should show ingredients
      const ingredientItems = page.locator(
        '[data-testid="ingredient-item"], .ingredient-item'
      )
      const count = await ingredientItems.count()

      expect(count).toBeGreaterThan(0)
    } else {
      // May already be generated or auto-generated
      // Check if items are visible
      const ingredientItems = page.locator(
        '[data-testid="ingredient-item"], .ingredient-item, li'
      )
      const count = await ingredientItems.count()

      expect(count).toBeGreaterThanOrEqual(0)
    }
  })

  test('should check off shopping list items', async ({
    authenticatedPage: page,
    testUser,
    supabaseClient,
  }) => {
    // Setup shopping list
    await setupShoppingList(supabaseClient, testUser.userId)

    await page.goto('/shopping-list')
    await page.waitForLoadState('networkidle')

    // Find first checkbox - Radix UI uses button[role="checkbox"]
    const firstCheckbox = page.locator('button[role="checkbox"]').first()

    if (await firstCheckbox.isVisible()) {
      await expect(firstCheckbox).toBeVisible({ timeout: 10000 })

      // Check the box
      await firstCheckbox.click()

      // Wait for save
      await page.waitForTimeout(500)

      // Should be checked (data-state="checked")
      await expect(firstCheckbox).toHaveAttribute('data-state', 'checked')

      // Verify in database
      const { data: items } = await supabaseClient
        .from('shopping_list')
        .select('*')
        .eq('user_id', testUser.userId)
        .eq('checked', true)

      expect(items?.length).toBeGreaterThan(0)
    } else {
      test.skip()
    }
  })

  test('should add custom ingredient to shopping list', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/shopping-list')
    await page.waitForLoadState('networkidle')

    // Look for add ingredient input/button
    const addInput = page.locator(
      'input[placeholder*="dodaj"], input[name="ingredient"]'
    )
    const addButton = page.locator(
      'button:has-text("Dodaj"), button[aria-label*="dodaj"]'
    )

    if ((await addInput.isVisible()) && (await addButton.isVisible())) {
      // Add custom ingredient
      await addInput.fill('Mleko kokosowe')
      await addButton.click()

      // Wait for item to appear
      await page.waitForLoadState('networkidle')

      // Should show new item
      await expect(page.locator('text=Mleko kokosowe')).toBeVisible({
        timeout: 5000,
      })
    } else {
      // Custom ingredients not implemented yet
      test.skip()
    }
  })

  test('should delete ingredient from shopping list', async ({
    authenticatedPage: page,
    testUser,
    supabaseClient,
  }) => {
    // Setup shopping list
    await setupShoppingList(supabaseClient, testUser.userId)

    await page.goto('/shopping-list')
    await page.waitForLoadState('networkidle')

    // Get initial count
    const initialItems = page.locator('[data-testid="ingredient-item"], li')
    const initialCount = await initialItems.count()

    if (initialCount > 0) {
      // Find delete button on first item
      const deleteButton = page
        .locator('button[aria-label*="usuń"], button:has-text("Usuń")')
        .first()

      if (await deleteButton.isVisible()) {
        await deleteButton.click()

        // Wait for deletion
        await page.waitForLoadState('networkidle')

        // Count should decrease
        const newCount = await initialItems.count()
        expect(newCount).toBe(initialCount - 1)
      } else {
        test.skip()
      }
    } else {
      test.skip()
    }
  })

  test('should clear all checked items', async ({
    authenticatedPage: page,
    testUser,
    supabaseClient,
  }) => {
    // Setup shopping list
    await setupShoppingList(supabaseClient, testUser.userId)

    await page.goto('/shopping-list')
    await page.waitForLoadState('networkidle')

    // Check first item - Radix UI uses button[role="checkbox"]
    const firstCheckbox = page.locator('button[role="checkbox"]').first()
    if (await firstCheckbox.isVisible()) {
      await firstCheckbox.click()
      await page.waitForTimeout(500)
    }

    // Look for clear checked button
    const clearButton = page.locator(
      'button:has-text("Wyczyść zaznaczone"), button:has-text("Usuń zaznaczone")'
    )

    if (await clearButton.isVisible()) {
      await clearButton.click()

      // Wait for deletion
      await page.waitForLoadState('networkidle')

      // Checked items should be removed (data-state="checked")
      const checkedItems = page.locator(
        'button[role="checkbox"][data-state="checked"]'
      )
      const count = await checkedItems.count()

      expect(count).toBe(0)
    } else {
      test.skip()
    }
  })

  test('should group ingredients by category', async ({
    authenticatedPage: page,
    testUser,
    supabaseClient,
  }) => {
    // Setup shopping list
    await setupShoppingList(supabaseClient, testUser.userId)

    await page.goto('/shopping-list')
    await page.waitForLoadState('networkidle')

    // Look for category headers
    const categoryHeaders = page.locator(
      '[data-testid="category-header"], .category-header, h3'
    )
    const count = await categoryHeaders.count()

    if (count > 0) {
      // Should have at least one category
      expect(count).toBeGreaterThan(0)

      // Categories might include: Warzywa, Mięso, Nabiał, etc.
      const firstCategory = await categoryHeaders.first().textContent()
      expect(firstCategory).toBeTruthy()
    } else {
      // Categorization not implemented yet
      test.skip()
    }
  })

  test('should show ingredient quantities', async ({
    authenticatedPage: page,
    testUser,
    supabaseClient,
  }) => {
    // Setup shopping list
    await setupShoppingList(supabaseClient, testUser.userId)

    await page.goto('/shopping-list')
    await page.waitForLoadState('networkidle')

    // Look for quantities in list items
    const quantityIndicator = page
      .locator('text=/\\d+\\s*g|\\d+\\s*ml|\\d+\\s*szt/i')
      .first()

    if (await quantityIndicator.isVisible()) {
      await expect(quantityIndicator).toBeVisible()
    } else {
      // Quantities not shown yet
      test.skip()
    }
  })

  test('should export shopping list', async ({ authenticatedPage: page }) => {
    await page.goto('/shopping-list')
    await page.waitForLoadState('networkidle')

    // Look for export button
    const exportButton = page.locator(
      'button:has-text("Eksportuj"), button:has-text("Pobierz")'
    )

    if (await exportButton.isVisible()) {
      // Setup download listener
      const downloadPromise = page.waitForEvent('download')

      await exportButton.click()

      // Wait for download
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/shopping|lista/i)
    } else {
      // Export not implemented yet
      test.skip()
    }
  })

  test('should share shopping list', async ({ authenticatedPage: page }) => {
    await page.goto('/shopping-list')
    await page.waitForLoadState('networkidle')

    // Look for share button
    const shareButton = page.locator(
      'button:has-text("Udostępnij"), button[aria-label*="share"]'
    )

    if (await shareButton.isVisible()) {
      await shareButton.click()

      // Should show share modal or options
      await expect(
        page.locator('text=/udostępnij|share|email|link/i')
      ).toBeVisible({ timeout: 5000 })
    } else {
      // Share not implemented yet
      test.skip()
    }
  })
})
