-- =====================================================================
-- Migration: Add slug column to recipes table
-- Description: Adds SEO-friendly slug for recipe URLs
-- Example: /przepisy/salatka-grecka-z-feta instead of /recipes/123
-- =====================================================================

-- 1. Install unaccent extension (if not exists) for Polish characters handling
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Create function to generate slugs from Polish text
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Convert to lowercase and remove accents
  slug := lower(unaccent(input_text));

  -- Replace Polish special characters that unaccent might miss
  slug := replace(slug, 'ł', 'l');
  slug := replace(slug, 'ą', 'a');
  slug := replace(slug, 'ę', 'e');
  slug := replace(slug, 'ć', 'c');
  slug := replace(slug, 'ń', 'n');
  slug := replace(slug, 'ó', 'o');
  slug := replace(slug, 'ś', 's');
  slug := replace(slug, 'ź', 'z');
  slug := replace(slug, 'ż', 'z');

  -- Replace spaces and special characters with hyphens
  slug := regexp_replace(slug, '[^a-z0-9\-]+', '-', 'g');

  -- Remove leading/trailing hyphens
  slug := trim(both '-' from slug);

  -- Replace multiple consecutive hyphens with single hyphen
  slug := regexp_replace(slug, '-+', '-', 'g');

  RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Add slug column to recipes table
ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS slug TEXT;

-- 4. Generate slugs for existing recipes
UPDATE public.recipes
SET slug = generate_slug(name)
WHERE slug IS NULL;

-- 5. Handle duplicate slugs by appending ID
WITH duplicates AS (
  SELECT id, slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) as rn
  FROM public.recipes
  WHERE slug IS NOT NULL
)
UPDATE public.recipes r
SET slug = r.slug || '-' || r.id
FROM duplicates d
WHERE r.id = d.id AND d.rn > 1;

-- 6. Add unique constraint and NOT NULL after generating slugs
ALTER TABLE public.recipes
ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.recipes
ADD CONSTRAINT recipes_slug_unique UNIQUE (slug);

-- 7. Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_recipes_slug ON public.recipes(slug);

-- 8. Create trigger to auto-generate slug on insert
CREATE OR REPLACE FUNCTION set_recipe_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from name
  base_slug := generate_slug(NEW.name);
  final_slug := base_slug;

  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.recipes WHERE slug = final_slug AND id != COALESCE(NEW.id, 0)) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS trigger_set_recipe_slug ON public.recipes;

-- Create trigger for new inserts
CREATE TRIGGER trigger_set_recipe_slug
BEFORE INSERT ON public.recipes
FOR EACH ROW
WHEN (NEW.slug IS NULL)
EXECUTE FUNCTION set_recipe_slug();

-- 9. Create trigger to update slug when name changes (optional - can be disabled)
CREATE OR REPLACE FUNCTION update_recipe_slug_on_name_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only regenerate slug if name actually changed and slug wasn't manually set
  IF OLD.name != NEW.name AND NEW.slug = OLD.slug THEN
    NEW.slug := NULL; -- This will trigger set_recipe_slug
    RETURN set_recipe_slug();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Uncomment below if you want auto-slug-update on name change
-- DROP TRIGGER IF EXISTS trigger_update_recipe_slug ON public.recipes;
-- CREATE TRIGGER trigger_update_recipe_slug
-- BEFORE UPDATE ON public.recipes
-- FOR EACH ROW
-- EXECUTE FUNCTION update_recipe_slug_on_name_change();

-- =====================================================================
-- VERIFICATION QUERY (run manually to check results)
-- =====================================================================
-- SELECT id, name, slug FROM public.recipes ORDER BY id LIMIT 20;
