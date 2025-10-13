# API Endpoint Implementation Plan: GET /shopping-list

## 1. Przegląd punktu końcowego

Endpoint `GET /shopping-list` generuje zagregowaną listę zakupów na podstawie zaplanowanych posiłków użytkownika w określonym zakresie dat. Lista zawiera składniki zgrupowane według kategorii (mięso, nabiał, warzywa, itp.) z zsumowanymi ilościami. **Ważne**: Lista zakupów bazuje wyłącznie na oryginalnych przepisach i nie uwzględnia nadpisanych ilości składników (`ingredient_overrides`).

**Główne funkcjonalności:**

- Pobieranie zaplanowanych posiłków w zakresie dat
- Agregacja składników z wielu posiłków
- Sumowanie ilości tego samego składnika
- Grupowanie według kategorii składników
- Uwzględnianie tylko oryginalnych przepisów (bez modyfikacji użytkownika)

## 2. Szczegóły żądania

- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/shopping-list`
- **Parametry**:
  - **Wymagane**:
    - `start_date` (string, query): Data początkowa zakresu w formacie `YYYY-MM-DD`
    - `end_date` (string, query): Data końcowa zakresu w formacie `YYYY-MM-DD`
  - **Opcjonalne**: brak
- **Headers**:
  - `Authorization: Bearer <token>` (wymagany - Supabase Auth)
- **Request Body**: brak (metoda GET)

**Przykładowe żądanie:**

```
GET /api/shopping-list?start_date=2025-01-15&end_date=2025-01-21
Authorization: Bearer eyJhbGc...
```

## 3. Wykorzystywane typy

### Istniejące typy z `dto.types.ts`:

```typescript
// Aktualizacja istniejącego typu dla zgodności ze specyfikacją
export type ShoppingListResponseDTO = {
  category: Enums<'ingredient_category_enum'>
  items: {
    name: string
    total_amount: number
    unit: string
  }[]
}[]
```

**Uwaga**: Obecny typ `ShoppingListDTO` w pliku różni się od specyfikacji API. Należy go zaktualizować lub utworzyć nowy typ `ShoppingListResponseDTO`.

### Schemat walidacji (nowy):

```typescript
// lib/validation/shopping-list.ts
import { z } from 'zod'

export const shoppingListQuerySchema = z
  .object({
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format daty musi być YYYY-MM-DD'),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format daty musi być YYYY-MM-DD'),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      return start <= end
    },
    {
      message: 'start_date nie może być późniejsza niż end_date',
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      return diffDays <= 30
    },
    {
      message: 'Zakres dat nie może przekraczać 30 dni',
    }
  )

export type ShoppingListQuery = z.infer<typeof shoppingListQuerySchema>
```

## 4. Szczegóły odpowiedzi

### Sukces (200 OK):

```typescript
{
  statusCode: 200,
  body: [
    {
      "category": "meat",
      "items": [
        { "name": "Pierś z kurczaka", "total_amount": 350, "unit": "g" },
        { "name": "Boczek wędzony", "total_amount": 100, "unit": "g" }
      ]
    },
    {
      "category": "dairy",
      "items": [
        { "name": "Ser Feta", "total_amount": 80, "unit": "g" },
        { "name": "Śmietana 30%", "total_amount": 150, "unit": "ml" }
      ]
    },
    {
      "category": "eggs",
      "items": [
        { "name": "Jajko", "total_amount": 6, "unit": "sztuka" }
      ]
    }
  ]
}
```

**Przypadki specjalne:**

- Jeśli brak zaplanowanych posiłków w zakresie dat: zwracamy pustą tablicę `[]` (200 OK)
- Kategorie są sortowane alfabetycznie
- Składniki w ramach kategorii są sortowane alfabetycznie według nazwy

### Błędy:

#### 400 Bad Request:

```typescript
{
  error: {
    message: "Nieprawidłowy format daty. Oczekiwany format: YYYY-MM-DD",
    code: "INVALID_DATE_FORMAT"
  }
}
```

Inne komunikaty 400:

- `"start_date nie może być późniejsza niż end_date"` (code: `INVALID_DATE_RANGE`)
- `"Zakres dat nie może przekraczać 30 dni"` (code: `DATE_RANGE_TOO_LARGE`)
- `"Wymagane parametry: start_date, end_date"` (code: `MISSING_PARAMETERS`)

#### 401 Unauthorized:

```typescript
{
  error: {
    message: "Brak autoryzacji. Wymagane logowanie.",
    code: "UNAUTHORIZED"
  }
}
```

#### 500 Internal Server Error:

```typescript
{
  error: {
    message: "Błąd serwera podczas generowania listy zakupów",
    code: "INTERNAL_SERVER_ERROR"
  }
}
```

## 5. Przepływ danych

### Diagram przepływu:

```
1. Client → GET /api/shopping-list?start_date=X&end_date=Y
             ↓
