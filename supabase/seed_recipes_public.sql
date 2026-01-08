-- =====================================================================
-- Seed Data for LowCarbPlaner - RECIPES (Complete with Meal Prep v2.0)
-- Description: 52 low-carb recipes with ingredients, equipment & instructions
-- =====================================================================
-- IMPORTANT: Run seed_ingredients_complete.sql FIRST!
-- All ingredients verified against seed_ingredients_complete.sql
--
-- This file contains:
--   1. Recipes (52 total: 12 breakfasts, 10 lunches, 10 dinners, 10 morning snacks, 10 afternoon snacks)
--   2. Recipe ingredients (~280 assignments)
--   3. Recipe equipment (60+ assignments) - Meal Prep v2.0
--   4. Recipe instructions (150+ steps) - Meal Prep v2.0
-- =====================================================================

-- =====================================================================
-- CLEANUP: Remove existing recipes before inserting new ones
-- =====================================================================
DELETE FROM public.recipe_components;
DELETE FROM public.recipe_instructions;
DELETE FROM public.recipe_equipment;
DELETE FROM public.recipe_ingredients;
DELETE FROM public.recipes;

-- =====================================================================
-- ŚNIADANIA (BREAKFASTS) - 10 przepisów
-- =====================================================================

-- Śniadanie 1: Omlet ze szpinakiem i fetą
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Omlet ze szpinakiem i fetą', 'omlet-ze-szpinakiem-i-feta', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/omlet-ze-szpinakiem-i-feta.webp', array['breakfast']::public.meal_type_enum[], array['jajka', 'szybkie', 'patelnia', 'wegetariańskie'], 5, 10, 'easy', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Omlet ze szpinakiem i fetą'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 120, 'g', true, 1),
((select id from public.recipes where name = 'Omlet ze szpinakiem i fetą'), (select id from public.ingredients where name = 'Szpinak (świeży)'), 100, 'g', true, 3),
((select id from public.recipes where name = 'Omlet ze szpinakiem i fetą'), (select id from public.ingredients where name = 'Ser feta'), 50, 'g', true, 4),
((select id from public.recipes where name = 'Omlet ze szpinakiem i fetą'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 2),
((select id from public.recipes where name = 'Omlet ze szpinakiem i fetą'), (select id from public.ingredients where name = 'Sól'), 1, 'g', false, 1),
((select id from public.recipes where name = 'Omlet ze szpinakiem i fetą'), (select id from public.ingredients where name = 'Pieprz czarny (mielony)'), 0.5, 'g', false, 1);

-- Śniadanie 2: Jajecznica z łososiem wędzonym
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Jajecznica z łososiem wędzonym i awokado', 'jajecznica-z-lososiem-wedzonym-i-awokado', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/jajecznica-z-lososiem-wedzonym-i-awokado.webp', array['breakfast']::public.meal_type_enum[], array['jajka', 'ryba', 'premium', 'szybkie'], 5, 8, 'easy', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Jajecznica z łososiem wędzonym i awokado'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 150, 'g', true, 1),
((select id from public.recipes where name = 'Jajecznica z łososiem wędzonym i awokado'), (select id from public.ingredients where name = 'Śmietana 18%'), 30, 'ml', true, 1),
((select id from public.recipes where name = 'Jajecznica z łososiem wędzonym i awokado'), (select id from public.ingredients where name = 'Masło'), 10, 'g', false, 2),
((select id from public.recipes where name = 'Jajecznica z łososiem wędzonym i awokado'), (select id from public.ingredients where name = 'Łosoś wędzony'), 80, 'g', true, 4),
((select id from public.recipes where name = 'Jajecznica z łososiem wędzonym i awokado'), (select id from public.ingredients where name = 'Awokado'), 100, 'g', true, 4),
((select id from public.recipes where name = 'Jajecznica z łososiem wędzonym i awokado'), (select id from public.ingredients where name = 'Szczypiorek'), 5, 'g', false, 5);

-- Śniadanie 3: Shakshuka
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Shakshuka z pomidorami i papryką', 'shakshuka-z-pomidorami-i-papryka', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/shakshuka-z-pomidorami-i-papryka.webp', array['breakfast']::public.meal_type_enum[], array['jajka', 'orientalne', 'pikantne', 'jednogarnkowe'], 10, 20, 'medium', 2, 'porcja', true, 2, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 180, 'g', true, 4),
((select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'), (select id from public.ingredients where name = 'Cebula biała'), 80, 'g', true, 1),
((select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'), (select id from public.ingredients where name = 'Papryka czerwona'), 120, 'g', true, 1),
((select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'), (select id from public.ingredients where name = 'Pomidory krojone (puszka)'), 200, 'g', true, 2),
((select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'), (select id from public.ingredients where name = 'Czosnek'), 10, 'g', false, 2),
((select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'), (select id from public.ingredients where name = 'Kminek'), 2, 'g', false, 2),
((select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 15, 'ml', false, 1);

-- Śniadanie 4: Jogurt grecki z orzechami i jagodami
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Jogurt grecki z orzechami i jagodami', 'jogurt-grecki-z-orzechami-i-jagodami', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/jogurt-grecki-z-orzechami-i-jagodami.webp', array['breakfast']::public.meal_type_enum[], array['jogurt', 'orzechy', 'szybkie', 'zdrowe-tłuszcze'], 5, 0, 'easy', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'), (select id from public.ingredients where name = 'Jogurt grecki naturalny (pełnotłusty)'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'), (select id from public.ingredients where name = 'Orzechy włoskie'), 20, 'g', true, 2),
((select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'), (select id from public.ingredients where name = 'Migdały'), 15, 'g', true, 2),
((select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'), (select id from public.ingredients where name = 'Orzechy pekan'), 15, 'g', true, 2),
((select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'), (select id from public.ingredients where name = 'Jagody'), 40, 'g', true, 3),
((select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'), (select id from public.ingredients where name = 'Jeżyny'), 30, 'g', true, 3),
((select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'), (select id from public.ingredients where name = 'Nasiona chia'), 8, 'g', true, 4),
((select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'), (select id from public.ingredients where name = 'Siemię lniane'), 5, 'g', true, 4);

-- Śniadanie 5: Placki z cukinii z serkiem wiejskim
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Placki z cukinii z serkiem wiejskim', 'placki-z-cukinii-z-serkiem-wiejskim', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/placki-z-cukinii-z-serkiem-wiejskim.webp', array['breakfast']::public.meal_type_enum[], array['placki', 'warzywa', 'wegetariańskie', 'patelnia'], 15, 15, 'medium', 6, 'sztuka', true, 6, 2);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Cukinia'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 60, 'g', true, 2),
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Mąka kokosowa'), 20, 'g', true, 2),
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Czosnek'), 5, 'g', false, 2),
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 2),
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Pieprz czarny (mielony)'), 1, 'g', false, 2),
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 15, 'ml', false, 3),
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Serek wiejski'), 100, 'g', true, 4),
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Szczypiorek'), 5, 'g', false, 4);

-- Śniadanie 6: Frittata z brokułami i serem cheddar
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Frittata z brokułami i serem cheddar', 'frittata-z-brokulami-i-serem-cheddar', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/frittata-z-brokulami-i-serem-cheddar.webp', array['breakfast']::public.meal_type_enum[], array['jajka', 'piekarnik', 'brokuły', 'ser'], 10, 25, 'medium', 4, 'porcja', true, 4, 2);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 240, 'g', true, 2),
((select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'), (select id from public.ingredients where name = 'Brokuły'), 150, 'g', true, 1),
((select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'), (select id from public.ingredients where name = 'Cebula biała'), 60, 'g', true, 3),
((select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'), (select id from public.ingredients where name = 'Ser cheddar'), 60, 'g', true, 4),
((select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 3),
((select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 2),
((select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'), (select id from public.ingredients where name = 'Pieprz czarny (mielony)'), 1, 'g', false, 2);

-- Śniadanie 7: Chia pudding kokosowy z borówkami
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Chia pudding kokosowy z borówkami', 'chia-pudding-kokosowy-z-borowkami', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/chia-pudding-kokosowy-z-borowkami.webp', array['breakfast']::public.meal_type_enum[], array['chia', 'kokos', 'na-zimno', 'przygotowanie-wcześniej'], 5, 0, 'easy', 2, 'porcja', true, 4, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Chia pudding kokosowy z borówkami'), (select id from public.ingredients where name = 'Nasiona chia'), 30, 'g', true, 1),
((select id from public.recipes where name = 'Chia pudding kokosowy z borówkami'), (select id from public.ingredients where name = 'Mleko kokosowe (puszka)'), 200, 'ml', true, 1),
((select id from public.recipes where name = 'Chia pudding kokosowy z borówkami'), (select id from public.ingredients where name = 'Erytrytol'), 10, 'g', false, 1),
((select id from public.recipes where name = 'Chia pudding kokosowy z borówkami'), (select id from public.ingredients where name = 'Borówki'), 50, 'g', true, 4);

-- Śniadanie 8: Twaróg z orzechami laskowymi i cynamonem
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Twaróg z orzechami laskowymi i cynamonem', 'twarog-z-orzechami-laskowymi-i-cynamonem', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/twarog-z-orzechami-laskowymi-i-cynamonem.webp', array['breakfast']::public.meal_type_enum[], array['twaróg', 'orzechy', 'szybkie', 'słodkie'], 5, 0, 'easy', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Twaróg z orzechami laskowymi i cynamonem'), (select id from public.ingredients where name = 'Twaróg półtłusty'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Twaróg z orzechami laskowymi i cynamonem'), (select id from public.ingredients where name = 'Kefir naturalny'), 30, 'ml', true, 1),
((select id from public.recipes where name = 'Twaróg z orzechami laskowymi i cynamonem'), (select id from public.ingredients where name = 'Orzechy laskowe'), 30, 'g', true, 2),
((select id from public.recipes where name = 'Twaróg z orzechami laskowymi i cynamonem'), (select id from public.ingredients where name = 'Cynamon (mielony)'), 2, 'g', false, 3),
((select id from public.recipes where name = 'Twaróg z orzechami laskowymi i cynamonem'), (select id from public.ingredients where name = 'Erytrytol'), 5, 'g', false, 3),
((select id from public.recipes where name = 'Twaróg z orzechami laskowymi i cynamonem'), (select id from public.ingredients where name = 'Truskawki'), 50, 'g', true, 4);

-- Śniadanie 9: Jajka sadzone z boczkiem i awokado
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Jajka sadzone z boczkiem i awokado', 'jajka-sadzone-z-boczkiem-i-awokado', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/jajka-sadzone-z-boczkiem-i-awokado.webp', array['breakfast']::public.meal_type_enum[], array['jajka', 'boczek', 'wysokotłuszczowe', 'szybkie'], 5, 10, 'easy', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Jajka sadzone z boczkiem i awokado'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 120, 'g', true, 2),
((select id from public.recipes where name = 'Jajka sadzone z boczkiem i awokado'), (select id from public.ingredients where name = 'Wieprzowina - boczek surowy'), 50, 'g', true, 1),
((select id from public.recipes where name = 'Jajka sadzone z boczkiem i awokado'), (select id from public.ingredients where name = 'Awokado'), 100, 'g', true, 3),
((select id from public.recipes where name = 'Jajka sadzone z boczkiem i awokado'), (select id from public.ingredients where name = 'Pieprz czarny (mielony)'), 1, 'g', false, 5),
((select id from public.recipes where name = 'Jajka sadzone z boczkiem i awokado'), (select id from public.ingredients where name = 'Szczypiorek'), 5, 'g', false, 5);

-- Śniadanie 10: Smoothie bowl z awokado i szpinakiem
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Smoothie bowl z awokado i szpinakiem', 'smoothie-bowl-z-awokado-i-szpinakiem', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/smoothie-bowl-z-awokado-i-szpinakiem.webp', array['breakfast']::public.meal_type_enum[], array['smoothie', 'zielone', 'szybkie', 'na-zimno'], 10, 0, 'easy', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Smoothie bowl z awokado i szpinakiem'), (select id from public.ingredients where name = 'Awokado'), 80, 'g', true, 1),
((select id from public.recipes where name = 'Smoothie bowl z awokado i szpinakiem'), (select id from public.ingredients where name = 'Szpinak (świeży)'), 50, 'g', true, 1),
((select id from public.recipes where name = 'Smoothie bowl z awokado i szpinakiem'), (select id from public.ingredients where name = 'Mleko migdałowe (niesłodzone)'), 150, 'ml', true, 1),
((select id from public.recipes where name = 'Smoothie bowl z awokado i szpinakiem'), (select id from public.ingredients where name = 'Truskawki'), 40, 'g', true, 1),
((select id from public.recipes where name = 'Smoothie bowl z awokado i szpinakiem'), (select id from public.ingredients where name = 'Maliny'), 30, 'g', true, 3),
((select id from public.recipes where name = 'Smoothie bowl z awokado i szpinakiem'), (select id from public.ingredients where name = 'Nasiona chia'), 10, 'g', true, 3),
((select id from public.recipes where name = 'Smoothie bowl z awokado i szpinakiem'), (select id from public.ingredients where name = 'Migdały'), 15, 'g', true, 3);

-- =====================================================================
-- OBIADY (LUNCHES) - 10 przepisów
-- =====================================================================

-- Obiad 1: Grillowana pierś z kurczaka z brokułami
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Grillowana pierś z kurczaka z brokułami', 'grillowana-piers-z-kurczaka-z-brokulami', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/grillowana-piers-z-kurczaka-z-brokulami.webp', array['lunch']::public.meal_type_enum[], array['kurczak', 'zdrowe', 'wysokobiałkowe', 'grill'], 10, 20, 'easy', 1, 'porcja', true, 2, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Grillowana pierś z kurczaka z brokułami'), (select id from public.ingredients where name = 'Kurczak - pierś (bez skóry)'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Grillowana pierś z kurczaka z brokułami'), (select id from public.ingredients where name = 'Brokuły'), 200, 'g', true, 4),
((select id from public.recipes where name = 'Grillowana pierś z kurczaka z brokułami'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 5),
((select id from public.recipes where name = 'Grillowana pierś z kurczaka z brokułami'), (select id from public.ingredients where name = 'Oregano (suszone)'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Grillowana pierś z kurczaka z brokułami'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Grillowana pierś z kurczaka z brokułami'), (select id from public.ingredients where name = 'Pieprz czarny (mielony)'), 1, 'g', false, 1);

-- Obiad 2: Filet z łososia z szparagami
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Filet z łososia z szparagami', 'filet-z-lososia-z-szparagami', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/filet-z-lososia-z-szparagami.webp', array['lunch']::public.meal_type_enum[], array['ryba', 'szparagi', 'omega3', 'zdrowe-tłuszcze'], 10, 15, 'medium', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Filet z łososia z szparagami'), (select id from public.ingredients where name = 'Łosoś (świeży)'), 180, 'g', true, 1),
((select id from public.recipes where name = 'Filet z łososia z szparagami'), (select id from public.ingredients where name = 'Szparagi'), 150, 'g', true, 3),
((select id from public.recipes where name = 'Filet z łososia z szparagami'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 2),
((select id from public.recipes where name = 'Filet z łososia z szparagami'), (select id from public.ingredients where name = 'Ghee (masło klarowane)'), 10, 'g', false, 3),
((select id from public.recipes where name = 'Filet z łososia z szparagami'), (select id from public.ingredients where name = 'Czosnek'), 5, 'g', false, 1),
((select id from public.recipes where name = 'Filet z łososia z szparagami'), (select id from public.ingredients where name = 'Cytryna (sok)'), 15, 'ml', false, 4),
((select id from public.recipes where name = 'Filet z łososia z szparagami'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Filet z łososia z szparagami'), (select id from public.ingredients where name = 'Pieprz czarny (mielony)'), 1, 'g', false, 1);

-- Obiad 3: Stek wołowy z sałatką z rukoli
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Stek wołowy z sałatką z rukoli', 'stek-wolowy-z-salatka-z-rukoli', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/stek-wolowy-z-salatka-z-rukoli.webp', array['lunch']::public.meal_type_enum[], array['wołowina', 'stek', 'białkowe', 'sałatka'], 10, 15, 'medium', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Stek wołowy z sałatką z rukoli'), (select id from public.ingredients where name = 'Wołowina - antrykot (stek)'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Stek wołowy z sałatką z rukoli'), (select id from public.ingredients where name = 'Rukola'), 80, 'g', true, 3),
((select id from public.recipes where name = 'Stek wołowy z sałatką z rukoli'), (select id from public.ingredients where name = 'Pomidory koktajlowe'), 100, 'g', true, 3),
((select id from public.recipes where name = 'Stek wołowy z sałatką z rukoli'), (select id from public.ingredients where name = 'Ser parmezan'), 30, 'g', true, 3),
((select id from public.recipes where name = 'Stek wołowy z sałatką z rukoli'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 15, 'ml', false, 4),
((select id from public.recipes where name = 'Stek wołowy z sałatką z rukoli'), (select id from public.ingredients where name = 'Cytryna (sok)'), 10, 'ml', false, 4),
((select id from public.recipes where name = 'Stek wołowy z sałatką z rukoli'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Stek wołowy z sałatką z rukoli'), (select id from public.ingredients where name = 'Pieprz czarny (mielony)'), 1, 'g', false, 1);

-- Obiad 4: Kurczak curry z mlekiem kokosowym
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Kurczak curry z mlekiem kokosowym', 'kurczak-curry-z-mlekiem-kokosowym', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/kurczak-curry-z-mlekiem-kokosowym.webp', array['lunch']::public.meal_type_enum[], array['kurczak', 'curry', 'kokos', 'orientalne'], 15, 25, 'medium', 2, 'porcja', true, 4, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Kurczak curry z mlekiem kokosowym'), (select id from public.ingredients where name = 'Kurczak - pierś (bez skóry)'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Kurczak curry z mlekiem kokosowym'), (select id from public.ingredients where name = 'Mleko kokosowe (puszka)'), 200, 'ml', true, 4),
((select id from public.recipes where name = 'Kurczak curry z mlekiem kokosowym'), (select id from public.ingredients where name = 'Cebula biała'), 80, 'g', true, 2),
((select id from public.recipes where name = 'Kurczak curry z mlekiem kokosowym'), (select id from public.ingredients where name = 'Czosnek'), 10, 'g', false, 2),
((select id from public.recipes where name = 'Kurczak curry z mlekiem kokosowym'), (select id from public.ingredients where name = 'Imbir świeży'), 10, 'g', false, 3),
((select id from public.recipes where name = 'Kurczak curry z mlekiem kokosowym'), (select id from public.ingredients where name = 'Kurkuma (mielona)'), 3, 'g', false, 3),
((select id from public.recipes where name = 'Kurczak curry z mlekiem kokosowym'), (select id from public.ingredients where name = 'Kalafior'), 150, 'g', true, 5),
((select id from public.recipes where name = 'Kurczak curry z mlekiem kokosowym'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 2);

-- Obiad 5: Dorsz pieczony z warzywami
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Dorsz pieczony z warzywami', 'dorsz-pieczony-z-warzywami', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/dorsz-pieczony-z-warzywami.webp', array['lunch']::public.meal_type_enum[], array['ryba', 'warzywa', 'piekarnik', 'jednoblachowe'], 15, 25, 'easy', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Dorsz pieczony z warzywami'), (select id from public.ingredients where name = 'Dorsz'), 180, 'g', true, 1),
((select id from public.recipes where name = 'Dorsz pieczony z warzywami'), (select id from public.ingredients where name = 'Cukinia'), 120, 'g', true, 2),
((select id from public.recipes where name = 'Dorsz pieczony z warzywami'), (select id from public.ingredients where name = 'Papryka czerwona'), 100, 'g', true, 2),
((select id from public.recipes where name = 'Dorsz pieczony z warzywami'), (select id from public.ingredients where name = 'Pomidor'), 100, 'g', true, 2),
((select id from public.recipes where name = 'Dorsz pieczony z warzywami'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 15, 'ml', false, 3),
((select id from public.recipes where name = 'Dorsz pieczony z warzywami'), (select id from public.ingredients where name = 'Oregano (suszone)'), 2, 'g', false, 3),
((select id from public.recipes where name = 'Dorsz pieczony z warzywami'), (select id from public.ingredients where name = 'Tymianek (świeży)'), 3, 'g', false, 3),
((select id from public.recipes where name = 'Dorsz pieczony z warzywami'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1);

-- Obiad 6: Kotlety z indyka z puree z kalafiora
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Kotlety z indyka z puree z kalafiora', 'kotlety-z-indyka-z-puree-z-kalafiora', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/kotlety-z-indyka-z-puree-z-kalafiora.webp', array['lunch']::public.meal_type_enum[], array['indyk', 'kotlety', 'kalafior', 'puree'], 20, 25, 'medium', 4, 'sztuka', true, 4, 2);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Kotlety z indyka z puree z kalafiora'), (select id from public.ingredients where name = 'Indyk - pierś (bez skóry)'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Kotlety z indyka z puree z kalafiora'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 50, 'g', true, 1),
((select id from public.recipes where name = 'Kotlety z indyka z puree z kalafiora'), (select id from public.ingredients where name = 'Czosnek'), 5, 'g', false, 1),
((select id from public.recipes where name = 'Kotlety z indyka z puree z kalafiora'), (select id from public.ingredients where name = 'Kalafior'), 200, 'g', true, 3),
((select id from public.recipes where name = 'Kotlety z indyka z puree z kalafiora'), (select id from public.ingredients where name = 'Masło'), 20, 'g', false, 3),
((select id from public.recipes where name = 'Kotlety z indyka z puree z kalafiora'), (select id from public.ingredients where name = 'Śmietana 30%'), 30, 'ml', true, 3),
((select id from public.recipes where name = 'Kotlety z indyka z puree z kalafiora'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 2),
((select id from public.recipes where name = 'Kotlety z indyka z puree z kalafiora'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1);

-- Obiad 7: Sałatka z tuńczyka i jajkiem
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Sałatka z tuńczyka i jajkiem', 'salatka-z-tunczyka-i-jajkiem', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/salatka-z-tunczyka-i-jajkiem.webp', array['lunch']::public.meal_type_enum[], array['sałatka', 'tuńczyk', 'jajka', 'na-zimno'], 15, 10, 'easy', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Sałatka z tuńczyka i jajkiem'), (select id from public.ingredients where name = 'Tuńczyk w sosie własnym'), 120, 'g', true, 2),
((select id from public.recipes where name = 'Sałatka z tuńczyka i jajkiem'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 120, 'g', true, 1),
((select id from public.recipes where name = 'Sałatka z tuńczyka i jajkiem'), (select id from public.ingredients where name = 'Sałata rzymska'), 100, 'g', true, 2),
((select id from public.recipes where name = 'Sałatka z tuńczyka i jajkiem'), (select id from public.ingredients where name = 'Ogórek'), 80, 'g', true, 2),
((select id from public.recipes where name = 'Sałatka z tuńczyka i jajkiem'), (select id from public.ingredients where name = 'Pomidory koktajlowe'), 80, 'g', true, 2),
((select id from public.recipes where name = 'Sałatka z tuńczyka i jajkiem'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 15, 'ml', false, 4),
((select id from public.recipes where name = 'Sałatka z tuńczyka i jajkiem'), (select id from public.ingredients where name = 'Cytryna (sok)'), 10, 'ml', false, 4);

-- Obiad 8: Udka z kurczaka pieczone z ziołami
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Udka z kurczaka pieczone z ziołami', 'udka-z-kurczaka-pieczone-z-ziolami', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/udka-z-kurczaka-pieczone-z-ziolami.webp', array['lunch']::public.meal_type_enum[], array['kurczak', 'piekarnik', 'zioła', 'soczysty'], 15, 45, 'easy', 2, 'udko', true, 4, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Udka z kurczaka pieczone z ziołami'), (select id from public.ingredients where name = 'Kurczak - udko (ze skórą)'), 250, 'g', true, 1),
((select id from public.recipes where name = 'Udka z kurczaka pieczone z ziołami'), (select id from public.ingredients where name = 'Rozmaryn (świeży)'), 5, 'g', false, 1),
((select id from public.recipes where name = 'Udka z kurczaka pieczone z ziołami'), (select id from public.ingredients where name = 'Tymianek (świeży)'), 5, 'g', false, 1),
((select id from public.recipes where name = 'Udka z kurczaka pieczone z ziołami'), (select id from public.ingredients where name = 'Czosnek'), 15, 'g', false, 2),
((select id from public.recipes where name = 'Udka z kurczaka pieczone z ziołami'), (select id from public.ingredients where name = 'Szpinak (świeży)'), 100, 'g', true, 4),
((select id from public.recipes where name = 'Udka z kurczaka pieczone z ziołami'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 2),
((select id from public.recipes where name = 'Udka z kurczaka pieczone z ziołami'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Udka z kurczaka pieczone z ziołami'), (select id from public.ingredients where name = 'Pieprz czarny (mielony)'), 1, 'g', false, 1);

-- Obiad 9: Krewetki w czosnku z cukinią
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Krewetki w czosnku z cukinią', 'krewetki-w-czosnku-z-cukinia', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/krewetki-w-czosnku-z-cukinia.webp', array['lunch']::public.meal_type_enum[], array['krewetki', 'czosnek', 'cukinia', 'szybkie'], 10, 10, 'easy', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Krewetki w czosnku z cukinią'), (select id from public.ingredients where name = 'Krewetki'), 180, 'g', true, 2),
((select id from public.recipes where name = 'Krewetki w czosnku z cukinią'), (select id from public.ingredients where name = 'Cukinia'), 200, 'g', true, 3),
((select id from public.recipes where name = 'Krewetki w czosnku z cukinią'), (select id from public.ingredients where name = 'Czosnek'), 15, 'g', false, 1),
((select id from public.recipes where name = 'Krewetki w czosnku z cukinią'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 15, 'ml', false, 1),
((select id from public.recipes where name = 'Krewetki w czosnku z cukinią'), (select id from public.ingredients where name = 'Limonka (sok)'), 15, 'ml', false, 4);

-- Obiad 10: Schab wieprzowy z kapustą
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Schab wieprzowy z kapustą', 'schab-wieprzowy-z-kapusta', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/schab-wieprzowy-z-kapusta.webp', array['lunch']::public.meal_type_enum[], array['wieprzowina', 'schab', 'kapusta', 'polskie'], 15, 30, 'medium', 2, 'porcja', true, 4, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Schab wieprzowy z kapustą'), (select id from public.ingredients where name = 'Wieprzowina - schab'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Schab wieprzowy z kapustą'), (select id from public.ingredients where name = 'Kapusta biała'), 150, 'g', true, 3),
((select id from public.recipes where name = 'Schab wieprzowy z kapustą'), (select id from public.ingredients where name = 'Cebula biała'), 60, 'g', true, 3),
((select id from public.recipes where name = 'Schab wieprzowy z kapustą'), (select id from public.ingredients where name = 'Kminek'), 2, 'g', false, 4),
((select id from public.recipes where name = 'Schab wieprzowy z kapustą'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 2),
((select id from public.recipes where name = 'Schab wieprzowy z kapustą'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Schab wieprzowy z kapustą'), (select id from public.ingredients where name = 'Pieprz czarny (mielony)'), 1, 'g', false, 1);

-- =====================================================================
-- KOLACJE (DINNERS) - 10 przepisów
-- =====================================================================

-- Kolacja 1: Pieczony łosoś z salsą z awokado
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Pieczony łosoś z salsą z awokado', 'pieczony-losos-z-salsa-z-awokado', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/pieczony-losos-z-salsa-z-awokado.webp', array['dinner']::public.meal_type_enum[], array['ryba', 'omega3', 'zdrowe-tłuszcze', 'piekarnik'], 15, 20, 'medium', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Pieczony łosoś z salsą z awokado'), (select id from public.ingredients where name = 'Łosoś (świeży)'), 180, 'g', true, 2),
((select id from public.recipes where name = 'Pieczony łosoś z salsą z awokado'), (select id from public.ingredients where name = 'Awokado'), 100, 'g', true, 4),
((select id from public.recipes where name = 'Pieczony łosoś z salsą z awokado'), (select id from public.ingredients where name = 'Pomidor'), 80, 'g', true, 4),
((select id from public.recipes where name = 'Pieczony łosoś z salsą z awokado'), (select id from public.ingredients where name = 'Rukola'), 50, 'g', true, 5),
((select id from public.recipes where name = 'Pieczony łosoś z salsą z awokado'), (select id from public.ingredients where name = 'Cytryna (sok)'), 15, 'ml', false, 4),
((select id from public.recipes where name = 'Pieczony łosoś z salsą z awokado'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 2),
((select id from public.recipes where name = 'Pieczony łosoś z salsą z awokado'), (select id from public.ingredients where name = 'Pieprz czarny (mielony)'), 1, 'g', false, 2);

-- Kolacja 2: Pierś z indyka w sosie grzybowym
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Pierś z indyka w sosie grzybowym', 'piers-z-indyka-w-sosie-grzybowym', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/piers-z-indyka-w-sosie-grzybowym.webp', array['dinner']::public.meal_type_enum[], array['indyk', 'grzyby', 'sos', 'kremowe'], 15, 25, 'medium', 2, 'porcja', true, 2, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Pierś z indyka w sosie grzybowym'), (select id from public.ingredients where name = 'Indyk - pierś (bez skóry)'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Pierś z indyka w sosie grzybowym'), (select id from public.ingredients where name = 'Pieczarki'), 120, 'g', true, 3),
((select id from public.recipes where name = 'Pierś z indyka w sosie grzybowym'), (select id from public.ingredients where name = 'Śmietana 18%'), 100, 'ml', true, 4),
((select id from public.recipes where name = 'Pierś z indyka w sosie grzybowym'), (select id from public.ingredients where name = 'Masło'), 15, 'g', false, 2),
((select id from public.recipes where name = 'Pierś z indyka w sosie grzybowym'), (select id from public.ingredients where name = 'Czosnek'), 10, 'g', false, 3),
((select id from public.recipes where name = 'Pierś z indyka w sosie grzybowym'), (select id from public.ingredients where name = 'Tymianek (świeży)'), 3, 'g', false, 4),
((select id from public.recipes where name = 'Pierś z indyka w sosie grzybowym'), (select id from public.ingredients where name = 'Brokuły'), 150, 'g', true, 5),
((select id from public.recipes where name = 'Pierś z indyka w sosie grzybowym'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1);

-- Kolacja 3: Stek z polędwicy z masłem ziołowym
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Stek z polędwicy z masłem ziołowym', 'stek-z-poledwicy-z-maslem-ziolowym', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/stek-z-poledwicy-z-maslem-ziolowym.webp', array['dinner']::public.meal_type_enum[], array['wołowina', 'stek', 'masło-ziołowe', 'wykwintne'], 15, 15, 'hard', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Stek z polędwicy z masłem ziołowym'), (select id from public.ingredients where name = 'Wołowina - polędwica (tenderloin)'), 200, 'g', true, 2),
((select id from public.recipes where name = 'Stek z polędwicy z masłem ziołowym'), (select id from public.ingredients where name = 'Masło'), 30, 'g', false, 1),
((select id from public.recipes where name = 'Stek z polędwicy z masłem ziołowym'), (select id from public.ingredients where name = 'Natka pietruszki (świeża)'), 10, 'g', false, 1),
((select id from public.recipes where name = 'Stek z polędwicy z masłem ziołowym'), (select id from public.ingredients where name = 'Rozmaryn (świeży)'), 3, 'g', false, 1),
((select id from public.recipes where name = 'Stek z polędwicy z masłem ziołowym'), (select id from public.ingredients where name = 'Czosnek'), 5, 'g', false, 1),
((select id from public.recipes where name = 'Stek z polędwicy z masłem ziołowym'), (select id from public.ingredients where name = 'Szparagi'), 150, 'g', true, 5),
((select id from public.recipes where name = 'Stek z polędwicy z masłem ziołowym'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 2),
((select id from public.recipes where name = 'Stek z polędwicy z masłem ziołowym'), (select id from public.ingredients where name = 'Pieprz czarny (mielony)'), 1, 'g', false, 2);

-- Kolacja 4: Kurczak pieczony z cytryną
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Kurczak pieczony z cytryną', 'kurczak-pieczony-z-cytryna', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/kurczak-pieczony-z-cytryna.webp', array['dinner']::public.meal_type_enum[], array['kurczak', 'cytryna', 'piekarnik', 'aromatyczne'], 15, 35, 'easy', 4, 'porcja', true, 4, 2);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Kurczak - pierś (bez skóry)'), 250, 'g', true, 1),
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Cytryna (sok)'), 30, 'ml', false, 1),
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Czosnek'), 15, 'g', false, 1),
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Tymianek (świeży)'), 5, 'g', false, 2),
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Papryka czerwona'), 100, 'g', true, 4),
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Cukinia'), 120, 'g', true, 4),
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 3),
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 2),
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Pieprz czarny (mielony)'), 1, 'g', false, 2);

-- Kolacja 5: Dorsz z pesto bazyliowym
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Dorsz z pesto bazyliowym', 'dorsz-z-pesto-bazyliowym', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/dorsz-z-pesto-bazyliowym.webp', array['dinner']::public.meal_type_enum[], array['dorsz', 'pesto', 'bazylia', 'włoskie'], 15, 15, 'medium', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Dorsz z pesto bazyliowym'), (select id from public.ingredients where name = 'Dorsz'), 180, 'g', true, 2),
((select id from public.recipes where name = 'Dorsz z pesto bazyliowym'), (select id from public.ingredients where name = 'Bazylia (świeża)'), 30, 'g', false, 1),
((select id from public.recipes where name = 'Dorsz z pesto bazyliowym'), (select id from public.ingredients where name = 'Ser parmezan'), 30, 'g', false, 1),
((select id from public.recipes where name = 'Dorsz z pesto bazyliowym'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 40, 'ml', false, 1),
((select id from public.recipes where name = 'Dorsz z pesto bazyliowym'), (select id from public.ingredients where name = 'Czosnek'), 5, 'g', false, 1),
((select id from public.recipes where name = 'Dorsz z pesto bazyliowym'), (select id from public.ingredients where name = 'Rukola'), 80, 'g', true, 4),
((select id from public.recipes where name = 'Dorsz z pesto bazyliowym'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 2);

-- Kolacja 6: Kotlety jagnięce (baranina) z miętą
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Kotlety z baraniny z sosem miętowym', 'kotlety-z-baraniny-z-sosem-mietowym', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/kotlety-z-baraniny-z-sosem-mietowym.webp', array['dinner']::public.meal_type_enum[], array['baranina', 'mięta', 'grill', 'orientalne'], 15, 20, 'hard', 2, 'sztuka', false, NULL, 2);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Kotlety z baraniny z sosem miętowym'), (select id from public.ingredients where name = 'Baranina - comber'), 220, 'g', true, 1),
((select id from public.recipes where name = 'Kotlety z baraniny z sosem miętowym'), (select id from public.ingredients where name = 'Jogurt grecki naturalny (pełnotłusty)'), 80, 'g', true, 3),
((select id from public.recipes where name = 'Kotlety z baraniny z sosem miętowym'), (select id from public.ingredients where name = 'Czosnek'), 5, 'g', false, 3),
((select id from public.recipes where name = 'Kotlety z baraniny z sosem miętowym'), (select id from public.ingredients where name = 'Rukola'), 60, 'g', true, 4),
((select id from public.recipes where name = 'Kotlety z baraniny z sosem miętowym'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Kotlety z baraniny z sosem miętowym'), (select id from public.ingredients where name = 'Pieprz czarny (mielony)'), 1, 'g', false, 1);

-- Kolacja 7: Krewetki w maśle czosnkowym
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Krewetki w maśle czosnkowym', 'krewetki-w-masle-czosnkowym', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/krewetki-w-masle-czosnkowym.webp', array['dinner']::public.meal_type_enum[], array['krewetki', 'czosnek', 'masło', 'szybkie'], 10, 10, 'easy', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Krewetki w maśle czosnkowym'), (select id from public.ingredients where name = 'Krewetki'), 200, 'g', true, 2),
((select id from public.recipes where name = 'Krewetki w maśle czosnkowym'), (select id from public.ingredients where name = 'Masło'), 30, 'g', false, 1),
((select id from public.recipes where name = 'Krewetki w maśle czosnkowym'), (select id from public.ingredients where name = 'Czosnek'), 15, 'g', false, 1),
((select id from public.recipes where name = 'Krewetki w maśle czosnkowym'), (select id from public.ingredients where name = 'Cytryna (sok)'), 15, 'ml', false, 3),
((select id from public.recipes where name = 'Krewetki w maśle czosnkowym'), (select id from public.ingredients where name = 'Natka pietruszki (świeża)'), 10, 'g', false, 4),
((select id from public.recipes where name = 'Krewetki w maśle czosnkowym'), (select id from public.ingredients where name = 'Cukinia'), 200, 'g', true, 5);

-- Kolacja 8: Gulasz wieprzowy po węgiersku
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Gulasz wieprzowy po węgiersku', 'gulasz-wieprzowy-po-wegiersku', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/gulasz-wieprzowy-po-wegiersku.webp', array['dinner']::public.meal_type_enum[], array['wieprzowina', 'gulasz', 'papryka', 'węgierskie'], 20, 60, 'medium', 4, 'porcja', true, 6, 2);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Gulasz wieprzowy po węgiersku'), (select id from public.ingredients where name = 'Wieprzowina - karkówka'), 220, 'g', true, 1),
((select id from public.recipes where name = 'Gulasz wieprzowy po węgiersku'), (select id from public.ingredients where name = 'Cebula biała'), 100, 'g', true, 2),
((select id from public.recipes where name = 'Gulasz wieprzowy po węgiersku'), (select id from public.ingredients where name = 'Papryka słodka (mielona)'), 8, 'g', false, 3),
((select id from public.recipes where name = 'Gulasz wieprzowy po węgiersku'), (select id from public.ingredients where name = 'Kminek'), 2, 'g', false, 3),
((select id from public.recipes where name = 'Gulasz wieprzowy po węgiersku'), (select id from public.ingredients where name = 'Czosnek'), 10, 'g', false, 3),
((select id from public.recipes where name = 'Gulasz wieprzowy po węgiersku'), (select id from public.ingredients where name = 'Śmietana 30%'), 50, 'ml', true, 5),
((select id from public.recipes where name = 'Gulasz wieprzowy po węgiersku'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 2);

-- Kolacja 9: Łosoś teriyaki z bok choy
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Łosoś teriyaki z bok choy', 'losos-teriyaki-z-bok-choy', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/losos-teriyaki-z-bok-choy.webp', array['dinner']::public.meal_type_enum[], array['łosoś', 'teriyaki', 'azjatyckie', 'bok-choy'], 15, 20, 'medium', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Łosoś teriyaki z bok choy'), (select id from public.ingredients where name = 'Łosoś (świeży)'), 180, 'g', true, 1),
((select id from public.recipes where name = 'Łosoś teriyaki z bok choy'), (select id from public.ingredients where name = 'Bok choy (kapusta chińska)'), 120, 'g', true, 3),
((select id from public.recipes where name = 'Łosoś teriyaki z bok choy'), (select id from public.ingredients where name = 'Sos sojowy'), 30, 'ml', false, 1),
((select id from public.recipes where name = 'Łosoś teriyaki z bok choy'), (select id from public.ingredients where name = 'Erytrytol'), 10, 'g', false, 1),
((select id from public.recipes where name = 'Łosoś teriyaki z bok choy'), (select id from public.ingredients where name = 'Imbir świeży'), 8, 'g', false, 1),
((select id from public.recipes where name = 'Łosoś teriyaki z bok choy'), (select id from public.ingredients where name = 'Czosnek'), 5, 'g', false, 1),
((select id from public.recipes where name = 'Łosoś teriyaki z bok choy'), (select id from public.ingredients where name = 'Nasiona sezamu'), 5, 'g', false, 4),
((select id from public.recipes where name = 'Łosoś teriyaki z bok choy'), (select id from public.ingredients where name = 'Olej sezamowy'), 5, 'ml', false, 3);

-- Kolacja 10: Sałatka cezar z kurczakiem
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Sałatka cezar z kurczakiem', 'salatka-cezar-z-kurczakiem', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/salatka-cezar-z-kurczakiem.webp', array['dinner']::public.meal_type_enum[], array['sałatka', 'cezar', 'kurczak', 'klasyka'], 15, 15, 'easy', 1, 'porcja', false, NULL, 1);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Sałatka cezar z kurczakiem'), (select id from public.ingredients where name = 'Kurczak - pierś (bez skóry)'), 180, 'g', true, 1),
((select id from public.recipes where name = 'Sałatka cezar z kurczakiem'), (select id from public.ingredients where name = 'Sałata rzymska'), 150, 'g', true, 3),
((select id from public.recipes where name = 'Sałatka cezar z kurczakiem'), (select id from public.ingredients where name = 'Majonez'), 50, 'g', true, 2),
((select id from public.recipes where name = 'Sałatka cezar z kurczakiem'), (select id from public.ingredients where name = 'Ser parmezan'), 40, 'g', true, 2),
((select id from public.recipes where name = 'Sałatka cezar z kurczakiem'), (select id from public.ingredients where name = 'Czosnek'), 5, 'g', false, 2),
((select id from public.recipes where name = 'Sałatka cezar z kurczakiem'), (select id from public.ingredients where name = 'Cytryna (sok)'), 10, 'ml', false, 2),
((select id from public.recipes where name = 'Sałatka cezar z kurczakiem'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Sałatka cezar z kurczakiem'), (select id from public.ingredients where name = 'Pieprz czarny (mielony)'), 1, 'g', false, 1);

-- =====================================================================
-- RECIPE EQUIPMENT (Meal Prep v2.0)
-- =====================================================================

-- ŚNIADANIA Equipment
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'omlet-ze-szpinakiem-i-feta'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia'), 1, 'średnia, nieprzywierająca';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jajecznica-z-lososiem-wedzonym-i-awokado'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia'), 1, 'nieprzywierająca';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'shakshuka-z-pomidorami-i-papryka'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia'), 1, 'głęboka z pokrywką';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jogurt-grecki-z-orzechami-i-jagodami'),
  (SELECT id FROM public.equipment WHERE name = 'Miska'), 1, NULL;

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'placki-z-cukinii-z-serkiem-wiejskim'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia'), 1, 'nieprzywierająca';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'placki-z-cukinii-z-serkiem-wiejskim'),
  (SELECT id FROM public.equipment WHERE name = 'Miska'), 1, 'do mieszania ciasta';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'frittata-z-brokulami-i-serem-cheddar'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia'), 1, 'żaroodporna';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'frittata-z-brokulami-i-serem-cheddar'),
  (SELECT id FROM public.equipment WHERE name = 'Piekarnik'), 1, '180°C';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'frittata-z-brokulami-i-serem-cheddar'),
  (SELECT id FROM public.equipment WHERE name = 'Garnek'), 1, 'do blanszowania brokułów';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chia-pudding-kokosowy-z-borowkami'),
  (SELECT id FROM public.equipment WHERE name = 'Miska'), 1, 'do mieszania i schładzania';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'twarog-z-orzechami-laskowymi-i-cynamonem'),
  (SELECT id FROM public.equipment WHERE name = 'Miska'), 1, NULL;

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jajka-sadzone-z-boczkiem-i-awokado'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia'), 1, 'nieprzywierająca';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'smoothie-bowl-z-awokado-i-szpinakiem'),
  (SELECT id FROM public.equipment WHERE name = 'Blender'), 1, NULL;
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'smoothie-bowl-z-awokado-i-szpinakiem'),
  (SELECT id FROM public.equipment WHERE name = 'Miska'), 1, 'do podania';

-- OBIADY Equipment
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'grillowana-piers-z-kurczaka-z-brokulami'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia grillowa'), 1, 'dobrze rozgrzana';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'grillowana-piers-z-kurczaka-z-brokulami'),
  (SELECT id FROM public.equipment WHERE name = 'Garnek'), 1, 'do gotowania brokułów';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'filet-z-lososia-z-szparagami'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia'), 1, 'nieprzywierająca';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'filet-z-lososia-z-szparagami'),
  (SELECT id FROM public.equipment WHERE name = 'Garnek'), 1, 'do szparagów';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'stek-wolowy-z-salatka-z-rukoli'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia'), 1, 'żeliwna, dobrze rozgrzana';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'stek-wolowy-z-salatka-z-rukoli'),
  (SELECT id FROM public.equipment WHERE name = 'Miska'), 1, 'do sałatki';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kurczak-curry-z-mlekiem-kokosowym'),
  (SELECT id FROM public.equipment WHERE name = 'Wok'), 1, 'lub głęboka patelnia';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'dorsz-pieczony-z-warzywami'),
  (SELECT id FROM public.equipment WHERE name = 'Piekarnik'), 1, '200°C';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'dorsz-pieczony-z-warzywami'),
  (SELECT id FROM public.equipment WHERE name = 'Blacha do pieczenia'), 1, 'wyłożona papierem';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kotlety-z-indyka-z-puree-z-kalafiora'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia'), 1, 'do kotletów';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kotlety-z-indyka-z-puree-z-kalafiora'),
  (SELECT id FROM public.equipment WHERE name = 'Garnek'), 1, 'do gotowania kalafiora';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kotlety-z-indyka-z-puree-z-kalafiora'),
  (SELECT id FROM public.equipment WHERE name = 'Blender ręczny'), 1, 'do puree';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'salatka-z-tunczyka-i-jajkiem'),
  (SELECT id FROM public.equipment WHERE name = 'Garnek'), 1, 'do gotowania jajek';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'salatka-z-tunczyka-i-jajkiem'),
  (SELECT id FROM public.equipment WHERE name = 'Miska'), 1, 'duża do mieszania';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'udka-z-kurczaka-pieczone-z-ziolami'),
  (SELECT id FROM public.equipment WHERE name = 'Piekarnik'), 1, '180°C';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'udka-z-kurczaka-pieczone-z-ziolami'),
  (SELECT id FROM public.equipment WHERE name = 'Brytfanna'), 1, NULL;

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'krewetki-w-czosnku-z-cukinia'),
  (SELECT id FROM public.equipment WHERE name = 'Wok'), 1, 'lub duża patelnia';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'schab-wieprzowy-z-kapusta'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia'), 1, 'do schabu';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'schab-wieprzowy-z-kapusta'),
  (SELECT id FROM public.equipment WHERE name = 'Garnek'), 1, 'do duszenia kapusty';

-- KOLACJE Equipment
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'pieczony-losos-z-salsa-z-awokado'),
  (SELECT id FROM public.equipment WHERE name = 'Piekarnik'), 1, '200°C';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'pieczony-losos-z-salsa-z-awokado'),
  (SELECT id FROM public.equipment WHERE name = 'Blacha do pieczenia'), 1, 'wyłożona papierem';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'pieczony-losos-z-salsa-z-awokado'),
  (SELECT id FROM public.equipment WHERE name = 'Miska'), 1, 'do salsy';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'piers-z-indyka-w-sosie-grzybowym'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia'), 1, 'głęboka do sosu';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'piers-z-indyka-w-sosie-grzybowym'),
  (SELECT id FROM public.equipment WHERE name = 'Garnek'), 1, 'do brokułów';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'stek-z-poledwicy-z-maslem-ziolowym'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia'), 1, 'żeliwna, bardzo gorąca';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'stek-z-poledwicy-z-maslem-ziolowym'),
  (SELECT id FROM public.equipment WHERE name = 'Miska'), 1, 'do masła ziołowego';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kurczak-pieczony-z-cytryna'),
  (SELECT id FROM public.equipment WHERE name = 'Piekarnik'), 1, '200°C';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kurczak-pieczony-z-cytryna'),
  (SELECT id FROM public.equipment WHERE name = 'Blacha do pieczenia'), 1, NULL;

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'dorsz-z-pesto-bazyliowym'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia'), 1, 'nieprzywierająca';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'dorsz-z-pesto-bazyliowym'),
  (SELECT id FROM public.equipment WHERE name = 'Blender'), 1, 'do pesto';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kotlety-z-baraniny-z-sosem-mietowym'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia grillowa'), 1, 'bardzo gorąca';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kotlety-z-baraniny-z-sosem-mietowym'),
  (SELECT id FROM public.equipment WHERE name = 'Miska'), 1, 'do sosu miętowego';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'krewetki-w-masle-czosnkowym'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia'), 1, 'duża';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'gulasz-wieprzowy-po-wegiersku'),
  (SELECT id FROM public.equipment WHERE name = 'Garnek'), 1, 'duży, żeliwny lub ciężki';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'losos-teriyaki-z-bok-choy'),
  (SELECT id FROM public.equipment WHERE name = 'Wok'), 1, 'lub patelnia';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'losos-teriyaki-z-bok-choy'),
  (SELECT id FROM public.equipment WHERE name = 'Rondel'), 1, 'do sosu teriyaki';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'salatka-cezar-z-kurczakiem'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia grillowa'), 1, 'do kurczaka';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'salatka-cezar-z-kurczakiem'),
  (SELECT id FROM public.equipment WHERE name = 'Miska'), 1, 'duża do mieszania sałatki';

-- =====================================================================
-- RECIPE INSTRUCTIONS (Meal Prep v2.0)
-- =====================================================================

-- 1. Omlet ze szpinakiem i fetą
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'omlet-ze-szpinakiem-i-feta'), 1,
  'Rozbij jajka do miski, dodaj sól i pieprz. Roztrzep widelcem do połączenia.', 2, 0, 'prep', false, 'linear', '{"visual": "jednolita konsystencja"}';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'omlet-ze-szpinakiem-i-feta'), 2,
  'Rozgrzej patelnię na średnim ogniu, dodaj oliwę.', 1, 1, 'active', true, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'omlet-ze-szpinakiem-i-feta'), 3,
  'Dodaj szpinak na patelnię, smaż mieszając aż zwiędnie (około 1-2 min).', 2, 0, 'active', false, 'constant', '{"visual": "szpinak zmniejsza objętość"}';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'omlet-ze-szpinakiem-i-feta'), 4,
  'Wlej jajka na patelnię, rozłóż równomiernie. Gdy spód się zetnie, posyp pokruszoną fetą i złóż omlet na pół.', 4, 0, 'active', false, 'constant', '{"visual": "złoty spód, ścięte brzegi"}';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'omlet-ze-szpinakiem-i-feta'), 5,
  'Przełóż na talerz i podawaj natychmiast.', 1, 0, 'assembly', false, 'constant';

-- 2. Jajecznica z łososiem wędzonym i awokado
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jajecznica-z-lososiem-wedzonym-i-awokado'), 1,
  'Rozbij jajka do miski, dodaj śmietanę. Roztrzep do połączenia.', 2, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jajecznica-z-lososiem-wedzonym-i-awokado'), 2,
  'Rozgrzej patelnię na małym ogniu, rozpuść masło.', 1, 1, 'active', true, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jajecznica-z-lososiem-wedzonym-i-awokado'), 3,
  'Wlej jajka, mieszaj powoli szpatułką formując duże skrzepy. Zdejmij z ognia gdy jajka są jeszcze lekko płynne.', 4, 0, 'active', false, 'constant', '{"visual": "kremowa konsystencja, duże skrzepy"}';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jajecznica-z-lososiem-wedzonym-i-awokado'), 4,
  'Pokrój awokado w plastry, ułóż łososia wędznonego na talerzu.', 2, 0, 'prep', true, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jajecznica-z-lososiem-wedzonym-i-awokado'), 5,
  'Ułóż jajecznicę obok łososia i awokado, posyp szczypiorkiem.', 1, 0, 'assembly', false, 'constant';

-- 3. Shakshuka z pomidorami i papryką
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'shakshuka-z-pomidorami-i-papryka'), 1,
  'Pokrój cebulę w kostkę, paprykę w paski, posiekaj czosnek.', 5, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'shakshuka-z-pomidorami-i-papryka'), 2,
  'Rozgrzej oliwę na patelni. Smaż cebulę i paprykę przez 5 min, dodaj czosnek.', 6, 0, 'active', false, 'constant', '{"visual": "zmiękłe warzywa", "smell": "aromatyczne"}';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'shakshuka-z-pomidorami-i-papryka'), 3,
  'Dodaj pomidory z puszki i kminek. Gotuj na wolnym ogniu przez 10 min.', 2, 10, 'passive', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, checkpoint_type, checkpoint_condition, is_critical_timing, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'shakshuka-z-pomidorami-i-papryka'), 4,
  'Zrób zagłębienia w sosie, wbij jajka. Przykryj i gotuj 5-7 min.', 2, 6, 'passive', false, 'constant', 'visual', 'Białka ścięte, żółtka płynne', true, '{"visual": "ścięte białka"}';

-- 4. Jogurt grecki z orzechami i jagodami
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jogurt-grecki-z-orzechami-i-jagodami'), 1,
  'Przełóż jogurt grecki do miski.', 1, 0, 'assembly', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jogurt-grecki-z-orzechami-i-jagodami'), 2,
  'Grubo posiekaj orzechy włoskie, migdały i pekan.', 2, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jogurt-grecki-z-orzechami-i-jagodami'), 3,
  'Ułóż jagody i jeżyny na jogurcie. Posyp orzechami i nasionami.', 2, 0, 'assembly', false, 'constant';

-- 5. Placki z cukinii z serkiem wiejskim
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'placki-z-cukinii-z-serkiem-wiejskim'), 1,
  'Zetrzyj cukinię na tarce. Posól i odstaw na 5 min, następnie odciśnij wodę.', 5, 5, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'placki-z-cukinii-z-serkiem-wiejskim'), 2,
  'Do miski z cukinią dodaj jajko, mąkę kokosową, czosnek, sól i pieprz. Wymieszaj.', 3, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'placki-z-cukinii-z-serkiem-wiejskim'), 3,
  'Rozgrzej oliwę na patelni. Nakładaj masę łyżką i smaż po 3-4 min z każdej strony.', 10, 0, 'active', false, 'linear', '{"visual": "złotobrązowe z obu stron"}';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'placki-z-cukinii-z-serkiem-wiejskim'), 4,
  'Podawaj placki z serkiem wiejskim i posypane szczypiorkiem.', 2, 0, 'assembly', false, 'constant';

-- 6. Frittata z brokułami i serem cheddar
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'frittata-z-brokulami-i-serem-cheddar'), 1,
  'Rozgrzej piekarnik do 180°C. Blanszuj brokuły 3 min. Odcedź.', 5, 3, 'prep', true, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'frittata-z-brokulami-i-serem-cheddar'), 2,
  'Rozbij jajka do miski, dopraw solą i pieprzem, roztrzep.', 2, 0, 'prep', true, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'frittata-z-brokulami-i-serem-cheddar'), 3,
  'Rozgrzej oliwę na żaroodpornej patelni. Zeszklij cebulę 3 min.', 4, 0, 'active', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'frittata-z-brokulami-i-serem-cheddar'), 4,
  'Dodaj brokuły, zalej jajkami, posyp serem cheddar. Piecz 15-18 min.', 2, 17, 'passive', false, 'constant';

