# Analiza Projektu LowCarbPlaner - Rekomendacje Techniczne i Biznesowe

> **Data analizy:** 2025-12-30
> **Wersja projektu:** Next.js 16.x + React 19.1 + Supabase

---

## Podsumowanie Executive

| Kategoria      | Krytyczne 🔴 | Ważne 🟠 | Średnie 🟡 | Info 🟢 |
| -------------- | ------------ | -------- | ---------- | ------- |
| Performance    | 1            | 2        | 1          | -       |
| Security       | -            | 1        | 1          | -       |
| Error Handling | -            | 2        | 1          | -       |
| Code Quality   | -            | 2        | 2          | 2       |
| Biznes/UX      | 2            | 2        | 2          | -       |

---

# CZĘŚĆ I: Rekomendacje Techniczne

## 1. Performance

### 🔴 1.1 JSON.stringify w Pętli Optymalizacji (KRYTYCZNE)

**Plik:** [meal-plan-generator.ts:1089-1092](src/services/meal-plan-generator.ts#L1089-L1092)

```typescript
// Wykonuje się do 10 razy dla każdego z 7 dni = max 70 wywołań
if (JSON.stringify(optimizedPlan) === JSON.stringify(currentPlan)) {
  break
}
```

**Problem:**

- JSON.stringify na złożonej strukturze (3-5 posiłków × składniki) = O(n) na każdą iterację
- Niedeterministyczny (kolejność kluczy może się różnić)
- Kosztowne porównanie zamiast prostej flagi

**Rekomendacja:**

```typescript
let hasChanges = false

// W miejscu modyfikacji:
if (roundedAmount !== ingredient.currentAmount) {
  hasChanges = true
  // ... reszta kodu
}

// Zamiast JSON.stringify:
if (!hasChanges) break
```

**Szacowany zysk:** 50-70% redukcji czasu optymalizacji

---

### 🟠 1.2 Brak Cache dla Prefetched Recipes

**Plik:** [meal-plan-generator.ts:571-665](src/services/meal-plan-generator.ts#L571-L665)

```typescript
async function prefetchAllRecipes(): Promise<RecipeCacheMetadata> {
  // Każde wywołanie generateWeeklyPlan() pobiera WSZYSTKIE przepisy
  // ~200+ przepisów × ~10 składników każdy = 2000+ wierszy
}
```

**Problem:**

- Przy każdej zmianie profilu → regeneracja planu → full table scan
- Brak TTL cache między wywołaniami
- Przepisy zmieniają się rzadko (admin only)

**Rekomendacja:**

```typescript
// Opcja A: In-memory cache z TTL
import { unstable_cache } from 'next/cache'

const getCachedRecipes = unstable_cache(
  prefetchAllRecipes,
  ['recipes-cache'],
  { revalidate: 300 } // 5 minut
)

// Opcja B: React Query na poziomie API
// Opcja C: Redis/Upstash dla production
```

---

### 🟠 1.3 Nieużywany Error Logger

**Plik:** [error-logger.ts](src/lib/error-logger.ts) (istnieje ale prawie nieużywany)

**Status:**

- `logWarning` używany tylko w [planned-meals.ts:330,339](src/lib/actions/planned-meals.ts#L330)
- **62 wystąpień** `console.error/warn/log` w `src/lib/actions/` **bez strukturyzowanego logowania**

**Pliki z console.\* zamiast logError:**

- `profile.ts` - 27 wystąpień
- `user-history.ts` - 12 wystąpień
- `recipes.ts` - 8 wystąpień
- `planned-meals.ts` - 8 wystąpień (częściowo poprawione)

**Rekomendacja:** Zamień wszystkie `console.error()` na `logError()`:

```typescript
// Zamiast:
console.error('Błąd podczas pobierania profilu:', profileError)

// Używaj:
logError(profileError, 'error', {
  source: 'getProfile',
  userId: user?.id,
  metadata: { action: 'fetch' },
})
```

---

### 🟡 1.4 staleTime vs refetchOnWindowFocus

**Plik:** [usePlannedMealsQuery.ts:46-47](src/hooks/usePlannedMealsQuery.ts#L46-L47)

```typescript
staleTime: 5 * 60 * 1000, // 5 minut
refetchOnWindowFocus: false,
```

**Kwestia do rozważenia:**

- 5 minut staleTime + wyłączony refetchOnWindowFocus = dane mogą być nieaktualne
- Jeśli user oznaczy posiłek w innej zakładce → brak synchronizacji

**Opcje:**

1. **Zachowaj** jeśli priorytetem jest redukcja requestów
2. **Zmień** na `staleTime: 60 * 1000` + `refetchOnWindowFocus: true` dla lepszej synchronizacji

---

## 2. Security

### 🟠 2.1 Brak Górnej Granicy dla Ingredient Overrides (Backend)

**Plik:** [planned-meals.ts:591-612](src/lib/actions/planned-meals.ts#L591-L612)

```typescript
// Linia 610-611: Komentarz wskazuje na brak walidacji
// Note: Backend accepts any positive value
// Frontend shows warning at ±15% but allows changes
```

**Problem:** User może ustawić składnik na 500% bazowej ilości.

**Aktualna walidacja:**

- ✅ `new_amount >= 0` (Zod)
- ✅ `is_scalable` check dla non-scalable
- ❌ Brak `MAX_SCALE` dla scalable

**Rekomendacja:**

```typescript
const MAX_INGREDIENT_SCALE = 2.0 // 200%
const MIN_INGREDIENT_SCALE = 0.3 // 30%

if (ingredient.is_scalable) {
  if (override.new_amount > ingredient.base_amount * MAX_INGREDIENT_SCALE) {
    return {
      error: 'Maksymalna ilość to 200% bazowej wartości',
      code: 'VALIDATION_ERROR',
    }
  }
  if (
    override.new_amount < ingredient.base_amount * MIN_INGREDIENT_SCALE &&
    override.new_amount !== 0
  ) {
    return {
      error: 'Minimalna ilość to 30% bazowej wartości',
      code: 'VALIDATION_ERROR',
    }
  }
}
```

---

### 🟡 2.2 Type Casting `as unknown as Json`

**Plik:** [user-history.ts:88, 133, 179](src/lib/actions/user-history.ts)

```typescript
profile_snapshot: profileSnapshot as unknown as Json, // Omija type checking
```

**Ryzyko:** Jeśli `profileSnapshot` zawiera funkcje lub cyclic refs → runtime error.

**Rekomendacja:**

```typescript
const safeSnapshot = JSON.parse(JSON.stringify(profileSnapshot))
profile_snapshot: safeSnapshot as Json
```

---

## 3. Error Handling

### 🟠 3.1 TODO: Sentry Integration

**Plik:** [error-logger.ts:63](src/lib/error-logger.ts#L63)

```typescript
// TODO: Integrate with Sentry or other error tracking service
```

**Status:** Nieukończone - w production błędy trafiają tylko do `console.error(JSON.stringify(...))`

**Rekomendacja:** Dodaj Sentry:

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.server.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
})
```

---

### 🟠 3.2 Ciche Błędy w History Recording

**Plik:** [planned-meals.ts:386-394](src/lib/actions/planned-meals.ts#L386-L394)

```typescript
recordMealEaten(mealEatenData).catch((err) => {
  console.warn('Błąd zapisu historii meal_eaten:', err)
})
```

**Problem:** User widzi "sukces" ale historia nie zapisała się. Brak retry, brak alertu.

**Rekomendacja:** Użyj `logWarning` + opcjonalnie zwróć warning w response:

```typescript
recordMealEaten(mealEatenData).catch((err) => {
  logWarning(err, { source: 'markMealEaten', userId, metadata: { mealId } })
})

return {
  data: transformedMeal,
  warning: historyError ? 'Historia nie została zapisana' : undefined,
}
```

---

## 4. Code Quality

### 🟠 4.1 Duplikacja Walidacji Składników

**Pliki:**

- [planned-meals.ts:543-575](src/lib/actions/planned-meals.ts#L543-L575) (backend)
- [useIngredientEditor.ts:85-110](src/hooks/useIngredientEditor.ts#L85-L110) (frontend)

**Problem:** Identyczna logika w dwóch miejscach → maintenance nightmare.

**Rekomendacja:** Wyciągnij do shared utility:

```typescript
// src/lib/utils/ingredient-validator.ts
export function validateIngredientAmount(
  ingredient: { is_scalable: boolean; base_amount: number },
  newAmount: number
): { valid: boolean; error?: string }
```

---

### 🟠 4.2 Import Funkcji z Types

**Plik:** [profile.ts:35](src/lib/actions/profile.ts#L35)

```typescript
import { calculateSelectedMealsFromTimeWindow } from '@/types/onboarding-view.types'
```

**Problem:** Funkcja biznesowa importowana z folderu typów.

**Rekomendacja:** Przenieś do `src/services/meal-configuration.ts`

---

### 🟡 4.3 TODO Comments

**Znalezione:**

1. [RecipesBrowserClient.tsx:191](src/components/recipes/RecipesBrowserClient.tsx#L191):
   ```typescript
   // TODO: Implementacja dodawania do planu posiłków
   ```
2. [error-logger.ts:63](src/lib/error-logger.ts#L63):
   ```typescript
   // TODO: Integrate with Sentry
   ```

---

### 🟢 4.4 Nieużywane Funkcje (Dead Code)

Po wprowadzeniu cache'owania, funkcje async mogą być nieużywane:

- `fetchRecipesForMeal()` - zastąpiona przez `getRecipesFromCache()`
- `selectRecipeForMeal()` - zastąpiona przez `selectRecipeForMealCached()`

**Sprawdź i usuń** jeśli nie są już potrzebne.

---

# CZĘŚĆ II: Rekomendacje Biznesowe

## 8. Brak Personalizacji Przepisów 🔴

**Obecny stan:**
System dopasowuje przepisy wyłącznie na podstawie kalorii i typu posiłku.

**Brakuje:**

- **Preferencje smakowe:** Możliwość wyboru profilu smakowego (np. słodkie vs słone śniadania)
- **Wykluczenia:** Filtrowanie alergenów oraz konkretnych, nielubianych składników
- **Historia preferencji:** Algorytm uczący się na podstawie historii "lubianych" przepisów
- **Sezonowość:** Promowanie składników sezonowych (świeżość/cena)
- **Wymagany sprzęt:** Dostosowanie do wyposażenia kuchni (masz tabelę `equipment` - nie jest używana w generatorze!)

**Wpływ:** Niższa retencja użytkowników – generowany plan może zawierać przepisy, które są technicznie poprawne (makro), ale nieakceptowalne dla użytkownika.

**Quick Win:** Wykorzystaj istniejącą tabelę `recipe_equipment`:

```typescript
// W prefetchAllRecipes() dodaj filtr:
const userEquipment = await getUserEquipment(userId)
const recipes = allRecipes.filter((r) =>
  r.equipment.every((e) => userEquipment.includes(e.id))
)
```

---

## 9. Brak Mechanizmu Feedback'u na Przepisy 🔴

**Obecny stan:**

- Tabela `recipes` ma pola `average_rating` i `reviews_count` - **ale nie ma tabeli `user_ratings`!**
- User może tylko: oznaczyć jako zjedzone ✅ lub zamienić ↔️

**Brakuje:**

- **Tabela `user_recipe_ratings`** - do zbierania ocen
- **UI do oceniania** - po oznaczeniu posiłku jako zjedzonego
- **Blacklista przepisów** - "Nie pokazuj mi więcej"
- **Ulubione** - priorytetyzacja w przyszłych planach

**Propozycja schematu:**

```sql
CREATE TABLE user_recipe_ratings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  recipe_id INT REFERENCES recipes(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  is_blacklisted BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);
```

---

## 10. Lista Zakupów - Brak Optymalizacji 🟠

**Obecny endpoint:** `app/api/shopping-list/route.ts`

**Potencjalne ulepszenia:**

- **Grupowanie:** Sortowanie po `ingredient.category` (masz to pole!)
- **Optymalizacja kosztów:** Sugestie tańszych zamienników
- **Eksport:** PDF / TXT / Integracja z Listonic
- **Współdzielenie:** Wspólna lista dla rodziny

---

## 11. Brak Gamifikacji / Motywacji 🟠

**Brakuje:**

- **Streaki:** Tabela `user_streaks` + logika w `markMealEaten`
- **Osiągnięcia:** System odznak
- **Progress bar:** Wizualizacja celu wagowego (masz `goal` w profiles)
- **Porównania:** Tydzień do tygodnia

---

## 12. Logika "Eaten Meals Offset" - Edge Case 🟡

**Plik:** [profile.ts:754-774](src/lib/actions/profile.ts#L754-L774)

```typescript
const hasTodayEatenMeals = todayEatenMeals && todayEatenMeals.length > 0
const startOffset = hasTodayEatenMeals ? 1 : 0 // Od jutra jeśli dzisiaj coś zjedzone
```

**Problem:** Jeśli user zjadł 2 z 5 posiłków dzisiaj i regeneruje plan:

- Plan zaczyna się od jutra
- Dzisiejsze 3 niezjedzone posiłki pozostają w "limbo"

**Rekomendacja:** Dodaj logikę do uzupełniania brakujących posiłków na dzisiaj:

```typescript
if (hasTodayEatenMeals) {
  const todayMissingMeals = findMissingMealsForDate(today)
  // Wygeneruj tylko brakujące posiłki na dzisiaj
}
```

---

# CZĘŚĆ III: Quick Wins (Priorytet)

| #   | Zadanie                              | Plik                        | Effort | Impact           |
| --- | ------------------------------------ | --------------------------- | ------ | ---------------- |
| 1   | Zamień JSON.stringify na flagę       | meal-plan-generator.ts      | 30 min | 🔴 High          |
| 2   | Dodaj MAX_INGREDIENT_SCALE walidację | planned-meals.ts            | 15 min | 🟠 Medium        |
| 3   | Użyj logError zamiast console.\*     | profile.ts, user-history.ts | 1h     | 🟠 Medium        |
| 4   | Dodaj tabelę user_recipe_ratings     | Supabase migration          | 30 min | 🔴 High (biznes) |
| 5   | Wykorzystaj equipment w generatorze  | meal-plan-generator.ts      | 2h     | 🟠 Medium        |
| 6   | Dodaj Sentry integration             | sentry.\*.config.ts         | 1h     | 🟠 Medium        |

---

# Silne Strony Projektu ✅

1. **Architektura:** Discriminated unions, Server Actions pattern, RLS
2. **Wydajność:** Prefetching przepisów, binary search, iteracyjna optymalizacja
3. **Walidacja:** Zod schemas wszędzie, type-safe Supabase queries
4. **UX:** Optimistic updates w useMealToggle, Error boundaries, Loading states
5. **Kod:** TypeScript strict, ESLint, Prettier, Husky hooks
