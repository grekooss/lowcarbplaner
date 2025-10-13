# API Endpoint Implementation Plan: Profile Resource

## 1. Przegląd punktów końcowych

Zasób Profile obejmuje zarządzanie profilami użytkowników w aplikacji LowCarbPlaner. Składa się z czterech endpointów REST API:

1. **POST /api/profile** - Tworzenie profilu użytkownika po zakończeniu onboardingu (wykonywane jednorazowo)
2. **GET /api/profile/me** - Pobieranie profilu zalogowanego użytkownika
3. **PATCH /api/profile/me** - Aktualizacja danych profilowych użytkownika z przeliczeniem celów żywieniowych
4. **POST /api/profile/me/generate-plan** - Uruchomienie generowania 7-dniowego planu posiłków

Endpointy realizują kluczowe funkcjonalności MVP: onboarding z kalkulatorem BMR/TDEE, zarządzanie profilem i automatyczne generowanie planów posiłków zgodnych z celami żywieniowymi użytkownika.

---

## 2. Szczegóły żądań

### 2.1. POST /api/profile

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/profile`
- **Autentykacja**: Wymagana (Supabase Auth token)
- **Content-Type**: `application/json`

**Parametry (Request Body)**:

| Pole                       | Typ    | Wymagane    | Opis                           | Walidacja                                                  |
| -------------------------- | ------ | ----------- | ------------------------------ | ---------------------------------------------------------- |
| `gender`                   | string | Tak         | Płeć użytkownika               | enum: ['male', 'female']                                   |
| `age`                      | number | Tak         | Wiek użytkownika               | int, min: 18, max: 100                                     |
| `weight_kg`                | number | Tak         | Waga w kilogramach             | min: 40, max: 300                                          |
| `height_cm`                | number | Tak         | Wzrost w centymetrach          | min: 140, max: 250                                         |
| `activity_level`           | string | Tak         | Poziom aktywności              | enum: ['very_low', 'low', 'moderate', 'high', 'very_high'] |
| `goal`                     | string | Tak         | Cel dietetyczny                | enum: ['weight_loss', 'weight_maintenance']                |
| `weight_loss_rate_kg_week` | number | Warunkowo\* | Tempo utraty wagi (kg/tydzień) | min: 0.25, max: 1.0 (wymagane gdy goal='weight_loss')      |
| `disclaimer_accepted_at`   | string | Tak         | Data akceptacji disclaimera    | ISO 8601 datetime                                          |

**Przykład żądania**:

```json
{
  "gender": "female",
  "age": 30,
  "weight_kg": 70.5,
  "height_cm": 165,
  "activity_level": "moderate",
  "goal": "weight_loss",
  "weight_loss_rate_kg_week": 0.5,
  "disclaimer_accepted_at": "2023-10-27T10:00:00Z"
}
```

---

### 2.2. GET /api/profile/me

- **Metoda HTTP**: GET
- **Struktura URL**: `/api/profile/me`
- **Autentykacja**: Wymagana (Supabase Auth token)
- **Parametry**: Brak (user_id pobierany z tokena autentykacji)

---

### 2.3. PATCH /api/profile/me

- **Metoda HTTP**: PATCH
- **Struktura URL**: `/api/profile/me`
- **Autentykacja**: Wymagana (Supabase Auth token)
- **Content-Type**: `application/json`

**Parametry (Request Body)** - wszystkie opcjonalne:

| Pole                       | Typ    | Opis                  | Walidacja                                                  |
| -------------------------- | ------ | --------------------- | ---------------------------------------------------------- |
| `gender`                   | string | Płeć użytkownika      | enum: ['male', 'female']                                   |
| `age`                      | number | Wiek użytkownika      | int, min: 18, max: 100                                     |
| `weight_kg`                | number | Waga w kilogramach    | min: 40, max: 300                                          |
| `height_cm`                | number | Wzrost w centymetrach | min: 140, max: 250                                         |
| `activity_level`           | string | Poziom aktywności     | enum: ['very_low', 'low', 'moderate', 'high', 'very_high'] |
| `goal`                     | string | Cel dietetyczny       | enum: ['weight_loss', 'weight_maintenance']                |
| `weight_loss_rate_kg_week` | number | Tempo utraty wagi     | min: 0.25, max: 1.0                                        |

**Przykład żądania**:

```json
{
  "weight_kg": 69.0,
  "activity_level": "high"
}
```

---

### 2.4. POST /api/profile/me/generate-plan

- **Metoda HTTP**: POST
- **Struktura URL**: `/api/profile/me/generate-plan`
- **Autentykacja**: Wymagana (Supabase Auth token)
- **Parametry**: Brak (user_id pobierany z tokena, parametry z profilu)

---

## 3. Wykorzystywane typy

### 3.1. Typy istniejące (src/types/dto.types.ts)

```typescript
// Command Model dla POST /api/profile
export type OnboardingCommand = Pick<
  TablesInsert<'profiles'>,
  | 'gender'
  | 'age'
  | 'weight_kg'
  | 'height_cm'
  | 'activity_level'
  | 'goal'
  | 'weight_loss_rate_kg_week'
