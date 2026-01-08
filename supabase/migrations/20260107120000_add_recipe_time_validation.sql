-- ============================================================
-- Migration: Add Recipe Time Consistency Validation
-- Description: Trigger to validate time consistency between
--              recipes table and recipe_instructions table
-- Special Notes:
--   - Emits WARNING (not ERROR) when times differ by >30%
--   - Includes helper functions to sync times
-- ============================================================

-- ============================================================
-- 1. Recipe time consistency validation trigger
-- ============================================================
-- Waliduje spojnosc czasow miedzy recipes a recipe_instructions
-- Tolerancja: ±30% (czasy w recipes sa "marketingowe", instructions sa precyzyjne)

CREATE OR REPLACE FUNCTION validate_recipe_time_consistency()
RETURNS TRIGGER AS $$
DECLARE
  recipe_prep_time INTEGER;
  recipe_cook_time INTEGER;
  instructions_prep_time INTEGER;
  instructions_cook_time INTEGER;
  prep_diff_percent NUMERIC;
  cook_diff_percent NUMERIC;
  tolerance NUMERIC := 0.30; -- 30% tolerancji
BEGIN
  -- Pobierz czasy z tabeli recipes
  SELECT prep_time_min, cook_time_min
  INTO recipe_prep_time, recipe_cook_time
  FROM public.recipes
  WHERE id = NEW.recipe_id;

  -- Jesli przepis nie ma ustawionych czasow, pomin walidacje
  IF recipe_prep_time IS NULL AND recipe_cook_time IS NULL THEN
    RETURN NEW;
  END IF;

  -- Oblicz sumy czasow z instructions
  -- prep = active_minutes z krokow typu 'prep'
  -- cook = active_minutes + passive_minutes z krokow typu 'active' i 'passive'
  SELECT
    COALESCE(SUM(CASE WHEN action_type = 'prep' THEN active_minutes ELSE 0 END), 0),
    COALESCE(SUM(
      CASE
        WHEN action_type IN ('active', 'passive') THEN active_minutes + passive_minutes
        ELSE 0
      END
    ), 0)
  INTO instructions_prep_time, instructions_cook_time
  FROM public.recipe_instructions
  WHERE recipe_id = NEW.recipe_id;

  -- Dodaj nowy krok do obliczen
  IF NEW.action_type = 'prep' THEN
    instructions_prep_time := instructions_prep_time + NEW.active_minutes;
  ELSIF NEW.action_type IN ('active', 'passive') THEN
    instructions_cook_time := instructions_cook_time + NEW.active_minutes + COALESCE(NEW.passive_minutes, 0);
  END IF;

  -- Sprawdz spojnosc prep_time (jesli ustawiony)
  IF recipe_prep_time IS NOT NULL AND recipe_prep_time > 0 AND instructions_prep_time > 0 THEN
    prep_diff_percent := ABS(instructions_prep_time - recipe_prep_time)::NUMERIC / recipe_prep_time;
    IF prep_diff_percent > tolerance THEN
      RAISE WARNING 'Recipe time inconsistency: prep_time in recipes (%) differs from instructions sum (%) by %.0f%%. Consider updating recipes.prep_time_min.',
        recipe_prep_time, instructions_prep_time, prep_diff_percent * 100;
    END IF;
  END IF;

  -- Sprawdz spojnosc cook_time (jesli ustawiony)
  IF recipe_cook_time IS NOT NULL AND recipe_cook_time > 0 AND instructions_cook_time > 0 THEN
    cook_diff_percent := ABS(instructions_cook_time - recipe_cook_time)::NUMERIC / recipe_cook_time;
    IF cook_diff_percent > tolerance THEN
      RAISE WARNING 'Recipe time inconsistency: cook_time in recipes (%) differs from instructions sum (%) by %.0f%%. Consider updating recipes.cook_time_min.',
        recipe_cook_time, instructions_cook_time, cook_diff_percent * 100;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS trigger_validate_recipe_time_consistency ON recipe_instructions;

CREATE TRIGGER trigger_validate_recipe_time_consistency
  AFTER INSERT OR UPDATE ON recipe_instructions
  FOR EACH ROW
  EXECUTE FUNCTION validate_recipe_time_consistency();

COMMENT ON FUNCTION validate_recipe_time_consistency() IS
  'Waliduje spojnosc czasow miedzy recipes (prep_time_min, cook_time_min) a suma czasow z recipe_instructions. Emituje WARNING gdy roznica przekracza 30%.';

-- ============================================================
-- 2. Function to sync recipe times from instructions
-- ============================================================
-- Funkcja pomocnicza do synchronizacji czasow - mozna wywolac recznie

CREATE OR REPLACE FUNCTION sync_recipe_times_from_instructions(p_recipe_id INTEGER)
RETURNS TABLE(
  recipe_name TEXT,
  old_prep_time INTEGER,
  new_prep_time INTEGER,
  old_cook_time INTEGER,
  new_cook_time INTEGER
) AS $$
DECLARE
  v_recipe_name TEXT;
  v_old_prep INTEGER;
  v_old_cook INTEGER;
  v_new_prep INTEGER;
  v_new_cook INTEGER;
BEGIN
  -- Pobierz aktualne wartosci
  SELECT r.name, r.prep_time_min, r.cook_time_min
  INTO v_recipe_name, v_old_prep, v_old_cook
  FROM public.recipes r
  WHERE r.id = p_recipe_id;

  IF v_recipe_name IS NULL THEN
    RAISE EXCEPTION 'Recipe with id % not found', p_recipe_id;
  END IF;

  -- Oblicz nowe wartosci z instructions
  SELECT
    COALESCE(SUM(CASE WHEN action_type = 'prep' THEN active_minutes ELSE 0 END), 0),
    COALESCE(SUM(
      CASE
        WHEN action_type IN ('active', 'passive') THEN active_minutes + passive_minutes
        WHEN action_type = 'assembly' THEN active_minutes
        ELSE 0
      END
    ), 0)
  INTO v_new_prep, v_new_cook
  FROM public.recipe_instructions
  WHERE recipe_id = p_recipe_id;

  -- Aktualizuj przepis
  UPDATE public.recipes
  SET
    prep_time_min = v_new_prep,
    cook_time_min = v_new_cook,
    updated_at = NOW()
  WHERE id = p_recipe_id;

  -- Zwroc wynik
  RETURN QUERY SELECT v_recipe_name, v_old_prep, v_new_prep, v_old_cook, v_new_cook;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sync_recipe_times_from_instructions(INTEGER) IS
  'Synchronizuje prep_time_min i cook_time_min w recipes na podstawie sumy czasow z recipe_instructions. Uzycie: SELECT * FROM sync_recipe_times_from_instructions(recipe_id);';

-- ============================================================
-- 3. Function to sync all recipe times
-- ============================================================

CREATE OR REPLACE FUNCTION sync_all_recipe_times()
RETURNS TABLE(
  recipe_name TEXT,
  old_prep_time INTEGER,
  new_prep_time INTEGER,
  old_cook_time INTEGER,
  new_cook_time INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.recipe_name, s.old_prep_time, s.new_prep_time, s.old_cook_time, s.new_cook_time
  FROM public.recipes r
  CROSS JOIN LATERAL sync_recipe_times_from_instructions(r.id) s
  WHERE EXISTS (
    SELECT 1 FROM public.recipe_instructions ri WHERE ri.recipe_id = r.id
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sync_all_recipe_times() IS
  'Synchronizuje czasy wszystkich przepisow ktore maja instrukcje. Uzycie: SELECT * FROM sync_all_recipe_times();';
