-- =====================================================================
-- Migration: Add description column to ingredients
-- Description: Adds an optional description/note field to ingredients
--              for clarifications like "only flesh, no pit/skin"
-- =====================================================================

-- Add description column to ingredients table
ALTER TABLE public.ingredients
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.ingredients.description IS 'Opis składnika, np. "tylko miąższ, bez pestki i skórki"';
