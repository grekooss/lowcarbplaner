-- ============================================================
-- Verification Script: Planned Meals Performance Indexes
-- Description: Skrypt weryfikacyjny dla indeksów wydajnościowych
-- Usage: Uruchom w Supabase SQL Editor po zastosowaniu migracji
-- ============================================================

-- ============================================================
-- 1. Sprawdzenie utworzonych indeksów
-- ============================================================
-- Ten query pokaże wszystkie indeksy dla tabel związanych z planned-meals

SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  indexdef
FROM pg_indexes
WHERE tablename IN ('planned_meals', 'recipes', 'recipe_ingredients', 'ingredients')
  AND schemaname IN ('public', 'content')
ORDER BY schemaname, tablename, indexname;

-- Oczekiwane nowe indeksy (po migracji 20251011101810):
-- ✓ idx_planned_meals_recipe
-- ✓ idx_recipe_ingredients_recipe
-- ✓ idx_recipe_ingredients_ingredient
-- ✓ idx_recipes_total_calories


-- ============================================================
-- 2. Weryfikacja komentarzy do indeksów
-- ============================================================
-- Sprawdza, czy komentarze dokumentacyjne zostały dodane

SELECT
  n.nspname as schema,
  c.relname as index_name,
  pg_catalog.obj_description(c.oid, 'pg_class') as description
FROM pg_catalog.pg_class c
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'i'
  AND n.nspname IN ('public', 'content')
  AND c.relname LIKE 'idx_%'
  AND c.relname IN (
    'idx_planned_meals_recipe',
    'idx_recipe_ingredients_recipe',
    'idx_recipe_ingredients_ingredient',
    'idx_recipes_total_calories'
  )
ORDER BY schema, index_name;

-- Oczekiwane: 4 indeksy z polskimi komentarzami


-- ============================================================
-- 3. Test wydajności dla GET /api/planned-meals
-- ============================================================
-- UWAGA: Zastąp 'YOUR_USER_ID' prawdziwym UUID użytkownika

-- Test query (bez EXPLAIN):
-- SELECT pm.*, r.*, ri.*, i.*
-- FROM public.planned_meals pm
-- JOIN content.recipes r ON pm.recipe_id = r.id
-- JOIN content.recipe_ingredients ri ON r.id = ri.recipe_id
-- JOIN content.ingredients i ON ri.ingredient_id = i.id
-- WHERE pm.user_id = 'YOUR_USER_ID'
--   AND pm.meal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days';

-- Test z EXPLAIN ANALYZE (pokazuje plan wykonania):
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT pm.id, pm.meal_date, pm.meal_type, r.name, r.total_calories
FROM public.planned_meals pm
JOIN content.recipes r ON pm.recipe_id = r.id
WHERE pm.user_id = '00000000-0000-0000-0000-000000000000'  -- Zastąp prawdziwym UUID
  AND pm.meal_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
LIMIT 10;

-- Oczekiwane w planie wykonania:
-- ✓ Index Scan using idx_planned_meals_user_date
-- ✓ Nested Loop / Hash Join z użyciem idx_planned_meals_recipe
-- Planning time: < 1 ms
-- Execution time: < 20 ms (zależy od ilości danych)


-- ============================================================
-- 4. Test wydajności dla GET /api/planned-meals/{id}/replacements
-- ============================================================

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, name, meal_types, total_calories,
       total_calories - 450 as calorie_diff
FROM content.recipes
WHERE meal_types @> ARRAY['breakfast']::meal_type_enum[]
  AND total_calories BETWEEN 382.5 AND 517.5  -- ±15% od 450 kcal
ORDER BY ABS(total_calories - 450)
LIMIT 10;

-- Oczekiwane w planie wykonania:
-- ✓ Bitmap Heap Scan on recipes
-- ✓ BitmapAnd (lub Bitmap Index Scan)
--   ✓ Bitmap Index Scan on idx_recipes_meal_types_gin
--   ✓ Bitmap Index Scan on idx_recipes_total_calories
-- Planning time: < 1 ms
-- Execution time: < 10 ms


-- ============================================================
-- 5. Test wydajności dla joinów z recipe_ingredients
-- ============================================================

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT r.id, r.name, ri.base_amount, ri.unit, i.name as ingredient_name
FROM content.recipes r
JOIN content.recipe_ingredients ri ON r.id = ri.recipe_id
JOIN content.ingredients i ON ri.ingredient_id = i.id
WHERE r.id = 1  -- Zastąp prawdziwym ID przepisu
LIMIT 20;

