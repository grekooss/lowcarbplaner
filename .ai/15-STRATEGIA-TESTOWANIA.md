# Strategia Testowania - LowCarbPlaner

## Przegląd

Kompleksowa strategia testowania dla LowCarbPlaner MVP, implementująca wielowarstwową piramidę testową dla zapewnienia jakości kodu, niezawodności i doświadczenia użytkownika.

**Aktualny Status Testów:** 94.2% wskaźnik zaliczonych (114/121 testów)

---

## Piramida Testowa

```
                    ╱ ╲
                   ╱ E2E ╲          ~10 krytycznych przepływów
                  ╱───────╲
                 ╱Integration╲      ~30 testów funkcjonalnych
                ╱─────────────╲
               ╱  Testy Unit   ╲    ~80 testów algorytmów/narzędzi
              ╱─────────────────╲
             ╱  Analiza Statyczna ╲  TypeScript + ESLint
            ╱─────────────────────╲
```

### Rozkład Warstw (Docelowy)

- **Testy E2E:** 10-15 testów (~10% łącznie)
- **Testy Integracyjne:** 30-40 testów (~30% łącznie)
- **Testy Jednostkowe:** 70-90 testów (~60% łącznie)

---

## 1. Testowanie Jednostkowe (Vitest)

### Cele Pokrycia

- **Pokrycie ogólne:** ≥ 80%
- **Algorytmy krytyczne:** ≥ 95%
- **Narzędzia i pomocniki:** ≥ 85%
- **Hooki React:** ≥ 90%

### Co Testować

#### ✅ Poprawność Algorytmów

```typescript
// src/lib/algorithms/__tests__/macroCalculator.test.ts
describe('Kalkulator Makro (Mifflin-St Jeor)', () => {
  test('poprawnie oblicza PPM dla mężczyzny', () => {
    const result = calculateBMR({
      gender: 'male',
      weight: 80,
      height: 180,
      age: 30,
    })
    expect(result).toBeCloseTo(1850, 0) // tolerancja ±0.5 kcal
  })

  test('oblicza TDEE z mnożnikiem aktywności', () => {
    const bmr = 1850
    const tdee = calculateTDEE(bmr, 'moderate')
    expect(tdee).toBeCloseTo(2868, 0)
  })

  test('wymusza minimalny próg kaloryczny', () => {
    const result = calculateDailyTarget({
      gender: 'female',
      tdee: 1500,
      goal: 'weight_loss',
      weightLossRate: 1.0,
    })
    expect(result).toBeGreaterThanOrEqual(1400) // Ograniczenie bezpieczeństwa
  })
})
```

#### ✅ Funkcje Narzędziowe

```typescript
// src/lib/utils/__tests__/dateHelpers.test.ts
describe('Pomocniki Dat', () => {
  test('getNextSevenDays zwraca tablicę 7 dat', () => {
    const dates = getNextSevenDays(new Date('2025-01-01'))
    expect(dates).toHaveLength(7)
    expect(dates[0]).toBe('2025-01-01')
    expect(dates[6]).toBe('2025-01-07')
  })

  test('formatMealDate prawidłowo obsługuje strefę czasową', () => {
    const formatted = formatMealDate(new Date('2025-01-15T12:00:00Z'))
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
```

#### ✅ Walidacje Schematu Zod

```typescript
// src/lib/validations/__tests__/onboarding.test.ts
describe('Walidacja Schematu Onboardingu', () => {
  test('akceptuje poprawne dane profilowe', () => {
    const valid = {
      gender: 'male',
      age: 30,
      weight: 80,
      height: 180,
      activityLevel: 'moderate',
      goal: 'weight_loss',
      weightLossRate: 0.5,
    }
    expect(() => onboardingSchema.parse(valid)).not.toThrow()
  })

  test('odrzuca nieprawidłowy zakres wieku', () => {
    const invalid = { age: 15 } // Min wiek to 18
    expect(() => onboardingSchema.parse(invalid)).toThrow(ZodError)
  })

  test('odrzuca nieprawidłowy poziom aktywności', () => {
    const invalid = { activityLevel: 'super_high' } // Nie w enum
    expect(() => onboardingSchema.parse(invalid)).toThrow()
  })
})
```

