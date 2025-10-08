-- =====================================================================
-- Seed Data for LowCarbPlaner
-- Description: Sample data for testing and development
-- =====================================================================
-- IMPORTANT: This is sample data. Replace with real data before production.
-- =====================================================================

-- =====================================================================
-- SECTION 1: SEED INGREDIENTS (content.ingredients)
-- =====================================================================

insert into content.ingredients (name, unit, calories_per_100_units, carbs_per_100_units, protein_per_100_units, fats_per_100_units, is_divisible)
values
  -- proteins
  ('Jajko kurze (całe)', 'g', 155, 1.1, 13.0, 11.0, false),
  ('Kurczak - pierś (bez skóry)', 'g', 165, 0, 31.0, 3.6, true),
  ('Indyk - pierś (bez skóry)', 'g', 135, 0, 30.0, 1.0, true),
  ('Wołowina - wołowe mielone 10% tłuszczu', 'g', 176, 0, 20.0, 10.0, true),
  ('Łosoś (świeży)', 'g', 208, 0, 20.0, 13.4, true),
  ('Tuńczyk w sosie własnym', 'g', 116, 0, 26.0, 0.8, true),
  ('Ser feta', 'g', 264, 4.1, 14.2, 21.3, true),
  ('Ser mozzarella light', 'g', 254, 2.2, 24.3, 16.1, true),
  ('Twaróg półtłusty', 'g', 98, 3.5, 17.0, 2.0, true),

  -- vegetables (low-carb)
  ('Brokuły', 'g', 34, 7.0, 2.8, 0.4, true),
  ('Szpinak (świeży)', 'g', 23, 3.6, 2.9, 0.4, true),
  ('Kalafior', 'g', 25, 5.0, 1.9, 0.3, true),
  ('Cukinia', 'g', 17, 3.1, 1.2, 0.3, true),
  ('Papryka czerwona', 'g', 31, 6.0, 1.0, 0.3, true),
  ('Pomidor', 'g', 18, 3.9, 0.9, 0.2, true),
  ('Ogórek', 'g', 15, 3.6, 0.7, 0.1, true),
  ('Sałata masłowa', 'g', 13, 2.2, 1.4, 0.2, true),
  ('Awokado', 'g', 160, 8.5, 2.0, 14.7, true),
  ('Rukola', 'g', 25, 3.7, 2.6, 0.7, true),

  -- fats and oils
  ('Oliwa z oliwek extra virgin', 'ml', 884, 0, 0, 100.0, true),
  ('Masło', 'g', 717, 0.1, 0.9, 81.1, true),
  ('Olej kokosowy', 'ml', 862, 0, 0, 100.0, true),
  ('Orzechy włoskie', 'g', 654, 13.7, 15.2, 65.2, true),
  ('Migdały', 'g', 579, 21.6, 21.2, 49.9, true),

  -- condiments and spices
  ('Czosnek (ząbek)', 'g', 149, 33.1, 6.4, 0.5, true),
  ('Cebula biała', 'g', 40, 9.3, 1.1, 0.1, true),
  ('Sól', 'g', 0, 0, 0, 0, true),
  ('Pieprz czarny', 'g', 251, 63.9, 10.4, 3.3, true),
  ('Bazylia (świeża)', 'g', 23, 2.6, 3.2, 0.6, true),
  ('Oregano (suszone)', 'g', 265, 68.9, 9.0, 4.3, true),

  -- low-carb additions
  ('Szparagi', 'g', 20, 3.9, 2.2, 0.1, true),
  ('Pieczarki', 'g', 22, 3.3, 3.1, 0.3, true),
  ('Bakłażan', 'g', 25, 5.9, 1.0, 0.2, true),
  ('Kapusta biała', 'g', 25, 5.8, 1.3, 0.1, true),
  ('Jarmuż (kale)', 'g', 49, 8.8, 4.3, 0.9, true);

-- =====================================================================
-- SECTION 2: SEED UNIT CONVERSIONS (content.ingredient_unit_conversions)
-- =====================================================================

