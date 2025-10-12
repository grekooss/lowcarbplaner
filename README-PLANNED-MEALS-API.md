# Planned Meals API - Implementation Complete ✅

## 🎉 Podsumowanie

Implementacja endpointów **Planned Meals API** została zakończona pomyślnie! Wszystkie komponenty są gotowe do wdrożenia.

---

## 📦 Co Zostało Zaimplementowane

### 1. Backend (Server Actions)

**Lokalizacja:** [src/lib/actions/planned-meals.ts](src/lib/actions/planned-meals.ts)

- ✅ `getPlannedMeals(start_date, end_date)` - lista posiłków w zakresie dat
- ✅ `updatePlannedMeal(id, data)` - uniwersalna aktualizacja z 3 wariantami:
  - `mark_eaten` - oznaczanie jako zjedzony/niezjedzony
  - `swap_recipe` - wymiana przepisu (walidacja ±15% kalorii)
  - `modify_ingredients` - modyfikacja składników (walidacja ±10%, tylko `is_scalable`)
- ✅ `getReplacementRecipes(id)` - sugerowane zamienniki (max 10, sortowane po różnicy kalorycznej)

### 2. API Route Handlers

Cienka warstwa HTTP wywołująca Server Actions:

- ✅ [GET /api/planned-meals](app/api/planned-meals/route.ts)
- ✅ [PATCH /api/planned-meals/[id]](app/api/planned-meals/[id]/route.ts)
- ✅ [GET /api/planned-meals/[id]/replacements](app/api/planned-meals/[id]/replacements/route.ts)

### 3. Walidacja (Zod)

**Lokalizacja:** [src/lib/validation/planned-meals.ts](src/lib/validation/planned-meals.ts)

- ✅ Query params schema (zakres dat max 30 dni)
- ✅ Body schema (discriminated union dla 3 wariantów)
- ✅ Path param schema (ID)

### 4. Typy TypeScript

**Lokalizacja:** [src/types/dto.types.ts](src/types/dto.types.ts)

- ✅ `PlannedMealDTO` (już istniejący)
- ✅ `ReplacementRecipeDTO` (nowy - z `calorie_diff`)

### 5. Baza Danych

#### RLS Policies (Już Zaimplementowane)

**Lokalizacja:** `supabase/migrations/20251009120000_create_lowcarbplaner_schema.sql`

- ✅ `planned_meals_select_own` - użytkownicy widzą tylko swoje posiłki
- ✅ `planned_meals_insert_own` - użytkownicy mogą tworzyć tylko swoje posiłki
- ✅ `planned_meals_update_own` - użytkownicy mogą aktualizować tylko swoje posiłki
- ✅ `planned_meals_delete_own` - użytkownicy mogą usuwać tylko swoje posiłki

#### Nowe Indeksy Wydajnościowe

**Lokalizacja:** `supabase/migrations/20251011101810_add_planned_meals_performance_indexes.sql`

- ✅ `idx_planned_meals_recipe` - join planned_meals → recipes
- ✅ `idx_recipe_ingredients_recipe` - join recipes → recipe_ingredients
- ✅ `idx_recipe_ingredients_ingredient` - join recipe_ingredients → ingredients
- ✅ `idx_recipes_total_calories` - filtrowanie zamienników według kalorii

### 6. Dokumentacja

**Lokalizacja:** `.ai/` folder

- ✅ [10b01 api-planned-meals-implementation-plan.md](.ai/10b01 api-planned-meals-implementation-plan.md) - szczegółowy plan
- ✅ [10b02 planned-meals-database-setup.md](.ai/10b02 planned-meals-database-setup.md) - RLS i indeksy
- ✅ [10b03 deployment-checklist.md](.ai/10b03 deployment-checklist.md) - checklist wdrożenia
- ✅ [10b04 manual-migration-guide.md](.ai/10b04 manual-migration-guide.md) - instrukcja ręcznej migracji

### 7. Skrypty Pomocnicze

- ✅ [supabase/verify_indexes.sql](supabase/verify_indexes.sql) - weryfikacja indeksów i wydajności

---

## 🚀 Jak Wdrożyć?

### Krok 1: Zastosuj Migrację Bazy Danych

**Opcja A: Przez Supabase CLI (zalecane, jeśli projekt jest połączony)**

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push --linked
```

**Opcja B: Ręcznie przez Dashboard (jeśli CLI nie jest skonfigurowane)**

Szczegółowa instrukcja: [.ai/10b04 manual-migration-guide.md](.ai/10b04 manual-migration-guide.md)

Krótko:

1. Zaloguj się do Supabase Dashboard
2. Otwórz SQL Editor
3. Skopiuj zawartość `supabase/migrations/20251011101810_add_planned_meals_performance_indexes.sql`
4. Uruchom zapytanie
5. Zweryfikuj indeksy (użyj `supabase/verify_indexes.sql`)

### Krok 2: Deploy Aplikacji

```bash
# Commit zmian
git add .
git commit -m "feat(api): implement planned-meals endpoints with performance indexes

