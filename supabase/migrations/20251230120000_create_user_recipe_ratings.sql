-- ============================================================================
-- Migration: Create user_recipe_ratings table and rating aggregation
-- Description: Adds table for storing individual user ratings and trigger
--              for automatic average_rating/reviews_count updates
-- Tables Affected: public.user_recipe_ratings (new), public.recipes (update trigger)
-- Special Notes:
--   - Each user can rate each recipe only once (upsert on conflict)
--   - Rating: integer 1-5
--   - Trigger automatically updates recipes.average_rating and reviews_count
-- ============================================================================

-- ============================================================================
-- 1. Create user_recipe_ratings table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_recipe_ratings (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Each user can rate each recipe only once
  CONSTRAINT user_recipe_ratings_unique UNIQUE (user_id, recipe_id),

  -- Rating must be between 1 and 5
  CONSTRAINT user_recipe_ratings_rating_range CHECK (rating >= 1 AND rating <= 5)
);

-- Add comments
COMMENT ON TABLE public.user_recipe_ratings IS
  'Stores individual user ratings for recipes. One rating per user per recipe.';
COMMENT ON COLUMN public.user_recipe_ratings.rating IS
  'User rating from 1 (worst) to 5 (best)';

-- ============================================================================
-- 2. Create indexes for performance
-- ============================================================================

-- Index for querying user's ratings
CREATE INDEX IF NOT EXISTS idx_user_recipe_ratings_user_id
  ON public.user_recipe_ratings(user_id);

-- Index for querying recipe's ratings (for aggregation)
CREATE INDEX IF NOT EXISTS idx_user_recipe_ratings_recipe_id
  ON public.user_recipe_ratings(recipe_id);

-- Index for quick lookup of specific user-recipe combination
CREATE INDEX IF NOT EXISTS idx_user_recipe_ratings_user_recipe
  ON public.user_recipe_ratings(user_id, recipe_id);

-- ============================================================================
-- 3. Create function to update recipe rating aggregates
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_recipe_rating_aggregates()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the recipe's average_rating and reviews_count
  UPDATE public.recipes
  SET
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.user_recipe_ratings
      WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
    ),
    reviews_count = (
      SELECT COUNT(*)
      FROM public.user_recipe_ratings
      WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
    )
  WHERE id = COALESCE(NEW.recipe_id, OLD.recipe_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.update_recipe_rating_aggregates IS
  'Automatically updates recipes.average_rating and reviews_count when ratings change';

-- ============================================================================
-- 4. Create triggers for automatic aggregate updates
-- ============================================================================

-- Trigger for INSERT
CREATE TRIGGER trigger_user_recipe_ratings_insert
  AFTER INSERT ON public.user_recipe_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_recipe_rating_aggregates();

-- Trigger for UPDATE
CREATE TRIGGER trigger_user_recipe_ratings_update
  AFTER UPDATE ON public.user_recipe_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_recipe_rating_aggregates();

-- Trigger for DELETE
CREATE TRIGGER trigger_user_recipe_ratings_delete
  AFTER DELETE ON public.user_recipe_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_recipe_rating_aggregates();

-- ============================================================================
-- 5. Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.user_recipe_ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all ratings (for transparency)
CREATE POLICY "Anyone can view ratings"
  ON public.user_recipe_ratings
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert their own ratings
CREATE POLICY "Users can insert own ratings"
  ON public.user_recipe_ratings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own ratings
CREATE POLICY "Users can update own ratings"
  ON public.user_recipe_ratings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own ratings
CREATE POLICY "Users can delete own ratings"
  ON public.user_recipe_ratings
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 6. Create function for updated_at trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_user_recipe_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER trigger_user_recipe_ratings_updated_at
  BEFORE UPDATE ON public.user_recipe_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_recipe_ratings_updated_at();

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Summary:
-- 1. Created user_recipe_ratings table with proper constraints
-- 2. Added indexes for performance (user_id, recipe_id, composite)
-- 3. Created trigger function to auto-update recipes.average_rating/reviews_count
-- 4. Added INSERT/UPDATE/DELETE triggers for automatic aggregation
-- 5. Enabled RLS with appropriate policies
-- 6. Added updated_at trigger for tracking modifications
--
-- Next steps:
-- 1. Run: npx supabase gen types typescript --project-id "<project-ref>" --schema public > src/types/database.types.ts
-- 2. Create Server Action for rating recipes
-- 3. Add UI component for rating in RecipeDetailClient
-- ============================================================================
