-- ============================================================
-- Migration: Add fiber column to ingredients
-- Description: Adds fiber_per_100_units column for Net Carbs calculation
--              Net Carbs = Total Carbs - Fiber (essential for keto/low-carb diets)
-- Tables Affected:
--   - public.ingredients (add fiber_per_100_units)
--   - public.recipe_ingredients (add fiber_g)
--   - public.recipes (add total_fiber_g, total_net_carbs_g)
-- Special Notes:
--   - Updates triggers to calculate fiber values
--   - Populates fiber data for all existing ingredients
--   - Uses ONLY public schema (no content schema)
-- ============================================================

-- ============================================================
-- 1. Add fiber column to public.ingredients
-- ============================================================
ALTER TABLE public.ingredients
ADD COLUMN IF NOT EXISTS fiber_per_100_units NUMERIC(8, 2) NOT NULL DEFAULT 0;

-- Add check constraint separately (in case column already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ingredients_fiber_per_100_units_check'
  ) THEN
    ALTER TABLE public.ingredients
    ADD CONSTRAINT ingredients_fiber_per_100_units_check
    CHECK (fiber_per_100_units >= 0);
  END IF;
END $$;

COMMENT ON COLUMN public.ingredients.fiber_per_100_units IS
'Fiber content per 100 units (g or ml). Used to calculate Net Carbs = carbs - fiber. Essential for keto/low-carb diets.';

-- ============================================================
-- 2. Add fiber column to recipe_ingredients (denormalized)
-- ============================================================
ALTER TABLE public.recipe_ingredients
ADD COLUMN IF NOT EXISTS fiber_g NUMERIC(8, 2);

-- Add check constraint separately
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recipe_ingredients_fiber_g_check'
  ) THEN
    ALTER TABLE public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_fiber_g_check
    CHECK (fiber_g >= 0);
  END IF;
END $$;

COMMENT ON COLUMN public.recipe_ingredients.fiber_g IS
'Denormalized fiber for base_amount, calculated automatically by trigger.';

-- ============================================================
-- 3. Add total_fiber_g and total_net_carbs_g columns to recipes
-- ============================================================
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS total_fiber_g NUMERIC(8, 2);

ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS total_net_carbs_g NUMERIC(8, 2);

-- Add check constraints separately
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recipes_total_fiber_g_check'
  ) THEN
    ALTER TABLE public.recipes
    ADD CONSTRAINT recipes_total_fiber_g_check
    CHECK (total_fiber_g >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recipes_total_net_carbs_g_check'
  ) THEN
    ALTER TABLE public.recipes
    ADD CONSTRAINT recipes_total_net_carbs_g_check
    CHECK (total_net_carbs_g >= 0);
  END IF;
END $$;

COMMENT ON COLUMN public.recipes.total_fiber_g IS
'Denormalized total fiber calculated from base ingredients, updated automatically by trigger.';

COMMENT ON COLUMN public.recipes.total_net_carbs_g IS
'Net carbs = total_carbs_g - total_fiber_g. Essential for keto/low-carb diets.';

-- ============================================================
-- 4. Update trigger function to include fiber calculation
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_recipe_ingredient_nutrition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_ingredient RECORD;
BEGIN
  -- Fetch the ingredient's nutritional values per 100 units from public schema
  SELECT
    calories_per_100_units,
    protein_per_100_units,
    carbs_per_100_units,
    fats_per_100_units,
    COALESCE(fiber_per_100_units, 0) as fiber_per_100_units
  INTO v_ingredient
  FROM public.ingredients
  WHERE id = NEW.ingredient_id;

  -- Calculate denormalized values based on base_amount
  -- Formula: base_amount * (value_per_100_units / 100)
  NEW.calories := ROUND((NEW.base_amount * v_ingredient.calories_per_100_units / 100)::NUMERIC, 2);
  NEW.protein_g := ROUND((NEW.base_amount * v_ingredient.protein_per_100_units / 100)::NUMERIC, 2);
  NEW.carbs_g := ROUND((NEW.base_amount * v_ingredient.carbs_per_100_units / 100)::NUMERIC, 2);
  NEW.fats_g := ROUND((NEW.base_amount * v_ingredient.fats_per_100_units / 100)::NUMERIC, 2);
  NEW.fiber_g := ROUND((NEW.base_amount * v_ingredient.fiber_per_100_units / 100)::NUMERIC, 2);

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION calculate_recipe_ingredient_nutrition() IS
'Trigger function to automatically calculate and store denormalized nutritional values including fiber for recipe ingredients.';