insert into content.ingredient_unit_conversions (ingredient_id, unit_name, grams_equivalent)
values
  -- jajko (average large egg is ~60g)
  ((select id from content.ingredients where name = 'Jajko kurze (całe)'), 'sztuka', 60),

  -- czosnek (average clove is ~5g)
  ((select id from content.ingredients where name = 'Czosnek (ząbek)'), 'ząbek', 5),

  -- common measurements for oils
  ((select id from content.ingredients where name = 'Oliwa z oliwek extra virgin'), 'łyżka', 15),
  ((select id from content.ingredients where name = 'Olej kokosowy'), 'łyżka', 15),

  -- common measurements for butter
  ((select id from content.ingredients where name = 'Masło'), 'łyżka', 15);

-- =====================================================================
-- SECTION 3: SEED RECIPES (content.recipes)
-- =====================================================================

-- recipe 1: omlet z warzywami
insert into content.recipes (name, image_url, instructions, meal_types, tags)
values (
  'Omlet ze szpinakiem i fetą',
  null,
  '[
    {
      "step": 1,
      "description": "Rozbij jajka do miski i ubij widelcem. Dodaj szczyptę soli i pieprzu."
    },
    {
      "step": 2,
      "description": "Rozgrzej oliwę na patelni na średnim ogniu."
    },
    {
      "step": 3,
      "description": "Dodaj szpinak i smaż przez 2 minuty aż się zmniejszy."
    },
    {
      "step": 4,
      "description": "Wlej jajka na patelnię. Gdy brzegi zaczną tężeć, posyp pokruszonym serem feta."
    },
    {
      "step": 5,
      "description": "Złóż omlet na pół i smaż jeszcze 1-2 minuty."
    }
  ]'::jsonb,
  array['breakfast']::meal_type_enum[],
  array['jajka', 'szybkie', 'patelnia', 'wegetariańskie']
);

-- recipe 2: grillowany kurczak z warzywami
insert into content.recipes (name, image_url, instructions, meal_types, tags)
values (
  'Grillowana pierś z kurczaka z brokułami',
  null,
  '[
    {
      "step": 1,
      "description": "Przypraw pierś z kurczaka solą, pieprzem i oregano."
    },
    {
      "step": 2,
      "description": "Rozgrzej grill lub patelnię grillową na średnim ogniu."
    },
    {
      "step": 3,
      "description": "Grilluj kurczaka po 6-7 minut z każdej strony aż będzie dobrze wypieczony."
    },
    {
      "step": 4,
      "description": "W międzyczasie ugotuj brokuły na parze przez 5-7 minut."
    },
    {
      "step": 5,
      "description": "Podawaj kurczaka z brokułami skropionymi oliwą."
    }
  ]'::jsonb,
  array['lunch', 'dinner']::meal_type_enum[],
  array['kurczak', 'zdrowe', 'wysokobiałkowe', 'grill']
);

-- recipe 3: łosoś z awokado
insert into content.recipes (name, image_url, instructions, meal_types, tags)
values (
  'Pieczony łosoś z salsą z awokado',
  null,
  '[
    {
      "step": 1,
      "description": "Rozgrzej piekarnik do 200°C."
    },
    {
      "step": 2,
      "description": "Przypraw łososia solą i pieprzem. Ułóż na blasze wyłożonej papierem do pieczenia."
    },
    {
      "step": 3,
      "description": "Piecz łososia przez 12-15 minut."
    },
    {
      "step": 4,
      "description": "Przygotuj salsę: pokrój awokado w kostkę, pomidora, dodaj sok z cytryny, sól i pieprz."
    },
    {
      "step": 5,
      "description": "Podawaj łososia z salsą z awokado i rukolą."
    }
  ]'::jsonb,
  array['lunch', 'dinner']::meal_type_enum[],
  array['ryba', 'omega3', 'zdrowe-tłuszcze', 'piekarnik']
);

-- =====================================================================
-- SECTION 4: SEED RECIPE INGREDIENTS (content.recipe_ingredients)
-- =====================================================================