#### ✅ Niestandardowe Hooki React

```typescript
// src/lib/hooks/__tests__/useMealPlan.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

describe('Hook useMealPlan', () => {
  test('pobiera plan posiłków dla danej daty', async () => {
    const queryClient = new QueryClient()
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useMealPlan('2025-01-15'), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toHaveLength(3) // śniadanie, obiad, kolacja
  })

  test('obsługuje pusty plan posiłków z gracją', async () => {
    const { result } = renderHook(() => useMealPlan('2099-01-01'))
    await waitFor(() => expect(result.current.data).toEqual([]))
  })
})
```

---

## 2. Testowanie Integracyjne (Vitest + React Testing Library)

### Cele Pokrycia

- **Integracja komponentów:** ≥ 70%
- **Przepływy formularzy:** 100% formularzy krytycznych
- **Logika klienta API:** ≥ 80%

### Co Testować

#### ✅ Zachowanie Komponentów z Zamockowanymi API

```typescript
// src/components/dashboard/__tests__/MealCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { MealCard } from '../MealCard'

describe('Komponent MealCard', () => {
  const mockMeal = {
    id: '1',
    recipe: { name: 'Jajecznica', imageUrl: '/eggs.jpg' },
    mealType: 'breakfast',
    calories: 350,
    isConsumed: false
  }

  test('poprawnie renderuje szczegóły posiłku', () => {
    render(<MealCard meal={mockMeal} />)
    expect(screen.getByText('Jajecznica')).toBeInTheDocument()
    expect(screen.getByText('350 kcal')).toBeInTheDocument()
  })

  test('przełącza stan zjedzony po kliknięciu checkboxa', async () => {
    const onToggle = vi.fn()
    render(<MealCard meal={mockMeal} onToggleConsumed={onToggle} />)

    const checkbox = screen.getByRole('checkbox', { name: /zjedzono/i })
    fireEvent.click(checkbox)

    expect(onToggle).toHaveBeenCalledWith('1', true)
  })

  test('nawiguje do szczegółów przepisu po kliknięciu', () => {
    const { container } = render(<MealCard meal={mockMeal} />)
    const card = container.querySelector('[data-testid="meal-card"]')

    fireEvent.click(card)
    // Sprawdź czy nastąpiła nawigacja (mock useRouter)
  })
})
```

#### ✅ Przepływy Przesyłania Formularzy

```typescript
// src/components/onboarding/__tests__/OnboardingForm.test.tsx
describe('Przepływ Formularza Onboardingu', () => {
  test('pomyślnie kończy formularz wieloetapowy', async () => {
    render(<OnboardingForm />)

    // Krok 1: Płeć
    fireEvent.click(screen.getByLabelText('Mężczyzna'))
    fireEvent.click(screen.getByRole('button', { name: /dalej/i }))

    // Krok 2: Antropometria
    fireEvent.change(screen.getByLabelText('Wiek'), { target: { value: '30' } })
    fireEvent.change(screen.getByLabelText('Waga (kg)'), { target: { value: '80' } })
    fireEvent.change(screen.getByLabelText('Wzrost (cm)'), { target: { value: '180' } })
    fireEvent.click(screen.getByRole('button', { name: /dalej/i }))

    // Krok 3: Poziom Aktywności
    fireEvent.click(screen.getByLabelText(/umiarkowana/i))
    fireEvent.click(screen.getByRole('button', { name: /dalej/i }))

    // Krok 4: Cel
    fireEvent.click(screen.getByLabelText(/utrata wagi/i))
    fireEvent.click(screen.getByLabelText('0.5 kg/tydzień'))
    fireEvent.click(screen.getByRole('button', { name: /oblicz/i }))

    // Sprawdź czy wyświetlono wyliczone wyniki
    await waitFor(() => {
      expect(screen.getByText(/2868 kcal/i)).toBeInTheDocument()
    })
  })

  test('waliduje wymagane pola przed nawigacją', async () => {
    render(<OnboardingForm />)

    // Próba przejścia dalej bez wyboru płci
    fireEvent.click(screen.getByRole('button', { name: /dalej/i }))

    expect(screen.getByText(/wybierz płeć/i)).toBeInTheDocument()
  })
})
```

