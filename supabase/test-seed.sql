-- =====================================================================
-- TEST SEED DATA for LowCarbPlaner E2E Tests
-- Description: Minimal dataset for Playwright E2E tests
-- =====================================================================
-- IMPORTANT: This is a SUBSET of production seed data
-- Use for: Testing only (Supabase test project)
-- Size: ~10 ingredients, ~5 recipes
-- =====================================================================

-- =====================================================================
-- INGREDIENTS - Essential Test Data (10 items)
-- =====================================================================

INSERT INTO public.ingredients (name, category, unit, calories_per_100_units, carbs_per_100_units, protein_per_100_units, fats_per_100_units, is_divisible, image_url)
VALUES
  -- Jajka (podstawa wielu testów)
  ('Jajko kurze (całe)', 'eggs', 'g', 155, 1.1, 13.0, 11.0, false, null),

  -- Nabiał (2 items)
  ('Ser feta', 'dairy', 'g', 264, 4.1, 14.2, 21.3, true, null),
  ('Masło', 'dairy', 'g', 717, 0.1, 0.9, 81.1, true, null),

  -- Warzywa (2 items)
  ('Szpinak (świeży)', 'vegetables', 'g', 23, 3.6, 2.9, 0.4, true, null),
  ('Pomidory krojone (puszka)', 'vegetables', 'g', 18, 3.9, 0.9, 0.1, true, null),

  -- Mięso (2 items)
  ('Pierś z kurczaka (bez skóry)', 'meat', 'g', 165, 0.0, 31.0, 3.6, true, null),
  ('Boczek wieprzowy', 'meat', 'g', 541, 1.4, 37.0, 42.0, false, null),

  -- Przyprawy (2 items)
  ('Sól', 'spices_herbs', 'g', 0, 0.0, 0.0, 0.0, false, null),
  ('Pieprz czarny', 'spices_herbs', 'g', 251, 64.0, 10.4, 3.3, false, null),

  -- Tłuszcze (1 item)
  ('Oliwa z oliwek extra virgin', 'oils_fats', 'ml', 884, 0.0, 0.0, 100.0, false, null);


-- =====================================================================
-- RECIPES - Essential Test Recipes (5 items)
-- =====================================================================

-- BREAKFAST #1: Prosty omlet
INSERT INTO public.recipes (name, image_url, instructions, meal_types, tags)
VALUES
  (
    'Omlet ze szpinakiem i fetą',
    null,
    '[
      {"step":1,"description":"Rozbij jajka do miski i ubij widelcem."},
      {"step":2,"description":"Rozgrzej oliwę na patelni."},
      {"step":3,"description":"Dodaj szpinak i smaż 2 minuty."},
      {"step":4,"description":"Wlej jajka, posyp fetą."},
      {"step":5,"description":"Złóż omlet i smaż 2 minuty."}
    ]'::jsonb,
    ARRAY['breakfast']::public.meal_type_enum[],
    ARRAY['jajka', 'szybkie', 'wegetariańskie']
  );

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number)
VALUES
  (
    (SELECT id FROM public.recipes WHERE name = 'Omlet ze szpinakiem i fetą'),
    (SELECT id FROM public.ingredients WHERE name = 'Jajko kurze (całe)'),
    120, 'g', true, 1
  ),
  (
    (SELECT id FROM public.recipes WHERE name = 'Omlet ze szpinakiem i fetą'),
    (SELECT id FROM public.ingredients WHERE name = 'Szpinak (świeży)'),
    100, 'g', true, 3
  ),
  (
    (SELECT id FROM public.recipes WHERE name = 'Omlet ze szpinakiem i fetą'),
    (SELECT id FROM public.ingredients WHERE name = 'Ser feta'),
    50, 'g', true, 4
  ),
  (
    (SELECT id FROM public.recipes WHERE name = 'Omlet ze szpinakiem i fetą'),
    (SELECT id FROM public.ingredients WHERE name = 'Oliwa z oliwek extra virgin'),
    10, 'ml', false, 2
  ),
  (
    (SELECT id FROM public.recipes WHERE name = 'Omlet ze szpinakiem i fetą'),
    (SELECT id FROM public.ingredients WHERE name = 'Sól'),
    1, 'g', false, 1
  ),
  (
    (SELECT id FROM public.recipes WHERE name = 'Omlet ze szpinakiem i fetą'),
    (SELECT id FROM public.ingredients WHERE name = 'Pieprz czarny'),
    0.5, 'g', false, 1
  )
