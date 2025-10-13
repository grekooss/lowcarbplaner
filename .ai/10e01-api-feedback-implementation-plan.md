# API Endpoint Implementation Plan: POST /feedback

## 1. Przegląd punktu końcowego

**Endpoint**: `POST /api/feedback`

**Cel**: Umożliwienie użytkownikom przesyłania opinii o aplikacji oraz zgłaszania problemów technicznych lub merytorycznych (np. błędy w przepisach).

**Funkcjonalność**:

- Zapisywanie feedbacku użytkownika w bazie danych
- Powiązanie feedbacku z kontem użytkownika (user_id)
- Przechowywanie dodatkowych metadanych (wersja aplikacji, system operacyjny)
- Zwracanie utworzonego rekordu feedbacku

**Wymagania biznesowe**:

- Użytkownik musi być zalogowany
- Treść feedbacku nie może być pusta
- Metadane są opcjonalne
- Każdy feedback jest powiązany z kontem użytkownika

---

## 2. Szczegóły żądania

### Metoda HTTP

`POST`

### Struktura URL

`/api/feedback`

### Nagłówki

- `Content-Type: application/json`
- `Authorization: Bearer <supabase-jwt-token>` (automatycznie przez Supabase Auth)

### Parametry

#### Request Body (JSON)

**Wymagane**:

- `content` (string) - Treść opinii lub zgłoszenia problemu
  - Min: 1 znak
  - Max: 5000 znaków
  - Przykład: `"Aplikacja działa świetnie, ale znalazłem błąd w przepisie na omlet."`

**Opcjonalne**:

- `metadata` (object) - Dodatkowe metadane kontekstowe
  - Typ: Dowolny obiekt JSON
  - Przykładowe pola:
    - `appVersion` (string) - Wersja aplikacji
    - `os` (string) - System operacyjny
    - `deviceModel` (string) - Model urządzenia
    - `screenResolution` (string) - Rozdzielczość ekranu
  - Przykład:
    ```json
    {
      "appVersion": "1.0.1",
      "os": "Android 13",
      "deviceModel": "Samsung Galaxy S21",
      "screenResolution": "1080x2400"
    }
    ```

#### Przykładowy Request Body

```json
{
  "content": "Aplikacja działa świetnie, ale znalazłem błąd w przepisie na omlet.",
  "metadata": {
    "appVersion": "1.0.1",
    "os": "Android 13"
  }
}
```

---

## 3. Wykorzystywane typy

### 3.1. Command Model (Input)

**Plik**: `src/types/dto.types.ts`

```typescript
/**
 * Command Model: Tworzenie nowego feedbacku (POST /api/feedback)
 */
export type CreateFeedbackCommand = {
  content: string
  metadata?: Record<string, unknown>
}
```

### 3.2. Response DTO (Output)

**Plik**: `src/types/dto.types.ts`

```typescript
/**
 * DTO: Odpowiedź dla POST /api/feedback
 * Zawiera pełne dane zapisanego feedbacku
 */
export type FeedbackResponseDTO = {
  id: number
  user_id: string
  content: string
  metadata: Record<string, unknown> | null
  created_at: string
}
```

### 3.3. Typy bazodanowe

**Plik**: `src/types/database.types.ts` (już istnieje)

```typescript
feedback: {
  Row: {
    content: string
    created_at: string
    id: number
    metadata: Json | null
    user_id: string
  }
  Insert: {
    content: string
    created_at?: string
    id?: number
    metadata?: Json | null
    user_id: string
  }
}
```

### 3.4. Validation Schema

**Plik**: `src/lib/validation/feedback.ts` (nowy)

```typescript
import { z } from 'zod'

/**
 * Schema walidacji dla tworzenia feedbacku
 */
export const createFeedbackSchema = z.object({
  content: z
    .string({ required_error: 'Treść feedbacku jest wymagana' })
    .min(1, 'Treść nie może być pusta')
    .max(5000, 'Treść może mieć maksymalnie 5000 znaków')
    .trim(),
  metadata: z
    .record(z.unknown())
    .optional()
    .nullable()
    .refine(
      (val) => {
        // Jeśli metadata jest podane, sprawdź czy nie jest za duże (max 10KB JSON)
        if (val) {
          const jsonSize = JSON.stringify(val).length
          return jsonSize <= 10000
        }
        return true
      },
      { message: 'Metadata jest za duże (max 10KB)' }
    ),
})

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>
```

---

## 4. Szczegóły odpowiedzi

### Response Body (JSON)

**Status**: `201 Created`

**Struktura**:

```json
{
  "id": 1,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Aplikacja działa świetnie, ale znalazłem błąd w przepisie na omlet.",
  "metadata": {
    "appVersion": "1.0.1",
    "os": "Android 13"
  },
  "created_at": "2023-10-27T12:00:00.000Z"
}
```

**Pola odpowiedzi**:

- `id` (number) - Unikalny identyfikator feedbacku
- `user_id` (string/UUID) - ID użytkownika, który przesłał feedback
- `content` (string) - Treść feedbacku
- `metadata` (object | null) - Metadane (lub null jeśli nie podano)
- `created_at` (string/ISO 8601) - Data i czas utworzenia feedbacku

### Kody odpowiedzi

| Kod                           | Opis                               | Przykładowa odpowiedź                                                                |
| ----------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| **201 Created**               | Feedback został pomyślnie zapisany | `{ "id": 1, "user_id": "...", ... }`                                                 |
| **400 Bad Request**           | Nieprawidłowe dane wejściowe       | `{ "error": { "message": "Treść nie może być pusta", "code": "VALIDATION_ERROR" } }` |
| **401 Unauthorized**          | Użytkownik niezalogowany           | `{ "error": { "message": "Uwierzytelnienie wymagane", "code": "UNAUTHORIZED" } }`    |
| **500 Internal Server Error** | Błąd serwera                       | `{ "error": { "message": "Wewnętrzny błąd serwera", "code": "INTERNAL_ERROR" } }`    |

---

## 5. Przepływ danych

### 5.1. Diagram przepływu

```
1. Użytkownik → POST /api/feedback (Request Body)
         ↓
2. Next.js App Router (app/api/feedback/route.ts)
         ↓
3. Wywołanie Server Action (createFeedback)
         ↓
4. Walidacja autentykacji (Supabase Auth)
         ↓
5. Walidacja danych (Zod Schema)
         ↓
6. Insert do tabeli feedback (Supabase PostgreSQL)
         ↓
7. Transformacja do DTO
         ↓
8. Zwrot 201 Created + FeedbackResponseDTO
```

### 5.2. Szczegółowy proces

#### Krok 1: Odbiór żądania

- Next.js App Router odbiera request na `/api/feedback`
- Route handler (`app/api/feedback/route.ts`) parsuje JSON z body

#### Krok 2: Autoryzacja

- Wywołanie `createServerClient()` z `@/lib/supabase/server`
- Pobranie sesji użytkownika: `supabase.auth.getUser()`
- Jeśli brak sesji → **401 Unauthorized**

#### Krok 3: Walidacja danych wejściowych

- Parsowanie body przez `createFeedbackSchema.safeParse()`
- Sprawdzenie:
  - `content` nie jest pusty i ma max 5000 znaków
  - `metadata` (jeśli podane) jest poprawnym obiektem JSON i nie przekracza 10KB
- Jeśli walidacja fail → **400 Bad Request**

#### Krok 4: Zapis do bazy danych

- Przygotowanie danych do INSERT:
  ```typescript
  {
    user_id: user.id,
    content: validated.data.content,
    metadata: validated.data.metadata ? JSON.parse(JSON.stringify(validated.data.metadata)) : null,
    created_at: new Date().toISOString()
  }
  ```
- Wywołanie:
  ```typescript
  const { data, error } = await supabase
    .from('feedback')
    .insert(feedbackData)
    .select()
    .single()
  ```
- Jeśli błąd bazy danych → **500 Internal Server Error**

#### Krok 5: Transformacja do DTO

- Mapowanie surowych danych z bazy do `FeedbackResponseDTO`
- Konwersja `metadata` z JSON do object (jeśli nie null)

#### Krok 6: Zwrot odpowiedzi

- Status: **201 Created**
- Body: `FeedbackResponseDTO` w formacie JSON

### 5.3. Interakcje z bazą danych

**Tabela**: `public.feedback`

**Operacja**: INSERT

**RLS Policy** (musi być włączona):

```sql
-- Użytkownik może tworzyć feedback tylko dla siebie
CREATE POLICY "Users can create their own feedback"
  ON public.feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Użytkownik może odczytywać tylko swój własny feedback (opcjonalne)
CREATE POLICY "Users can view their own feedback"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

---

## 6. Względy bezpieczeństwa

### 6.1. Uwierzytelnienie

**Mechanizm**: Supabase Auth (JWT Token)

**Implementacja**:

```typescript
const supabase = await createServerClient()
const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser()

if (authError || !user) {
  return {
    error: 'Uwierzytelnienie wymagane',
    code: 'UNAUTHORIZED',
  }
}
```

**Zabezpieczenia**:

- Wszystkie requesty muszą zawierać ważny JWT token
- Token jest automatycznie weryfikowany przez Supabase SDK
- Brak sesji → 401 Unauthorized

### 6.2. Autoryzacja

**Row Level Security (RLS)**:

- Włączone na tabeli `feedback`
- Użytkownik może zapisywać feedback tylko z własnym `user_id`
- RLS automatycznie blokuje próby podstawienia cudzego `user_id`

**Weryfikacja**:

```typescript
// RLS automatycznie sprawdza czy user_id w INSERT === auth.uid()
const { data, error } = await supabase
  .from('feedback')
  .insert({ user_id: user.id, ... }) // user.id z sesji
