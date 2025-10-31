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
    // Use UPSERT to handle duplicate emails (from failed cleanup)
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .upsert(
        {
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
        },
        {
          onConflict: 'email', // Handle duplicate email gracefully
        }
      )

    if (profileError) {
      console.error(`❌ Failed to create profile:`, profileError)
      // Cleanup auth user if profile creation fails
      await supabaseClient.auth.admin.deleteUser(authData.user.id)
      throw new Error(
        `Failed to create test user profile: ${profileError.message}`
      )
    }

    console.log(`✅ Created test profile for: ${email}`)

    // Wait for profile to be fully committed and available in database
    // Active polling prevents race conditions better than arbitrary timeout
    const maxWaitTime = 10000 // 10 seconds max
    const pollInterval = 200 // Check every 200ms
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      const { data: verifyProfile, error: verifyError } = await supabaseClient
        .from('profiles')
        .select('id, disclaimer_accepted_at')
        .eq('id', authData.user.id)
        .single()

      if (!verifyError && verifyProfile?.disclaimer_accepted_at) {
        console.log(
          `✅ Profile verified in database (took ${Date.now() - startTime}ms)`
        )
        break
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval))
    }

    const testUser: TestUser = {
      email,
      password,
      userId: authData.user.id,
    }

    // Use the test user
    await provide(testUser)

    // Cleanup: delete user after test
    try {
      // Delete profile first (by both ID and email to ensure cleanup)
      await supabaseClient
        .from('profiles')
        .delete()
        .or(`id.eq.${authData.user.id},email.eq.${email}`)

      // Then delete auth user (this will cascade delete other related data)
      await supabaseClient.auth.admin.deleteUser(authData.user.id)

      console.log(`🧹 Cleaned up test user: ${email}`)
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
  authenticatedPage: async ({ page, testUser, supabaseClient }, provide) => {
    // Sign in using Supabase client API (more reliable than UI)
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    })

    if (error || !data.session) {
      throw new Error(`Failed to sign in test user: ${error?.message}`)
    }

    // Set session in browser storage
    await page.goto('/auth')
    await page.waitForLoadState('domcontentloaded')

    // Inject Supabase session into localStorage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const storageKey =
      'sb-' + new URL(supabaseUrl).hostname.split('.')[0] + '-auth-token'

    await page.evaluate(
      ({ session, key }) => {
        localStorage.setItem(key, JSON.stringify(session))
      },
      { session: data.session, key: storageKey }
    )

    // Navigate to home to trigger auth state
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    // Wait for redirect away from /auth (can be /, /dashboard, or /onboarding)
    await page.waitForURL((url) => !url.pathname.includes('/auth'), {
      timeout: 15000,
    })

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Use the authenticated page
    await provide(page)
  },
})

export { expect } from '@playwright/test'
