# Plan implementacji widoku Plan Posiłków

## 1. Przegląd

Widok Plan Posiłków (Meal Plan / Calendar) to kluczowy widok aplikacji LowCarbPlaner umożliwiający użytkownikowi **przeglądanie całego 7-dniowego planu posiłków** w formie tabelarycznej (desktop) lub listowej (mobile). Głównym celem jest zapewnienie szybkiego podglądu wszystkich zaplanowanych posiłków na nadchodzący tydzień oraz możliwość podglądu szczegółów przepisu i inicjacji wymiany posiłku.

Kluczowe funkcjonalności:

- Wyświetlanie 7-dniowego planu posiłków w układzie tabelarycznym (desktop) lub listowym (mobile)
- Grupowanie posiłków według dni i typów (śniadanie, obiad, kolacja)
- Modal ze szczegółami przepisu (szybki podgląd bez pełnej nawigacji)
- Możliwość inicjacji wymiany posiłku (z nawigacją do ReplacementsModal)
- Responsywność: tabela na desktop, karty na mobile

## 2. Routing widoku

**Ścieżka:** `/meal-plan`

**Lokalizacja pliku:** `app/meal-plan/page.tsx`

**Middleware:** Automatyczne sprawdzenie autentykacji i przekierowanie na `/login` jeśli użytkownik niezalogowany, lub na `/onboarding` jeśli profil nie jest ukończony.

**Parametry URL:** Brak (domyślnie pokazuje najbliższe 7 dni od dziś)

## 3. Struktura komponentów

```
MealPlanPage (Server Component)
├── MealPlanClient (Client Component - wrapper)
│   ├── WeekTable (Client Component - desktop)
│   │   ├── TableHeader (Presentation Component)
│   │   ├── TableBody (Presentation Component)
│   │   │   └── MealCell (Client Component) x21 (7 dni × 3 posiłki)
│   │   │       └── Card (shadcn/ui)
│   │   └── EmptyTableRow (Presentation Component)
│   │
│   ├── DayList (Client Component - mobile)
│   │   └── DayCard (Client Component) x7
│   │       └── MealCard (Client Component) x3
│   │           └── Card (shadcn/ui)
│   │
│   ├── RecipeModal (Client Component)
│   │   ├── Dialog (shadcn/ui)
│   │   ├── RecipeHeader (z RecipeDetailClient - reuse)
│   │   ├── MacroSummary (z RecipeDetailClient - reuse)
│   │   ├── IngredientsList (z RecipeDetailClient - reuse)
│   │   └── InstructionsList (z RecipeDetailClient - reuse)
│   │
│   └── ReplacementsModal (Client Component)
│       ├── Dialog (shadcn/ui)
│       ├── ReplacementsList (Client Component)
│       └── ReplacementCard (Client Component) xN
│           └── Card (shadcn/ui)
```

**Separacja odpowiedzialności:**

- **MealPlanPage (Server Component):** Initial data fetching (7 dni posiłków)
- **MealPlanClient (Client Component):** Zarządzanie stanem klienckim, modali, interakcji
- **WeekTable / DayList:** Responsywne renderowanie (desktop vs mobile)
- **Modals:** Overlay dla szczegółów przepisu i zamienników
- **Komponenty prezentacyjne:** Reużywane z RecipeDetailClient

## 4. Szczegóły komponentów

### MealPlanPage (Server Component)

**Ścieżka:** `app/meal-plan/page.tsx`

**Opis:** Główna strona widoku Plan Posiłków. Server Component odpowiedzialny za pobranie 7-dniowego planu posiłków (od dziś) i przekazanie danych do MealPlanClient.

**Główne elementy:**

- Wywołanie `getPlannedMeals()` z parametrami: `start_date` (dziś), `end_date` (dziś + 6 dni)
- Renderowanie `<MealPlanClient>` z initial data
- SEO metadata (title, description)
- Error boundary dla obsługi błędów

**Obsługiwane interakcje:** Brak (Server Component)

**Warunki walidacji:**

- Walidacja odpowiedzi z `getPlannedMeals()` (error boundary)
- Obsługa pustego planu (brak posiłków)

**Typy:**

- `PlannedMealDTO[]` - lista posiłków na 7 dni
- `WeekPlanViewModel` - posiłki pogrupowane według dni

**Props:** Brak (root page component)

**Implementacja:**

```typescript
// app/meal-plan/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { getPlannedMeals } from '@/lib/actions/planned-meals'
import { MealPlanClient } from '@/components/meal-plan/MealPlanClient'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Plan Posiłków - LowCarbPlaner',
  description: 'Twój 7-dniowy plan posiłków niskowęglowodanowych'
}

export default async function MealPlanPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Oblicz zakres dat (dziś + 6 dni)
  const today = new Date()
  const endDate = new Date(today)
  endDate.setDate(today.getDate() + 6)

  const startDateStr = today.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  // Pobierz posiłki
  const mealsResult = await getPlannedMeals({
    start_date: startDateStr,
    end_date: endDateStr
  })

  const meals = mealsResult.error ? [] : mealsResult.data

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Plan Posiłków</h1>
      <MealPlanClient initialMeals={meals} startDate={startDateStr} />
    </main>
  )
}
```

---

### MealPlanClient (Client Component)

**Ścieżka:** `components/meal-plan/MealPlanClient.tsx`

**Opis:** Główny wrapper po stronie klienta. Zarządza stanem wybranego posiłku dla modali (RecipeModal, ReplacementsModal), koordynuje responsywne renderowanie (WeekTable vs DayList) i integruje TanStack Query dla re-fetching.

**Główne elementy:**

- Warunkowe renderowanie:
  - Desktop (>= md): `<WeekTable>`
  - Mobile (< md): `<DayList>`
- `<RecipeModal>` (controlled component)
- `<ReplacementsModal>` (controlled component)
- Hook `usePlannedMealsQuery` dla reaktywności danych

**Obsługiwane interakcje:**

- Kliknięcie na MealCell/MealCard → otwarcie RecipeModal
- Kliknięcie "Zmień posiłek" → otwarcie ReplacementsModal
- Zamknięcie modali (Escape, backdrop, close button)

**Warunki walidacji:**

- Sprawdzenie czy `meals.length > 0`
- Grupowanie posiłków według dni i typów

**Typy:**