-- ingredients for recipe 1: omlet ze szpinakiem i fetą
insert into content.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number)
values
  (
    (select id from content.recipes where name = 'Omlet ze szpinakiem i fetą'),
    (select id from content.ingredients where name = 'Jajko kurze (całe)'),
    120, -- 2 eggs * 60g
    'g',
    true, -- eggs are scalable
    1
  ),
  (
    (select id from content.recipes where name = 'Omlet ze szpinakiem i fetą'),
    (select id from content.ingredients where name = 'Szpinak (świeży)'),
    100,
    'g',
    true, -- spinach is scalable
    3
  ),
  (
    (select id from content.recipes where name = 'Omlet ze szpinakiem i fetą'),
    (select id from content.ingredients where name = 'Ser feta'),
    50,
    'g',
    true, -- cheese is scalable
    4
  ),
  (
    (select id from content.recipes where name = 'Omlet ze szpinakiem i fetą'),
    (select id from content.ingredients where name = 'Oliwa z oliwek extra virgin'),
    10,
    'ml',
    false, -- oil is not scalable (for cooking)
    2
  );

-- ingredients for recipe 2: grillowana pierś z kurczaka z brokułami
insert into content.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number)
values
  (
    (select id from content.recipes where name = 'Grillowana pierś z kurczaka z brokułami'),
    (select id from content.ingredients where name = 'Kurczak - pierś (bez skóry)'),
    200,
    'g',
    true, -- chicken is scalable
    1
  ),
  (
    (select id from content.recipes where name = 'Grillowana pierś z kurczaka z brokułami'),
    (select id from content.ingredients where name = 'Brokuły'),
    200,
    'g',
    true, -- broccoli is scalable
    4
  ),
  (
    (select id from content.recipes where name = 'Grillowana pierś z kurczaka z brokułami'),
    (select id from content.ingredients where name = 'Oliwa z oliwek extra virgin'),
    10,
    'ml',
    false, -- oil is not scalable
    5
  ),
  (
    (select id from content.recipes where name = 'Grillowana pierś z kurczaka z brokułami'),
    (select id from content.ingredients where name = 'Oregano (suszone)'),
    2,
    'g',
    false, -- spices are not scalable
    1
  );

-- ingredients for recipe 3: pieczony łosoś z salsą z awokado
insert into content.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number)
values
  (
    (select id from content.recipes where name = 'Pieczony łosoś z salsą z awokado'),
    (select id from content.ingredients where name = 'Łosoś (świeży)'),
    180,
    'g',
    true, -- salmon is scalable
    2
  ),
  (
    (select id from content.recipes where name = 'Pieczony łosoś z salsą z awokado'),
    (select id from content.ingredients where name = 'Awokado'),
    100,
    'g',
    true, -- avocado is scalable
    4
  ),
  (
    (select id from content.recipes where name = 'Pieczony łosoś z salsą z awokado'),
    (select id from content.ingredients where name = 'Pomidor'),
    80,
    'g',
    true, -- tomato is scalable
    4
  ),
  (
    (select id from content.recipes where name = 'Pieczony łosoś z salsą z awokado'),
    (select id from content.ingredients where name = 'Rukola'),
    50,
    'g',
    true, -- arugula is scalable
    5
  );

-- =====================================================================
-- SECTION 5: VERIFY SEED DATA
-- =====================================================================

-- count ingredients
select 'Ingredients inserted:' as info, count(*)::text as count from content.ingredients;

-- count recipes
select 'Recipes inserted:' as info, count(*)::text as count from content.recipes;

-- count recipe ingredients
select 'Recipe ingredients inserted:' as info, count(*)::text as count from content.recipe_ingredients;

-- verify total_calories were calculated (should be non-null)
select name, total_calories
from content.recipes
order by name;

-- =====================================================================
-- SEED DATA COMPLETE
-- =====================================================================
-- Next steps:
-- 1. Create a test user account via Supabase Auth
-- 2. Test onboarding flow
-- 3. Generate meal plan using these recipes
-- 4. Add more recipes and ingredients as needed
-- =====================================================================