2. Route Handler (app/api/shopping-list/route.ts)
   - Walidacja query params (Zod)
   - Sprawdzenie autoryzacji (Supabase Auth)
             ↓
3. Service Layer (services/shopping-list.ts)
   - generateShoppingList(userId, startDate, endDate)
             ↓
4. Database Query (Supabase)
   - SELECT planned_meals dla user_id w zakresie dat
   - JOIN recipes → recipe_ingredients → ingredients
   - Agregacja: GROUP BY ingredient_id, SUM(base_amount)
             ↓
5. Service Logic
   - Grupowanie według category
   - Sortowanie kategorii i składników
   - Formatowanie do ShoppingListDTO
             ↓
6. Route Handler → Response (200 OK)
             ↓
7. Client ← JSON response
```

### Szczegóły zapytania do bazy danych:

```typescript
// Pseudokod zapytania
const { data: meals } = await supabase
  .from('planned_meals')
  .select(
    `
    recipe_id,
    recipes!inner (
      id,
      recipe_ingredients!inner (
        ingredient_id,
        base_amount,
        unit,
        ingredients!inner (
          id,
          name,
          category,
          unit
        )
      )
    )
  `
  )
  .eq('user_id', userId)
  .gte('meal_date', startDate)
  .lte('meal_date', endDate)
  .not('recipe_id', 'is', null) // Pomijamy posiłki bez przypisanego przepisu
```

**Uwaga**: Dzięki RLS na tabeli `planned_meals`, zapytanie automatycznie filtruje wyniki do posiłków użytkownika.

### Logika agregacji w service:

```typescript
// Krok 1: Flatten wszystkich składników
const allIngredients = meals.flatMap((meal) =>
  meal.recipes.recipe_ingredients.map((ri) => ({
    id: ri.ingredients.id,
    name: ri.ingredients.name,
    category: ri.ingredients.category,
    amount: ri.base_amount,
    unit: ri.unit,
  }))
)

// Krok 2: Agregacja według ingredient_id
const aggregated = allIngredients.reduce((acc, ingredient) => {
  const key = `${ingredient.id}_${ingredient.unit}` // Ten sam składnik, ta sama jednostka
  if (!acc[key]) {
    acc[key] = { ...ingredient, total_amount: 0 }
  }
  acc[key].total_amount += ingredient.amount
  return acc
}, {})

// Krok 3: Grupowanie według kategorii
const grouped = Object.values(aggregated).reduce((acc, ingredient) => {
  if (!acc[ingredient.category]) {
    acc[ingredient.category] = []
  }
  acc[ingredient.category].push({
    name: ingredient.name,
    total_amount: ingredient.total_amount,
    unit: ingredient.unit,
  })
  return acc
}, {})

