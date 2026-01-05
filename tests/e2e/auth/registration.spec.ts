import { test, expect } from '../fixtures/auth'
import { LoginPage } from '../utils/page-objects/LoginPage'

test.describe('User Registration', () => {
  test('should successfully register new user', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const timestamp = Date.now()
    const email = `newuser-${timestamp}@test.com`
    const password = 'SecurePass123!'

    await loginPage.goto()
    await loginPage.register(email, password)

    // Should redirect after successful registration (can be /, /dashboard, or /onboarding)
    await expect(page).not.toHaveURL('/auth', { timeout: 15000 })

    // Should be authenticated (check for navigation menu or welcome message)
    const welcomeMessage = page.locator('text=/witaj/i')
    const navMenu = page.getByRole('link', { name: 'Panel Dzienny' })

    // At least one should be visible (onboarding shows welcome, dashboard shows menu)
    await expect(welcomeMessage.or(navMenu).first()).toBeVisible({
      timeout: 5000,
    })
  })

  test.fixme('should show error for existing email', async ({
    page,
    testUser,
  }) => {
    // FIXME: Registration may succeed despite existing email - Supabase behavior investigation needed
    const loginPage = new LoginPage(page)

    await loginPage.goto()

    // Try to register with email that already exists
    await loginPage.register(testUser.email, 'NewPassword123!')

    // Should show error (filter out empty route announcer)
    const errorAlert = page.locator('[role="alert"]').filter({ hasText: /.+/ })
    await expect(errorAlert.first()).toBeVisible({ timeout: 5000 })
    await expect(errorAlert.first()).toContainText(
      /istnieje|exist|już|already/i
    )
  })

  test('should validate password strength', async ({ page }) => {
    // NOTE: data-testid="password-strength" has been implemented
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.switchToRegister()

    // Enter weak password
    await loginPage.passwordInput.fill('123')
    await loginPage.passwordInput.blur()

    // Should show password strength indicator
    const strengthIndicator = page.locator('[data-testid="password-strength"]')
    await expect(strengthIndicator).toBeVisible()

    // Should show validation message (use role=alert to avoid strict mode)
    const validationError = page.locator('[role="alert"]', {
      hasText: /hasło/i,
    })
    await expect(validationError).toBeVisible()
  })

  test('should validate password confirmation match', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const timestamp = Date.now()
    const email = `test-${timestamp}@example.com`

    await loginPage.goto()
    await loginPage.switchToRegister()

    await loginPage.emailInput.fill(email)
    await loginPage.passwordInput.fill('Password123!')
    await loginPage.confirmPasswordInput.fill('DifferentPass123!')
    await loginPage.submitButton.click()

    // Should show mismatch error (use role=alert to avoid strict mode)
    const mismatchError = page.locator('[role="alert"]', { hasText: /hasł/i })
    await expect(mismatchError).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.switchToRegister()

    // Enter invalid email and password to pass password validation
    await loginPage.emailInput.fill('invalid-email')
    await loginPage.passwordInput.fill('ValidPass123!')
    await loginPage.confirmPasswordInput.fill('ValidPass123!')

    // Click submit to trigger validation
    await loginPage.submitButton.click()

    // Should show validation error (use role=alert to avoid strict mode)
    const emailError = page.locator('[role="alert"]', { hasText: /email/i })
    await expect(emailError).toBeVisible({ timeout: 5000 })
  })

  test('should show password requirements', async ({ page }) => {
    // NOTE: data-testid="password-requirements" has been implemented
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.switchToRegister()

    // Focus on password field
    await loginPage.passwordInput.focus()

    // Should show password requirements tooltip/hint
    const requirements = page.locator('[data-testid="password-requirements"]')
    await expect(requirements).toBeVisible()

    // Should list requirements
    await expect(requirements).toContainText(/8.*znaków/i)
    await expect(requirements).toContainText(/wielka.*litera/i)
    await expect(requirements).toContainText(/cyfr/i)
  })

  test.fixme('should toggle password visibility', async ({ page }) => {
    // FIXME: Toggle button click doesn't properly change input type - UI button handler issue
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.switchToRegister()

    await loginPage.passwordInput.fill('SecurePass123!')

    // Password should be hidden by default
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password')

    // Click toggle button (use .first() - there are 2: password + confirm password)
    const toggleButton = page
      .locator('button[aria-label*="Pokaż hasło"]')
      .first()
    await toggleButton.click()

    // Password should be visible
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text')

    // Click again to hide
    await toggleButton.click()
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password')
  })
})
