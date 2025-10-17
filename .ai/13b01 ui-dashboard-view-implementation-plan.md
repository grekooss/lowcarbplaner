# Plan implementacji widoku Dashboard

## 1. Przegląd

Widok Dashboard jest centralnym punktem aplikacji LowCarbPlaner. Umożliwia użytkownikowi przeglądanie planu posiłków na bieżący dzień, śledzenie postępów w realizacji celów żywieniowych oraz oznaczanie posiłków jako zjedzonych. Widok składa się z trzech głównych sekcji: nawigacji kalendarzowej (7 dni), pasków postępu makroskładników (kalorie, białko, węglowodany, tłuszcze) oraz kart posiłków (śniadanie, obiad, kolacja).

Kluczowe funkcjonalności:

- Wyświetlanie posiłków zaplanowanych na wybrany dzień
- Oznaczanie posiłków jako zjedzonych/niezjedzonych z optymistyczną aktualizacją UI
- Automatyczne obliczanie i wyświetlanie postępu realizacji celów dziennych
- Nawigacja między dniami za pomocą kalendarza

## 2. Routing widoku

**Ścieżka:** `/` (root route)

**Lokalizacja pliku:** `app/(authenticated)/page.tsx`

**Middleware:** Automatyczne sprawdzenie autentykacji i przekierowanie na `/login` jeśli użytkownik niezalogowany, lub na `/onboarding` jeśli profil nie jest ukończony.

## 3. Struktura komponentów

```
DashboardPage (Server Component)
├── DashboardClient (Client Component - wrapper)
│   ├── CalendarStrip (Client Component)
│   ├── MacroProgressSection (Client Component)
│   │   └── MacroProgressBar (Client Component) x4
│   │       └── Progress (shadcn/ui)
│   └── MealsList (Client Component)
│       ├── MealCard (Client Component) - Śniadanie
│       ├── MealCard (Client Component) - Obiad
│       ├── MealCard (Client Component) - Kolacja
│       └── EmptyState (opcjonalnie)
```

**Separacja odpowiedzialności:**

- **DashboardPage (Server Component):** Initial data fetching (posiłki, profil użytkownika)
- **DashboardClient (Client Component):** Zarządzanie stanem klienckim, interakcje użytkownika
- **Komponenty prezentacyjne:** Renderowanie UI i delegowanie zdarzeń w górę

## 4. Szczegóły komponentów

### DashboardPage (Server Component)

**Opis:** Główny kontener widoku, odpowiedzialny za initial data fetching i przekazanie danych do Client Components.

**Główne elementy:**

- Wrapper `<main>` z odpowiednimi klasami Tailwind
- Komponent `<DashboardClient>` z przekazanymi danymi jako props

**Obsługiwane interakcje:** Brak (Server Component)

**Obsługiwana walidacja:** Brak

**Typy:**

- `PlannedMealDTO[]` - dane posiłków
- `ProfileDTO` - dane profilu użytkownika (cele dzienne)

**Propsy:** Brak (root page component)

**Implementacja:**

```typescript
// app/(authenticated)/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { getPlannedMeals } from '@/lib/actions/planned-meals'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Pobierz profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('target_calories, target_protein_g, target_carbs_g, target_fats_g')
    .eq('id', user.id)
    .single()

  // Pobierz posiłki na dziś (initial load)
  const today = new Date().toISOString().split('T')[0]
  const mealsResult = await getPlannedMeals({
    start_date: today,
    end_date: today
  })

  const meals = mealsResult.error ? [] : mealsResult.data

  return (
    <main className="container mx-auto px-4 py-8">
      <DashboardClient
        initialMeals={meals}
        targetMacros={profile}
        initialDate={today}
      />
    </main>
  )
}
```

---

### DashboardClient (Client Component)

**Opis:** Główny komponent kliencki zarządzający stanem wybranej daty, re-fetchingiem danych i koordynacją między komponentami potomnymi.

**Główne elementy:**

- `<div>` wrapper z layoutem (flex flex-col gap-6)
- `<h1>` nagłówek "Twój Plan Dnia"
- `<CalendarStrip>` - nawigacja kalendarzowa
- `<MacroProgressSection>` - sekcja pasków postępu
- `<MealsList>` - lista kart posiłków

**Obsługiwane interakcje:**

- Zmiana wybranej daty (onDateChange z CalendarStrip)
- Toggle posiłku jako zjedzony (onMealToggle z MealCard)

**Obsługiwana walidacja:**

- Walidacja zakresu dat (dziś ± 3 dni)

**Typy:**

- `PlannedMealDTO[]`
- `ProfileDTO` (target macros)
- `Date` (selectedDate)

**Propsy:**

```typescript
interface DashboardClientProps {
  initialMeals: PlannedMealDTO[]
  targetMacros: {
    target_calories: number
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  }
  initialDate: string // YYYY-MM-DD
}
```

---