-- 7. Chia pudding kokosowy z borówkami
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chia-pudding-kokosowy-z-borowkami'), 1,
  'Wymieszaj mleko kokosowe, nasiona chia i erytrytol w misce.', 2, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chia-pudding-kokosowy-z-borowkami'), 2,
  'Odstaw do lodówki na minimum 4 godziny lub na noc.', 0, 240, 'passive', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chia-pudding-kokosowy-z-borowkami'), 3,
  'Przed podaniem wymieszaj i udekoruj borówkami.', 1, 0, 'assembly', false, 'constant';

-- 8. Twaróg z orzechami laskowymi i cynamonem
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'twarog-z-orzechami-laskowymi-i-cynamonem'), 1,
  'Wymieszaj twaróg z kefirem do kremowej konsystencji.', 2, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'twarog-z-orzechami-laskowymi-i-cynamonem'), 2,
  'Dodaj cynamon i erytrytol, wymieszaj.', 1, 0, 'active', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'twarog-z-orzechami-laskowymi-i-cynamonem'), 3,
  'Posyp posiekanymi orzechami i pokrojonymi truskawkami.', 2, 0, 'assembly', false, 'constant';

-- 9. Jajka sadzone z boczkiem i awokado
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jajka-sadzone-z-boczkiem-i-awokado'), 1,
  'Pokrój boczek w paski. Smaż na suchej patelni aż będzie chrupiący.', 6, 0, 'active', false, 'constant', '{"visual": "chrupiący, złoty"}';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jajka-sadzone-z-boczkiem-i-awokado'), 2,
  'Na tłuszczu z boczku usmaż jajka sadzone przez 3-4 min.', 4, 0, 'active', false, 'constant', '{"visual": "ścięte białko, płynne żółtko"}';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jajka-sadzone-z-boczkiem-i-awokado'), 3,
  'Pokrój awokado. Ułóż wszystko na talerzu, posyp pieprzem i szczypiorkiem.', 2, 0, 'assembly', false, 'linear';

