# Tests - LowCarbPlaner Integration Tests

Kompleksowa suite testów integracyjnych dla aplikacji LowCarbPlaner.

## 📁 Struktura

```
tests/
├── integration/           # Testy integracyjne
│   ├── auth/             # Testy autentykacji
│   │   ├── registration.test.ts
│   │   ├── login.test.ts
│   │   └── password-reset.test.ts
│   ├── dashboard/        # Testy dashboard
│   │   └── daily-view.test.ts
│   ├── profile/          # Testy profilu użytkownika
│   │   └── update-goals.test.ts
│   ├── shopping-list/    # Testy listy zakupów
│   │   └── aggregation.test.ts
│   ├── meal-plan/        # Testy zarządzania planem posiłków
│   │   ├── swap-recipe.test.ts
│   │   └── ingredient-scaling.test.ts
│   └── services/         # Testy logiki biznesowej
│       ├── meal-plan-generator.test.ts
│       └── nutrition-calculator.test.ts
├── fixtures/             # Dane testowe
│   ├── users.ts
│   ├── profiles.ts
│   ├── recipes.ts
│   └── planned-meals.ts
├── helpers/              # Narzędzia testowe
│   ├── test-utils.tsx    # React Testing Library setup
│   └── test-supabase.ts  # Mock Supabase client
└── setup/                # Konfiguracja globalna
    ├── setup-tests.ts    # Global setup (MSW, cleanup)
    └── msw-handlers.ts   # Mock Service Worker handlers
```

---

## 🚀 Uruchamianie Testów

### Instalacja zależności

```bash
npm install
```

### Uruchomienie wszystkich testów

```bash
npm test
```

### Uruchomienie testów w trybie watch

```bash
npm run test:watch
```

### Uruchomienie testów z UI

```bash
npm run test:ui
```

### Generowanie raportu coverage

```bash
npm run test:coverage
```

### Uruchomienie tylko testów integracyjnych

```bash
npm run test:integration
```

---

## 📊 Coverage Targets

| Obszar             | Target Coverage | Aktualny Status |
| ------------------ | --------------- | --------------- |
| **Server Actions** | ≥90%            | 🟢              |
| **Services**       | ≥95%            | 🟢              |
| **Hooks**          | ≥85%            | 🟡              |
| **Components**     | ≥80%            | 🟡              |
| **Validators**     | 100%            | 🟢              |

---

## 🧪 Przykłady Testów

### 1. Meal Plan Generator Service

**Plik**: `tests/integration/services/meal-plan-generator.test.ts`

Testuje logikę generowania planu 7-dniowego:

- ✅ Generowanie 21 posiłków (7 dni × 3 posiłki)
- ✅ Dobór przepisów według kalorii (±15%)
- ✅ Różnorodność przepisów (brak powtórzeń w tym samym dniu)
- ✅ Optymalizacja makroskładników
- ✅ Sprawdzanie istniejących planów
- ✅ Znajdowanie brakujących dni

```typescript
test('generates 7-day plan with 21 meals', async () => {
  const profile = createTestProfile()
  const plan = await generateWeeklyPlan(profile, new Date('2025-01-15'))

  expect(plan).toHaveLength(21)
  expect(plan.filter((m) => m.meal_type === 'breakfast')).toHaveLength(7)
})
```

### 2. Nutrition Calculator Service

**Plik**: `tests/integration/services/nutrition-calculator.test.ts`

Testuje kalkulator kaloryczny:

- ✅ Obliczanie BMR (Harris-Benedict)
- ✅ Obliczanie TDEE (z mnożnikiem aktywności)
- ✅ Deficyt kaloryczny dla utraty wagi
- ✅ Podział makroskładników (15%C / 35%P / 50%F)

```typescript
test('calculates TDEE with moderate multiplier', () => {
  const goals = calculateNutritionGoals({
    age: 30,
    gender: 'male',
    weight_kg: 85,
    height_cm: 180,
    activity_level: 'moderate',
    goal: 'weight_loss',
    weight_loss_rate: 'moderate',
  })

  expect(goals.tdee).toBeGreaterThan(2850)
  expect(goals.tdee).toBeLessThan(3050)
})
```

### 3. Recipe Swapping

**Plik**: `tests/integration/meal-plan/swap-recipe.test.ts`

Testuje wymianę przepisu:

- ✅ Wymiana z tym samym meal_type
- ✅ Walidacja różnicy kalorycznej ±15%
- ✅ Reset ingredient_overrides
- ✅ Wykluczenie oryginalnego przepisu
- ✅ Sortowanie według calorie_diff

