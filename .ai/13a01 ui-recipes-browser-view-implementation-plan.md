# Plan implementacji widoku Przeglądarki Przepisów

## 1. Przegląd

Widok Przeglądarki Przepisów to **publiczna strona docelowa** aplikacji LowCarbPlaner, dostępna dla niezalogowanych użytkowników pod ścieżką `/przepisy`. Głównym celem jest **prezentacja wartości aplikacji** poprzez pokazanie dostępnych przepisów niskowęglowodanowych oraz **zachęcenie do rejestracji**. Widok umożliwia przeglądanie wszystkich przepisów z filtrowaniem według typu posiłku (śniadanie, obiad, kolacja) oraz wyświetlenie szczegółów wybranego przepisu z pełną listą składników i instrukcjami przygotowania.

Kluczową funkcjonalnością jest **inteligentny modal rejestracji**: gdy niezalogowany użytkownik próbuje zobaczyć szczegóły przepisu, system zapamiętuje wybrany przepis i po zalogowaniu automatycznie przekierowuje użytkownika do tego przepisu.

---

## 2. Routing widoku

### Główne ścieżki:

- **`/przepisy`** - Strona główna z listą przepisów (Server Component)
- **`/przepisy/[id]`** - Szczegóły pojedynczego przepisu (Server Component)

### Dodatkowe ścieżki relacyjne:

- **`/signup?redirect=/przepisy/[id]`** - Rejestracja z przekierowaniem
- **`/login?redirect=/przepisy/[id]`** - Logowanie z przekierowaniem

### Parametry URL (dla `/przepisy`):

- `meal_types` (opcjonalny) - filtrowanie według typu posiłku (np. `?meal_types=breakfast,lunch`)
- `limit` (opcjonalny, domyślnie 20) - liczba wyników na stronę
- `offset` (opcjonalny, domyślnie 0) - offset dla paginacji

---

## 3. Struktura komponentów

```
app/przepisy/
├── page.tsx (RecipesBrowserPage - Server Component)
├── [id]/
│   └── page.tsx (RecipeDetailPage - Server Component)
│
components/recipes/
├── RecipesBrowserClient.tsx (Client Component - główny wrapper)
├── FeaturedRecipeCard.tsx (Client Component)
├── RecipesGrid.tsx (Client Component)
├── RecipeCard.tsx (Client Component)
├── RecipeFilters.tsx (Client Component)
├── LoadMoreButton.tsx (Client Component)
├── AuthPromptModal.tsx (Client Component)
│
components/recipes/detail/
├── RecipeDetailClient.tsx (Client Component - wrapper)
├── RecipeHeader.tsx (Presentation Component)
├── MacroSummary.tsx (Presentation Component)
├── IngredientsList.tsx (Presentation Component)
├── IngredientCategory.tsx (Presentation Component)
├── IngredientItem.tsx (Presentation Component)
├── InstructionsList.tsx (Presentation Component)
└── InstructionStep.tsx (Presentation Component)
│
components/ui/
├── Badge.tsx (shadcn/ui)
├── Button.tsx (shadcn/ui)
├── Card.tsx (shadcn/ui)
├── Dialog.tsx (shadcn/ui)
└── Separator.tsx (shadcn/ui)
│
lib/hooks/
├── useRecipesFilter.ts (Custom hook - filtrowanie i paginacja)
├── useAuthPrompt.ts (Custom hook - modal rejestracji)
└── useAuthCheck.ts (Custom hook - sprawdzanie stanu logowania)
│
lib/react-query/
└── queries/
    ├── useRecipesQuery.ts (TanStack Query - lista przepisów)
    └── useRecipeQuery.ts (TanStack Query - szczegóły przepisu)
```

---

## 4. Szczegóły komponentów

### 4.1. RecipesBrowserPage (Server Component)

**Ścieżka:** `app/przepisy/page.tsx`

#### Opis:

Główna strona przeglądarki przepisów. Server Component odpowiedzialny za **wstępne załadowanie danych** (pierwszy batch przepisów) i przekazanie ich do Client Component. Wykorzystuje Server Actions dla SSR/ISR.

#### Główne elementy:

- Wywołanie `getRecipes()` z parametrami z URL
- Renderowanie `RecipesBrowserClient` z initial data
- SEO metadata (title, description, Open Graph)
- Error boundary dla obsługi błędów

#### Obsługiwane zdarzenia:

- Brak (Server Component)

#### Warunki walidacji:

- Walidacja searchParams przez `recipeQueryParamsSchema`
- Obsługa błędów z `getRecipes()` (error boundary)

#### Typy:

- `RecipeQueryParamsInput` (input)
- `RecipesResponse` (output z getRecipes)
- `RecipeDTO[]` (do przekazania do client)

#### Props:

```typescript
interface RecipesBrowserPageProps {
  searchParams: {
    meal_types?: string
    limit?: string
    offset?: string
  }
}
```

---

### 4.2. RecipesBrowserClient (Client Component)

**Ścieżka:** `components/recipes/RecipesBrowserClient.tsx`

#### Opis:

Główny wrapper po stronie klienta. Zarządza **stanem filtrów, paginacją i infinite loading**. Koordynuje wszystkie komponenty dzieci (FeaturedRecipe, RecipesGrid, Filters, LoadMore).

#### Główne elementy:

- Header z tytułem i opisem wartości aplikacji
- CTA "Rozpocznij dietę" (redirect do /signup)
- `FeaturedRecipeCard` (losowy/pierwszy przepis)
- `RecipeFilters` (filtrowanie meal_types)
- `RecipesGrid` (siatka kart przepisów)
- `LoadMoreButton` (załaduj więcej)
- `AuthPromptModal` (modal rejestracji)

#### Obsługiwane zdarzenia:

- Zmiana filtrów → refetch recipes z nowymi parametrami
- Kliknięcie na przepis → sprawdź auth, pokaż modal lub navigate
- Load More → fetchNextPage z TanStack Query

#### Warunki walidacji:

- Sprawdzenie czy użytkownik zalogowany przed nawigacją
- Walidacja limitów paginacji (max 100)

#### Typy:

- `RecipesResponse` (initial data)
- `RecipeFiltersState` (stan filtrów)
- `AuthPromptState` (stan modala)

#### Props:

```typescript
interface RecipesBrowserClientProps {
  initialData: RecipesResponse
  initialFilters?: {
    meal_types?: string[]
  }
}
```

---

### 4.3. FeaturedRecipeCard (Client Component)

**Ścieżka:** `components/recipes/FeaturedRecipeCard.tsx`

#### Opis:

Duża, wyróżniona karta prezentująca **losowy przepis** w formie hero section. Zawiera zdjęcie full-width, nazwę, tagi, makro i CTA.

#### Główne elementy:

- `<Image>` (next/image) - zdjęcie przepisu (priority dla LCP)
- Nazwa przepisu (heading h2)
- Lista tagów (Badge components)
- Makro summary (kalorie, B/W/T)
- Button "Zobacz przepis" → onClick handler

#### Obsługiwane zdarzenia:

- `onClick` → przekazane z parent (sprawdź auth + navigate/modal)
- Keyboard (Enter/Space) → accessibility

#### Warunki walidacji:

- Brak (prezentacja)

#### Typy:

- `RecipeDTO` (recipe data)

#### Props:

```typescript
interface FeaturedRecipeCardProps {
  recipe: RecipeDTO
  onClick: (recipeId: number) => void
}
```

---

### 4.4. RecipesGrid (Client Component)

**Ścieżka:** `components/recipes/RecipesGrid.tsx`

#### Opis:

Grid Layout (CSS Grid) wyświetlający **karty przepisów** w responsywnej siatce (1 col mobile, 2 col tablet, 3 col desktop).

#### Główne elementy:

- `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`
- Mapowanie `recipes.map(recipe => <RecipeCard key={recipe.id} ... />)`

#### Obsługiwane zdarzenia:

- Przekazywanie `onClick` do `RecipeCard`

#### Warunki walidacji:

- Brak (prezentacja)

#### Typy:

- `RecipeDTO[]` (lista przepisów)

#### Props:

```typescript
interface RecipesGridProps {
  recipes: RecipeDTO[]
  onRecipeClick: (recipeId: number) => void
}
```

---

### 4.5. RecipeCard (Client Component)

**Ścieżka:** `components/recipes/RecipeCard.tsx`

#### Opis:

Pojedyncza **karta przepisu** w siatce. Kompaktowa prezentacja z hover effects, fully keyboard accessible.

#### Główne elementy:

- `Card` component (shadcn/ui)
- `<Image>` (next/image) - thumbnail przepisu
- Nazwa przepisu
- Meal type badges (śniadanie/obiad/kolacja)
- Makro w kompaktowej formie (kalorie + P/C/F)
- Hover overlay z przyciskiem "Zobacz szczegóły"

#### Obsługiwane zdarzenia:

- `onClick` → wywołuje `onRecipeClick(recipe.id)`
- `onKeyDown` (Enter/Space) → accessibility
- Hover/Focus states

#### Warunki walidacji:

- Brak (prezentacja + event delegation)

#### Typy:

- `RecipeDTO` (pojedynczy przepis)

#### Props:

```typescript
interface RecipeCardProps {
  recipe: RecipeDTO
  onClick: (recipeId: number) => void
}
```

---

### 4.6. RecipeFilters (Client Component)

**Ścieżka:** `components/recipes/RecipeFilters.tsx`

#### Opis:

Panel filtrów umożliwiający **wybór typu posiłku** (breakfast, lunch, dinner). Multi-select z toggleable badges lub checkboxes.

#### Główne elementy:

- Label "Filtruj według typu posiłku:"
- Toggle buttons / Checkboxes dla meal_types:
  - "Śniadanie" (breakfast)
  - "Obiad" (lunch)
  - "Kolacja" (dinner)
- Button "Wyczyść filtry"

#### Obsługiwane zdarzenia:

- `onChange(selectedMealTypes: string[])` → wywołane przy każdej zmianie
- Toggle meal type → update local state + call onChange

#### Warunki walidacji:

- Dozwolone wartości: tylko `['breakfast', 'lunch', 'dinner']`
- Zgodne z `Enums<'meal_type_enum'>`

#### Typy:

- `MealTypeEnum[]` (selected filters)

#### Props:

```typescript
interface RecipeFiltersProps {
  selectedMealTypes: string[]
  onChange: (mealTypes: string[]) => void
}
```

---

### 4.7. LoadMoreButton (Client Component)

**Ścieżka:** `components/recipes/LoadMoreButton.tsx`

#### Opis:

Przycisk **"Załaduj więcej"** dla infinite loading. Pokazuje loading state i disables gdy brak więcej wyników.

#### Główne elementy:

- `Button` component (shadcn/ui)
- Tekst: "Załaduj więcej" lub "Ładowanie..." (gdy isLoading)
- Disabled state gdy `!hasMore`

#### Obsługiwane zdarzenia:

- `onClick` → wywołuje `onLoadMore()`

#### Warunki walidacji:

- Disabled gdy `isLoading || !hasMore`

#### Typy:

- Brak (primitive props)

#### Props:

```typescript
interface LoadMoreButtonProps {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
}
```

---

### 4.8. AuthPromptModal (Client Component)

**Ścieżka:** `components/recipes/AuthPromptModal.tsx`

#### Opis:

Modal wzywający do **rejestracji/logowania** gdy niezalogowany użytkownik próbuje zobaczyć przepis. Zapamiętuje `redirectRecipeId` w localStorage.

#### Główne elementy:

- `Dialog` component (shadcn/ui)
- Heading: "Zaloguj się, aby zobaczyć przepis"
- Opis wartości aplikacji (krótki pitch)
- Przyciski:
  - "Załóż konto" → redirect do `/signup?redirect=/przepisy/[redirectRecipeId]`
  - "Zaloguj się" → redirect do `/login?redirect=/przepisy/[redirectRecipeId]`
  - "Zamknij" (X button)

#### Obsługiwane zdarzenia:

- `onOpenChange(isOpen)` → kontrola open/close
- Click "Załóż konto" → zapisz do localStorage + navigate
- Click "Zaloguj się" → zapisz do localStorage + navigate
- Escape / Backdrop click → close modal

#### Warunki walidacji:

- Brak (modal prezentacyjny)

#### Typy:

- `number | null` (redirectRecipeId)

#### Props:

```typescript
interface AuthPromptModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  redirectRecipeId: number | null
}
```

---

### 4.9. RecipeDetailPage (Server Component)

**Ścieżka:** `app/przepisy/[id]/page.tsx`

#### Opis:

Strona szczegółów przepisu. Server Component pobierający **pełne dane przepisu** przez `getRecipeById()` i renderujący szczegółowy widok.

#### Główne elementy:

- Wywołanie `getRecipeById(params.id)`
- Renderowanie `RecipeDetailClient` z recipe data
- SEO metadata (dynamic metadata z nazwą przepisu)
- Error boundary (404 jeśli przepis nie istnieje)
- Breadcrumbs (Home → Przepisy → [Nazwa przepisu])

#### Obsługiwane zdarzenia:

- Brak (Server Component)

#### Warunki walidacji:

- Walidacja `params.id` (musi być number > 0)
- Obsługa błędu 404 (przepis nie znaleziony)

#### Typy:

- `RecipeDTO` (pełne dane przepisu)

#### Props:

```typescript
interface RecipeDetailPageProps {
  params: {
    id: string
  }
}
```