-- 10. Smoothie bowl z awokado i szpinakiem
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'smoothie-bowl-z-awokado-i-szpinakiem'), 1,
  'Zblenduj awokado, szpinak, mleko migdałowe i truskawki do gładkości.', 3, 0, 'active', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'smoothie-bowl-z-awokado-i-szpinakiem'), 2,
  'Przelej do miski, udekoruj malinami, nasionami chia i migdałami.', 3, 0, 'assembly', false, 'linear';

-- 11. Grillowana pierś z kurczaka z brokułami
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'grillowana-piers-z-kurczaka-z-brokulami'), 1,
  'Dopraw pierś z kurczaka solą, pieprzem i oregano.', 2, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'grillowana-piers-z-kurczaka-z-brokulami'), 2,
  'Grilluj kurczaka 6-7 min z każdej strony. Odstaw 3 min.', 2, 15, 'passive', false, 'constant', '{"visual": "paski z grilla"}';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'grillowana-piers-z-kurczaka-z-brokulami'), 3,
  'Gotuj brokuły na parze 4-5 min. Pokrój kurczaka, podawaj z brokułami.', 6, 0, 'active', true, 'constant';

-- 12. Filet z łososia z szparagami
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'filet-z-lososia-z-szparagami'), 1,
  'Dopraw łososia solą, pieprzem i czosnkiem. Natłuść oliwą.', 2, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'filet-z-lososia-z-szparagami'), 2,
  'Smaż łososia skórą do dołu 5 min, odwróć i smaż 3-4 min.', 2, 8, 'passive', false, 'constant', '{"visual": "chrupiąca skóra"}';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'filet-z-lososia-z-szparagami'), 3,
  'Smaż szparagi na ghee 4-5 min. Podawaj ze skropionym sokiem z cytryny.', 5, 0, 'active', true, 'constant';