```typescript
test('swaps recipe successfully', async () => {
  const result = await updatePlannedMeal(123, {
    action: 'swap_recipe',
    recipe_id: 103,
  })

  expect(result.error).toBeUndefined()
  expect(result.data?.ingredient_overrides).toBeNull()
})
```

### 4. Ingredient Scaling

**Plik**: `tests/integration/meal-plan/ingredient-scaling.test.ts`

Testuje skalowanie składników:

- ✅ Modyfikacja skalowanych składników
- ✅ Walidacja is_scalable flag
- ✅ Walidacja ilości >0
- ✅ Brak limitu górnego (backend akceptuje dowolną ilość)
- ✅ Obsługa wartości dziesiętnych

```typescript
test('modifies scalable ingredient', async () => {
  const result = await updatePlannedMeal(123, {
    action: 'modify_ingredients',
    ingredient_overrides: [{ ingredient_id: 1, new_amount: 180 }],
  })

  expect(result.error).toBeUndefined()
})
```

### 5. Authentication Flow

**Pliki**: `tests/integration/auth/*.test.ts`

Testuje kompletny flow autentykacji:

**Registration** (~20 testów):

- ✅ Email/password validation (Zod)
- ✅ Password strength indicator
- ✅ Duplicate email handling
- ✅ Profile creation after signup

**Login** (~25 testów):

- ✅ Email/password authentication
- ✅ Google OAuth flow
- ✅ Session management
- ✅ Redirect after login

**Password Reset** (~15 testów):

- ✅ Forgot password flow
- ✅ Reset token validation
- ✅ Security (rate limiting)

```typescript
test('validates password requirements', async () => {
  const result = await signUp('test@example.com', 'weak')
  expect(result.error).toContain('minimum 8 characters')
})

test('OAuth creates profile for new users', async () => {
  const result = await signInWithOAuth('google')
  expect(result.data.user).toBeDefined()
  // Sprawdź czy profil został utworzony
})
```

### 6. Dashboard Daily View

**Plik**: `tests/integration/dashboard/daily-view.test.ts`

Testuje widok dziennego planu (~40 testów):

- ✅ Wyświetlanie posiłków z bieżącego dnia
- ✅ Nawigacja kalendarzowa (7 dni)
- ✅ Progress bars dla makroskładników
- ✅ Auto-generacja brakujących posiłków
- ✅ Interakcje z kartami posiłków

```typescript
test('displays macro progress bars', () => {
  render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

  expect(screen.getByText(/kalorie/i)).toBeInTheDocument()
  expect(screen.getByText(/białko/i)).toBeInTheDocument()

  // Kalorie: 1800 / 1800 (100%)
  expect(screen.getByText(/1800.*\/ 1800/)).toBeInTheDocument()
})

test('navigates to next day', async () => {
  const user = userEvent.setup()
  render(<DashboardClient />)

  const nextButton = screen.getByRole('button', { name: /następny/i })
  await user.click(nextButton)

  // Data powinna się zmienić
  expect(screen.getByText(/jutro/i)).toBeInTheDocument()
})
```

### 7. Profile Management

**Plik**: `tests/integration/profile/update-goals.test.ts`

Testuje zarządzanie profilem (~35 testów):

- ✅ Aktualizacja wagi (30-300kg validation)
- ✅ Zmiana poziomu aktywności
- ✅ Automatyczne przeliczanie makroskładników
- ✅ Feedback mechanism

```typescript
test('recalculates goals after weight update', async () => {
  const mockUpdate = vi.fn().mockResolvedValue({
    data: {
      ...testProfile,
      weight_kg: 80,
      target_calories: 1750,
      target_protein_g: 153
    }
  })

  render(<ProfileForm />)

  const weightInput = screen.getByLabelText(/waga/i)
  await user.clear(weightInput)
  await user.type(weightInput, '80')

  await user.click(screen.getByRole('button', { name: /zapisz/i }))

  // Nowe cele powinny być wyświetlone
  expect(screen.getByText(/1750.*kcal/i)).toBeInTheDocument()
})
```

### 8. Shopping List Aggregation

**Plik**: `tests/integration/shopping-list/aggregation.test.ts`

Testuje listę zakupów (~30 testów):

- ✅ Agregacja składników z 6-dniowego zakresu (jutro + 5 dni)
- ✅ Uwzględnienie ingredient_overrides
- ✅ Grupowanie po kategoriach
- ✅ Offline persistence (localStorage)
- ✅ Checkbox state management

