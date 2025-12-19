# Architektura Projektu

## Przegląd architektury

**LowCarbPlaner** wykorzystuje **architekturę dwuwarstwową** dla operacji API:

### 1. **Server Actions** (Warstwa biznesowa)

- **Lokalizacja:** `src/lib/actions/*.ts`
- **Odpowiedzialność:** Cała logika biznesowa, walidacja, interakcja z bazą danych
- **Użycie:** Bezpośrednio z Server Components lub przez API Route Handlers
- **Zwraca:** `ActionResult<T>` (discriminated union: `{ data: T } | { error: string }`)

### 2. **API Route Handlers** (Warstwa HTTP)

- **Lokalizacja:** `app/api/**/route.ts`
- **Odpowiedzialność:** Cienka warstwa HTTP - wywołuje Server Actions
- **Użycie:** REST API dla Client Components
- **Zwraca:** JSON response z odpowiednimi kodami statusu

### Przepływ danych

```
Server Component → Server Action → Supabase
                         ↑
Client Component → API Route → Server Action → Supabase
```

**Zalecenie:** Preferuj bezpośrednie użycie Server Actions w Server Components dla lepszej wydajności.

---

## Struktura Katalogów

### Pełna Struktura

```
lowcarbplaner/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Publiczne routes (bez auth)
│   │   ├── auth/                 # Login page
│   │   │   ├── forgot-password/  # Reset hasła - request
│   │   │   ├── reset-password/   # Reset hasła - nowe hasło
│   │   │   └── callback/         # OAuth callback (route.ts)
│   │   └── onboarding/           # Wizard onboardingu
│   ├── api/                      # API Route Handlers
│   │   ├── feedback/             # POST /api/feedback
│   │   ├── planned-meals/        # GET, POST /api/planned-meals
│   │   │   └── [id]/             # GET, PATCH, DELETE /api/planned-meals/{id}
│   │   │       └── replacements/ # GET /api/planned-meals/{id}/replacements
│   │   ├── profile/              # GET, POST /api/profile
│   │   │   └── me/               # GET /api/profile/me
│   │   ├── recipes/              # GET /api/recipes
│   │   │   └── [id]/             # GET /api/recipes/{id}
│   │   └── shopping-list/        # GET /api/shopping-list
│   ├── dashboard/                # Widok Dnia (główny ekran)
│   │   └── (..)auth/             # Intercepting route dla modala auth
│   ├── meal-plan/                # Widok tygodniowy
│   │   └── (..)auth/             # Intercepting route dla modala auth
│   ├── profile/                  # Profil użytkownika
│   ├── recipes/                  # Przeglądarka przepisów
│   │   ├── [id]/                 # Szczegóły przepisu
│   │   └── (.)[id]/              # Parallel route dla modala
│   ├── shopping-list/            # Lista zakupów
│   │   └── (..)auth/             # Intercepting route dla modala auth
│   ├── layout.tsx                # Root layout (Montserrat font)
│   ├── page.tsx                  # Landing page
│   └── loading.tsx               # Global loading state
│
├── src/
│   ├── components/
│   │   ├── auth/                 # Komponenty autoryzacji
│   │   │   ├── AuthClient.tsx
│   │   │   ├── AuthModal.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   ├── ResetPasswordForm.tsx
│   │   │   └── SocialAuthButton.tsx
│   │   ├── dashboard/            # Dashboard components
│   │   │   ├── CalendarStrip.tsx
│   │   │   ├── DashboardClient.tsx
│   │   │   ├── MacroProgressBar.tsx
│   │   │   ├── MacroProgressSection.tsx
│   │   │   ├── MealCard.tsx
│   │   │   ├── MealsList.tsx
│   │   │   ├── IngredientEditor.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── meal-plan/            # Meal plan components
│   │   │   ├── MealPlanClient.tsx
│   │   │   ├── DayCard.tsx
│   │   │   ├── DayList.tsx
│   │   │   ├── MealCard.tsx
│   │   │   ├── WeekTable.tsx
│   │   │   └── RecipeModal.tsx
│   │   ├── onboarding/           # Onboarding wizard steps
│   │   │   ├── OnboardingClient.tsx
│   │   │   ├── GenderStep.tsx
│   │   │   ├── AgeStep.tsx
│   │   │   ├── WeightStep.tsx
│   │   │   ├── HeightStep.tsx
│   │   │   ├── ActivityLevelStep.tsx
│   │   │   ├── GoalStep.tsx
│   │   │   ├── WeightLossRateStep.tsx
│   │   │   ├── SummaryStep.tsx
│   │   │   └── GeneratingStep.tsx
│   │   ├── profile/              # Profile components
│   │   │   ├── ProfileClient.tsx
│   │   │   ├── ProfileEditForm.tsx
│   │   │   ├── CurrentTargetsCard.tsx
│   │   │   ├── MacroCard.tsx
│   │   │   └── FeedbackCard.tsx
│   │   ├── recipes/              # Recipe components
│   │   │   ├── RecipeCard.tsx
│   │   │   ├── RecipesGrid.tsx
│   │   │   ├── RecipesBrowserClient.tsx
│   │   │   ├── RecipeFilters.tsx
│   │   │   ├── RecipeModal.tsx
│   │   │   └── detail/           # Recipe detail subcomponents
│   │   │       ├── RecipeDetailPage.tsx
│   │   │       ├── IngredientsList.tsx
│   │   │       ├── InstructionsList.tsx
│   │   │       └── MacroSummary.tsx
│   │   ├── shared/               # Shared components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── RecipePreviewModal.tsx
│   │   │   └── SwapRecipeDialog.tsx
│   │   ├── shopping-list/        # Shopping list components
│   │   │   ├── ShoppingListClient.tsx
│   │   │   ├── ShoppingListAccordion.tsx
│   │   │   ├── ShoppingListItem.tsx
│   │   │   ├── CategorySection.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── layout/               # Layout components
│   │   │   └── AppShell.tsx
│   │   └── ui/                   # shadcn/ui components (23 files)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── progress.tsx
│   │       ├── charts/           # Recharts wrapper
│   │       │   └── index.tsx
│   │       └── ...
│   │
│   ├── hooks/                    # Custom React hooks (14 files)
│   │   ├── useAuth.ts            # Authentication state
│   │   ├── useUser.ts            # Current user data
│   │   ├── usePlannedMealsQuery.ts
│   │   ├── useSwapRecipe.ts
│   │   ├── useReplacementRecipes.ts
│   │   ├── useDailyMacros.ts
│   │   ├── useCalendarDays.ts
│   │   ├── useMealToggle.ts
│   │   ├── useWeekMealsCheck.ts
│   │   ├── useAutoGenerateMealPlan.ts
│   │   ├── useProfileForm.ts
│   │   ├── useIngredientEditor.ts
│   │   ├── useIngredientViewer.ts
│   │   └── useIsMobile.ts
│   │
│   ├── lib/
│   │   ├── actions/              # Server Actions (business logic)
│   │   │   ├── feedback.ts
│   │   │   ├── planned-meals.ts
│   │   │   ├── profile.ts
│   │   │   ├── recipes.ts
│   │   │   └── shopping-list.ts
│   │   ├── hooks/                # Lib-specific hooks (3 files)
│   │   │   ├── useAuthCheck.ts
│   │   │   ├── useAuthPrompt.ts
│   │   │   └── useRecipesFilter.ts
│   │   ├── react-query/          # TanStack Query
│   │   │   ├── query-provider.tsx
│   │   │   └── queries/
│   │   │       ├── useRecipeQuery.ts
│   │   │       └── useRecipesQuery.ts
│   │   ├── supabase/             # Supabase client setup
│   │   │   ├── client.ts         # Browser client
│   │   │   ├── server.ts         # Server client
│   │   │   └── middleware.ts     # Auth middleware
│   │   ├── validation/           # Zod schemas
│   │   │   ├── auth.ts
│   │   │   ├── feedback.ts
│   │   │   ├── planned-meals.ts
│   │   │   ├── profile.ts
│   │   │   ├── recipes.ts
│   │   │   └── shopping-list.ts
│   │   ├── zustand/              # Zustand stores
│   │   │   └── stores/
│   │   │       └── useDashboardStore.ts
│   │   ├── utils/                # Utility functions
│   │   │   ├── cache-headers.ts
│   │   │   ├── date-formatting.ts
│   │   │   ├── rate-limit.ts
│   │   │   ├── require-auth.ts
│   │   │   ├── sanitize.ts
│   │   │   └── type-guards.ts
│   │   ├── env.ts                # Environment variables validation
│   │   └── utils.ts              # cn() utility
│   │
│   ├── services/                 # Core business logic
│   │   ├── nutrition-calculator.ts  # BMR/TDEE/Macros
│   │   ├── meal-plan-generator.ts   # 7-day plan generation
│   │   └── shopping-list.ts         # Ingredient aggregation
│   │
│   └── types/                    # TypeScript types
│       ├── database.types.ts     # Supabase generated
│       └── meal-plan-view.types.ts
│
├── tests/                        # Test files
│   ├── integration/              # Integration tests
│   ├── fixtures/                 # Test fixtures
│   ├── mocks/                    # MSW mocks
│   └── setup/                    # Test setup
│
└── supabase/                     # Supabase config (Cloud only)
    └── migrations/               # SQL migrations
```

