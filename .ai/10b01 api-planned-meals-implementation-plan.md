# API Endpoint Implementation Plan: Planned Meals

## 1. Przegląd punktów końcowych

Ten dokument opisuje implementację trzech endpointów REST API dla zasobu **Planned Meals**:

1. **GET /planned-meals** - Pobiera listę zaplanowanych posiłków użytkownika w zadanym zakresie dat
2. **PATCH /planned-meals/{id}** - Aktualizuje pojedynczy posiłek (oznaczenie jako zjedzony, wymiana przepisu, modyfikacja składników)
3. **GET /planned-meals/{id}/replacements** - Zwraca listę sugerowanych zamienników dla danego posiłku

Wszystkie endpointy wymagają uwierzytelnienia i są chronione przez **Row Level Security (RLS)** w Supabase.

---

## 2. Szczegóły żądań

### 2.1. GET /planned-meals

#### Metoda HTTP

`GET`

#### Struktura URL

```
/api/planned-meals?start_date={YYYY-MM-DD}&end_date={YYYY-MM-DD}
```

#### Parametry

**Query Parameters (wymagane):**

- `start_date` (string, format `YYYY-MM-DD`) - Data początkowa zakresu
- `end_date` (string, format `YYYY-MM-DD`) - Data końcowa zakresu

**Headers:**

- `Authorization: Bearer {token}` - Token uwierzytelniający Supabase

#### Request Body

Brak (GET request)

#### Walidacja

- `start_date` i `end_date` muszą być w formacie `YYYY-MM-DD`
- `end_date` nie może być wcześniejsza niż `start_date`
- Zakres dat nie powinien przekraczać **30 dni** (ochrona przed performance issues)

---

### 2.2. PATCH /planned-meals/{id}

#### Metoda HTTP

`PATCH`

#### Struktura URL

```
/api/planned-meals/{id}
```

#### Parametry

**Path Parameters (wymagane):**

- `id` (number) - ID zaplanowanego posiłku

**Headers:**

- `Authorization: Bearer {token}` - Token uwierzytelniający Supabase
- `Content-Type: application/json`

#### Request Body (jeden z wariantów)

**Wariant 1: Oznaczenie jako zjedzony**

```json
{
  "is_eaten": true
}
```

**Wariant 2: Wymiana przepisu**

```json
{
  "recipe_id": 105
}
```

**Wariant 3: Modyfikacja składników**

```json
{
  "ingredient_overrides": [
    { "ingredient_id": 12, "new_amount": 150 },
    { "ingredient_id": 45, "new_amount": 20 }
  ]
}
```

#### Walidacja

- `id` musi być liczbą całkowitą dodatnią
- **Wariant 1 (`is_eaten`):**
  - Wartość boolean
- **Wariant 2 (`recipe_id`):**
  - Przepis musi istnieć w bazie
  - Przepis musi być tego samego `meal_type` (breakfast/lunch/dinner)
  - Różnica kaloryczna musi mieścić się w zakresie **±15%**
- **Wariant 3 (`ingredient_overrides`):**
  - Składnik musi istnieć w przepisie
  - Składnik musi być skalowalny (`is_scalable = true`)
  - Zmiana musi być w zakresie **±10%** oryginalnej ilości

---

### 2.3. GET /planned-meals/{id}/replacements

#### Metoda HTTP

`GET`

#### Struktura URL

```
/api/planned-meals/{id}/replacements
```

#### Parametry

**Path Parameters (wymagane):**

- `id` (number) - ID zaplanowanego posiłku

**Headers:**

- `Authorization: Bearer {token}` - Token uwierzytelniający Supabase

#### Request Body

Brak (GET request)

#### Walidacja

- `id` musi być liczbą całkowitą dodatnią
- Posiłek musi należeć do zalogowanego użytkownika

---

## 3. Wykorzystywane typy

### 3.1. DTO Types (z `dto.types.ts`)

```typescript
// Główny typ dla zaplanowanego posiłku
PlannedMealDTO = {
  id: number
  meal_date: string
  meal_type: Enums<'meal_type_enum'>
  is_eaten: boolean
  ingredient_overrides: IngredientOverrides | null
  recipe: RecipeDTO
  created_at: string
}

// Przepis z zagnieżdżonymi składnikami
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

// Nadpisania składników
IngredientOverrides = {
  ingredient_id: number
  new_amount: number
}[]
```

### 3.2. Command Models

```typescript
// Oznaczenie jako zjedzony
MarkMealEatenCommand = {
  is_eaten: boolean,
}

// Modyfikacja składnika
ModifyIngredientCommand = {
  new_amount: number,
}

// Wymiana przepisu
SwapMealCommand = {
  meal_type: Enums<'meal_type_enum'>,
}
```

### 3.3. Response Types

```typescript
// Sukces
ApiSuccessResponse<T> = {
  data: T
  message?: string
}

// Błąd
ApiErrorResponse = {
  error: {
    message: string
    code?: string
    details?: unknown
  }
}
```

### 3.4. Typy dla zamienników (GET /replacements)

```typescript
// Typ dla pojedynczego zamiennika
type ReplacementRecipeDTO = {
  id: number
  name: string
  image_url: string | null
  meal_types: Enums<'meal_type_enum'>[]
  total_calories: number | null
  total_protein_g: number | null
  total_carbs_g: number | null
  total_fats_g: number | null
  calorie_diff: number // Różnica kaloryczna względem oryginalnego przepisu
}
```

---

## 4. Szczegóły odpowiedzi

### 4.1. GET /planned-meals

#### Sukces (200 OK)

```json
{
  "data": [
    {
      "id": 1,
      "meal_date": "2023-10-27",
      "meal_type": "breakfast",
      "is_eaten": false,
      "ingredient_overrides": null,
      "recipe": {
        "id": 101,
        "name": "Jajecznica z boczkiem",
        "image_url": "...",
        "total_calories": 450,
        "total_protein_g": 25.5,
        "total_carbs_g": 3.2,
        "total_fats_g": 35.8,
        "instructions": [...],
        "meal_types": ["breakfast"],
        "tags": ["low-carb", "high-protein"],
        "ingredients": [...]
      },
      "created_at": "2023-10-27T08:00:00Z"
    }
  ]
}
```

#### Błędy

- **400 Bad Request** - nieprawidłowe parametry daty
  ```json
  {
    "error": {
      "message": "Invalid date format or range",
      "code": "VALIDATION_ERROR",
      "details": {
        "start_date": "Required",
        "end_date": "Must be after start_date"
      }
    }
  }
  ```
- **401 Unauthorized** - brak lub nieważny token
  ```json
  {
    "error": {
      "message": "Authentication required",
      "code": "UNAUTHORIZED"
    }
  }
  ```

---

### 4.2. PATCH /planned-meals/{id}

#### Sukces (200 OK)