---

### 4.10. RecipeDetailClient (Client Component)

**Ścieżka:** `components/recipes/detail/RecipeDetailClient.tsx`

#### Opis:

Wrapper client-side dla szczegółów przepisu. Umożliwia **interaktywne elementy** (np. przycisk "Dodaj do planu" dla zalogowanych).

#### Główne elementy:

- `RecipeHeader` (zdjęcie + nazwa + tagi)
- `MacroSummary` (podsumowanie makro na górze)
- `IngredientsList` (składniki pogrupowane)
- `InstructionsList` (kroki przygotowania)
- CTA "Rozpocznij dietę" (dla niezalogowanych)
- Przycisk "Powrót do listy" → navigate('/przepisy')

#### Obsługiwane zdarzenia:

- Click "Powrót" → router.push('/przepisy')
- Click CTA → redirect do /signup

#### Warunki walidacji:

- Brak (prezentacja + navigation)

#### Typy:

- `RecipeDTO` (recipe data)

#### Props:

```typescript
interface RecipeDetailClientProps {
  recipe: RecipeDTO
}
```

---

### 4.11. RecipeHeader (Presentation Component)

**Ścieżka:** `components/recipes/detail/RecipeHeader.tsx`

#### Opis:

Header szczegółów przepisu z **dużym zdjęciem, nazwą i tagami**.

#### Główne elementy:

- `<Image>` (next/image) - hero image przepisu
- Heading h1 z nazwą przepisu
- Lista tagów (Badge components)
- Meal type badges (śniadanie/obiad/kolacja)

#### Obsługiwane zdarzenia:

- Brak (prezentacja)

#### Warunki walidacji:

- Brak

#### Typy:

- `RecipeDTO` (partial - tylko header fields)

#### Props:

```typescript
interface RecipeHeaderProps {
  name: string
  imageUrl: string | null
  tags: string[] | null
  mealTypes: Enums<'meal_type_enum'>[]
}
```

---

### 4.12. MacroSummary (Presentation Component)

**Ścieżka:** `components/recipes/detail/MacroSummary.tsx`

#### Opis:

**Podsumowanie makroskładników** przepisu w formie 4 kart (Kalorie, Białko, Węglowodany, Tłuszcze).

#### Główne elementy:

- Grid 4 kolumn (responsive: 2x2 mobile, 4x1 desktop)
- Dla każdego makro:
  - Ikona (opcjonalnie)
  - Label (np. "Kalorie", "Białko")
  - Wartość (np. "450 kcal", "25.5g")

#### Obsługiwane zdarzenia:

- Brak (prezentacja)

#### Warunki walidacji:

- Formatowanie liczb (zaokrąglenie do 1 miejsca po przecinku)
- Obsługa null values (wyświetl "—")

#### Typy:

- `number | null` (dla każdego makro)

#### Props:

```typescript
interface MacroSummaryProps {
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fats_g: number | null
}
```

---

### 4.13. IngredientsList (Presentation Component)

**Ścieżka:** `components/recipes/detail/IngredientsList.tsx`

#### Opis:

Lista składników **pogrupowana według kategorii** (Nabiał, Mięso, Warzywa, etc.). Wyświetla każdą kategorię z jej składnikami.

#### Główne elementy:

- Heading h2 "Składniki"
- Disclaimer: "Sprawdź składniki pod kątem swoich alergii"
- Mapowanie kategorii:
  ```tsx
  groupedIngredients.map(category =>
    <IngredientCategory key={category.name} ... />
  )
  ```

#### Obsługiwane zdarzenia:

- Brak (prezentacja)

#### Warunki walidacji:

- Grupowanie składników według `category`
- Sortowanie kategorii (stała kolejność lub alfabetycznie)

#### Typy:

- `IngredientDTO[]` (lista składników)
- `GroupedIngredients` (ViewModel - grouped by category)

#### Props:

```typescript
interface IngredientsListProps {
  ingredients: IngredientDTO[]
}
```

---

### 4.14. IngredientCategory (Presentation Component)

**Ścieżka:** `components/recipes/detail/IngredientCategory.tsx`

#### Opis:

Pojedyncza **kategoria składników** z nazwą kategorii i listą składników w tej kategorii.

#### Główne elementy:

- Heading h3 z nazwą kategorii (przetłumaczoną na PL)
- Lista składników:
  ```tsx
  items.map(ingredient =>
    <IngredientItem key={ingredient.id} ... />
  )
  ```

#### Obsługiwane zdarzenia:

- Brak (prezentacja)

#### Warunki walidacji:

- Tłumaczenie nazwy kategorii (enum → PL):
  - `eggs` → "Jajka"
  - `meat` → "Mięso"
  - `dairy` → "Nabiał"
  - `vegetables` → "Warzywa"
  - `oils_fats` → "Tłuszcze i oleje"
  - `spices_herbs` → "Przyprawy i zioła"
  - etc.

#### Typy:

- `Enums<'ingredient_category_enum'>` (category name)
- `IngredientDTO[]` (items)

#### Props:

```typescript
interface IngredientCategoryProps {
  category: Enums<'ingredient_category_enum'>
  items: IngredientDTO[]
}
```

---

### 4.15. IngredientItem (Presentation Component)

**Ścieżka:** `components/recipes/detail/IngredientItem.tsx`

#### Opis:

Pojedynczy **składnik z ilością i makroskładnikami** (zgodnie z US-013: wyświetl makro przy każdym składniku).

#### Główne elementy:

- Nazwa składnika
- Ilość + jednostka (np. "150g", "3 sztuki")
- Makro składnika (kompaktowa forma):
  - Kalorie (kcal)
  - Białko (g)
  - Węglowodany (g)
  - Tłuszcze (g)

#### Obsługiwane zdarzenia:

- Brak (prezentacja)

#### Warunki walidacji:

- Formatowanie jednostek (singularis/pluralis)
- Formatowanie makro (zaokrąglenie do 1 miejsca)

#### Typy:

- `IngredientDTO` (pełny ingredient object)

#### Props:

```typescript
interface IngredientItemProps {
  ingredient: IngredientDTO
}
```

---

### 4.16. InstructionsList (Presentation Component)

**Ścieżka:** `components/recipes/detail/InstructionsList.tsx`

#### Opis:

Lista **kroków przygotowania** w formie numerowanej listy (step by step).

#### Główne elementy:

- Heading h2 "Instrukcje przygotowania"
- Ordered list:
  ```tsx
  instructions.map(instruction =>
    <InstructionStep key={instruction.step} ... />
  )
  ```

#### Obsługiwane zdarzenia:

- Brak (prezentacja)

#### Warunki walidacji:

- Sortowanie kroków według `step` (ascending)

#### Typy:

- `RecipeInstructions` (array of steps)

#### Props:

```typescript
interface InstructionsListProps {
  instructions: RecipeInstructions
}
```

---

### 4.17. InstructionStep (Presentation Component)

**Ścieżka:** `components/recipes/detail/InstructionStep.tsx`

#### Opis:

Pojedynczy **krok instrukcji** z numerem i opisem.

#### Główne elementy:

- Numer kroku (duża, wyróżniona cyfra)
- Opis kroku (paragraph)

#### Obsługiwane zdarzenia:

- Brak (prezentacja)

#### Warunki walidacji:

- Brak

#### Typy:

- `{ step: number, description: string }`

#### Props:

```typescript
interface InstructionStepProps {
  step: number
  description: string
}
```

---

## 5. Typy

### 5.1. Istniejące DTO (z `dto.types.ts`)

Wykorzystujemy bezpośrednio:

```typescript
// Pełny przepis z składnikami
type RecipeDTO = {
  id: number
  name: string
  instructions: RecipeInstructions
  meal_types: Enums<'meal_type_enum'>[]
  tags: string[] | null
  image_url: string | null
  total_calories: number | null
  total_protein_g: number | null
  total_carbs_g: number | null
  total_fats_g: number | null
  ingredients: IngredientDTO[]
}

// Pojedynczy składnik
type IngredientDTO = {
  id: number
  name: string
  amount: number
  unit: string
  calories: number
  protein_g: number
  carbs_g: number
  fats_g: number
  category: Enums<'ingredient_category_enum'>
  is_scalable: boolean
}

// Instrukcje przepisu
type RecipeInstructions = {
  step: number
  description: string
}[]
```

### 5.2. Nowe ViewModel Types

Tworzymy nowe typy w `src/types/recipes-view.types.ts`:

```typescript
/**
 * Odpowiedź z API dla listy przepisów (zgodna z planem API)
 */
export type RecipesResponse = {
  count: number
  next: string | null
  previous: string | null
  results: RecipeDTO[]
}

/**
 * Stan filtrów w komponencie RecipesBrowserClient
 */
export type RecipeFiltersState = {
  meal_types: string[]
  limit: number
  offset: number
}

/**
 * Stan modala Auth Prompt
 */
export type AuthPromptState = {
  isOpen: boolean
  redirectRecipeId: number | null
}

/**
 * Składniki pogrupowane według kategorii (ViewModel dla IngredientsList)
 */
export type GroupedIngredients = {
  category: Enums<'ingredient_category_enum'>
  items: IngredientDTO[]
}[]

/**
 * Mapowanie kategorii składników na polskie nazwy
 */
export const INGREDIENT_CATEGORY_LABELS: Record<
  Enums<'ingredient_category_enum'>,
  string
> = {
  vegetables: 'Warzywa',
  fruits: 'Owoce',
  meat: 'Mięso',
  fish: 'Ryby',
  dairy: 'Nabiał',
  eggs: 'Jajka',
  nuts_seeds: 'Orzechy i nasiona',
  oils_fats: 'Tłuszcze i oleje',
  spices_herbs: 'Przyprawy i zioła',
  flours: 'Mąki',
  beverages: 'Napoje',
  sweeteners: 'Słodziki',
  condiments: 'Dodatki',
  other: 'Inne',
}

/**
 * Mapowanie meal_types na polskie nazwy
 */
export const MEAL_TYPE_LABELS: Record<Enums<'meal_type_enum'>, string> = {
  breakfast: 'Śniadanie',
  lunch: 'Obiad',
  dinner: 'Kolacja',
}
```

### 5.3. Pomocnicze funkcje typów

```typescript
/**
 * Grupuje składniki według kategorii (używane w IngredientsList)
 */
export function groupIngredientsByCategory(
  ingredients: IngredientDTO[]
): GroupedIngredients {
  const grouped = ingredients.reduce(
    (acc, ingredient) => {
      const category = ingredient.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(ingredient)
      return acc
    },
    {} as Record<string, IngredientDTO[]>
  )

  return Object.entries(grouped).map(([category, items]) => ({
    category: category as Enums<'ingredient_category_enum'>,
    items,
  }))
}
```

---

## 6. Zarządzanie stanem

### 6.1. TanStack Query (Server State)

Do zarządzania danymi z serwera wykorzystujemy **TanStack Query** (React Query) z hooks:

#### `useRecipesQuery` (dla listy przepisów)

**Lokalizacja:** `lib/react-query/queries/useRecipesQuery.ts`

```typescript
import { useInfiniteQuery } from '@tanstack/react-query'
import { getRecipes } from '@/lib/actions/recipes'
import type { RecipeQueryParamsInput } from '@/lib/validation/recipes'

export const useRecipesQuery = (filters: RecipeQueryParamsInput) => {
  return useInfiniteQuery({
    queryKey: ['recipes', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const result = await getRecipes({
        ...filters,
        offset: pageParam,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      return result.data
    },
    getNextPageParam: (lastPage) => {
      // Parse next URL dla offset
      if (!lastPage.next) return undefined
      const url = new URL(lastPage.next, 'http://dummy.com')
      return Number(url.searchParams.get('offset'))
    },
    initialPageParam: 0,
  })
}
```

#### `useRecipeQuery` (dla szczegółów przepisu)

**Lokalizacja:** `lib/react-query/queries/useRecipeQuery.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { getRecipeById } from '@/lib/actions/recipes'

export const useRecipeQuery = (recipeId: number) => {
  return useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: async () => {
      const result = await getRecipeById(recipeId)

      if (result.error) {
        throw new Error(result.error)
      }

      return result.data
    },
    enabled: !!recipeId && recipeId > 0,
  })
}
```

### 6.2. Custom Hooks (Client State)

#### `useRecipesFilter` - zarządzanie filtrami i paginacją

**Lokalizacja:** `lib/hooks/useRecipesFilter.ts`

```typescript
'use client'

import { useState, useCallback } from 'react'
import type { RecipeFiltersState } from '@/types/recipes-view.types'

export const useRecipesFilter = (
  initialFilters?: Partial<RecipeFiltersState>
) => {
  const [filters, setFilters] = useState<RecipeFiltersState>({
    meal_types: initialFilters?.meal_types || [],
    limit: initialFilters?.limit || 20,
    offset: initialFilters?.offset || 0,
  })

  const updateMealTypes = useCallback((mealTypes: string[]) => {
    setFilters((prev) => ({ ...prev, meal_types: mealTypes, offset: 0 }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({ meal_types: [], limit: 20, offset: 0 })
  }, [])

  const loadMore = useCallback(() => {
    setFilters((prev) => ({ ...prev, offset: prev.offset + prev.limit }))
  }, [])

  return {
    filters,
    updateMealTypes,
    resetFilters,
    loadMore,
  }
}
```

#### `useAuthPrompt` - zarządzanie modalem rejestracji