### CalendarStrip (Client Component)

**Opis:** Komponent nawigacji kalendarzowej wyświetlający 7 dni (dziś ± 3 dni) z możliwością przełączania się między nimi.

**Główne elementy:**

- `<div>` wrapper z overflow-x-auto i scroll-snap
- 7x `<button>` reprezentujących pojedyncze dni
- Każdy przycisk zawiera:
  - `<span>` z nazwą dnia (Pon, Wt, Śr, etc.)
  - `<span>` z numerem dnia miesiąca
- Wizualne wyróżnienie wybranego dnia i dnia dzisiejszego

**Obsługiwane interakcje:**

- onClick na przyciskach dni → zmiana selectedDate

**Obsługiwana walidacja:**

- Brak (wszystkie dni są klikalne w zakresie ±3 dni)

**Typy:**

- `CalendarDayViewModel[]` - model pojedynczego dnia
- `Date` - selectedDate

**Propsy:**

```typescript
interface CalendarStripProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}
```

**Implementacja pomocnicza:**

```typescript
// types/viewmodels.ts
export interface CalendarDayViewModel {
  date: Date
  dayName: string // 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'
  dayNumber: number
  isToday: boolean
  isSelected: boolean
}
```

---

### MacroProgressSection (Client Component)

**Opis:** Sekcja zawierająca 4 paski postępu dla makroskładników z automatycznym obliczaniem wartości consumed na podstawie zjedzionych posiłków.

**Główne elementy:**

- `<div>` wrapper z grid layout (grid-cols-1 md:grid-cols-2 gap-4)
- 4x `<MacroProgressBar>` dla: kalorie, białko, węglowodany, tłuszcze
- Nagłówek sekcji "Postęp dzienny"

**Obsługiwane interakcje:** Brak (tylko wyświetlanie)

**Obsługiwana walidacja:**

- Obliczanie consumed z posiłków oznaczonych jako is_eaten: true
- Agregacja wartości z recipe.total\_\* dla każdego makroskładnika

**Typy:**

- `DailyMacrosViewModel` - zagregowane dane

**Propsy:**

```typescript
interface MacroProgressSectionProps {
  meals: PlannedMealDTO[]
  targetMacros: {
    target_calories: number
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  }
}
```

**Implementacja pomocnicza:**

```typescript
// types/viewmodels.ts
export interface DailyMacrosViewModel {
  consumed: {
    calories: number
    protein_g: number
    carbs_g: number
    fats_g: number
  }
  target: {
    calories: number
    protein_g: number
    carbs_g: number
    fats_g: number
  }
}
```

---

### MacroProgressBar (Client Component)

**Opis:** Pojedynczy pasek postępu dla makroskładnika z etykietą, wartościami current/target i wizualizacją procentowego wypełnienia.

**Główne elementy:**

- `<div>` wrapper z flex layout
- `<div>` górna sekcja:
  - `<span>` etykieta (np. "Kalorie")
  - `<span>` wartości "current / target unit" (np. "1200 / 1800 kcal")
- `<Progress>` komponent z shadcn/ui
  - value = (current / target) \* 100
  - className z kolorami: green (< 90%), yellow (90-100%), red (> 100%)
- `<span>` procent realizacji (np. "67%")

**Obsługiwane interakcje:** Brak

**Obsługiwana walidacja:**

- Clamp value: Math.min((current / target) \* 100, 100) dla paska
- Kolor warunkowy na podstawie procentu realizacji

**Typy:**

- `label: string`
- `current: number`
- `target: number`
- `unit: string`

**Propsy:**

```typescript
interface MacroProgressBarProps {
  label: string // "Kalorie", "Białko", "Węglowodany", "Tłuszcze"
  current: number
  target: number
  unit: string // "kcal", "g"
}
```

---

### MealsList (Client Component)

**Opis:** Kontener dla trzech kart posiłków (śniadanie, obiad, kolacja) z obsługą stanu pustego (brak posiłków).

**Główne elementy:**

- `<div>` wrapper z flex flex-col gap-4
- Sekcja nagłówkowa z tytułem "Posiłki"
- Warunkowe renderowanie:
  - Jeśli `meals.length === 0`: `<EmptyState>`
  - Jeśli `meals.length > 0`: 3x `<MealCard>` (breakfast, lunch, dinner)

**Obsługiwane interakcje:**

- onMealToggle (callback przekazany z DashboardClient)

**Obsługiwana walidacja:**

- Filtrowanie posiłków po meal_type
- Sprawdzenie czy wszystkie 3 typy posiłków istnieją

**Typy:**

- `DailyMealsViewModel` - posiłki pogrupowane po typie

**Propsy:**

```typescript
interface MealsListProps {
  meals: PlannedMealDTO[]
  onMealToggle: (mealId: number, currentState: boolean) => void
  isLoading?: boolean
}
```

**Implementacja pomocnicza:**