-- ============================================================
-- 5. Update trigger function to include fiber in recipe totals
-- ============================================================
CREATE OR REPLACE FUNCTION update_recipe_total_nutrition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_recipe_id BIGINT;
  v_total_carbs NUMERIC;
  v_total_fiber NUMERIC;
BEGIN
  -- Determine which recipe to update
  IF TG_OP = 'DELETE' THEN
    v_recipe_id := OLD.recipe_id;
  ELSE
    v_recipe_id := NEW.recipe_id;
  END IF;

  -- Calculate totals
  SELECT
    COALESCE(SUM(carbs_g), 0),
    COALESCE(SUM(fiber_g), 0)
  INTO v_total_carbs, v_total_fiber
  FROM public.recipe_ingredients
  WHERE recipe_id = v_recipe_id;

  -- Recalculate and update total nutritional values by summing all ingredients
  UPDATE public.recipes
  SET
    total_calories = (
      SELECT COALESCE(SUM(calories), 0)::INTEGER
      FROM public.recipe_ingredients
      WHERE recipe_id = v_recipe_id
    ),
    total_protein_g = (
      SELECT COALESCE(SUM(protein_g), 0)
      FROM public.recipe_ingredients
      WHERE recipe_id = v_recipe_id
    ),
    total_carbs_g = v_total_carbs,
    total_fats_g = (
      SELECT COALESCE(SUM(fats_g), 0)
      FROM public.recipe_ingredients
      WHERE recipe_id = v_recipe_id
    ),
    total_fiber_g = v_total_fiber,
    total_net_carbs_g = GREATEST(0, v_total_carbs - v_total_fiber)
  WHERE id = v_recipe_id;

  RETURN NULL; -- Result is ignored for AFTER triggers
END;
$$;

COMMENT ON FUNCTION update_recipe_total_nutrition() IS
'Trigger function to automatically recalculate total recipe nutritional values including fiber and net carbs when ingredients are modified.';

-- ============================================================
-- 6. Populate fiber values for existing ingredients
-- ============================================================
-- Data source: USDA FoodData Central
-- Values are for dietary fiber per 100g

-- JAJA (minimal fiber)
UPDATE public.ingredients SET fiber_per_100_units = 0 WHERE name LIKE 'Jajko%';

-- NABIAŁ (minimal fiber)
UPDATE public.ingredients SET fiber_per_100_units = 0 WHERE category = 'dairy';

-- MIĘSO I RYBY (no fiber)
UPDATE public.ingredients SET fiber_per_100_units = 0 WHERE category IN ('meat', 'fish');