-- Oczekiwane w planie wykonania:
-- ✓ Nested Loop z użyciem idx_recipe_ingredients_recipe
-- ✓ Index Scan using idx_recipe_ingredients_ingredient
-- Planning time: < 1 ms
-- Execution time: < 5 ms


-- ============================================================
-- 6. Statystyki użycia indeksów (uruchom po tygodniu)
-- ============================================================
-- Ten query pokazuje, które indeksy są faktycznie używane w produkcji

SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  CASE
    WHEN idx_scan = 0 THEN '⚠️ Nieużywany'
    WHEN idx_scan < 100 THEN '⚡ Niska użycie'
    WHEN idx_scan < 1000 THEN '✅ Średnia użycie'
    ELSE '🔥 Wysoka użycie'
  END as status
FROM pg_stat_user_indexes
WHERE schemaname IN ('public', 'content')
  AND tablename IN ('planned_meals', 'recipes', 'recipe_ingredients')
ORDER BY idx_scan DESC;

-- Interpretacja:
-- idx_scan > 0: Indeks jest używany ✅
-- idx_scan = 0: Indeks NIE jest używany ⚠️ (może być niepotrzebny)
-- idx_tup_read: Liczba wierszy przeczytanych przez indeks
-- idx_tup_fetch: Liczba wierszy faktycznie pobranych


-- ============================================================
-- 7. Rozmiar tabel i indeksów
-- ============================================================
-- Monitoruj rozmiar indeksów - duże indeksy mogą spowalniać INSERT/UPDATE

SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname IN ('public', 'content')
  AND tablename IN ('planned_meals', 'recipes', 'recipe_ingredients', 'ingredients')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;


-- ============================================================
-- 8. Sprawdzenie fragmentacji indeksów (opcjonalne, zaawansowane)
-- ============================================================
-- Jeśli indeksy są duże i często modyfikowane, mogą być fragmentowane

SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  CASE
    WHEN idx_tup_read = 0 THEN 0
    ELSE ROUND(100.0 * idx_tup_fetch / idx_tup_read, 2)
  END as fetch_ratio_percent
FROM pg_stat_user_indexes
WHERE schemaname IN ('public', 'content')
  AND idx_scan > 0
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

-- fetch_ratio_percent < 50%: Indeks może być fragmentowany (rozważ REINDEX)


-- ============================================================
-- 9. Refresh statystyk (jeśli potrzebne)
-- ============================================================
-- Uruchom po załadowaniu dużej ilości danych lub po tygodniu produkcji

-- ANALYZE public.planned_meals;
-- ANALYZE content.recipes;
-- ANALYZE content.recipe_ingredients;
-- ANALYZE content.ingredients;

-- To pomoże PostgreSQL lepiej optymalizować zapytania


-- ============================================================
-- 10. Podsumowanie sprawdzenia (quick check)
-- ============================================================
-- Quick check - uruchom to query aby szybko sprawdzić czy wszystko OK

SELECT
  'Indexes Created' as check_name,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) >= 4 THEN '✅ OK'
    ELSE '⚠️ Missing indexes'
  END as status
FROM pg_indexes
WHERE indexname IN (
  'idx_planned_meals_recipe',
  'idx_recipe_ingredients_recipe',
  'idx_recipe_ingredients_ingredient',
  'idx_recipes_total_calories'
)
UNION ALL
SELECT
  'RLS Enabled on planned_meals' as check_name,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ OK'
    ELSE '⚠️ RLS not enabled'
  END as status
FROM pg_tables
WHERE tablename = 'planned_meals'
  AND schemaname = 'public'
  AND rowsecurity = true
UNION ALL
SELECT
  'RLS Policies for planned_meals' as check_name,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) >= 4 THEN '✅ OK (SELECT, INSERT, UPDATE, DELETE)'
    ELSE '⚠️ Missing policies'
  END as status
FROM pg_policies
WHERE tablename = 'planned_meals'
  AND schemaname = 'public';

-- Oczekiwane:
-- ✅ Indexes Created: 4
-- ✅ RLS Enabled: 1
-- ✅ RLS Policies: 4


-- ============================================================
-- Koniec skryptu weryfikacyjnego
-- ============================================================
-- Jeśli wszystkie testy przeszły pomyślnie, migracja została zastosowana poprawnie!
-- Możesz teraz wdrożyć aplikację i zacząć używać nowych endpointów.
