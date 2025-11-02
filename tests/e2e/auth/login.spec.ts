import { test, expect } from '../fixtures/auth'
import { LoginPage } from '../utils/page-objects/LoginPage'

test.describe('User Login', () => {
  test('should successfully login with valid credentials', async ({
    page,
    testUser,
  }) => {
    const loginPage = new LoginPage(page)

    // Navigate to auth page
    await loginPage.goto()

    // Perform login
    await loginPage.login(testUser.email, testUser.password)

    // Should redirect away from /auth page after successful login
    // (can be /, /dashboard, or /onboarding depending on profile state)
    await expect(page).not.toHaveURL(/\/auth/, { timeout: 15000 })

    // Verify user is logged in by checking that login form is NOT visible
    // This works for both desktop and mobile layouts
    await expect(
      page.getByRole('button', { name: 'Zaloguj się' })
    ).not.toBeVisible({ timeout: 5000 })
  })

  test('should show error with invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.login('invalid@example.com', 'wrongpassword')

    // Should show error message
    await expect(loginPage.errorAlert).toBeVisible({ timeout: 5000 })

    // Should stay on auth page
    await expect(page).toHaveURL('/auth')
  })

  test('should show validation error for empty email', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.emailInput.fill('')
    await loginPage.passwordInput.fill('password123')
    await loginPage.submitButton.click()

    // Should show validation error (use role=alert to avoid strict mode violation)
    const validationError = page.locator('[role="alert"]', {
      hasText: /email/i,
    })
    await expect(validationError).toBeVisible()
  })

  test('should show validation error for empty password', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.emailInput.fill('test@example.com')
    await loginPage.passwordInput.fill('')
    await loginPage.submitButton.click()

    // Should show validation error (use role=alert to avoid strict mode violation)
    const validationError = page.locator('[role="alert"]', {
      hasText: /hasło/i,
    })
    await expect(validationError).toBeVisible()
  })

  test('should navigate to registration form', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()

    // Click on Rejestracja tab
    await loginPage.switchToRegister()

    // Should show confirm password field (only in registration)
    await expect(loginPage.confirmPasswordInput).toBeVisible({ timeout: 5000 })

    // Verify tab is active
    await expect(loginPage.registerTab).toHaveAttribute('data-state', 'active')
  })

  test('should navigate to forgot password', async ({ page }) => {
    const loginPage = new LoginPage(page)

    // Navigate to auth page (goto() clears storage and reloads)
    await loginPage.goto()

    // Wait for page to fully load after reload
    await page.waitForLoadState('networkidle')

    // Check if forgot password link exists and click it
    // Use exact text match with Polish characters
    const forgotPasswordLink = page.getByRole('link', {
      name: 'Zapomniałem hasła',
    })

    // Wait for link to be visible
    await forgotPasswordLink.waitFor({ state: 'visible', timeout: 5000 })

    // Click and wait for navigation
    await Promise.all([
      page.waitForURL('/auth/forgot-password', { timeout: 5000 }),
      forgotPasswordLink.click(),
    ])

    // Verify we're on the forgot password page
    await expect(page).toHaveURL('/auth/forgot-password')
  })

  test('should persist session after page reload', async ({
    authenticatedPage: page,
  }) => {
    // Start with authenticated page (can be /, /dashboard, or /onboarding)
    await expect(page).not.toHaveURL('/auth', { timeout: 10000 })

    // Verify user is logged in by checking that login form is NOT visible
    await expect(
      page.getByRole('button', { name: 'Zaloguj się' })
    ).not.toBeVisible({ timeout: 10000 })

    // Reload page
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    // Should still be authenticated (not redirected to /auth)
    await expect(page).not.toHaveURL('/auth', { timeout: 10000 })

    // Login form should still NOT be visible after reload
    await expect(
      page.getByRole('button', { name: 'Zaloguj się' })
    ).not.toBeVisible({ timeout: 10000 })
  })
})