```typescript
// types/viewmodels.ts
export interface DailyMealsViewModel {
  date: string // YYYY-MM-DD
  breakfast: PlannedMealDTO | null
  lunch: PlannedMealDTO | null
  dinner: PlannedMealDTO | null
}
```

---

### MealCard (Client Component)

**Opis:** Karta pojedynczego posiłku z nazwą dania, kalorycznością, obrazem i checkboxem do oznaczania jako zjedzony.

**Główne elementy:**

- `<Card>` z shadcn/ui
- `<CardHeader>`:
  - `<Badge>` z typem posiłku (Śniadanie/Obiad/Kolacja)
  - `<Checkbox>` "Zjedzono" (controlled component)
- `<CardContent>`:
  - Opcjonalnie `<Image>` z next/image (recipe.image_url)
  - `<h3>` nazwa przepisu (recipe.name)
  - `<div>` wartości odżywcze:
    - Kalorie
    - Białko, Węglowodany, Tłuszcze (w linii)
- Stan loading: disabled checkbox, opacity-50

**Obsługiwane interakcje:**

- onChange na checkbox → wywołanie onToggle(meal.id, meal.is_eaten)

**Obsługiwana walidacja:**

- Disabled podczas mutacji (isLoading)
- Optymistyczna aktualizacja: wizualne oznaczenie przed odpowiedzią API

**Typy:**

- `PlannedMealDTO`
- `boolean` (isLoading)

**Propsy:**

```typescript
interface MealCardProps {
  meal: PlannedMealDTO
  onToggle: (mealId: number, currentState: boolean) => void
  isLoading?: boolean
}
```

---

### EmptyState (Client Component)

**Opis:** Komponent wyświetlany gdy brak posiłków na dany dzień.

**Główne elementy:**

- `<div>` wrapper z centrowaniem
- `<div>` ikona (np. UtensilsCrossed z lucide-react)
- `<h3>` tytuł "Brak posiłków na ten dzień"
- `<p>` opis
- `<Button>` CTA "Wygeneruj plan posiłków" (link do /profile/generate)

**Obsługiwane interakcje:**

- onClick → przekierowanie lub wywołanie akcji generowania planu

**Obsługiwana walidacja:** Brak

**Typy:** Brak specjalnych typów

**Propsy:**

```typescript
interface EmptyStateProps {
  date: string // YYYY-MM-DD dla kontekstu
}
```

---

## 5. Typy

### Istniejące typy z dto.types.ts:

```typescript
// src/types/dto.types.ts
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

export type ProfileDTO = Omit<
  Tables<'profiles'>,
  'id' | 'created_at' | 'updated_at'
>
```

### Nowe typy ViewModels (do utworzenia):

```typescript
// src/types/viewmodels.ts

/**
 * Model danych dla sekcji pasków postępu makroskładników
 */
export interface DailyMacrosViewModel {
  consumed: {
    calories: number
    protein_g: number
    carbs_g: number
    fats_g: number
  }
  target: {
    calories: number
    protein_g: number
    carbs_g: number
    fats_g: number
  }
}

/**
 * Model danych dla posiłków pogrupowanych według typu
 */
export interface DailyMealsViewModel {
  date: string // YYYY-MM-DD
  breakfast: PlannedMealDTO | null
  lunch: PlannedMealDTO | null
  dinner: PlannedMealDTO | null
}

/**
 * Model pojedynczego dnia w kalendarzu
 */
export interface CalendarDayViewModel {
  date: Date
  dayName: string // 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'
  dayNumber: number
  monthName: string // 'Sty', 'Lut', 'Mar', etc.
  isToday: boolean
  isSelected: boolean
}
```

### Typy dla Server Actions (istniejące):

```typescript
// src/lib/actions/planned-meals.ts
type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string }

// Używane w getPlannedMeals
type GetPlannedMealsQueryInput = {
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
}

// Używane w updatePlannedMeal
type UpdatePlannedMealBodyInput =
  | { action: 'mark_eaten'; is_eaten: boolean }
  | { action: 'swap_recipe'; recipe_id: number }
  | { action: 'modify_ingredients'; ingredient_overrides: IngredientOverrides }
```

---

## 6. Zarządzanie stanem

### Stan serwera (TanStack Query):

**usePlannedMealsQuery:**