// Krok 4: Sortowanie i formatowanie
return Object.entries(grouped)
  .sort(([a], [b]) => a.localeCompare(b, 'pl')) // Sortowanie kategorii
  .map(([category, items]) => ({
    category,
    items: items.sort((a, b) => a.name.localeCompare(b.name, 'pl')), // Sortowanie składników
  }))
```

## 6. Względy bezpieczeństwa

### Autoryzacja i uwierzytelnianie:

1. **Supabase Auth**:
   - Wymagane zalogowanie (sprawdzenie tokena JWT)
   - Token jest weryfikowany przez `createRouteHandlerClient`

   ```typescript
   const supabase = createRouteHandlerClient({ cookies })
   const {
     data: { user },
     error,
   } = await supabase.auth.getUser()

   if (error || !user) {
     return NextResponse.json(
       { error: { message: 'Brak autoryzacji', code: 'UNAUTHORIZED' } },
       { status: 401 }
     )
   }
   ```

2. **Row Level Security (RLS)**:
   - Tabela `planned_meals` ma politykę RLS: `auth.uid() = user_id`
   - Automatyczna filtracja zapewnia, że użytkownik widzi tylko swoje dane
   - Nie potrzeba dodatkowej walidacji `user_id` w kodzie aplikacji

### Walidacja danych wejściowych:

1. **Walidacja Zod**:
   - Format daty (regex `YYYY-MM-DD`)
   - Zakres dat (start ≤ end)
   - Maksymalny zakres 30 dni (ochrona przed DoS)

2. **Sanityzacja**:
   - Parametry query są automatycznie sanityzowane przez Next.js
   - Daty są parsowane do obiektów `Date` i walidowane

### Ochrona przed atakami:

1. **SQL Injection**:
   - Supabase query builder automatycznie sanityzuje parametry
   - Używamy prepared statements

2. **DoS**:
   - Limit zakresu dat (max 30 dni)
   - Rate limiting na poziomie infrastruktury (Cloudflare)

3. **Data Exposure**:
   - Tylko dane użytkownika są dostępne (RLS)
   - Nie zwracamy wrażliwych informacji w błędach

## 7. Obsługa błędów

### Macierz błędów:

| Scenariusz                | Kod | Komunikat                                                  | Code                    |
| ------------------------- | --- | ---------------------------------------------------------- | ----------------------- |
| Brak parametrów           | 400 | "Wymagane parametry: start_date, end_date"                 | `MISSING_PARAMETERS`    |
| Nieprawidłowy format daty | 400 | "Nieprawidłowy format daty. Oczekiwany format: YYYY-MM-DD" | `INVALID_DATE_FORMAT`   |
| start_date > end_date     | 400 | "start_date nie może być późniejsza niż end_date"          | `INVALID_DATE_RANGE`    |
| Zakres > 30 dni           | 400 | "Zakres dat nie może przekraczać 30 dni"                   | `DATE_RANGE_TOO_LARGE`  |
| Brak tokena               | 401 | "Brak autoryzacji. Wymagane logowanie."                    | `UNAUTHORIZED`          |
| Token wygasł              | 401 | "Sesja wygasła. Zaloguj się ponownie."                     | `SESSION_EXPIRED`       |
| Błąd bazy danych          | 500 | "Błąd serwera podczas generowania listy zakupów"           | `INTERNAL_SERVER_ERROR` |
| Nieoczekiwany błąd        | 500 | "Wystąpił nieoczekiwany błąd"                              | `INTERNAL_SERVER_ERROR` |

### Implementacja obsługi błędów:

```typescript
try {
  // Walidacja Zod
  const validated = shoppingListQuerySchema.safeParse({
    start_date: searchParams.get('start_date'),
    end_date: searchParams.get('end_date'),
  })

  if (!validated.success) {
    return NextResponse.json(
      {
        error: {
          message: validated.error.errors[0].message,
          code: 'VALIDATION_ERROR',
        },
      },
      { status: 400 }
    )
  }

  // Autoryzacja
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json(
      { error: { message: 'Brak autoryzacji', code: 'UNAUTHORIZED' } },
      { status: 401 }
    )
  }

  // Business logic
  const shoppingList = await generateShoppingList(
    user.id,
    validated.data.start_date,
    validated.data.end_date
  )

  return NextResponse.json(shoppingList, { status: 200 })
} catch (error) {
  console.error('Shopping list generation error:', error)
  return NextResponse.json(
    {
      error: {
        message: 'Błąd serwera podczas generowania listy zakupów',
        code: 'INTERNAL_SERVER_ERROR',
      },
    },
    { status: 500 }
  )
}
```

### Logowanie błędów:

```typescript
// Logowanie do konsoli (development)
console.error('Shopping list error:', {
  userId: user.id,
  startDate,
  endDate,
  error: error.message,
  stack: error.stack,
})