- Add GET /api/planned-meals
- Add PATCH /api/planned-meals/{id}
- Add GET /api/planned-meals/{id}/replacements
- Apply performance indexes migration

🤖 Generated with Claude Code"

# Push do repozytorium
git push origin main
```

Jeśli używasz Cloudflare Pages z GitHub integration, deployment rozpocznie się automatycznie.

### Krok 3: Weryfikacja

Po wdrożeniu przetestuj endpointy (Postman/Insomnia):

**Test 1: GET /api/planned-meals**

```http
GET https://your-app.pages.dev/api/planned-meals?start_date=2024-01-01&end_date=2024-01-07
Authorization: Bearer YOUR_SUPABASE_TOKEN
```

**Test 2: PATCH /api/planned-meals/{id}**

```http
PATCH https://your-app.pages.dev/api/planned-meals/123
Authorization: Bearer YOUR_SUPABASE_TOKEN
Content-Type: application/json

{
  "action": "mark_eaten",
  "is_eaten": true
}
```

**Test 3: GET /api/planned-meals/{id}/replacements**

```http
GET https://your-app.pages.dev/api/planned-meals/123/replacements
Authorization: Bearer YOUR_SUPABASE_TOKEN
```

---

## 🔑 Kluczowe Funkcjonalności

### Bezpieczeństwo

- ✅ Weryfikacja użytkownika przez `supabase.auth.getUser()`
- ✅ Sprawdzanie własności zasobów przed operacją
- ✅ RLS policies na poziomie bazy danych
- ✅ Walidacja wszystkich danych wejściowych (Zod)

### Walidacja Biznesowa

- ✅ Wymiana przepisu: musi być tego samego `meal_type` i różnica kaloryczna ±15%
- ✅ Modyfikacja składników: tylko składniki `is_scalable`, zmiana ±10%
- ✅ Zakres dat: maksymalnie 30 dni (ochrona przed performance issues)

### Wydajność

- ✅ 7 indeksów (3 istniejące + 4 nowe)
- ✅ Optymalizowane zapytania JOIN z eager loading
- ✅ Ograniczenie wyników (LIMIT 10 dla zamienników)

---

## 📊 Status Build

```bash
npm run build
```

**Status:** ✅ **Sukces** (2025-10-11)

Ostrzeżenie ESLint (niezwiązane z tą implementacją):

```
./src/lib/validation/recipes.ts
51:48  Warning: Unexpected any. Specify a different type.
```

---

## 📚 Architektura

### Pattern: Server Actions + Route Handlers

```
Client Request
    ↓
API Route Handler (app/api/planned-meals/**/route.ts)
    ├─ Walidacja podstawowa (sprawdzenie parametrów)
    ├─ Parsowanie query/body
    ↓
Server Action (src/lib/actions/planned-meals.ts)
    ├─ Walidacja Zod (pełna)
    ├─ Autoryzacja (getUser)
    ├─ Logika biznesowa
    ├─ Zapytania Supabase (z RLS)
    ↓
Transformacja do DTO
    ↓
Response (JSON)
```

### Zgodność z Wytycznymi Projektu

✅ **TypeScript Strict Mode** - wszystkie typy poprawne
✅ **RLS dla każdej tabeli** - 4 policies dla `planned_meals`
✅ **Server Components domyślnie** - Route Handlers są serwerowe
✅ **Walidacja na serwerze** - Zod w Server Actions
✅ **Path Aliases** - `@/lib`, `@/types`, `@/components`
✅ **Conventional Commits** - gotowy szablon commit message
✅ **Komunikacja po polsku** - wszystkie komunikaty błędów

---

## 🔍 Monitoring (Po Wdrożeniu)

### Dzień 1

- [ ] Sprawdź logi aplikacji (Cloudflare/Vercel)
- [ ] Sprawdź logi Supabase (API Logs)
- [ ] Test wszystkich 3 endpointów
- [ ] Sprawdź czasy odpowiedzi (powinny być < 200ms)

### Tydzień 1

```sql
-- Uruchom w Supabase SQL Editor
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans
FROM pg_stat_user_indexes
WHERE schemaname IN ('public', 'content')
  AND idx_scan > 0