-- 13. Stek wołowy z sałatką z rukoli
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'stek-wolowy-z-salatka-z-rukoli'), 1,
  'Wyjmij stek z lodówki 30 min przed. Dopraw solą i pieprzem.', 2, 30, 'prep', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues, is_critical_timing)
SELECT (SELECT id FROM public.recipes WHERE slug = 'stek-wolowy-z-salatka-z-rukoli'), 2,
  'Smaż stek 3-4 min z każdej strony. Odstaw 5 min.', 2, 12, 'passive', false, 'constant', '{"sound": "intensywny syk"}', true;
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'stek-wolowy-z-salatka-z-rukoli'), 3,
  'Wymieszaj rukolę z pomidorami. Pokrój stek, ułóż na sałatce z parmezanem.', 4, 0, 'assembly', true, 'linear';

-- 14. Kurczak curry z mlekiem kokosowym
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kurczak-curry-z-mlekiem-kokosowym'), 1,
  'Pokrój kurczaka w kostkę. Posiekaj cebulę, czosnek i imbir.', 5, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kurczak-curry-z-mlekiem-kokosowym'), 2,
  'Smaż cebulę 3 min, dodaj czosnek, imbir, kurkumę i kurczaka. Smaż 5 min.', 9, 0, 'active', false, 'constant', '{"smell": "aromatyczne"}';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kurczak-curry-z-mlekiem-kokosowym'), 3,
  'Wlej mleko kokosowe, gotuj 10 min. Dodaj kalafior i gotuj 5 min.', 2, 15, 'passive', false, 'constant';