>

// DTO dla odpowiedzi POST /api/profile (z obliczonymi celami)
export type OnboardingResultDTO = Pick<
  Tables<'profiles'>,
  'target_calories' | 'target_protein_g' | 'target_carbs_g' | 'target_fats_g'
>

// DTO dla GET /api/profile/me i PATCH /api/profile/me
export type ProfileDTO = Omit<
  Tables<'profiles'>,
  'id' | 'created_at' | 'updated_at'
>

// Command Model dla PATCH /api/profile/me
export type UpdateProfileCommand = Pick<
  TablesUpdate<'profiles'>,
  | 'gender'
  | 'age'
  | 'weight_kg'
  | 'height_cm'
  | 'activity_level'
  | 'goal'
  | 'weight_loss_rate_kg_week'
>
```

### 3.2. Typy do dodania (src/types/dto.types.ts)

```typescript
/**
 * DTO: Odpowiedź dla POST /api/profile
 * Zawiera pełny profil użytkownika z obliczonymi celami żywieniowymi
 */
export type CreateProfileResponseDTO = {
  id: string
  email: string
  gender: Enums<'gender_enum'>
  age: number
  weight_kg: number
  height_cm: number
  activity_level: Enums<'activity_level_enum'>
  goal: Enums<'goal_enum'>
  weight_loss_rate_kg_week: number | null
  disclaimer_accepted_at: string
  target_calories: number
  target_carbs_g: number
  target_protein_g: number
  target_fats_g: number
  created_at: string
  updated_at: string
}

/**
 * DTO: Odpowiedź dla POST /api/profile/me/generate-plan
 */
export type GeneratePlanResponseDTO = {
  status: 'success' | 'error'
  message: string
  generated_days: number
}

/**
 * Command Model rozszerzony dla POST /api/profile
 * (dodano disclaimer_accepted_at)
 */
export type CreateProfileCommand = OnboardingCommand & {
  disclaimer_accepted_at: string
}
```

---

## 4. Szczegóły odpowiedzi

### 4.1. POST /api/profile

**Sukces (201 Created)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "gender": "female",
  "age": 30,
  "weight_kg": 70.5,
  "height_cm": 165,
  "activity_level": "moderate",
  "goal": "weight_loss",
  "weight_loss_rate_kg_week": 0.5,
  "disclaimer_accepted_at": "2023-10-27T10:00:00Z",
  "target_calories": 1800,
  "target_carbs_g": 68,
  "target_protein_g": 158,
  "target_fats_g": 100,
  "created_at": "2023-10-27T10:05:23Z",
  "updated_at": "2023-10-27T10:05:23Z"
}
```

**Błędy**:

- `400 Bad Request`: Nieprawidłowe dane wejściowe lub kalorie poniżej minimum

  ```json
  {
    "error": {
      "message": "Obliczone kalorie (1350 kcal) są poniżej bezpiecznego minimum dla kobiet (1400 kcal). Wybierz mniejszy deficyt kaloryczny.",
      "code": "CALORIES_BELOW_MINIMUM",
      "details": {
        "calculated_calories": 1350,
        "minimum_calories": 1400,
        "gender": "female"
      }
    }
  }
  ```

- `401 Unauthorized`: Brak lub nieprawidłowy token autentykacji

  ```json
  {
    "error": {
      "message": "Unauthorized. Please log in.",
      "code": "UNAUTHORIZED"
    }
  }
  ```

- `409 Conflict`: Profil już istnieje dla danego użytkownika

  ```json
  {
    "error": {
      "message": "Profile already exists for this user.",
      "code": "PROFILE_ALREADY_EXISTS"
    }
  }
  ```

- `500 Internal Server Error`: Błąd serwera
  ```json
  {
    "error": {
      "message": "Internal server error occurred.",
      "code": "INTERNAL_ERROR"
    }
  }
  ```

---

### 4.2. GET /api/profile/me

**Sukces (200 OK)**:

```json
{
  "email": "user@example.com",
  "gender": "female",
  "age": 30,
  "weight_kg": 70.5,
  "height_cm": 165,
  "activity_level": "moderate",
  "goal": "weight_loss",
  "weight_loss_rate_kg_week": 0.5,
  "disclaimer_accepted_at": "2023-10-27T10:00:00Z",
  "target_calories": 1800,
  "target_carbs_g": 68,
  "target_protein_g": 158,
  "target_fats_g": 100
}
```

**Błędy**:

- `401 Unauthorized`: Nieautoryzowany dostęp
- `404 Not Found`: Profil nie istnieje
- `500 Internal Server Error`: Błąd serwera

---

### 4.3. PATCH /api/profile/me

**Sukces (200 OK)**: Zaktualizowany pełny profil (struktura jak w GET /api/profile/me)

**Błędy**:

- `400 Bad Request`: Nieprawidłowe dane wejściowe
- `401 Unauthorized`: Nieautoryzowany dostęp
- `404 Not Found`: Profil nie istnieje
- `500 Internal Server Error`: Błąd serwera

---

### 4.4. POST /api/profile/me/generate-plan

**Sukces (200 OK)** - operacja synchroniczna:

```json
{
  "status": "success",
  "message": "Meal plan generation started successfully.",
  "generated_days": 7
}
```

**Sukces (202 Accepted)** - operacja asynchroniczna:

```json
{
  "status": "success",
  "message": "Meal plan generation started successfully.",
  "generated_days": 0
}
```

**Błędy**:

- `401 Unauthorized`: Nieautoryzowany dostęp
- `404 Not Found`: Profil nie istnieje
- `409 Conflict`: Plan już istnieje i jest kompletny
  ```json
  {
    "error": {
      "message": "Meal plan for the next 7 days already exists and is complete.",
      "code": "MEAL_PLAN_EXISTS"
    }
  }
  ```
- `500 Internal Server Error`: Błąd generatora

---

## 5. Przepływ danych

### 5.1. POST /api/profile

```
1. Żądanie HTTP → Next.js API Route Handler (app/api/profile/route.ts)
2. Weryfikacja tokena autentykacji (Supabase Auth)
3. Walidacja danych wejściowych (Zod schema)
4. Sprawdzenie czy profil już istnieje (Supabase query)
5. Obliczenie BMR i TDEE (NutritionCalculator service)
6. Walidacja minimum kalorycznego (1400 K / 1600 M)
7. Obliczenie rozkładu makroskładników (15% C, 35% P, 50% F)
8. Zapis profilu do bazy danych (Supabase insert)
9. Zwrócenie odpowiedzi 201 Created z pełnym profilem
```

**Interakcje z bazą danych**:

- **SELECT**: Sprawdzenie czy profil istnieje (`profiles` WHERE user_id = auth.uid())
- **INSERT**: Utworzenie nowego profilu (`profiles`)

**Wykorzystywane serwisy**:

- `src/services/nutrition-calculator.ts`:
  - `calculateBMR(gender, age, weight_kg, height_cm)` - wzór Mifflin-St Jeor
  - `calculateTDEE(bmr, activity_level)` - TDEE = BMR × współczynnik aktywności
  - `applyGoalAdjustment(tdee, goal, weight_loss_rate)` - deficyt kaloryczny
  - `calculateMacros(calories)` - rozkład makroskładników
  - `validateMinimumCalories(calories, gender)` - walidacja minimum

---

### 5.2. GET /api/profile/me

```
1. Żądanie HTTP → Next.js API Route Handler (app/api/profile/me/route.ts)
2. Weryfikacja tokena autentykacji (Supabase Auth)
3. Pobranie profilu z bazy danych (Supabase query)
4. Zwrócenie odpowiedzi 200 OK z profilem
```

**Interakcje z bazą danych**:

- **SELECT**: Pobranie profilu (`profiles` WHERE user_id = auth.uid())

---

### 5.3. PATCH /api/profile/me

```
1. Żądanie HTTP → Next.js API Route Handler (app/api/profile/me/route.ts)
2. Weryfikacja tokena autentykacji (Supabase Auth)
3. Walidacja danych wejściowych (Zod schema, partial)
4. Pobranie aktualnego profilu (Supabase query)
5. Merge danych (aktualne + nowe)
6. Przeliczenie celów żywieniowych (NutritionCalculator service)
7. Walidacja minimum kalorycznego
8. Aktualizacja profilu w bazie danych (Supabase update)
9. Zwrócenie odpowiedzi 200 OK z zaktualizowanym profilem
```

