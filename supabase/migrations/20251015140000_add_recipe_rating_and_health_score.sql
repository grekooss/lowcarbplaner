-- ============================================================================
-- Migration: Add rating, reviews count and health score to recipes
-- Description: Adds rating, reviews_count and health_score fields to recipes table
-- Tables Affected: public.recipes
-- Special Notes:
--   - Rating: decimal 0.0-5.0, default NULL (not rated)
--   - Reviews count: integer >= 0, default 0
--   - Health score: integer 0-100, default NULL (not calculated)
-- ============================================================================

-- ============================================================================
-- 1. Add rating column to recipes table
-- ============================================================================

-- Add average_rating column (decimal 0.0-5.0)
-- NULL = nie ma jeszcze ocen
ALTER TABLE public.recipes
  ADD COLUMN average_rating DECIMAL(3,2);

-- Add constraint: rating musi być między 0.0 a 5.0
ALTER TABLE public.recipes
  ADD CONSTRAINT recipes_average_rating_range
    CHECK (average_rating >= 0.0 AND average_rating <= 5.0);

COMMENT ON COLUMN public.recipes.average_rating IS
  'Average user rating (0.0-5.0). NULL if not rated yet.';

-- ============================================================================
-- 2. Add reviews count column to recipes table
-- ============================================================================

-- Add reviews_count column (integer >= 0)
-- Default: 0 (brak recenzji)
ALTER TABLE public.recipes
  ADD COLUMN reviews_count INTEGER NOT NULL DEFAULT 0;

-- Add constraint: reviews_count nie może być ujemny
ALTER TABLE public.recipes
  ADD CONSTRAINT recipes_reviews_count_non_negative
    CHECK (reviews_count >= 0);

COMMENT ON COLUMN public.recipes.reviews_count IS
  'Total number of user reviews. Default: 0';

-- ============================================================================
-- 3. Add health score column to recipes table
-- ============================================================================

-- Add health_score column (integer 0-100)
-- NULL = nie obliczony jeszcze
ALTER TABLE public.recipes
  ADD COLUMN health_score INTEGER;

-- Add constraint: health_score musi być między 0 a 100
ALTER TABLE public.recipes
  ADD CONSTRAINT recipes_health_score_range
    CHECK (health_score >= 0 AND health_score <= 100);

COMMENT ON COLUMN public.recipes.health_score IS
  'Health score based on nutritional value and ingredients (0-100). NULL if not calculated yet.';

-- ============================================================================
-- 4. Add indexes for filtering and sorting
-- ============================================================================

-- Index for filtering by rating
CREATE INDEX IF NOT EXISTS idx_recipes_average_rating
  ON public.recipes(average_rating DESC NULLS LAST);

COMMENT ON INDEX idx_recipes_average_rating IS
  'Index for sorting recipes by rating (highest first)';

-- Index for filtering by health score
CREATE INDEX IF NOT EXISTS idx_recipes_health_score
  ON public.recipes(health_score DESC NULLS LAST);

COMMENT ON INDEX idx_recipes_health_score IS
  'Index for sorting recipes by health score (highest first)';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Summary:
-- ✅ Added average_rating column (DECIMAL 0.0-5.0, nullable)
-- ✅ Added reviews_count column (INTEGER >= 0, default 0)
-- ✅ Added health_score column (INTEGER 0-100, nullable)
-- ✅ Added constraints for valid ranges
-- ✅ Added indexes for performance (sorting by rating/health score)
--
-- Next steps:
-- 1. Regenerate database types: npx supabase gen types typescript --local > src/types/database.types.ts
-- 2. Update RecipeDTO in TypeScript to include new fields
-- 3. Update UI components to display rating, reviews count, health score
-- 4. Implement health score calculation algorithm
-- 5. Add user reviews/ratings functionality (future feature)
-- ============================================================================
