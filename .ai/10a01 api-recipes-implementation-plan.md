# API Endpoint Implementation Plan: Recipes

## 1. Przegląd punktów końcowych

Ten dokument opisuje implementację endpointów REST API dla zasobu **Recipes** zgodnie z wzorcem dwuwarstwowym (Server Actions + REST API).

### Endpointy

1. **GET /api/recipes** - Pobiera listę przepisów z filtrowaniem (meal_type, tags, search)
2. **GET /api/recipes/{id}** - Pobiera szczegóły pojedynczego przepisu
3. **POST /api/recipes** - Tworzy nowy przepis (admin only - future)
4. **PATCH /api/recipes/{id}** - Aktualizuje przepis (admin only - future)

Wszystkie endpointy wymagają uwierzytelnienia i są chronione przez **Row Level Security (RLS)** w Supabase.

---

## 2. Architektura dwuwarstwowa

### 2.1. Server Actions (Główna logika biznesowa)

**Lokalizacja:** `lib/actions/recipes.ts`

**Odpowiedzialność:**

- Cała logika biznesowa
- Walidacja danych wejściowych (Zod)
- Interakcja z Supabase
- Transformacja danych do DTO
- Obsługa błędów biznesowych

**Charakterystyka:**

- Oznaczone `'use server'`
- Mogą być używane bezpośrednio z Server Components
- Mogą być używane przez API Route Handlers
- Zwracają `ActionResult<T>` (discriminated union)

### 2.2. API Route Handlers (Cienka warstwa HTTP)

**Lokalizacja:** `app/api/recipes/**/route.ts`

**Odpowiedzialność:**

- Wystawienie REST API
- Minimalna walidacja HTTP (query params, path params)
- Wywołanie Server Actions
- Mapowanie błędów na kody statusu HTTP
- Zwracanie JSON response

**Charakterystyka:**

- Cienka warstwa bez logiki biznesowej
- Prosty, czytelny kod
- Konsystentny wzorzec dla wszystkich endpointów

---

## 3. Szczegóły żądań

### 3.1. GET /api/recipes

#### Metoda HTTP

`GET`

#### Struktura URL

```
/api/recipes?meal_type={breakfast|lunch|dinner}&tags={tag1,tag2}&search={query}&limit={number}
```

#### Parametry

**Query Parameters (opcjonalne):**

- `meal_type` (string) - Filtrowanie po typie posiłku: `breakfast`, `lunch`, `dinner`
- `tags` (string) - Filtrowanie po tagach (separated by comma): `low-carb,high-protein`
- `search` (string) - Wyszukiwanie pełnotekstowe w nazwie i składnikach
- `limit` (number) - Limit wyników (domyślnie: 50, max: 100)

**Headers:**

- `Authorization: Bearer {token}` - Token uwierzytelniający Supabase

#### Request Body

Brak (GET request)

#### Walidacja

- `meal_type` musi być jednym z: `breakfast`, `lunch`, `dinner`
- `tags` muszą być rozdzielone przecinkami
- `search` musi mieć minimum 2 znaki
- `limit` musi być liczbą całkowitą dodatnią (1-100)

---

### 3.2. GET /api/recipes/{id}

#### Metoda HTTP

`GET`

#### Struktura URL

```
/api/recipes/{id}
```

#### Parametry

**Path Parameters (wymagane):**

- `id` (number) - ID przepisu

**Headers:**

- `Authorization: Bearer {token}` - Token uwierzytelniający Supabase

#### Request Body

Brak (GET request)

#### Walidacja

- `id` musi być liczbą całkowitą dodatnią

---

## 4. Wykorzystywane typy

### 4.1. DTO Types (z `dto.types.ts`)

```typescript
// Główny typ dla przepisu
RecipeDTO = {
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
  created_at: string
}

// Składnik z ilością
IngredientDTO = {
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
RecipeInstructions = {
  steps: string[]
  prep_time_minutes?: number
  cook_time_minutes?: number
}
```

### 4.2. Query Models

```typescript
// Filtrowanie przepisów
GetRecipesQuery = {
  meal_type?: Enums<'meal_type_enum'>
  tags?: string[]
  search?: string
  limit?: number
}
```