---

## Path Aliases

### Konfiguracja (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Przykłady Użycia

```typescript
// ✅ Poprawnie
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { calculateBMR } from '@/services/nutrition-calculator'

// ❌ Niepoprawnie
import { Button } from '../../../components/ui/button'
```

---

## shadcn/ui Configuration

### Konfiguracja (components.json)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/lib/hooks"
  }
}
```

### Dodawanie Komponentów

```bash
npx shadcn@latest add button
npx shadcn@latest add card dialog progress
```

### Zainstalowane Komponenty (23)

accordion, alert, alert-dialog, badge, button, card, checkbox, dialog, form, input, label, progress, radio-group, scroll-area, select, separator, skeleton, slider, sonner, tabs, textarea, visually-hidden, charts

---

## Intercepting & Parallel Routes

Projekt wykorzystuje zaawansowane wzorce routingu Next.js:

### Intercepting Routes `(..)`

Używane do wyświetlania modali auth bez opuszczania strony:

```
app/dashboard/(..)auth/page.tsx    → Przechwytuje /auth z /dashboard
app/meal-plan/(..)auth/page.tsx    → Przechwytuje /auth z /meal-plan
app/shopping-list/(..)auth/page.tsx → Przechwytuje /auth z /shopping-list
```

### Parallel Routes `(.)`

Używane do wyświetlania recipe detail jako modal:

```
app/recipes/(.)[id]/page.tsx       → Recipe detail jako modal overlay
```

---

## Konwencje Nazewnictwa

### Pliki i Katalogi

| Typ            | Konwencja         | Przykład                                |
| -------------- | ----------------- | --------------------------------------- |
| Komponenty     | PascalCase        | `MealCard.tsx`, `MacroProgressBar.tsx`  |
| Hooks          | camelCase z `use` | `useAuth.ts`, `usePlannedMealsQuery.ts` |
| Utilities      | camelCase         | `nutrition-calculator.ts`               |
| Server Actions | camelCase         | `planned-meals.ts`                      |
| Validation     | camelCase         | `profile.ts`                            |
| Types          | camelCase         | `database.types.ts`                     |

### Komponenty

```typescript
// ✅ Poprawnie - named export
export function MealCard() {}
export function MacroProgressBar() {}

