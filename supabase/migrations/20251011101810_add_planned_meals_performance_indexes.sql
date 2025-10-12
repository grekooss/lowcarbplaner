-- ============================================================
-- Migration: Add Performance Indexes for Planned Meals API (v2 - Fixed)
-- Description: Dodatkowe indeksy dla optymalizacji endpointów planned-meals
-- Created: 2025-10-11 (Updated)
-- Related: .ai/10b01 api-planned-meals-implementation-plan.md
-- ============================================================
-- UWAGA: Ta wersja zakłada, że wszystkie tabele są w schemacie PUBLIC
--        (zgodnie z rzeczywistą strukturą bazy danych)
-- ============================================================

-- ============================================================
-- 1. Indeks na recipe_id w planned_meals
-- ============================================================
-- Cel: Przyspieszenie joinów między planned_meals → recipes
-- Używany w: GET /api/planned-meals, PATCH /api/planned-meals/{id}
-- Pattern: SELECT * FROM planned_meals WHERE recipe_id = ?

create index if not exists idx_planned_meals_recipe
  on public.planned_meals (recipe_id);

comment on index public.idx_planned_meals_recipe is
  'Optymalizacja joinów planned_meals → recipes dla endpointów API';


-- ============================================================
-- 2. Indeks na recipe_ingredients(recipe_id)
-- ============================================================
-- Cel: Przyspieszenie joinów recipes → recipe_ingredients
-- Używany w: GET /api/planned-meals (eager loading składników)
-- Pattern: SELECT * FROM recipe_ingredients WHERE recipe_id = ?

create index if not exists idx_recipe_ingredients_recipe
  on public.recipe_ingredients (recipe_id);

comment on index public.idx_recipe_ingredients_recipe is
  'Optymalizacja joinów recipes → recipe_ingredients dla listowania posiłków';


-- ============================================================
-- 3. Indeks na recipe_ingredients(ingredient_id)
-- ============================================================
-- Cel: Przyspieszenie joinów recipe_ingredients → ingredients
-- Używany w: GET /api/planned-meals (eager loading szczegółów składników)
-- Pattern: SELECT * FROM ingredients WHERE id = ?

create index if not exists idx_recipe_ingredients_ingredient
  on public.recipe_ingredients (ingredient_id);

comment on index public.idx_recipe_ingredients_ingredient is
  'Optymalizacja joinów recipe_ingredients → ingredients';


-- ============================================================
-- 4. Indeks na recipes.total_calories
-- ============================================================
-- Cel: Przyspieszenie wyszukiwania zamienników w zakresie kalorycznym
-- Używany w: GET /api/planned-meals/{id}/replacements
-- Pattern: SELECT * FROM recipes WHERE total_calories BETWEEN ? AND ?

create index if not exists idx_recipes_total_calories
  on public.recipes (total_calories);

comment on index public.idx_recipes_total_calories is
  'Optymalizacja wyszukiwania zamienników przepisów według kalorii (±15%)';


-- ============================================================
-- 5. Weryfikacja utworzonych indeksów
-- ============================================================
-- Query do sprawdzenia, czy indeksy zostały utworzone:
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('planned_meals', 'recipes', 'recipe_ingredients')
--   AND schemaname = 'public'
-- ORDER BY tablename, indexname;


-- ============================================================
-- 6. Analiza użycia indeksów (do wykonania po wdrożeniu)
-- ============================================================
-- Po wdrożeniu warto sprawdzić, czy indeksy są używane:
--
-- EXPLAIN ANALYZE
-- SELECT pm.*, r.*, ri.*, i.*
-- FROM public.planned_meals pm
-- JOIN public.recipes r ON pm.recipe_id = r.id
-- JOIN public.recipe_ingredients ri ON r.id = ri.recipe_id
-- JOIN public.ingredients i ON ri.ingredient_id = i.id
-- WHERE pm.user_id = 'some-uuid'
--   AND pm.meal_date BETWEEN '2024-01-01' AND '2024-01-07';
--
-- Oczekiwane: Index Scan using idx_planned_meals_user_date
--
-- EXPLAIN ANALYZE
-- SELECT * FROM public.recipes
-- WHERE meal_types @> ARRAY['breakfast']::meal_type_enum[]
--   AND total_calories BETWEEN 382.5 AND 517.5
-- ORDER BY total_calories
-- LIMIT 10;
--
-- Oczekiwane: Bitmap Index Scan on idx_recipes_meal_types_gin (jeśli istnieje)
--             + Bitmap Index Scan on idx_recipes_total_calories


-- ============================================================
-- 7. Statystyki tabel (do aktualizacji po wdrożeniu)
-- ============================================================
-- Po załadowaniu dużej ilości danych warto odświeżyć statystyki:
-- ANALYZE public.planned_meals;
-- ANALYZE public.recipes;
-- ANALYZE public.recipe_ingredients;
-- ANALYZE public.ingredients;