```typescript
// hooks/usePlannedMealsQuery.ts
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

### Stan klienta (Zustand):

**useDashboardStore:**

```typescript
// lib/zustand/stores/useDashboardStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DashboardState {
  selectedDate: Date
  optimisticMeals: Map<number, { is_eaten: boolean }>
  setSelectedDate: (date: Date) => void
  setOptimisticMealState: (mealId: number, isEaten: boolean) => void
  clearOptimisticUpdate: (mealId: number) => void
  resetOptimisticUpdates: () => void
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      selectedDate: new Date(),
      optimisticMeals: new Map(),

      setSelectedDate: (date) => set({ selectedDate: date }),

      setOptimisticMealState: (mealId, isEaten) =>
        set((state) => {
          const newMap = new Map(state.optimisticMeals)
          newMap.set(mealId, { is_eaten: isEaten })
          return { optimisticMeals: newMap }
        }),

      clearOptimisticUpdate: (mealId) =>
        set((state) => {
          const newMap = new Map(state.optimisticMeals)
          newMap.delete(mealId)
          return { optimisticMeals: newMap }
        }),

      resetOptimisticUpdates: () => set({ optimisticMeals: new Map() }),
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({ selectedDate: state.selectedDate }),
    }
  )
)
```

### Custom hooki:

**useMealToggle:**

```typescript
// hooks/useMealToggle.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePlannedMeal } from '@/lib/actions/planned-meals'
import { useDashboardStore } from '@/lib/zustand/stores/useDashboardStore'
import { toast } from '@/hooks/use-toast'

export const useMealToggle = () => {
  const queryClient = useQueryClient()
  const { setOptimisticMealState, clearOptimisticUpdate } = useDashboardStore()

  return useMutation({
    mutationFn: async ({
      mealId,
      isEaten,
    }: {
      mealId: number
      isEaten: boolean
    }) => {
      const result = await updatePlannedMeal(mealId, {
        action: 'mark_eaten',
        is_eaten: isEaten,
      })
      if (result.error) throw new Error(result.error)
      return result.data
    },

    onMutate: async ({ mealId, isEaten }) => {
      // Optimistic update
      setOptimisticMealState(mealId, isEaten)

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['planned-meals'] })

      // Snapshot previous value
      const previousMeals = queryClient.getQueryData(['planned-meals'])

      // Optimistically update cache
      queryClient.setQueryData(['planned-meals'], (old: any) => {
        if (!old) return old
        return old.map((meal: any) =>
          meal.id === mealId ? { ...meal, is_eaten: isEaten } : meal
        )
      })

      return { previousMeals }
    },

    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousMeals) {
        queryClient.setQueryData(['planned-meals'], context.previousMeals)
      }
      clearOptimisticUpdate(variables.mealId)

      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować posiłku. Spróbuj ponownie.',
        variant: 'destructive',
      })
    },

    onSuccess: (data, variables) => {
      clearOptimisticUpdate(variables.mealId)
    },

    onSettled: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['planned-meals'] })
    },
  })
}
```

**useDailyMacros:**

```typescript
// hooks/useDailyMacros.ts
import { useMemo } from 'react'
import type { PlannedMealDTO } from '@/types/dto.types'
import type { DailyMacrosViewModel } from '@/types/viewmodels'

interface UseDailyMacrosParams {
  meals: PlannedMealDTO[]
  targetCalories: number
  targetProteinG: number
  targetCarbsG: number
  targetFatsG: number
}

export const useDailyMacros = ({
  meals,
  targetCalories,
  targetProteinG,
  targetCarbsG,
  targetFatsG,
}: UseDailyMacrosParams): DailyMacrosViewModel => {
  return useMemo(() => {
    const consumed = meals
      .filter((meal) => meal.is_eaten)
      .reduce(
        (acc, meal) => ({
          calories: acc.calories + (meal.recipe.total_calories || 0),
          protein_g: acc.protein_g + (meal.recipe.total_protein_g || 0),
          carbs_g: acc.carbs_g + (meal.recipe.total_carbs_g || 0),
          fats_g: acc.fats_g + (meal.recipe.total_fats_g || 0),
        }),
        { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0 }
      )

    return {
      consumed,
      target: {
        calories: targetCalories,
        protein_g: targetProteinG,
        carbs_g: targetCarbsG,
        fats_g: targetFatsG,
      },
    }
  }, [meals, targetCalories, targetProteinG, targetCarbsG, targetFatsG])
}
```

**useCalendarDays:**

```typescript
// hooks/useCalendarDays.ts
import { useMemo } from 'react'
import type { CalendarDayViewModel } from '@/types/viewmodels'