ORDER BY idx_scan DESC;
```

Sprawdź, czy nowe indeksy są używane (scans > 0).

### Miesiąc 1

- Sprawdź wolne zapytania (jeśli są)
- Rozważ optymalizację na podstawie rzeczywistego użycia
- Zaktualizuj dokumentację, jeśli były zmiany

---

## 📖 Dokumentacja API

### GET /api/planned-meals

**Query Params:**

- `start_date` (string, YYYY-MM-DD, wymagane) - data początkowa
- `end_date` (string, YYYY-MM-DD, wymagane) - data końcowa (max 30 dni od start_date)

**Response:** `PlannedMealDTO[]`

**Kody statusu:**

- `200` - sukces
- `400` - nieprawidłowe parametry
- `401` - brak autoryzacji

### PATCH /api/planned-meals/{id}

**Path Params:**

- `id` (number) - ID zaplanowanego posiłku

**Body (discriminated union):**

Wariant 1 - Oznaczenie jako zjedzony:

```json
{
  "action": "mark_eaten",
  "is_eaten": true
}
```

Wariant 2 - Wymiana przepisu:

```json
{
  "action": "swap_recipe",
  "recipe_id": 105
}
```

Wariant 3 - Modyfikacja składników:

```json
{
  "action": "modify_ingredients",
  "ingredient_overrides": [{ "ingredient_id": 12, "new_amount": 150 }]
}
```

**Response:** `PlannedMealDTO`

**Kody statusu:**

- `200` - sukces
- `400` - walidacja nie powiodła się
- `401` - brak autoryzacji
- `403` - brak uprawnień (nie Twój posiłek)
- `404` - posiłek nie znaleziony

### GET /api/planned-meals/{id}/replacements

**Path Params:**

- `id` (number) - ID zaplanowanego posiłku

**Response:** `ReplacementRecipeDTO[]` (max 10 elementów)

**Kody statusu:**

- `200` - sukces (może być pusta tablica)
- `401` - brak autoryzacji
- `403` - brak uprawnień
- `404` - posiłek nie znaleziony

---

## 🆘 Troubleshooting

### Problem: "Authentication required"

**Przyczyna:** Brak lub nieprawidłowy token w headerze `Authorization`

**Rozwiązanie:**

1. Upewnij się, że wysyłasz header: `Authorization: Bearer YOUR_TOKEN`
2. Token pobierz z Supabase (zaloguj użytkownika i użyj `session.access_token`)

### Problem: "You don't have permission to modify this meal"

**Przyczyna:** Próba modyfikacji cudzego posiłku

**Rozwiązanie:**
RLS policies działają poprawnie - możesz modyfikować tylko swoje posiłki.

### Problem: Wolne zapytania (>200ms)

**Rozwiązanie:**

1. Sprawdź, czy indeksy zostały utworzone (`verify_indexes.sql`)
2. Uruchom `ANALYZE` na tabelach
3. Użyj `EXPLAIN ANALYZE` aby zobaczyć plan wykonania

### Problem: Indeksy nie są używane

**Rozwiązanie:**

1. Sprawdź statystyki: `SELECT * FROM pg_stat_user_indexes`
2. Odśwież statystyki: `ANALYZE table_name`
3. Sprawdź, czy zapytania pasują do indeksów

---

## ✨ Next Steps (Opcjonalne)

### Testy (Zalecane)

- [ ] Unit tests dla Server Actions (Vitest)
- [ ] Tests dla walidacji Zod
- [ ] E2E tests dla endpointów (Playwright)

### Optymalizacja (Jeśli potrzebna)

- [ ] Caching z TanStack Query (staleTime: 5 min)
- [ ] Redis dla często używanych danych
- [ ] Materialized views dla agregacji

### Monitoring (Produkcja)

- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (New Relic, Datadog)
- [ ] Alerting dla błędów 500

---

## 📞 Kontakt

### Resources

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

### Troubleshooting

- Sprawdź logi w Supabase Dashboard → Logs
- Użyj `EXPLAIN ANALYZE` dla wolnych zapytań
- Sprawdź RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'planned_meals'`

---

**Status:** ✅ **Ready for Production**
**Data utworzenia:** 2025-10-11
**Autor:** Claude Code (AI Assistant)
**Build Status:** ✅ Sukces
**Migracja:** Gotowa do zastosowania

---

## 🎯 Quick Start

```bash
# 1. Zastosuj migrację (ręcznie przez Dashboard lub CLI)
npx supabase db push --linked

# 2. Zweryfikuj indeksy
# Uruchom supabase/verify_indexes.sql w SQL Editor

# 3. Deploy aplikacji
git add .
git commit -m "feat(api): implement planned-meals endpoints"
git push origin main

# 4. Test endpointów
# Użyj Postman/Insomnia z przykładami powyżej
```

**Gotowe!** 🚀
