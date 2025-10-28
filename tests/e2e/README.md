# E2E Testing Guide - LowCarbPlaner

Comprehensive guide for Playwright end-to-end tests in the LowCarbPlaner project.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Structure](#test-structure)
- [Best Practices](#best-practices)
- [Debugging](#debugging)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)

---

## Overview

### What are E2E Tests?

End-to-end tests simulate real user interactions with your application, testing the entire stack:

- Frontend UI (React components)
- Backend API (Next.js API routes)
- Database (Supabase)
- Authentication (Supabase Auth)

### Why Playwright?

- **Cross-browser**: Chrome, Firefox, Safari, Mobile
- **Fast & Reliable**: Parallel execution, auto-waiting
- **Developer Experience**: UI mode, trace viewer, debugging tools
- **CI/CD Ready**: Native GitHub Actions support

### Coverage Goals

- **Critical Flows**: 100% (auth, onboarding, meal planning)
- **Feature Flows**: 80% (recipes, shopping list, profile)
- **Edge Cases**: 60% (error states, validation)

---

## Setup

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account (test environment)
- PostgreSQL client tools (`psql`, `pg_dump`)

> **Windows Users**: See [WINDOWS_SETUP.md](./WINDOWS_SETUP.md) for platform-specific instructions

### Installation

Playwright is already installed. To reinstall or add browsers:

```bash
# Install all browsers
npx playwright install

# Install specific browser
npx playwright install chromium
```

### Environment Configuration

#### Quick Setup

1. **Create Test Database** (5 minutes)
   - Create new Supabase project for testing
   - Get API credentials from Dashboard
   - **Full guide**: [DATABASE_SETUP.md](./DATABASE_SETUP.md)
   - **Windows guide**: [WINDOWS_SETUP.md](./WINDOWS_SETUP.md)

2. **Configure Environment**:

   ```bash
   # Linux/macOS/Git Bash
   cp .env.e2e.example .env.e2e

   # Windows PowerShell
   Copy-Item .env.e2e.example .env.e2e

   # Edit .env.e2e with your test project credentials
   ```

3. **Clone Database**:

   ```bash
   npm run db:clone  # Copy schema + test data
   ```

4. **Verify Setup**:
   ```bash
   npm run db:test:verify      # Check database
   npm run test:e2e:chromium   # Run tests
   ```

#### Detailed Steps

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for:

- Creating test Supabase project
- Getting connection strings
- Cloning database schema + data
- Troubleshooting common issues

⚠️ **Important**: Use a **separate test project**, not development or production!

---

## Running Tests

### Local Development

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with browser visible (headed mode)
npm run test:e2e:headed

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run specific browser
npm run test:e2e:chromium

# Run specific test file
npx playwright test tests/e2e/auth/login.spec.ts

# Run tests matching pattern
npx playwright test --grep "ingredient editing"
```

### Debug Mode

```bash
# Debug mode (step through test)
npm run test:e2e:debug

# Debug specific test
npx playwright test tests/e2e/auth/login.spec.ts --debug
```

### View Reports

```bash
# Open HTML report
npm run test:e2e:report

# View trace for failed test
npx playwright show-trace test-results/path/to/trace.zip
```

---

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '../fixtures/auth'
import { DashboardPage } from '../utils/page-objects/DashboardPage'

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/dashboard')

    // Act
    await page.click('button:has-text("Save")')

    // Assert
    await expect(page.locator('text=Saved successfully')).toBeVisible()
  })
})
```

### Using Authenticated Fixture

```typescript
test('dashboard shows meals', async ({ authenticatedPage: page }) => {
  // Page is already logged in with testUser
  await page.goto('/dashboard')

  await expect(page.locator('[data-meal-type="breakfast"]')).toBeVisible()
})
```

### Using Test Data Helpers

```typescript
import { setupUserProfile, setupMealPlan } from '../fixtures/test-data'

test.beforeEach(async ({ testUser, supabaseClient }) => {
  await setupUserProfile(supabaseClient, testUser.userId, {
    age: 25,
    weight_kg: 70,
  })
  await setupMealPlan(supabaseClient, testUser.userId)
})
```

### Page Object Model Example

```typescript
import { DashboardPage } from '../utils/page-objects/DashboardPage'

test('edit ingredient', async ({ authenticatedPage: page }) => {
  const dashboard = new DashboardPage(page)

  await dashboard.goto()
  await dashboard.editIngredientQuantity('breakfast', 0, 150)

  const protein = await dashboard.getMacroValue('protein')
  expect(protein).toBeGreaterThan(0)
})
```

---

## Test Structure

```
tests/e2e/
├── auth/                      # Authentication tests
│   ├── login.spec.ts
│   ├── registration.spec.ts
│   └── password-reset.spec.ts
│
├── dashboard/                 # Dashboard tests
│   ├── daily-view.spec.ts
│   └── ingredient-editing.spec.ts
│
├── meal-plan/                 # Meal plan tests
│   ├── recipe-swapping.spec.ts
│   └── weekly-view.spec.ts
│
├── fixtures/                  # Test helpers
│   ├── auth.ts               # Auth fixtures
│   └── test-data.ts          # Data setup/teardown
│
└── utils/
    └── page-objects/          # Page Object Model
        ├── LoginPage.ts
        └── DashboardPage.ts
```

---

## Best Practices

### 1. Use Page Object Model

✅ **Good**:

```typescript
const dashboard = new DashboardPage(page)
await dashboard.editIngredientQuantity('breakfast', 0, 150)
```

❌ **Bad**:

```typescript
await page.click('[data-meal-type="breakfast"] button[aria-label="Edit"]')
await page.fill('input[type="number"]', '150')
await page.click('button:has-text("Save")')
```

### 2. Use Test Fixtures

✅ **Good**:

```typescript
test('test', async ({ authenticatedPage: page, testUser }) => {
  // Already logged in, user auto-cleaned up
})
```

❌ **Bad**:

```typescript
test('test', async ({ page }) => {
  // Manual login, manual cleanup
  await page.goto('/auth')
  await page.fill('[name="email"]', 'test@example.com')
  // ...
})
```

### 3. Wait for Actions, Not Timeouts

✅ **Good**:

```typescript
await page.click('button:has-text("Save")')
await page.waitForResponse((response) =>
  response.url().includes('/api/planned-meals')
)
```

❌ **Bad**:

```typescript
await page.click('button:has-text("Save")')
await page.waitForTimeout(2000) // Flaky!
```

### 4. Use Data Attributes

Add `data-testid` attributes to your components:

```tsx
<div data-testid='meal-card' data-meal-type='breakfast'>
  <button data-testid='swap-button'>Zamień</button>
</div>
```

Then in tests:

```typescript
await page.locator('[data-testid="swap-button"]').click()
```

### 5. Isolate Tests

Each test should be independent:

```typescript
test.beforeEach(async ({ testUser, supabaseClient }) => {
  // Setup fresh data for each test
  await setupMealPlan(supabaseClient, testUser.userId)
})
```

---

## Debugging

### Visual Debugging

```bash
# UI Mode (best for development)
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through)
npm run test:e2e:debug
```

### Trace Viewer

When tests fail, Playwright automatically captures traces:

```bash
npx playwright show-trace test-results/.../trace.zip
```

The trace viewer shows:

- Screenshots at each step
- Network requests
- Console logs
- DOM snapshots

### Screenshots & Videos

Failed tests automatically capture:

- Screenshots: `test-results/**/*.png`
- Videos: `test-results/**/*.webm`

### Console Logging

Add debug output in tests:

```typescript
test('debug test', async ({ page }) => {
  page.on('console', (msg) => console.log('Browser:', msg.text()))

  await page.goto('/dashboard')
  console.log('Current URL:', page.url())
})
```

---

## CI/CD

### GitHub Actions

Tests run automatically on:

- Push to `main`, `master`, `develop`
- Pull requests
- Manual workflow dispatch

See [`.github/workflows/e2e-tests.yml`](../../.github/workflows/e2e-tests.yml)

### Required Secrets

Configure these in GitHub repository settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Viewing CI Results

1. Go to **Actions** tab in GitHub
2. Click on workflow run
3. Download `playwright-report` artifact
4. Extract and open `index.html`

---

## Troubleshooting

### Test Timeouts

**Problem**: Test fails with timeout error

**Solutions**:

```typescript
// Increase test timeout
test.setTimeout(90000)

// Increase specific action timeout
await page.click('button', { timeout: 15000 })

// Wait for specific condition
await page.waitForURL('/dashboard', { timeout: 30000 })
```

### Flaky Tests

**Problem**: Test passes sometimes, fails other times

**Solutions**:

1. Use `waitForResponse` instead of `waitForTimeout`
2. Wait for network idle: `await page.waitForLoadState('networkidle')`
3. Use proper selectors (data-testid, not CSS classes)
4. Ensure test isolation (fresh data in beforeEach)

### Supabase Connection Errors

**Problem**: "Failed to create test user" or "Database connection failed"

**Solutions**:

1. Check `.env.e2e` credentials are correct
2. Verify service role key has proper permissions
3. Ensure test database is accessible (not IP restricted)
4. Check Supabase project is not paused

### Browser Not Installed

**Problem**: "Executable doesn't exist at..."

**Solution**:

```bash
npx playwright install chromium
```

### Element Not Found

**Problem**: "locator.click: Target closed" or "Element not found"

**Solutions**:

```typescript
// Wait for element to be visible
await expect(page.locator('button')).toBeVisible()
await page.locator('button').click()

// Use better selector
// ❌ await page.click('.btn')
// ✅ await page.click('[data-testid="submit-button"]')
```

---

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

## Contributing

When adding new tests:

1. Follow existing structure (Page Object Model)
2. Add proper data-testid attributes to components
3. Use test fixtures for authentication and data setup
4. Write descriptive test names
5. Add comments for complex interactions
6. Ensure tests pass locally before committing

---

## Questions?

Contact the team or open an issue in the repository.
