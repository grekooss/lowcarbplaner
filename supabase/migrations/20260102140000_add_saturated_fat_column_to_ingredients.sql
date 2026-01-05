-- ============================================================
-- Migration: Add saturated fat column to ingredients
-- Description: Adds saturated_fat_per_100_units column for health-conscious tracking
--              Important for users monitoring cardiovascular health on keto diets
-- Tables Affected:
--   - public.ingredients (add saturated_fat_per_100_units)
--   - public.recipe_ingredients (add saturated_fat_g)
--   - public.recipes (add total_saturated_fat_g)
-- ============================================================

-- ============================================================
-- 1. Add saturated_fat column to public.ingredients
-- ============================================================
ALTER TABLE public.ingredients
ADD COLUMN IF NOT EXISTS saturated_fat_per_100_units NUMERIC(8, 2) NOT NULL DEFAULT 0;

-- Add check constraint separately (in case column already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ingredients_saturated_fat_per_100_units_check'
  ) THEN
    ALTER TABLE public.ingredients
    ADD CONSTRAINT ingredients_saturated_fat_per_100_units_check
    CHECK (saturated_fat_per_100_units >= 0);
  END IF;
END $$;

COMMENT ON COLUMN public.ingredients.saturated_fat_per_100_units IS
'Saturated fat content per 100 units. Important for cardiovascular health monitoring, especially on high-fat keto diets.';

-- ============================================================
-- 2. Add saturated_fat column to recipe_ingredients (denormalized)
-- ============================================================
ALTER TABLE public.recipe_ingredients
ADD COLUMN IF NOT EXISTS saturated_fat_g NUMERIC(8, 2);

-- Add check constraint separately
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recipe_ingredients_saturated_fat_g_check'
  ) THEN
    ALTER TABLE public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_saturated_fat_g_check
    CHECK (saturated_fat_g >= 0);
  END IF;
END $$;

COMMENT ON COLUMN public.recipe_ingredients.saturated_fat_g IS
'Denormalized saturated fat for base_amount, calculated automatically by trigger.';

-- ============================================================
-- 3. Add total_saturated_fat_g column to recipes
-- ============================================================
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS total_saturated_fat_g NUMERIC(8, 2);

-- Add check constraint separately
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recipes_total_saturated_fat_g_check'
  ) THEN
    ALTER TABLE public.recipes
    ADD CONSTRAINT recipes_total_saturated_fat_g_check
    CHECK (total_saturated_fat_g >= 0);
  END IF;
END $$;

COMMENT ON COLUMN public.recipes.total_saturated_fat_g IS
'Denormalized total saturated fat calculated from base ingredients, updated automatically by trigger.';

-- ============================================================
-- 4. Update trigger function to include saturated fat calculation
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
    COALESCE(polyols_per_100_units, 0) as polyols_per_100_units,
    COALESCE(saturated_fat_per_100_units, 0) as saturated_fat_per_100_units
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
  NEW.saturated_fat_g := ROUND((NEW.base_amount * v_ingredient.saturated_fat_per_100_units / 100)::NUMERIC, 2);

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION calculate_recipe_ingredient_nutrition() IS
'Trigger function to automatically calculate and store denormalized nutritional values including fiber, polyols and saturated fat for recipe ingredients.';

-- ============================================================
-- 5. Update trigger function to include saturated fat in recipe totals
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

  -- Calculate totals for net carbs calculation
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
    total_net_carbs_g = GREATEST(0, v_total_carbs - v_total_fiber - v_total_polyols),
    total_saturated_fat_g = (
      SELECT COALESCE(SUM(saturated_fat_g), 0)
      FROM public.recipe_ingredients
      WHERE recipe_id = v_recipe_id
    )
  WHERE id = v_recipe_id;

  RETURN NULL; -- Result is ignored for AFTER triggers
END;
$$;

COMMENT ON FUNCTION update_recipe_total_nutrition() IS
'Trigger function to automatically recalculate total recipe nutritional values including fiber, polyols, net carbs and saturated fat when ingredients are modified.';

-- ============================================================
-- 6. Recalculate all recipe_ingredients saturated_fat values
-- ============================================================
UPDATE public.recipe_ingredients ri
SET saturated_fat_g = ROUND((ri.base_amount * COALESCE(i.saturated_fat_per_100_units, 0) / 100)::NUMERIC, 2)
FROM public.ingredients i
WHERE ri.ingredient_id = i.id;

-- ============================================================
-- 7. Recalculate all recipe total_saturated_fat_g values
-- ============================================================
UPDATE public.recipes r
SET total_saturated_fat_g = (
  SELECT COALESCE(SUM(saturated_fat_g), 0)
  FROM public.recipe_ingredients
  WHERE recipe_id = r.id
);

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Verify migration with:
-- SELECT name, fats_per_100_units as total_fat, saturated_fat_per_100_units as saturated_fat,
--        (fats_per_100_units - saturated_fat_per_100_units) as unsaturated_fat
-- FROM public.ingredients
-- WHERE fats_per_100_units > 0
-- ORDER BY saturated_fat_per_100_units DESC
-- LIMIT 20;