```json
{
  "data": {
    "id": 1,
    "meal_date": "2023-10-27",
    "meal_type": "breakfast",
    "is_eaten": true,
    "ingredient_overrides": null,
    "recipe": {
      "id": 101,
      "name": "Jajecznica z boczkiem",
      "image_url": "...",
      "total_calories": 450,
      "total_protein_g": 25.5,
      "total_carbs_g": 3.2,
      "total_fats_g": 35.8,
      "instructions": [...],
      "meal_types": ["breakfast"],
      "tags": ["low-carb", "high-protein"],
      "ingredients": [...]
    },
    "created_at": "2023-10-27T08:00:00Z",
    "updated_at": "2023-10-27T09:00:00Z"
  }
}
```

#### Błędy

- **400 Bad Request** - nieprawidłowe dane
  ```json
  {
    "error": {
      "message": "Ingredient is not scalable",
      "code": "VALIDATION_ERROR",
      "details": { "ingredient_id": 12, "is_scalable": false }
    }
  }
  ```
- **401 Unauthorized** - brak autentykacji
- **403 Forbidden** - próba modyfikacji cudzego posiłku
  ```json
  {
    "error": {
      "message": "You don't have permission to modify this meal",
      "code": "FORBIDDEN"
    }
  }
  ```
- **404 Not Found** - posiłek nie istnieje
  ```json
  {
    "error": {
      "message": "Planned meal not found",
      "code": "NOT_FOUND"
    }
  }
  ```

---

### 4.3. GET /planned-meals/{id}/replacements

#### Sukces (200 OK)

```json
{
  "data": [
    {
      "id": 105,
      "name": "Sałatka z kurczakiem i awokado",
      "image_url": "...",
      "meal_types": ["breakfast", "lunch"],
      "total_calories": 460,
      "total_protein_g": 28.0,
      "total_carbs_g": 5.0,
      "total_fats_g": 36.0,
      "calorie_diff": 10
    },
    {
      "id": 112,
      "name": "Omlet ze szpinakiem",
      "image_url": "...",
      "meal_types": ["breakfast"],
      "total_calories": 435,
      "total_protein_g": 24.0,
      "total_carbs_g": 4.0,
      "total_fats_g": 34.0,
      "calorie_diff": -15
    }
  ]
}
```

#### Błędy

- **401 Unauthorized** - brak autentykacji
- **403 Forbidden** - próba dostępu do cudzego posiłku
- **404 Not Found** - posiłek nie istnieje

---

## 5. Przepływ danych

### 5.1. GET /planned-meals

```
1. Client → API Route Handler (/api/planned-meals/route.ts)
   └─ Query params: start_date, end_date
   └─ Auth token w headerze

2. API Route Handler
   └─ Walidacja daty (Zod schema)
   └─ Sprawdzenie autentykacji (Supabase Auth)
   └─ Wywołanie Server Action: getPlannedMeals(params)

3. Server Action: getPlannedMeals() (lib/actions/planned-meals.ts)
   └─ Walidacja parametrów wejściowych (Zod)
   └─ Utworzenie Supabase client
   └─ Query do Supabase:
       SELECT planned_meals.*,
              recipes.*,
              recipe_ingredients.*,
              ingredients.*
       FROM planned_meals
       JOIN recipes ON planned_meals.recipe_id = recipes.id
       JOIN recipe_ingredients ON recipes.id = recipe_ingredients.recipe_id
       JOIN ingredients ON recipe_ingredients.ingredient_id = ingredients.id
       WHERE planned_meals.user_id = $userId
         AND planned_meals.meal_date BETWEEN $startDate AND $endDate
       ORDER BY planned_meals.meal_date, planned_meals.meal_type

4. Transformacja danych
   └─ Raw DB rows → PlannedMealDTO[]
   └─ Zagnieżdżenie: recipes → ingredients

5. API Route Handler → Client
   └─ HTTP 200 + ApiSuccessResponse<PlannedMealDTO[]>
```

### 5.2. PATCH /planned-meals/{id}

```
1. Client → API Route Handler (/api/planned-meals/[id]/route.ts)
   └─ Path param: id
   └─ Body: { action, ...data }
   └─ Auth token w headerze

2. API Route Handler
   └─ Walidacja path param i body (Zod)
   └─ Sprawdzenie autentykacji (Supabase Auth)
   └─ Wywołanie odpowiedniego Server Action:
       • updatePlannedMeal(mealId, updateData)

3. Server Action: updatePlannedMeal() (lib/actions/planned-meals.ts)
   └─ Walidacja body (Zod discriminated union)
   └─ Utworzenie Supabase client
   └─ Wywołanie odpowiedniej logiki wewnętrznej:
       • markMealAsEaten(userId, mealId, isEaten)
       • swapMealRecipe(userId, mealId, newRecipeId)
       • modifyMealIngredients(userId, mealId, overrides)

4a. Logika: markMealAsEaten()
   └─ Weryfikacja własności (RLS)
   └─ UPDATE planned_meals SET is_eaten = $isEaten WHERE id = $mealId AND user_id = $userId

3b. MealPlanService.swapMealRecipe()
   └─ Weryfikacja własności (RLS)
   └─ Pobranie oryginalnego posiłku
   └─ Pobranie nowego przepisu
   └─ Walidacja:
       • Czy recipe_id istnieje?
       • Czy meal_type się zgadza?
       • Czy różnica kaloryczna ≤ ±15%?
   └─ UPDATE planned_meals SET recipe_id = $newRecipeId WHERE id = $mealId AND user_id = $userId

3c. MealPlanService.modifyMealIngredients()
   └─ Weryfikacja własności (RLS)
   └─ Pobranie przepisu z składnikami
   └─ Walidacja dla każdego override:
       • Czy ingredient_id istnieje w przepisie?
       • Czy is_scalable = true?
       • Czy new_amount mieści się w ±10% oryginalnej ilości?
   └─ UPDATE planned_meals SET ingredient_overrides = $overrides WHERE id = $mealId AND user_id = $userId

4. Pobranie zaktualizowanego posiłku z pełnymi danymi

5. API Route Handler → Client
   └─ HTTP 200 + ApiSuccessResponse<PlannedMealDTO>
```

### 5.3. GET /planned-meals/{id}/replacements

```
1. Client → API Route Handler (/api/planned-meals/[id]/replacements/route.ts)
   └─ Path param: id
   └─ Auth token w headerze

2. API Route Handler
   └─ Walidacja path param (Zod)
   └─ Sprawdzenie autentykacji (Supabase Auth)
   └─ Wywołanie Server Action: getReplacementRecipes(mealId)

3. Server Action: getReplacementRecipes() (lib/actions/planned-meals.ts)
   └─ Walidacja ID
   └─ Utworzenie Supabase client
   └─ Pobranie oryginalnego posiłku z przepisem
   └─ Weryfikacja własności (RLS)
   └─ Wyszukanie zamienników

4. Logika wyszukiwania zamienników:
   └─ Query do Supabase:
       SELECT recipes.*
       FROM recipes
       WHERE $mealType = ANY(recipes.meal_types)
         AND recipes.id != $originalRecipeId
         AND recipes.total_calories BETWEEN ($originalCalories * 0.85) AND ($originalCalories * 1.15)
       ORDER BY ABS(recipes.total_calories - $originalCalories) ASC
       LIMIT 10
   └─ Dodanie pola calorie_diff = recipe.total_calories - original.total_calories

5. API Route Handler → Client
   └─ HTTP 200 + ApiSuccessResponse<ReplacementRecipeDTO[]>
```

