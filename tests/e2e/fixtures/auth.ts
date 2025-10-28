import { test as base, type Page } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Test User Type
 */
export type TestUser = {
  email: string
  password: string
  userId: string
}

/**
 * Extended Test Fixtures
 */
type AuthFixtures = {
  testUser: TestUser
  authenticatedPage: Page
  supabaseClient: SupabaseClient
}

/**
 * Create Supabase client for test operations
 */
function createTestSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Extended Playwright test with authentication fixtures
 *
 * Usage:
 * ```typescript
 * import { test, expect } from './fixtures/auth'
 *
 * test('dashboard loads', async ({ authenticatedPage }) => {
 *   await authenticatedPage.goto('/dashboard')
 *   // ... test with authenticated session
 * })
 * ```
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Supabase client fixture for test setup/teardown
   */
  supabaseClient: async ({}, provide) => {
    const client = createTestSupabaseClient()
    await provide(client)
  },

  /**
   * Create a test user for each test
   * Automatically cleans up after test completes
   */
  testUser: async ({ supabaseClient }, provide) => {
    const timestamp = Date.now()
    const email = `test-${timestamp}@lowcarbplaner.test`
    const password = 'Test123!Pass'

    // Create test user using Supabase Admin API
    const { data: authData, error: signUpError } =
      await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for tests
      })

    if (signUpError || !authData.user) {
      throw new Error(`Failed to create test user: ${signUpError?.message}`)
    }

    console.log(`✅ Created test user: ${email} (ID: ${authData.user.id})`)

    // Create profile for test user (required by app after login)
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        disclaimer_accepted_at: new Date().toISOString(), // Accept disclaimer automatically for tests
        // Default profile values for tests
        age: 30,
        gender: 'male',
        height_cm: 175,
        weight_kg: 75,
        activity_level: 'moderate',
        goal: 'weight_loss',
        target_calories: 2000,
        target_protein_g: 150,
        target_carbs_g: 50,
        target_fats_g: 140,
        weight_loss_rate_kg_week: 0.5,
      })

    if (profileError) {
      console.error(`❌ Failed to create profile:`, profileError)
      // Cleanup auth user if profile creation fails
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
      throw new Error(
        `Failed to create test user profile: ${profileError.message}`
      )
    }

    console.log(`✅ Created test profile for: ${email}`)

    // Wait longer to ensure profile is fully committed to database
    // This prevents race conditions where login happens before profile is available
    // Increased from 500ms to 2000ms to handle batch test scenarios
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const testUser: TestUser = {
      email,
      password,
      userId: authData.user.id,
    }

    // Use the test user
    await provide(testUser)

    // Cleanup: delete user after test
    try {
      // Delete profile first
      await supabaseClient.from('profiles').delete().eq('id', authData.user.id)

      // Then delete auth user (this will cascade delete other related data)
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
    } catch (cleanupError) {
      console.warn(
        `Warning: Failed to cleanup test user ${email}:`,
        cleanupError
      )
    }
  },

  /**
   * Authenticated page fixture
   * Provides a page that's already logged in with testUser
   */
  authenticatedPage: async ({ page, testUser }, provide) => {
    // Navigate to auth page
    await page.goto('/auth')

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded')

    // Fill login form
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)

    // Submit login
    await page.click('button[type="submit"]:has-text("Zaloguj")')

    // Wait for redirect away from /auth (can be /, /dashboard, or /onboarding)
    await page.waitForURL(/^(?!.*\/auth)/, { timeout: 15000 })

    // Use the authenticated page
    await provide(page)
  },
})

export { expect } from '@playwright/test'