// ✅ Poprawnie - Client Component page
export default function DashboardClient() {}
```

---

## Kluczowe Typy Danych

### ActionResult Pattern

```typescript
type ActionResult<T> = { data: T } | { error: string }

// Użycie
const result = await getRecipes(params)
if ('error' in result) {
  console.error(result.error)
  return
}
const recipes = result.data
```

### Database Types (Supabase Generated)

```typescript
// src/types/database.types.ts - auto-generated
import type { Database } from '@/types/database.types'

type Recipe = Database['content']['Tables']['recipes']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type PlannedMeal = Database['public']['Tables']['planned_meals']['Row']
```

### Enum Types

```typescript
type GenderEnum = 'male' | 'female'
type ActivityLevelEnum = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
type GoalEnum = 'weight_maintenance' | 'weight_loss'
type MealTypeEnum = 'breakfast' | 'lunch' | 'snack' | 'dinner'
type IngredientCategoryEnum = 'vegetables' | 'meat' | 'dairy' | ...
```

---

## Stylowanie (Tailwind CSS 4)

### CSS-based Configuration

Tailwind CSS 4 używa konfiguracji w CSS zamiast `tailwind.config.ts`:

```css
/* app/globals.css */
@import 'tailwindcss';

@theme {
  --color-primary: #dc2626;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

### cn() Utility

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## TypeScript Configuration

### Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Kluczowe:** Wszystkie funkcje kalkulacji BMR/TDEE i Server Actions muszą być ściśle typowane.

---

📚 **Więcej szczegółów:** Zobacz inne pliki w `.claude/docs/`