**Interakcje z bazą danych**:

- **SELECT**: Pobranie aktualnego profilu
- **UPDATE**: Aktualizacja profilu z nowymi wartościami

**Wykorzystywane serwisy**:

- `src/services/nutrition-calculator.ts` (jak w POST /api/profile)

---

### 5.4. POST /api/profile/me/generate-plan

```
1. Żądanie HTTP → Next.js API Route Handler (app/api/profile/me/generate-plan/route.ts)
2. Weryfikacja tokena autentykacji (Supabase Auth)
3. Pobranie profilu użytkownika (Supabase query)
4. Sprawdzenie czy plan już istnieje (Supabase query)
5. Wywołanie generatora planu posiłków (MealPlanGenerator service)
6. Zapis planu do bazy danych (Supabase insert do planned_meals)
7. Zwrócenie odpowiedzi 200 OK / 202 Accepted
```

**Interakcje z bazą danych**:

- **SELECT**: Pobranie profilu użytkownika
- **SELECT**: Sprawdzenie istniejącego planu (`planned_meals` WHERE user_id = auth.uid() AND meal_date >= today AND meal_date <= today+7)
- **SELECT**: Pobranie dostępnych przepisów zgodnych z celami użytkownika
- **INSERT**: Utworzenie 21 wpisów w `planned_meals` (7 dni × 3 posiłki)

**Wykorzystywane serwisy**:

- `src/services/meal-plan-generator.ts`:
  - `generateWeeklyPlan(userProfile)` - generowanie 7-dniowego planu
  - Logika doboru przepisów zgodnych z celami kalorycznymi i makro
  - Zapewnienie różnorodności (brak powtórzeń w tym samym dniu)

---

## 6. Względy bezpieczeństwa

### 6.1. Autentykacja i autoryzacja

**Wszystkie endpointy wymagają autentykacji**:

```typescript
// app/api/profile/route.ts
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
      { status: 401 }
    )
  }

  // Dalsze przetwarzanie...
}
```

**Row Level Security (RLS)**:

- Tabela `profiles` musi mieć włączony RLS
- Polityki RLS dla `profiles`:

  ```sql
  -- Użytkownik może odczytać tylko swój profil
  CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

  -- Użytkownik może utworzyć tylko swój profil
  CREATE POLICY "Users can create their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

  -- Użytkownik może aktualizować tylko swój profil
  CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  ```

---

### 6.2. Walidacja danych wejściowych

**Zod schemas** (`src/lib/validation/profile.ts`):

```typescript
import { z } from 'zod'

// Schema dla POST /api/profile
export const createProfileSchema = z
  .object({
    gender: z.enum(['male', 'female'], {
      required_error: 'Gender is required',
      invalid_type_error: 'Gender must be male or female',
    }),
    age: z
      .number()
      .int('Age must be an integer')
      .min(18, 'Age must be at least 18')
      .max(100, 'Age must be at most 100'),
    weight_kg: z
      .number()
      .min(40, 'Weight must be at least 40 kg')
      .max(300, 'Weight must be at most 300 kg'),
    height_cm: z
      .number()
      .min(140, 'Height must be at least 140 cm')
      .max(250, 'Height must be at most 250 cm'),
    activity_level: z.enum([
      'very_low',
      'low',
      'moderate',
      'high',
      'very_high',
    ]),
    goal: z.enum(['weight_loss', 'weight_maintenance']),
    weight_loss_rate_kg_week: z
      .number()
      .min(0.25, 'Weight loss rate must be at least 0.25 kg/week')
      .max(1.0, 'Weight loss rate must be at most 1.0 kg/week')
      .optional(),
    disclaimer_accepted_at: z.string().datetime('Invalid datetime format'),
  })
  .refine(
    (data) => {
      if (data.goal === 'weight_loss' && !data.weight_loss_rate_kg_week) {
        return false
      }
      return true
    },
    {
      message: 'Weight loss rate is required when goal is weight_loss',
      path: ['weight_loss_rate_kg_week'],
    }
  )

// Schema dla PATCH /api/profile/me (wszystkie pola opcjonalne)
export const updateProfileSchema = createProfileSchema.partial().omit({
  disclaimer_accepted_at: true,
})
```

**Użycie w API route**:

```typescript
const body = await request.json()
const validated = createProfileSchema.safeParse(body)

if (!validated.success) {
  return NextResponse.json(
    {
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validated.error.format(),
      },
    },
    { status: 400 }
  )
}
```

---

