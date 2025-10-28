import { test } from '@playwright/test'

test.describe('Environment Diagnostic', () => {
  test('should show which Supabase URL is being used', async ({ page }) => {
    console.log('🔍 Starting diagnostic test...')

    // Idź na stronę główną
    await page.goto('/')

    // Czekaj aż strona się załaduje
    await page.waitForLoadState('networkidle')

    // Sprawdź localStorage aby zobaczyć URL Supabase
    const supabaseKey = await page.evaluate(() => {
      const keys = Object.keys(localStorage)
      return keys.find((key) => key.includes('supabase'))
    })

    console.log(
      '📦 localStorage keys:',
      await page.evaluate(() => Object.keys(localStorage))
    )

    if (supabaseKey) {
      const supabaseData = await page.evaluate((key) => {
        return localStorage.getItem(key)
      }, supabaseKey)

      console.log('🔑 Supabase data:', supabaseData)
    }

    // Sprawdź network requests
    const requests: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('supabase.co')) {
        requests.push(request.url())
        console.log('🌐 Supabase request:', request.url())
      }
    })

    // Odśwież stronę aby zobaczyć requesty
    await page.reload()
    await page.waitForLoadState('networkidle')

    console.log('📊 Total Supabase requests:', requests.length)
    console.log('📋 Request URLs:', requests)

    // Sprawdź które requesty zawierają który URL
    const testDBRequests = requests.filter((url) =>
      url.includes('mmdjbjbuxivvpvgsvsfj')
    )
    const devDBRequests = requests.filter((url) =>
      url.includes('pkjdgaqwdletfkvniljx')
    )

    console.log(
      '✅ Test DB requests (mmdjbjbuxivvpvgsvsfj):',
      testDBRequests.length
    )
    console.log(
      '❌ Dev DB requests (pkjdgaqwdletfkvniljx):',
      devDBRequests.length
    )

    // Sprawdź czy używa testowej bazy
    if (testDBRequests.length > 0) {
      console.log('✅ SUCCESS: Application is using TEST database!')
    } else if (devDBRequests.length > 0) {
      console.log('❌ FAIL: Application is using DEV database!')
    } else {
      console.log('⚠️  WARNING: No Supabase requests detected!')
    }
  })
})