---

## 6. Względy bezpieczeństwa

### 6.1. Uwierzytelnianie i autoryzacja

#### Supabase Auth

- Wszystkie endpointy wymagają **Bearer token** w headerze `Authorization`
- Token weryfikowany przez Supabase Auth middleware
- Pobranie `user_id` z `auth.uid()`

#### Row Level Security (RLS)

**MUST HAVE** dla tabeli `planned_meals`:

```sql
-- Policy: Użytkownik może czytać tylko swoje posiłki
CREATE POLICY "Users can view their own planned meals"
  ON public.planned_meals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Użytkownik może aktualizować tylko swoje posiłki
CREATE POLICY "Users can update their own planned meals"
  ON public.planned_meals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 6.2. Walidacja danych wejściowych

#### Zod Schema

```typescript
// GET /planned-meals query params
const getPlannedMealsSchema = z
  .object({
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: 'end_date must be after start_date',
  })

// PATCH /planned-meals body (discriminated union)
const updatePlannedMealSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('mark_eaten'),
    is_eaten: z.boolean(),
  }),
  z.object({
    type: z.literal('swap_recipe'),
    recipe_id: z.number().int().positive(),
  }),
  z.object({
    type: z.literal('modify_ingredients'),
    ingredient_overrides: z
      .array(
        z.object({
          ingredient_id: z.number().int().positive(),
          new_amount: z.number().positive(),
        })
      )
      .min(1),
  }),
])
```

### 6.3. Ochrona przed atakami

#### SQL Injection

- Używamy **Supabase Client** (parametryzowane zapytania) - bezpieczne
- NIGDY nie łączymy stringów do budowy SQL

#### XSS (Cross-Site Scripting)

- Sanityzacja danych wejściowych (szczególnie `ingredient_overrides`)
- Next.js automatycznie escapuje dane w JSX

#### IDOR (Insecure Direct Object Reference)

- **Zawsze** sprawdzać `user_id` przed dostępem do `planned_meals`
- RLS policies jako dodatkowa warstwa ochrony

#### Rate Limiting

- Implementacja rate limiting na poziomie middleware
- Limit: **100 requests/minute** na użytkownika dla GET
- Limit: **30 requests/minute** na użytkownika dla PATCH

### 6.4. Bezpieczeństwo Service Role Key

- Service Role Key **TYLKO** na serwerze (Next.js Server Actions/API Routes)
- NIGDY nie eksponować na kliencie
- Używać Anon Key dla operacji klienckich

---

## 7. Obsługa błędów

### 7.1. Kody statusu i scenariusze

| Kod     | Scenariusz                       | Akcja                             |
| ------- | -------------------------------- | --------------------------------- |
| **200** | Sukces (GET, PATCH)              | Zwróć dane                        |
| **400** | Nieprawidłowe dane wejściowe     | Zwróć szczegóły walidacji         |
| **401** | Brak lub nieważny token          | Przekieruj do logowania           |
| **403** | Próba modyfikacji cudzego zasobu | Zwróć błąd forbidden              |
| **404** | Zasób nie istnieje               | Zwróć błąd not found              |
| **500** | Błąd serwera/bazy danych         | Zaloguj błąd, zwróć generic error |

### 7.2. Szczegółowe scenariusze błędów

#### GET /planned-meals

| Błąd                      | Kod | Message                                  | Details                      |
| ------------------------- | --- | ---------------------------------------- | ---------------------------- |
| Brak `start_date`         | 400 | "Missing required parameter: start_date" | `{ field: 'start_date' }`    |
| Nieprawidłowy format daty | 400 | "Invalid date format"                    | `{ expected: 'YYYY-MM-DD' }` |
| `end_date < start_date`   | 400 | "end_date must be after start_date"      | `{ start_date, end_date }`   |
| Zakres > 30 dni           | 400 | "Date range cannot exceed 30 days"       | `{ max_days: 30 }`           |
| Brak tokenu               | 401 | "Authentication required"                | -                            |
| Błąd bazy danych          | 500 | "Failed to fetch planned meals"          | -                            |

#### PATCH /planned-meals/{id}

| Błąd                      | Kod | Message                                         | Details  |
| ------------------------- | --- | ----------------------------------------------- | -------- |
| Nieprawidłowy `id`        | 400 | "Invalid meal ID"                               | `{ id }` |
| Posiłek nie istnieje      | 404 | "Planned meal not found"                        | -        |
| Nie należy do użytkownika | 403 | "You don't have permission to modify this meal" | -        |

| **Wymiana przepisu:**
| Przepis nie istnieje | 400 | "Recipe not found" | `{ recipe_id }` |
| Niezgodny `meal_type` | 400 | "Recipe meal_type does not match" | `{ expected, actual }` |
| Różnica kaloryczna > 15% | 400 | "Calorie difference exceeds ±15%" | `{ original_calories, new_calories, diff_percent }` |
| **Modyfikacja składników:**
| Składnik nie istnieje w przepisie | 400 | "Ingredient not found in recipe" | `{ ingredient_id }` |
| Składnik nie jest skalowalny | 400 | "Ingredient is not scalable" | `{ ingredient_id, is_scalable: false }` |
| Zmiana > 10% | 400 | "Amount change exceeds ±10%" | `{ original_amount, new_amount, diff_percent }` |
| Błąd bazy danych | 500 | "Failed to update planned meal" | - |

#### GET /planned-meals/{id}/replacements

| Błąd                      | Kod | Message                                       | Details        |
| ------------------------- | --- | --------------------------------------------- | -------------- |
| Nieprawidłowy `id`        | 400 | "Invalid meal ID"                             | `{ id }`       |
| Posiłek nie istnieje      | 404 | "Planned meal not found"                      | -              |
| Nie należy do użytkownika | 403 | "You don't have permission to view this meal" | -              |
| Brak zamienników          | 200 | -                                             | `{ data: [] }` |
| Błąd bazy danych          | 500 | "Failed to fetch replacements"                | -              |

### 7.3. Logowanie błędów

#### Tabela `error_logs` (z DB-PLAN.md)

```typescript
interface ErrorLog {
  user_id: string | null // null dla błędów pre-auth
  error_type: 'validation' | 'authorization' | 'database' | 'external_api'
  error_message: string
  stack_trace: string
  request_payload: any
  endpoint: string
  created_at: string
}
```

#### Kiedy logować?

| Typ błędu          | Logować?                      | Priorytet |
| ------------------ | ----------------------------- | --------- |
| 400 (walidacja)    | Opcjonalnie (jeśli nietypowe) | Low       |
| 401 (brak auth)    | Nie                           | -         |
| 403 (forbidden)    | **TAK** (potencjalny atak)    | Medium    |
| 404 (not found)    | Opcjonalnie                   | Low       |
| 500 (server error) | **TAK**                       | High      |
| Database errors    | **TAK**                       | High      |

#### Service dla logowania

```typescript
// services/error-logger.service.ts
async function logError(
  error: Error,
  context: {
    userId?: string
    endpoint: string
    requestPayload?: any
  }
) {
  await supabase.from('error_logs').insert({
    user_id: context.userId || null,
    error_type: classifyErrorType(error),
    error_message: error.message,
    stack_trace: error.stack,
    request_payload: context.requestPayload,
    endpoint: context.endpoint,
  })
}
```

---

## 8. Rozważania dotyczące wydajności

### 8.1. Potencjalne wąskie gardła

#### 1. GET /planned-meals - Join z wieloma tabelami

**Problem:**

- Join `planned_meals` → `recipes` → `recipe_ingredients` → `ingredients`
- Dla 7 dni × 3 posiłki = 21 wierszy × N składników = potencjalnie dużo danych

**Rozwiązanie:**

- Indeks na `planned_meals(user_id, meal_date)`
- Indeks na `recipe_ingredients(recipe_id)`
- Limit zakresu dat do max 30 dni
- Użyć `select()` z konkretnymi polami zamiast `*`

```sql
-- Sugerowane indeksy
CREATE INDEX idx_planned_meals_user_date ON planned_meals(user_id, meal_date);
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipes_meal_types ON recipes USING GIN(meal_types);
```

#### 2. GET /planned-meals/{id}/replacements - Full table scan

**Problem:**

- Query po `recipes` z filtrem na `meal_types` (JSONB array)
- Kalkulacja różnicy kalorycznej dla każdego przepisu

**Rozwiązanie:**

- Indeks GIN na `recipes.meal_types`
- Indeks na `recipes.total_calories`
- LIMIT 10 (nie pobierać wszystkich)

```sql
CREATE INDEX idx_recipes_calories ON recipes(total_calories);
```

#### 3. PATCH /planned-meals/{id} - Wielokrotne round-tripy do DB

**Problem:**

- Pobranie oryginalnego posiłku
- Walidacja
- Update
- Pobranie zaktualizowanego posiłku

**Rozwiązanie:**

- Użyć transakcji (Supabase RPC lub pojedyncze zapytanie z RETURNING)
- Cache validation rules (np. lista `is_scalable` składników)

### 8.2. Strategie optymalizacji

#### Caching

- **TanStack Query** po stronie klienta:
  - `staleTime: 5 * 60 * 1000` (5 minut) dla GET /planned-meals
  - `staleTime: 10 * 60 * 1000` (10 minut) dla GET /replacements
- **Redis** (opcjonalnie, future enhancement):
  - Cache dla `recipes` (rzadko się zmieniają)
  - Cache dla `ingredients` (statyczne dane)

#### Database Query Optimization

- Użyć `select()` z konkretnymi polami
- Eager loading dla relacji (unikać N+1)
- Materialized view dla często używanych joinów (future enhancement)

#### Pagination

- GET /planned-meals: nie potrzebna (max 30 dni × 3 = 90 wierszy)
- GET /replacements: LIMIT 10 (wystarczająco)

#### Connection Pooling

- Supabase automatycznie zarządza connection pooling
- Max connections: domyślnie 15 dla Supabase Free tier

---

## 9. Kroki implementacji

### Krok 1: Przygotowanie struktury projektu

#### 1.1. Utworzenie folderów

```bash
mkdir -p app/api/planned-meals/[id]/replacements
mkdir -p lib/actions
mkdir -p lib/validation
```

**Struktura zgodna z wzorcem recipes:**

```
lib/actions/
  ├── planned-meals.ts     # Server Actions (główna logika)
  └── recipes.ts           # Istniejące (wzór)

