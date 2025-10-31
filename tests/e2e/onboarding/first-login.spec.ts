import { test, expect } from '../fixtures/auth'

test.describe('Onboarding - First Login Flow', () => {
  test('should complete full onboarding for new user', async ({
    page,
    testUser,
  }) => {
    // 1. Login with new user (profile already created by fixture with disclaimer accepted)
    await page.goto('/auth')
    await page.waitForLoadState('domcontentloaded')

    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.click('button[type="submit"]:has-text("Zaloguj")')

    // 2. Should redirect to dashboard (profile is pre-filled by fixture)
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15000 })

    // 3. If redirected to onboarding, complete it
    if (page.url().includes('/onboarding')) {
      // Wait for onboarding page to load
      await page.waitForLoadState('networkidle')

      // Check for welcome message or onboarding title
      await expect(
        page.locator('h1, h2').filter({ hasText: /witaj|onboarding|start/i })
      ).toBeVisible({ timeout: 10000 })

      // Complete onboarding steps (if any additional steps exist)
      // Look for "Continue" or "Next" buttons
      const continueButton = page.locator(
        'button:has-text("Dalej"), button:has-text("Kontynuuj"), button:has-text("Rozpocznij")'
      )

      if (await continueButton.isVisible()) {
        await continueButton.click()
        await page.waitForLoadState('networkidle')
      }
    }

    // 4. Should eventually land on dashboard
    await page.waitForURL('/dashboard', { timeout: 15000 })

    // 5. Verify dashboard components are visible
    await expect(page.locator('[data-testid="meal-card"]').first()).toBeVisible(
      { timeout: 10000 }
    )
    await expect(page.locator('[data-macro="protein"]')).toBeVisible()
  })

  test('should redirect authenticated user directly to dashboard', async ({
    authenticatedPage: page,
  }) => {
    // User is already logged in via fixture
    // Should be on dashboard or home page, not auth
    await expect(page).not.toHaveURL('/auth', { timeout: 10000 })

    // Navigate to dashboard
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Should see dashboard content
    await expect(page.locator('[data-testid="meal-card"]').first()).toBeVisible(
      { timeout: 10000 }
    )
  })

  test('should prevent access to onboarding if already completed', async ({
    authenticatedPage: page,
  }) => {
    // Try to access onboarding page directly
    await page.goto('/onboarding')
    await page.waitForLoadState('networkidle')

    // Should redirect to dashboard (onboarding already complete)
    // Or show dashboard content
    const currentUrl = page.url()
    const isDashboard =
      currentUrl.includes('/dashboard') ||
      (await page.locator('[data-testid="meal-card"]').count()) > 0

    expect(isDashboard).toBe(true)
  })

  test('should show user profile data in dashboard', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Check if macro targets are visible (from user profile)
    const proteinTarget = page.locator('[data-macro="protein"]')
    await expect(proteinTarget).toBeVisible()

    const proteinText = await proteinTarget.textContent()
    expect(proteinText).toMatch(/\d+/)

    // Check calories target
    const caloriesTarget = page.locator('[data-macro="calories"]')
    await expect(caloriesTarget).toBeVisible()

    const caloriesText = await caloriesTarget.textContent()
    expect(caloriesText).toMatch(/\d+/)
  })
})