-- WARZYWA (high fiber content - critical for net carbs!)
UPDATE public.ingredients SET fiber_per_100_units = 2.6 WHERE name = 'Brokuły';
UPDATE public.ingredients SET fiber_per_100_units = 2.0 WHERE name = 'Kalafior';
UPDATE public.ingredients SET fiber_per_100_units = 2.5 WHERE name = 'Kapusta biała';
UPDATE public.ingredients SET fiber_per_100_units = 2.1 WHERE name = 'Kapusta czerwona';
UPDATE public.ingredients SET fiber_per_100_units = 2.0 WHERE name = 'Kapusta włoska (czarna)';
UPDATE public.ingredients SET fiber_per_100_units = 3.8 WHERE name = 'Brukselka';
UPDATE public.ingredients SET fiber_per_100_units = 3.6 WHERE name = 'Jarmuż (kale)';
UPDATE public.ingredients SET fiber_per_100_units = 1.0 WHERE name = 'Bok choy (kapusta chińska)';
UPDATE public.ingredients SET fiber_per_100_units = 2.2 WHERE name = 'Szpinak (świeży)';
UPDATE public.ingredients SET fiber_per_100_units = 1.1 WHERE name = 'Sałata masłowa';
UPDATE public.ingredients SET fiber_per_100_units = 2.1 WHERE name = 'Sałata rzymska';
UPDATE public.ingredients SET fiber_per_100_units = 1.2 WHERE name = 'Sałata lodowa (góra lodowa)';
UPDATE public.ingredients SET fiber_per_100_units = 1.6 WHERE name = 'Rukola';
UPDATE public.ingredients SET fiber_per_100_units = 3.1 WHERE name = 'Endywia';
UPDATE public.ingredients SET fiber_per_100_units = 1.0 WHERE name = 'Pak choi';
UPDATE public.ingredients SET fiber_per_100_units = 1.2 WHERE name = 'Pomidor';
UPDATE public.ingredients SET fiber_per_100_units = 1.2 WHERE name = 'Pomidory koktajlowe';
UPDATE public.ingredients SET fiber_per_100_units = 12.3 WHERE name = 'Pomidory suszone (w oleju)';
UPDATE public.ingredients SET fiber_per_100_units = 2.1 WHERE name = 'Papryka czerwona';
UPDATE public.ingredients SET fiber_per_100_units = 1.7 WHERE name = 'Papryka zielona';
UPDATE public.ingredients SET fiber_per_100_units = 0.9 WHERE name = 'Papryka żółta';
UPDATE public.ingredients SET fiber_per_100_units = 1.0 WHERE name = 'Cukinia';
UPDATE public.ingredients SET fiber_per_100_units = 3.0 WHERE name = 'Bakłażan';
UPDATE public.ingredients SET fiber_per_100_units = 0.5 WHERE name = 'Ogórek';
UPDATE public.ingredients SET fiber_per_100_units = 6.7 WHERE name = 'Awokado'; -- CRITICAL: 8.5g carbs - 6.7g fiber = 1.8g net carbs!
UPDATE public.ingredients SET fiber_per_100_units = 1.6 WHERE name = 'Rzodkiewka';
UPDATE public.ingredients SET fiber_per_100_units = 1.6 WHERE name = 'Rzodkiew biała (daikon)';
UPDATE public.ingredients SET fiber_per_100_units = 1.6 WHERE name = 'Seler naciowy';
UPDATE public.ingredients SET fiber_per_100_units = 1.8 WHERE name = 'Rzepa';
UPDATE public.ingredients SET fiber_per_100_units = 1.0 WHERE name = 'Pieczarki';
UPDATE public.ingredients SET fiber_per_100_units = 1.3 WHERE name = 'Pieczarki portobello';
UPDATE public.ingredients SET fiber_per_100_units = 17.0 WHERE name = 'Borowiki suszone';
UPDATE public.ingredients SET fiber_per_100_units = 2.5 WHERE name = 'Pieczarki shitake';
UPDATE public.ingredients SET fiber_per_100_units = 2.1 WHERE name = 'Szparagi';
UPDATE public.ingredients SET fiber_per_100_units = 2.7 WHERE name = 'Fasolka szparagowa';
UPDATE public.ingredients SET fiber_per_100_units = 2.0 WHERE name = 'Dynia piżmowa (butternut)';
UPDATE public.ingredients SET fiber_per_100_units = 1.2 WHERE name = 'Kabaczek patison';

-- OWOCE (significant fiber)
UPDATE public.ingredients SET fiber_per_100_units = 2.0 WHERE name = 'Truskawki';
UPDATE public.ingredients SET fiber_per_100_units = 6.5 WHERE name = 'Maliny'; -- 12g carbs - 6.5g fiber = 5.5g net carbs!
UPDATE public.ingredients SET fiber_per_100_units = 2.4 WHERE name = 'Borówki';
UPDATE public.ingredients SET fiber_per_100_units = 2.4 WHERE name = 'Jagody';
UPDATE public.ingredients SET fiber_per_100_units = 5.3 WHERE name = 'Jeżyny';
UPDATE public.ingredients SET fiber_per_100_units = 0.3 WHERE name = 'Cytryna (sok)';
UPDATE public.ingredients SET fiber_per_100_units = 0.4 WHERE name = 'Limonka (sok)';

-- TŁUSZCZE I OLEJE (no fiber)
UPDATE public.ingredients SET fiber_per_100_units = 0 WHERE category = 'oils_fats';

-- ORZECHY I NASIONA (high fiber!)
UPDATE public.ingredients SET fiber_per_100_units = 6.7 WHERE name = 'Orzechy włoskie';
UPDATE public.ingredients SET fiber_per_100_units = 12.5 WHERE name = 'Migdały'; -- 21.6g carbs - 12.5g fiber = 9.1g net carbs
UPDATE public.ingredients SET fiber_per_100_units = 8.6 WHERE name = 'Orzechy makadamia';
UPDATE public.ingredients SET fiber_per_100_units = 9.6 WHERE name = 'Orzechy pekan';
UPDATE public.ingredients SET fiber_per_100_units = 7.5 WHERE name = 'Orzechy brazylijskie';
UPDATE public.ingredients SET fiber_per_100_units = 9.7 WHERE name = 'Orzechy laskowe';
UPDATE public.ingredients SET fiber_per_100_units = 3.3 WHERE name = 'Orzechy nerkowca';
UPDATE public.ingredients SET fiber_per_100_units = 3.7 WHERE name = 'Orzeszki piniowe';
UPDATE public.ingredients SET fiber_per_100_units = 34.4 WHERE name = 'Nasiona chia'; -- 42.1g carbs - 34.4g fiber = 7.7g net carbs!
UPDATE public.ingredients SET fiber_per_100_units = 27.3 WHERE name = 'Nasiona lnu';
UPDATE public.ingredients SET fiber_per_100_units = 8.6 WHERE name = 'Nasiona słonecznika';
UPDATE public.ingredients SET fiber_per_100_units = 6.0 WHERE name = 'Nasiona dyni';
UPDATE public.ingredients SET fiber_per_100_units = 11.8 WHERE name = 'Nasiona sezamu';
UPDATE public.ingredients SET fiber_per_100_units = 9.3 WHERE name = 'Tahini (pasta sezamowa)';
UPDATE public.ingredients SET fiber_per_100_units = 10.5 WHERE name = 'Masło migdałowe (100%)';
UPDATE public.ingredients SET fiber_per_100_units = 6.0 WHERE name = 'Masło orzechowe (100% orzeszków ziemnych)';

