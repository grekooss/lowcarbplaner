import { test } from '@playwright/test'

test.describe('Supabase Configuration Diagnostic', () => {
  test('should show which Supabase URL the app is using', async ({ page }) => {
    console.log('🔍 Testing Supabase configuration...')

    // Listen for all network requests
    const supabaseRequests: string[] = []
    page.on('request', (request) => {
      const url = request.url()
      if (url.includes('supabase.co')) {
        supabaseRequests.push(url)
        console.log('📡 Supabase request:', url)
      }
    })

    // Go to auth page which should make Supabase calls
    await page.goto('/auth')
    await page.waitForLoadState('networkidle')

    // Try to trigger a Supabase call by attempting login with invalid credentials
    await page.fill('input[type="email"]', 'diagnostic@test.com')
    await page.fill('input[type="password"]', 'diagnostic123')
    await page.click('button[type="submit"]')

    // Wait for response
    await page.waitForTimeout(3000)

    console.log('\n📊 Results:')
    console.log('Total Supabase requests:', supabaseRequests.length)

    const testDBRequests = supabaseRequests.filter((url) =>
      url.includes('mmdjbjbuxivvpvgsvsfj')
    )
    const devDBRequests = supabaseRequests.filter((url) =>
      url.includes('pkjdgaqwdletfkvniljx')
    )

    console.log('✅ Test DB (mmdjbjbuxivvpvgsvsfj):', testDBRequests.length)
    console.log('❌ Dev DB (pkjdgaqwdletfkvniljx):', devDBRequests.length)

    if (testDBRequests.length > 0) {
      console.log('\n✅ SUCCESS: Application is using TEST database!')
    } else if (devDBRequests.length > 0) {
      console.log('\n❌ FAIL: Application is still using DEV database!')
    } else {
      console.log('\n⚠️  WARNING: No Supabase requests detected!')
    }
  })
})
