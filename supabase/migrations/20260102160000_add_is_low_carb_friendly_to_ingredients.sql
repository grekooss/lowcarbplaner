-- =====================================================================
-- Migration: Add is_low_carb_friendly flag to ingredients
-- Description: Adds boolean flag to distinguish low-carb-friendly ingredients
--              from regular/high-carb ingredients. Allows app to support both
--              strict low-carb users and general healthy eating.
-- =====================================================================
-- Low-carb-friendly criteria (general guidelines):
--   - Net carbs per 100g <= 10g (low-carb friendly)
--   - Net carbs per 100g > 10g (not low-carb friendly, higher carb)
-- =====================================================================

-- 1. Add is_low_carb_friendly column with default TRUE (existing ingredients are low-carb)
ALTER TABLE public.ingredients
ADD COLUMN IF NOT EXISTS is_low_carb_friendly BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.ingredients.is_low_carb_friendly IS
'Whether this ingredient is suitable for low-carb diet. Based on net carbs per 100g: TRUE if <= 10g net carbs.';

-- 2. Create index for filtering low-carb ingredients
CREATE INDEX IF NOT EXISTS idx_ingredients_is_low_carb_friendly
ON public.ingredients (is_low_carb_friendly)
WHERE is_low_carb_friendly = TRUE;

-- 3. Update existing ingredients based on net carbs
-- Set is_low_carb_friendly = FALSE for ingredients with > 10g net carbs per 100g
UPDATE public.ingredients
SET is_low_carb_friendly = FALSE
WHERE (carbs_per_100_units - COALESCE(fiber_per_100_units, 0) - COALESCE(polyols_per_100_units, 0)) > 10;

-- =====================================================================
-- MIGRATION COMPLETE
-- =====================================================================
-- Verify with:
-- SELECT name, carbs_per_100_units as carbs, fiber_per_100_units as fiber,
--        (carbs_per_100_units - COALESCE(fiber_per_100_units, 0)) as net_carbs,
--        is_low_carb_friendly
-- FROM public.ingredients
-- ORDER BY is_low_carb_friendly DESC, (carbs_per_100_units - COALESCE(fiber_per_100_units, 0)) ASC;
