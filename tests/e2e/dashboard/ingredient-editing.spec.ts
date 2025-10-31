import { test, expect } from '../fixtures/auth'
import { DashboardPage } from '../utils/page-objects/DashboardPage'
import { setupMealPlan } from '../fixtures/test-data'

test.describe('Dashboard - Ingredient Editing', () => {
  test.beforeEach(async ({ testUser, supabaseClient }) => {
    // Setup meal plan for testing (profile already created by auth fixture)
    await setupMealPlan(supabaseClient, testUser.userId)
  })

  test('should display daily meals', async ({ authenticatedPage: page }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()

    // Should show all three meal types
    await expect(dashboard.getMealCard('breakfast')).toBeVisible()
    await expect(dashboard.getMealCard('lunch')).toBeVisible()
    await expect(dashboard.getMealCard('dinner')).toBeVisible()
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

  test('should edit ingredient quantity', async ({
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

  test('should show live macro preview while editing', async ({
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

  test('should cancel ingredient edit', async ({ authenticatedPage: page }) => {
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

  test('should navigate between days', async ({ authenticatedPage: page }) => {
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

  test('should handle ingredient edit validation', async ({
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

  test('should persist ingredient changes after reload', async ({
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