- `PlannedMealDTO[]`
- `WeekPlanViewModel`
- `RecipeModalState` - stan modala z przepisem
- `ReplacementsModalState` - stan modala z zamienników

**Props:**

```typescript
interface MealPlanClientProps {
  initialMeals: PlannedMealDTO[]
  startDate: string // YYYY-MM-DD
}
```

**Implementacja pomocnicza:**

```typescript
// types/meal-plan-view.types.ts
export interface WeekPlanViewModel {
  days: DayPlanViewModel[]
}

export interface DayPlanViewModel {
  date: string // YYYY-MM-DD
  dayName: string // 'Poniedziałek', 'Wtorek', etc.
  dayNumber: number
  monthName: string
  breakfast: PlannedMealDTO | null
  lunch: PlannedMealDTO | null
  dinner: PlannedMealDTO | null
}

export interface RecipeModalState {
  isOpen: boolean
  recipe: RecipeDTO | null
}

export interface ReplacementsModalState {
  isOpen: boolean
  mealId: number | null
  mealType: 'breakfast' | 'lunch' | 'dinner' | null
}
```

---

### WeekTable (Client Component)

**Ścieżka:** `components/meal-plan/WeekTable.tsx`

**Opis:** Tabela tygodniowa dla widoku desktop. 7 kolumn (dni) × 3 wiersze (typy posiłków: śniadanie, obiad, kolacja).

**Główne elementy:**

- `<div className="overflow-x-auto">` - scroll poziomy dla małych ekranów
- `<table>` z semantycznym HTML
  - `<thead>`: nagłówki dni (Pon, Wt, Śr, ...)
  - `<tbody>`: 3 wiersze (breakfast, lunch, dinner)
    - Każda komórka: `<MealCell>` component

**Obsługiwane interakcje:**

- onClick na MealCell → callback `onMealClick(meal)`

**Warunki walidacji:**

- Wypełnienie pustych komórek (gdy brak posiłku na dany dzień/typ)

**Typy:**

- `WeekPlanViewModel`

**Props:**

```typescript
interface WeekTableProps {
  weekPlan: WeekPlanViewModel
  onMealClick: (meal: PlannedMealDTO) => void
  onSwapClick: (mealId: number, mealType: string) => void
}
```

---

### MealCell (Client Component)

**Ścieżka:** `components/meal-plan/MealCell.tsx`

**Opis:** Pojedyncza komórka tabeli reprezentująca jeden posiłek. Klikalna karta z miniaturką obrazu, nazwą przepisu i kalorycznością.

**Główne elementy:**

- `<td>` wrapper
- `<Card>` z shadcn/ui (compact variant)
  - Miniatura obrazu (100x80px) lub placeholder
  - `<h4>` nazwa przepisu (truncated)
  - `<span>` kalorie (small text)
  - Hover overlay z ikonami:
    - Ikona "Zobacz" (Eye)
    - Ikona "Zmień" (RefreshCw)

**Obsługiwane interakcje:**

- onClick na całą kartę → `onMealClick(meal)`
- onClick na ikonę "Zmień" (e.stopPropagation) → `onSwapClick(meal.id, meal.meal_type)`

**Warunki walidacji:**

- Fallback dla brakujących obrazów (placeholder)
- Truncate długich nazw (max 2 linie)

**Typy:**

- `PlannedMealDTO`

**Props:**

```typescript
interface MealCellProps {
  meal: PlannedMealDTO | null
  onMealClick: (meal: PlannedMealDTO) => void
  onSwapClick: (mealId: number, mealType: string) => void
}
```

**Implementacja:**

```typescript
// components/meal-plan/MealCell.tsx
'use client'

import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { Eye, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlannedMealDTO } from '@/types/dto.types'

export const MealCell = ({ meal, onMealClick, onSwapClick }: MealCellProps) => {
  if (!meal) {
    return (
      <td className="p-2">
        <Card className="h-32 flex items-center justify-center text-muted-foreground">
          <span className="text-sm">Brak posiłku</span>
        </Card>
      </td>
    )
  }

  return (
    <td className="p-2">
      <Card
        className={cn(
          "relative h-32 cursor-pointer overflow-hidden",
          "hover:shadow-lg transition-shadow group"
        )}
        onClick={() => onMealClick(meal)}
      >
        {/* Image */}
        <div className="absolute inset-0">
          {meal.recipe.image_url ? (
            <Image
              src={meal.recipe.image_url}
              alt={meal.recipe.name}
              fill
              className="object-cover"
              sizes="200px"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-3 h-full flex flex-col justify-end">
          <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">
            {meal.recipe.name}
          </h4>
          <span className="text-white/80 text-xs">
            {meal.recipe.total_calories || 0} kcal
          </span>
        </div>

        {/* Hover actions */}
        <div className={cn(
          "absolute inset-0 bg-black/40 flex items-center justify-center gap-4",
          "opacity-0 group-hover:opacity-100 transition-opacity z-20"
        )}>
          <button
            className="p-2 rounded-full bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation()
              onMealClick(meal)
            }}
            aria-label="Zobacz przepis"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            className="p-2 rounded-full bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation()
              onSwapClick(meal.id, meal.meal_type)
            }}
            aria-label="Zmień posiłek"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </Card>
    </td>
  )
}
```

---

### DayList (Client Component)

**Ścieżka:** `components/meal-plan/DayList.tsx`

**Opis:** Lista dni dla widoku mobile. Każdy dzień to karta z 3 posiłkami wewnątrz.

**Główne elementy:**

- `<div className="flex flex-col gap-6">` wrapper
- Mapowanie `days.map(day => <DayCard key={day.date} ... />)`

**Obsługiwane interakcje:**

- Przekazywanie callbacks do DayCard

**Warunki walidacji:** Brak (prezentacja)

**Typy:**

- `WeekPlanViewModel`

**Props:**

```typescript
interface DayListProps {
  weekPlan: WeekPlanViewModel
  onMealClick: (meal: PlannedMealDTO) => void
  onSwapClick: (mealId: number, mealType: string) => void
}
```

---

### DayCard (Client Component)

**Ścieżka:** `components/meal-plan/DayCard.tsx`

**Opis:** Karta pojedynczego dnia zawierająca nagłówek z datą i 3 karty posiłków.

**Główne elementy:**

- `<Card>` z shadcn/ui
- `<CardHeader>`:
  - `<h3>` nazwa dnia (np. "Poniedziałek, 15 Paź")