app/api/
  ├── planned-meals/
  │   ├── route.ts         # GET /api/planned-meals
  │   └── [id]/
  │       ├── route.ts     # PATCH /api/planned-meals/{id}
  │       └── replacements/
  │           └── route.ts # GET /api/planned-meals/{id}/replacements
  └── recipes/
      └── [id]/
          └── route.ts     # Istniejące (wzór)

lib/validation/
  ├── planned-meals.ts     # Zod schemas
  └── recipes.ts           # Istniejące (wzór)
```

#### 1.2. Utworzenie typów DTO (jeśli jeszcze nie istnieją)

- Sprawdzić `src/types/dto.types.ts`
- Dodać typy dla `PlannedMealDTO`, `ReplacementRecipeDTO` jeśli brakuje
- Dodać typy dla odpowiedzi API (`ApiSuccessResponse`, `ApiErrorResponse`)

---

### Krok 2: Implementacja walidacji (Zod schemas)

**Plik:** `lib/validation/planned-meals.ts`

```typescript
import { z } from 'zod'

// GET /planned-meals query params
export const getPlannedMealsQuerySchema = z
  .object({
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format YYYY-MM-DD'),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format YYYY-MM-DD'),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      return end >= start
    },
    {
      message: 'end_date must be after or equal to start_date',
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.start_date)
      const end = new Date(data.end_date)
      const diffDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      )
      return diffDays <= 30
    },
    {
      message: 'Date range cannot exceed 30 days',
    }
  )

// PATCH /planned-meals body (discriminated union)
export const updatePlannedMealBodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('mark_eaten'),
    is_eaten: z.boolean(),
  }),
  z.object({
    action: z.literal('swap_recipe'),
    recipe_id: z.number().int().positive(),
  }),
  z.object({
    action: z.literal('modify_ingredients'),
    ingredient_overrides: z
      .array(
        z.object({
          ingredient_id: z.number().int().positive(),
          new_amount: z.number().positive(),
        })
      )
      .min(1, 'At least one ingredient override required'),
  }),
])