### 4.3. Response Types

```typescript
// Sukces (Discriminated Union)
ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string }
```

---

## 5. Przepływ danych

### 5.1. GET /api/recipes

```
1. Client → API Route Handler (/api/recipes/route.ts)
   └─ Query params: meal_type, tags, search, limit
   └─ Auth token w headerze

2. API Route Handler
   └─ Podstawowa walidacja query params
   └─ Wywołanie Server Action: getRecipes(queryParams)

3. Server Action: getRecipes() (lib/actions/recipes.ts)
   └─ Walidacja parametrów wejściowych (Zod)
   └─ Utworzenie Supabase client
   └─ Sprawdzenie autentykacji
   └─ Budowanie zapytania z filtrowaniem:
       SELECT recipes.*,
              recipe_ingredients.*,
              ingredients.*
       FROM recipes
       LEFT JOIN recipe_ingredients ON recipes.id = recipe_ingredients.recipe_id
       LEFT JOIN ingredients ON recipe_ingredients.ingredient_id = ingredients.id
       WHERE (meal_type filter)
         AND (tags filter)
         AND (search filter)
       ORDER BY recipes.created_at DESC
       LIMIT $limit

4. Transformacja danych
   └─ Raw DB rows → RecipeDTO[]
   └─ Zagnieżdżenie: recipe_ingredients → ingredients
   └─ Kalkulacja wartości odżywczych z base_amount

5. API Route Handler → Client
   └─ HTTP 200 + RecipeDTO[]
```

### 5.2. GET /api/recipes/{id}

```
1. Client → API Route Handler (/api/recipes/[id]/route.ts)
   └─ Path param: id
   └─ Auth token w headerze

2. API Route Handler
   └─ Walidacja path param (number, positive)
   └─ Wywołanie Server Action: getRecipeById(id)

3. Server Action: getRecipeById() (lib/actions/recipes.ts)
   └─ Walidacja ID
   └─ Utworzenie Supabase client
   └─ Sprawdzenie autentykacji
   └─ Query do Supabase:
       SELECT recipes.*,
              recipe_ingredients.*,
              ingredients.*
       FROM recipes
       LEFT JOIN recipe_ingredients ON recipes.id = recipe_ingredients.recipe_id
       LEFT JOIN ingredients ON recipe_ingredients.ingredient_id = ingredients.id
       WHERE recipes.id = $id

4. Transformacja danych
   └─ Raw DB row → RecipeDTO
   └─ Zagnieżdżenie: recipe_ingredients → ingredients

5. API Route Handler → Client
   └─ HTTP 200 + RecipeDTO
   └─ HTTP 404 jeśli nie znaleziono
```

---

## 6. Względy bezpieczeństwa

### 6.1. Uwierzytelnianie i autoryzacja

#### Supabase Auth

- Wszystkie endpointy wymagają **Bearer token** w headerze `Authorization`
- Token weryfikowany przez Supabase Auth middleware
- Pobranie `user_id` z `auth.uid()`

#### Row Level Security (RLS)

**Tabela `recipes`:**

