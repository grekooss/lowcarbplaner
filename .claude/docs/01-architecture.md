# Architektura Projektu

## Struktura Katalogów

### Pełna Struktura

```
lowcarbplaner/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Grupa routingu dla autentykacji
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (main)/              # Grupa routingu dla głównej aplikacji
│   │   ├── dashboard/       # Widok Dnia (główny ekran)
│   │   ├── onboarding/      # Proces onboardingu
│   │   ├── meals/           # Przeglądanie i szczegóły posiłków
│   │   ├── shopping-list/   # Lista zakupów
│   │   ├── profile/         # Profil użytkownika
│   │   └── settings/        # Ustawienia
│   ├── api/                 # API routes (jeśli potrzebne)
│   ├── layout.tsx           # Root layout z Geist fonts
│   ├── globals.css          # Global styles, Tailwind, tokens
│   ├── page.tsx             # Landing page
│   └── error.tsx            # Global error boundary
│
├── components/
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── progress.tsx     # Paski postępu
│   │   └── ...
│   ├── forms/               # Komponenty formularzy
│   │   ├── OnboardingForm.tsx
│   │   ├── LoginForm.tsx
│   │   └── ProfileForm.tsx
│   ├── layout/              # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── Sidebar.tsx
│   └── features/            # Feature-specific components
│       ├── MealCard.tsx
│       ├── ProgressBars.tsx
│       ├── MealPlanView.tsx
│       ├── RecipeDetails.tsx
│       └── ShoppingListItem.tsx
│
├── lib/
│   ├── supabase/            # Konfiguracja klienta Supabase
│   │   ├── client.ts        # Client-side client
│   │   ├── server.ts        # Server-side client
│   │   └── middleware.ts    # Middleware auth
│   ├── react-query/         # TanStack Query configuration
│   │   ├── client.ts        # QueryClient setup
│   │   └── queries/         # Query hooks
│   │       ├── useMealPlanQuery.ts
│   │       ├── useUserProfileQuery.ts
│   │       ├── useRecipesQuery.ts
│   │       └── useShoppingListQuery.ts
│   ├── zustand/             # Zustand stores
│   │   └── stores/          # Individual stores
│   │       ├── useUIStore.ts
│   │       ├── useAuthStore.ts
│   │       └── useProgressStore.ts
│   ├── validation/          # Zod schemas
│   │   ├── onboarding.ts    # BMR, TDEE validation
│   │   ├── mealPlan.ts
│   │   ├── user.ts
│   │   └── auth.ts
│   ├── actions/             # Server Actions
│   │   ├── mealPlans.ts     # Generate, swap meals
│   │   ├── progress.ts      # Mark as eaten
│   │   ├── users.ts
│   │   └── auth.ts
│   └── utils.ts             # Utility functions
│
├── hooks/                   # Custom React hooks
│   ├── useDebounce.ts
│   ├── useMediaQuery.ts
│   └── useMealProgress.ts
│
├── types/                   # TypeScript type definitions
│   ├── database.types.ts    # Supabase generated types
│   ├── mealPlan.ts
│   ├── recipe.ts
│   └── user.ts
│
├── constants/               # Constants
│   ├── macros.ts            # Macro ratios (15/35/50)
│   ├── bmr.ts               # BMR/TDEE constants
│   ├── config.ts
│   └── routes.ts
│
├── services/                # Business logic
│   ├── calculator.ts        # BMR/TDEE calculator
│   ├── mealGenerator.ts     # Meal plan generation
│   ├── mealMatcher.ts       # Meal swap algorithm
│   └── shoppingListAggregator.ts
│
├── public/                  # Static assets
│   ├── images/
│   │   └── meals/           # Recipe images
│   ├── icons/
│   └── fonts/
│
└── supabase/
    ├── migrations/          # Database migrations
    │   ├── 20250101120000_create_user_profiles.sql
    │   ├── 20250101130000_create_recipes.sql
    │   ├── 20250101140000_create_meal_plans.sql
    │   └── 20250101150000_create_shopping_lists.sql
    └── seed.sql             # Seed data (recipes database)
```

---

## Path Aliases

### Konfiguracja (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components": ["./components"],
      "@/lib": ["./lib"],
      "@/hooks": ["./hooks"],
      "@/types": ["./types"],
      "@/constants": ["./constants"],
      "@/services": ["./services"]
    }
  }
}
```

### Przykłady Użycia

```typescript
// ✅ Poprawnie
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { useMealPlanQuery } from '@/lib/react-query/queries/useMealPlanQuery'
import { calculateBMR } from '@/services/calculator'
import { MACRO_RATIOS } from '@/constants/macros'

// ❌ Niepoprawnie
import { Button } from '../../../components/ui/button'
import { supabase } from '../../lib/supabase/client'
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
    "utils": "@/lib/utils"
  }
}
```

### Dodawanie Komponentów

```bash
# Pojedynczy komponent
npx shadcn@latest add button

# Wiele komponentów
npx shadcn@latest add button input card dialog progress