-- 15. Dorsz pieczony z warzywami
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'dorsz-pieczony-z-warzywami'), 1,
  'Rozgrzej piekarnik do 200°C. Pokrój warzywa.', 6, 5, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'dorsz-pieczony-z-warzywami'), 2,
  'Ułóż warzywa na blasze, skrop oliwą, posyp ziołami. Piecz 10 min.', 2, 10, 'passive', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'dorsz-pieczony-z-warzywami'), 3,
  'Ułóż dorsza na warzywach. Piecz kolejne 15 min.', 2, 15, 'passive', false, 'constant';

-- 16. Kotlety z indyka z puree z kalafiora
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kotlety-z-indyka-z-puree-z-kalafiora'), 1,
  'Zmiel indyka, wymieszaj z jajkiem i czosnkiem. Uformuj kotlety.', 8, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kotlety-z-indyka-z-puree-z-kalafiora'), 2,
  'Smaż kotlety po 5 min z każdej strony. Gotuj kalafior 10 min.', 2, 10, 'passive', true, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kotlety-z-indyka-z-puree-z-kalafiora'), 3,
  'Zblenduj kalafior z masłem i śmietaną. Podawaj z kotletami.', 4, 0, 'active', false, 'linear';

-- 17. Sałatka z tuńczyka i jajkiem
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'salatka-z-tunczyka-i-jajkiem'), 1,
  'Ugotuj jajka na twardo 10 min. Ostudź i obierz.', 2, 10, 'passive', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'salatka-z-tunczyka-i-jajkiem'), 2,
  'Pokrój sałatę, ogórek i pomidorki. Odcedź tuńczyka.', 5, 0, 'prep', true, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'salatka-z-tunczyka-i-jajkiem'), 3,
  'Wymieszaj wszystko, polej oliwą i sokiem z cytryny. Ułóż jajka.', 3, 0, 'assembly', false, 'linear';

-- 18. Udka z kurczaka pieczone z ziołami
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'udka-z-kurczaka-pieczone-z-ziolami'), 1,
  'Rozgrzej piekarnik do 180°C. Natrzyj udka oliwą i ziołami.', 6, 5, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'udka-z-kurczaka-pieczone-z-ziolami'), 2,
  'Piecz 40-45 min. Podawaj z blanszowanym szpinakiem.', 2, 45, 'passive', false, 'constant', '{"visual": "złota skórka"}';

-- 19. Krewetki w czosnku z cukinią
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'krewetki-w-czosnku-z-cukinia'), 1,
  'Pokrój czosnek i cukinię.', 3, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues, is_critical_timing)
SELECT (SELECT id FROM public.recipes WHERE slug = 'krewetki-w-czosnku-z-cukinia'), 2,
  'Smaż czosnek 30 sek, dodaj krewetki i smaż 2-3 min aż zróżowieją.', 4, 0, 'active', false, 'constant', '{"visual": "różowe krewetki"}', true;
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'krewetki-w-czosnku-z-cukinia'), 3,
  'Dodaj cukinię, smaż 3-4 min. Skrop sokiem z limonki.', 4, 0, 'active', false, 'constant';

-- 20. Schab wieprzowy z kapustą
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'schab-wieprzowy-z-kapusta'), 1,
  'Dopraw schab. Smaż 4-5 min z każdej strony. Odłóż.', 2, 8, 'passive', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'schab-wieprzowy-z-kapusta'), 2,
  'Poszatkuj kapustę. Smaż cebulę 3 min, dodaj kapustę i kminek.', 6, 0, 'active', true, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'schab-wieprzowy-z-kapusta'), 3,
  'Duś kapustę pod przykryciem 15 min. Pokrój schab i podawaj.', 3, 15, 'passive', false, 'constant';

-- 21. Pieczony łosoś z salsą z awokado
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'pieczony-losos-z-salsa-z-awokado'), 1,
  'Rozgrzej piekarnik do 200°C. Dopraw łososia i ułóż na blasze.', 3, 5, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'pieczony-losos-z-salsa-z-awokado'), 2,
  'Piecz łososia 15-18 min. Przygotuj salsę z awokado i pomidora.', 5, 17, 'passive', true, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'pieczony-losos-z-salsa-z-awokado'), 3,
  'Podawaj łososia na rukoli, polej salsą.', 2, 0, 'assembly', false, 'constant';

-- 22. Pierś z indyka w sosie grzybowym
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'piers-z-indyka-w-sosie-grzybowym'), 1,
  'Dopraw indyka. Smaż 5-6 min z każdej strony. Odłóż.', 2, 10, 'passive', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'piers-z-indyka-w-sosie-grzybowym'), 2,
  'Smaż pieczarki z czosnkiem 5 min. Wlej śmietanę, gotuj 3 min.', 8, 0, 'active', false, 'constant', '{"visual": "zbrązowiałe pieczarki"}';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'piers-z-indyka-w-sosie-grzybowym'), 3,
  'Włóż indyka do sosu. Podawaj z ugotowanymi brokułami.', 3, 0, 'assembly', true, 'constant';

-- 23. Stek z polędwicy z masłem ziołowym
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'stek-z-poledwicy-z-maslem-ziolowym'), 1,
  'Przygotuj masło ziołowe. Wyjmij polędwicę 30 min przed smażeniem.', 5, 30, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues, is_critical_timing)
SELECT (SELECT id FROM public.recipes WHERE slug = 'stek-z-poledwicy-z-maslem-ziolowym'), 2,
  'Smaż polędwicę 2-3 min z każdej strony. Odstaw 5 min.', 1, 10, 'passive', false, 'constant', '{"sound": "intensywny syk"}', true;
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'stek-z-poledwicy-z-maslem-ziolowym'), 3,
  'Połóż masło ziołowe na steku. Podawaj ze szparagami.', 3, 0, 'assembly', true, 'constant';

-- 24. Kurczak pieczony z cytryną
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kurczak-pieczony-z-cytryna'), 1,
  'Rozgrzej piekarnik do 200°C. Natrzyj kurczaka sokiem z cytryny i ziołami.', 6, 5, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kurczak-pieczony-z-cytryna'), 2,
  'Piecz 25 min. Dodaj paprykę i cukinię, piecz 10 min.', 3, 35, 'passive', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kurczak-pieczony-z-cytryna'), 3,
  'Pokrój kurczaka i podawaj z pieczonymi warzywami.', 2, 0, 'assembly', false, 'constant';

-- 25. Dorsz z pesto bazyliowym
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'dorsz-z-pesto-bazyliowym'), 1,
  'Przygotuj pesto: zblenduj bazylię, parmezan, oliwę i czosnek.', 5, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'dorsz-z-pesto-bazyliowym'), 2,
  'Smaż dorsza 4-5 min z każdej strony.', 2, 8, 'passive', false, 'constant', '{"visual": "biały, nieprzezroczysty"}';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'dorsz-z-pesto-bazyliowym'), 3,
  'Podawaj dorsza na rukoli, polej pesto.', 2, 0, 'assembly', false, 'constant';

-- 26. Kotlety z baraniny z sosem miętowym
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kotlety-z-baraniny-z-sosem-mietowym'), 1,
  'Dopraw baraninę. Wyjmij z lodówki 20 min przed.', 1, 20, 'prep', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues, is_critical_timing)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kotlety-z-baraniny-z-sosem-mietowym'), 2,
  'Grilluj kotlety 4-5 min z każdej strony.', 1, 9, 'passive', false, 'constant', '{"visual": "różowy środek"}', true;
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kotlety-z-baraniny-z-sosem-mietowym'), 3,
  'Wymieszaj jogurt z czosnkiem. Podawaj z sosem i rukolą.', 4, 0, 'assembly', true, 'linear';

-- 27. Krewetki w maśle czosnkowym
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'krewetki-w-masle-czosnkowym'), 1,
  'Posiekaj czosnek i natkę pietruszki.', 3, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues, is_critical_timing)
SELECT (SELECT id FROM public.recipes WHERE slug = 'krewetki-w-masle-czosnkowym'), 2,
  'Rozpuść masło, smaż czosnek 30 sek. Dodaj krewetki i smaż 2-3 min z każdej strony.', 6, 0, 'active', false, 'constant', '{"visual": "różowe krewetki"}', true;
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'krewetki-w-masle-czosnkowym'), 3,
  'Skrop sokiem z cytryny, posyp natką. Podawaj z cukinią.', 2, 0, 'assembly', true, 'constant';

-- 28. Gulasz wieprzowy po węgiersku
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'gulasz-wieprzowy-po-wegiersku'), 1,
  'Pokrój mięso w kostkę, posiekaj cebulę i czosnek.', 8, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'gulasz-wieprzowy-po-wegiersku'), 2,
  'Obsmaż mięso partiami. Zeszklij cebulę, dodaj przyprawy.', 15, 0, 'active', false, 'linear', '{"visual": "złotobrązowe mięso"}';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'gulasz-wieprzowy-po-wegiersku'), 3,
  'Duś pod przykryciem 50-60 min. Wmieszaj śmietanę przed podaniem.', 3, 55, 'passive', false, 'constant', '{"texture": "miękkie mięso"}';

-- 29. Łosoś teriyaki z bok choy
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'losos-teriyaki-z-bok-choy'), 1,
  'Przygotuj sos teriyaki. Marynuj łososia 10 min.', 5, 10, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'losos-teriyaki-z-bok-choy'), 2,
  'Smaż łososia 3-4 min z każdej strony.', 2, 7, 'passive', false, 'constant', '{"visual": "karmelizowana powierzchnia"}';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'losos-teriyaki-z-bok-choy'), 3,
  'Dodaj bok choy, podsmaż 2 min. Polej sosem, posyp sezamem.', 3, 0, 'active', false, 'constant';

