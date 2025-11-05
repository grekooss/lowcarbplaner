/**
 * E2E tests for welcome button authentication flow
 *
 * Tests that clicking "Witaj w LoWCarbPlaner" button opens auth modal
 * for unauthenticated users and shows user menu for authenticated users.
 */

import { test, expect } from '@playwright/test'

test.describe('Welcome Button Auth Flow', () => {
  test('should open auth modal when unauthenticated user clicks welcome button', async ({
    page,
  }) => {
    // Navigate to recipes page (public page where button is visible)
    await page.goto('/recipes')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Find and click the welcome button
    const welcomeButton = page.getByRole('button', {
      name: /Witaj w LoWCarbPlaner/i,
    })
    await expect(welcomeButton).toBeVisible()
    await welcomeButton.click()

    // Verify auth modal is opened
    await expect(page).toHaveURL(/\/auth/)

    // Verify modal content is visible
    await expect(
      page.getByRole('heading', { name: /Witaj w LowCarbPlaner/i })
    ).toBeVisible()
    await expect(page.getByRole('tab', { name: /Logowanie/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Rejestracja/i })).toBeVisible()
  })

  test('should open auth modal from dashboard when unauthenticated', async ({
    page,
  }) => {
    // Navigate to dashboard (protected page)
    await page.goto('/dashboard')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Find and click the welcome button
    const welcomeButton = page.getByRole('button', {
      name: /Witaj w LoWCarbPlaner/i,
    })
    await expect(welcomeButton).toBeVisible()
    await welcomeButton.click()

    // Verify auth modal is opened with intercepting route
    await expect(page).toHaveURL(/\/auth/)

    // Verify modal content is visible
    await expect(
      page.getByRole('heading', { name: /Witaj w LowCarbPlaner/i })
    ).toBeVisible()
  })

  test.skip('should show user menu when authenticated user clicks welcome button', async ({
    page,
  }) => {
    // Navigate to dashboard
    await page.goto('/dashboard')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Find and click the welcome button (now shows user name)
    const welcomeButton = page.getByRole('button', {
      name: /Witaj/i,
    })
    await expect(welcomeButton).toBeVisible()
    await welcomeButton.click()

    // Verify user menu is displayed
    await expect(
      page.getByRole('link', { name: /Ustawienia profilu/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /Wyloguj się/i })
    ).toBeVisible()
  })

  test('should open auth modal from meal-plan when unauthenticated', async ({
    page,
  }) => {
    // Navigate to meal-plan (protected page)
    await page.goto('/meal-plan')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Find and click the welcome button
    const welcomeButton = page.getByRole('button', {
      name: /Witaj w LoWCarbPlaner/i,
    })
    await expect(welcomeButton).toBeVisible()
    await welcomeButton.click()

    // Verify auth modal is opened with intercepting route
    await expect(page).toHaveURL(/\/auth/)

    // Verify modal content is visible
    await expect(
      page.getByRole('heading', { name: /Witaj w LowCarbPlaner/i })
    ).toBeVisible()
  })

  test('should open auth modal from shopping-list when unauthenticated', async ({
    page,
  }) => {
    // Navigate to shopping-list (protected page)
    await page.goto('/shopping-list')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Find and click the welcome button
    const welcomeButton = page.getByRole('button', {
      name: /Witaj w LoWCarbPlaner/i,
    })
    await expect(welcomeButton).toBeVisible()
    await welcomeButton.click()

    // Verify auth modal is opened with intercepting route
    await expect(page).toHaveURL(/\/auth/)

    // Verify modal content is visible
    await expect(
      page.getByRole('heading', { name: /Witaj w LowCarbPlaner/i })
    ).toBeVisible()
  })
})