-- PRZYPRAWY I ZIOŁA
UPDATE public.ingredients SET fiber_per_100_units = 2.1 WHERE name = 'Czosnek (ząbek)';
UPDATE public.ingredients SET fiber_per_100_units = 1.7 WHERE name = 'Cebula biała';
UPDATE public.ingredients SET fiber_per_100_units = 1.7 WHERE name = 'Cebula czerwona';
UPDATE public.ingredients SET fiber_per_100_units = 3.2 WHERE name = 'Szalotka';
UPDATE public.ingredients SET fiber_per_100_units = 2.0 WHERE name = 'Imbir (świeży)';
UPDATE public.ingredients SET fiber_per_100_units = 1.6 WHERE name = 'Bazylia (świeża)';
UPDATE public.ingredients SET fiber_per_100_units = 2.8 WHERE name = 'Kolendra (świeża)';
UPDATE public.ingredients SET fiber_per_100_units = 3.3 WHERE name = 'Pietruszka (świeża)';
UPDATE public.ingredients SET fiber_per_100_units = 2.1 WHERE name = 'Koper (świeży)';
UPDATE public.ingredients SET fiber_per_100_units = 14.0 WHERE name = 'Tymianek (świeży)';
UPDATE public.ingredients SET fiber_per_100_units = 14.1 WHERE name = 'Rozmaryn (świeży)';
UPDATE public.ingredients SET fiber_per_100_units = 8.0 WHERE name = 'Mięta (świeża)';
UPDATE public.ingredients SET fiber_per_100_units = 2.5 WHERE name = 'Szczypiork (świeży)';
UPDATE public.ingredients SET fiber_per_100_units = 0 WHERE name = 'Sól';
UPDATE public.ingredients SET fiber_per_100_units = 25.3 WHERE name = 'Pieprz czarny';
UPDATE public.ingredients SET fiber_per_100_units = 34.9 WHERE name = 'Papryka słodka';
UPDATE public.ingredients SET fiber_per_100_units = 27.2 WHERE name = 'Papryka ostra';
UPDATE public.ingredients SET fiber_per_100_units = 22.7 WHERE name = 'Kurkuma';
UPDATE public.ingredients SET fiber_per_100_units = 42.5 WHERE name = 'Oregano (suszone)';
UPDATE public.ingredients SET fiber_per_100_units = 10.5 WHERE name = 'Kminek rzymski (kmin)';
UPDATE public.ingredients SET fiber_per_100_units = 53.1 WHERE name = 'Cynamon';
UPDATE public.ingredients SET fiber_per_100_units = 20.8 WHERE name = 'Gałka muszkatołowa';
UPDATE public.ingredients SET fiber_per_100_units = 21.6 WHERE name = 'Ziele angielskie';
UPDATE public.ingredients SET fiber_per_100_units = 40.3 WHERE name = 'Majeranek (suszony)';

-- MĄKI (high fiber for keto flours!)
UPDATE public.ingredients SET fiber_per_100_units = 10.0 WHERE name = 'Mąka migdałowa';
UPDATE public.ingredients SET fiber_per_100_units = 39.0 WHERE name = 'Mąka kokosowa'; -- 60g carbs - 39g fiber = 21g net carbs
UPDATE public.ingredients SET fiber_per_100_units = 27.3 WHERE name = 'Mąka lniana (len mielony)';
UPDATE public.ingredients SET fiber_per_100_units = 85.0 WHERE name = 'Błonnik witalny (psyllium)'; -- Almost pure fiber!