-- 30. Sałatka cezar z kurczakiem
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'salatka-cezar-z-kurczakiem'), 1,
  'Dopraw kurczaka. Grilluj 5-6 min z każdej strony.', 2, 10, 'passive', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'salatka-cezar-z-kurczakiem'), 2,
  'Przygotuj dressing: wymieszaj majonez, parmezan, czosnek i sok z cytryny.', 3, 0, 'prep', true, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'salatka-cezar-z-kurczakiem'), 3,
  'Pokrój sałatę i kurczaka. Wymieszaj z dressingiem, posyp parmezanem.', 4, 0, 'assembly', false, 'linear';

-- =====================================================================
-- PRZEPISY BAZOWE (KOMPONENTY) - Meal Prep v2.0
-- =====================================================================

-- Chleb keto (komponent bazowy - można użyć w innych przepisach)
insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Chleb keto', 'chleb-keto', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/chleb-keto.webp', array['breakfast']::public.meal_type_enum[], array['pieczywo', 'keto', 'low-carb', 'komponent'], 10, 45, 'medium', 10, 'kromka', true, 10, 10);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where slug = 'chleb-keto'), (select id from public.ingredients where name = 'Mąka migdałowa'), 200, 'g', true, 1),
((select id from public.recipes where slug = 'chleb-keto'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 180, 'g', true, 2),
((select id from public.recipes where slug = 'chleb-keto'), (select id from public.ingredients where name = 'Masło'), 60, 'g', true, 1),
((select id from public.recipes where slug = 'chleb-keto'), (select id from public.ingredients where name = 'Sól'), 3, 'g', false, 1);

-- Equipment dla chleba keto
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chleb-keto'),
  (SELECT id FROM public.equipment WHERE name = 'Piekarnik'), 1, '175°C';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chleb-keto'),
  (SELECT id FROM public.equipment WHERE name = 'Miska'), 1, 'do mieszania ciasta';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chleb-keto'),
  (SELECT id FROM public.equipment WHERE name = 'Forma do pieczenia'), 1, 'keksówka 25cm';

-- Instructions dla chleba keto
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chleb-keto'), 1,
  'Rozgrzej piekarnik do 175°C. Wyłóż formę papierem do pieczenia.', 2, 0, 'prep', true, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chleb-keto'), 2,
  'Rozpuść masło i wystudź. Wymieszaj mąkę migdałową z solą.', 3, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chleb-keto'), 3,
  'Dodaj jajka i masło do suchych składników. Mieszaj do uzyskania jednolitego ciasta.', 3, 0, 'active', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues, checkpoint_type, checkpoint_condition, is_critical_timing)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chleb-keto'), 4,
  'Przełóż ciasto do formy, wyrównaj. Piecz 40-45 min.', 2, 42, 'passive', false, 'constant', '{"visual": "złotobrązowy wierzch", "touch": "patyczek wychodzi suchy"}', 'visual', 'Patyczek wychodzi suchy', true;
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chleb-keto'), 5,
  'Wyjmij z piekarnika, odstaw do ostygnięcia 15 min przed krojeniem.', 1, 15, 'passive', false, 'constant';

-- =====================================================================
-- PRZEPIS Z KOMPONENTEM: Tosty keto z awokado i jajkiem
-- =====================================================================

insert into public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) values
('Tosty keto z awokado i jajkiem sadzonym', 'tosty-keto-z-awokado-i-jajkiem', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/tosty-keto-z-awokado-i-jajkiem.webp', array['breakfast']::public.meal_type_enum[], array['tosty', 'awokado', 'jajka', 'szybkie', 'keto'], 5, 8, 'easy', 1, 'porcja', false, NULL, 1);

-- Składniki (bez chleba - chleb jest komponentem)
insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where slug = 'tosty-keto-z-awokado-i-jajkiem'), (select id from public.ingredients where name = 'Awokado'), 100, 'g', true, 2),
((select id from public.recipes where slug = 'tosty-keto-z-awokado-i-jajkiem'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 120, 'g', true, 3),
((select id from public.recipes where slug = 'tosty-keto-z-awokado-i-jajkiem'), (select id from public.ingredients where name = 'Masło'), 10, 'g', false, 3),
((select id from public.recipes where slug = 'tosty-keto-z-awokado-i-jajkiem'), (select id from public.ingredients where name = 'Sól'), 1, 'g', false, 2),
((select id from public.recipes where slug = 'tosty-keto-z-awokado-i-jajkiem'), (select id from public.ingredients where name = 'Pieprz czarny (mielony)'), 0.5, 'g', false, 2),
((select id from public.recipes where slug = 'tosty-keto-z-awokado-i-jajkiem'), (select id from public.ingredients where name = 'Płatki chili'), 0.5, 'g', false, 5);

-- KOMPONENT: Chleb keto jako składnik przepisu
INSERT INTO public.recipe_components (parent_recipe_id, component_recipe_id, required_amount, unit)
SELECT
  (SELECT id FROM public.recipes WHERE slug = 'tosty-keto-z-awokado-i-jajkiem'),
  (SELECT id FROM public.recipes WHERE slug = 'chleb-keto'),
  100, 'g';  -- 2 kromki ~100g

-- Equipment dla tostów
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'tosty-keto-z-awokado-i-jajkiem'),
  (SELECT id FROM public.equipment WHERE name = 'Patelnia'), 1, 'nieprzywierająca';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'tosty-keto-z-awokado-i-jajkiem'),
  (SELECT id FROM public.equipment WHERE name = 'Opiekacz'), 1, 'lub patelnia grillowa';

-- Instructions dla tostów
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'tosty-keto-z-awokado-i-jajkiem'), 1,
  'Pokrój chleb keto w kromki (~1cm grubości). Opiecz w tosterze lub na patelni grillowej.', 3, 0, 'active', true, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'tosty-keto-z-awokado-i-jajkiem'), 2,
  'Rozgnieć awokado widelcem, dopraw solą i pieprzem.', 2, 0, 'prep', true, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type, sensory_cues)
SELECT (SELECT id FROM public.recipes WHERE slug = 'tosty-keto-z-awokado-i-jajkiem'), 3,
  'Rozgrzej masło na patelni. Usmaż jajka sadzone (2-3 min na stronę).', 1, 4, 'active', false, 'constant', '{"visual": "ścięte białko, płynne żółtko"}';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'tosty-keto-z-awokado-i-jajkiem'), 4,
  'Nałóż awokado na tosty, ułóż jajka sadzone na wierzchu.', 1, 0, 'assembly', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'tosty-keto-z-awokado-i-jajkiem'), 5,
  'Posyp płatkami chili i podawaj natychmiast.', 1, 0, 'assembly', false, 'constant';

-- =====================================================================
-- PRZEKĄSKI PORANNE (MORNING SNACKS) - 10 przepisów
-- Lekkie, energetyzujące przekąski na poranek
-- =====================================================================

-- Przekąska poranna 1: Kulki energetyczne z orzechami
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Kulki energetyczne z orzechami', 'kulki-energetyczne-z-orzechami', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/kulki-energetyczne-z-orzechami.webp', array['snack_morning']::public.meal_type_enum[], array['orzechy', 'bez-pieczenia', 'meal-prep', 'energia'], 15, 0, 'easy', 8, 'kulka', true, 16, 4);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'kulki-energetyczne-z-orzechami'), (SELECT id FROM public.ingredients WHERE name = 'Migdały'), 50, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'kulki-energetyczne-z-orzechami'), (SELECT id FROM public.ingredients WHERE name = 'Orzechy włoskie'), 30, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'kulki-energetyczne-z-orzechami'), (SELECT id FROM public.ingredients WHERE name = 'Wiórki kokosowe'), 30, 'g', true, 2),
((SELECT id FROM public.recipes WHERE slug = 'kulki-energetyczne-z-orzechami'), (SELECT id FROM public.ingredients WHERE name = 'Masło'), 20, 'g', true, 2),
((SELECT id FROM public.recipes WHERE slug = 'kulki-energetyczne-z-orzechami'), (SELECT id FROM public.ingredients WHERE name = 'Erytrytol'), 10, 'g', false, 2);

-- Przekąska poranna 2: Jogurt grecki z malinami
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Jogurt grecki z malinami', 'jogurt-grecki-z-malinami', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/jogurt-grecki-z-malinami.webp', array['snack_morning']::public.meal_type_enum[], array['jogurt', 'owoce', 'szybkie', 'białko'], 3, 0, 'easy', 1, 'porcja', false, NULL, 1);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'jogurt-grecki-z-malinami'), (SELECT id FROM public.ingredients WHERE name = 'Jogurt grecki naturalny (pełnotłusty)'), 150, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'jogurt-grecki-z-malinami'), (SELECT id FROM public.ingredients WHERE name = 'Maliny'), 50, 'g', true, 2),
((SELECT id FROM public.recipes WHERE slug = 'jogurt-grecki-z-malinami'), (SELECT id FROM public.ingredients WHERE name = 'Nasiona chia'), 5, 'g', true, 3);

-- Przekąska poranna 3: Rolada z szynki z serkiem
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Rolada z szynki z serkiem', 'rolada-z-szynki-z-serkiem', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/rolada-z-szynki-z-serkiem.webp', array['snack_morning']::public.meal_type_enum[], array['szynka', 'ser', 'białko', 'szybkie'], 5, 0, 'easy', 4, 'rolada', true, 8, 2);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'rolada-z-szynki-z-serkiem'), (SELECT id FROM public.ingredients WHERE name = 'Szynka z indyka (bez dodatków)'), 80, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'rolada-z-szynki-z-serkiem'), (SELECT id FROM public.ingredients WHERE name = 'Serek wiejski'), 60, 'g', true, 2),
((SELECT id FROM public.recipes WHERE slug = 'rolada-z-szynki-z-serkiem'), (SELECT id FROM public.ingredients WHERE name = 'Szczypiorek'), 5, 'g', false, 2),
((SELECT id FROM public.recipes WHERE slug = 'rolada-z-szynki-z-serkiem'), (SELECT id FROM public.ingredients WHERE name = 'Pieprz czarny (mielony)'), 0.5, 'g', false, 2);

-- Przekąska poranna 4: Awokado z jajkiem na twardo
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Awokado z jajkiem na twardo', 'awokado-z-jajkiem-na-twardo', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/awokado-z-jajkiem-na-twardo.webp', array['snack_morning']::public.meal_type_enum[], array['awokado', 'jajka', 'zdrowe-tłuszcze', 'białko'], 5, 10, 'easy', 1, 'porcja', false, NULL, 1);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'awokado-z-jajkiem-na-twardo'), (SELECT id FROM public.ingredients WHERE name = 'Awokado'), 80, 'g', true, 3),
((SELECT id FROM public.recipes WHERE slug = 'awokado-z-jajkiem-na-twardo'), (SELECT id FROM public.ingredients WHERE name = 'Jajko kurze (całe)'), 60, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'awokado-z-jajkiem-na-twardo'), (SELECT id FROM public.ingredients WHERE name = 'Sól'), 1, 'g', false, 4),
((SELECT id FROM public.recipes WHERE slug = 'awokado-z-jajkiem-na-twardo'), (SELECT id FROM public.ingredients WHERE name = 'Pieprz czarny (mielony)'), 0.5, 'g', false, 4);

-- Przekąska poranna 5: Twaróg z ogórkiem i koperkiem
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Twaróg z ogórkiem i koperkiem', 'twarog-z-ogorkiem-i-koperkiem', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/twarog-z-ogorkiem-i-koperkiem.webp', array['snack_morning']::public.meal_type_enum[], array['twaróg', 'warzywa', 'białko', 'orzeźwiające'], 5, 0, 'easy', 1, 'porcja', false, NULL, 1);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'twarog-z-ogorkiem-i-koperkiem'), (SELECT id FROM public.ingredients WHERE name = 'Twaróg półtłusty'), 150, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'twarog-z-ogorkiem-i-koperkiem'), (SELECT id FROM public.ingredients WHERE name = 'Ogórek'), 80, 'g', true, 2),
((SELECT id FROM public.recipes WHERE slug = 'twarog-z-ogorkiem-i-koperkiem'), (SELECT id FROM public.ingredients WHERE name = 'Koperek (świeży)'), 5, 'g', false, 3),
((SELECT id FROM public.recipes WHERE slug = 'twarog-z-ogorkiem-i-koperkiem'), (SELECT id FROM public.ingredients WHERE name = 'Sól'), 1, 'g', false, 3);

-- Przekąska poranna 6: Mix orzechów z wiórkami kokosowymi
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Mix orzechów z wiórkami kokosowymi', 'mix-orzechow-z-wiorkami-kokosowymi', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/mix-orzechow-z-wiorkami-kokosowymi.webp', array['snack_morning']::public.meal_type_enum[], array['orzechy', 'kokos', 'zdrowe-tłuszcze', 'gotowe'], 2, 0, 'easy', 3, 'porcja', true, 7, 1);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'mix-orzechow-z-wiorkami-kokosowymi'), (SELECT id FROM public.ingredients WHERE name = 'Migdały'), 20, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'mix-orzechow-z-wiorkami-kokosowymi'), (SELECT id FROM public.ingredients WHERE name = 'Orzechy pekan'), 15, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'mix-orzechow-z-wiorkami-kokosowymi'), (SELECT id FROM public.ingredients WHERE name = 'Orzechy makadamia'), 15, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'mix-orzechow-z-wiorkami-kokosowymi'), (SELECT id FROM public.ingredients WHERE name = 'Wiórki kokosowe'), 10, 'g', true, 1);