```sql
-- Policy: Wszyscy uwierzytelnieni mogą czytać przepisy
CREATE POLICY "Authenticated users can view recipes"
  ON public.recipes FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Tylko admini mogą tworzyć przepisy (future)
CREATE POLICY "Only admins can insert recipes"
  ON public.recipes FOR INSERT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

### 6.2. Walidacja danych wejściowych

#### Zod Schema

```typescript
// GET /api/recipes query params
const getRecipesQuerySchema = z.object({
  meal_type: z.enum(['breakfast', 'lunch', 'dinner']).optional(),
  tags: z
    .string()
    .transform((val) => val.split(','))
    .optional(),
  search: z.string().min(2).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

// Path param validation
const recipeIdSchema = z.coerce.number().int().positive()
```

### 6.3. Ochrona przed atakami

#### SQL Injection

- Używamy **Supabase Client** (parametryzowane zapytania) - bezpieczne
- NIGDY nie łączymy stringów do budowy SQL

#### XSS (Cross-Site Scripting)

- Sanityzacja danych wejściowych (szczególnie `search` query)
- Next.js automatycznie escapuje dane w JSX

#### Rate Limiting

- Implementacja rate limiting na poziomie middleware
- Limit: **100 requests/minute** na użytkownika dla GET

---

## 7. Obsługa błędów

### 7.1. Kody statusu i scenariusze

| Kod     | Scenariusz                   | Akcja                             |
| ------- | ---------------------------- | --------------------------------- |
| **200** | Sukces (GET)                 | Zwróć dane                        |
| **400** | Nieprawidłowe dane wejściowe | Zwróć szczegóły walidacji         |
| **401** | Brak lub nieważny token      | Przekieruj do logowania           |
| **404** | Przepis nie istnieje         | Zwróć błąd not found              |
| **500** | Błąd serwera/bazy danych     | Zaloguj błąd, zwróć generic error |

### 7.2. Szczegółowe scenariusze błędów

#### GET /api/recipes

| Błąd                      | Kod | Message                                      | Details                                          |
| ------------------------- | --- | -------------------------------------------- | ------------------------------------------------ |
| Nieprawidłowy `meal_type` | 400 | "Invalid meal_type"                          | `{ expected: ['breakfast', 'lunch', 'dinner'] }` |
| `search` zbyt krótkie     | 400 | "Search query must be at least 2 characters" | `{ min_length: 2 }`                              |
| `limit` > 100             | 400 | "Limit cannot exceed 100"                    | `{ max_limit: 100 }`                             |
| Brak tokenu               | 401 | "Authentication required"                    | -                                                |
| Błąd bazy danych          | 500 | "Failed to fetch recipes"                    | -                                                |

#### GET /api/recipes/{id}

| Błąd                 | Kod | Message                   | Details  |
| -------------------- | --- | ------------------------- | -------- |
| Nieprawidłowy `id`   | 400 | "Invalid recipe ID"       | `{ id }` |
| Przepis nie istnieje | 404 | "Recipe not found"        | -        |
| Brak tokenu          | 401 | "Authentication required" | -        |
| Błąd bazy danych     | 500 | "Failed to fetch recipe"  | -        |

---

## 8. Rozważania dotyczące wydajności

### 8.1. Potencjalne wąskie gardła

#### 1. GET /api/recipes - Join z wieloma tabelami

**Problem:**

- Join `recipes` → `recipe_ingredients` → `ingredients`
- Dla 50 przepisów × N składników = potencjalnie dużo danych

**Rozwiązanie:**

- Indeks na `recipe_ingredients(recipe_id)`
- Indeks na `recipes(meal_types)` (GIN)
- Użyć `select()` z konkretnymi polami zamiast `*`
- Domyślny limit 50, max 100

```sql
-- Sugerowane indeksy
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipes_meal_types ON recipes USING GIN(meal_types);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
```

#### 2. GET /api/recipes?search={query} - Full text search

**Problem:**

- Wyszukiwanie pełnotekstowe może być wolne

**Rozwiązanie:**

- Indeks GIN dla pełnotekstowego wyszukiwania
- Użyć `textSearch()` z Supabase
- Minimum 2 znaki dla `search`

```sql
-- Full text search index
CREATE INDEX idx_recipes_name_search ON recipes USING GIN(to_tsvector('polish', name));
```

### 8.2. Strategie optymalizacji

#### Caching

- **TanStack Query** po stronie klienta:
  - `staleTime: 5 * 60 * 1000` (5 minut) dla GET /recipes
  - `staleTime: 10 * 60 * 1000` (10 minut) dla GET /recipes/{id}
- **Redis** (opcjonalnie, future enhancement):
  - Cache dla listy przepisów (często używane filtry)
  - Cache dla pojedynczych przepisów

#### Database Query Optimization

- Użyć `select()` z konkretnymi polami
- Eager loading dla relacji (unikać N+1)
- LIMIT zawsze obecny (domyślnie 50)

#### Pagination (Future Enhancement)

- Dodać `offset` i `cursor` pagination
- Dla dużych zbiorów danych

---

## 9. Kroki implementacji

### Krok 1: Przygotowanie struktury projektu

#### 1.1. Struktura plików (już istnieje)

```
lib/actions/
  └── recipes.ts           # Server Actions (główna logika) ✅ ISTNIEJĄCE

app/api/
  └── recipes/
      ├── route.ts         # GET /api/recipes (do utworzenia)
      └── [id]/
          └── route.ts     # GET /api/recipes/{id} ✅ ISTNIEJĄCE

lib/validation/
  └── recipes.ts           # Zod schemas (do utworzenia)
```

#### 1.2. Utworzenie typów DTO (sprawdzić)

- Sprawdzić `src/types/dto.types.ts`
- Zweryfikować `RecipeDTO`, `IngredientDTO`

---

### Krok 2: Implementacja walidacji (Zod schemas)

**Plik:** `lib/validation/recipes.ts`

```typescript
import { z } from 'zod'

/**
 * Schema walidacji dla GET /api/recipes query params
 */
export const getRecipesQuerySchema = z.object({
  meal_type: z.enum(['breakfast', 'lunch', 'dinner']).optional(),
  tags: z
    .string()
    .transform((val) => val.split(',').filter(Boolean))
    .optional(),
  search: z
    .string()
    .min(2, 'Search query must be at least 2 characters')
    .optional(),
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .positive('Limit must be positive')
    .max(100, 'Limit cannot exceed 100')
    .default(50),
})

/**
 * TypeScript type dla query params
 */
export type GetRecipesQuery = z.infer<typeof getRecipesQuerySchema>

/**
 * Schema walidacji dla recipe ID (path param)
 */
export const recipeIdSchema = z.coerce
  .number()
  .int('Recipe ID must be an integer')
  .positive('Recipe ID must be positive')

/**
 * TypeScript type dla recipe ID
 */
export type RecipeId = z.infer<typeof recipeIdSchema>
```

---

### Krok 3: Weryfikacja Server Actions (już istnieją)

**Plik:** `lib/actions/recipes.ts` ✅ JUŻ ISTNIEJE

**Funkcje do weryfikacji:**

- ✅ `getRecipeById(id: number)` - istniejąca
- ⚠️ `getRecipes(query: GetRecipesQuery)` - do dodania lub weryfikacji

**Wymagane poprawki (jeśli brakuje):**

- Dodać funkcję `getRecipes()` z filtrowaniem
- Dodać walidację Zod w obu funkcjach
- Zweryfikować typ zwracany `ActionResult<T>`

---

### Krok 4: Implementacja API Route Handlers

#### 4.1. GET /api/recipes

**Plik:** `app/api/recipes/route.ts` (do utworzenia)

```typescript
/**
 * API Route Handler for Recipes List
 *
 * Endpoint: GET /api/recipes?meal_type={type}&tags={tags}&search={query}&limit={n}
 *
 * Ten endpoint udostępnia logikę z Server Action `getRecipes` jako
 * standardowy REST API.
 *
 * @see /lib/actions/recipes.ts
 */

import { getRecipes } from '@/lib/actions/recipes'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // 1. Pobierz query params z URL
  const searchParams = request.nextUrl.searchParams
  const meal_type = searchParams.get('meal_type') || undefined
  const tags = searchParams.get('tags') || undefined
  const search = searchParams.get('search') || undefined
  const limit = searchParams.get('limit') || '50'

  // 2. Wywołaj istniejącą logikę z Server Action
  const result = await getRecipes({
    meal_type,
    tags,
    search,
    limit: parseInt(limit, 10),
  })

  // 3. Zwróć odpowiedź w formacie JSON
  if (result.error) {
    // Określ kod statusu na podstawie typu błędu
    let status = 500
    if (
      result.error.includes('nieprawidłow') ||
      result.error.includes('Invalid')
    ) {
      status = 400
    }
    if (
      result.error.includes('Uwierzytelnienie') ||
      result.error.includes('Authentication')
    ) {
      status = 401
    }

    return NextResponse.json({ error: result.error }, { status })
  }

  return NextResponse.json(result.data)
}
```

#### 4.2. GET /api/recipes/{id}

**Plik:** `app/api/recipes/[id]/route.ts` ✅ JUŻ ISTNIEJE

**Wymagane weryfikacje:**

- Sprawdzić czy wywołuje `getRecipeById()` z Server Actions
- Sprawdzić czy obsługuje błędy poprawnie
- Sprawdzić czy zwraca odpowiednie kody statusu HTTP

---

### Krok 5: Implementacja RLS policies (jeśli jeszcze nie istnieją)

**Plik:** `supabase/migrations/YYYYMMDDHHMMSS_recipes_rls.sql`

```sql
-- Włącz RLS dla tabeli recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Policy: Wszyscy uwierzytelnieni mogą czytać przepisy
CREATE POLICY "Authenticated users can view recipes"
  ON public.recipes FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Tylko admini mogą tworzyć przepisy (future)
CREATE POLICY "Only admins can insert recipes"
  ON public.recipes FOR INSERT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policy: Tylko admini mogą aktualizować przepisy (future)
CREATE POLICY "Only admins can update recipes"
  ON public.recipes FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

---

### Krok 6: Utworzenie indeksów dla wydajności

**Plik:** `supabase/migrations/YYYYMMDDHHMMSS_recipes_indexes.sql`

```sql
-- Indeks na recipe_id dla joinów
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe
  ON public.recipe_ingredients(recipe_id);

-- Indeks GIN na recipes.meal_types dla filtrowania
CREATE INDEX IF NOT EXISTS idx_recipes_meal_types
  ON public.recipes USING GIN(meal_types);

-- Indeks na created_at dla sortowania
CREATE INDEX IF NOT EXISTS idx_recipes_created_at
  ON public.recipes(created_at DESC);

-- Indeks dla pełnotekstowego wyszukiwania w nazwie
CREATE INDEX IF NOT EXISTS idx_recipes_name_search
  ON public.recipes USING GIN(to_tsvector('polish', name));

-- Indeks na tags dla filtrowania
CREATE INDEX IF NOT EXISTS idx_recipes_tags
  ON public.recipes USING GIN(tags);
```

---

### Krok 7: Testy jednostkowe

#### 7.1. Testy dla Server Actions

**Plik:** `lib/actions/__tests__/recipes.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getRecipeById, getRecipes } from '../recipes'

describe('Recipes Server Actions', () => {
  describe('getRecipeById', () => {
    it('should return recipe with ingredients', async () => {
      // TODO: Mock Supabase client
      // TODO: Implementacja testu
    })

    it('should return error if recipe not found', async () => {
      // TODO: Implementacja testu
    })

    it('should require authentication', async () => {
      // TODO: Implementacja testu
    })
  })

  describe('getRecipes', () => {
    it('should return list of recipes', async () => {
      // TODO: Implementacja testu
    })

    it('should filter by meal_type', async () => {
      // TODO: Implementacja testu
    })

    it('should filter by tags', async () => {
      // TODO: Implementacja testu
    })

    it('should search by name', async () => {
      // TODO: Implementacja testu
    })

    it('should limit results', async () => {
      // TODO: Implementacja testu
    })

    it('should reject limit > 100', async () => {
      // TODO: Implementacja testu
    })
  })
})
```

#### 7.2. Testy dla walidacji

**Plik:** `lib/validation/__tests__/recipes.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { getRecipesQuerySchema, recipeIdSchema } from '../recipes'

describe('Recipes Validation', () => {
  describe('getRecipesQuerySchema', () => {
    it('should validate correct query', () => {
      const result = getRecipesQuerySchema.safeParse({
        meal_type: 'breakfast',
        tags: 'low-carb,high-protein',
        search: 'jajecznica',
        limit: '20',
      })
      expect(result.success).toBe(true)
    })

    it('should use default limit', () => {
      const result = getRecipesQuerySchema.safeParse({})
      expect(result.success).toBe(true)
      expect(result.data?.limit).toBe(50)
    })

    it('should reject invalid meal_type', () => {
      const result = getRecipesQuerySchema.safeParse({
        meal_type: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('should reject search < 2 characters', () => {
      const result = getRecipesQuerySchema.safeParse({
        search: 'a',
      })
      expect(result.success).toBe(false)
    })

    it('should reject limit > 100', () => {
      const result = getRecipesQuerySchema.safeParse({
        limit: '150',
      })
      expect(result.success).toBe(false)
    })

    it('should transform tags string to array', () => {
      const result = getRecipesQuerySchema.safeParse({
        tags: 'low-carb,high-protein,keto',
      })
      expect(result.success).toBe(true)
      expect(result.data?.tags).toEqual(['low-carb', 'high-protein', 'keto'])
    })
  })

  describe('recipeIdSchema', () => {
    it('should validate positive integer', () => {
      const result = recipeIdSchema.safeParse('123')
      expect(result.success).toBe(true)
      expect(result.data).toBe(123)
    })

    it('should reject negative number', () => {
      const result = recipeIdSchema.safeParse('-1')
      expect(result.success).toBe(false)
    })

    it('should reject zero', () => {
      const result = recipeIdSchema.safeParse('0')
      expect(result.success).toBe(false)
    })

    it('should reject non-integer', () => {
      const result = recipeIdSchema.safeParse('12.5')
      expect(result.success).toBe(false)
    })
  })
})
```

---

### Krok 8: Testy E2E (opcjonalnie)

**Plik:** `tests/e2e/recipes.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Recipes API', () => {
  test('GET /api/recipes should return list of recipes', async ({
    request,
  }) => {
    // TODO: Login i pobranie tokenu
    // TODO: Wywołanie API
    // TODO: Asercje
  })

  test('GET /api/recipes?meal_type=breakfast should filter', async ({
    request,
  }) => {
    // TODO: Implementacja testu
  })

  test('GET /api/recipes/{id} should return single recipe', async ({
    request,
  }) => {
    // TODO: Implementacja testu
  })

  test('GET /api/recipes/999999 should return 404', async ({ request }) => {
    // TODO: Implementacja testu
  })
})
```

---

## 10. Podsumowanie

### Kluczowe punkty:

✅ **Architektura dwuwarstwowa** - Server Actions + REST API Route Handlers
✅ **Uwierzytelnianie i autoryzacja** - RLS policies + Supabase Auth
✅ **Walidacja danych** - Zod schemas z szczegółowymi regułami
✅ **Obsługa błędów** - Standardowe kody statusu + szczegółowe komunikaty
✅ **Wydajność** - Indeksy bazy danych + query optimization
✅ **Bezpieczeństwo** - SQL injection protection + rate limiting
✅ **Testowanie** - Unit tests + E2E tests

### Status implementacji:

1. ✅ `lib/actions/recipes.ts` - Server Actions (**JUŻ ISTNIEJE**)
2. ✅ `app/api/recipes/[id]/route.ts` - GET single recipe (**JUŻ ISTNIEJE**)
3. ⏳ `lib/validation/recipes.ts` - Walidacja Zod (**DO UTWORZENIA**)
4. ⏳ `app/api/recipes/route.ts` - GET list recipes (**DO UTWORZENIA**)
5. ⏳ Dodać `getRecipes()` do Server Actions (**DO WERYFIKACJI**)
6. ⏳ RLS policies - sprawdzić czy są (**DO WERYFIKACJI**)
7. ⏳ Indeksy bazy danych (**DO UTWORZENIA**)
8. ⏳ Testy jednostkowe (**DO UTWORZENIA**)

### Kolejność działań:

1. Sprawdzić `lib/actions/recipes.ts` - czy ma funkcję `getRecipes()`
2. Utworzyć `lib/validation/recipes.ts` - Zod schemas
3. Utworzyć `app/api/recipes/route.ts` - GET list endpoint
4. Zweryfikować `app/api/recipes/[id]/route.ts` - czy zgodny z wzorcem
5. Sprawdzić RLS policies w Supabase
6. Utworzyć migrację z indeksami
7. Napisać testy jednostkowe

---

**Następne kroki:**

1. Weryfikacja istniejącego kodu w `lib/actions/recipes.ts`
2. Utworzenie walidacji w `lib/validation/recipes.ts`
3. Utworzenie `app/api/recipes/route.ts`
4. Testy i dokumentacja