- `<CardContent>`:
  - 3x `<MealCard>` (breakfast, lunch, dinner)

**Obsługiwane interakcje:**

- Przekazywanie callbacks do MealCard

**Warunki walidacji:** Brak

**Typy:**

- `DayPlanViewModel`

**Props:**

```typescript
interface DayCardProps {
  day: DayPlanViewModel
  onMealClick: (meal: PlannedMealDTO) => void
  onSwapClick: (mealId: number, mealType: string) => void
}
```

---

### MealCard (Client Component - mobile variant)

**Ścieżka:** `components/meal-plan/MealCard.tsx`

**Opis:** Karta posiłku w widoku mobile (podobna do MealCell, ale bardziej rozbudowana - więcej miejsca).

**Główne elementy:**

- `<Card>` z shadcn/ui
- `<CardContent>`:
  - `<Badge>` typ posiłku (Śniadanie/Obiad/Kolacja)
  - Opcjonalnie `<Image>` (150x100px)
  - `<h4>` nazwa przepisu
  - `<div>` makro summary (kalorie, białko, węgle, tłuszcze)
  - `<div>` akcje:
    - `<Button variant="outline">` "Zobacz przepis"
    - `<Button variant="ghost">` "Zmień"

**Obsługiwane interakcje:**

- onClick "Zobacz przepis" → `onMealClick(meal)`
- onClick "Zmień" → `onSwapClick(meal.id, meal.meal_type)`

**Warunki walidacji:**

- Fallback dla brakującego obrazu
- Fallback dla null macros

**Typy:**

- `PlannedMealDTO | null`

**Props:**

```typescript
interface MealCardProps {
  meal: PlannedMealDTO | null
  mealType: 'breakfast' | 'lunch' | 'dinner'
  onMealClick: (meal: PlannedMealDTO) => void
  onSwapClick: (mealId: number, mealType: string) => void
}
```

---

### RecipeModal (Client Component)

**Ścieżka:** `components/meal-plan/RecipeModal.tsx`

**Opis:** Modal ze szczegółowym podglądem przepisu. Reużywa komponenty z `RecipeDetailClient` (RecipeHeader, MacroSummary, IngredientsList, InstructionsList).

**Główne elementy:**

- `<Dialog>` z shadcn/ui (controlled: open, onOpenChange)
- `<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">`
- `<DialogHeader>`:
  - `<DialogTitle>` "Szczegóły przepisu"
  - `<DialogClose>` (X button)
- Reużywane komponenty:
  - `<RecipeHeader>` (zdjęcie + nazwa + tagi)
  - `<MacroSummary>` (kalorie + makro)
  - `<IngredientsList>` (składniki pogrupowane)
  - `<InstructionsList>` (kroki)

**Obsługiwane interakcje:**

- onOpenChange → zamknięcie modala
- Escape key → zamknięcie
- Backdrop click → zamknięcie

**Warunki walidacji:**

- Sprawdzenie czy recipe !== null

**Typy:**

- `RecipeDTO | null`

**Props:**

```typescript
interface RecipeModalProps {
  isOpen: boolean
  recipe: RecipeDTO | null
  onOpenChange: (open: boolean) => void
}
```

**Implementacja:**

```typescript
// components/meal-plan/RecipeModal.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RecipeHeader } from '@/components/recipes/detail/RecipeHeader'
import { MacroSummary } from '@/components/recipes/detail/MacroSummary'
import { IngredientsList } from '@/components/recipes/detail/IngredientsList'
import { InstructionsList } from '@/components/recipes/detail/InstructionsList'
import type { RecipeDTO } from '@/types/dto.types'

export const RecipeModal = ({ isOpen, recipe, onOpenChange }: RecipeModalProps) => {
  if (!recipe) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Szczegóły przepisu</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <RecipeHeader
            name={recipe.name}
            imageUrl={recipe.image_url}
            tags={recipe.tags}
            mealTypes={recipe.meal_types}
          />

          <MacroSummary
            calories={recipe.total_calories}
            protein_g={recipe.total_protein_g}
            carbs_g={recipe.total_carbs_g}
            fats_g={recipe.total_fats_g}
          />

          <IngredientsList ingredients={recipe.ingredients} />

          <InstructionsList instructions={recipe.instructions} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

### ReplacementsModal (Client Component)

**Ścieżka:** `components/meal-plan/ReplacementsModal.tsx`

**Opis:** Modal z listą sugerowanych zamienników dla wybranego posiłku. Integruje API endpoint `GET /planned-meals/{id}/replacements`.

**Główne elementy:**

- `<Dialog>` z shadcn/ui
- `<DialogContent>`
- `<DialogHeader>`:
  - `<DialogTitle>` "Sugerowane zamienniki"
  - `<DialogDescription>` "Wybierz przepis o podobnej kaloryczności"
- `<ReplacementsList>`:
  - Loading state (Skeleton)
  - Empty state ("Brak zamienników")
  - Lista `<ReplacementCard>` xN

**Obsługiwane interakcje:**

- onOpenChange → zamknięcie modala
- onClick na ReplacementCard → wykonanie wymiany (`updatePlannedMeal`) + zamknięcie

**Warunki walidacji:**

- Sprawdzenie czy `mealId !== null`
- Walidacja odpowiedzi API (error handling)

**Typy:**

- `ReplacementRecipeDTO[]` (z API)
- `number | null` (mealId)

**Props:**

```typescript
interface ReplacementsModalProps {
  isOpen: boolean
  mealId: number | null
  mealType: 'breakfast' | 'lunch' | 'dinner' | null
  onOpenChange: (open: boolean) => void
}
```

**Implementacja (integracja z API):**

```typescript
// hooks/useReplacementsQuery.ts
import { useQuery } from '@tanstack/react-query'
import { getReplacementRecipes } from '@/lib/actions/planned-meals'