-- Przekąska poranna 7: Smoothie z awokado i szpinakiem
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Smoothie z awokado i szpinakiem', 'smoothie-z-awokado-i-szpinakiem', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/smoothie-z-awokado-i-szpinakiem.webp', array['snack_morning']::public.meal_type_enum[], array['smoothie', 'zielone', 'zdrowe-tłuszcze', 'energia'], 5, 0, 'easy', 1, 'szklanka', false, NULL, 1);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'smoothie-z-awokado-i-szpinakiem'), (SELECT id FROM public.ingredients WHERE name = 'Awokado'), 60, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'smoothie-z-awokado-i-szpinakiem'), (SELECT id FROM public.ingredients WHERE name = 'Szpinak (świeży)'), 30, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'smoothie-z-awokado-i-szpinakiem'), (SELECT id FROM public.ingredients WHERE name = 'Mleko kokosowe (puszka)'), 100, 'ml', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'smoothie-z-awokado-i-szpinakiem'), (SELECT id FROM public.ingredients WHERE name = 'Erytrytol'), 5, 'g', false, 1);

-- Przekąska poranna 8: Jajka faszerowane pastą z awokado
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Jajka faszerowane pastą z awokado', 'jajka-faszerowane-pasta-z-awokado', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/jajka-faszerowane-pasta-z-awokado.webp', array['snack_morning']::public.meal_type_enum[], array['jajka', 'awokado', 'białko', 'eleganckie'], 10, 10, 'easy', 4, 'polowka', true, 8, 2);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'jajka-faszerowane-pasta-z-awokado'), (SELECT id FROM public.ingredients WHERE name = 'Jajko kurze (całe)'), 120, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'jajka-faszerowane-pasta-z-awokado'), (SELECT id FROM public.ingredients WHERE name = 'Awokado'), 50, 'g', true, 3),
((SELECT id FROM public.recipes WHERE slug = 'jajka-faszerowane-pasta-z-awokado'), (SELECT id FROM public.ingredients WHERE name = 'Majonez'), 15, 'g', true, 3),
((SELECT id FROM public.recipes WHERE slug = 'jajka-faszerowane-pasta-z-awokado'), (SELECT id FROM public.ingredients WHERE name = 'Cytryna (sok)'), 5, 'ml', false, 3),
((SELECT id FROM public.recipes WHERE slug = 'jajka-faszerowane-pasta-z-awokado'), (SELECT id FROM public.ingredients WHERE name = 'Sól'), 1, 'g', false, 3);

-- Przekąska poranna 9: Kefir z nasionami chia
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Kefir z nasionami chia', 'kefir-z-nasionami-chia', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/kefir-z-nasionami-chia.webp', array['snack_morning']::public.meal_type_enum[], array['kefir', 'chia', 'probiotyk', 'szybkie'], 3, 0, 'easy', 1, 'szklanka', false, NULL, 1);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'kefir-z-nasionami-chia'), (SELECT id FROM public.ingredients WHERE name = 'Kefir naturalny'), 200, 'ml', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'kefir-z-nasionami-chia'), (SELECT id FROM public.ingredients WHERE name = 'Nasiona chia'), 10, 'g', true, 2),
((SELECT id FROM public.recipes WHERE slug = 'kefir-z-nasionami-chia'), (SELECT id FROM public.ingredients WHERE name = 'Erytrytol'), 5, 'g', false, 2);

-- Przekąska poranna 10: Ser camembert z orzechami
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Ser camembert z orzechami', 'ser-camembert-z-orzechami', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/ser-camembert-z-orzechami.webp', array['snack_morning']::public.meal_type_enum[], array['ser', 'orzechy', 'eleganckie', 'tłuszcze'], 3, 0, 'easy', 1, 'porcja', false, NULL, 1);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'ser-camembert-z-orzechami'), (SELECT id FROM public.ingredients WHERE name = 'Ser camembert'), 60, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'ser-camembert-z-orzechami'), (SELECT id FROM public.ingredients WHERE name = 'Orzechy włoskie'), 20, 'g', true, 2),
((SELECT id FROM public.recipes WHERE slug = 'ser-camembert-z-orzechami'), (SELECT id FROM public.ingredients WHERE name = 'Seler naciowy'), 30, 'g', true, 3);

-- =====================================================================
-- PRZEKĄSKI POPOŁUDNIOWE (AFTERNOON SNACKS) - 10 przepisów
-- Sycące przekąski na popołudnie przed kolacją
-- =====================================================================

-- Przekąska popołudniowa 1: Paluszki selerowe z guacamole
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Paluszki selerowe z guacamole', 'paluszki-selerowe-z-guacamole', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/paluszki-selerowe-z-guacamole.webp', array['snack_afternoon']::public.meal_type_enum[], array['warzywa', 'awokado', 'dip', 'orzeźwiające'], 10, 0, 'easy', 2, 'porcja', true, 4, 1);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'paluszki-selerowe-z-guacamole'), (SELECT id FROM public.ingredients WHERE name = 'Seler naciowy'), 100, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'paluszki-selerowe-z-guacamole'), (SELECT id FROM public.ingredients WHERE name = 'Awokado'), 100, 'g', true, 2),
((SELECT id FROM public.recipes WHERE slug = 'paluszki-selerowe-z-guacamole'), (SELECT id FROM public.ingredients WHERE name = 'Cytryna (sok)'), 10, 'ml', false, 2),
((SELECT id FROM public.recipes WHERE slug = 'paluszki-selerowe-z-guacamole'), (SELECT id FROM public.ingredients WHERE name = 'Czosnek'), 3, 'g', false, 2),
((SELECT id FROM public.recipes WHERE slug = 'paluszki-selerowe-z-guacamole'), (SELECT id FROM public.ingredients WHERE name = 'Sól'), 1, 'g', false, 2);

-- Przekąska popołudniowa 2: Ogórek z serkiem śmietankowym
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Ogórek z serkiem śmietankowym', 'ogorek-z-serkiem-smietankowym', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/ogorek-z-serkiem-smietankowym.webp', array['snack_afternoon']::public.meal_type_enum[], array['ogórek', 'ser', 'szybkie', 'niskokaloryczne'], 5, 0, 'easy', 1, 'porcja', false, NULL, 1);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'ogorek-z-serkiem-smietankowym'), (SELECT id FROM public.ingredients WHERE name = 'Ogórek'), 150, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'ogorek-z-serkiem-smietankowym'), (SELECT id FROM public.ingredients WHERE name = 'Serek wiejski'), 80, 'g', true, 2),
((SELECT id FROM public.recipes WHERE slug = 'ogorek-z-serkiem-smietankowym'), (SELECT id FROM public.ingredients WHERE name = 'Koperek (świeży)'), 5, 'g', false, 3);

-- Przekąska popołudniowa 3: Oliwki z fetą i papryką
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Oliwki z fetą i papryką', 'oliwki-z-feta-i-papryka', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/oliwki-z-feta-i-papryka.webp', array['snack_afternoon']::public.meal_type_enum[], array['oliwki', 'feta', 'śródziemnomorskie', 'gotowe'], 5, 0, 'easy', 1, 'porcja', false, NULL, 1);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'oliwki-z-feta-i-papryka'), (SELECT id FROM public.ingredients WHERE name = 'Oliwki czarne'), 50, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'oliwki-z-feta-i-papryka'), (SELECT id FROM public.ingredients WHERE name = 'Ser feta'), 50, 'g', true, 2),
((SELECT id FROM public.recipes WHERE slug = 'oliwki-z-feta-i-papryka'), (SELECT id FROM public.ingredients WHERE name = 'Papryka czerwona'), 50, 'g', true, 3),
((SELECT id FROM public.recipes WHERE slug = 'oliwki-z-feta-i-papryka'), (SELECT id FROM public.ingredients WHERE name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 4);

-- Przekąska popołudniowa 4: Łosoś wędzony na liściach sałaty
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Łosoś wędzony na liściach sałaty', 'losos-wedzony-na-liscach-salaty', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/losos-wedzony-na-liscach-salaty.webp', array['snack_afternoon']::public.meal_type_enum[], array['łosoś', 'sałata', 'omega3', 'eleganckie'], 5, 0, 'easy', 1, 'porcja', false, NULL, 1);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'losos-wedzony-na-liscach-salaty'), (SELECT id FROM public.ingredients WHERE name = 'Łosoś wędzony'), 60, 'g', true, 2),
((SELECT id FROM public.recipes WHERE slug = 'losos-wedzony-na-liscach-salaty'), (SELECT id FROM public.ingredients WHERE name = 'Sałata masłowa'), 40, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'losos-wedzony-na-liscach-salaty'), (SELECT id FROM public.ingredients WHERE name = 'Serek wiejski'), 30, 'g', true, 3),
((SELECT id FROM public.recipes WHERE slug = 'losos-wedzony-na-liscach-salaty'), (SELECT id FROM public.ingredients WHERE name = 'Cytryna (sok)'), 5, 'ml', false, 4);

-- Przekąska popołudniowa 5: Papryka faszerowana twarogiem
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Papryka faszerowana twarogiem', 'papryka-faszerowana-twarogiem', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/papryka-faszerowana-twarogiem.webp', array['snack_afternoon']::public.meal_type_enum[], array['papryka', 'twaróg', 'warzywa', 'kolorowe'], 10, 0, 'easy', 4, 'polowka', true, 8, 2);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'papryka-faszerowana-twarogiem'), (SELECT id FROM public.ingredients WHERE name = 'Papryka czerwona'), 100, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'papryka-faszerowana-twarogiem'), (SELECT id FROM public.ingredients WHERE name = 'Twaróg półtłusty'), 100, 'g', true, 2),
((SELECT id FROM public.recipes WHERE slug = 'papryka-faszerowana-twarogiem'), (SELECT id FROM public.ingredients WHERE name = 'Szczypiorek'), 5, 'g', false, 2),
((SELECT id FROM public.recipes WHERE slug = 'papryka-faszerowana-twarogiem'), (SELECT id FROM public.ingredients WHERE name = 'Sól'), 1, 'g', false, 2),
((SELECT id FROM public.recipes WHERE slug = 'papryka-faszerowana-twarogiem'), (SELECT id FROM public.ingredients WHERE name = 'Pieprz czarny (mielony)'), 0.5, 'g', false, 2);

-- Przekąska popołudniowa 6: Kabanosy z ogórkiem
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Kabanosy z ogórkiem', 'kabanosy-z-ogorkiem', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/kabanosy-z-ogorkiem.webp', array['snack_afternoon']::public.meal_type_enum[], array['kabanosy', 'ogórek', 'białko', 'szybkie'], 2, 0, 'easy', 1, 'porcja', false, NULL, 1);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'kabanosy-z-ogorkiem'), (SELECT id FROM public.ingredients WHERE name = 'Kabanos'), 50, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'kabanosy-z-ogorkiem'), (SELECT id FROM public.ingredients WHERE name = 'Ogórek'), 100, 'g', true, 2);

-- Przekąska popołudniowa 7: Chipsy z cukinii (pieczone)
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Chipsy z cukinii pieczone', 'chipsy-z-cukinii-pieczone', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/chipsy-z-cukinii-pieczone.webp', array['snack_afternoon']::public.meal_type_enum[], array['cukinia', 'piekarnik', 'chrupiące', 'zdrowe'], 10, 25, 'easy', 4, 'porcja', true, 4, 2);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'chipsy-z-cukinii-pieczone'), (SELECT id FROM public.ingredients WHERE name = 'Cukinia'), 200, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'chipsy-z-cukinii-pieczone'), (SELECT id FROM public.ingredients WHERE name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 2),
((SELECT id FROM public.recipes WHERE slug = 'chipsy-z-cukinii-pieczone'), (SELECT id FROM public.ingredients WHERE name = 'Sól'), 1, 'g', false, 2),
((SELECT id FROM public.recipes WHERE slug = 'chipsy-z-cukinii-pieczone'), (SELECT id FROM public.ingredients WHERE name = 'Papryka słodka (mielona)'), 2, 'g', false, 2);

-- Przekąska popołudniowa 8: Sardynki z oliwkami
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Sardynki z oliwkami', 'sardynki-z-oliwkami', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/sardynki-z-oliwkami.webp', array['snack_afternoon']::public.meal_type_enum[], array['ryba', 'omega3', 'gotowe', 'śródziemnomorskie'], 3, 0, 'easy', 1, 'porcja', false, NULL, 1);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'sardynki-z-oliwkami'), (SELECT id FROM public.ingredients WHERE name = 'Sardynki (w oleju)'), 80, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'sardynki-z-oliwkami'), (SELECT id FROM public.ingredients WHERE name = 'Oliwki zielone'), 30, 'g', true, 2),
((SELECT id FROM public.recipes WHERE slug = 'sardynki-z-oliwkami'), (SELECT id FROM public.ingredients WHERE name = 'Cytryna (sok)'), 5, 'ml', false, 3);

-- Przekąska popołudniowa 9: Mousse z awokado i kakao
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Mousse z awokado i kakao', 'mousse-z-awokado-i-kakao', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/mousse-z-awokado-i-kakao.webp', array['snack_afternoon']::public.meal_type_enum[], array['awokado', 'kakao', 'deser', 'czekoladowe'], 10, 0, 'easy', 2, 'porcja', true, 4, 1);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'mousse-z-awokado-i-kakao'), (SELECT id FROM public.ingredients WHERE name = 'Awokado'), 100, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'mousse-z-awokado-i-kakao'), (SELECT id FROM public.ingredients WHERE name = 'Kakao naturalne'), 15, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'mousse-z-awokado-i-kakao'), (SELECT id FROM public.ingredients WHERE name = 'Mleko kokosowe (puszka)'), 50, 'ml', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'mousse-z-awokado-i-kakao'), (SELECT id FROM public.ingredients WHERE name = 'Erytrytol'), 15, 'g', false, 1);