#### ✅ Logika Zarządzania Stanem

```typescript
// src/lib/stores/__tests__/authStore.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../authStore'

describe('Sklep Auth', () => {
  beforeEach(() => {
    useAuthStore.getState().reset()
  })

  test('ustawia użytkownika przy logowaniu', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setUser({ id: '1', email: 'test@example.com' })
    })

    expect(result.current.user).toEqual({ id: '1', email: 'test@example.com' })
    expect(result.current.isAuthenticated).toBe(true)
  })

  test('czyści użytkownika przy wylogowaniu', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setUser({ id: '1', email: 'test@example.com' })
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})
```

---

## 3. Testowanie End-to-End (Playwright)

### Cele Pokrycia

- **Krytyczne podróże użytkownika:** 100%
- **Zgodność międzyprzeglądarkowa:** Chrome, Firefox, Safari
- **Viewporty mobilne:** ≥ 2 testowane rozmiary urządzeń

### Konfiguracja Środowiska Testowego

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
})
```

### Krytyczne Podróże Użytkownika

#### ✅ Podróż 1: Rejestracja i Onboarding Nowego Użytkownika

```typescript
// tests/e2e/auth/signup-flow.spec.ts
test('kompletny przepływ rejestracji i onboardingu', async ({ page }) => {
  // 1. Nawiguj do strony rejestracji
  await page.goto('/auth/signup')

  // 2. Wypełnij formularz rejestracji
  await page.fill('input[name="email"]', 'newuser@example.com')
  await page.fill('input[name="password"]', 'SecurePass123!')
  await page.click('button[type="submit"]')

  // 3. Sprawdź przekierowanie do onboardingu
  await expect(page).toHaveURL(/\/onboarding/)
  await expect(page.locator('h1')).toContainText('Wybierz płeć')

  // 4. Ukończ kroki onboardingu
  await page.click('label:has-text("Mężczyzna")')
  await page.click('button:has-text("Dalej")')

  await page.fill('input[name="age"]', '30')
  await page.fill('input[name="weight"]', '80')
  await page.fill('input[name="height"]', '180')
  await page.click('button:has-text("Dalej")')

  await page.click('label:has-text("Umiarkowana")')
  await page.click('button:has-text("Dalej")')

  await page.click('label:has-text("Utrata wagi")')
  await page.click('label:has-text("0.5 kg/tydzień")')
  await page.click('button:has-text("Oblicz")')

  // 5. Sprawdź podsumowanie celu
  await expect(page.locator('text=/2868 kcal/i')).toBeVisible()
  await page.click('button:has-text("Zatwierdź")')

  // 6. Zaakceptuj disclaimer
  await page.check('input[type="checkbox"]')
  await page.click('button:has-text("Rozpocznij")')

  // 7. Poczekaj na generowanie planu posiłków
  await expect(page.locator('text=/generowanie planu/i')).toBeVisible()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 })

  // 8. Sprawdź czy dashboard się załadował
  await expect(page.locator('h1')).toContainText(/dzisiaj|today/i)
  await expect(page.locator('[data-testid="meal-card"]')).toHaveCount(3)
})
```

#### ✅ Podróż 2: Codzienne Śledzenie Posiłków

```typescript
// tests/e2e/dashboard/meal-tracking.spec.ts
test('oznacz posiłki jako zjedzone i śledź postęp', async ({ page }) => {
  await page.goto('/dashboard')

  // 1. Sprawdź początkowe paski postępu na 0%
  const calorieBar = page.locator('[data-testid="progress-calories"]')
  await expect(calorieBar).toHaveAttribute('aria-valuenow', '0')

  // 2. Oznacz śniadanie jako zjedzone
  await page.click('[data-meal-type="breakfast"] input[type="checkbox"]')

  // 3. Sprawdź aktualizację postępu
  await expect(calorieBar).not.toHaveAttribute('aria-valuenow', '0')

  // 4. Otwórz szczegóły przepisu
  await page.click('[data-meal-type="breakfast"]')
  await expect(page.locator('h2')).toContainText(/składniki/i)

  // 5. Sprawdź widoczność rozkładu składników
  await expect(
    page.locator('[data-testid="ingredient-item"]')
  ).toHaveCount.greaterThan(2)
})
```

#### ✅ Podróż 3: Zamiana Posiłku

```typescript
// tests/e2e/meal-plan/meal-swap.spec.ts
test('zamień posiłek na alternatywny przepis', async ({ page }) => {
  await page.goto('/dashboard')

  // 1. Kliknij "Zmień danie" na obiedzie
  await page.click('[data-meal-type="lunch"] button:has-text("Zmień danie")')

  // 2. Sprawdź otwarcie listy alternatyw
  await expect(page.locator('[data-testid="meal-alternatives"]')).toBeVisible()
  await expect(
    page.locator('[data-testid="alternative-recipe"]')
  ).toHaveCount.greaterThan(3)

  // 3. Wybierz pierwszą alternatywę
  const firstAlternative = page
    .locator('[data-testid="alternative-recipe"]')
    .first()
  const newMealName = await firstAlternative.locator('h3').textContent()
  await firstAlternative.click()

  // 4. Sprawdź aktualizację posiłku w dashboardzie
  await expect(page.locator('[data-meal-type="lunch"] h3')).toContainText(
    newMealName
  )
})
```

#### ✅ Podróż 4: Interakcja z Listą Zakupów

```typescript
// tests/e2e/shopping/shopping-list.spec.ts
test('interakcja z listą zakupów', async ({ page }) => {
  await page.goto('/shopping-list')

  // 1. Sprawdź czy lista zawiera pozycje
  const items = page.locator('[data-testid="shopping-item"]')
  await expect(items).toHaveCount.greaterThan(5)

  // 2. Odznacz pierwszy element
  const firstItem = items.first()
  await firstItem.locator('input[type="checkbox"]').check()

  // 3. Sprawdź czy element został przeniesiony na dół i przekreślony
  await expect(firstItem).toHaveCSS('text-decoration', /line-through/)

  // 4. Cofnij odznaczenie elementu
  await firstItem.locator('input[type="checkbox"]').uncheck()

  // 5. Sprawdź przywrócenie elementu
  await expect(firstItem).not.toHaveCSS('text-decoration', /line-through/)
})
```

#### ✅ Podróż 5: Aktualizacja Profilu i Regeneracja Planu

```typescript
// tests/e2e/profile/profile-update.spec.ts
test('aktualizuj profil i uruchom regenerację planu', async ({ page }) => {
  await page.goto('/profile')

  // 1. Aktualizuj wagę
  await page.fill('input[name="weight"]', '75') // Zmieniono z 80 na 75
  await page.click('button:has-text("Zapisz")')

  // 2. Sprawdź dialog potwierdzenia
  await expect(
    page.locator('text=/plan zostanie zaktualizowany/i')
  ).toBeVisible()
  await page.click('button:has-text("Potwierdź")')

  // 3. Poczekaj na regenerację
  await expect(page.locator('text=/aktualizowanie planu/i')).toBeVisible()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 })

  // 4. Sprawdź wyświetlenie nowego celu kalorycznego
  const newTarget = await page
    .locator('[data-testid="daily-calorie-target"]')
    .textContent()
  expect(parseInt(newTarget)).toBeLessThan(2868) // Powinno być niższe z powodu utraty wagi
})
```

---

## 4. Testowanie Regresji Wizualnej

### Narzędzia

- **Zrzuty Ekranu Playwright:** Automatyczne przechwytywanie zrzutów przy błędach
- **Ręczne QA:** Wizualna inspekcja kluczowych ekranów

### Kluczowe Ekrany do Monitorowania

1. Dashboard (Widok Dzisiaj) - Desktop i Mobile
2. Modal Szczegółów Przepisu - Z/bez modyfikacji składników
3. Lista Zakupów - Stany puste, częściowe, ukończone
4. Przepływ Onboardingu - Wszystkie 4 kroki
5. Ustawienia Profilu - Stany walidacji formularza

---

## 5. Testowanie Wydajności

### Metryki do Monitorowania

```typescript
// tests/performance/lighthouse.spec.ts
test('dashboard spełnia cele wydajności', async ({ page }) => {
  await page.goto('/dashboard')

  const metrics = await page.evaluate(
    () => performance.getEntriesByType('navigation')[0]
  )

  expect(metrics.loadEventEnd - metrics.fetchStart).toBeLessThan(3000) // LCP < 3s
  expect(metrics.domInteractive - metrics.domLoading).toBeLessThan(1000) // FID < 1s
})
```

### Testowanie Obciążenia

- **Narzędzie:** Artillery lub k6
- **Cel:** 100 równoczesnych użytkowników generujących plany posiłków
- **Kryteria Sukcesu:**
  - Czas odpowiedzi API p95 < 500ms
  - Generowanie planu posiłków p95 < 15s
  - Zero błędów 5xx

---

## 6. Testowanie Dostępności

### Automatyczne Sprawdzenia

```typescript
// tests/a11y/dashboard.spec.ts
import { injectAxe, checkA11y } from 'axe-playwright'