```typescript
test('calculates 6-day range (tomorrow + 5 days)', async () => {
  render(<ShoppingListClient />)

  await waitFor(() => {
    expect(getShoppingList).toHaveBeenCalled()
  })

  const callArgs = vi.mocked(getShoppingList).mock.calls[0]
  const startDate = new Date(callArgs[0]!)
  const endDate = new Date(callArgs[1]!)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  expect(startDate.toDateString()).toBe(tomorrow.toDateString())
})

test('saves checked state to localStorage', async () => {
  const user = userEvent.setup()
  render(<ShoppingListClient />)

  const checkbox = screen.getAllByRole('checkbox')[0]
  await user.click(checkbox)

  const savedState = localStorage.getItem('shopping-list-purchased')
  const parsed = JSON.parse(savedState!)
  expect(parsed).toContain(1) // ingredient_id 1
})
```

---

## 🛠️ Narzędzia Testowe

### React Testing Library

Custom render z providers:

```typescript
import { render } from '../../helpers/test-utils'

test('renders component', () => {
  const { getByText } = render(<MyComponent />)
  expect(getByText('Hello')).toBeInTheDocument()
})
```

### Mock Supabase Client

Mock dla Supabase operacji:

```typescript
import { createMockSupabaseClient } from '../../helpers/test-supabase'

const supabase = createMockSupabaseClient()
```

### MSW (Mock Service Worker)

Mockowanie HTTP requestów:

```typescript
// tests/setup/msw-handlers.ts
export const handlers = [
  http.post('*/auth/v1/signup', () => {
    return HttpResponse.json({ user: { id: 'test-id' } })
  }),
]
```

---

## 📝 Fixtures (Dane Testowe)

### Users

```typescript
import { testUser, createTestUser } from '../fixtures/users'

const user = createTestUser({ email: 'custom@example.com' })
```

### Profiles

```typescript
import { testProfile, createTestProfile } from '../fixtures/profiles'

const profile = createTestProfile({ target_calories: 2000 })
```

### Recipes

```typescript
import {
  testRecipeBreakfast,
  testRecipeLunch,
  testRecipeDinner,
} from '../fixtures/recipes'
```

### Planned Meals

```typescript
import { testPlannedMeals, generateWeekPlan } from '../fixtures/planned-meals'

const weekPlan = generateWeekPlan('2025-01-15') // 21 posiłków
```

---

## 🔧 Konfiguracja

### vitest.config.ts

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup/setup-tests.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
})
```

### Global Setup

Plik `tests/setup/setup-tests.ts` konfiguruje:

- @testing-library/jest-dom matchers
- MSW server (Mock Service Worker)
- Cleanup po każdym teście

---

## 📈 Continuous Improvement

### ✅ Zaimplementowane Testy

- [x] **Auth Flow** - Rejestracja, logowanie, OAuth, password reset (3 pliki, ~60 testów)
- [x] **Dashboard** - Daily view, nawigacja kalendarz, progress bars, auto-generation (~40 testów)
- [x] **Shopping List** - Agregacja składników, kategorie, localStorage, offline (~30 testów)
- [x] **Profile Management** - Update goals, recalculation macros, feedback mechanism (~35 testów)
- [x] **Meal Plan Services** - Generator planów, nutrition calculator (47 testów)
- [x] **Meal Plan Operations** - Recipe swapping, ingredient scaling (23 testy)

**Łączna liczba testów**: ~235 testów integracyjnych

### Brakujące Testy (TODO)

- [ ] Onboarding Calculator - Początkowa konfiguracja profilu
- [ ] Feedback Mechanism - Komponenty UI do zbierania feedbacku
- [ ] Recipe Detail View - Wyświetlanie szczegółów przepisu
- [ ] Recipe Search & Filters - Wyszukiwanie i filtrowanie przepisów

### Rozszerzenia

- [ ] E2E testy (Playwright) - Testy end-to-end całych user flows
- [ ] Visual regression tests - Testy wizualne komponentów
- [ ] Performance tests - Testy wydajności aplikacji
- [ ] Accessibility tests (a11y) - Testy dostępności WCAG

---

## 🐛 Debugging

### Uruchomienie pojedynczego testu

```bash
npx vitest run tests/integration/services/meal-plan-generator.test.ts
```

### Debug w VS Code

Dodaj do `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test"],
  "console": "integratedTerminal"
}
```

### Wyświetlanie logów

```typescript
import { vi } from 'vitest'

test('debug example', () => {
  console.log('Debug info')
  vi.spyOn(console, 'log')
  // ...
})
```

---

## 📚 Dokumentacja

- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [MSW](https://mswjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## ✅ Checklist przed Commitowaniem

- [ ] Wszystkie testy przechodzą (`npm test`)
- [ ] Coverage ≥80% (`npm run test:coverage`)
- [ ] Brak błędów TypeScript (`npm run type-check`)
- [ ] Kod sformatowany (`npm run format`)
- [ ] Linty przechodzą (`npm run lint`)