-- Przekąska popołudniowa 10: Ser gouda z rzodkiewką
INSERT INTO public.recipes (name, slug, image_url, meal_types, tags, prep_time_min, cook_time_min, difficulty_level, base_servings, serving_unit, is_batch_friendly, suggested_batch_size, min_servings) VALUES
('Ser gouda z rzodkiewką', 'ser-gouda-z-rzodkiewka', 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe/ser-gouda-z-rzodkiewka.webp', array['snack_afternoon']::public.meal_type_enum[], array['ser', 'rzodkiewka', 'prosty', 'chrupiące'], 5, 0, 'easy', 1, 'porcja', false, NULL, 1);

INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) VALUES
((SELECT id FROM public.recipes WHERE slug = 'ser-gouda-z-rzodkiewka'), (SELECT id FROM public.ingredients WHERE name = 'Ser gouda'), 60, 'g', true, 1),
((SELECT id FROM public.recipes WHERE slug = 'ser-gouda-z-rzodkiewka'), (SELECT id FROM public.ingredients WHERE name = 'Rzodkiewka'), 80, 'g', true, 2),
((SELECT id FROM public.recipes WHERE slug = 'ser-gouda-z-rzodkiewka'), (SELECT id FROM public.ingredients WHERE name = 'Masło'), 10, 'g', true, 3);

-- =====================================================================
-- RECIPE EQUIPMENT dla przekąsek
-- =====================================================================

-- Kulki energetyczne: Blender
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kulki-energetyczne-z-orzechami'),
  (SELECT id FROM public.equipment WHERE name = 'Blender'), 1, 'do rozdrobnienia orzechów';

-- Jogurt z malinami: Miska
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jogurt-grecki-z-malinami'),
  (SELECT id FROM public.equipment WHERE name = 'Miska'), 1, NULL;

-- Awokado z jajkiem: Garnek
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'awokado-z-jajkiem-na-twardo'),
  (SELECT id FROM public.equipment WHERE name = 'Garnek'), 1, 'do gotowania jajek';

-- Twaróg z ogórkiem: Miska
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'twarog-z-ogorkiem-i-koperkiem'),
  (SELECT id FROM public.equipment WHERE name = 'Miska'), 1, NULL;

-- Smoothie: Blender
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'smoothie-z-awokado-i-szpinakiem'),
  (SELECT id FROM public.equipment WHERE name = 'Blender'), 1, NULL;

-- Jajka faszerowane: Garnek + Miska
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jajka-faszerowane-pasta-z-awokado'),
  (SELECT id FROM public.equipment WHERE name = 'Garnek'), 1, 'do gotowania jajek';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jajka-faszerowane-pasta-z-awokado'),
  (SELECT id FROM public.equipment WHERE name = 'Miska'), 1, 'do mieszania pasty';

-- Guacamole: Miska
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'paluszki-selerowe-z-guacamole'),
  (SELECT id FROM public.equipment WHERE name = 'Miska'), 1, 'do przygotowania guacamole';

-- Chipsy z cukinii: Piekarnik + Blacha
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chipsy-z-cukinii-pieczone'),
  (SELECT id FROM public.equipment WHERE name = 'Piekarnik'), 1, '180°C';
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chipsy-z-cukinii-pieczone'),
  (SELECT id FROM public.equipment WHERE name = 'Blacha do pieczenia'), 1, 'wyłożona papierem';

-- Mousse: Blender
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT (SELECT id FROM public.recipes WHERE slug = 'mousse-z-awokado-i-kakao'),
  (SELECT id FROM public.equipment WHERE name = 'Blender'), 1, 'do zmiksowania mousse';

-- =====================================================================
-- RECIPE INSTRUCTIONS dla przekąsek
-- =====================================================================

-- Kulki energetyczne z orzechami
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kulki-energetyczne-z-orzechami'), 1,
  'Zmiel orzechy w blenderze na drobną mączkę.', 3, 0, 'active', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kulki-energetyczne-z-orzechami'), 2,
  'Dodaj rozpuszczone masło, wiórki kokosowe i erytrytol. Wymieszaj.', 2, 0, 'active', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kulki-energetyczne-z-orzechami'), 3,
  'Formuj małe kulki i schłódź w lodówce 30 min.', 5, 30, 'passive', false, 'constant';

-- Jogurt grecki z malinami
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jogurt-grecki-z-malinami'), 1,
  'Przełóż jogurt do miseczki.', 1, 0, 'prep', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jogurt-grecki-z-malinami'), 2,
  'Dodaj świeże maliny i posyp nasionami chia.', 2, 0, 'assembly', false, 'linear';

-- Rolada z szynki z serkiem
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'rolada-z-szynki-z-serkiem'), 1,
  'Rozłóż plasterki szynki na blacie.', 1, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'rolada-z-szynki-z-serkiem'), 2,
  'Posmaruj serkiem wiejskim, posyp szczypiorkiem i pieprzem.', 2, 0, 'active', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'rolada-z-szynki-z-serkiem'), 3,
  'Zwiń w roladki i podawaj.', 2, 0, 'assembly', false, 'linear';

-- Awokado z jajkiem na twardo
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'awokado-z-jajkiem-na-twardo'), 1,
  'Ugotuj jajko na twardo (10 min). Ostudź i obierz.', 2, 10, 'passive', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'awokado-z-jajkiem-na-twardo'), 2,
  'Pokrój awokado i jajko w plasterki.', 2, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'awokado-z-jajkiem-na-twardo'), 3,
  'Ułóż na talerzu, dopraw solą i pieprzem.', 1, 0, 'assembly', false, 'constant';

-- Twaróg z ogórkiem i koperkiem
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'twarog-z-ogorkiem-i-koperkiem'), 1,
  'Pokrój ogórek w drobną kostkę.', 2, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'twarog-z-ogorkiem-i-koperkiem'), 2,
  'Wymieszaj twaróg z ogórkiem, koperkiem i solą.', 2, 0, 'active', false, 'linear';

-- Mix orzechów z wiórkami
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'mix-orzechow-z-wiorkami-kokosowymi'), 1,
  'Wymieszaj wszystkie orzechy z wiórkami kokosowymi w miseczce.', 2, 0, 'assembly', false, 'constant';

-- Smoothie z awokado i szpinakiem
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'smoothie-z-awokado-i-szpinakiem'), 1,
  'Wrzuć wszystkie składniki do blendera.', 1, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'smoothie-z-awokado-i-szpinakiem'), 2,
  'Zmiksuj na gładką masę. Przelej do szklanki.', 3, 0, 'active', false, 'constant';

-- Jajka faszerowane pastą z awokado
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jajka-faszerowane-pasta-z-awokado'), 1,
  'Ugotuj jajka na twardo (10 min). Ostudź i obierz.', 2, 10, 'passive', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jajka-faszerowane-pasta-z-awokado'), 2,
  'Przekrój jajka na pół, wyjmij żółtka.', 2, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jajka-faszerowane-pasta-z-awokado'), 3,
  'Rozgnieć żółtka z awokado, majonezem i sokiem z cytryny.', 3, 0, 'active', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'jajka-faszerowane-pasta-z-awokado'), 4,
  'Nałóż pastę na połówki jajek.', 2, 0, 'assembly', false, 'linear';

-- Kefir z nasionami chia
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kefir-z-nasionami-chia'), 1,
  'Wlej kefir do szklanki.', 1, 0, 'prep', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kefir-z-nasionami-chia'), 2,
  'Dodaj nasiona chia i erytrytol, wymieszaj.', 2, 0, 'active', false, 'constant';

-- Ser camembert z orzechami
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'ser-camembert-z-orzechami'), 1,
  'Pokrój camembert w kawałki.', 1, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'ser-camembert-z-orzechami'), 2,
  'Ułóż na talerzu z orzechami i łodygami selera.', 2, 0, 'assembly', false, 'constant';

-- Paluszki selerowe z guacamole
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'paluszki-selerowe-z-guacamole'), 1,
  'Pokrój seler naciowy w paluszki.', 2, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'paluszki-selerowe-z-guacamole'), 2,
  'Rozgnieć awokado, dodaj sok z cytryny, czosnek i sól.', 5, 0, 'active', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'paluszki-selerowe-z-guacamole'), 3,
  'Podawaj paluszki selerowe z guacamole.', 1, 0, 'assembly', false, 'constant';

-- Ogórek z serkiem śmietankowym
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'ogorek-z-serkiem-smietankowym'), 1,
  'Pokrój ogórek w grube plastry.', 2, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'ogorek-z-serkiem-smietankowym'), 2,
  'Nałóż serek wiejski na każdy plasterek, posyp koperkiem.', 3, 0, 'assembly', false, 'linear';

-- Oliwki z fetą i papryką
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'oliwki-z-feta-i-papryka'), 1,
  'Pokrój fetę i paprykę w kostkę.', 3, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'oliwki-z-feta-i-papryka'), 2,
  'Wymieszaj z oliwkami i skrop oliwą.', 2, 0, 'assembly', false, 'constant';

-- Łosoś wędzony na liściach sałaty
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'losos-wedzony-na-liscach-salaty'), 1,
  'Rozłóż liście sałaty na talerzu.', 1, 0, 'prep', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'losos-wedzony-na-liscach-salaty'), 2,
  'Ułóż plasterki łososia, dodaj serek i skrop cytryną.', 3, 0, 'assembly', false, 'linear';

-- Papryka faszerowana twarogiem
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'papryka-faszerowana-twarogiem'), 1,
  'Przekrój paprykę na pół, usuń nasiona.', 2, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'papryka-faszerowana-twarogiem'), 2,
  'Wymieszaj twaróg ze szczypiorkiem, solą i pieprzem.', 2, 0, 'active', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'papryka-faszerowana-twarogiem'), 3,
  'Nałóż farsz na połówki papryki.', 2, 0, 'assembly', false, 'linear';

-- Kabanosy z ogórkiem
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kabanosy-z-ogorkiem'), 1,
  'Pokrój kabanosy i ogórek w plastry.', 2, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'kabanosy-z-ogorkiem'), 2,
  'Ułóż na talerzu i podawaj.', 1, 0, 'assembly', false, 'constant';

-- Chipsy z cukinii pieczone
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chipsy-z-cukinii-pieczone'), 1,
  'Rozgrzej piekarnik do 180°C. Pokrój cukinię w cienkie plastry.', 5, 5, 'prep', true, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chipsy-z-cukinii-pieczone'), 2,
  'Skrop oliwą, posyp solą i papryką. Ułóż na blasze.', 3, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'chipsy-z-cukinii-pieczone'), 3,
  'Piecz 20-25 min, aż będą chrupiące.', 0, 25, 'passive', false, 'constant';

-- Sardynki z oliwkami
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'sardynki-z-oliwkami'), 1,
  'Odcedź sardynki z oleju.', 1, 0, 'prep', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'sardynki-z-oliwkami'), 2,
  'Ułóż na talerzu z oliwkami, skrop sokiem z cytryny.', 2, 0, 'assembly', false, 'constant';

-- Mousse z awokado i kakao
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'mousse-z-awokado-i-kakao'), 1,
  'Wrzuć wszystkie składniki do blendera.', 1, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'mousse-z-awokado-i-kakao'), 2,
  'Zmiksuj na gładki mus.', 3, 0, 'active', false, 'constant';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'mousse-z-awokado-i-kakao'), 3,
  'Schłódź w lodówce 15 min przed podaniem.', 1, 15, 'passive', false, 'constant';

-- Ser gouda z rzodkiewką
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'ser-gouda-z-rzodkiewka'), 1,
  'Pokrój ser gouda w kostki, rzodkiewkę w plasterki.', 3, 0, 'prep', false, 'linear';
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, time_scaling_type)
SELECT (SELECT id FROM public.recipes WHERE slug = 'ser-gouda-z-rzodkiewka'), 2,
  'Ułóż na talerzu z masłem.', 2, 0, 'assembly', false, 'constant';

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

SELECT 'Total recipes:' as info, count(*)::text as count FROM public.recipes;
SELECT 'Breakfasts:' as info, count(*)::text as count FROM public.recipes WHERE 'breakfast' = ANY(meal_types);
SELECT 'Lunches:' as info, count(*)::text as count FROM public.recipes WHERE 'lunch' = ANY(meal_types);
SELECT 'Dinners:' as info, count(*)::text as count FROM public.recipes WHERE 'dinner' = ANY(meal_types);
SELECT 'Morning snacks:' as info, count(*)::text as count FROM public.recipes WHERE 'snack_morning' = ANY(meal_types);
SELECT 'Afternoon snacks:' as info, count(*)::text as count FROM public.recipes WHERE 'snack_afternoon' = ANY(meal_types);
SELECT 'Recipe ingredients:' as info, count(*)::text as count FROM public.recipe_ingredients;
SELECT 'Recipe equipment:' as info, count(*)::text as count FROM public.recipe_equipment;
SELECT 'Recipe instructions:' as info, count(*)::text as count FROM public.recipe_instructions;
SELECT 'Recipe components:' as info, count(*)::text as count FROM public.recipe_components;
SELECT 'Recipes with instructions:' as info, count(DISTINCT recipe_id)::text as count FROM public.recipe_instructions;

-- Verify denormalized nutrition (should be auto-calculated by trigger)
SELECT name, total_calories, total_protein_g, total_carbs_g, total_fats_g
FROM public.recipes
WHERE total_calories IS NOT NULL
ORDER BY name
LIMIT 10;

-- Verify recipe components (Meal Prep v2.0 - rekurencyjne przepisy)
SELECT
  p.name AS parent_recipe,
  c.name AS component_recipe,
  rc.required_amount,
  rc.unit
FROM public.recipe_components rc
JOIN public.recipes p ON p.id = rc.parent_recipe_id
JOIN public.recipes c ON c.id = rc.component_recipe_id;

-- =====================================================================
-- SEED DATA COMPLETE
-- =====================================================================
-- Total: 52 recipes (12 breakfasts, 10 lunches, 10 dinners, 10 morning snacks, 10 afternoon snacks)
-- Includes 1 component recipe (Chleb keto) used by other recipes
-- All ingredients verified against seed_ingredients_complete.sql
-- Denormalized nutrition values calculated automatically by triggers
--
-- Meal Prep v2.0 data included:
--   - Recipe equipment assignments (60+ assignments)
--   - Recipe instructions (3-5 steps per recipe, 150+ total)
--   - Recipe components (rekurencyjne przepisy - np. chleb keto → tosty)
--   - Timing data (active_minutes, passive_minutes)
--   - Action types (prep, active, passive, assembly)
--   - Sensory cues and checkpoints
--
-- Full seed execution: seed_ingredients_complete.sql → seed_recipes_public.sql
-- =====================================================================