```

### 6.3. Walidacja danych wejściowych

**Zabezpieczenia przed atakami**:

1. **XSS (Cross-Site Scripting)**:
   - `content` jest zapisywany jako plain text w bazie
   - Sanityzacja będzie wykonana na poziomie UI przy wyświetlaniu
   - `metadata` jako JSON nie stanowi zagrożenia na poziomie zapisu

2. **SQL Injection**:
   - Supabase Postgrest używa parametryzowanych zapytań
   - Brak możliwości SQL injection przez Supabase SDK

3. **NoSQL Injection**:
   - Nie dotyczy (PostgreSQL + parametryzowane zapytania)

4. **JSON Injection**:
   - `metadata` jest walidowane jako obiekt JSON przez Zod
   - Limit rozmiaru: max 10KB
   - Brak możliwości podstawienia złośliwego kodu

5. **Denial of Service (DoS)**:
   - Limit długości `content`: 5000 znaków
   - Limit rozmiaru `metadata`: 10KB JSON
   - Rate limiting (do dodania w przyszłości na poziomie Cloudflare/middleware)

### 6.4. Ochrona przed spam/flood

**Obecne zabezpieczenia**:

- Wymóg autentykacji (ogranicza anonimowy spam)
- Limit długości treści

**Przyszłe ulepszenia** (opcjonalne):

- Rate limiting: max 10 feedbacków/godzinę na użytkownika
- Implementacja przez Next.js middleware lub Cloudflare Workers
- Webhook do Slack/Discord dla feedbacków (monitoring)

### 6.5. Prywatność danych

**GDPR Compliance**:

- Feedback jest powiązany z `user_id` (dane osobowe)
- Należy zapewnić:
  - Możliwość usunięcia feedbacku przez użytkownika
  - Export feedbacków użytkownika (prawo do przenoszenia danych)
  - Anonimizacja przy usunięciu konta (CASCADE lub SET NULL)

**Relacja do profilu**:

```typescript
// z database.types.ts
Relationships: [
  {
    foreignKeyName: 'feedback_user_id_fkey'
    columns: ['user_id']
    isOneToOne: false
    referencedRelation: 'profiles'
    referencedColumns: ['id']
  },
]
```

**ON DELETE policy** (sprawdzić w migracji):

```sql
-- Rekomendacja: CASCADE (usunięcie profilu usuwa feedbacki)
ALTER TABLE feedback
  ADD CONSTRAINT feedback_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id)
  ON DELETE CASCADE;