const DAY_NAMES = ['Ndz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob']
const MONTH_NAMES = [
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

export const useCalendarDays = (selectedDate: Date): CalendarDayViewModel[] => {
  return useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const days: CalendarDayViewModel[] = []

    // Generuj 7 dni: dziś ± 3 dni
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      days.push({
        date,
        dayName: DAY_NAMES[date.getDay()],
        dayNumber: date.getDate(),
        monthName: MONTH_NAMES[date.getMonth()],
        isToday: i === 0,
        isSelected: date.toDateString() === selectedDate.toDateString(),
      })
    }

    return days
  }, [selectedDate])
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
  end_date: string // YYYY-MM-DD
}
```

**Typ odpowiedzi:**

```typescript
ActionResult<PlannedMealDTO[]>
// gdzie ActionResult = { data: PlannedMealDTO[] } | { error: string }
```

**Użycie w komponencie:**

```typescript
// W DashboardClient
const {
  data: meals,
  isLoading,
  error,
} = usePlannedMealsQuery(
  selectedDate.toISOString().split('T')[0],
  selectedDate.toISOString().split('T')[0]
)
```

**Cache invalidation:**

- Automatyczna invalidacja po `updatePlannedMeal` mutation
- Ręczna invalidacja: `queryClient.invalidateQueries(['planned-meals'])`

---

### Endpoint: PATCH /planned-meals/{id}

**Server Action:** `updatePlannedMeal(mealId: number, updateData: UpdatePlannedMealBodyInput)`

**Typ żądania (mark_eaten):**

```typescript
{
  action: 'mark_eaten'
  is_eaten: boolean
}
```

**Typ odpowiedzi:**

```typescript
ActionResult<PlannedMealDTO>
// gdzie ActionResult = { data: PlannedMealDTO } | { error: string }
```

**Użycie w komponencie:**

```typescript
// W MealCard via useMealToggle hook
const { mutate: toggleMeal, isPending } = useMealToggle()

const handleToggle = () => {
  toggleMeal({
    mealId: meal.id,
    isEaten: !meal.is_eaten,
  })
}
```

**Optimistic update:**

1. `onMutate`: Zapisz snapshot cache, zaktualizuj UI
2. Wykonaj mutację API
3. `onSuccess`: Wyczyść optimistic state
4. `onError`: Rollback do snapshotа, pokaż toast
5. `onSettled`: Invalidate query cache

---

## 8. Interakcje użytkownika

### 1. Kliknięcie dnia w kalendarzu

**Trigger:** `onClick` na przycisku dnia w `CalendarStrip`

**Flow:**

1. Użytkownik klika dzień (np. "Wt 25")
2. `CalendarStrip` wywołuje `onDateChange(newDate)`
3. `DashboardClient` aktualizuje `selectedDate` (Zustand)
4. TanStack Query automatycznie refetchuje dane dla nowej daty (reaktywność na `queryKey`)
5. UI aktualizuje się z nowymi posiłkami

**Implementacja:**

```typescript
// W CalendarStrip
<button
  onClick={() => onDateChange(day.date)}
  className={cn(
    "flex flex-col items-center p-3 rounded-lg",
    day.isSelected && "bg-primary text-primary-foreground",
    day.isToday && "border-2 border-primary"
  )}
>
  <span className="text-sm">{day.dayName}</span>
  <span className="text-lg font-bold">{day.dayNumber}</span>
</button>
```

---

### 2. Zaznaczenie checkbox "Zjedzono"

**Trigger:** `onChange` na `Checkbox` w `MealCard`

**Flow:**

1. Użytkownik zaznacza checkbox
2. `MealCard` wywołuje `onToggle(meal.id, meal.is_eaten)`
3. `useMealToggle` hook:
   - a. Optimistic update: natychmiastowa aktualizacja UI (checkbox zaznaczony, posiłek wyglądadlo zjedzony)
   - b. Wywołanie `updatePlannedMeal` API
   - c. Podczas oczekiwania: checkbox disabled, loading indicator
4. Sukces: `MacroProgressSection` automatycznie przelicza consumed (reaktywność na `meals`)
5. Błąd: Rollback optimistic update, toast z komunikatem

**Implementacja:**

```typescript
// W MealCard
const { mutate: toggleMeal, isPending } = useMealToggle()

<Checkbox
  id={`meal-${meal.id}`}
  checked={meal.is_eaten}
  disabled={isPending}
  onCheckedChange={(checked) => {
    toggleMeal({
      mealId: meal.id,
      isEaten: Boolean(checked),
    })
  }}