test('dashboard nie ma naruszeń dostępności', async ({ page }) => {
  await page.goto('/dashboard')
  await injectAxe(page)
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true },
  })
})
```

### Sprawdzenia Ręczne

- Nawigacja klawiaturą (Tab, Enter, Escape)
- Testowanie czytnika ekranu (NVDA, JAWS)
- Kontrast kolorów (standard WCAG AA)
- Widoczne wskaźniki fokusu

---

## 7. Integracja CI/CD

### Workflow GitHub Actions

```yaml
name: Pipeline Testowania CI

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test -- --coverage
      - uses: codecov/codecov-action@v4

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 8. Zarządzanie Danymi Testowymi

### Strategia Testowej Bazy Danych

```bash
# Klonuj dane testowe podobne do produkcyjnych
npm run db:clone

# Zresetuj testową bazę danych do czystego stanu
npm run db:reset:test

# Zasiej minimalne dane testowe
npm run db:seed:test
```

### Dane Fixture

```typescript
// tests/fixtures/users.ts
export const testUsers = {
  newUser: {
    email: 'new@test.com',
    password: 'TestPass123!',
  },
  existingUser: {
    id: 'test-user-123',
    email: 'existing@test.com',
    onboardingCompleted: true,
    dailyCalories: 2000,
  },
}

// tests/fixtures/recipes.ts
export const testRecipes = {
  breakfast: {
    id: 'recipe-breakfast-1',
    name: 'Jajecznica',
    mealType: 'breakfast',
    calories: 350,
    protein: 25,
    carbs: 5,
    fats: 28,
  },
}
```