**Lokalizacja:** `lib/hooks/useAuthPrompt.ts`

```typescript
'use client'

import { useState, useCallback } from 'react'
import type { AuthPromptState } from '@/types/recipes-view.types'

const REDIRECT_RECIPE_KEY = 'auth_redirect_recipe_id'

export const useAuthPrompt = () => {
  const [state, setState] = useState<AuthPromptState>({
    isOpen: false,
    redirectRecipeId: null,
  })

  const openPrompt = useCallback((recipeId: number) => {
    // Zapisz do localStorage dla persistence
    localStorage.setItem(REDIRECT_RECIPE_KEY, String(recipeId))

    setState({
      isOpen: true,
      redirectRecipeId: recipeId,
    })
  }, [])

  const closePrompt = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const getRedirectUrl = useCallback(
    (baseUrl: '/signup' | '/login') => {
      const recipeId =
        state.redirectRecipeId || localStorage.getItem(REDIRECT_RECIPE_KEY)
      if (!recipeId) return baseUrl
      return `${baseUrl}?redirect=/przepisy/${recipeId}`
    },
    [state.redirectRecipeId]
  )

  const clearRedirect = useCallback(() => {
    localStorage.removeItem(REDIRECT_RECIPE_KEY)
  }, [])

  return {
    ...state,
    openPrompt,
    closePrompt,
    getRedirectUrl,
    clearRedirect,
  }
}
```

#### `useAuthCheck` - sprawdzanie stanu logowania

**Lokalizacja:** `lib/hooks/useAuthCheck.ts`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export const useAuthCheck = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { isAuthenticated, isLoading: isAuthenticated === null }
}
```

### 6.3. Zustand Store (opcjonalnie)

**NIE jest wymagany** dla tego widoku, ponieważ:

- Dane z serwera → TanStack Query
- Stan filtrów → lokalny hook `useRecipesFilter`
- Stan modala → lokalny hook `useAuthPrompt`

Jeśli w przyszłości będzie potrzebny globalny stan (np. lista ulubionych przepisów), można dodać Zustand store.

---

## 7. Integracja API

### 7.1. Endpointy i Server Actions

#### `getRecipes(params: RecipeQueryParamsInput)`

**Lokalizacja:** `src/lib/actions/recipes.ts` (już zaimplementowane)

**Request Type:**

```typescript
type RecipeQueryParamsInput = {
  limit?: number // default 20, max 100
  offset?: number // default 0
  tags?: string // comma-separated
  meal_types?: string // comma-separated
}
```

**Response Type:**

```typescript
type ActionResult<RecipesResponse> =
  | { data: RecipesResponse; error?: never }
  | { data?: never; error: string }

type RecipesResponse = {
  count: number
  next: string | null
  previous: string | null
  results: RecipeDTO[]
}
```

**Użycie w komponencie:**

```typescript
// Server Component (SSR)
const result = await getRecipes({ limit: 20, offset: 0 })
if (result.error) {
  // Handle error
}
const initialData = result.data

// Client Component (TanStack Query)
const { data, fetchNextPage, hasNextPage } = useRecipesQuery({
  meal_types: ['breakfast'],
  limit: 20,
})
```

#### `getRecipeById(recipeId: number)`

**Lokalizacja:** `src/lib/actions/recipes.ts` (już zaimplementowane)

**Request Type:**

```typescript
recipeId: number // must be > 0
```

**Response Type:**

```typescript
type ActionResult<RecipeDTO> =
  | { data: RecipeDTO; error?: never }
  | { data?: never; error: string }

// RecipeDTO zawiera pełne dane przepisu (ingredients, instructions)
```

**Użycie w komponencie:**

```typescript
// Server Component (SSR)
const result = await getRecipeById(Number(params.id))
if (result.error) {
  notFound() // Next.js 404
}
const recipe = result.data