/>
```

---

### 3. Odznaczenie checkbox "Zjedzono"

**Trigger:** `onChange` na zaznaczonym `Checkbox`

**Flow:**
Identyczny jak w punkcie 2, ale `is_eaten: false`

1. Optimistic update: checkbox odznaczony
2. API call
3. Sukces: Paski postępu automatycznie się zmniejszają (consumed odejmuje wartości posiłku)
4. Błąd: Rollback, toast

---

### 4. Brak posiłków na dzień (EmptyState)

**Trigger:** `meals.length === 0`

**Flow:**

1. `MealsList` renderuje `<EmptyState>`
2. Użytkownik widzi komunikat "Brak posiłków na ten dzień"
3. Kliknięcie "Wygeneruj plan posiłków":
   - Opcja A: Redirect do `/profile/generate`
   - Opcja B: Wywołanie Server Action `generateMealPlan` bezpośrednio (wymaga implementacji)

**Implementacja:**

```typescript
// W MealsList
{meals.length === 0 ? (
  <EmptyState date={selectedDate.toISOString().split('T')[0]} />
) : (
  // Renderuj MealCard x3
)}
```

---

## 9. Warunki i walidacja

### Frontend validation:

#### CalendarStrip:

- **Warunek:** Wyświetlaj tylko 7 dni (dziś ± 3 dni)
- **Walidacja:** Generowanie dni w `useCalendarDays` hook
- **Wpływ na UI:** Użytkownik nie może wybrać dnia poza zakresem (przyciski nie istnieją)

#### MealCard:

- **Warunek:** Checkbox disabled podczas mutacji
- **Walidacja:** `isPending` z `useMealToggle`
- **Wpływ na UI:** Checkbox nieaktywny, opacity-50, cursor-not-allowed

#### MacroProgressBar:

- **Warunek:** Kolor paska zależny od procentu realizacji
- **Walidacja:**
  - `< 90%`: green (text-green-600, bg-green-100)
  - `90-100%`: yellow (text-yellow-600, bg-yellow-100)
  - `> 100%`: red (text-red-600, bg-red-100)
- **Wpływ na UI:** Dynamiczne klasy CSS

```typescript
const getProgressColor = (current: number, target: number) => {
  const percent = (current / target) * 100
  if (percent < 90) return 'bg-green-500'
  if (percent <= 100) return 'bg-yellow-500'
  return 'bg-red-500'
}
```

#### MacroProgressSection:

- **Warunek:** Consumed nie może być ujemne
- **Walidacja:** `Math.max(0, consumed)` w `useDailyMacros`
- **Wpływ na UI:** Zawsze wyświetlaj >= 0

### Backend validation (z planned-meals.ts):

#### getPlannedMeals:

- `start_date` i `end_date`: format YYYY-MM-DD (regex)
- `end_date >= start_date`
- Zakres <= 30 dni
- **Obsługa błędów:** Zwróć `{ error: string }`, wyświetl toast w UI

#### updatePlannedMeal:

- `mealId`: positive integer
- `is_eaten`: boolean
- **Obsługa błędów:**
  - 400: "Nieprawidłowe dane" → toast
  - 401: Redirect na /login
  - 403: "Brak uprawnień" → toast
  - 404: "Posiłek nie znaleziony" → toast

---

## 10. Obsługa błędów

### 1. Brak posiłków na dzień

**Scenariusz:** `meals.length === 0`

**Obsługa:**

- Wyświetl `<EmptyState>` z komunikatem i CTA
- Zaproponuj generowanie planu lub sprawdzenie innej daty

**UI:**

```typescript
<EmptyState
  title="Brak posiłków na ten dzień"
  description="Wygeneruj plan posiłków, aby móc śledzić swoje postępy."
  actionLabel="Wygeneruj plan"
  actionHref="/profile/generate"
/>
```

---

### 2. Błąd API (401 Unauthorized)

**Scenariusz:** Sesja użytkownika wygasła

**Obsługa:**

- TanStack Query error boundary
- Automatyczne przekierowanie na `/login`
- Middleware sprawdza sesję przed renderowaniem

**Implementacja:**

```typescript
// W usePlannedMealsQuery
onError: (error) => {
  if (error.message.includes('Uwierzytelnienie')) {
    router.push('/login')
  }
}
```

---

### 3. Błąd API (400 Bad Request)

**Scenariusz:** Nieprawidłowe parametry zapytania

**Obsługa:**

- Wyświetl toast z komunikatem błędu
- Fallback do dzisiejszej daty
- Log error w console dla debugowania

**Implementacja:**

```typescript
// W usePlannedMealsQuery
onError: (error) => {
  toast({
    title: 'Błąd',
    description: error.message || 'Nie udało się pobrać posiłków.',
    variant: 'destructive',
  })
  console.error('API Error:', error)
}
```

---

### 4. Błąd sieci (Network Error)

**Scenariusz:** Brak połączenia internetowego

**Obsługa:**

- TanStack Query automatyczny retry (3x z exponential backoff)
- Po wyczerpaniu prób: toast "Sprawdź połączenie internetowe"
- Przycisk "Spróbuj ponownie" wywołujący `refetch()`

**Implementacja:**

```typescript
// W usePlannedMealsQuery
retry: 3,
retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

// W UI
{error && (
  <Button onClick={() => refetch()}>Spróbuj ponownie</Button>
)}
```

---

### 5. Mutation failure (PATCH /planned-meals)

**Scenariusz:** Błąd podczas oznaczania posiłku jako zjedzony

**Obsługa:**

- Rollback optimistic update (przywrócenie poprzedniego stanu)
- Toast: "Nie udało się zaktualizować posiłku"
- Przycisk "Spróbuj ponownie" w toast (opcjonalnie)

**Implementacja:**

```typescript
// W useMealToggle hook (sekcja 6)
onError: (error, variables, context) => {
  // Rollback
  if (context?.previousMeals) {
    queryClient.setQueryData(['planned-meals'], context.previousMeals)
  }
  clearOptimisticUpdate(variables.mealId)

  // Toast
  toast({
    title: 'Błąd',
    description: 'Nie udało się zaktualizować posiłku. Spróbuj ponownie.',
    variant: 'destructive',
    action: (
      <Button variant="outline" onClick={() => mutate(variables)}>
        Spróbuj ponownie
      </Button>
    ),
  })
}
```

---

### 6. Brak profilu użytkownika

**Scenariusz:** Użytkownik zalogowany, ale brak profilu (onboarding nie ukończony)

**Obsługa:**

- Middleware sprawdza `profiles.onboarding_completed`
- Automatyczne przekierowanie na `/onboarding`
- Komunikat: "Uzupełnij profil, aby korzystać z aplikacji"

**Implementacja:**

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session && req.nextUrl.pathname === '/') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('disclaimer_accepted_at')
      .eq('id', session.user.id)
      .single()

    if (!profile?.disclaimer_accepted_at) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
  }

  return NextResponse.next()
}
```