// Path param validation
export const mealIdSchema = z.coerce.number().int().positive()
```

---

### Krok 3: Implementacja Server Actions (logika biznesowa)

#### 3.1. Server Actions dla Planned Meals

**Plik:** `lib/actions/planned-meals.ts`

**Wzorowane na:** `lib/actions/recipes.ts`

````typescript
/**
 * Server Actions for Planned Meals API
 *
 * Implementuje logikę biznesową dla operacji na zaplanowanych posiłkach:
 * - GET /planned-meals (zakres dat + filtrowanie)
 * - PATCH /planned-meals/{id} (oznaczenie, wymiana, modyfikacja)
 * - GET /planned-meals/{id}/replacements (sugerowane zamienniki)
 *
 * @see .ai/10b01 api-planned-meals-implementation-plan.md
 */

'use server'

import { createAdminClient } from '@/lib/supabase/server'
import type {
  PlannedMealDTO,
  IngredientOverrides,
  ReplacementRecipeDTO,
} from '@/types/dto.types'
import {
  getPlannedMealsQuerySchema,
  updatePlannedMealBodySchema,
  type GetPlannedMealsInput,
  type UpdatePlannedMealInput,
} from '@/lib/validation/planned-meals'

/**
 * Standardowy typ wyniku Server Action (Discriminated Union)
 */
type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string }

/**
 * GET /planned-meals - Pobiera listę zaplanowanych posiłków w zakresie dat
 *
 * @param params - Parametry zapytania (start_date, end_date)
 * @returns Lista zaplanowanych posiłków z pełnymi szczegółami
 *
 * @example
 * ```typescript
 * const result = await getPlannedMeals({ start_date: '2024-01-01', end_date: '2024-01-07' })
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.data) // PlannedMealDTO[]
 * }
 * ```
 */
export async function getPlannedMeals(
  params: GetPlannedMealsInput
): Promise<ActionResult<PlannedMealDTO[]>> {
  try {
    // 1. Walidacja parametrów wejściowych
    const validated = getPlannedMealsQuerySchema.safeParse(params)
    if (!validated.success) {
      return {
        error: `Nieprawidłowe parametry zapytania: ${validated.error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`,
      }
    }

    const { start_date, end_date } = validated.data

    // 2. Utworzenie Supabase Admin client
    const supabase = createAdminClient()

    // 3. Pobranie user_id z sesji
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Uwierzytelnienie wymagane' }
    }

    // 4. Budowanie zapytania z pełnymi relacjami
    const { data, error } = await supabase
      .from('planned_meals')
      .select(
        `
        id,
        meal_date,
        meal_type,
        is_eaten,
        ingredient_overrides,
        created_at,
        recipe:recipes (
          id,
          name,
          instructions,
          meal_types,
          tags,
          image_url,
          total_calories,
          total_protein_g,
          total_carbs_g,
          total_fats_g,
          recipe_ingredients (
            base_amount,
            unit,
            is_scalable,
            calories,
            protein_g,
            carbs_g,
            fats_g,
            ingredient:ingredients (
              id,
              name,
              category
            )
          )
        )
      `
      )
      .eq('user_id', user.id)
      .gte('meal_date', start_date)
      .lte('meal_date', end_date)
      .order('meal_date', { ascending: true })
      .order('meal_type', { ascending: true })

    if (error) {
      console.error('Błąd Supabase w getPlannedMeals:', error)
      return { error: `Błąd bazy danych: ${error.message}` }
    }

    // 5. Transformacja do DTO
    const meals = (data || []).map(transformPlannedMealToDTO)

    return { data: meals }
  } catch (err) {
    console.error('Nieoczekiwany błąd w getPlannedMeals:', err)
    return { error: 'Wewnętrzny błąd serwera' }
  }
}

/**
 * PATCH /planned-meals/{id} - Aktualizuje pojedynczy zaplanowany posiłek
 *
 * @param mealId - ID zaplanowanego posiłku
 * @param updateData - Dane aktualizacji (discriminated union)
 * @returns Zaktualizowany zaplanowany posiłek
 *
 * @example
 * ```typescript
 * // Oznaczenie jako zjedzony
 * const result = await updatePlannedMeal(123, { action: 'mark_eaten', is_eaten: true })
 *
 * // Wymiana przepisu
 * const result = await updatePlannedMeal(123, { action: 'swap_recipe', recipe_id: 105 })
 *
 * // Modyfikacja składników
 * const result = await updatePlannedMeal(123, {
 *   action: 'modify_ingredients',
 *   ingredient_overrides: [{ ingredient_id: 12, new_amount: 150 }]
 * })
 * ```
 */
export async function updatePlannedMeal(
  mealId: number,
  updateData: UpdatePlannedMealInput
): Promise<ActionResult<PlannedMealDTO>> {
  try {
    // 1. Walidacja danych wejściowych
    const validated = updatePlannedMealBodySchema.safeParse(updateData)
    if (!validated.success) {
      return {
        error: `Nieprawidłowe dane aktualizacji: ${validated.error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`,
      }
    }

    // 2. Utworzenie Supabase Admin client
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('planned_meals')
      .select(`
        id,
        meal_date,
        meal_type,
        is_eaten,
        ingredient_overrides,
        created_at,
        recipe:recipes (
          id,
          name,
          image_url,
          instructions,
          meal_types,
          tags,
          total_calories,
          total_protein_g,
          total_carbs_g,
          total_fats_g,
          ingredients:recipe_ingredients (
            amount,
            ingredient:ingredients (
              id,
              name,
              unit,
              calories_per_100g,
              protein_per_100g,
              carbs_per_100g,
              fats_per_100g,
              category,
              is_scalable
            )
          )
        )
      `)
      .eq('user_id', userId)
      .gte('meal_date', startDate)
      .lte('meal_date', endDate)
      .order('meal_date', { ascending: true })
      .order('meal_type', { ascending: true });

    if (error) throw error;

    // Transformacja do PlannedMealDTO
    return this.transformToPlannedMealDTO(data);
  }

  /**
   * Oznacza posiłek jako zjedzony/niezjedzony
   */
  static async markMealAsEaten(
    userId: string,
    mealId: number,
    isEaten: boolean
  ): Promise<PlannedMealDTO> {
    const supabase = createClient();

    // Sprawdzenie własności
    const { data: existing, error: fetchError } = await supabase
      .from('planned_meals')
      .select('user_id')
      .eq('id', mealId)
      .single();

    if (fetchError) throw fetchError;
    if (!existing) throw new Error('Planned meal not found');
    if (existing.user_id !== userId) throw new Error('Forbidden');

    // Update
    const { data, error } = await supabase
      .from('planned_meals')
      .update({ is_eaten: isEaten })
      .eq('id', mealId)
      .select(`
        id,
        meal_date,
        meal_type,
        is_eaten,
        ingredient_overrides,
        created_at,
        updated_at,
        recipe:recipes (*)
      `)
      .single();

    if (error) throw error;

    return this.transformToPlannedMealDTO([data])[0];
  }

  /**
   * Wymienia przepis w posiłku
   */
  static async swapMealRecipe(
    userId: string,
    mealId: number,
    newRecipeId: number
  ): Promise<PlannedMealDTO> {
    const supabase = createClient();

    // 1. Pobranie oryginalnego posiłku
    const { data: originalMeal, error: fetchError } = await supabase
      .from('planned_meals')
      .select(`
        user_id,
        meal_type,
        recipe:recipes (
          id,
          total_calories
        )
      `)
      .eq('id', mealId)
      .single();

    if (fetchError) throw fetchError;
    if (!originalMeal) throw new Error('Planned meal not found');
    if (originalMeal.user_id !== userId) throw new Error('Forbidden');

    // 2. Pobranie nowego przepisu
    const { data: newRecipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id, meal_types, total_calories')
      .eq('id', newRecipeId)
      .single();

    if (recipeError || !newRecipe) throw new Error('Recipe not found');

    // 3. Walidacja meal_type
    if (!newRecipe.meal_types.includes(originalMeal.meal_type)) {
      throw new Error('Recipe meal_type does not match');
    }

    // 4. Walidacja różnicy kalorycznej (±15%)
    const originalCalories = originalMeal.recipe.total_calories || 0;
    const newCalories = newRecipe.total_calories || 0;
    const diffPercent = Math.abs((newCalories - originalCalories) / originalCalories) * 100;

    if (diffPercent > 15) {
      throw new Error(`Calorie difference (${diffPercent.toFixed(1)}%) exceeds ±15%`);
    }

    // 5. Update
    const { data, error } = await supabase
      .from('planned_meals')
      .update({
        recipe_id: newRecipeId,
        ingredient_overrides: null, // Reset nadpisań
      })
      .eq('id', mealId)
      .select(`
        id,
        meal_date,
        meal_type,
        is_eaten,
        ingredient_overrides,
        created_at,
        updated_at,
        recipe:recipes (*)
      `)
      .single();

    if (error) throw error;

    return this.transformToPlannedMealDTO([data])[0];
  }

  /**
   * Modyfikuje gramaturę składników w posiłku
   */
  static async modifyMealIngredients(
    userId: string,
    mealId: number,
    overrides: IngredientOverrides
  ): Promise<PlannedMealDTO> {
    const supabase = createClient();

    // 1. Pobranie posiłku z przepisem i składnikami
    const { data: meal, error: fetchError } = await supabase
      .from('planned_meals')
      .select(`
        user_id,
        recipe:recipes (
          id,
          recipe_ingredients (
            ingredient_id,
            amount,
            ingredient:ingredients (
              id,
              is_scalable
            )
          )
        )
      `)
      .eq('id', mealId)
      .single();

    if (fetchError) throw fetchError;
    if (!meal) throw new Error('Planned meal not found');
    if (meal.user_id !== userId) throw new Error('Forbidden');

    // 2. Walidacja każdego override
    for (const override of overrides) {
      const ingredient = meal.recipe.recipe_ingredients.find(
        (ri) => ri.ingredient_id === override.ingredient_id
      );

      if (!ingredient) {
        throw new Error(`Ingredient ${override.ingredient_id} not found in recipe`);
      }

      if (!ingredient.ingredient.is_scalable) {
        throw new Error(`Ingredient ${override.ingredient_id} is not scalable`);
      }

      // Walidacja zakresu ±10%
      const originalAmount = ingredient.amount;
      const diffPercent = Math.abs((override.new_amount - originalAmount) / originalAmount) * 100;

      if (diffPercent > 10) {
        throw new Error(
          `Amount change for ingredient ${override.ingredient_id} (${diffPercent.toFixed(1)}%) exceeds ±10%`
        );
      }
    }

    // 3. Update
    const { data, error } = await supabase
      .from('planned_meals')
      .update({ ingredient_overrides: overrides })
      .eq('id', mealId)
      .select(`
        id,
        meal_date,
        meal_type,
        is_eaten,
        ingredient_overrides,
        created_at,
        updated_at,
        recipe:recipes (*)
      `)
      .single();

    if (error) throw error;

    return this.transformToPlannedMealDTO([data])[0];
  }

  /**
   * Pobiera listę sugerowanych zamienników dla posiłku
   */
  static async getReplacementRecipes(
    userId: string,
    mealId: number
  ): Promise<ReplacementRecipeDTO[]> {
    const supabase = createClient();

    // 1. Pobranie oryginalnego posiłku
    const { data: meal, error: fetchError } = await supabase
      .from('planned_meals')
      .select(`
        user_id,
        meal_type,
        recipe:recipes (
          id,
          total_calories
        )
      `)
      .eq('id', mealId)
      .single();

    if (fetchError) throw fetchError;
    if (!meal) throw new Error('Planned meal not found');
    if (meal.user_id !== userId) throw new Error('Forbidden');

    // 2. Wyszukanie zamienników
    const originalCalories = meal.recipe.total_calories || 0;
    const minCalories = originalCalories * 0.85;
    const maxCalories = originalCalories * 1.15;

    const { data: replacements, error: searchError } = await supabase
      .from('recipes')
      .select('id, name, image_url, meal_types, total_calories, total_protein_g, total_carbs_g, total_fats_g')
      .contains('meal_types', [meal.meal_type])
      .neq('id', meal.recipe.id)
      .gte('total_calories', minCalories)
      .lte('total_calories', maxCalories)
      .order('total_calories', { ascending: true })
      .limit(10);

    if (searchError) throw searchError;

    // 3. Dodanie calorie_diff i sortowanie
    const replacementsWithDiff = replacements.map((recipe) => ({
      ...recipe,
      calorie_diff: (recipe.total_calories || 0) - originalCalories,
    }));

    replacementsWithDiff.sort((a, b) => Math.abs(a.calorie_diff) - Math.abs(b.calorie_diff));

    return replacementsWithDiff;
  }

  /**
   * Transformacja raw DB data do PlannedMealDTO
   */
  private static transformToPlannedMealDTO(data: any[]): PlannedMealDTO[] {
    // TODO: Implementacja transformacji
    // Mapowanie recipe_ingredients → ingredients
    // Kalkulacja wartości odżywczych z uwzględnieniem ingredient_overrides
    return data; // placeholder
  }
}
````

---

### Krok 4: Implementacja API Route Handlers

#### 4.1. GET /planned-meals

**Plik:** `app/api/planned-meals/route.ts`

**Wzorowany na:** `app/api/recipes/route.ts` (analogiczny wzorzec - Route Handler wywołuje Server Action)

```typescript
/**
 * API Route Handler for Planned Meals List
 *
 * Endpoint: GET /api/planned-meals?start_date={YYYY-MM-DD}&end_date={YYYY-MM-DD}
 *
 * Ten endpoint udostępnia logikę z Server Action `getPlannedMeals` jako
 * standardowy REST API.
 *
 * @see /lib/actions/planned-meals.ts
 * @see /.ai/10b01 api-planned-meals-implementation-plan.md
 */

import { getPlannedMeals } from '@/lib/actions/planned-meals'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // 1. Pobierz query params z URL
  const searchParams = request.nextUrl.searchParams
  const start_date = searchParams.get('start_date')
  const end_date = searchParams.get('end_date')

  // 2. Walidacja podstawowa (pełna walidacja w Server Action)
  if (!start_date || !end_date) {
    return NextResponse.json(
      { error: 'Parametry start_date i end_date są wymagane' },
      { status: 400 }
    )
  }

  // 3. Wywołaj istniejącą logikę z Server Action
  const result = await getPlannedMeals({ start_date, end_date })

  // 4. Zwróć odpowiedź w formacie JSON
  if (result.error) {
    // Określ kod statusu na podstawie typu błędu
    let status = 500
    if (result.error.includes('parametry')) status = 400
    if (result.error.includes('Uwierzytelnienie')) status = 401

    return NextResponse.json({ error: result.error }, { status })
  }

  return NextResponse.json(result.data)
}
```

#### 4.2. PATCH /planned-meals/[id]

**Plik:** `app/api/planned-meals/[id]/route.ts`

**Wzorowany na:** `app/api/recipes/[id]/route.ts` (analogiczny wzorzec)

```typescript
/**
 * API Route Handler for Single Planned Meal Update
 *
 * Endpoint: PATCH /api/planned-meals/{id}
 *
 * Ten endpoint udostępnia logikę z Server Action `updatePlannedMeal` jako
 * standardowy REST API.
 *
 * @see /lib/actions/planned-meals.ts
 * @see /.ai/10b01 api-planned-meals-implementation-plan.md
 */

import { updatePlannedMeal } from '@/lib/actions/planned-meals'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Pobierz ID z parametrów ścieżki i zwaliduj
  const id = parseInt(params.id, 10)
  if (isNaN(id) || id <= 0) {
    return NextResponse.json(
      { error: 'Nieprawidłowe ID posiłku' },
      { status: 400 }
    )
  }

  // 2. Pobierz body request
  const body = await request.json()

  // 3. Wywołaj istniejącą logikę z Server Action
  const result = await updatePlannedMeal(id, body)

  // 4. Zwróć odpowiedź w formacie JSON
  if (result.error) {
    // Określ kod statusu na podstawie typu błędu
    let status = 500
    if (result.error.includes('Nieprawidłowe')) status = 400
    if (result.error.includes('Uwierzytelnienie')) status = 401
    if (result.error.includes('nie został znaleziony')) status = 404
    if (result.error.includes('nie masz uprawnień')) status = 403

    return NextResponse.json({ error: result.error }, { status })
  }

  return NextResponse.json(result.data)
}
```

#### 4.3. GET /planned-meals/[id]/replacements

**Plik:** `app/api/planned-meals/[id]/replacements/route.ts`

**Wzorowany na:** `app/api/recipes/[id]/route.ts` (analogiczny wzorzec)

```typescript
/**
 * API Route Handler for Meal Replacements
 *
 * Endpoint: GET /api/planned-meals/{id}/replacements
 *
 * Ten endpoint udostępnia logikę z Server Action `getReplacementRecipes` jako
 * standardowy REST API.
 *
 * @see /lib/actions/planned-meals.ts
 * @see /.ai/10b01 api-planned-meals-implementation-plan.md
 */

