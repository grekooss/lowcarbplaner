# Playwright E2E - Quick Start Guide

Get up and running with E2E tests in 5 minutes.

> **Windows Users**: See [WINDOWS_SETUP.md](./WINDOWS_SETUP.md) for detailed Windows-specific setup

## 🚀 Setup (One-time)

### 1. Create Test Database (5 minutes)

```bash
# 1. Go to https://supabase.com/dashboard
# 2. Create new project: "lowcarbplaner-test"
# 3. Note down the database password!
```

### 2. Get Credentials

From Supabase Dashboard:

- **Settings → API**: Copy URL, anon key, service_role key
- **Settings → Database**: Copy connection string (port 6543)

### 3. Configure Environment

```bash
# Linux/macOS/Git Bash
cp .env.e2e.example .env.e2e

# Windows PowerShell
Copy-Item .env.e2e.example .env.e2e

# Edit .env.e2e and fill in:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
SOURCE_DATABASE_URL=postgresql://...  # Your dev DB
TARGET_DATABASE_URL=postgresql://...  # Your test DB
```

### 4. Clone Database

```bash
# Clone schema + test data
npm run db:clone

# Verify
npm run db:test:verify
```

**Full guide**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)

### 5. Install Browsers (if not done)

```bash
npx playwright install chromium
```

---

## ▶️ Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (recommended for development)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/auth/login.spec.ts

# Debug mode
npm run test:e2e:debug
```

### First Test Run

1. Start your dev server in another terminal:

   ```bash
   npm run dev
   ```

2. Run tests:

   ```bash
   npm run test:e2e:chromium
   ```

3. View results:
   ```bash
   npm run test:e2e:report
   ```

---

## 📝 Writing Your First Test

### 1. Create Test File

```typescript
// tests/e2e/my-feature/my-test.spec.ts
import { test, expect } from '../fixtures/auth'

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/my-page')
    await page.click('button:has-text("Click Me")')
    await expect(page.locator('text=Success')).toBeVisible()
  })
})
```

### 2. Run Your Test

```bash
npx playwright test tests/e2e/my-feature/my-test.spec.ts --headed
```

### 3. Debug If Needed

```bash
npx playwright test tests/e2e/my-feature/my-test.spec.ts --debug
```

---

## 🎯 Common Patterns

### Test with Authentication

```typescript
test('dashboard test', async ({ authenticatedPage: page }) => {
  // Already logged in!
  await page.goto('/dashboard')
  // ... your test
})
```

### Test with Setup Data

```typescript
import { setupUserProfile, setupMealPlan } from '../fixtures/test-data'

test.beforeEach(async ({ testUser, supabaseClient }) => {
  await setupUserProfile(supabaseClient, testUser.userId)
  await setupMealPlan(supabaseClient, testUser.userId)
})

test('meal plan test', async ({ authenticatedPage: page }) => {
  // User has profile + meal plan ready
})
```

### Use Page Objects

```typescript
import { DashboardPage } from '../utils/page-objects/DashboardPage'

test('use page object', async ({ authenticatedPage: page }) => {
  const dashboard = new DashboardPage(page)

  await dashboard.goto()
  await dashboard.swapMeal('breakfast')

  const protein = await dashboard.getMacroValue('protein')
  expect(protein).toBeGreaterThan(0)
})
```

---

## 🐛 Debugging Tips

### Visual Debugging

```bash
# Best: UI Mode (interactive)
npm run test:e2e:ui

# Good: Headed mode (see browser)
npm run test:e2e:headed

# Advanced: Step-by-step debugging
npm run test:e2e:debug
```

### View Trace (After Failure)

```bash
npx playwright show-trace test-results/.../trace.zip
```

### Add Console Logs

```typescript
test('debug', async ({ page }) => {
  console.log('Current URL:', page.url())

  page.on('console', (msg) => console.log('Browser:', msg.text()))
})
```

---

## 📚 Next Steps

- Read full guide: [README.md](./README.md)
- Explore existing tests: [tests/e2e/](.)
- Learn Page Objects: [utils/page-objects/](./utils/page-objects/)
- Understand fixtures: [fixtures/](./fixtures/)

---

## ⚡ Cheat Sheet

```bash
# Run tests
npm run test:e2e                  # Headless
npm run test:e2e:headed           # With browser
npm run test:e2e:ui               # Interactive UI
npm run test:e2e:debug            # Step-by-step

# Specific tests
npx playwright test login         # Match by name
npx playwright test auth/         # Match by folder

# Browsers
npm run test:e2e:chromium         # Chrome only
npx playwright test --project=firefox

# Reports
npm run test:e2e:report           # View HTML report
npx playwright show-trace FILE    # View trace
```

---

## 🆘 Common Issues

### "Executable doesn't exist"

```bash
npx playwright install chromium
```

### "Failed to create test user"

- Check `.env.e2e` credentials
- Verify service role key permissions
- Ensure test database is accessible

### "Timeout waiting for page"

- Increase timeout: `test.setTimeout(90000)`
- Check network: `await page.waitForLoadState('networkidle')`
- Use proper waits, not `waitForTimeout`

### Flaky tests

- Use data-testid attributes
- Wait for responses, not timeouts
- Ensure test isolation (beforeEach setup)

---

## 💡 Pro Tips

1. **Always use test fixtures** for auth and data
2. **Write Page Objects** for complex pages
3. **Use data-testid** in components
4. **Wait for network responses**, not arbitrary delays
5. **Run UI mode** during development
6. **Check traces** when tests fail

---

**Ready to write tests?** Start with [README.md](./README.md) for the complete guide!