// TODO: W produkcji rozważyć integrację z Sentry lub innym narzędziem monitoringu
```

## 8. Rozważania dotyczące wydajności

### Potencjalne wąskie gardła:

1. **Zapytanie do bazy danych**:
   - **Problem**: Wiele JOINów (planned_meals → recipes → recipe_ingredients → ingredients)
   - **Optymalizacja**:
     - Używamy `select()` z konkretymi polami zamiast `*`
     - Indeksy na: `planned_meals(user_id, meal_date)`, `recipe_ingredients(recipe_id)`, `ingredients(id)`

2. **Agregacja po stronie aplikacji**:
   - **Problem**: Agregacja dużej ilości składników w JavaScript
   - **Optymalizacja**:
     - Rozważenie przeniesienia agregacji do bazy danych (PostgreSQL funkcje agregujące)
     - Użycie Map zamiast Object dla lepszej wydajności

3. **Rozmiar odpowiedzi**:
   - **Problem**: Duża lista zakupów dla długiego zakresu dat
   - **Optymalizacja**:
     - Limit 30 dni w walidacji
     - Kompresja odpowiedzi (gzip) - Next.js automatycznie

### Strategie optymalizacji:

#### 1. Optymalizacja zapytania SQL:

```typescript
// Zamiast pobierać wszystkie dane i agregować w JS,
// użyj PostgreSQL do agregacji:
const { data, error } = await supabase.rpc('get_shopping_list', {
  p_user_id: user.id,
  p_start_date: startDate,
  p_end_date: endDate,
})
```

**Database Function** (opcjonalna, do rozważenia w przyszłości):

```sql
-- supabase/migrations/XXX_create_shopping_list_function.sql
CREATE OR REPLACE FUNCTION get_shopping_list(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  category TEXT,
  ingredient_name TEXT,
  total_amount NUMERIC,
  unit TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.category,
    i.name AS ingredient_name,
    SUM(ri.base_amount) AS total_amount,
    ri.unit
  FROM planned_meals pm
  JOIN recipes r ON pm.recipe_id = r.id
  JOIN recipe_ingredients ri ON r.id = ri.recipe_id
  JOIN ingredients i ON ri.ingredient_id = i.id
  WHERE pm.user_id = p_user_id
    AND pm.meal_date BETWEEN p_start_date AND p_end_date
    AND pm.recipe_id IS NOT NULL
  GROUP BY i.category, i.name, ri.unit
  ORDER BY i.category, i.name;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
```

#### 2. Caching:

```typescript
// Opcjonalnie: Cache na 5 minut dla tego samego zakresu dat
// Używając Next.js cache lub Redis
import { unstable_cache } from 'next/cache'

const getCachedShoppingList = unstable_cache(
  async (userId: string, startDate: string, endDate: string) => {
    return generateShoppingList(userId, startDate, endDate)
  },
  ['shopping-list'],
  {
    revalidate: 300, // 5 minut
    tags: ['shopping-list'],
  }
)
```

#### 3. Monitoring wydajności:

```typescript
// Dodanie czasów wykonania do logów
const startTime = performance.now()
const shoppingList = await generateShoppingList(...)
const endTime = performance.now()

console.log(`Shopping list generated in ${endTime - startTime}ms`)
```

### Benchmarki docelowe:

- **Czas odpowiedzi**: < 500ms dla zakresu 7 dni
- **Czas odpowiedzi**: < 1000ms dla zakresu 30 dni
- **Rozmiar odpowiedzi**: < 50KB dla typowego tygodnia

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie typów i walidacji

**Pliki do utworzenia/modyfikacji:**

1. **Zaktualizuj `src/types/dto.types.ts`**:

   ```typescript
   // Dodaj lub zaktualizuj typ dla odpowiedzi shopping list
   export type ShoppingListResponseDTO = {
     category: Enums<'ingredient_category_enum'>
     items: {
       name: string
       total_amount: number
       unit: string
     }[]
   }[]
   ```

2. **Utwórz `src/lib/validation/shopping-list.ts`**:

   ```typescript
   import { z } from 'zod'

   export const shoppingListQuerySchema = z
     .object({
       start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
       end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
     })
     .refine((data) => new Date(data.start_date) <= new Date(data.end_date), {
       message: 'start_date nie może być późniejsza niż end_date',
     })
     .refine(
       (data) => {
         const start = new Date(data.start_date)
         const end = new Date(data.end_date)
         const diffDays =
           (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
         return diffDays <= 30
       },
       { message: 'Zakres dat nie może przekraczać 30 dni' }
     )

   export type ShoppingListQuery = z.infer<typeof shoppingListQuerySchema>
   ```

**Testy:**

```typescript
// src/lib/validation/__tests__/shopping-list.test.ts
describe('shoppingListQuerySchema', () => {
  it('validates correct date range', () => { ... })
  it('rejects invalid date format', () => { ... })
  it('rejects start_date > end_date', () => { ... })
  it('rejects range > 30 days', () => { ... })
})
```

---

### Krok 2: Implementacja Service Layer

**Utwórz `src/services/shopping-list.ts`**:

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'
import type { ShoppingListResponseDTO } from '@/types/dto.types'
import { cookies } from 'next/headers'

type IngredientAggregate = {
  id: number
  name: string
  category: string
  amount: number
  unit: string
}

export async function generateShoppingList(
  userId: string,
  startDate: string,
  endDate: string
): Promise<ShoppingListResponseDTO> {
  const supabase = createServerComponentClient<Database>({ cookies })

  // 1. Pobierz wszystkie zaplanowane posiłki z przepisami i składnikami
  const { data: meals, error } = await supabase
    .from('planned_meals')
    .select(
      `
      recipe_id,
      recipes!inner (
        id,
        recipe_ingredients!inner (
          ingredient_id,
          base_amount,
          unit,
          ingredients!inner (
            id,
            name,
            category,
            unit
          )
        )
      )
    `
    )
    .eq('user_id', userId)
    .gte('meal_date', startDate)
    .lte('meal_date', endDate)
    .not('recipe_id', 'is', null)

  if (error) {
    console.error('Error fetching planned meals:', error)
    throw new Error('Failed to fetch planned meals')
  }

  if (!meals || meals.length === 0) {
    return [] // Brak posiłków = pusta lista
  }

  // 2. Flatten wszystkich składników z wszystkich posiłków
  const allIngredients: IngredientAggregate[] = meals.flatMap((meal) =>
    meal.recipes.recipe_ingredients.map((ri) => ({
      id: ri.ingredients.id,
      name: ri.ingredients.name,
      category: ri.ingredients.category,
      amount: ri.base_amount,
      unit: ri.unit,
    }))
  )

  // 3. Agregacja według ingredient_id + unit (Map dla wydajności)
  const aggregatedMap = new Map<string, IngredientAggregate>()

  allIngredients.forEach((ingredient) => {
    const key = `${ingredient.id}_${ingredient.unit}`

    if (aggregatedMap.has(key)) {
      const existing = aggregatedMap.get(key)!
      existing.amount += ingredient.amount
    } else {
      aggregatedMap.set(key, { ...ingredient })
    }
  })

  // 4. Grupowanie według kategorii
  const categoryMap = new Map<
    string,
    Array<{
      name: string
      total_amount: number
      unit: string
    }>
  >()

  Array.from(aggregatedMap.values()).forEach((ingredient) => {
    if (!categoryMap.has(ingredient.category)) {
      categoryMap.set(ingredient.category, [])
    }

    categoryMap.get(ingredient.category)!.push({
      name: ingredient.name,
      total_amount: Math.round(ingredient.amount * 100) / 100, // Zaokrąglenie do 2 miejsc
      unit: ingredient.unit,
    })
  })

  // 5. Sortowanie i formatowanie
  const result: ShoppingListResponseDTO = Array.from(categoryMap.entries())
    .sort(([catA], [catB]) => catA.localeCompare(catB, 'pl'))
    .map(([category, items]) => ({
      category: category as any, // TypeScript cast do enum
      items: items.sort((a, b) => a.name.localeCompare(b.name, 'pl')),
    }))

  return result
}
```

**Testy:**

```typescript
// src/services/__tests__/shopping-list.test.ts
describe('generateShoppingList', () => {
  it('aggregates ingredients from multiple meals', () => { ... })
  it('groups by category correctly', () => { ... })
  it('returns empty array when no meals', () => { ... })
  it('handles same ingredient with different units separately', () => { ... })
})
```

---

### Krok 3: Implementacja Route Handler

**Utwórz `app/api/shopping-list/route.ts`**:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { shoppingListQuerySchema } from '@/lib/validation/shopping-list'
import { generateShoppingList } from '@/services/shopping-list'
import type { Database } from '@/types/database.types'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 1. Walidacja query params
    const searchParams = request.nextUrl.searchParams
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')

    if (!start_date || !end_date) {
      return NextResponse.json(
        {
          error: {
            message: 'Wymagane parametry: start_date, end_date',
            code: 'MISSING_PARAMETERS',
          },
        },
        { status: 400 }
      )
    }

    const validated = shoppingListQuerySchema.safeParse({
      start_date,
      end_date,
    })

    if (!validated.success) {
      const errorMessage =
        validated.error.errors[0]?.message || 'Nieprawidłowe parametry'
      return NextResponse.json(
        {
          error: {
            message: errorMessage,
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      )
    }

    // 2. Autoryzacja
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          error: {
            message: 'Brak autoryzacji. Wymagane logowanie.',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      )
    }

    // 3. Generowanie listy zakupów
    const startTime = performance.now()
    const shoppingList = await generateShoppingList(
      user.id,
      validated.data.start_date,
      validated.data.end_date
    )
    const endTime = performance.now()

    console.log(
      `Shopping list generated in ${Math.round(endTime - startTime)}ms for user ${user.id}`
    )

    // 4. Zwrócenie odpowiedzi
    return NextResponse.json(shoppingList, { status: 200 })
  } catch (error) {
    console.error('Shopping list generation error:', error)

    return NextResponse.json(
      {
        error: {
          message: 'Błąd serwera podczas generowania listy zakupów',
          code: 'INTERNAL_SERVER_ERROR',
        },
      },
      { status: 500 }
    )
  }
}
```

---

### Krok 4: Testy integracyjne

**Utwórz `app/api/shopping-list/__tests__/route.test.ts`**:

```typescript
import { GET } from '../route'
import { NextRequest } from 'next/server'

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs')
jest.mock('@/services/shopping-list')

describe('GET /api/shopping-list', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 when missing parameters', async () => {
    const request = new NextRequest('http://localhost/api/shopping-list')
    const response = await GET(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 when invalid date format', async () => { ... })

  it('returns 401 when not authenticated', async () => { ... })

  it('returns 200 with shopping list', async () => {
    // Mock authenticated user
    // Mock generateShoppingList
    const request = new NextRequest(
      'http://localhost/api/shopping-list?start_date=2025-01-15&end_date=2025-01-21'
    )
    const response = await GET(request)
    expect(response.status).toBe(200)
  })

  it('returns empty array when no meals', async () => { ... })

  it('handles database errors gracefully', async () => { ... })
})
```

---

### Krok 5: Dokumentacja i testy E2E (opcjonalnie)

1. **Dodaj endpoint do dokumentacji API**:
   - Zaktualizuj `.ai/10 API-PLAN.md` z przykładami użycia
   - Dodaj przykłady curl do README

2. **Testy E2E** (Playwright):

   ```typescript
   // tests/e2e/shopping-list.spec.ts
   test('user can generate shopping list', async ({ page }) => {
     // Login
     await page.goto('/login')
     await page.fill('[name=email]', 'test@example.com')
     await page.fill('[name=password]', 'password')
     await page.click('button[type=submit]')

     // Navigate to shopping list
     await page.goto('/shopping-list')
     await page.selectOption('[name=start_date]', '2025-01-15')
     await page.selectOption('[name=end_date]', '2025-01-21')
     await page.click('button:has-text("Generuj listę")')

     // Verify results
     await expect(page.locator('h3:has-text("Mięso")')).toBeVisible()
     await expect(page.locator('text=Pierś z kurczaka')).toBeVisible()
   })
   ```

---

### Krok 6: Weryfikacja bezpieczeństwa

**Checklist:**

- [ ] RLS włączone na `planned_meals`
- [ ] Token JWT weryfikowany przez Supabase Auth
- [ ] Walidacja wszystkich parametrów wejściowych
- [ ] Limit zakresu dat (max 30 dni)
- [ ] Brak wrażliwych informacji w błędach
- [ ] Query builder zamiast raw SQL
- [ ] Logowanie błędów bez danych użytkownika

**Testy bezpieczeństwa:**

```typescript
describe('Security tests', () => {
  it('prevents access without authentication', async () => { ... })
  it('prevents SQL injection in date parameters', async () => { ... })
  it('prevents access to other users data (RLS)', async () => { ... })
  it('rejects date range > 30 days', async () => { ... })
})
```

---

### Krok 7: Deployment Checklist

**Przed wdrożeniem:**

- [ ] Wszystkie testy przechodzą (unit + integration)
- [ ] Code review zakończony
- [ ] Dokumentacja zaktualizowana
- [ ] Zmienne środowiskowe skonfigurowane w Cloudflare Pages
- [ ] RLS policies zweryfikowane w Supabase
- [ ] Monitoring i alerty skonfigurowane

**Po wdrożeniu:**

- [ ] Smoke test na produkcji
- [ ] Monitoring wydajności (czas odpowiedzi < 500ms)
- [ ] Monitoring błędów (rate < 1%)
- [ ] User acceptance testing

---

## 10. Podsumowanie

Endpoint `GET /shopping-list` jest stosunkowo prosty w implementacji, ale wymaga starannej agregacji danych i optymalizacji wydajności. Kluczowe punkty:

1. **Bezpieczeństwo**: RLS + walidacja Zod zapewniają pełne bezpieczeństwo
2. **Wydajność**: Optymalizacja zapytań SQL i rozważenie agregacji na poziomie bazy danych
3. **UX**: Pusta tablica zamiast 404, czytelne komunikaty błędów
4. **Testowanie**: Pełne pokrycie testami (unit + integration + E2E)
5. **Monitoring**: Logowanie czasów wykonania dla przyszłych optymalizacji

**Szacowany czas implementacji**: 8-12 godzin (włączając testy)