export const useReplacementsQuery = (mealId: number | null) => {
  return useQuery({
    queryKey: ['replacements', mealId],
    queryFn: async () => {
      if (!mealId) throw new Error('No meal ID')
      const result = await getReplacementRecipes(mealId)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!mealId && mealId > 0,
    staleTime: 5 * 60 * 1000, // 5 minut
  })
}
```

---

### ReplacementCard (Client Component)

**Ścieżka:** `components/meal-plan/ReplacementCard.tsx`

**Opis:** Karta pojedynczego zamiennika przepisu z informacją o różnicy kalorycznej.

**Główne elementy:**

- `<Card>` z shadcn/ui (hover:shadow)
- `<CardContent>`:
  - `<Image>` miniatura (100x80px)
  - `<h4>` nazwa przepisu
  - `<div>` makro summary
  - `<Badge>` różnica kaloryczna (color-coded):
    - Green: calorie_diff między -50 a +50
    - Yellow: -100 do -50 lub +50 do +100
    - Red: poza zakresem (nie powinno się zdarzyć z API)
  - `<Button>` "Wybierz" (primary)

**Obsługiwane interakcje:**

- onClick "Wybierz" → `onSelect(recipe.id)`

**Warunki walidacji:**

- Formatowanie calorie_diff (+ lub - przed wartością)
- Kolor badge na podstawie różnicy

**Typy:**

- `ReplacementRecipeDTO`

**Props:**

```typescript
interface ReplacementCardProps {
  recipe: ReplacementRecipeDTO
  onSelect: (recipeId: number) => void
  isLoading?: boolean
}
```

**Implementacja:**

```typescript
// components/meal-plan/ReplacementCard.tsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import type { ReplacementRecipeDTO } from '@/types/dto.types'

export const ReplacementCard = ({ recipe, onSelect, isLoading }: ReplacementCardProps) => {
  const getCalorieDiffBadge = (diff: number) => {
    const absValue = Math.abs(diff)
    const sign = diff > 0 ? '+' : ''

    let variant: 'default' | 'secondary' | 'destructive' = 'default'
    if (absValue <= 50) variant = 'default' // green
    else if (absValue <= 100) variant = 'secondary' // yellow
    else variant = 'destructive' // red (nie powinno się zdarzyć)

    return (
      <Badge variant={variant}>
        {sign}{diff} kcal
      </Badge>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          <div className="relative w-24 h-20 flex-shrink-0 rounded overflow-hidden">
            {recipe.image_url ? (
              <Image
                src={recipe.image_url}
                alt={recipe.name}
                fill
                className="object-cover"
                sizes="100px"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm mb-2 line-clamp-2">
              {recipe.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span>{recipe.total_calories || 0} kcal</span>
              <span>•</span>
              <span>B: {recipe.total_protein_g || 0}g</span>
              <span>W: {recipe.total_carbs_g || 0}g</span>
              <span>T: {recipe.total_fats_g || 0}g</span>
            </div>
            <div className="flex items-center gap-2">
              {getCalorieDiffBadge(recipe.calorie_diff)}
              <Button
                size="sm"
                onClick={() => onSelect(recipe.id)}
                disabled={isLoading}
              >
                Wybierz
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 5. Typy

### Istniejące typy z dto.types.ts:

```typescript
// src/types/dto.types.ts (już zdefiniowane)
export type PlannedMealDTO = {
  id: number
  meal_date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner'
  is_eaten: boolean
  ingredient_overrides: IngredientOverrides | null
  recipe: RecipeDTO
  created_at: string
}

export type RecipeDTO = {
  id: number
  name: string
  instructions: RecipeInstructions
  meal_types: ('breakfast' | 'lunch' | 'dinner')[]
  tags: string[] | null
  image_url: string | null
  total_calories: number | null
  total_protein_g: number | null
  total_carbs_g: number | null
  total_fats_g: number | null
  ingredients: IngredientDTO[]
}

export type ReplacementRecipeDTO = {
  id: number
  name: string
  image_url: string | null
  meal_types: ('breakfast' | 'lunch' | 'dinner')[]
  difficulty_level: 'easy' | 'medium' | 'hard'
  total_calories: number | null
  total_protein_g: number | null
  total_carbs_g: number | null
  total_fats_g: number | null
  calorie_diff: number // Różnica względem oryginalnego przepisu
}
```

### Nowe typy ViewModels:

```typescript
// src/types/meal-plan-view.types.ts

/**
 * Model całego tygodniowego planu posiłków
 */
export interface WeekPlanViewModel {
  days: DayPlanViewModel[]
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
}

/**
 * Model planu posiłków dla pojedynczego dnia
 */
export interface DayPlanViewModel {
  date: string // YYYY-MM-DD
  dayName: string // 'Poniedziałek', 'Wtorek', 'Środa', etc.
  dayNumber: number // 1-31
  monthName: string // 'Sty', 'Lut', 'Mar', etc.
  isToday: boolean
  breakfast: PlannedMealDTO | null
  lunch: PlannedMealDTO | null
  dinner: PlannedMealDTO | null
}

/**
 * Stan modala z przepisem
 */
export interface RecipeModalState {
  isOpen: boolean
  recipe: RecipeDTO | null
}

/**
 * Stan modala z zamienników
 */
export interface ReplacementsModalState {
  isOpen: boolean
  mealId: number | null
  mealType: 'breakfast' | 'lunch' | 'dinner' | null
}

/**
 * Mapowanie typu posiłku na polską nazwę
 */
export const MEAL_TYPE_LABELS: Record<
  'breakfast' | 'lunch' | 'dinner',
  string
> = {
  breakfast: 'Śniadanie',
  lunch: 'Obiad',
  dinner: 'Kolacja',
}

/**
 * Mapowanie dni tygodnia na polskie nazwy
 */
export const DAY_NAMES = [
  'Niedziela',
  'Poniedziałek',
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota',
]

/**
 * Mapowanie miesięcy na polskie skróty
 */
export const MONTH_NAMES = [
  'Sty',
  'Lut',
  'Mar',
  'Kwi',
  'Maj',
  'Cze',
  'Lip',
  'Sie',
  'Wrz',
  'Paź',
  'Lis',
  'Gru',
]
```

### Pomocnicze funkcje transformacji:

```typescript
// lib/utils/meal-plan.ts

import type { PlannedMealDTO } from '@/types/dto.types'
import type {
  WeekPlanViewModel,
  DayPlanViewModel,
} from '@/types/meal-plan-view.types'
import { DAY_NAMES, MONTH_NAMES } from '@/types/meal-plan-view.types'

/**
 * Transformuje listę posiłków na model tygodniowego planu
 */
export function transformToWeekPlan(
  meals: PlannedMealDTO[],
  startDate: string
): WeekPlanViewModel {
  const start = new Date(startDate)
  const days: DayPlanViewModel[] = []

  // Generuj 7 dni
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(start)
    currentDate.setDate(start.getDate() + i)

    const dateStr = currentDate.toISOString().split('T')[0]
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Filtruj posiłki dla tego dnia
    const dayMeals = meals.filter((meal) => meal.meal_date === dateStr)

    days.push({
      date: dateStr,
      dayName: DAY_NAMES[currentDate.getDay()],
      dayNumber: currentDate.getDate(),
      monthName: MONTH_NAMES[currentDate.getMonth()],
      isToday: currentDate.toDateString() === today.toDateString(),
      breakfast: dayMeals.find((m) => m.meal_type === 'breakfast') || null,
      lunch: dayMeals.find((m) => m.meal_type === 'lunch') || null,
      dinner: dayMeals.find((m) => m.meal_type === 'dinner') || null,
    })
  }

  const endDate = new Date(start)
  endDate.setDate(start.getDate() + 6)

  return {
    days,
    startDate,
    endDate: endDate.toISOString().split('T')[0],
  }
}
```

---

## 6. Zarządzanie stanem

### Stan serwera (TanStack Query):

#### usePlannedMealsQuery (reużyty z Dashboard):

```typescript
// hooks/usePlannedMealsQuery.ts (już zaimplementowane)
import { useQuery } from '@tanstack/react-query'
import { getPlannedMeals } from '@/lib/actions/planned-meals'

export const usePlannedMealsQuery = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['planned-meals', startDate, endDate],
    queryFn: async () => {
      const result = await getPlannedMeals({
        start_date: startDate,
        end_date: endDate,
      })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    staleTime: 60 * 1000, // 1 minuta
    refetchOnWindowFocus: true,
  })
}
```

#### useReplacementsQuery (nowy hook):

```typescript
// hooks/useReplacementsQuery.ts
import { useQuery } from '@tanstack/react-query'
import { getReplacementRecipes } from '@/lib/actions/planned-meals'

export const useReplacementsQuery = (mealId: number | null) => {
  return useQuery({
    queryKey: ['replacements', mealId],
    queryFn: async () => {
      if (!mealId) throw new Error('No meal ID')
      const result = await getReplacementRecipes(mealId)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!mealId && mealId > 0,
    staleTime: 5 * 60 * 1000, // 5 minut
  })
}
```

### Stan klienta (React useState):

**W MealPlanClient:**

```typescript
// components/meal-plan/MealPlanClient.tsx
'use client'

import { useState, useMemo } from 'react'
import { usePlannedMealsQuery } from '@/hooks/usePlannedMealsQuery'
import { transformToWeekPlan } from '@/lib/utils/meal-plan'
import type { PlannedMealDTO, RecipeDTO } from '@/types/dto.types'
import type { RecipeModalState, ReplacementsModalState } from '@/types/meal-plan-view.types'

export const MealPlanClient = ({ initialMeals, startDate }: MealPlanClientProps) => {
  // Stan modali
  const [recipeModal, setRecipeModal] = useState<RecipeModalState>({
    isOpen: false,
    recipe: null,
  })

  const [replacementsModal, setReplacementsModal] = useState<ReplacementsModalState>({
    isOpen: false,
    mealId: null,
    mealType: null,
  })

  // Query dla re-fetching
  const endDate = useMemo(() => {
    const end = new Date(startDate)
    end.setDate(end.getDate() + 6)
    return end.toISOString().split('T')[0]
  }, [startDate])

  const { data: meals = initialMeals, isLoading } = usePlannedMealsQuery(startDate, endDate)

  // ViewModel
  const weekPlan = useMemo(() => transformToWeekPlan(meals, startDate), [meals, startDate])

  // Handlers
  const handleMealClick = (meal: PlannedMealDTO) => {
    setRecipeModal({
      isOpen: true,
      recipe: meal.recipe,
    })
  }

  const handleSwapClick = (mealId: number, mealType: string) => {
    setReplacementsModal({
      isOpen: true,
      mealId,
      mealType: mealType as 'breakfast' | 'lunch' | 'dinner',
    })
  }

  return (
    <>
      {/* Desktop: WeekTable */}
      <div className="hidden md:block">
        <WeekTable
          weekPlan={weekPlan}
          onMealClick={handleMealClick}
          onSwapClick={handleSwapClick}
        />
      </div>

      {/* Mobile: DayList */}
      <div className="block md:hidden">
        <DayList
          weekPlan={weekPlan}
          onMealClick={handleMealClick}
          onSwapClick={handleSwapClick}
        />
      </div>

      {/* Modals */}
      <RecipeModal
        isOpen={recipeModal.isOpen}
        recipe={recipeModal.recipe}
        onOpenChange={(open) => setRecipeModal((prev) => ({ ...prev, isOpen: open }))}
      />

      <ReplacementsModal
        isOpen={replacementsModal.isOpen}
        mealId={replacementsModal.mealId}
        mealType={replacementsModal.mealType}
        onOpenChange={(open) => setReplacementsModal((prev) => ({ ...prev, isOpen: open }))}
      />
    </>
  )
}
```

### Custom hook do wymiany posiłku:

```typescript
// hooks/useMealSwap.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePlannedMeal } from '@/lib/actions/planned-meals'
import { toast } from '@/hooks/use-toast'

export const useMealSwap = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      mealId,
      newRecipeId,
    }: {
      mealId: number
      newRecipeId: number
    }) => {
      const result = await updatePlannedMeal(mealId, {
        action: 'swap_recipe',
        recipe_id: newRecipeId,
      })
      if (result.error) throw new Error(result.error)
      return result.data
    },

    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['planned-meals'] })

      toast({
        title: 'Sukces',
        description: 'Posiłek został pomyślnie zamieniony.',
      })
    },

    onError: (error) => {
      toast({
        title: 'Błąd',
        description: error.message || 'Nie udało się zamienić posiłku.',
        variant: 'destructive',
      })
    },
  })
}
```

---

## 7. Integracja API

### Endpoint: GET /planned-meals

**Server Action:** `getPlannedMeals(params: GetPlannedMealsQueryInput)`

**Typ żądania:**

```typescript
{
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD (start_date + 6 dni)
}
```

**Typ odpowiedzi:**

```typescript
ActionResult<PlannedMealDTO[]>
```

**Użycie:**

- W MealPlanPage (Server Component) - initial load
- W usePlannedMealsQuery (Client) - re-fetching

---

### Endpoint: GET /planned-meals/{id}/replacements

**Server Action:** `getReplacementRecipes(mealId: number)`

**Typ żądania:**

```typescript
mealId: number
```

**Typ odpowiedzi:**

```typescript
ActionResult<ReplacementRecipeDTO[]>
```

**Użycie:**

- W useReplacementsQuery hook
- Wywoływane po otwarciu ReplacementsModal

**Cache strategy:**

- staleTime: 5 minut (zamienniki rzadko się zmieniają)
- enabled: tylko gdy mealId !== null
- Invalidate po udanej wymianie posiłku

---

### Endpoint: PATCH /planned-meals/{id}

**Server Action:** `updatePlannedMeal(mealId: number, updateData: UpdatePlannedMealBodyInput)`

**Typ żądania (swap_recipe):**

```typescript
{
  action: 'swap_recipe'
  recipe_id: number
}
```

**Typ odpowiedzi:**

```typescript
ActionResult<PlannedMealDTO>
```

**Użycie:**

- W useMealSwap hook
- Wywoływane po wyborze zamiennika w ReplacementsModal

**Flow:**

1. Użytkownik klika "Zmień" na posiłku
2. Otwiera się ReplacementsModal
3. useReplacementsQuery pobiera zamienniki
4. Użytkownik wybiera zamiennik
5. useMealSwap wykonuje mutację
6. Sukces: Invalidate cache, toast, zamknięcie modala
7. Błąd: Toast z komunikatem, modal pozostaje otwarty

---

## 8. Interakcje użytkownika

### 1. Przeglądanie planu tygodniowego

**Trigger:** Wejście na `/meal-plan`

**Flow:**

1. MealPlanPage (SSR) pobiera posiłki na 7 dni
2. Renderuje MealPlanClient z initial data
3. Desktop: Użytkownik widzi tabelę 7x3
4. Mobile: Użytkownik widzi listę 7 kart (po 3 posiłki)

---

### 2. Kliknięcie na posiłek (zobacz przepis)

**Trigger:** onClick na MealCell/MealCard lub ikonie "Zobacz"

**Flow:**

1. handleMealClick(meal) wywoływane
2. setRecipeModal({ isOpen: true, recipe: meal.recipe })
3. RecipeModal się otwiera z pełnymi szczegółami przepisu
4. Użytkownik może scrollować składniki i instrukcje
5. Zamknięcie: Escape, backdrop, X button

**Implementacja:**

```typescript
const handleMealClick = (meal: PlannedMealDTO) => {
  setRecipeModal({
    isOpen: true,
    recipe: meal.recipe,
  })
}
```

---

### 3. Kliknięcie "Zmień posiłek"

**Trigger:** onClick na ikonie "Zmień" (RefreshCw) w MealCell lub przycisk "Zmień" w MealCard

**Flow:**

1. handleSwapClick(meal.id, meal.meal_type) wywoływane (e.stopPropagation())
2. setReplacementsModal({ isOpen: true, mealId: meal.id, mealType: meal.meal_type })
3. ReplacementsModal się otwiera
4. useReplacementsQuery automatycznie pobiera zamienniki (enabled: !!mealId)
5. Loading: Skeleton dla kart
6. Success: Lista ReplacementCard xN
7. Empty: "Brak zamienników" EmptyState

---

### 4. Wybór zamiennika

**Trigger:** onClick "Wybierz" w ReplacementCard

**Flow:**

1. onSelect(recipe.id) wywoływane
2. useMealSwap.mutate({ mealId, newRecipeId: recipe.id })
3. Loading state: Button disabled, spinner
4. Success:
   - API call PATCH /planned-meals/{mealId} z { action: 'swap_recipe', recipe_id }
   - Invalidate cache ['planned-meals']
   - Toast: "Posiłek został pomyślnie zamieniony"
   - Zamknięcie modala
   - UI automatycznie aktualizuje się (TanStack Query refetch)
5. Error:
   - Toast: "Nie udało się zamienić posiłku: [error message]"
   - Modal pozostaje otwarty
   - Użytkownik może spróbować ponownie

**Implementacja w ReplacementsModal:**

```typescript
const { mutate: swapMeal, isPending } = useMealSwap()

const handleSelectReplacement = (recipeId: number) => {
  if (!mealId) return

  swapMeal(
    { mealId, newRecipeId: recipeId },
    {
      onSuccess: () => {
        onOpenChange(false) // Zamknij modal
      },
    }
  )
}
```

---

### 5. Zamknięcie modali

**Triggers:**

- Escape key
- Backdrop click
- X button (DialogClose)

**Flow:**

1. onOpenChange(false) wywoływane
2. setRecipeModal/setReplacementsModal z isOpen: false
3. Modal się zamyka (animacja fade-out)

---

### 6. Responsywność (resize window)

**Trigger:** Window resize między breakpointem md (768px)

**Flow:**

1. CSS media queries automatycznie przełączają widoczność
2. Desktop (>= 768px): WeekTable widoczny, DayList ukryty
3. Mobile (< 768px): DayList widoczny, WeekTable ukryty
4. Brak re-render komponentów (tylko CSS display: none/block)

---

## 9. Warunki i walidacja

### Frontend validation:

#### MealCell/MealCard:

- **Warunek:** Wyświetlenie placeholder gdy `meal === null`
- **Implementacja:** Warunkowe renderowanie "Brak posiłku" w card
- **Wpływ na UI:** Pusta karta z komunikatem, brak hover actions

#### WeekTable:

- **Warunek:** Wypełnienie wszystkich 21 komórek (7 dni × 3 posiłki)
- **Implementacja:** Iteracja przez `weekPlan.days` i typy posiłków
- **Wpływ na UI:** Puste komórki renderowane jako null MealCell

#### ReplacementsModal:

- **Warunek:** Enabled query tylko gdy `mealId !== null`
- **Implementacja:** `enabled: !!mealId` w useReplacementsQuery
- **Wpływ na UI:** Brak fetch jeśli modal otwarty bez mealId (edge case)

#### ReplacementCard:

- **Warunek:** Kolor badge na podstawie `calorie_diff`
- **Implementacja:**
  ```typescript
  if (Math.abs(calorie_diff) <= 50) return 'default' // green
  if (Math.abs(calorie_diff) <= 100) return 'secondary' // yellow
  return 'destructive' // red
  ```
- **Wpływ na UI:** Wizualne rozróżnienie zamienników bliższych kalorycznie

### Backend validation (z planned-meals.ts):

#### getPlannedMeals:

- `start_date` i `end_date`: format YYYY-MM-DD, zakres <= 30 dni
- **Obsługa błędów:** Error boundary w MealPlanPage

#### getReplacementRecipes:

- `mealId`: positive integer, posiłek musi istnieć
- **Obsługa błędów:** Toast w useReplacementsQuery

#### updatePlannedMeal (swap_recipe):

- `recipe_id`: musi istnieć
- Przepis musi mieć ten sam `meal_type`
- Różnica kaloryczna <= ±15%
- **Obsługa błędów:**
  - 400: "Przepis nie pasuje do typu posiłku" → toast
  - 400: "Różnica kaloryczna przekracza ±15%" → toast
  - 404: "Posiłek nie znaleziony" → toast

---

## 10. Obsługa błędów

### 1. Brak posiłków na tydzień

**Scenariusz:** `meals.length === 0` (plan nie został wygenerowany)

**Obsługa:**

```typescript
// W MealPlanClient
if (meals.length === 0) {
  return (
    <EmptyState
      icon={<CalendarX className="w-16 h-16" />}
      title="Brak planu posiłków"
      description="Wygeneruj swój pierwszy plan, aby zobaczyć posiłki na nadchodzący tydzień."
      action={
        <Button asChild>
          <Link href="/profile/generate">Wygeneruj plan</Link>
        </Button>
      }
    />
  )
}
```

---

### 2. Błąd API (GET /planned-meals)

**Scenariusz:** Network error, 500 Internal Server Error

**Obsługa:**

```typescript
// W usePlannedMealsQuery
onError: (error) => {
  toast({
    title: 'Błąd',
    description: 'Nie udało się pobrać planu posiłków. Spróbuj ponownie.',
    variant: 'destructive',
    action: (
      <Button variant="outline" onClick={() => queryClient.invalidateQueries(['planned-meals'])}>
        Odśwież
      </Button>
    ),
  })
}
```

**UI:**

- Skeleton state podczas ładowania
- Error boundary dla critical errors
- Toast notification dla recoverable errors

---

### 3. Brak zamienników

**Scenariusz:** API zwraca `replacements.length === 0`

**Obsługa:**

```typescript
// W ReplacementsModal
{replacements.length === 0 && (
  <EmptyState
    icon={<SearchX className="w-12 h-12" />}
    title="Brak zamienników"
    description="Nie znaleźliśmy przepisów o podobnej kaloryczności dla tego typu posiłku."
  />
)}
```

---

### 4. Błąd wymiany posiłku

**Scenariusz:** PATCH /planned-meals/{id} zwraca błąd (400, 403, 404)

**Obsługa:**

```typescript
// W useMealSwap hook
onError: (error) => {
  toast({
    title: 'Nie udało się zamienić posiłku',
    description: error.message || 'Spróbuj ponownie lub wybierz inny przepis.',
    variant: 'destructive',
  })
}
```

**UI:**

- Modal pozostaje otwarty
- Button "Wybierz" powraca do stanu aktywnego
- Użytkownik może spróbować inny zamiennik

---

### 5. Błąd ładowania obrazów

**Scenariusz:** `recipe.image_url` jest null lub 404

**Obsługa:**

```typescript
// W MealCell/MealCard/ReplacementCard
{meal.recipe.image_url ? (
  <Image
    src={meal.recipe.image_url}
    alt={meal.recipe.name}
    fill
    className="object-cover"
    onError={(e) => {
      e.currentTarget.src = '/images/meal-placeholder.png'
    }}
  />
) : (
  <div className="w-full h-full bg-muted flex items-center justify-center">
    <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
  </div>
)}
```

---

### 6. Błąd autentykacji (401)

**Scenariusz:** Sesja wygasła podczas przeglądania

**Obsługa:**

```typescript
// W middleware.ts (globalna obsługa)
if (error.status === 401) {
  redirect('/login')
}

// W usePlannedMealsQuery
onError: (error) => {
  if (error.message.includes('Uwierzytelnienie')) {
    router.push('/login')
  }
}
```

---

## 11. Kroki implementacji

### Krok 1: Typy i pomocnicze funkcje (1h)

1.1. Utwórz plik typów:

```bash
touch src/types/meal-plan-view.types.ts
```

1.2. Zaimplementuj typy:

- `WeekPlanViewModel`
- `DayPlanViewModel`
- `RecipeModalState`
- `ReplacementsModalState`
- Mapy tłumaczeń (DAY_NAMES, MONTH_NAMES, MEAL_TYPE_LABELS)

  1.3. Utwórz plik utils:

```bash
touch src/lib/utils/meal-plan.ts
```

1.4. Zaimplementuj funkcję `transformToWeekPlan()`

---

### Krok 2: Custom hooki (2h)

2.1. Hook do zamienników (nowy):

```bash
touch src/hooks/useReplacementsQuery.ts
```

- Implementacja zgodnie z sekcją 6

  2.2. Hook do wymiany posiłku:

```bash
touch src/hooks/useMealSwap.ts
```

- Integracja z `updatePlannedMeal` (action: 'swap_recipe')
- Optimistic update (opcjonalnie)
- Toast notifications

  2.3. Weryfikacja istniejącego hooka:

- `usePlannedMealsQuery` już zaimplementowany (reużycie)

---

### Krok 3: Komponenty UI (shadcn/ui) (30min)

3.1. Zainstaluj brakujące komponenty:

```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add skeleton
# Card, Badge, Button już powinny być zainstalowane
```

3.2. Zweryfikuj konfigurację Tailwind dla responsive breakpoints

---

### Krok 4: Komponenty prezentacyjne (4-5h)

**Krok 4.1: MealCell (1h)**

```bash
touch src/components/meal-plan/MealCell.tsx
```

- Implementacja zgodnie z sekcją 4
- Hover overlay z ikonami
- Placeholder dla pustych komórek

**Krok 4.2: WeekTable (1h)**

```bash
touch src/components/meal-plan/WeekTable.tsx
```

- Semantyczny HTML (`<table>`, `<thead>`, `<tbody>`)
- Responsive scroll (overflow-x-auto)
- 7 kolumn × 3 wiersze
- Integracja z MealCell

**Krok 4.3: MealCard (mobile variant) (1h)**

```bash
touch src/components/meal-plan/MealCard.tsx
```

- Bardziej rozbudowana karta niż MealCell
- Badge z typem posiłku
- Akcje: "Zobacz przepis", "Zmień"

**Krok 4.4: DayCard (45min)**

```bash
touch src/components/meal-plan/DayCard.tsx
```

- Header z datą
- 3x MealCard wewnątrz

**Krok 4.5: DayList (30min)**

```bash
touch src/components/meal-plan/DayList.tsx
```

- Wrapper dla 7x DayCard
- Mobile-only (hidden md:hidden)

---

### Krok 5: Komponenty modali (3-4h)

**Krok 5.1: RecipeModal (1h)**

```bash
touch src/components/meal-plan/RecipeModal.tsx
```

- Reużycie komponentów z `RecipeDetailClient`:
  - RecipeHeader
  - MacroSummary
  - IngredientsList
  - InstructionsList
- Dialog z shadcn/ui
- Scroll dla długich przepisów

**Krok 5.2: ReplacementCard (1h)**

```bash
touch src/components/meal-plan/ReplacementCard.tsx
```

- Compact card z miniaturką
- Badge z calorie_diff (color-coded)
- Button "Wybierz"
- Loading state (disabled button, spinner)

**Krok 5.3: ReplacementsList (30min)**

```bash
touch src/components/meal-plan/ReplacementsList.tsx
```

- Wrapper dla listy ReplacementCard
- Loading state: Skeleton xN
- Empty state: EmptyState component

**Krok 5.4: ReplacementsModal (1.5h)**

```bash
touch src/components/meal-plan/ReplacementsModal.tsx
```

- Dialog z shadcn/ui
- Integracja z useReplacementsQuery
- Integracja z useMealSwap
- Obsługa stanów: loading, empty, success, error

---

### Krok 6: Główny komponent kliencki (2h)

6.1. Utwórz MealPlanClient:

```bash
touch src/components/meal-plan/MealPlanClient.tsx
```

6.2. Implementacja:

- Stan modali (useState)
- usePlannedMealsQuery dla re-fetching
- transformToWeekPlan ViewModel
- Responsywne renderowanie (WeekTable vs DayList)
- Handlers: handleMealClick, handleSwapClick
- Renderowanie modali

  6.3. Loading states:

- Skeleton dla WeekTable (desktop)
- Skeleton dla DayList (mobile)

---

### Krok 7: Server Component (Page) (1h)

7.1. Utwórz strukturę:

```bash
mkdir -p app/meal-plan
touch app/meal-plan/page.tsx
touch app/meal-plan/loading.tsx
```

7.2. Implementuj MealPlanPage:

- Initial data fetching (7 dni)
- Obliczanie zakresu dat (dziś + 6 dni)
- Przekazanie do MealPlanClient
- Metadata (SEO)

  7.3. Implementuj loading.tsx:

- Skeleton UI (reużycie komponentów)

---

### Krok 8: Styling i responsywność (2-3h)

8.1. Tailwind CSS:

- Mobile-first approach
- Breakpoint md (768px) dla desktop/mobile switch
- Hover effects (group-hover dla MealCell)
- Focus states (keyboard accessibility)

  8.2. Responsywność:

- Tabela: overflow-x-auto, min-width dla kolumn
- Mobile: Stack layout, full-width cards
- Modal: max-h-[90vh] overflow-y-auto

  8.3. Accessibility:

- Semantyczny HTML (table, thead, tbody dla WeekTable)
- ARIA labels dla akcji (Zobacz, Zmień)
- Keyboard navigation (Tab, Enter, Escape)
- Focus indicators

---

### Krok 9: Testowanie (3-4h)

9.1. Unit testy (Vitest):

- `transformToWeekPlan()` function
- `useMealSwap` hook (mocked API)

  9.2. Component testy (React Testing Library):

- `MealCell` (rendering, onClick)
- `ReplacementCard` (badge colors, onClick)
- `RecipeModal` (open/close, content)

  9.3. Integration testy:

- MealPlanClient z mock data
- Modal flow: otwarcie → wybór → zamknięcie
- Responsywność: WeekTable ↔ DayList

  9.4. E2E testy (Playwright):

- Happy path: Zobacz przepis w planie tygodniowym
- Happy path: Zmień posiłek → wybierz zamiennik → sprawdź aktualizację
- Error path: Brak zamienników
- Responsywność: Desktop vs Mobile rendering

---

### Krok 10: Optymalizacja i finalizacja (1-2h)

10.1. Performance:

- Lazy loading obrazów (next/image)
- Memoizacja `transformToWeekPlan` (useMemo)
- Code splitting dla modali (dynamic import - opcjonalnie)

  10.2. Error boundaries:

```bash
touch app/meal-plan/error.tsx
```

10.3. Code review checklist:

- TypeScript strict mode (brak `any`)
- Path aliases (@/) wszędzie
- ESLint i Prettier pass
- Brak console.log

---

### Krok 11: Dokumentacja i deployment (1h)

11.1. Dokumentacja:

- JSDoc comments dla hooków
- README update dla nowego widoku

  11.2. Deployment checklist:

- Build passes (`npm run build`)
- Testy pass (`npm test`)
- Lighthouse audit (Performance, Accessibility)

---

## Podsumowanie

Plan implementacji widoku Plan Posiłków obejmuje:

1. **Architektura hybrydowa:** Server Components (initial load) + Client Components (interaktywność)
2. **Responsywność:** WeekTable (desktop) + DayList (mobile) z CSS media queries
3. **Modals:** RecipeModal (podgląd) + ReplacementsModal (wymiana) jako overlays
4. **API Integration:** 3 endpointy (getPlannedMeals, getReplacementRecipes, updatePlannedMeal)
5. **Zarządzanie stanem:** TanStack Query (server state) + React useState (modal state)
6. **Reużycie komponentów:** RecipeDetailClient components w RecipeModal
7. **Testowanie:** >80% coverage dla krytycznej logiki
8. **Dostępność:** Semantyczne HTML, ARIA labels, keyboard navigation

**Szacowany czas implementacji:** 20-25 godzin (3-4 dni dla jednego programisty frontend)

**Priorytety MVP:**

- ✅ Must-have: WeekTable, DayList, RecipeModal, ReplacementsModal, API integration
- 🔄 Should-have: Loading states, Error handling, Responsywność
- ⏳ Nice-to-have: Animacje, Optimistic updates dla wymiany, Code splitting