ON CONFLICT DO NOTHING;

-- BREAKFAST #2: Jajecznica z boczkiem
INSERT INTO public.recipes (name, image_url, instructions, meal_types, tags)
VALUES
  (
    'Jajecznica z boczkiem',
    null,
    '[
      {"step":1,"description":"Podsmaż pokrojony boczek na patelni."},
      {"step":2,"description":"Rozbij jajka i ubij z solą."},
      {"step":3,"description":"Wlej jajka na patelnię z boczkiem."},
      {"step":4,"description":"Smaż mieszając aż jajka będą kremowe."}
    ]'::jsonb,
    ARRAY['breakfast']::public.meal_type_enum[],
    ARRAY['jajka', 'szybkie', 'boczek']
  );


INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number)
VALUES
  (
    (SELECT id FROM public.recipes WHERE name = 'Jajecznica z boczkiem'),
    (SELECT id FROM public.ingredients WHERE name = 'Jajko kurze (całe)'),
    150, 'g', true, 2
  ),
  (
    (SELECT id FROM public.recipes WHERE name = 'Jajecznica z boczkiem'),
    (SELECT id FROM public.ingredients WHERE name = 'Boczek wieprzowy'),
    60, 'g', true, 1
  ),
  (
    (SELECT id FROM public.recipes WHERE name = 'Jajecznica z boczkiem'),
    (SELECT id FROM public.ingredients WHERE name = 'Sól'),
    1, 'g', false, 2
  )
ON CONFLICT DO NOTHING;

-- LUNCH #1: Pierś z kurczaka z masłem
INSERT INTO public.recipes (name, image_url, instructions, meal_types, tags)
VALUES
  (
    'Pierś z kurczaka na maśle',
    null,
    '[
      {"step":1,"description":"Oprósz pierś solą i pieprzem."},
      {"step":2,"description":"Rozgrzej masło na patelni."},
      {"step":3,"description":"Smaż pierś 6-7 minut z każdej strony."},
      {"step":4,"description":"Zostaw 5 minut przed krojeniem."}
    ]'::jsonb,
    ARRAY['lunch']::public.meal_type_enum[],
    ARRAY['kurczak', 'szybkie', 'patelnia']
  );


INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number)
VALUES
  (
    (SELECT id FROM public.recipes WHERE name = 'Pierś z kurczaka na maśle'),
    (SELECT id FROM public.ingredients WHERE name = 'Pierś z kurczaka (bez skóry)'),
    200, 'g', true, 1
  ),
  (
    (SELECT id FROM public.recipes WHERE name = 'Pierś z kurczaka na maśle'),
    (SELECT id FROM public.ingredients WHERE name = 'Masło'),
    20, 'g', false, 2
  ),
  (
    (SELECT id FROM public.recipes WHERE name = 'Pierś z kurczaka na maśle'),
    (SELECT id FROM public.ingredients WHERE name = 'Sól'),
    2, 'g', false, 1
  ),
  (
    (SELECT id FROM public.recipes WHERE name = 'Pierś z kurczaka na maśle'),
    (SELECT id FROM public.ingredients WHERE name = 'Pieprz czarny'),
    1, 'g', false, 1
  )
ON CONFLICT DO NOTHING;

-- DINNER #1: Kurczak w pomidorach
INSERT INTO public.recipes (name, image_url, instructions, meal_types, tags)
VALUES
  (
    'Kurczak w sosie pomidorowym',
    null,
    '[
      {"step":1,"description":"Podsmaż pokrojoną pierś na oliwie."},
      {"step":2,"description":"Dodaj pomidory z puszki."},
      {"step":3,"description":"Duś 15 minut. Dopraw solą i pieprzem."},
      {"step":4,"description":"Podawaj gorące."}
    ]'::jsonb,
    ARRAY['dinner']::public.meal_type_enum[],
    ARRAY['kurczak', 'jednogarnkowe', 'dusze']
  );


INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number)
VALUES
  (
    (SELECT id FROM public.recipes WHERE name = 'Kurczak w sosie pomidorowym'),
    (SELECT id FROM public.ingredients WHERE name = 'Pierś z kurczaka (bez skóry)'),
    250, 'g', true, 1
  ),
  (
    (SELECT id FROM public.recipes WHERE name = 'Kurczak w sosie pomidorowym'),
    (SELECT id FROM public.ingredients WHERE name = 'Pomidory krojone (puszka)'),
    200, 'g', true, 2
  ),
  (
    (SELECT id FROM public.recipes WHERE name = 'Kurczak w sosie pomidorowym'),
    (SELECT id FROM public.ingredients WHERE name = 'Oliwa z oliwek extra virgin'),
    15, 'ml', false, 1
  ),
  (
    (SELECT id FROM public.recipes WHERE name = 'Kurczak w sosie pomidorowym'),
    (SELECT id FROM public.ingredients WHERE name = 'Sól'),
    2, 'g', false, 3
  ),
  (
    (SELECT id FROM public.recipes WHERE name = 'Kurczak w sosie pomidorowym'),
    (SELECT id FROM public.ingredients WHERE name = 'Pieprz czarny'),
    1, 'g', false, 3
  )
ON CONFLICT DO NOTHING;

-- DINNER #2: Jajka na twardo (fallback recipe)
INSERT INTO public.recipes (name, image_url, instructions, meal_types, tags)
VALUES
  (
    'Jajka na twardo z masłem',
    null,
    '[
      {"step":1,"description":"Zagotuj wodę w garnku."},
      {"step":2,"description":"Włóż jajka i gotuj 9-10 minut."},
      {"step":3,"description":"Przełóż do zimnej wody na 2 minuty."},
      {"step":4,"description":"Obierz i podawaj z masłem i solą."}
    ]'::jsonb,
    ARRAY['dinner', 'lunch']::public.meal_type_enum[],
    ARRAY['jajka', 'szybkie', 'proste']
  );


INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number)
VALUES
  (
    (SELECT id FROM public.recipes WHERE name = 'Jajka na twardo z masłem'),
    (SELECT id FROM public.ingredients WHERE name = 'Jajko kurze (całe)'),
    180, 'g', true, 2
  ),
  (
    (SELECT id FROM public.recipes WHERE name = 'Jajka na twardo z masłem'),
    (SELECT id FROM public.ingredients WHERE name = 'Masło'),
    15, 'g', false, 4
  ),
  (
    (SELECT id FROM public.recipes WHERE name = 'Jajka na twardo z masłem'),
    (SELECT id FROM public.ingredients WHERE name = 'Sól'),
    1, 'g', false, 4
  )
ON CONFLICT DO NOTHING;

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Count seeded data
DO $$
DECLARE
  ingredient_count INT;
  recipe_count INT;
  recipe_ingredient_count INT;
BEGIN
  SELECT COUNT(*) INTO ingredient_count FROM public.ingredients;
  SELECT COUNT(*) INTO recipe_count FROM public.recipes;
  SELECT COUNT(*) INTO recipe_ingredient_count FROM public.recipe_ingredients;

  RAISE NOTICE '✅ Test seed data loaded successfully!';
  RAISE NOTICE '📊 Ingredients: %', ingredient_count;
  RAISE NOTICE '📊 Recipes: %', recipe_count;
  RAISE NOTICE '📊 Recipe ingredients: %', recipe_ingredient_count;

  IF ingredient_count < 10 THEN
    RAISE WARNING '⚠️  Expected at least 10 ingredients, got %', ingredient_count;
  END IF;

  IF recipe_count < 5 THEN
    RAISE WARNING '⚠️  Expected at least 5 recipes, got %', recipe_count;
  END IF;
END $$;