---

## 9. Wytyczne Utrzymania Testów

### Kiedy Pisać Testy

- ✅ Przed implementacją nowych funkcji (podejście TDD)
- ✅ Podczas naprawy błędów (test regresji)
- ✅ Podczas refaktoryzacji krytycznych ścieżek kodu
- ✅ Dla wszystkich zmian algorytmów

### Kiedy Aktualizować Testy

- 🔄 Zmiany kontraktów API
- 🔄 Zmiany zachowania komponentów UI
- 🔄 Migracje schematu bazy danych
- 🔄 Ewolucja wymagań logiki biznesowej

### Kiedy Usuwać Testy

- ❌ Funkcja usunięta z produktu
- ❌ Test jest niestabilny i zawodny
- ❌ Test duplikuje istniejące pokrycie

---

## 10. Bramy Jakości

### Sprawdzenia Pre-Commit (Husky)

```bash
# .husky/pre-commit
npm run lint
npm run type-check
npm run test -- --run --changed
```

### Sprawdzenia Pre-Push

```bash
# .husky/pre-push
npm run test -- --run
npm run build
```

### Wymagania Merge PR

- ✅ Wszystkie testy CI zaliczone
- ✅ Pokrycie kodu ≥ 80%
- ✅ Brak nierozwiązanych błędów lintingu
- ✅ Zatwierdzony przegląd kodu

---

## Zasoby i Narzędzia

### Dokumentacja

- [Dokumentacja Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Dokumentacja Playwright](https://playwright.dev/)
- [Trofeum Testowania](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

### Rozszerzenia VSCode

- Vitest Runner (rozszerzenie do uruchamiania testów inline)
- Playwright Test for VSCode
- Coverage Gutters (wizualizacja pokrycia kodu)

---

**Ostatnia Aktualizacja:** 2025-10-30
**Utrzymywane przez:** Zespół QA i Deweloperski