// Client Component (TanStack Query)
const { data: recipe, isLoading } = useRecipeQuery(recipeId)
```

### 7.2. Walidacja parametrów

Wszystkie parametry są walidowane przez **Zod schema** (`recipeQueryParamsSchema`) w Server Action:

```typescript
// lib/validation/recipes.ts (już zaimplementowane)
const recipeQueryParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  tags: z.string().optional().transform(...),
  meal_types: z.string().optional().transform(...),
})
```

Błędy walidacji są zwracane jako `{ error: string }` w ActionResult.

### 7.3. Caching i Revalidation

- **Server Components:** Next.js automatyczny caching (ISR)
- **TanStack Query:**
  - `staleTime: 5 * 60 * 1000` (5 minut) - dane świeże przez 5 min
  - `cacheTime: 30 * 60 * 1000` (30 minut) - cache w pamięci przez 30 min
  - `refetchOnWindowFocus: false` - nie refetch przy focus (publiczny widok)

---

## 8. Interakcje użytkownika

### 8.1. Na stronie listy przepisów (`/przepisy`)

#### Interakcja 1: Filtrowanie według typu posiłku

1. **Użytkownik:** Klika na badge "Śniadanie" w filtrach
2. **System:**
   - Aktualizuje stan `selectedMealTypes` w `useRecipesFilter`
   - Wywołuje `useRecipesQuery` z nowymi filtrami
   - Refetch przepisów z `meal_types=['breakfast']`
   - Wyświetla przefiltrowaną listę

#### Interakcja 2: Resetowanie filtrów

1. **Użytkownik:** Klika "Wyczyść filtry"
2. **System:**
   - Wywołuje `resetFilters()` z `useRecipesFilter`
   - Refetch przepisów bez filtrów
   - Wyświetla pełną listę

#### Interakcja 3: Załaduj więcej przepisów

1. **Użytkownik:** Klika "Załaduj więcej"
2. **System:**
   - Wywołuje `fetchNextPage()` z TanStack Query
   - Pobiera kolejną paginę (offset += limit)
   - Dodaje nowe przepisy do istniejącej listy (infinite scroll)

#### Interakcja 4: Kliknięcie na kartę przepisu (niezalogowany)

1. **Użytkownik:** Klika na `RecipeCard`
2. **System:**
   - Sprawdza `isAuthenticated` przez `useAuthCheck`
   - Jeśli `false`:
     - Wywołuje `openPrompt(recipeId)` z `useAuthPrompt`
     - Zapisuje `recipeId` do localStorage
     - Otwiera `AuthPromptModal`
3. **Użytkownik:** Klika "Załóż konto" w modalu
4. **System:**
   - Przekierowuje do `/signup?redirect=/przepisy/[recipeId]`

#### Interakcja 5: Kliknięcie na kartę przepisu (zalogowany)

1. **Użytkownik:** Klika na `RecipeCard`
2. **System:**
   - Sprawdza `isAuthenticated` → `true`
   - Nawiguje do `/przepisy/[recipeId]` (router.push)

#### Interakcja 6: Keyboard navigation

1. **Użytkownik:** Naciska Tab do nawigacji między kartami
2. **System:** Focus styles (outline ring) na aktywnej karcie
3. **Użytkownik:** Naciska Enter/Space na fokusowanej karcie
4. **System:** Wywołuje `onClick` handler (jak w Interakcji 4/5)

---

### 8.2. Na stronie szczegółów przepisu (`/przepisy/[id]`)

#### Interakcja 7: Przeglądanie szczegółów

1. **Użytkownik:** Scrolluje stronę przepisu
2. **System:**
   - Wyświetla kolejno:
     - RecipeHeader (zdjęcie + nazwa)
     - MacroSummary (kalorie + makro)
     - IngredientsList (składniki pogrupowane)
     - InstructionsList (kroki)

#### Interakcja 8: Powrót do listy

1. **Użytkownik:** Klika "Powrót do przepisów"
2. **System:** Nawiguje do `/przepisy` (router.back() lub router.push)

#### Interakcja 9: CTA "Rozpocznij dietę" (niezalogowany)

1. **Użytkownik:** Klika sticky CTA button
2. **System:** Przekierowuje do `/signup?redirect=/przepisy/[id]`

---

### 8.3. Modal rejestracji (`AuthPromptModal`)

#### Interakcja 10: Zamknięcie modala

1. **Użytkownik:** Klika X, Escape lub backdrop
2. **System:** Wywołuje `closePrompt()` → modal się zamyka

#### Interakcja 11: Rejestracja z kontekstem

1. **Użytkownik:** Klika "Załóż konto"
2. **System:**
   - Pobiera `redirectRecipeId` z localStorage
   - Nawiguje do `/signup?redirect=/przepisy/[redirectRecipeId]`
3. **Po rejestracji:**
   - Middleware sprawdza `?redirect` param
   - Przekierowuje użytkownika do `/przepisy/[redirectRecipeId]`

#### Interakcja 12: Logowanie z kontekstem

1. **Użytkownik:** Klika "Zaloguj się"
2. **System:** (analogicznie do Interakcji 11)
   - Nawiguje do `/login?redirect=/przepisy/[redirectRecipeId]`

---

## 9. Warunki i walidacja

### 9.1. Warunki API (weryfikowane na poziomie Server Action)

#### W `getRecipes(params)`:

- **limit:**
  - Typ: `number`
  - Min: 1
  - Max: 100
  - Default: 20
  - **Komponent:** `RecipesBrowserClient` - zapewnia limit w zakresie 1-100

- **offset:**
  - Typ: `number`
  - Min: 0
  - Default: 0
  - **Komponent:** Zarządzany automatycznie przez `useRecipesFilter` (zawsze >= 0)

- **meal_types:**
  - Typ: `string[]` (po transformacji)
  - Dozwolone wartości: `['breakfast', 'lunch', 'dinner']`
  - **Komponent:** `RecipeFilters` - tylko checkboxes dla dozwolonych wartości

- **tags:**
  - Typ: `string[]` (opcjonalny)
  - **Komponent:** Nie używane w MVP (opcja na przyszłość)

#### W `getRecipeById(recipeId)`:

- **recipeId:**
  - Typ: `number`
  - Min: 1 (> 0)
  - **Komponent:** `RecipeDetailPage` - walidacja w `params.id` (coerce to number)

### 9.2. Warunki UI (weryfikowane w komponentach)

#### `RecipeCard` onClick:

```typescript
const handleRecipeClick = (recipeId: number) => {
  if (!isAuthenticated) {
    // Otwórz modal rejestracji
    openAuthPrompt(recipeId)
  } else {
    // Nawiguj do szczegółów
    router.push(`/przepisy/${recipeId}`)
  }
}
```

#### `LoadMoreButton` disabled:

```typescript
<Button
  disabled={isLoading || !hasNextPage}
  onClick={fetchNextPage}
>
  {isLoading ? 'Ładowanie...' : 'Załaduj więcej'}
</Button>
```

#### `RecipeFilters` - tylko dozwolone meal_types:

```typescript
const ALLOWED_MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const

const toggleMealType = (type: string) => {
  if (!ALLOWED_MEAL_TYPES.includes(type as any)) {
    console.error('Invalid meal type:', type)
    return
  }
  // Update filters...
}
```

### 9.3. Warunki dostępności (accessibility)

#### Keyboard navigation:

- Wszystkie `RecipeCard` muszą być focusable (`tabIndex={0}`)
- `onKeyDown` handler dla Enter/Space:
  ```typescript
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick(recipe.id)
    }
  }
  ```

#### ARIA attributes:

- `RecipeCard`: `role="button"`, `aria-label="Zobacz przepis [nazwa]"`
- `RecipeFilters`: `role="group"`, `aria-label="Filtruj przepisy"`
- `AuthPromptModal`: `aria-labelledby`, `aria-describedby`

### 9.4. Walidacja danych w komponencie (defensive programming)

#### `MacroSummary` - obsługa null values:

```typescript
const formatMacro = (value: number | null, unit: string) => {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(1)}${unit}`
}
```

#### `IngredientsList` - grupowanie z fallback:

```typescript
const groupedIngredients = useMemo(() => {
  if (!ingredients || ingredients.length === 0) return []
  return groupIngredientsByCategory(ingredients)
}, [ingredients])

if (groupedIngredients.length === 0) {
  return <p>Brak składników</p>
}
```

---

## 10. Obsługa błędów

### 10.1. Błędy API

#### Scenariusz 1: `getRecipes()` zwraca błąd

**Przyczyna:** Błąd bazy danych, błąd walidacji
**Obsługa:**

```typescript
// Server Component
const result = await getRecipes(params)

if (result.error) {
  return (
    <ErrorBoundary>
      <p>Nie udało się załadować przepisów: {result.error}</p>
      <Button onClick={() => window.location.reload()}>Spróbuj ponownie</Button>
    </ErrorBoundary>
  )
}
```

#### Scenariusz 2: `getRecipeById()` zwraca 404

**Przyczyna:** Przepis nie istnieje
**Obsługa:**

```typescript
// app/przepisy/[id]/page.tsx
const result = await getRecipeById(Number(params.id))

if (result.error) {
  if (result.error.includes('nie został znaleziony')) {
    notFound() // Next.js built-in 404 page
  }
  throw new Error(result.error) // Error boundary
}
```

#### Scenariusz 3: TanStack Query error (network fail)

**Obsługa:**

```typescript
const { data, error, isError } = useRecipesQuery(filters)

if (isError) {
  return (
    <div className="text-center py-8">
      <p className="text-red-500">Wystąpił błąd: {error.message}</p>
      <Button onClick={() => queryClient.invalidateQueries(['recipes'])}>
        Spróbuj ponownie
      </Button>
    </div>
  )
}
```

