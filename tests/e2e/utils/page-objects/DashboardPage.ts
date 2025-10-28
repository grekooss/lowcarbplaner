import { type Page, type Locator } from '@playwright/test'

/**
 * Page Object Model for Dashboard Page
 * Handles meal viewing, ingredient editing, and macro tracking
 */
export class DashboardPage {
  readonly page: Page

  // Calendar navigation
  readonly calendarStrip: Locator
  readonly todayButton: Locator
  readonly prevDayButton: Locator
  readonly nextDayButton: Locator

  // Meal cards
  readonly mealCards: Locator

  // Macro progress section
  readonly macroProgress: Locator
  readonly proteinProgress: Locator
  readonly carbsProgress: Locator
  readonly fatProgress: Locator
  readonly caloriesProgress: Locator

  // Navigation
  readonly mealPlanLink: Locator
  readonly recipesLink: Locator
  readonly shoppingListLink: Locator
  readonly profileLink: Locator

  constructor(page: Page) {
    this.page = page

    // Calendar
    this.calendarStrip = page.locator('[data-testid="calendar-strip"]')
    this.todayButton = page.locator('button:has-text("Dzisiaj")')
    this.prevDayButton = page.locator('button[aria-label="Poprzedni dzień"]')
    this.nextDayButton = page.locator('button[aria-label="Następny dzień"]')

    // Meals
    this.mealCards = page.locator('[data-testid="meal-card"]')

    // Macros
    this.macroProgress = page.locator('[data-testid="macro-progress"]')
    this.proteinProgress = page.locator('[data-macro="protein"]')
    this.carbsProgress = page.locator('[data-macro="carbs"]')
    this.fatProgress = page.locator('[data-macro="fat"]')
    this.caloriesProgress = page.locator('[data-macro="calories"]')

    // Navigation
    this.mealPlanLink = page.locator('a[href="/meal-plan"]')
    this.recipesLink = page.locator('a[href="/recipes"]')
    this.shoppingListLink = page.locator('a[href="/shopping-list"]')
    this.profileLink = page.locator('a[href="/profile"]')
  }

  /**
   * Navigate to dashboard
   */
  async goto() {
    await this.page.goto('/dashboard')
    await this.page.waitForLoadState('domcontentloaded')
  }

  /**
   * Get meal card by type
   */
  getMealCard(mealType: 'breakfast' | 'lunch' | 'dinner'): Locator {
    return this.page.locator(`[data-meal-type="${mealType}"]`)
  }

  /**
   * Click swap button on a meal
   */
  async swapMeal(mealType: 'breakfast' | 'lunch' | 'dinner') {
    const mealCard = this.getMealCard(mealType)
    await mealCard.locator('button:has-text("Zamień")').click()
  }

  /**
   * Expand ingredients list for a meal
   */
  async expandIngredients(mealType: 'breakfast' | 'lunch' | 'dinner') {
    const mealCard = this.getMealCard(mealType)
    const expandButton = mealCard.locator('button:has-text("Składniki")')

    // Check if already expanded
    const isExpanded = await mealCard
      .locator('[data-testid="ingredients-list"]')
      .isVisible()

    if (!isExpanded) {
      await expandButton.click()
      await this.page.waitForTimeout(300) // Animation
    }
  }

  /**
   * Edit ingredient quantity
   */
  async editIngredientQuantity(
    mealType: 'breakfast' | 'lunch' | 'dinner',
    ingredientIndex: number,
    newQuantity: number
  ) {
    await this.expandIngredients(mealType)

    const mealCard = this.getMealCard(mealType)
    const ingredientRow = mealCard
      .locator('[data-testid="ingredient-row"]')
      .nth(ingredientIndex)

    // Click edit button
    await ingredientRow.locator('button[aria-label="Edytuj"]').click()

    // Enter new quantity
    const quantityInput = ingredientRow.locator('input[type="number"]')
    await quantityInput.clear()
    await quantityInput.fill(newQuantity.toString())

    // Save changes
    await ingredientRow.locator('button:has-text("Zapisz")').click()

    // Wait for save to complete
    await this.page.waitForResponse((response) =>
      response.url().includes('/api/planned-meals')
    )
  }

  /**
   * Get macro value by type
   */
  async getMacroValue(
    macro: 'protein' | 'carbs' | 'fat' | 'calories'
  ): Promise<number> {
    const locator = this.page.locator(`[data-macro="${macro}"]`)
    const text = await locator.textContent()

    if (!text) return 0

    // Extract number from text like "45g / 150g"
    const match = text.match(/(\d+\.?\d*)\s*[gkcal]*\s*\//)
    return match && match[1] ? parseFloat(match[1]) : 0
  }

  /**
   * Get macro target value
   */
  async getMacroTarget(
    macro: 'protein' | 'carbs' | 'fat' | 'calories'
  ): Promise<number> {
    const locator = this.page.locator(`[data-macro="${macro}"]`)
    const text = await locator.textContent()

    if (!text) return 0

    // Extract target from text like "45g / 150g"
    const match = text.match(/\/\s*(\d+\.?\d*)\s*[gkcal]*/)
    return match && match[1] ? parseFloat(match[1]) : 0
  }

  /**
   * Select date from calendar
   */
  async selectDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0]
    const dateButton = this.calendarStrip.locator(
      `button[data-date="${dateStr}"]`
    )
    await dateButton.click()
  }

  /**
   * Navigate to today
   */
  async goToToday() {
    await this.todayButton.click()
  }

  /**
   * Navigate to previous day
   */
  async goToPreviousDay() {
    await this.prevDayButton.click()
    await this.page.waitForTimeout(500) // Wait for data load
  }

  /**
   * Navigate to next day
   */
  async goToNextDay() {
    await this.nextDayButton.click()
    await this.page.waitForTimeout(500)
  }

  /**
   * Check if live macro preview is visible
   */
  async hasLiveMacroPreview(): Promise<boolean> {
    return await this.page.locator('[data-testid="live-preview"]').isVisible()
  }

  /**
   * Wait for macro update animation
   */
  async waitForMacroUpdate() {
    await this.page.waitForTimeout(1000) // Wait for re-calculation
  }
}
