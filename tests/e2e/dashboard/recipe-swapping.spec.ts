import { test, expect } from '../fixtures/auth'
import { DashboardPage } from '../utils/page-objects/DashboardPage'
import { setupMealPlan } from '../fixtures/test-data'

test.describe('Dashboard - Recipe Swapping', () => {
  test.beforeEach(async ({ testUser, supabaseClient }) => {
    // Setup meal plan (profile already created by auth fixture)
    await setupMealPlan(supabaseClient, testUser.userId)
  })

  test('should open swap modal when clicking swap button', async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()

    // Navigate to tomorrow (where test meals are created)
    await dashboard.navigateToTomorrow()

    // Click swap on breakfast
    await dashboard.swapMeal('breakfast')

    // Modal should open
    await expect(page.locator('text=Wybierz zamiennik')).toBeVisible({
      timeout: 5000,
    })

    // Should show alternative recipes
    const replacementCards = page.locator('[data-testid="replacement-card"]')
    await expect(replacementCards.first()).toBeVisible()
  })

  test('should swap recipe successfully', async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()
    await dashboard.navigateToTomorrow()

    // Get current recipe name
    const currentRecipe = await dashboard
      .getMealCard('breakfast')
      .locator('[data-testid="recipe-name"]')
      .textContent()

    // Open swap modal
    await dashboard.swapMeal('breakfast')

    // Select first replacement
    const firstReplacement = page
      .locator('[data-testid="replacement-card"]')
      .first()
    await firstReplacement.click()

    // Wait for swap to complete
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/planned-meals') &&
        response.status() === 200
    )

    // Should show success message
    await expect(page.locator('text=Przepis zamieniony')).toBeVisible({
      timeout: 5000,
    })

    // Recipe name should change
    const newRecipe = await dashboard
      .getMealCard('breakfast')
      .locator('[data-testid="recipe-name"]')
      .textContent()

    expect(newRecipe).not.toBe(currentRecipe)
  })

  test('should update macros after recipe swap', async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()
    await dashboard.navigateToTomorrow()

    // Get initial macro values
    const proteinBefore = await dashboard.getMacroValue('protein')
    const caloriesBefore = await dashboard.getMacroValue('calories')

    // Swap recipe
    await dashboard.swapMeal('breakfast')
    await page.locator('[data-testid="replacement-card"]').first().click()

    // Wait for swap
    await page.waitForResponse((response) =>
      response.url().includes('/api/planned-meals')
    )

    // Wait for macro recalculation
    await dashboard.waitForMacroUpdate()

    // Macros should be recalculated
    const proteinAfter = await dashboard.getMacroValue('protein')
    const caloriesAfter = await dashboard.getMacroValue('calories')

    // At least one macro should change (different recipe)
    const macrosChanged =
      proteinAfter !== proteinBefore || caloriesAfter !== caloriesBefore

    expect(macrosChanged).toBe(true)
  })

  test('should close modal when clicking cancel', async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()
    await dashboard.navigateToTomorrow()

    // Open swap modal
    await dashboard.swapMeal('breakfast')
    await expect(page.locator('text=Wybierz zamiennik')).toBeVisible()

    // Click cancel or close button
    const closeButton = page.locator('[aria-label="Zamknij"]').first()
    await closeButton.click()

    // Modal should close
    await expect(page.locator('text=Wybierz zamiennik')).not.toBeVisible()
  })

  test('should show recipe details in replacement cards', async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()
    await dashboard.navigateToTomorrow()
    await dashboard.swapMeal('breakfast')

    // Wait for replacements to load
    const firstCard = page.locator('[data-testid="replacement-card"]').first()
    await expect(firstCard).toBeVisible()

    // Should show recipe name
    await expect(firstCard.locator('[data-testid="recipe-name"]')).toBeVisible()

    // Should show calories
    await expect(firstCard.locator('text=/\\d+\\s*kcal/i')).toBeVisible()

    // Should show macros
    await expect(firstCard.locator('text=/białko/i')).toBeVisible()
  })

  test('should filter replacements by similar calories', async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()
    await dashboard.navigateToTomorrow()

    // Get current meal calories
    const breakfastCard = dashboard.getMealCard('breakfast')
    const currentCaloriesText = await breakfastCard
      .locator('[data-testid="meal-calories"]')
      .textContent()

    const currentCalories = parseInt(
      currentCaloriesText?.match(/\d+/)?.[0] || '0'
    )

    // Open swap modal
    await dashboard.swapMeal('breakfast')

    // Check replacement calories are within range (e.g., ±20%)
    const replacementCards = page.locator('[data-testid="replacement-card"]')
    const count = await replacementCards.count()

    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = replacementCards.nth(i)
      const caloriesText = await card
        .locator('text=/\\d+\\s*kcal/i')
        .textContent()
      const calories = parseInt(caloriesText?.match(/\d+/)?.[0] || '0')

      const lowerBound = currentCalories * 0.8
      const upperBound = currentCalories * 1.2

      expect(calories).toBeGreaterThanOrEqual(lowerBound)
      expect(calories).toBeLessThanOrEqual(upperBound)
    }
  })

  test('should swap different meal types independently', async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()
    await dashboard.navigateToTomorrow()

    // Get initial recipe names
    const breakfastBefore = await dashboard
      .getMealCard('breakfast')
      .locator('[data-testid="recipe-name"]')
      .textContent()

    const lunchBefore = await dashboard
      .getMealCard('lunch')
      .locator('[data-testid="recipe-name"]')
      .textContent()

    // Swap breakfast
    await dashboard.swapMeal('breakfast')
    await page.locator('[data-testid="replacement-card"]').first().click()
    await page.waitForResponse((response) =>
      response.url().includes('/api/planned-meals')
    )

    // Wait for modal to close
    await expect(page.locator('text=Wybierz zamiennik')).not.toBeVisible()

    // Get new recipe names
    const breakfastAfter = await dashboard
      .getMealCard('breakfast')
      .locator('[data-testid="recipe-name"]')
      .textContent()

    const lunchAfter = await dashboard
      .getMealCard('lunch')
      .locator('[data-testid="recipe-name"]')
      .textContent()

    // Breakfast should change, lunch should stay the same
    expect(breakfastAfter).not.toBe(breakfastBefore)
    expect(lunchAfter).toBe(lunchBefore)
  })

  test('should persist swap after page reload', async ({
    authenticatedPage: page,
  }) => {
    const dashboard = new DashboardPage(page)

    await dashboard.goto()
    await dashboard.navigateToTomorrow()

    // Swap recipe
    await dashboard.swapMeal('breakfast')
    await page.locator('[data-testid="replacement-card"]').first().click()
    await page.waitForResponse((response) =>
      response.url().includes('/api/planned-meals')
    )

    // Get new recipe name
    const recipeName = await dashboard
      .getMealCard('breakfast')
      .locator('[data-testid="recipe-name"]')
      .textContent()

    // Reload page
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await dashboard.navigateToTomorrow()

    // Recipe should still be the swapped one
    const reloadedRecipeName = await dashboard
      .getMealCard('breakfast')
      .locator('[data-testid="recipe-name"]')
      .textContent()

    expect(reloadedRecipeName).toBe(recipeName)
  })
})