### 10.2. Błędy walidacji

#### Scenariusz 4: Nieprawidłowe parametry URL

**Przyczyna:** Użytkownik ręcznie edytuje URL
**Obsługa:**

```typescript
// RecipesBrowserPage (Server Component)
const validated = recipeQueryParamsSchema.safeParse(searchParams)

if (!validated.success) {
  return (
    <div>
      <p>Nieprawidłowe parametry zapytania</p>
      <Link href="/przepisy">Wróć do listy przepisów</Link>
    </div>
  )
}
```

### 10.3. Empty states

#### Scenariusz 5: Brak przepisów (pusta baza)

**Obsługa:**

```typescript
if (data.results.length === 0 && !filters.meal_types.length) {
  return (
    <EmptyState
      icon={<ChefHatIcon />}
      title="Brak przepisów"
      description="Przepisy zostaną dodane wkrótce"
    />
  )
}
```

#### Scenariusz 6: Brak wyników po filtrach

**Obsługa:**

```typescript
if (data.results.length === 0 && filters.meal_types.length > 0) {
  return (
    <EmptyState
      icon={<FilterIcon />}
      title="Brak wyników"
      description="Spróbuj zmienić filtry"
      action={
        <Button onClick={resetFilters}>Wyczyść filtry</Button>
      }
    />
  )
}
```

### 10.4. Loading states

#### Scenariusz 7: Ładowanie pierwszej strony

**Obsługa:**

```typescript
if (isLoading) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  )
}
```

#### Scenariusz 8: Ładowanie kolejnej strony (infinite scroll)

**Obsługa:**

```typescript
<LoadMoreButton
  hasMore={hasNextPage}
  isLoading={isFetchingNextPage}
  onLoadMore={fetchNextPage}
/>
// Button wyświetla spinner gdy isFetchingNextPage === true
```

### 10.5. Auth errors

#### Scenariusz 9: Błąd sprawdzania sesji

**Obsługa:**

```typescript
const { isAuthenticated, isLoading } = useAuthCheck()

// Domyślnie traktuj jako niezalogowany jeśli błąd
const handleRecipeClick = (recipeId: number) => {
  if (isLoading) return // Nie pozwól na klik podczas ładowania

  if (!isAuthenticated) {
    openAuthPrompt(recipeId)
  } else {
    router.push(`/przepisy/${recipeId}`)
  }
}
```

### 10.6. Error boundaries

Każda główna strona powinna mieć **Error Boundary**:

```typescript
// app/przepisy/error.tsx
'use client'

export default function RecipesError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="container mx-auto py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Coś poszło nie tak</h1>
      <p className="text-muted-foreground mb-8">{error.message}</p>
      <Button onClick={reset}>Spróbuj ponownie</Button>
    </div>
  )
}
```

---

## 11. Kroki implementacji

### Faza 1: Setup i typy (1-2h)

1. **Utworzenie struktury folderów:**

   ```bash
   mkdir -p app/przepisy/[id]
   mkdir -p components/recipes/detail
   mkdir -p lib/hooks
   mkdir -p lib/react-query/queries
   ```

2. **Utworzenie pliku typów:**
   - `src/types/recipes-view.types.ts`
   - Dodanie wszystkich ViewModel types (RecipesResponse, RecipeFiltersState, etc.)
   - Dodanie helper functions (groupIngredientsByCategory, CATEGORY_LABELS, etc.)

3. **Dodanie shadcn/ui komponentów:**
   ```bash
   npx shadcn-ui@latest add card
   npx shadcn-ui@latest add button
   npx shadcn-ui@latest add badge
   npx shadcn-ui@latest add dialog
   npx shadcn-ui@latest add separator
   ```

---

### Faza 2: Custom hooks (2-3h)

4. **Implementacja `useRecipesFilter`:**
   - `lib/hooks/useRecipesFilter.ts`
   - Stan filtrów (meal_types, limit, offset)
   - Metody: updateMealTypes, resetFilters, loadMore

5. **Implementacja `useAuthPrompt`:**
   - `lib/hooks/useAuthPrompt.ts`
   - Stan modala (isOpen, redirectRecipeId)
   - localStorage persistence
   - Metody: openPrompt, closePrompt, getRedirectUrl, clearRedirect

6. **Implementacja `useAuthCheck`:**
   - `lib/hooks/useAuthCheck.ts`
   - Sprawdzanie sesji Supabase
   - Subscription na auth state changes

---

### Faza 3: TanStack Query hooks (1-2h)

7. **Implementacja `useRecipesQuery`:**
   - `lib/react-query/queries/useRecipesQuery.ts`
   - Infinite query dla listy przepisów
   - getNextPageParam dla paginacji

8. **Implementacja `useRecipeQuery`:**
   - `lib/react-query/queries/useRecipeQuery.ts`
   - Query dla szczegółów przepisu

9. **Setup React Query Provider:**
   - Dodanie QueryClientProvider w root layout (jeśli jeszcze nie ma)
   - Konfiguracja defaultOptions (staleTime, cacheTime)

---

### Faza 4: Komponenty prezentacyjne (3-4h)

10. **Implementacja komponentów szczegółów przepisu:**
    - `RecipeHeader.tsx` - header z zdjęciem i nazwą
    - `MacroSummary.tsx` - podsumowanie makro
    - `IngredientItem.tsx` - pojedynczy składnik
    - `IngredientCategory.tsx` - kategoria składników
    - `IngredientsList.tsx` - lista składników z grupowaniem
    - `InstructionStep.tsx` - pojedynczy krok
    - `InstructionsList.tsx` - lista kroków

11. **Testowanie komponentów prezentacyjnych:**
    - Storybook lub manualne testowanie z mock data

---

### Faza 5: Komponenty interaktywne (4-5h)

12. **Implementacja `RecipeCard`:**
    - Karta przepisu z hover effects
    - onClick handler
    - Keyboard accessibility (onKeyDown)

13. **Implementacja `RecipesGrid`:**
    - Responsive grid layout
    - Mapowanie RecipeCard

14. **Implementacja `FeaturedRecipeCard`:**
    - Hero section z wyróżnionym przepisem
    - Duże zdjęcie + makro + CTA

15. **Implementacja `RecipeFilters`:**
    - Toggle buttons dla meal_types
    - onChange handler
    - Reset button

16. **Implementacja `LoadMoreButton`:**
    - Button z loading state
    - Disabled state dla hasMore

17. **Implementacja `AuthPromptModal`:**
    - Dialog z shadcn/ui
    - Buttons: "Załóż konto", "Zaloguj się", "Zamknij"
    - Redirect URL generation

---

### Faza 6: Główne komponenty Client (3-4h)