```

---

## 7. Obsługa błędów

### 7.1. Macierz błędów

| Scenariusz                | Kod HTTP | Kod błędu          | Komunikat                                                               | Szczegóły                        |
| ------------------------- | -------- | ------------------ | ----------------------------------------------------------------------- | -------------------------------- |
| Brak sesji użytkownika    | 401      | `UNAUTHORIZED`     | "Uwierzytelnienie wymagane"                                             | Token JWT wygasł lub niepoprawny |
| Pusty `content`           | 400      | `VALIDATION_ERROR` | "Nieprawidłowe dane wejściowe: Treść nie może być pusta"                | Zod validation fail              |
| `content` > 5000 znaków   | 400      | `VALIDATION_ERROR` | "Nieprawidłowe dane wejściowe: Treść może mieć maksymalnie 5000 znaków" | Zod validation fail              |
| `metadata` > 10KB         | 400      | `VALIDATION_ERROR` | "Nieprawidłowe dane wejściowe: Metadata jest za duże (max 10KB)"        | Zod custom refine                |
| Nieprawidłowy format JSON | 400      | `VALIDATION_ERROR` | "Nieprawidłowe dane wejściowe: Niepoprawny format JSON"                 | Next.js body parsing error       |
| Błąd INSERT do bazy       | 500      | `DATABASE_ERROR`   | "Błąd bazy danych: [szczegóły]"                                         | Supabase error                   |
| RLS policy violation      | 403      | `FORBIDDEN`        | "Brak uprawnień do wykonania tej operacji"                              | Rzadkie (RLS blokuje)            |
| Nieoczekiwany wyjątek     | 500      | `INTERNAL_ERROR`   | "Wewnętrzny błąd serwera"                                               | Catch-all dla try-catch          |

### 7.2. Format odpowiedzi błędu

**Standardowy format** (zgodny z `ApiErrorResponse` z dto.types.ts):

```typescript
{
  error: {
    message: string,
    code?: string,
    details?: unknown
  }
}
```

**Przykłady**:

1. **401 Unauthorized**:

```json
{
  "error": {
    "message": "Uwierzytelnienie wymagane",
    "code": "UNAUTHORIZED"
  }
}
```

2. **400 Validation Error**:

```json
{
  "error": {
    "message": "Nieprawidłowe dane wejściowe: Treść nie może być pusta",
    "code": "VALIDATION_ERROR",
    "details": {
      "content": {
        "_errors": ["Treść nie może być pusta"]
      }
    }
  }
}
```

3. **500 Database Error**:

```json
{
  "error": {
    "message": "Błąd bazy danych: duplicate key value violates unique constraint",
    "code": "DATABASE_ERROR"
  }
}
```

### 7.3. Logowanie błędów

**Poziomy logowania**:

1. **Console Error** (dla wszystkich błędów):

```typescript
console.error('Błąd podczas tworzenia feedbacku:', error)
```

2. **Structured Logging** (przyszłość):

```typescript
logger.error('feedback.create.failed', {
  userId: user.id,
  errorCode: error.code,
  errorMessage: error.message,
  timestamp: new Date().toISOString(),
})
```

3. **Monitoring** (opcjonalne):

- Sentry dla błędów 500
- Logowanie do Supabase Edge Functions Logs
- Webhook do Slack dla critical errors

---

## 8. Rozważania dotyczące wydajności

### 8.1. Potencjalne wąskie gardła

1. **频率 INSERT do bazy danych**:
   - Problem: Każdy feedback to osobny INSERT
   - Wpływ: Niski (feedback nie jest częstą operacją)
   - Optymalizacja: Nie wymagana na MVP

2. **Rozmiar metadata JSON**:
   - Problem: Duże metadata mogą spowolnić INSERT
   - Rozwiązanie: Limit 10KB w walidacji

3. **Brak indeksów**:
   - Problem: Wolne zapytania SELECT (gdy będziemy pobierać feedback)
   - Rozwiązanie: Dodać indeksy w migracji:
     ```sql
     CREATE INDEX idx_feedback_user_id ON feedback(user_id);
     CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
     ```

### 8.2. Strategie optymalizacji

#### Baza danych

1. **Indeksy** (już opisane powyżej)

2. **RLS Performance**:
   - RLS policy używa `auth.uid() = user_id`
   - Indeks na `user_id` przyspieszy walidację RLS

3. **JSONB dla metadata**:
   - Rekomendacja: Zmienić typ z `JSON` na `JSONB` w migracji
   - Korzyść: Szybsze zapytania, możliwość GIN index
   ```sql
   ALTER TABLE feedback ALTER COLUMN metadata TYPE jsonb USING metadata::jsonb;
   CREATE INDEX idx_feedback_metadata ON feedback USING GIN (metadata);
   ```

#### Server Actions

1. **Minimalizacja SELECT after INSERT**:
   - Używamy `.select().single()` po INSERT → 1 roundtrip
   - Alternatywa (wolniejsza): Osobny SELECT po INSERT

2. **Brak niepotrzebnych joinów**:
   - Nie pobieramy danych z `profiles` przy tworzeniu feedbacku
   - Tylko podstawowe dane z tabeli `feedback`

#### Caching

- **Brak cache** dla POST /feedback (nie ma sensu cache'ować CREATE)
- Cache może być dodany dla GET /feedback (pobieranie listy feedbacków)

### 8.3. Metryki wydajności

**Cel**:

- Czas odpowiedzi: < 200ms (P95)
- Throughput: 100 req/s (dla całej aplikacji)

**Monitorowanie**:

```typescript
// W Server Action
const startTime = performance.now()
// ... operacje
const endTime = performance.now()
console.log(
  `Feedback created in ${Math.round(endTime - startTime)}ms for user ${user.id}`
)
```

---

## 9. Etapy wdrożenia

### Krok 1: Dodanie typów DTO i Command Modeli

**Plik**: `src/types/dto.types.ts`

**Zadanie**: Dodać typy na końcu pliku (przed `ApiErrorResponse`):

```typescript
// ============================================================================
// 10. FEEDBACK API
// ============================================================================

/**
 * Command Model: Tworzenie nowego feedbacku (POST /api/feedback)
 */
export type CreateFeedbackCommand = {
  content: string
  metadata?: Record<string, unknown>
}

/**
 * DTO: Odpowiedź dla POST /api/feedback
 * Zawiera pełne dane zapisanego feedbacku
 */
export type FeedbackResponseDTO = {
  id: number
  user_id: string
  content: string
  metadata: Record<string, unknown> | null
  created_at: string
}
```

---

### Krok 2: Utworzenie schematu walidacji Zod

**Plik**: `src/lib/validation/feedback.ts` (nowy plik)

**Zadanie**: Stworzyć plik z pełnym schematem walidacji:

```typescript
/**
 * Validation schemas for Feedback API
 *
 * Zawiera schematy Zod dla operacji na feedbacku użytkowników.
 *
 * @see .ai/10e01-api-feedback-implementation-plan.md
 */

import { z } from 'zod'

/**
 * Schema walidacji dla tworzenia feedbacku (POST /api/feedback)
 *
 * Waliduje:
 * - content: wymagany string (1-5000 znaków)
 * - metadata: opcjonalny obiekt JSON (max 10KB)
 */