import { getReplacementRecipes } from '@/lib/actions/planned-meals'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Pobierz ID z parametrów ścieżki i zwaliduj
  const id = parseInt(params.id, 10)
  if (isNaN(id) || id <= 0) {
    return NextResponse.json(
      { error: 'Nieprawidłowe ID posiłku' },
      { status: 400 }
    )
  }

  // 2. Wywołaj istniejącą logikę z Server Action
  const result = await getReplacementRecipes(id)

  // 3. Zwróć odpowiedź w formacie JSON
  if (result.error) {
    // Określ kod statusu na podstawie typu błędu
    let status = 500
    if (result.error.includes('Nieprawidłowe')) status = 400
    if (result.error.includes('Uwierzytelnienie')) status = 401
    if (result.error.includes('nie został znaleziony')) status = 404

    return NextResponse.json({ error: result.error }, { status })
  }

  return NextResponse.json(result.data)
}
```

---

### Krok 5: Implementacja RLS policies (jeśli jeszcze nie istnieją)

**Plik:** `supabase/migrations/YYYYMMDDHHMMSS_planned_meals_rls.sql`

```sql
-- Włącz RLS dla tabeli planned_meals
ALTER TABLE public.planned_meals ENABLE ROW LEVEL SECURITY;

-- Policy: Użytkownik może czytać tylko swoje posiłki
CREATE POLICY "Users can view their own planned meals"
  ON public.planned_meals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Użytkownik może aktualizować tylko swoje posiłki