---

### 7. Błąd ładowania obrazów

**Scenariusz:** `recipe.image_url` jest null lub obrazek nie może się załadować

**Obsługa:**

- Fallback placeholder z next/image
- Graceful degradation: pokaż ikonę zamiast obrazka
- Nie blokuj renderowania karty

**Implementacja:**

```typescript
// W MealCard
{meal.recipe.image_url ? (
  <Image
    src={meal.recipe.image_url}
    alt={meal.recipe.name}
    width={300}
    height={200}
    className="rounded-md object-cover"
    onError={(e) => {
      e.currentTarget.src = '/images/meal-placeholder.png'
    }}
  />
) : (
  <div className="w-full h-48 bg-muted flex items-center justify-center rounded-md">
    <UtensilsCrossed className="w-12 h-12 text-muted-foreground" />
  </div>
)}
```

---

## 11. Kroki implementacji

### Krok 1: Struktura projektu i typy

1.1. Utwórz nowe typy ViewModels:

```bash
touch src/types/viewmodels.ts
```

1.2. Dodaj typy zgodnie z sekcją 5:

- `DailyMacrosViewModel`
- `DailyMealsViewModel`
- `CalendarDayViewModel`

  1.3. Zweryfikuj poprawność istniejących typów DTO w `dto.types.ts`

---

### Krok 2: Custom hooki

2.1. Utwórz strukturę katalogów:

```bash
mkdir -p src/hooks
```

2.2. Implementuj hooki w kolejności:

```bash
touch src/hooks/usePlannedMealsQuery.ts
touch src/hooks/useMealToggle.ts
touch src/hooks/useDailyMacros.ts
touch src/hooks/useCalendarDays.ts
```

2.3. Kod hooków zgodnie z sekcją 6

2.4. Testy jednostkowe dla `useDailyMacros` (najkrytyczniejszy):

```bash
touch src/hooks/__tests__/useDailyMacros.test.ts
```

---

### Krok 3: Zustand store

3.1. Utwórz store:

```bash
touch src/lib/zustand/stores/useDashboardStore.ts
```

3.2. Implementuj store zgodnie z sekcją 6

3.3. Test integration: sprawdź persist middleware

---

### Krok 4: Komponenty UI (shadcn/ui)

4.1. Zainstaluj brakujące komponenty shadcn/ui:

```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add button
```

4.2. Zweryfikuj konfigurację Tailwind CSS

---

### Krok 5: Komponenty prezentacyjne

5.1. Utwórz strukturę:

```bash
mkdir -p src/components/dashboard
```

5.2. Implementuj komponenty w kolejności (bottom-up):

**Krok 5.2.1: MacroProgressBar**

```bash
touch src/components/dashboard/MacroProgressBar.tsx
```

- Użyj `<Progress>` z shadcn/ui
- Implementuj logikę kolorowania
- Dodaj ARIA labels

**Krok 5.2.2: MacroProgressSection**

```bash
touch src/components/dashboard/MacroProgressSection.tsx
```

- Użyj `useDailyMacros` hook
- Renderuj 4x `<MacroProgressBar>`
- Grid layout (responsive)

**Krok 5.2.3: CalendarStrip**

```bash
touch src/components/dashboard/CalendarStrip.tsx
```

- Użyj `useCalendarDays` hook
- Scroll-snap CSS
- Keyboard navigation (arrow keys)

**Krok 5.2.4: MealCard**

```bash
touch src/components/dashboard/MealCard.tsx
```

- Użyj `<Card>`, `<Checkbox>`, `<Badge>` z shadcn/ui
- Integraj `useMealToggle` hook
- Optimistic update indicator (opacity/spinner)

**Krok 5.2.5: EmptyState**

```bash
touch src/components/dashboard/EmptyState.tsx
```

- Ikona z lucide-react
- CTA button z linkiem

**Krok 5.2.6: MealsList**

```bash
touch src/components/dashboard/MealsList.tsx
```

- Filtruj posiłki po meal_type
- Warunkowe renderowanie EmptyState

---