### 6.3. Bezpieczeństwo kluczy API

- **NIGDY nie używać Service Role Key na kliencie**
- Klucze w `.env.local` (wykluczony w `.gitignore`)
- Użycie `createClient()` z `@/lib/supabase/server` w API routes (automatycznie używa prawidłowych kluczy)

---

### 6.4. Rate Limiting

**Szczególnie ważne dla POST /api/profile/me/generate-plan** (kosztowna operacja):

```typescript
// Implementacja rate limiting (opcjonalnie z użyciem Redis lub Upstash)
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '1 h'), // 3 żądania na godzinę
})

export async function POST(request: Request) {
  const identifier = user.id // z tokena autentykacji
  const { success } = await ratelimit.limit(identifier)

  if (!success) {
    return NextResponse.json(
      { error: { message: 'Rate limit exceeded', code: 'RATE_LIMIT' } },
      { status: 429 }
    )
  }

  // Dalsze przetwarzanie...
}
```

---

### 6.5. Input Sanitization

- Zod waliduje typy i zakresy
- Supabase client automatycznie zabezpiecza przed SQL Injection
- Dla `disclaimer_accepted_at` używamy `z.string().datetime()` (ISO 8601)

---

### 6.6. CORS

Next.js domyślnie nie włącza CORS dla API routes. Jeśli konieczne (np. dla zewnętrznych klientów):

```typescript
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

---

## 7. Obsługa błędów

### 7.1. Standardowy format odpowiedzi błędu

```typescript
type ApiErrorResponse = {
  error: {
    message: string
    code: string
    details?: unknown
  }
}
```

---

### 7.2. Kody błędów i scenariusze

| Kod HTTP | Kod błędu                | Scenariusz                                    | Komunikat                                           |
| -------- | ------------------------ | --------------------------------------------- | --------------------------------------------------- |
| 400      | `VALIDATION_ERROR`       | Nieprawidłowe dane wejściowe                  | "Validation failed" + szczegóły                     |
| 400      | `CALORIES_BELOW_MINIMUM` | Kalorie poniżej minimum                       | "Obliczone kalorie są poniżej bezpiecznego minimum" |
| 401      | `UNAUTHORIZED`           | Brak tokena lub nieprawidłowy token           | "Unauthorized. Please log in."                      |
| 404      | `PROFILE_NOT_FOUND`      | Profil nie istnieje (GET/PATCH/generate-plan) | "Profile not found."                                |
| 409      | `PROFILE_ALREADY_EXISTS` | Profil już istnieje (POST)                    | "Profile already exists for this user."             |
| 409      | `MEAL_PLAN_EXISTS`       | Plan już istnieje (generate-plan)             | "Meal plan already exists and is complete."         |
| 500      | `INTERNAL_ERROR`         | Błąd serwera, bazy danych                     | "Internal server error occurred."                   |
| 500      | `MEAL_GENERATOR_ERROR`   | Błąd generatora planów                        | "Meal plan generation failed."                      |

---

### 7.3. Implementacja error handlera

```typescript
// src/lib/utils/api-error-handler.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      },
      { status: error.statusCode }
    )
  }

  // Nieoczekiwane błędy
  return NextResponse.json(
    {
      error: {
        message: 'Internal server error occurred.',
        code: 'INTERNAL_ERROR',
      },
    },
    { status: 500 }
  )
}
```

**Użycie w API route**:

```typescript
try {
  // Logika endpointa...
} catch (error) {
  return handleApiError(error)
}
```

---

### 7.4. Logowanie błędów

```typescript
// Logowanie do konsoli (development)
console.error('[API Error]', {
  endpoint: '/api/profile',
  method: 'POST',
  user_id: user?.id,
  error: error instanceof Error ? error.message : error,
  stack: error instanceof Error ? error.stack : undefined,
})

// W produkcji: integracja z Sentry, LogRocket, etc.
```

---

## 8. Rozważania dotyczące wydajności

### 8.1. Optymalizacja zapytań do bazy danych

**Indeksy** (w migracji bazy danych):

```sql
-- Indeks na profiles.id (już istnieje jako PRIMARY KEY)
CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);

-- Indeks na planned_meals dla generate-plan
CREATE INDEX IF NOT EXISTS planned_meals_user_date_idx
  ON public.planned_meals(user_id, meal_date);
```

**Selective SELECT**:

```typescript
// ❌ Unikaj
const { data } = await supabase.from('profiles').select('*')

