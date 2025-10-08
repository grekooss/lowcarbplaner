# Testowanie

## Unit Tests (Vitest)

### Konfiguracja

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.next/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

### Przykłady Testów

#### Utils - BMR Calculator

```typescript
// lib/utils/bmr-calculator.test.ts
import { describe, it, expect } from 'vitest'
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
} from './bmr-calculator'

describe('calculateBMR', () => {
  it('calculates BMR correctly for male', () => {
    const bmr = calculateBMR('male', 80, 175, 30)
    expect(bmr).toBeCloseTo(1780, 0)
  })

  it('calculates BMR correctly for female', () => {
    const bmr = calculateBMR('female', 65, 165, 28)
    expect(bmr).toBeCloseTo(1411, 0)
  })
})

describe('calculateTDEE', () => {
  it('calculates TDEE with moderate activity', () => {
    const bmr = 1780
    const tdee = calculateTDEE(bmr, 'moderate')
    expect(tdee).toBe(2759)
  })
})

describe('calculateMacros', () => {
  it('calculates macros correctly (15% carbs, 35% protein, 50% fats)', () => {
    const macros = calculateMacros(2000)
    expect(macros.carbs).toBeCloseTo(75, 0) // (2000 * 0.15) / 4
    expect(macros.protein).toBeCloseTo(175, 0) // (2000 * 0.35) / 4
    expect(macros.fats).toBeCloseTo(111, 0) // (2000 * 0.5) / 9
  })
})
```

---

## Component Tests (React Testing Library)

### Konfiguracja

```typescript
// vitest.setup.ts
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)
afterEach(() => {
  cleanup()
})
```

### Przykłady

```typescript
// components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## E2E Tests (Playwright)

### Konfiguracja

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Przykłady

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('user can log in', async ({ page }) => {
  await page.goto('/login')

  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText('Witaj')).toBeVisible()
})

test('user can create match', async ({ page }) => {
  await page.goto('/matches/new')

  await page.fill('input[name="title"]', 'Test Match')
  await page.fill('input[name="location"]', 'Park')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL(/\/matches\/\w+/)
})
```

---

## Mockowanie Supabase

```typescript
// __mocks__/supabase.ts
import { vi } from 'vitest'

export const supabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      })),
    })),
  })),
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: {} }, error: null })),
  },
}
```

---

📚 **Więcej szczegółów:** Zobacz inne pliki w `.claude/docs/`
