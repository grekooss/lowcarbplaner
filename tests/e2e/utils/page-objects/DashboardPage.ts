import { type Page, type Locator } from '@playwright/test'

/**
 * Timing constants for animations and transitions
 */
// const ANIMATION_DURATION = 300 // Standard UI animation duration
const DATA_LOAD_WAIT = 500 // Wait for data load and rendering
const MACRO_CALCULATION_WAIT = 1000 // Wait for macro recalculation

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
    // Wait for macro data to load
    await this.page.waitForTimeout(DATA_LOAD_WAIT)
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
   * Mark meal as eaten by checking the checkbox
   */
  async markMealAsEaten(mealType: 'breakfast' | 'lunch' | 'dinner') {
    const mealCard = this.getMealCard(mealType)
    // Radix UI Checkbox uses button[role="checkbox"], not native input
    const checkbox = mealCard.locator('button[role="checkbox"]')

    // Wait for checkbox to be visible
    await checkbox.waitFor({ state: 'visible', timeout: 5000 })

    // Get initial protein value to detect macro change
    const proteinBefore = await this.getMacroValue('protein')

    // Only check if not already checked (data-state="unchecked")
    const state = await checkbox.getAttribute('data-state')
    if (state !== 'checked') {
      await checkbox.click()

      // Wait for macros to actually update (not just arbitrary timeout)
      // Poll for macro change with timeout
      const startTime = Date.now()
      const maxWait = 5000 // 5 seconds max
      while (Date.now() - startTime < maxWait) {
        const proteinAfter = await this.getMacroValue('protein')
        if (proteinAfter !== proteinBefore && proteinAfter > 0) {
          // Macros updated successfully
          break
        }
        await this.page.waitForTimeout(200) // Poll every 200ms
      }

      // Additional wait for any animations to complete
      await this.page.waitForTimeout(500)
    }
  }

  /**
   * Open recipe modal by clicking on meal card
   */
  async openRecipeModal(mealType: 'breakfast' | 'lunch' | 'dinner') {
    const mealCard = this.getMealCard(mealType)
    await mealCard.click()

    // Wait for modal to open
    const modal = this.page.locator('[data-testid="recipe-modal"]')
    await modal.waitFor({ state: 'visible', timeout: 3000 })
  }

  /**
   * Get recipe modal locator
   */
  getRecipeModal() {
    return this.page.locator('[data-testid="recipe-modal"]')
  }

  /**
   * Expand ingredients list for a meal (opens modal first if needed)
   */
  async expandIngredients(mealType: 'breakfast' | 'lunch' | 'dinner') {
    // In dashboard, ingredients are in the modal, so we need to open it first
    const modal = this.getRecipeModal()
    const isModalOpen = await modal.isVisible()

    if (!isModalOpen) {
      await this.openRecipeModal(mealType)
    }

    // Ingredients are now visible in the modal
    const ingredientsList = modal.locator('[data-testid="ingredients-list"]')
    await ingredientsList.waitFor({ state: 'visible', timeout: 2000 })
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

    const modal = this.getRecipeModal()
    const ingredientRow = modal
      .locator('[data-testid="ingredient-row"]')
      .nth(ingredientIndex)

    // Enter new quantity directly (EditableIngredientRow has number input visible)
    const quantityInput = ingredientRow.locator('input[type="number"]')
    await quantityInput.clear()
    await quantityInput.fill(newQuantity.toString())

    // Click the save button in the modal header
    const saveButton = modal.locator('button:has-text("Zapisz zmiany")')

    // Wait a bit for any changes to settle
    await this.page.waitForTimeout(500)

    await saveButton.click()

    // Wait for save operation to complete (API request)
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 5000 })
    } catch {
      console.warn('Save operation may still be in progress, continuing...')
    }

    // Close modal by pressing Escape (modal doesn't auto-close)
    await this.page.keyboard.press('Escape')

    // Wait for modal to close
    await modal.waitFor({ state: 'hidden', timeout: 3000 })

    // Wait for dashboard macros to update
    await this.page.waitForTimeout(MACRO_CALCULATION_WAIT)
  }

  /**
   * Get macro value by type
   */
  async getMacroValue(
    macro: 'protein' | 'carbs' | 'fat' | 'calories'
  ): Promise<number> {
    const locator = this.page.locator(`[data-macro="${macro}"]`)
    // Wait for macro element to be visible
    await locator.waitFor({ state: 'visible', timeout: 5000 })
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
    // Wait for page to reload with new day's data
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Navigate to next day
   */
  async goToNextDay() {
    await this.nextDayButton.click()
    // Wait for page to reload with new day's data
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Check if live macro preview is visible
   */
  async hasLiveMacroPreview(): Promise<boolean> {
    return await this.page.locator('[data-testid="live-preview"]').isVisible()
  }

  /**
   * Wait for macro update animation
   * Waits for network requests to complete (macro recalculation)
   */
  async waitForMacroUpdate() {
    // Wait for any pending API requests to complete
    await this.page.waitForLoadState('networkidle')
  }
}