// ✅ Wybierz tylko potrzebne kolumny
const { data } = await supabase
  .from('profiles')
  .select(
    'id, email, target_calories, target_protein_g, target_carbs_g, target_fats_g'
  )
  .eq('id', userId)
  .single()
```

---

### 8.2. Caching

**GET /api/profile/me** - dane profilowe rzadko się zmieniają:

```typescript
// Cache w TanStack Query (klient)
export const useProfileQuery = () => {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const response = await fetch('/api/profile/me')
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minut
    cacheTime: 10 * 60 * 1000, // 10 minut
  })
}
```

**Cache-Control headers** (opcjonalnie dla GET):

```typescript
return NextResponse.json(data, {
  status: 200,
  headers: {
    'Cache-Control': 'private, max-age=300', // 5 minut
  },
})
```

---

### 8.3. Optymalizacja NutritionCalculator

**Memoizacja** dla powtarzalnych obliczeń:

```typescript
// src/services/nutrition-calculator.ts
import memoize from 'lodash/memoize'

const calculateBMRMemoized = memoize(
  (gender: string, age: number, weight: number, height: number) => {
    // Wzór Mifflin-St Jeor
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161
    }
  },
  // Cache key
  (gender, age, weight, height) => `${gender}-${age}-${weight}-${height}`
)
```

---

### 8.4. Optymalizacja MealPlanGenerator

**POST /api/profile/me/generate-plan** - kosztowna operacja:

1. **Operacja asynchroniczna** (background job):

   ```typescript
   // Opcja 1: Next.js Background Jobs (experimentalne)
   // Opcja 2: Supabase Edge Functions
   // Opcja 3: Queue system (BullMQ + Redis)

   // Zwróć 202 Accepted od razu
   return NextResponse.json(
     {
       status: 'success',
       message: 'Meal plan generation started.',
       generated_days: 0,
     },
     { status: 202 }
   )
   ```

2. **Batch insert** zamiast pojedynczych insertów:

   ```typescript
   // ✅ Jeden insert z 21 rekordami
   const { data, error } = await supabase.from('planned_meals').insert(allMeals) // array[21]

   // ❌ Unikaj 21 pojedynczych insertów
   for (const meal of allMeals) {
     await supabase.from('planned_meals').insert(meal)
   }
   ```

3. **Limit concurrent queries** przy pobieraniu przepisów:

   ```typescript
   import pLimit from 'p-limit'

   const limit = pLimit(5) // Maksymalnie 5 równoczesnych zapytań
   const recipes = await Promise.all(
     recipeIds.map((id) => limit(() => fetchRecipe(id)))
   )
   ```

---

### 8.5. Monitoring wydajności

```typescript
// Middleware do logowania czasu wykonania
const startTime = Date.now()

// ... logika endpointa

const duration = Date.now() - startTime
console.log(`[Performance] POST /api/profile - ${duration}ms`)