18. **Implementacja `RecipesBrowserClient`:**
    - Integracja wszystkich komponentów dzieci
    - Użycie `useRecipesFilter` hook
    - Użycie `useRecipesQuery` infinite query
    - Użycie `useAuthPrompt` dla modala
    - Użycie `useAuthCheck` dla auth gating
    - Obsługa onClick → sprawdzenie auth → modal/navigate

19. **Implementacja `RecipeDetailClient`:**
    - Wrapper dla szczegółów przepisu
    - CTA dla niezalogowanych
    - Przycisk "Powrót"

---

### Faza 7: Server Components (2-3h)

20. **Implementacja `app/przepisy/page.tsx` (RecipesBrowserPage):**
    - Pobieranie searchParams
    - Walidacja przez recipeQueryParamsSchema
    - Wywołanie getRecipes() dla SSR
    - Przekazanie initialData do RecipesBrowserClient
    - Metadata dla SEO

21. **Implementacja `app/przepisy/[id]/page.tsx` (RecipeDetailPage):**
    - Pobieranie params.id
    - Walidacja id (number > 0)
    - Wywołanie getRecipeById() dla SSR
    - Obsługa 404 (notFound())
    - Przekazanie recipe do RecipeDetailClient
    - Dynamic metadata (generateMetadata)

22. **Implementacja Error Boundaries:**
    - `app/przepisy/error.tsx`
    - `app/przepisy/[id]/error.tsx`

23. **Implementacja Not Found:**
    - `app/przepisy/[id]/not-found.tsx`

---

### Faza 8: Styling i responsywność (2-3h)

24. **Stylowanie wszystkich komponentów:**
    - Tailwind CSS classes
    - Responsive breakpoints (mobile-first)
    - Dark mode support (jeśli w scope)
    - Hover/Focus states

25. **Optymalizacja obrazów:**
    - next/image z priority dla featured recipe
    - Lazy loading dla grid
    - Blur placeholders

26. **Accessibility audit:**
    - Keyboard navigation
    - ARIA attributes
    - Screen reader testing
    - Color contrast

---

### Faza 9: Testowanie (3-4h)

27. **Testy jednostkowe (Vitest):**
    - Custom hooks (useRecipesFilter, useAuthPrompt)
    - Helper functions (groupIngredientsByCategory)
    - Komponenty prezentacyjne (MacroSummary, IngredientItem)

28. **Testy komponentowe (React Testing Library):**
    - RecipeCard (onClick, keyboard)
    - RecipeFilters (filter changes)
    - AuthPromptModal (open/close, redirects)

29. **Testy E2E (Playwright):**
    - Scenariusz: Niezalogowany użytkownik przegląda przepisy
    - Scenariusz: Filtrowanie według meal_type
    - Scenariusz: Kliknięcie na przepis → modal rejestracji
    - Scenariusz: Infinite scroll (Load More)
    - Scenariusz: Przeglądanie szczegółów przepisu

---

### Faza 10: Optymalizacja i deploy (1-2h)

30. **Performance optimization:**
    - Bundle analysis (check size)
    - Code splitting (dynamic imports jeśli potrzebne)
    - Memoization (useMemo, React.memo dla heavy components)

31. **SEO optimization:**
    - Structured data (JSON-LD) dla przepisów
    - Open Graph images
    - Sitemap generation

32. **Final testing:**
    - Lighthouse audit (Performance, Accessibility, SEO)
    - Cross-browser testing (Chrome, Firefox, Safari)
    - Mobile testing (różne rozmiary ekranów)

33. **Deploy:**
    - Push do repository
    - GitHub Actions CI/CD
    - Deploy na Cloudflare Pages
    - Smoke testing na production

---

### Faza 11: Dokumentacja (1h)

34. **Dokumentacja kodu:**
    - JSDoc comments dla wszystkich public API
    - README dla folderu `components/recipes/`

35. **Dokumentacja użytkownika:**
    - Update wiki/docs z nowym widokiem
    - Screenshots dla QA

---

## Podsumowanie czasowe:

- **Faza 1-2 (Setup + Hooks):** 5-7h
- **Faza 3-4 (Queries + Prezentacja):** 4-6h
- **Faza 5-6 (Interaktywność + Client):** 7-9h
- **Faza 7 (Server Components):** 2-3h
- **Faza 8 (Styling):** 2-3h
- **Faza 9 (Testowanie):** 3-4h
- **Faza 10-11 (Optymalizacja + Docs):** 2-3h

**Łączny szacowany czas:** **25-35 godzin pracy** (3-5 dni dla jednego programisty frontend)

---

## Checklist implementacji:

### Must-have (MVP):

- [ ] Lista przepisów z paginacją (Load More)
- [ ] Filtrowanie według meal_type
- [ ] Karta przepisu z podstawowymi info (nazwa, zdjęcie, makro)
- [ ] Szczegóły przepisu (składniki + instrukcje + makro)
- [ ] Grupowanie składników według kategorii
- [ ] Modal rejestracji dla niezalogowanych
- [ ] Zapamiętanie kontekstu (redirect po loginie)
- [ ] Responsywność (mobile + desktop)
- [ ] Accessibility (keyboard nav, ARIA)
- [ ] Error handling (API errors, 404)
- [ ] Loading states (skeletons, spinners)

### Nice-to-have (post-MVP):

- [ ] Filtrowanie według tagów
- [ ] Search bar (wyszukiwanie po nazwie)
- [ ] Featured recipe rotation (różny przy każdym ładowaniu)
- [ ] Animacje (fade-in, slide-up)
- [ ] Skeleton screens zamiast spinnerów
- [ ] Infinite scroll zamiast Load More button
- [ ] Breadcrumbs na szczegółach przepisu
- [ ] Share button (udostępnij przepis)
- [ ] Print-friendly view dla przepisu
- [ ] Dark mode toggle

---

## Dodatkowe uwagi:

1. **Priorytet desktop:** Zgodnie z PRD, priorytet to wersja desktop, ale widok musi być responsywny (mobile-first approach w Tailwind)

2. **SEO critical:** To publiczna landing page, więc:
   - Server-side rendering (SSR) dla pierwszego render
   - Proper metadata (title, description, OG tags)
   - Structured data dla przepisów (recipe schema)

3. **Performance:**
   - Lazy load obrazów (poza featured recipe)
   - Infinite query z TanStack Query dla smooth UX
   - Code splitting jeśli bundle size > 200KB

4. **Accessibility:**
   - Pełna keyboard navigation
   - Screen reader support (ARIA labels)
   - Color contrast WCAG AA minimum

5. **Testing priority:**
   - E2E: Auth flow (niezalogowany → modal → redirect)
   - E2E: Filtrowanie + paginacja
   - Unit: Custom hooks (useRecipesFilter, useAuthPrompt)
   - Component: RecipeCard, AuthPromptModal

---

**Koniec planu implementacji.**
