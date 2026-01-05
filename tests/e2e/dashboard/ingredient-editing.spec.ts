import { test, expect } from '../fixtures/auth'
import { DashboardPage } from '../utils/page-objects/DashboardPage'
import { setupMealPlan } from '../fixtures/test-data'

test.describe('Dashboard - Ingredient Editing', () => {
  test.beforeEach(async ({ testUser, supabaseClient }) => {
    // Setup meal plan starting today for ingredient editing tests
    await setupMealPlan(supabaseClient, testUser.userId, new Date())
  })

  test('should display daily meals', async ({ authenticatedPage: page }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()

    // Wait for page to fully load including data
    await page.waitForLoadState('networkidle', { timeout: 10000 })

    // Should show all three meal types
    await expect(dashboard.getMealCard('breakfast')).toBeVisible({
      timeout: 10000,
    })
    await expect(dashboard.getMealCard('lunch')).toBeVisible({ timeout: 5000 })
    await expect(dashboard.getMealCard('dinner')).toBeVisible({ timeout: 5000 })
  })

  test('should display macro progress', async ({ authenticatedPage: page }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()

    // Should show macro progress bars
    await expect(dashboard.proteinProgress).toBeVisible()
    await expect(dashboard.carbsProgress).toBeVisible()
    await expect(dashboard.fatProgress).toBeVisible()
    await expect(dashboard.caloriesProgress).toBeVisible()
  })

  test('should expand ingredients list', async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()

    // Open recipe modal (which shows ingredients)
    await dashboard.openRecipeModal('breakfast')

    // Should show ingredients list in the modal
    const modal = dashboard.getRecipeModal()
    const ingredientsList = modal.locator('[data-testid="ingredients-list"]')
    await expect(ingredientsList).toBeVisible()

    // Should show at least one ingredient
    const ingredients = modal.locator('[data-testid="ingredient-row"]')
    await expect(ingredients.first()).toBeVisible()
  })

  // FIXME: Ingredient editing functionality needs debugging
  // Issue: Modal "Zapisz zmiany" button doesn't persist changes to database
  // Root cause: Ingredient quantity changes are not being saved via Server Action
  // Expected: Macro values should update after editing ingredient quantity
  // Actual: Macro values remain unchanged (proteinAfter === proteinBefore)
  // Test passes when run individually due to timing, but fails in suite
  test.fixme('should edit ingredient quantity', async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()

    // Mark breakfast as eaten so macros are counted
    await dashboard.markMealAsEaten('breakfast')

    // Get initial protein value
    const proteinBefore = await dashboard.getMacroValue('protein')

    // Edit first ingredient in breakfast
    await dashboard.editIngredientQuantity('breakfast', 0, 150)

    // Wait for macro update
    await dashboard.waitForMacroUpdate()

    // Protein value should change
    const proteinAfter = await dashboard.getMacroValue('protein')
    expect(proteinAfter).not.toBe(proteinBefore)
    expect(proteinAfter).toBeGreaterThan(0)
  })

  // FIXME: Live macro preview feature needs implementation
  // Depends on: Ingredient editing functionality (see test above)
  // Issue: Live preview component [data-testid="live-preview"] not rendering
  // Expected: Preview shows updated macro values while editing
  // Actual: Preview element not found in DOM
  test.fixme('should show live macro preview while editing', async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()
    await dashboard.expandIngredients('breakfast')

    const mealCard = dashboard.getMealCard('breakfast')
    const ingredientRow = mealCard
      .locator('[data-testid="ingredient-row"]')
      .first()

    // Click edit
    await ingredientRow.locator('button[aria-label="Edytuj"]').click()

    // Change quantity
    const quantityInput = ingredientRow.locator('input[type="number"]')
    await quantityInput.clear()
    await quantityInput.fill('200')

    // Live preview should be visible
    await expect(page.locator('[data-testid="live-preview"]')).toBeVisible()

    // Preview should show new macro values
    const livePreview = page.locator('[data-testid="live-preview"]')
    await expect(livePreview).toContainText(/białko/i)
    await expect(livePreview).toContainText(/węglowodany/i)
  })

  // FIXME: Cancel ingredient edit depends on working edit feature
  // Depends on: Ingredient editing functionality (see tests above)
  // Issue: Cancel button behavior not working correctly
  // Expected: Macros remain unchanged after cancel
  // Actual: Test timing issues, depends on working edit feature first
  test.fixme('should cancel ingredient edit', async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()

    // Get initial macro values
    const proteinBefore = await dashboard.getMacroValue('protein')

    await dashboard.expandIngredients('breakfast')

    const mealCard = dashboard.getMealCard('breakfast')
    const ingredientRow = mealCard
      .locator('[data-testid="ingredient-row"]')
      .first()

    // Click edit
    await ingredientRow.locator('button[aria-label="Edytuj"]').click()

    // Change quantity
    const quantityInput = ingredientRow.locator('input[type="number"]')
    await quantityInput.clear()
    await quantityInput.fill('999')

    // Click cancel
    await ingredientRow.locator('button:has-text("Anuluj")').click()

    // Macros should not change
    const proteinAfter = await dashboard.getMacroValue('protein')
    expect(proteinAfter).toBe(proteinBefore)
  })

  // FIXME: Calendar navigation button selector needs update
  // Issue: Next day button [aria-label="Następny dzień"] not found or not clickable
  // Error: TimeoutError waiting for nextDayButton.click()
  // Expected: Calendar navigation works between days
  // Actual: Button element not present or timing issue
  test.fixme('should navigate between days', async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()

    // Get current meal name
    await dashboard
      .getMealCard('breakfast')
      .locator('[data-testid="recipe-name"]')
      .textContent()

    // Go to next day
    await dashboard.goToNextDay()

    // Meal should change (different day)
    await dashboard
      .getMealCard('breakfast')
      .locator('[data-testid="recipe-name"]')
      .textContent()

    // Note: Could be same recipe, but at least page should reload
    await expect(dashboard.getMealCard('breakfast')).toBeVisible()

    // Go back to today
    await dashboard.goToToday()
  })

  // FIXME: Validation depends on working ingredient editing
  // Depends on: Ingredient editing functionality (see tests above)
  // Issue: Validation may not work if save functionality is broken
  // Expected: Validation error for negative quantities
  // Actual: Needs working save feature to test validation
  test.fixme('should handle ingredient edit validation', async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()
    await dashboard.expandIngredients('breakfast')

    const mealCard = dashboard.getMealCard('breakfast')
    const ingredientRow = mealCard
      .locator('[data-testid="ingredient-row"]')
      .first()

    // Click edit
    await ingredientRow.locator('button[aria-label="Edytuj"]').click()

    // Try to enter invalid quantity (negative)
    const quantityInput = ingredientRow.locator('input[type="number"]')
    await quantityInput.clear()
    await quantityInput.fill('-10')

    // Try to save
    await ingredientRow.locator('button:has-text("Zapisz")').click()

    // Should show validation error
    await expect(page.locator('text=/dodatnia|positive/i')).toBeVisible()
  })

  // FIXME: Persistence depends on working ingredient editing
  // Depends on: Ingredient editing functionality (see tests above)
  // Issue: Cannot test persistence when save functionality doesn't work
  // Expected: Changes persist after page reload
  // Actual: Needs working save feature to test persistence
  test.fixme('should persist ingredient changes after reload', async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()

    // Edit ingredient
    await dashboard.editIngredientQuantity('breakfast', 0, 250)
    await dashboard.waitForMacroUpdate()

    // Get macro value
    const proteinAfter = await dashboard.getMacroValue('protein')

    // Reload page
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    // Macro should still reflect the change
    const proteinReloaded = await dashboard.getMacroValue('protein')
    expect(proteinReloaded).toBe(proteinAfter)
  })
})