CREATE POLICY "Users can update their own planned meals"
  ON public.planned_meals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Użytkownik nie może tworzyć posiłków przez API (tylko przez generator)
-- (Opcjonalnie, jeśli chcemy ograniczyć INSERT)

-- Policy: Użytkownik może usuwać tylko swoje posiłki (opcjonalnie)
CREATE POLICY "Users can delete their own planned meals"
  ON public.planned_meals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

---

### Krok 6: Utworzenie indeksów dla wydajności

**Plik:** `supabase/migrations/YYYYMMDDHHMMSS_planned_meals_indexes.sql`

```sql
-- Indeks na (user_id, meal_date) dla szybkiego filtrowania
CREATE INDEX IF NOT EXISTS idx_planned_meals_user_date
  ON public.planned_meals(user_id, meal_date);

-- Indeks na recipe_id dla joinów
CREATE INDEX IF NOT EXISTS idx_planned_meals_recipe
  ON public.planned_meals(recipe_id);

-- Indeks na recipe_ingredients(recipe_id) dla joinów
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe
  ON public.recipe_ingredients(recipe_id);

-- Indeks GIN na recipes.meal_types dla wyszukiwania zamienników
CREATE INDEX IF NOT EXISTS idx_recipes_meal_types
  ON public.recipes USING GIN(meal_types);

-- Indeks na recipes.total_calories dla filtrowania zamienników
CREATE INDEX IF NOT EXISTS idx_recipes_calories
  ON public.recipes(total_calories);
```

---

### Krok 7: Testy jednostkowe

#### 7.1. Testy dla MealPlanService

**Plik:** `services/meal-plan/__tests__/meal-plan.service.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MealPlanService } from '../meal-plan.service'

describe('MealPlanService', () => {
  describe('getPlannedMeals', () => {
    it('should return meals for given date range', async () => {
      // TODO: Mock Supabase client
      // TODO: Implementacja testu
    })

    it('should throw error if date range exceeds 30 days', async () => {
      // TODO: Implementacja testu
    })
  })

  describe('markMealAsEaten', () => {
    it('should mark meal as eaten', async () => {
      // TODO: Implementacja testu
    })

    it('should throw Forbidden error if meal belongs to another user', async () => {
      // TODO: Implementacja testu
    })
  })

  describe('swapMealRecipe', () => {
    it('should swap recipe if calorie difference ≤ 15%', async () => {
      // TODO: Implementacja testu
    })

    it('should throw error if calorie difference > 15%', async () => {
      // TODO: Implementacja testu
    })

    it('should throw error if meal_type does not match', async () => {
      // TODO: Implementacja testu
    })
  })

  describe('modifyMealIngredients', () => {
    it('should modify ingredient amounts if within ±10%', async () => {
      // TODO: Implementacja testu
    })

    it('should throw error if ingredient is not scalable', async () => {
      // TODO: Implementacja testu
    })

    it('should throw error if amount change > 10%', async () => {
      // TODO: Implementacja testu
    })
  })

  describe('getReplacementRecipes', () => {
    it('should return replacements sorted by calorie difference', async () => {
      // TODO: Implementacja testu
    })

    it('should return empty array if no suitable replacements found', async () => {
      // TODO: Implementacja testu
    })
  })
})
```

#### 7.2. Testy dla walidacji