// Alerty jeśli przekroczono threshold (np. >2000ms)
if (duration > 2000) {
  console.warn(`[Performance Warning] Slow endpoint: ${duration}ms`)
}
```

---

## 9. Etapy wdrożenia

### Krok 1: Przygotowanie struktury projektu

1.1. Utworzenie struktury katalogów:

```bash
mkdir -p app/api/profile/me/generate-plan
mkdir -p src/lib/validation
mkdir -p src/services
```

1.2. Utworzenie plików route handlers:

```bash
touch app/api/profile/route.ts
touch app/api/profile/me/route.ts
touch app/api/profile/me/generate-plan/route.ts
```

1.3. Utworzenie plików serwisów:

```bash
touch src/services/nutrition-calculator.ts
touch src/services/meal-plan-generator.ts
```

1.4. Utworzenie pliku walidacji:

```bash
touch src/lib/validation/profile.ts
```

---

### Krok 2: Implementacja walidacji (Zod schemas)

2.1. Implementacja `src/lib/validation/profile.ts`:

- `createProfileSchema` - pełna walidacja dla POST
- `updateProfileSchema` - partial dla PATCH
- Dodanie custom refinements (np. weight_loss_rate_kg_week wymagane gdy goal='weight_loss')

  2.2. Testy jednostkowe dla schematów:

```bash
touch src/lib/validation/__tests__/profile.test.ts
```

---

### Krok 3: Implementacja NutritionCalculator service

3.1. Implementacja `src/services/nutrition-calculator.ts`:

- `calculateBMR(gender, age, weight_kg, height_cm)` - wzór Mifflin-St Jeor
- `calculateTDEE(bmr, activity_level)` - BMR × współczynnik aktywności
- `applyGoalAdjustment(tdee, goal, weight_loss_rate)` - deficyt kaloryczny
- `calculateMacros(calories)` - rozkład 15% C, 35% P, 50% F
- `validateMinimumCalories(calories, gender)` - 1400 K / 1600 M
- `calculateNutritionTargets(command)` - funkcja fasadowa

  3.2. Testy jednostkowe dla kalkulatora:

```bash
touch src/services/__tests__/nutrition-calculator.test.ts
```

Scenariusze testowe:

- Obliczanie BMR dla kobiety i mężczyzny
- Wszystkie poziomy aktywności
- Walidacja minimum kalorycznego
- Rozkład makroskładników
- Edge cases (wiek 18, 100; waga 40, 300)

---

### Krok 4: Rozszerzenie typów DTO

4.1. Dodanie nowych typów w `src/types/dto.types.ts`:

- `CreateProfileCommand` (OnboardingCommand + disclaimer_accepted_at)
- `CreateProfileResponseDTO` (pełny profil z celami)
- `GeneratePlanResponseDTO` (status, message, generated_days)

---

### Krok 5: Implementacja POST /api/profile

5.1. Implementacja `app/api/profile/route.ts`:

- Export funkcji `POST(request: Request)`
- Weryfikacja autentykacji (Supabase Auth)
- Parsowanie i walidacja żądania (Zod)
- Sprawdzenie czy profil już istnieje
- Wywołanie NutritionCalculator
- Zapis do bazy danych
- Zwrot odpowiedzi 201 Created
- Obsługa błędów (400, 401, 409, 500)

  5.2. Testy integracyjne:

```bash
touch app/api/profile/__tests__/route.test.ts
```

---

### Krok 6: Implementacja GET /api/profile/me

6.1. Implementacja `app/api/profile/me/route.ts`:

- Export funkcji `GET(request: Request)`
- Weryfikacja autentykacji
- Pobranie profilu z bazy danych
- Zwrot odpowiedzi 200 OK
- Obsługa błędów (401, 404, 500)

  6.2. Testy integracyjne

---

### Krok 7: Implementacja PATCH /api/profile/me

7.1. Rozszerzenie `app/api/profile/me/route.ts`:

- Export funkcji `PATCH(request: Request)`
- Weryfikacja autentykacji
- Parsowanie i walidacja żądania (partial schema)
- Pobranie aktualnego profilu
- Merge danych
- Przeliczenie celów żywieniowych
- Aktualizacja w bazie danych
- Zwrot odpowiedzi 200 OK
- Obsługa błędów (400, 401, 404, 500)

  7.2. Testy integracyjne

---

### Krok 8: Implementacja MealPlanGenerator service

8.1. Implementacja `src/services/meal-plan-generator.ts`:

- `generateWeeklyPlan(userProfile, startDate)` - główna funkcja
- `selectRecipesForDay(targetCalories, mealType)` - dobór przepisów
- `ensureVariety(selectedRecipes)` - unikanie powtórzeń
- `createPlannedMeal(userId, date, mealType, recipeId)` - tworzenie DTO

  8.2. Logika biznesowa:

- Pobranie przepisów z bazy danych zgodnych z meal_type
- Filtrowanie według przedziału kalorycznego (target ± 15%)
- Losowy wybór z dostępnych przepisów
- Walidacja makro (suma 3 posiłków ≈ cele dzienne)

  8.3. Testy jednostkowe:

```bash
touch src/services/__tests__/meal-plan-generator.test.ts
```

---

### Krok 9: Implementacja POST /api/profile/me/generate-plan

9.1. Implementacja `app/api/profile/me/generate-plan/route.ts`:

- Export funkcji `POST(request: Request)`
- Weryfikacja autentykacji
- Pobranie profilu użytkownika
- Sprawdzenie czy plan już istnieje
- Wywołanie MealPlanGenerator
- Batch insert do planned_meals
- Zwrot odpowiedzi 200 OK / 202 Accepted
- Obsługa błędów (401, 404, 409, 500)

  9.2. Rate limiting (opcjonalnie)

  9.3. Testy integracyjne

---

### Krok 10: Migracje bazy danych

10.1. Sprawdzenie czy tabela `profiles` istnieje i ma odpowiednią strukturę:

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_create_profiles_table.sql
-- (jeśli nie istnieje)
```

10.2. Utworzenie/aktualizacja polityk RLS dla `profiles`:

```bash
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_profiles_rls.sql
```

Zawartość:

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

10.3. Utworzenie indeksów:

```sql
CREATE INDEX IF NOT EXISTS profiles_id_idx ON public.profiles(id);
CREATE INDEX IF NOT EXISTS planned_meals_user_date_idx
  ON public.planned_meals(user_id, meal_date);
```

10.4. Zastosowanie migracji:

```bash
npx supabase db push
```

---

### Krok 11: Error handling utilities

11.1. Implementacja `src/lib/utils/api-error-handler.ts`:

- Klasa `ApiError` extends Error
- Funkcja `handleApiError(error): NextResponse`
- Standardowy format odpowiedzi błędu

  11.2. Użycie w wszystkich API routes (try/catch)

---

### Krok 12: Dokumentacja API

12.1. Utworzenie dokumentacji OpenAPI/Swagger (opcjonalnie):

```bash
touch .docs/api-profile-spec.yaml
```

12.2. Aktualizacja README z przykładami użycia endpointów

---

### Krok 13: Testy E2E

13.1. Utworzenie testów Playwright:

```bash
touch tests/e2e/profile-api.spec.ts
```

13.2. Scenariusze testowe:

- Pełny przepływ onboardingu (POST /api/profile)
- Pobieranie profilu (GET /api/profile/me)
- Aktualizacja profilu (PATCH /api/profile/me)
- Generowanie planu (POST /api/profile/me/generate-plan)
- Błędy autentykacji (401)
- Błędy walidacji (400)
- Konflikt profilu (409)

  13.3. Uruchomienie testów:

```bash
npm run test:e2e
```

---

### Krok 14: Integracja frontendowa

14.1. Utworzenie TanStack Query hooks:

```bash
touch src/lib/react-query/queries/useProfileQuery.ts
touch src/lib/react-query/mutations/useCreateProfile.ts
touch src/lib/react-query/mutations/useUpdateProfile.ts
touch src/lib/react-query/mutations/useGeneratePlan.ts
```

14.2. Przykład `useCreateProfile`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CreateProfileCommand,
  CreateProfileResponseDTO,
} from '@/types/dto.types'

export const useCreateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (command: CreateProfileCommand) => {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error.message)
      }

      return response.json() as Promise<CreateProfileResponseDTO>
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', 'me'], data)
    },
  })
}
```

---

### Krok 15: Monitoring i observability

15.1. Dodanie logowania wydajności:

```typescript
console.log(`[Performance] POST /api/profile - ${duration}ms`)
```

15.2. Integracja z narzędziami monitoringu (opcjonalnie):

- Sentry (błędy)
- LogRocket (sesje użytkowników)
- Vercel Analytics (metryki)

---

### Krok 16: Code review i QA

16.1. Przegląd kodu pod kątem:

- TypeScript strict mode
- Bezpieczeństwo (RLS, walidacja, klucze API)
- Wydajność (zapytania, caching)
- Obsługa błędów
- Testy (coverage >80%)

  16.2. Testy manualne:

- Testowanie na środowisku deweloperskim
- Weryfikacja wszystkich scenariuszy błędów
- Testy obciążeniowe (generate-plan)

---

### Krok 17: Deployment

17.1. Merge do głównej gałęzi:

```bash
git checkout -b feature/profile-api
git add .
git commit -m "feat(api): implement Profile resource endpoints"
git push origin feature/profile-api
```

17.2. Utworzenie Pull Request

17.3. Po zatwierdzeniu PR - deployment na staging/production (GitHub Actions + Cloudflare Pages)

17.4. Weryfikacja na produkcji:

- Sprawdzenie logów
- Monitorowanie błędów
- Testy smoke

---

### Krok 18: Post-deployment

18.1. Monitorowanie pierwszych użytkowników:

- Metryki sukcesu (201, 200)
- Metryki błędów (400, 500)
- Czas odpowiedzi

  18.2. Optymalizacja na podstawie danych rzeczywistych:

- Analiza bottlenecków
- Dostrajanie cache'owania
- Ewentualne poprawki

---

## Podsumowanie

Plan wdrożenia obejmuje:

- **4 endpointy REST API** (POST, GET, PATCH, POST generate-plan)
- **2 serwisy biznesowe** (NutritionCalculator, MealPlanGenerator)
- **Kompleksową walidację** (Zod schemas)
- **Bezpieczeństwo** (RLS, autentykacja, rate limiting)
- **Testy** (unit, integration, E2E)
- **Optymalizację wydajności** (caching, batch operations, indexy)
- **Obsługę błędów** (standardowy format, logging)

**Szacowany czas implementacji**: 5-7 dni roboczych dla zespołu 2-3 programistów.
