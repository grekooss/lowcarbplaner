-- ============================================================================
-- Migration: Add difficulty level and time fields to recipes
-- Description: Adds difficulty_level ENUM and updates recipes table structure
-- Tables Affected: public.recipes
-- Special Notes:
--   - Adds new ENUM type: difficulty_level_enum (easy, medium, hard)
--   - RLS policies remain unchanged (already configured in base migration)
--   - Instructions JSONB structure extended to support prep/cook times
-- ============================================================================

-- ============================================================================
-- 1. Create difficulty_level ENUM type
-- ============================================================================

-- ENUM for recipe difficulty level (easy, medium, hard)
CREATE TYPE difficulty_level_enum AS ENUM ('easy', 'medium', 'hard');

COMMENT ON TYPE difficulty_level_enum IS 'Recipe difficulty level: easy (łatwy), medium (średni), hard (trudny)';

-- ============================================================================
-- 2. Add difficulty_level column to recipes table
-- ============================================================================

-- Add difficulty_level column to public.recipes
-- Default: 'medium' (neutral difficulty for existing recipes)
-- NOT NULL constraint after setting default values for existing records
ALTER TABLE public.recipes
  ADD COLUMN difficulty_level difficulty_level_enum;

-- Set default difficulty for existing recipes (if any)
UPDATE public.recipes
  SET difficulty_level = 'medium'
  WHERE difficulty_level IS NULL;

-- Now make the column NOT NULL (after setting defaults)
ALTER TABLE public.recipes
  ALTER COLUMN difficulty_level SET NOT NULL;

-- Set default value for new recipes
ALTER TABLE public.recipes
  ALTER COLUMN difficulty_level SET DEFAULT 'medium';

COMMENT ON COLUMN public.recipes.difficulty_level IS 'Recipe difficulty level (easy, medium, hard). Default: medium';

-- ============================================================================
-- 3. Add comments for instructions JSONB structure
-- ============================================================================

-- Update comment on instructions column to reflect new structure
-- New structure: { steps: [{step: 1, description: "..."}], prep_time_minutes?: number, cook_time_minutes?: number }
COMMENT ON COLUMN public.recipes.instructions IS
  'Recipe preparation steps and times in JSONB format: { steps: [{ step: number, description: string }], prep_time_minutes?: number, cook_time_minutes?: number }';

-- ============================================================================
-- 4. Add index for difficulty_level filtering
-- ============================================================================

-- Index on difficulty_level for fast filtering by difficulty
-- This index speeds up queries like "SELECT * FROM recipes WHERE difficulty_level = 'easy'"
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty_level
  ON public.recipes(difficulty_level);

COMMENT ON INDEX idx_recipes_difficulty_level IS
  'Index for fast filtering of recipes by difficulty level';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Summary:
-- ✅ Created difficulty_level_enum ENUM type (easy, medium, hard)
-- ✅ Added difficulty_level column to public.recipes with default 'medium'
-- ✅ Updated existing recipes to have 'medium' difficulty
-- ✅ Added index idx_recipes_difficulty_level for performance
-- ✅ Updated instructions column comment to document new JSONB structure
--
-- Next steps:
-- 1. Update RecipeDTO in TypeScript to include difficulty_level field
-- 2. Update recipe creation/import logic to set difficulty_level
-- 3. Update UI components to display difficulty level and times
-- 4. Test filtering recipes by difficulty_level
--
-- JSONB structure for instructions field:
-- {
--   "steps": [
--     { "step": 1, "description": "Pokrój warzywa..." },
--     { "step": 2, "description": "Podgrzej patelnię..." }
--   ],
--   "prep_time_minutes": 15,    // Optional: czas przygotowania
--   "cook_time_minutes": 30      // Optional: czas gotowania
-- }
-- ============================================================================