**Plik:** `lib/validation/__tests__/planned-meals.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import {
  getPlannedMealsQuerySchema,
  updatePlannedMealBodySchema,
} from '../planned-meals'

describe('Planned Meals Validation', () => {
  describe('getPlannedMealsQuerySchema', () => {
    it('should validate correct date range', () => {
      const result = getPlannedMealsQuerySchema.safeParse({
        start_date: '2023-10-01',
        end_date: '2023-10-07',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid date format', () => {
      const result = getPlannedMealsQuerySchema.safeParse({
        start_date: '01-10-2023',
        end_date: '2023-10-07',
      })
      expect(result.success).toBe(false)
    })

    it('should reject end_date before start_date', () => {
      const result = getPlannedMealsQuerySchema.safeParse({
        start_date: '2023-10-07',
        end_date: '2023-10-01',
      })
      expect(result.success).toBe(false)
    })

    it('should reject date range > 30 days', () => {
      const result = getPlannedMealsQuerySchema.safeParse({
        start_date: '2023-10-01',
        end_date: '2023-11-05',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updatePlannedMealBodySchema', () => {
    it('should validate mark_eaten action', () => {
      const result = updatePlannedMealBodySchema.safeParse({
        action: 'mark_eaten',
        is_eaten: true,
      })
      expect(result.success).toBe(true)
    })

    it('should validate swap_recipe action', () => {
      const result = updatePlannedMealBodySchema.safeParse({
        action: 'swap_recipe',
        recipe_id: 105,
      })
      expect(result.success).toBe(true)
    })

    it('should validate modify_ingredients action', () => {
      const result = updatePlannedMealBodySchema.safeParse({
        action: 'modify_ingredients',
        ingredient_overrides: [{ ingredient_id: 12, new_amount: 150 }],
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid action', () => {
      const result = updatePlannedMealBodySchema.safeParse({
        action: 'invalid_action',
      })
      expect(result.success).toBe(false)
    })
  })
})
```

---

### Krok 8: Testy E2E (opcjonalnie)

**Plik:** `tests/e2e/planned-meals.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Planned Meals API', () => {
  test('GET /planned-meals should return meals for date range', async ({
    request,
  }) => {
    // TODO: Login i pobranie tokenu
    // TODO: Wywołanie API
    // TODO: Asercje
  })

  test('PATCH /planned-meals/{id} should mark meal as eaten', async ({
    request,
  }) => {
    // TODO: Implementacja testu
  })

  test('GET /planned-meals/{id}/replacements should return suggestions', async ({
    request,
  }) => {
    // TODO: Implementacja testu
  })
})
```

---

### Krok 9: Dokumentacja API (opcjonalnie - OpenAPI/Swagger)

**Plik:** `docs/api/planned-meals.yaml`

```yaml
openapi: 3.0.0
info:
  title: LowCarbPlaner API - Planned Meals
  version: 1.0.0

paths:
  /api/planned-meals:
    get:
      summary: Get planned meals
      parameters:
        - name: start_date
          in: query
          required: true
          schema:
            type: string
            format: date
        - name: end_date
          in: query
          required: true
          schema:
            type: string
            format: date
      responses:
        '200':
          description: Success
        '400':
          description: Bad Request
        '401':
          description: Unauthorized

  /api/planned-meals/{id}:
    patch:
      summary: Update planned meal
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      requestBody:
        content:
          application/json:
            schema:
              oneOf:
                - $ref: '#/components/schemas/MarkEatenCommand'
                - $ref: '#/components/schemas/SwapRecipeCommand'
                - $ref: '#/components/schemas/ModifyIngredientsCommand'
      responses:
        '200':
          description: Success
        '400':
          description: Bad Request
        '401':
          description: Unauthorized
        '403':
          description: Forbidden
        '404':
          description: Not Found

  /api/planned-meals/{id}/replacements:
    get:
      summary: Get replacement recipes
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Success
        '401':
          description: Unauthorized
        '403':
          description: Forbidden
        '404':
          description: Not Found

components:
  schemas:
    MarkEatenCommand:
      type: object
      properties:
        action:
          type: string
          enum: [mark_eaten]
        is_eaten:
          type: boolean

    SwapRecipeCommand:
      type: object
      properties:
        action:
          type: string
          enum: [swap_recipe]
        recipe_id:
          type: integer

    ModifyIngredientsCommand:
      type: object
      properties:
        action:
          type: string
          enum: [modify_ingredients]
        ingredient_overrides:
          type: array
          items:
            type: object
            properties:
              ingredient_id:
                type: integer
              new_amount:
                type: number
```

---

### Krok 10: Review i deployment

#### 10.1. Code Review Checklist

- [ ] Wszystkie typy TypeScript są poprawne
- [ ] RLS policies są włączone i przetestowane
- [ ] Walidacja Zod działa poprawnie
- [ ] Obsługa błędów jest kompletna
- [ ] Testy jednostkowe przechodzą
- [ ] Indeksy bazy danych są utworzone
- [ ] Dokumentacja API jest aktualna

#### 10.2. Testing Checklist

- [ ] Unit tests dla MealPlanService (>80% coverage)
- [ ] Unit tests dla walidacji (100% coverage)
- [ ] E2E tests dla happy path
- [ ] E2E tests dla error scenarios
- [ ] Manual testing w Postman/Insomnia

#### 10.3. Deployment Steps

1. Push migracji do Supabase Production

   ```bash
   npx supabase db push --linked
   ```

2. Deploy aplikacji Next.js na Cloudflare Pages

   ```bash
   npm run build
   npm run deploy
   ```

3. Monitoring i logowanie
   - Sprawdzić logi błędów w `error_logs` table
   - Monitorować performance (Supabase Dashboard)
   - Ustawić alerty dla błędów 500

---

## 10. Podsumowanie

Ten plan implementacji pokrywa wszystkie aspekty tworzenia trzech endpointów API dla zasobu **Planned Meals**:

### Kluczowe punkty:

✅ **Uwierzytelnianie i autoryzacja** - RLS policies + Supabase Auth
✅ **Walidacja danych** - Zod schemas z szczegółowymi regułami
✅ **Obsługa błędów** - Standardowe kody statusu + szczegółowe komunikaty
✅ **Wydajność** - Indeksy bazy danych + query optimization
✅ **Bezpieczeństwo** - SQL injection protection + rate limiting
✅ **Testowanie** - Unit tests + E2E tests
✅ **Dokumentacja** - OpenAPI spec + inline comments

### Kolejność implementacji (priority):

1. ✅ Walidacja (Zod schemas) - **MUST HAVE**
2. ✅ RLS policies - **MUST HAVE**
3. ✅ Server Actions (główna logika biznesowa) - **MUST HAVE**
4. ✅ API Route Handlers (wystawienie REST API) - **MUST HAVE**
5. ⚠️ Testy jednostkowe - **SHOULD HAVE**
6. ⏳ Indeksy bazy danych - **SHOULD HAVE**
7. ⏳ E2E tests - **NICE TO HAVE**
8. ⏳ OpenAPI docs - **NICE TO HAVE**

---

**Następne kroki (zgodne ze wzorcem recipes.ts):**

1. Rozpocznij od implementacji walidacji (Krok 2) - `lib/validation/planned-meals.ts`
2. Następnie RLS policies (Krok 5) - migracja Supabase
3. Implementuj Server Actions (Krok 3) - `lib/actions/planned-meals.ts` (GŁÓWNA LOGIKA)
4. Dodaj API Route Handlers (Krok 4) - `app/api/planned-meals/**/route.ts` (CIENKA WARSTWA)
5. Testy w ostatniej kolejności (Krok 7-8)

**Kluczowa różnica w architekturze:**

- **Server Actions (`lib/actions/planned-meals.ts`)** - zawiera CAŁĄ logikę biznesową, może być używana bezpośrednio z Server Components
- **API Route Handlers (`app/api/planned-meals/**/route.ts`)\*\* - CIENKA warstwa, która tylko wywołuje Server Actions i obsługuje HTTP response
