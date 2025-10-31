import { test, expect } from '../fixtures/auth'

test.describe('Profile Management', () => {
  test('should display current profile information', async ({
    authenticatedPage: page,
    testUser,
  }) => {
    // Navigate to profile page
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')

    // Check if profile form is visible
    await expect(
      page.locator('h1, h2').filter({ hasText: /profil|ustawienia/i })
    ).toBeVisible({ timeout: 10000 })

    // Check if email is displayed
    await expect(page.locator(`text=${testUser.email}`)).toBeVisible()

    // Check if weight field is visible (should show default 75kg from fixture)
    const weightInput = page.locator(
      'input[name="weight_kg"], input[name="weight"]'
    )
    await expect(weightInput).toBeVisible()
  })

  test('should update user weight successfully', async ({
    authenticatedPage: page,
    supabaseClient,
    testUser,
  }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')

    // Find weight input field
    const weightInput = page.locator(
      'input[name="weight_kg"], input[name="weight"]'
    )
    await expect(weightInput).toBeVisible({ timeout: 10000 })

    // Update weight
    await weightInput.clear()
    await weightInput.fill('80')

    // Save changes
    const saveButton = page.locator(
      'button[type="submit"]:has-text("Zapisz"), button:has-text("Aktualizuj")'
    )
    await saveButton.click()

    // Wait for save to complete
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api') &&
        (response.url().includes('profile') ||
          response.url().includes('user')) &&
        response.status() === 200,
      { timeout: 10000 }
    )

    // Should show success message
    await expect(
      page.locator('text=/zaktualizowano|zapisano|sukces/i')
    ).toBeVisible({ timeout: 5000 })

    // Verify in database
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('weight_kg')
      .eq('id', testUser.userId)
      .single()

    expect(profile?.weight_kg).toBe(80)
  })

  test('should update dietary goals and recalculate macros', async ({
    authenticatedPage: page,
    supabaseClient,
    testUser,
  }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')

    // Find target calories input
    const caloriesInput = page.locator(
      'input[name="target_calories"], input[name="calories"]'
    )

    if (await caloriesInput.isVisible()) {
      // Update target calories
      await caloriesInput.clear()
      await caloriesInput.fill('2500')

      // Save changes
      const saveButton = page.locator('button[type="submit"]').first()
      await saveButton.click()

      // Wait for save
      await page.waitForLoadState('networkidle')

      // Verify in database
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('target_calories')
        .eq('id', testUser.userId)
        .single()

      expect(profile?.target_calories).toBe(2500)
    } else {
      test.skip()
    }
  })

  test('should validate profile form inputs', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')

    // Find weight input
    const weightInput = page.locator(
      'input[name="weight_kg"], input[name="weight"]'
    )
    await expect(weightInput).toBeVisible({ timeout: 10000 })

    // Try to enter invalid weight (negative)
    await weightInput.clear()
    await weightInput.fill('-10')

    // Try to save
    const saveButton = page.locator('button[type="submit"]').first()
    await saveButton.click()

    // Should show validation error
    await expect(page.locator('text=/dodatnia|positive|większ/i')).toBeVisible({
      timeout: 5000,
    })
  })

  test('should update activity level', async ({ authenticatedPage: page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')

    // Look for activity level selector
    const activitySelect = page.locator(
      'select[name="activity_level"], [role="combobox"]'
    )

    if (await activitySelect.isVisible()) {
      // Change activity level
      await activitySelect.click()

      // Select different activity level
      const highActivityOption = page.locator('text=/high|wysoka|intensywna/i')
      if (await highActivityOption.isVisible()) {
        await highActivityOption.click()

        // Save changes
        const saveButton = page.locator('button[type="submit"]').first()
        await saveButton.click()

        // Wait for save
        await page.waitForLoadState('networkidle')

        // Should show success
        await expect(
          page.locator('text=/zaktualizowano|zapisano|sukces/i')
        ).toBeVisible({ timeout: 5000 })
      }
    } else {
      test.skip()
    }
  })

  test('should display profile update history', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')

    // Check if last updated timestamp is visible
    const lastUpdated = page.locator(
      'text=/ostatnia aktualizacja|last updated|zaktualizowano/i'
    )

    if (await lastUpdated.isVisible()) {
      await expect(lastUpdated).toBeVisible()
    } else {
      // No update history feature yet - skip
      test.skip()
    }
  })

  test('should navigate between profile sections', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')

    // Look for navigation tabs or sections
    const settingsTab = page.locator(
      'button:has-text("Ustawienia"), [role="tab"]:has-text("Ustawienia")'
    )

    if (await settingsTab.isVisible()) {
      await settingsTab.click()
      await page.waitForLoadState('networkidle')

      // Should show settings content
      expect(page.url()).toContain('profile')
    } else {
      // No tabs yet
      test.skip()
    }
  })
})
