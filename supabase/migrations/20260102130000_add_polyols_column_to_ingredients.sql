-- ============================================================
-- Migration: Add polyols column to ingredients
-- Description: Adds polyols_per_100_units column for Net Carbs calculation
--              Net Carbs = Total Carbs - Fiber - Polyols
--              Essential for keto diets with sugar alcohols (erythritol, xylitol, etc.)
-- Tables Affected:
--   - public.ingredients (add polyols_per_100_units)
--   - public.recipe_ingredients (add polyols_g)
--   - public.recipes (update total_net_carbs_g calculation)
-- ============================================================

-- ============================================================
-- 1. Add polyols column to public.ingredients
-- ============================================================
ALTER TABLE public.ingredients
ADD COLUMN IF NOT EXISTS polyols_per_100_units NUMERIC(8, 2) NOT NULL DEFAULT 0;

-- Add check constraint separately (in case column already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ingredients_polyols_per_100_units_check'
  ) THEN
    ALTER TABLE public.ingredients
    ADD CONSTRAINT ingredients_polyols_per_100_units_check
    CHECK (polyols_per_100_units >= 0);
  END IF;
END $$;

COMMENT ON COLUMN public.ingredients.polyols_per_100_units IS
'Polyols (sugar alcohols) content per 100 units. Includes erythritol, xylitol, maltitol, etc. Net Carbs = carbs - fiber - polyols. Essential for keto diets.';

-- ============================================================
-- 2. Add polyols column to recipe_ingredients (denormalized)
-- ============================================================
ALTER TABLE public.recipe_ingredients
ADD COLUMN IF NOT EXISTS polyols_g NUMERIC(8, 2);

-- Add check constraint separately
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recipe_ingredients_polyols_g_check'
  ) THEN
    ALTER TABLE public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_polyols_g_check
    CHECK (polyols_g >= 0);
  END IF;
END $$;

COMMENT ON COLUMN public.recipe_ingredients.polyols_g IS
'Denormalized polyols for base_amount, calculated automatically by trigger.';

-- ============================================================
-- 3. Add total_polyols_g column to recipes
-- ============================================================
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS total_polyols_g NUMERIC(8, 2);

-- Add check constraint separately
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recipes_total_polyols_g_check'
  ) THEN
    ALTER TABLE public.recipes
    ADD CONSTRAINT recipes_total_polyols_g_check
    CHECK (total_polyols_g >= 0);
  END IF;
END $$;

COMMENT ON COLUMN public.recipes.total_polyols_g IS
'Denormalized total polyols calculated from base ingredients, updated automatically by trigger.';

-- ============================================================
-- 4. Update trigger function to include polyols calculation
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
    COALESCE(fiber_per_100_units, 0) as fiber_per_100_units,
    COALESCE(polyols_per_100_units, 0) as polyols_per_100_units
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
  NEW.polyols_g := ROUND((NEW.base_amount * v_ingredient.polyols_per_100_units / 100)::NUMERIC, 2);

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION calculate_recipe_ingredient_nutrition() IS
'Trigger function to automatically calculate and store denormalized nutritional values including fiber and polyols for recipe ingredients.';

-- ============================================================
-- 5. Update trigger function to include polyols in recipe totals
-- ============================================================
CREATE OR REPLACE FUNCTION update_recipe_total_nutrition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_recipe_id BIGINT;
  v_total_carbs NUMERIC;
  v_total_fiber NUMERIC;
  v_total_polyols NUMERIC;
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
    COALESCE(SUM(fiber_g), 0),
    COALESCE(SUM(polyols_g), 0)
  INTO v_total_carbs, v_total_fiber, v_total_polyols
  FROM public.recipe_ingredients
  WHERE recipe_id = v_recipe_id;

  -- Recalculate and update total nutritional values by summing all ingredients
  -- Net Carbs = Total Carbs - Fiber - Polyols (minimum 0)
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
    total_polyols_g = v_total_polyols,
    total_net_carbs_g = GREATEST(0, v_total_carbs - v_total_fiber - v_total_polyols)
  WHERE id = v_recipe_id;

  RETURN NULL; -- Result is ignored for AFTER triggers
END;
$$;

COMMENT ON FUNCTION update_recipe_total_nutrition() IS
'Trigger function to automatically recalculate total recipe nutritional values including fiber, polyols and net carbs when ingredients are modified.';

-- ============================================================
-- 6. Populate polyols values for sweeteners
-- ============================================================
-- Sugar alcohols (polyols) - most common keto sweeteners
-- These have carbs on the label but don't impact blood sugar

-- Erytrytol - 0 calories, 100% carbs are polyols (GI = 0)
UPDATE public.ingredients SET polyols_per_100_units = 100.00 WHERE name ILIKE '%erytrytol%';

-- Ksylitol - ~2.4 kcal/g, 100% carbs are polyols (GI ≈ 13)
UPDATE public.ingredients SET polyols_per_100_units = 100.00 WHERE name ILIKE '%ksylitol%';

-- Maltitol - ~2.1 kcal/g, 100% carbs are polyols (GI ≈ 35) - less keto-friendly
UPDATE public.ingredients SET polyols_per_100_units = 100.00 WHERE name ILIKE '%maltitol%';

-- Sorbitol - ~2.6 kcal/g, 100% carbs are polyols (GI ≈ 9)
UPDATE public.ingredients SET polyols_per_100_units = 100.00 WHERE name ILIKE '%sorbitol%';

-- Mannitol - ~1.6 kcal/g, 100% carbs are polyols (GI = 0)
UPDATE public.ingredients SET polyols_per_100_units = 100.00 WHERE name ILIKE '%mannitol%';

-- Izomalt - ~2 kcal/g, 100% carbs are polyols (GI ≈ 9)
UPDATE public.ingredients SET polyols_per_100_units = 100.00 WHERE name ILIKE '%izomalt%';

-- Stewia - no polyols (it's a natural sweetener with 0 carbs)
-- Monk fruit (owoc mnicha) - no polyols (natural sweetener)
-- Sukraloza - no polyols (artificial sweetener)

-- ============================================================
-- 7. Recalculate all recipe_ingredients polyols values
-- ============================================================
UPDATE public.recipe_ingredients ri
SET polyols_g = ROUND((ri.base_amount * COALESCE(i.polyols_per_100_units, 0) / 100)::NUMERIC, 2)
FROM public.ingredients i
WHERE ri.ingredient_id = i.id;

-- ============================================================
-- 8. Recalculate all recipe total_polyols_g and total_net_carbs_g values
-- ============================================================
UPDATE public.recipes r
SET
  total_polyols_g = (
    SELECT COALESCE(SUM(polyols_g), 0)
    FROM public.recipe_ingredients
    WHERE recipe_id = r.id
  ),
  total_net_carbs_g = GREATEST(0,
    COALESCE(r.total_carbs_g, 0)
    - COALESCE(r.total_fiber_g, 0)
    - (
      SELECT COALESCE(SUM(polyols_g), 0)
      FROM public.recipe_ingredients
      WHERE recipe_id = r.id
    )
  );

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Verify migration with:
-- SELECT name, carbs_per_100_units as total_carbs,
--        fiber_per_100_units as fiber, polyols_per_100_units as polyols,
--        (carbs_per_100_units - fiber_per_100_units - polyols_per_100_units) as net_carbs
-- FROM public.ingredients
-- WHERE polyols_per_100_units > 0 OR fiber_per_100_units > 0
-- ORDER BY name;
--
-- Test with erythritol:
-- Erytrytol: 100g carbs - 0g fiber - 100g polyols = 0g net carbs