### Krok 6: Główny komponent kliencki

6.1. Utwórz DashboardClient:

```bash
touch src/components/dashboard/DashboardClient.tsx
```

6.2. Implementacja:

- Oznacz jako `'use client'`
- Integruj wszystkie komponenty z kroku 5
- Użyj `usePlannedMealsQuery` dla re-fetching
- Użyj `useDashboardStore` dla selectedDate
- Obsługa stanów: loading, error, success

  6.3. Loading state: użyj Skeleton z shadcn/ui

```bash
npx shadcn-ui@latest add skeleton
```

---

### Krok 7: Server Component (Page)

7.1. Utwórz strukturę:

```bash
mkdir -p app/(authenticated)
touch app/(authenticated)/page.tsx
touch app/(authenticated)/loading.tsx
```

7.2. Implementuj DashboardPage:

- Initial data fetching (posiłki, profil)
- Przekaż dane jako props do DashboardClient
- Obsługa błędów (error.tsx boundary)

  7.3. Implementuj loading.tsx:

- Skeleton UI dla całego dashboardu

---

### Krok 8: Middleware i routing

8.1. Zaktualizuj middleware.ts:

- Sprawdzenie sesji
- Sprawdzenie profilu (onboarding_completed)
- Przekierowania: `/login`, `/onboarding`

  8.2. Zweryfikuj strukturę routingu:

```
app/
├── (authenticated)/
│   ├── page.tsx (Dashboard)
│   ├── loading.tsx
│   └── layout.tsx
├── (public)/
│   ├── login/
│   └── onboarding/
└── layout.tsx (root)
```

---

### Krok 9: Styling i dostępność

9.1. Tailwind CSS:

- Responsive breakpoints (mobile-first)
- Dark mode support (opcjonalnie dla MVP)
- Custom utility classes (jeśli potrzebne)

  9.2. Dostępność:

- Semantyczne HTML (`<main>`, `<section>`, `<article>`)
- ARIA labels dla Progress bars
- Keyboard navigation (Tab, Enter, Escape)
- Focus indicators (focus:ring-2)
- Screen reader testing

---

### Krok 10: Testowanie

10.1. Unit testy (Vitest):

- `useDailyMacros` hook (krytyczny)
- `useCalendarDays` hook
- Helper functions (jeśli istnieją)

  10.2. Component testy (React Testing Library):

- `MacroProgressBar` (renderowanie, kolory)
- `MealCard` (checkbox interaction)
- `CalendarStrip` (date selection)

  10.3. Integration testy:

- DashboardClient z mock API
- Optimistic updates flow
- Error handling flow

  10.4. E2E testy (Playwright):

- Happy path: zobaczenie posiłków → oznaczenie jako zjedzony → sprawdzenie pasków
- Error path: brak posiłków → kliknięcie "Wygeneruj plan"
- Navigation: przełączanie między dniami

---

### Krok 11: Optymalizacja i finalizacja

11.1. Performance:

- Bundle analysis (`npm run build && npm run analyze`)
- Lazy loading dla obrazów (next/image)
- Memoizacja komponentów (React.memo jeśli potrzebne)

  11.2. Error boundaries:

```bash
touch app/(authenticated)/error.tsx
```

11.3. Loading states:

- Skeleton UI dla wszystkich async operations
- Progress indicators

  11.4. Code review checklist:

- TypeScript strict mode (brak `any`)
- Path aliases (@/) wszędzie
- Conventional Commits
- ESLint i Prettier pass
- Brak console.log (tylko console.error dla błędów)

---

### Krok 12: Dokumentacja i deployment

12.1. Dokumentacja:

- JSDoc comments dla hooków
- README update (jeśli potrzebne)
- Storybook dla komponentów (opcjonalnie)

  12.2. Deployment checklist:

- .env.local nie w repo (już w .gitignore)
- Supabase RLS policies zweryfikowane
- Build passes (`npm run build`)
- Testy pass (`npm test`)
- Lint passes (`npm run lint`)

  12.3. Monitoring:

- Supabase Dashboard: sprawdzenie query performance
- Vercel Analytics (jeśli używane)
- Error tracking (Sentry - opcjonalnie)

---

## Podsumowanie

Ten plan implementacji obejmuje wszystkie aspekty widoku Dashboard, od architektury komponentów, przez zarządzanie stanem, integrację API, po obsługę błędów i testowanie. Kluczowe elementy to:

1. **Architektura hybrydowa:** Server Components dla initial load, Client Components dla interaktywności
2. **Optimistic Updates:** Natychmiastowa aktualizacja UI z rollbackiem na błąd
3. **Zarządzanie stanem:** TanStack Query (server state) + Zustand (client state)
4. **Dostępność:** Semantyczne HTML, ARIA labels, keyboard navigation
5. **Testowanie:** >80% coverage dla krytycznej logiki
6. **Performance:** Lazy loading, memoizacja, bundle optimization
