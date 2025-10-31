import { type Page, type Locator } from '@playwright/test'

/**
 * Timing constants for animations
 */
const TAB_ANIMATION_DURATION = 300 // Tab switch animation

/**
 * Page Object Model for Authentication Page
 * Handles login, registration, and password reset flows
 */
export class LoginPage {
  readonly page: Page

  // Form elements
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly confirmPasswordInput: Locator
  readonly submitButton: Locator

  // Tab triggers (Shadcn UI Tabs)
  readonly registerTab: Locator
  readonly loginTab: Locator
  readonly forgotPasswordLink: Locator

  // Social auth buttons
  readonly googleButton: Locator
  readonly facebookButton: Locator

  // Error messages
  readonly errorAlert: Locator
  readonly successAlert: Locator

  constructor(page: Page) {
    this.page = page

    // Form inputs
    this.emailInput = page.locator('input[name="email"]')
    this.passwordInput = page.locator('input[name="password"]')
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]')
    this.submitButton = page.locator('button[type="submit"]')

    // Tab navigation (Shadcn UI Tabs use role="tab")
    this.registerTab = page.getByRole('tab', { name: 'Rejestracja' })
    this.loginTab = page.getByRole('tab', { name: 'Logowanie' })
    this.forgotPasswordLink = page.getByRole('link', {
      name: 'Zapomniałem hasła',
    })

    // Social auth
    this.googleButton = page.locator('button:has-text("Google")')
    this.facebookButton = page.locator('button:has-text("Facebook")')

    // Alerts
    this.errorAlert = page.locator('[role="alert"]').first()
    this.successAlert = page.locator('[role="alert"]:has-text("Sukces")')
  }

  /**
   * Navigate to auth page
   */
  async goto() {
    await this.page.goto('/auth')
    await this.page.waitForLoadState('domcontentloaded')

    // Clear browser state to prevent session bleeding between tests
    await this.page.context().clearCookies()
    await this.page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    // Reload page after clearing storage to ensure clean state
    await this.page.reload()
    await this.page.waitForLoadState('domcontentloaded')
  }

  /**
   * Perform login
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()

    // Wait for navigation to start (login form submission)
    // Don't wait for networkidle as homepage may have ongoing activity
    await this.page.waitForLoadState('load', { timeout: 15000 })
  }

  /**
   * Switch to registration tab
   */
  async switchToRegister() {
    await this.registerTab.click()
    // Wait for tab to be active and confirm password field to appear
    await this.registerTab.waitFor({ state: 'attached' })
    await this.confirmPasswordInput.waitFor({
      state: 'visible',
      timeout: TAB_ANIMATION_DURATION + 200,
    })
  }

  /**
   * Switch to login tab
   */
  async switchToLogin() {
    await this.loginTab.click()
    // Wait for tab to be active
    await this.loginTab.waitFor({ state: 'attached' })
  }

  /**
   * Perform registration
   */
  async register(email: string, password: string, confirmPassword?: string) {
    await this.switchToRegister()
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.confirmPasswordInput.fill(confirmPassword || password)
    await this.submitButton.click()
  }

  /**
   * Click forgot password link
   */
  async goToForgotPassword() {
    await this.forgotPasswordLink.click()
  }

  /**
   * Wait for successful login redirect
   */
  async waitForLoginSuccess() {
    await this.page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 })
  }

  /**
   * Check if error message is visible
   */
  async hasError(): Promise<boolean> {
    return await this.errorAlert.isVisible()
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return (await this.errorAlert.textContent()) || ''
  }
}