# Lista dostępnych komponentów
npx shadcn@latest add
```

### Kluczowe Komponenty dla LowCarbPlaner

- **Form Elements**: Button, Input, Select, Checkbox, Radio, Switch
- **Layout**: Card, Separator, Tabs, Dialog
- **Feedback**: Alert, Toast, **Progress** (paski postępu), Skeleton
- **Data Display**: Badge, Tooltip, Popover
- **Advanced**: Calendar (date picker dla onboardingu)

---

## Stylowanie (Tailwind CSS 4)

### Design Tokens

Plik: `app/globals.css`

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --primary: 142 76% 36%; /* Green for low-carb theme */
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 142 76% 36%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 142 76% 36%;
    --radius: 0.5rem;

    /* Custom tokens dla macros */
    --progress-protein: 239 84% 67%; /* Blue */
    --progress-carbs: 142 76% 36%; /* Green */
    --progress-fat: 45 93% 47%; /* Yellow */
    --progress-calories: 262 83% 58%; /* Purple */
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    /* ... */
  }
}
```

### Kluczowe Narzędzia

#### `cn()` Function

Plik: `lib/utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Użycie:**

```typescript
import { cn } from '@/lib/utils';

// Conditional classes
<div className={cn('px-4 py-2', isActive && 'bg-primary text-white')} />

// Progress bar colors
<div className={cn('h-2 rounded',
  type === 'protein' && 'bg-[hsl(var(--progress-protein))]',
  type === 'carbs' && 'bg-[hsl(var(--progress-carbs))]'
)} />
```

---

## TypeScript Configuration

### Konfiguracja (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Strict Mode Features

- `noImplicitAny`: true
- `strictNullChecks`: true
- `strictFunctionTypes`: true
- `strictBindCallApply`: true
- `strictPropertyInitialization`: true
- `noImplicitThis`: true
- `alwaysStrict`: true

**Kluczowe dla LowCarbPlaner**: Wszystkie funkcje kalkulacji BMR/TDEE i generowania posiłków muszą być ściśle typowane.

---

## Code Formatting (Prettier)

### Konfiguracja (.prettierrc)

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Ignorowane Pliki (.prettierignore)

```
node_modules
.next
out
build
dist
.cache
public
*.min.js
```

### Format Automatyczny

```bash
# Format all files
npm run format

# Check formatting
npm run format:check

# VS Code (on save)
# Ctrl+S / Cmd+S
```

---

## ESLint Configuration

### Konfiguracja (.eslintrc.json)

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  },
  "ignorePatterns": ["node_modules/", ".next/", "out/", "build/"]
}
```

---

## Konwencje Nazewnictwa

### Pliki i Katalogi

- **Komponenty**: PascalCase - `MealCard.tsx`, `ProgressBars.tsx`
- **Utilities**: camelCase - `calculateBMR.ts`, `generateMealPlan.ts`
- **Hooks**: camelCase z prefixem `use` - `useAuth.ts`, `useMealProgress.ts`
- **Constants**: UPPER_SNAKE_CASE - `MACRO_RATIOS.ts`, `BMR_CONSTANTS.ts`
- **Types**: PascalCase - `User.ts`, `MealPlan.ts`, `Recipe.ts`

### Zmienne i Funkcje

```typescript
// ✅ Poprawnie
const userName = 'John'
const dailyCalories = 2000
const calculateBMR = (weight, height, age, gender) => {}
const MINIMUM_CALORIES_FEMALE = 1400
const CARB_PERCENTAGE = 0.15

// ❌ Niepoprawnie
const UserName = 'John' // PascalCase dla zmiennych
const daily_calories = 2000 // snake_case
const CalculateBMR = () => {} // PascalCase dla funkcji
```

### Komponenty

```typescript
// ✅ Poprawnie
export function MealCard() {}
export default function DashboardPage() {}
export function ProgressBars() {}

// ❌ Niepoprawnie
export function mealCard() {} // camelCase
export default function dashboardpage() {} // lowercase
```

### Business Logic Naming

```typescript
// services/calculator.ts
export const calculateBMR = (params: BMRParams): number => {}
export const calculateTDEE = (
  bmr: number,
  activityLevel: ActivityLevel
): number => {}
export const calculateMacros = (calories: number): MacroDistribution => {}

// services/mealGenerator.ts
export const generateWeeklyMealPlan = (targetCalories: number): MealPlan => {}
export const findMealReplacement = (
  currentMeal: Meal,
  calorieRange: number
): Meal => {}

// services/shoppingListAggregator.ts
export const aggregateIngredients = (mealPlan: MealPlan): ShoppingList => {}
```

---

## Kluczowe Typy Danych

### User Profile

```typescript
// types/user.ts
export interface UserProfile {
  user_id: string
  gender: 'male' | 'female'
  age: number
  weight: number // kg
  height: number // cm
  activity_level: ActivityLevel
  goal: 'lose_weight' | 'maintain_weight'
  weight_loss_rate?: 'slow' | 'moderate' | 'fast'
  target_calories: number
  target_macros: MacroDistribution
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active'

export interface MacroDistribution {
  carbs: number // grams
  protein: number // grams
  fat: number // grams
}
```

### Meal Plan

```typescript
// types/mealPlan.ts
export interface MealPlan {
  id: string
  user_id: string
  date: string
  meals: Meal[]
  created_at: string
}

export interface Meal {
  id: string
  type: 'breakfast' | 'lunch' | 'dinner'
  recipe_id: string
  recipe: Recipe
  eaten: boolean
  modified_ingredients?: ModifiedIngredient[]
}

export interface Recipe {
  id: string
  name: string
  description: string
  image_url?: string
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: Ingredient[]
  instructions: string[]
  prep_time: number // minutes
  cook_time: number // minutes
}

export interface Ingredient {
  id: string
  name: string
  amount: number
  unit: string
  category: string
  scalable: boolean // Can be modified +/- 10%
}
```

---

📚 **Więcej szczegółów:** Zobacz inne pliki w `.claude/docs/`