-- SŁODZIKI (no fiber - they're pure sweeteners)
UPDATE public.ingredients SET fiber_per_100_units = 0 WHERE category = 'sweeteners';

-- DODATKI
UPDATE public.ingredients SET fiber_per_100_units = 3.3 WHERE name = 'Musztarda Dijon';
UPDATE public.ingredients SET fiber_per_100_units = 0 WHERE name = 'Majonez';
UPDATE public.ingredients SET fiber_per_100_units = 0.8 WHERE name = 'Sos sojowy';
UPDATE public.ingredients SET fiber_per_100_units = 0 WHERE name = 'Ocet winny';
UPDATE public.ingredients SET fiber_per_100_units = 0 WHERE name = 'Ocet jabłkowy';
UPDATE public.ingredients SET fiber_per_100_units = 4.1 WHERE name = 'Pasta pomidorowa (koncentrat)';
UPDATE public.ingredients SET fiber_per_100_units = 1.2 WHERE name = 'Pomidory krojone (puszka)';
UPDATE public.ingredients SET fiber_per_100_units = 0 WHERE name = 'Bulion warzywny (kostka)';
UPDATE public.ingredients SET fiber_per_100_units = 0 WHERE name = 'Bulion drobiowy (kostka)';

-- NAPOJE (minimal fiber)
UPDATE public.ingredients SET fiber_per_100_units = 0 WHERE name = 'Kawa';
UPDATE public.ingredients SET fiber_per_100_units = 0 WHERE name = 'Herbata';
UPDATE public.ingredients SET fiber_per_100_units = 0 WHERE name = 'Herbata zielona';
UPDATE public.ingredients SET fiber_per_100_units = 0 WHERE name = 'Woda mineralna';
UPDATE public.ingredients SET fiber_per_100_units = 0.2 WHERE name = 'Mleko migdałowe';
UPDATE public.ingredients SET fiber_per_100_units = 2.2 WHERE name = 'Mleko kokosowe';
UPDATE public.ingredients SET fiber_per_100_units = 0 WHERE name = 'Bulion kostny (wołowy)';

-- ============================================================
-- 7. Fix unit conversions for avocado (edible portion only)
-- ============================================================
-- Avocado weights should be for edible portion (without pit and skin)
-- Medium avocado: ~200g total -> ~140g edible
-- Large avocado: ~300g total -> ~210g edible

UPDATE public.ingredient_unit_conversions
SET grams_equivalent = 140.00
WHERE ingredient_id = (SELECT id FROM public.ingredients WHERE name = 'Awokado')
AND unit_name = 'średnie';

UPDATE public.ingredient_unit_conversions
SET grams_equivalent = 210.00
WHERE ingredient_id = (SELECT id FROM public.ingredients WHERE name = 'Awokado')
AND unit_name = 'duże';

-- Add small avocado conversion if not exists
INSERT INTO public.ingredient_unit_conversions (ingredient_id, unit_name, grams_equivalent)
SELECT id, 'małe', 100.00
FROM public.ingredients
WHERE name = 'Awokado'
ON CONFLICT (ingredient_id, unit_name) DO NOTHING;

-- ============================================================
-- 8. Recalculate all recipe_ingredients fiber values
-- ============================================================
-- This updates fiber_g for all existing recipe ingredients
UPDATE public.recipe_ingredients ri
SET fiber_g = ROUND((ri.base_amount * COALESCE(i.fiber_per_100_units, 0) / 100)::NUMERIC, 2)
FROM public.ingredients i
WHERE ri.ingredient_id = i.id;

-- ============================================================
-- 9. Recalculate all recipe total_fiber_g and total_net_carbs_g values
-- ============================================================
UPDATE public.recipes r
SET
  total_fiber_g = (
    SELECT COALESCE(SUM(fiber_g), 0)
    FROM public.recipe_ingredients
    WHERE recipe_id = r.id
  ),
  total_net_carbs_g = GREATEST(0,
    COALESCE(r.total_carbs_g, 0) - (
      SELECT COALESCE(SUM(fiber_g), 0)
      FROM public.recipe_ingredients
      WHERE recipe_id = r.id
    )
  );

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Verify migration with:
-- SELECT name, carbs_per_100_units as total_carbs, fiber_per_100_units as fiber,
--        (carbs_per_100_units - fiber_per_100_units) as net_carbs
-- FROM public.ingredients
-- WHERE fiber_per_100_units > 0
-- ORDER BY fiber_per_100_units DESC
-- LIMIT 20;
--
-- Verify recipes:
-- SELECT name, total_carbs_g, total_fiber_g, total_net_carbs_g
-- FROM public.recipes
-- WHERE total_fiber_g > 0
-- ORDER BY total_net_carbs_g ASC
-- LIMIT 20;