export const createFeedbackSchema = z.object({
  content: z
    .string({ required_error: 'Treść feedbacku jest wymagana' })
    .min(1, 'Treść nie może być pusta')
    .max(5000, 'Treść może mieć maksymalnie 5000 znaków')
    .trim(),
  metadata: z
    .record(z.unknown())
    .optional()
    .nullable()
    .refine(
      (val) => {
        // Sprawdź czy metadata nie jest za duże (max 10KB JSON)
        if (val) {
          const jsonSize = JSON.stringify(val).length
          return jsonSize <= 10000
        }
        return true
      },
      { message: 'Metadata jest za duże (max 10KB)' }
    ),
})

/**
 * TypeScript type inferred from schema
 */
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>
```

---

### Krok 3: Implementacja Server Action

**Plik**: `src/lib/actions/feedback.ts` (nowy plik)

**Zadanie**: Stworzyć pełną implementację Server Action:

````typescript
/**
 * Server Actions for Feedback API
 *
 * Implementuje logikę biznesową dla operacji na feedbacku użytkowników:
 * - POST /api/feedback (tworzenie nowego feedbacku)
 *
 * @see .ai/10e01-api-feedback-implementation-plan.md
 */

'use server'

import { createServerClient } from '@/lib/supabase/server'
import type {
  CreateFeedbackCommand,
  FeedbackResponseDTO,
} from '@/types/dto.types'
import {
  createFeedbackSchema,
  type CreateFeedbackInput,
} from '@/lib/validation/feedback'
import type { TablesInsert } from '@/types/database.types'

/**
 * Standardowy typ wyniku Server Action (Discriminated Union)
 */
type ActionResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: string; code?: string; details?: unknown }

/**
 * POST /api/feedback - Tworzy nowy feedback użytkownika
 *
 * Proces:
 * 1. Weryfikacja autentykacji
 * 2. Walidacja danych wejściowych (Zod)
 * 3. Zapis feedbacku do bazy danych
 * 4. Zwrot utworzonego feedbacku
 *
 * @param input - Dane z formularza feedbacku (content, metadata)
 * @returns Utworzony feedback lub błąd
 *
 * @example
 * ```typescript
 * const result = await createFeedback({
 *   content: "Świetna aplikacja!",
 *   metadata: { appVersion: "1.0.1", os: "iOS 17" }
 * })
 * if (result.error) {
 *   console.error(result.error)
 * } else {
 *   console.log(result.data.id) // 42
 * }
 * ```
 */
export async function createFeedback(
  input: CreateFeedbackInput
): Promise<ActionResult<FeedbackResponseDTO>> {
  try {
    // 1. Weryfikacja autentykacji
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        error: 'Uwierzytelnienie wymagane',
        code: 'UNAUTHORIZED',
      }
    }

    // 2. Walidacja danych wejściowych
    const validated = createFeedbackSchema.safeParse(input)
    if (!validated.success) {
      return {
        error: `Nieprawidłowe dane wejściowe: ${validated.error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`,
        code: 'VALIDATION_ERROR',
        details: validated.error.format(),
      }
    }

    const command: CreateFeedbackCommand = validated.data

    // 3. Przygotowanie danych do zapisu
    const feedbackData: TablesInsert<'feedback'> = {
      user_id: user.id,
      content: command.content,
      metadata: command.metadata
        ? JSON.parse(JSON.stringify(command.metadata))
        : null,
      created_at: new Date().toISOString(),
    }

    // 4. Zapis feedbacku do bazy danych
    const startTime = performance.now()
    const { data: createdFeedback, error: insertError } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single()
    const endTime = performance.now()

    if (insertError) {
      console.error('Błąd podczas tworzenia feedbacku:', insertError)
      return {
        error: `Błąd bazy danych: ${insertError.message}`,
        code: 'DATABASE_ERROR',
      }
    }

    // 5. Logowanie performance metrics
    console.log(
      `Feedback created in ${Math.round(endTime - startTime)}ms for user ${user.id}`
    )

    // 6. Transformacja do DTO
    const response: FeedbackResponseDTO = {
      id: createdFeedback.id,
      user_id: createdFeedback.user_id,
      content: createdFeedback.content,
      metadata: createdFeedback.metadata as Record<string, unknown> | null,
      created_at: createdFeedback.created_at,
    }

    return { data: response }
  } catch (err) {
    console.error('Nieoczekiwany błąd w createFeedback:', err)
    return {
      error: 'Wewnętrzny błąd serwera',
      code: 'INTERNAL_ERROR',
    }
  }
}
````

---

### Krok 4: Utworzenie Route Handler (Next.js App Router)

**Plik**: `app/api/feedback/route.ts` (nowy plik)

**Zadanie**: Stworzyć Next.js Route Handler dla POST /api/feedback:

```typescript
/**
 * POST /api/feedback - Endpoint dla tworzenia feedbacku użytkowników
 *
 * @see .ai/10e01-api-feedback-implementation-plan.md
 */

import { NextRequest, NextResponse } from 'next/server'
import { createFeedback } from '@/lib/actions/feedback'
import type { CreateFeedbackInput } from '@/lib/validation/feedback'

/**
 * POST handler dla /api/feedback
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parsowanie JSON body
    const body: CreateFeedbackInput = await request.json()

    // 2. Wywołanie Server Action
    const result = await createFeedback(body)

    // 3. Obsługa błędów
    if (result.error) {
      // Określenie kodu HTTP na podstawie kodu błędu
      let statusCode = 500

      switch (result.code) {
        case 'UNAUTHORIZED':
          statusCode = 401
          break
        case 'VALIDATION_ERROR':
          statusCode = 400
          break
        case 'DATABASE_ERROR':
          statusCode = 500
          break
        case 'INTERNAL_ERROR':
          statusCode = 500
          break
        default:
          statusCode = 500
      }

      return NextResponse.json(
        {
          error: {
            message: result.error,
            code: result.code,
            details: result.details,
          },
        },
        { status: statusCode }
      )
    }

    // 4. Zwrot sukcesu (201 Created)
    return NextResponse.json(result.data, { status: 201 })
  } catch (err) {
    console.error('Nieoczekiwany błąd w POST /api/feedback:', err)
    return NextResponse.json(
      {
        error: {
          message: 'Wewnętrzny błąd serwera',
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    )
  }
}
```

---

### Krok 5: Sprawdzenie/Utworzenie RLS Policies w bazie danych

**Plik**: `supabase/migrations/YYYYMMDDHHMMSS_feedback_rls_policies.sql` (nowa migracja)

**Zadanie**: Sprawdzić czy RLS jest włączony i dodać polityki:

```sql
-- ============================================================================
-- FEEDBACK TABLE - Row Level Security Policies
-- ============================================================================

-- Włącz RLS na tabeli feedback (jeśli jeszcze nie jest włączony)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Użytkownik może tworzyć tylko swój własny feedback
CREATE POLICY "Users can create their own feedback"
  ON public.feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Użytkownik może przeglądać tylko swój własny feedback
CREATE POLICY "Users can view their own feedback"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Użytkownik może usuwać tylko swój własny feedback (opcjonalne)
CREATE POLICY "Users can delete their own feedback"
  ON public.feedback FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================

-- Indeks na user_id dla szybszych zapytań i RLS
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);

-- Indeks na created_at dla sortowania (DESC - najnowsze najpierw)
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- Opcjonalny: GIN index dla metadata JSONB (jeśli zmienimy typ na JSONB)
-- ALTER TABLE public.feedback ALTER COLUMN metadata TYPE jsonb USING metadata::jsonb;
-- CREATE INDEX IF NOT EXISTS idx_feedback_metadata ON public.feedback USING GIN (metadata);

-- ============================================================================
-- FOREIGN KEY constraint (sprawdzenie czy istnieje)
-- ============================================================================

-- Upewnij się, że istnieje foreign key constraint z CASCADE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'feedback_user_id_fkey'
  ) THEN
    ALTER TABLE public.feedback
      ADD CONSTRAINT feedback_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.profiles(id)
      ON DELETE CASCADE;
  END IF;
END
$$;
```

**Komendy**:

```bash
# Utworzenie nowej migracji
npx supabase migration new feedback_rls_policies

# Zastosowanie migracji na lokalnym Supabase
npx supabase db push

# Zastosowanie na produkcji (przez Supabase Dashboard lub CLI)
npx supabase db push --db-url $SUPABASE_DB_URL
```

---

### Krok 6: Testy jednostkowe dla walidacji

**Plik**: `src/lib/validation/__tests__/feedback.test.ts` (nowy plik)

**Zadanie**: Napisać testy dla schematu walidacji:

```typescript
import { describe, it, expect } from 'vitest'
import { createFeedbackSchema } from '../feedback'

describe('createFeedbackSchema', () => {
  describe('content validation', () => {
    it('should accept valid content', () => {
      const result = createFeedbackSchema.safeParse({
        content: 'Świetna aplikacja!',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty content', () => {
      const result = createFeedbackSchema.safeParse({
        content: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('nie może być pusta')
      }
    })

    it('should reject content longer than 5000 characters', () => {
      const result = createFeedbackSchema.safeParse({
        content: 'a'.repeat(5001),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('maksymalnie 5000')
      }
    })

    it('should trim whitespace from content', () => {
      const result = createFeedbackSchema.safeParse({
        content: '  Treść z whitespace  ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.content).toBe('Treść z whitespace')
      }
    })
  })

  describe('metadata validation', () => {
    it('should accept valid metadata object', () => {
      const result = createFeedbackSchema.safeParse({
        content: 'Test',
        metadata: {
          appVersion: '1.0.1',
          os: 'iOS 17',
        },
      })
      expect(result.success).toBe(true)
    })

    it('should accept null metadata', () => {
      const result = createFeedbackSchema.safeParse({
        content: 'Test',
        metadata: null,
      })
      expect(result.success).toBe(true)
    })

    it('should accept undefined metadata', () => {
      const result = createFeedbackSchema.safeParse({
        content: 'Test',
      })
      expect(result.success).toBe(true)
    })

    it('should reject metadata larger than 10KB', () => {
      const largeMetadata = {
        data: 'a'.repeat(11000),
      }
      const result = createFeedbackSchema.safeParse({
        content: 'Test',
        metadata: largeMetadata,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('za duże')
      }
    })
  })
})
```

**Komendy**:

```bash
# Uruchomienie testów
npm test src/lib/validation/__tests__/feedback.test.ts

# Coverage
npm run test:coverage -- src/lib/validation/__tests__/feedback.test.ts
```

---

### Krok 7: Testy integracyjne dla Server Action

**Plik**: `src/lib/actions/__tests__/feedback.test.ts` (nowy plik)

**Zadanie**: Napisać testy integracyjne (wymaga mockowania Supabase):

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createFeedback } from '../feedback'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  })),
}))

describe('createFeedback Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return UNAUTHORIZED error when user is not logged in', async () => {
    const { createServerClient } = await import('@/lib/supabase/server')
    const mockClient = createServerClient as any
    mockClient().auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    })

    const result = await createFeedback({
      content: 'Test feedback',
    })

    expect(result.error).toBe('Uwierzytelnienie wymagane')
    expect(result.code).toBe('UNAUTHORIZED')
  })

  it('should return VALIDATION_ERROR for empty content', async () => {
    const result = await createFeedback({
      content: '',
    })

    expect(result.error).toContain('Nieprawidłowe dane wejściowe')
    expect(result.code).toBe('VALIDATION_ERROR')
  })

  // Dodatkowe testy...
})
```

---

### Krok 8: Dokumentacja API (opcjonalne)

**Plik**: `.ai/10e02-api-feedback-documentation.md` (nowy plik)

**Zadanie**: Stworzyć dokumentację użytkownika dla endpointa (format OpenAPI/Swagger):

````markdown
# Feedback API Documentation

## POST /api/feedback

Endpoint do przesyłania feedbacku użytkowników.

### Request

**Headers**:

- `Authorization: Bearer <jwt-token>` (wymagany)
- `Content-Type: application/json`

**Body**:

```json
{
  "content": "string (1-5000 znaków, wymagany)",
  "metadata": {
    "appVersion": "string (opcjonalny)",
    "os": "string (opcjonalny)",
    "...": "dowolne pola"
  }
}
```
````

### Response

**201 Created**:

```json
{
  "id": 123,
  "user_id": "uuid",
  "content": "string",
  "metadata": { ... },
  "created_at": "2023-10-27T12:00:00Z"
}
```

**400 Bad Request**:

```json
{
  "error": {
    "message": "Nieprawidłowe dane wejściowe",
    "code": "VALIDATION_ERROR",
    "details": { ... }
  }
}
```

**401 Unauthorized**:

```json
{
  "error": {
    "message": "Uwierzytelnienie wymagane",
    "code": "UNAUTHORIZED"
  }
}
```

### Przykłady użycia

**cURL**:

```bash
curl -X POST https://lowcarbplaner.com/api/feedback \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Świetna aplikacja!",
    "metadata": {
      "appVersion": "1.0.1",
      "os": "iOS 17"
    }
  }'
```

**JavaScript (fetch)**:

```javascript
const response = await fetch('/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'Świetna aplikacja!',
    metadata: {
      appVersion: '1.0.1',
      os: 'iOS 17',
    },
  }),
})

const data = await response.json()
```

````

---

### Krok 9: Testowanie manualne

**Zadanie**: Przetestować endpoint manualnie przed wdrożeniem:

#### 9.1. Test lokalny (development)

```bash
# 1. Uruchom lokalny Supabase
npx supabase start

# 2. Zastosuj migracje
npx supabase db push

# 3. Uruchom dev server
npm run dev

# 4. Zaloguj się w aplikacji (aby uzyskać JWT token)
# 5. Użyj Postman/Thunder Client/curl do testowania
````

#### 9.2. Scenariusze testowe

**Test 1: Sukces (201 Created)**

```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{
    "content": "Aplikacja działa świetnie!",
    "metadata": {
      "appVersion": "1.0.1",
      "os": "Android 13"
    }
  }'
```

**Test 2: Brak autoryzacji (401)**

```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test bez tokena"
  }'
```

**Test 3: Pusty content (400)**

```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{
    "content": ""
  }'
```

**Test 4: Za długi content (400)**

```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d "{
    \"content\": \"$(python3 -c 'print("a" * 5001)')\"
  }"
```

#### 9.3. Weryfikacja w bazie danych

```sql
-- Sprawdź czy feedback został zapisany
SELECT * FROM public.feedback ORDER BY created_at DESC LIMIT 10;

-- Sprawdź czy RLS działa
SET ROLE authenticated;
SET request.jwt.claim.sub = 'test-user-uuid';
SELECT * FROM public.feedback; -- Powinien zwrócić tylko feedbacki tego użytkownika
```

---

### Krok 10: Wdrożenie na produkcję

**Zadanie**: Deploy na Cloudflare Pages / Vercel

#### 10.1. Pre-deployment checklist

- [ ] Wszystkie testy jednostkowe przechodzą (`npm test`)
- [ ] Wszystkie testy E2E przechodzą (`npm run test:e2e`)
- [ ] ESLint bez błędów (`npm run lint`)
- [ ] TypeScript kompiluje się bez błędów (`npm run build`)
- [ ] Migracje bazy danych zastosowane na produkcji
- [ ] RLS policies włączone i przetestowane
- [ ] Zmienne środowiskowe skonfigurowane

#### 10.2. Deployment steps

```bash
# 1. Commit i push do repozytorium
git add .
git commit -m "feat(api): implement POST /feedback endpoint"
git push origin main

# 2. Zastosuj migracje na produkcyjnej bazie Supabase
npx supabase db push --db-url $SUPABASE_PRODUCTION_DB_URL

# 3. Deploy (automatycznie przez GitHub Actions lub manualnie)
npm run build
npm run deploy

# 4. Weryfikacja po wdrożeniu
curl -X POST https://lowcarbplaner.com/api/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PROD_TOKEN" \
  -d '{
    "content": "Test produkcyjny",
    "metadata": { "env": "production" }
  }'
```

#### 10.3. Monitoring po wdrożeniu

1. **Sprawdź logi w Cloudflare Workers**:
   - Wejdź do Cloudflare Dashboard → Workers → Logs
   - Poszukaj logów z `POST /api/feedback`

2. **Sprawdź metryki w Supabase**:
   - Supabase Dashboard → Database → Query Performance
   - Poszukaj INSERT queries do tabeli `feedback`

3. **Sprawdź Sentry (jeśli skonfigurowane)**:
   - Wejdź do Sentry Dashboard
   - Poszukaj błędów związanych z `feedback`

4. **Smoke test na produkcji**:
   - Zaloguj się w produkcyjnej aplikacji
   - Wyślij testowy feedback przez UI
   - Sprawdź czy pojawił się w bazie danych

---

## 10. Podsumowanie

### 10.1. Kluczowe punkty implementacji

✅ **Typy**:

- `CreateFeedbackCommand` w `dto.types.ts`
- `FeedbackResponseDTO` w `dto.types.ts`
- Validation schema w `feedback.ts`

✅ **Logika biznesowa**:

- Server Action `createFeedback` w `lib/actions/feedback.ts`
- Route Handler w `app/api/feedback/route.ts`

✅ **Bezpieczeństwo**:

- Autoryzacja przez Supabase Auth
- RLS policies na tabeli `feedback`
- Walidacja danych przez Zod

✅ **Testy**:

- Unit testy dla walidacji
- Integration testy dla Server Action

✅ **Baza danych**:

- RLS policies włączone
- Indeksy dla wydajności
- Foreign key constraint z CASCADE

### 10.2. Przyszłe ulepszenia (backlog)

1. **Rate limiting**:
   - Implementacja w Next.js middleware
   - Limit: 10 feedbacków/godzinę na użytkownika

2. **Admin panel**:
   - GET /api/feedback/admin (lista wszystkich feedbacków)
   - PATCH /api/feedback/:id/status (oznaczanie jako przeczytane/rozwiązane)

3. **Notyfikacje**:
   - Webhook do Slack/Discord przy nowym feedbacku
   - Email do admina przy critical feedback

4. **Analytics**:
   - Tracking ile feedbacków dziennie
   - Sentiment analysis treści feedbacku

5. **UI komponenty**:
   - Formularz feedbacku w aplikacji
   - Lista historii feedbacków użytkownika

### 10.3. Wymagane pliki do utworzenia/zmodyfikowania

| Plik                                                           | Typ         | Status              |
| -------------------------------------------------------------- | ----------- | ------------------- |
| `src/types/dto.types.ts`                                       | Modyfikacja | Dodać typy feedback |
| `src/lib/validation/feedback.ts`                               | Nowy        | Schema walidacji    |
| `src/lib/actions/feedback.ts`                                  | Nowy        | Server Action       |
| `app/api/feedback/route.ts`                                    | Nowy        | Route Handler       |
| `supabase/migrations/YYYYMMDDHHMMSS_feedback_rls_policies.sql` | Nowy        | Migracja RLS        |
| `src/lib/validation/__tests__/feedback.test.ts`                | Nowy        | Unit testy          |
| `src/lib/actions/__tests__/feedback.test.ts`                   | Nowy        | Integration testy   |

### 10.4. Czas implementacji (estymacja)

- **Krok 1-2** (Typy + Walidacja): 30 min
- **Krok 3-4** (Server Action + Route Handler): 1h
- **Krok 5** (RLS Policies): 30 min
- **Krok 6-7** (Testy): 1h
- **Krok 8-9** (Dokumentacja + Manual Testing): 45 min
- **Krok 10** (Deployment): 30 min

**TOTAL**: ~4h 15min

---

**Dokument stworzony**: 2025-10-13
**Wersja**: 1.0
**Status**: Ready for implementation
