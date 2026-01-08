-- =====================================================================
-- Seed Data for LowCarbPlaner - RECIPES V2.0 UPDATE
-- Description: Aktualizacja przepisów o czasy przygotowania i gotowania,
--              przypisania sprzętu kuchennego (equipment)
-- =====================================================================
-- IMPORTANT: Run after main seed files and equipment migration!
-- Prerequisites:
--   - seed_recipes_public.sql (or seed_recipes.sql for content schema)
--   - 20251223120000_add_equipment_tables.sql
-- =====================================================================
-- NOTE: This script UPDATES existing recipes in public schema
--       Recipes already have Supabase Storage image URLs
-- =====================================================================

-- =====================================================================
-- 1. AKTUALIZACJA CZASÓW PRZYGOTOWANIA I GOTOWANIA
-- =====================================================================

-- ŚNIADANIA (BREAKFASTS)
UPDATE public.recipes SET prep_time_min = 5, cook_time_min = 10, difficulty_level = 'easy'
WHERE slug = 'omlet-ze-szpinakiem-i-serem-feta';

UPDATE public.recipes SET prep_time_min = 5, cook_time_min = 10, difficulty_level = 'easy'
WHERE slug = 'jajecznica-z-lososiem-wedzonym-i-awokado';

UPDATE public.recipes SET prep_time_min = 10, cook_time_min = 20, difficulty_level = 'medium'
WHERE slug = 'shakshuka-z-pomidorami-i-papryka';

UPDATE public.recipes SET prep_time_min = 5, cook_time_min = 0, difficulty_level = 'easy'
WHERE slug = 'jogurt-grecki-z-orzechami-i-jagodami';

UPDATE public.recipes SET prep_time_min = 15, cook_time_min = 15, difficulty_level = 'medium'
WHERE slug = 'placki-z-cukinii-z-serkiem-wiejskim';

UPDATE public.recipes SET prep_time_min = 10, cook_time_min = 20, difficulty_level = 'medium'
WHERE slug = 'frittata-z-brokulami-i-serem-cheddar';

UPDATE public.recipes SET prep_time_min = 5, cook_time_min = 0, difficulty_level = 'easy'
WHERE slug = 'chia-pudding-kokosowy-z-borowkami';

UPDATE public.recipes SET prep_time_min = 5, cook_time_min = 0, difficulty_level = 'easy'
WHERE slug = 'twarog-z-orzechami-laskowymi-i-cynamonem';

UPDATE public.recipes SET prep_time_min = 5, cook_time_min = 10, difficulty_level = 'easy'
WHERE slug = 'jajka-sadzone-z-boczkiem-i-awokado';

UPDATE public.recipes SET prep_time_min = 5, cook_time_min = 0, difficulty_level = 'easy'
WHERE slug = 'smoothie-bowl-z-awokado-i-szpinakiem';

-- Already has prep/cook times from manual entry
-- UPDATE public.recipes SET prep_time_min = 5, cook_time_min = 15, difficulty_level = 'easy'
-- WHERE slug = 'zapiekane-awokado-z-jajkiem-i-boczkiem';

-- OBIADY (LUNCHES)
UPDATE public.recipes SET prep_time_min = 10, cook_time_min = 20, difficulty_level = 'medium'
WHERE slug = 'grillowana-piers-z-kurczaka-z-brokulami';

UPDATE public.recipes SET prep_time_min = 10, cook_time_min = 15, difficulty_level = 'medium'
WHERE slug = 'filet-z-lososia-z-szparagami';

UPDATE public.recipes SET prep_time_min = 10, cook_time_min = 15, difficulty_level = 'medium'
WHERE slug = 'stek-wolowy-z-salatka-z-rukoli';

UPDATE public.recipes SET prep_time_min = 15, cook_time_min = 25, difficulty_level = 'medium'
WHERE slug = 'kurczak-curry-z-mlekiem-kokosowym';

UPDATE public.recipes SET prep_time_min = 10, cook_time_min = 20, difficulty_level = 'easy'
WHERE slug = 'dorsz-pieczony-z-warzywami';

UPDATE public.recipes SET prep_time_min = 15, cook_time_min = 20, difficulty_level = 'medium'
WHERE slug = 'kotlety-z-indyka-z-puree-z-kalafiora';

UPDATE public.recipes SET prep_time_min = 10, cook_time_min = 10, difficulty_level = 'easy'
WHERE slug = 'salatka-z-tunczyka-i-jajkiem';

UPDATE public.recipes SET prep_time_min = 10, cook_time_min = 40, difficulty_level = 'easy'
WHERE slug = 'udka-z-kurczaka-pieczone-z-ziolami';

UPDATE public.recipes SET prep_time_min = 10, cook_time_min = 8, difficulty_level = 'easy'
WHERE slug = 'krewetki-w-czosnku-z-cukinia';

UPDATE public.recipes SET prep_time_min = 10, cook_time_min = 20, difficulty_level = 'medium'
WHERE slug = 'schab-wieprzowy-z-kapusta';

-- KOLACJE (DINNERS)
UPDATE public.recipes SET prep_time_min = 10, cook_time_min = 15, difficulty_level = 'easy'
WHERE slug = 'pieczony-losos-z-salsa-z-awokado';

UPDATE public.recipes SET prep_time_min = 10, cook_time_min = 20, difficulty_level = 'medium'
WHERE slug = 'piers-z-indyka-w-sosie-grzybowym';

UPDATE public.recipes SET prep_time_min = 15, cook_time_min = 10, difficulty_level = 'medium'
WHERE slug = 'stek-z-poledwicy-z-maslem-ziolowym';

UPDATE public.recipes SET prep_time_min = 15, cook_time_min = 50, difficulty_level = 'medium'
WHERE slug = 'kurczak-pieczony-z-cytryna';

UPDATE public.recipes SET prep_time_min = 15, cook_time_min = 15, difficulty_level = 'medium'
WHERE slug = 'dorsz-z-pesto-bazyliowym';

UPDATE public.recipes SET prep_time_min = 10, cook_time_min = 15, difficulty_level = 'medium'
WHERE slug = 'kotlety-z-baraniny-z-sosem-mietowym';

UPDATE public.recipes SET prep_time_min = 5, cook_time_min = 10, difficulty_level = 'easy'
WHERE slug = 'krewetki-w-masle-czosnkowym';

UPDATE public.recipes SET prep_time_min = 20, cook_time_min = 90, difficulty_level = 'hard'
WHERE slug = 'gulasz-wieprzowy-po-wegiersku';

UPDATE public.recipes SET prep_time_min = 15, cook_time_min = 12, difficulty_level = 'medium'
WHERE slug = 'losos-teriyaki-z-bok-choy';

UPDATE public.recipes SET prep_time_min = 15, cook_time_min = 10, difficulty_level = 'easy'
WHERE slug = 'salatka-cezar-z-kurczakiem';

-- SNACKI
UPDATE public.recipes SET prep_time_min = 5, cook_time_min = 0, difficulty_level = 'easy'
WHERE slug = 'twarog-z-truskawkami-i-stewia';

UPDATE public.recipes SET prep_time_min = 3, cook_time_min = 0, difficulty_level = 'easy'
WHERE slug = 'jogurt-grecki-z-orzechami-wloskimi';

UPDATE public.recipes SET prep_time_min = 3, cook_time_min = 0, difficulty_level = 'easy'
WHERE slug = 'ser-camembert-z-migdalami';

UPDATE public.recipes SET prep_time_min = 5, cook_time_min = 10, difficulty_level = 'easy'
WHERE slug = 'jajka-na-twardo-z-majonezem';

UPDATE public.recipes SET prep_time_min = 3, cook_time_min = 0, difficulty_level = 'easy'
WHERE slug = 'seler-naciowy-z-maslem-orzechowym';

UPDATE public.recipes SET prep_time_min = 5, cook_time_min = 0, difficulty_level = 'easy'
WHERE slug = 'oliwki-z-kostkami-fety';

UPDATE public.recipes SET prep_time_min = 5, cook_time_min = 0, difficulty_level = 'easy'
WHERE slug = 'rollsy-z-szynki-z-serkiem-smietankowym';

UPDATE public.recipes SET prep_time_min = 2, cook_time_min = 0, difficulty_level = 'easy'
WHERE slug = 'keto-mix-orzechow';

UPDATE public.recipes SET prep_time_min = 5, cook_time_min = 0, difficulty_level = 'easy'
WHERE slug = 'plastry-ogorka-z-serkiem';

UPDATE public.recipes SET prep_time_min = 10, cook_time_min = 0, difficulty_level = 'easy'
WHERE slug = 'papryka-z-guacamole';

-- =====================================================================
-- 2. SZCZEGÓŁOWE INSTRUKCJE PRZEPISÓW (RECIPE_INSTRUCTIONS)
-- =====================================================================
-- Kluczowe dla funkcji Timeline w Meal Prep v2.0!
-- Każdy krok zawiera: active_minutes, passive_minutes, action_type
-- =====================================================================

-- Usunięcie istniejących instrukcji (jeśli są)
DELETE FROM public.recipe_instructions;

-- ŚNIADANIA - Instructions

-- Omlet ze szpinakiem i fetą (5 min prep, 10 min cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Rozbij jajka do miski i ubij widelcem. Dodaj szczyptę soli i pieprzu.', 2, 0, 'prep', false, '{}'
FROM public.recipes r WHERE r.slug = 'omlet-ze-szpinakiem-i-serem-feta';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Rozgrzej oliwę na patelni na średnim ogniu.', 1, 1, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'omlet-ze-szpinakiem-i-serem-feta';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 3, 'Dodaj szpinak i smaż przez 2 minuty aż się zmniejszy.', 2, 0, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'omlet-ze-szpinakiem-i-serem-feta';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 4, 'Wlej jajka na patelnię. Gdy brzegi zaczną tężeć, posyp pokruszonym serem feta.', 3, 0, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'omlet-ze-szpinakiem-i-serem-feta';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 5, 'Złóż omlet na pół i smaż jeszcze 1-2 minuty.', 2, 0, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'omlet-ze-szpinakiem-i-serem-feta';

-- Jajecznica z łososiem wędzonym (5 min prep, 10 min cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Roztrzep jajka z odrobiną śmietany 18%.', 2, 0, 'prep', false, '{}'
FROM public.recipes r WHERE r.slug = 'jajecznica-z-lososiem-wedzonym-i-awokado';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Rozgrzej masło na patelni i wlej jajka.', 1, 0, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'jajecznica-z-lososiem-wedzonym-i-awokado';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 3, 'Smaż mieszając delikatnie aż jajka będą kremowe.', 5, 0, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'jajecznica-z-lososiem-wedzonym-i-awokado';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 4, 'Pokrój awokado. Podawaj jajecznicę z plasterkami łososia wędzonego i awokado.', 2, 0, 'assembly', false, '{}'
FROM public.recipes r WHERE r.slug = 'jajecznica-z-lososiem-wedzonym-i-awokado';

-- Shakshuka z pomidorami i papryką (10 min prep, 20 min cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Pokrój cebulę i paprykę. Podsmaż na oliwie.', 5, 3, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'shakshuka-z-pomidorami-i-papryka';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Dodaj pomidory z puszki, czosnek, kumin i paprykę ostrą.', 2, 0, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'shakshuka-z-pomidorami-i-papryka';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 3, 'Duś 10 minut aż sos zgęstnieje.', 2, 8, 'passive', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'shakshuka-z-pomidorami-i-papryka';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 4, 'Zrób dołki w sosie i wbij jajka.', 2, 0, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'shakshuka-z-pomidorami-i-papryka';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids, checkpoint_type, checkpoint_condition)
SELECT r.id, 5, 'Przykryj i duś 5-7 minut aż białka się zetną. Posyp kolendrą.', 1, 6, 'passive', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')], 'visual', 'Białka zetknięte, żółtka płynne'
FROM public.recipes r WHERE r.slug = 'shakshuka-z-pomidorami-i-papryka';

-- Jogurt grecki z orzechami i jagodami (5 min prep, 0 cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Przełóż jogurt grecki do miski.', 1, 0, 'prep', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Miska')]
FROM public.recipes r WHERE r.slug = 'jogurt-grecki-z-orzechami-i-jagodami';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Posiekaj orzechy włoskie, migdały i orzechy pekan.', 2, 0, 'prep', false, '{}'
FROM public.recipes r WHERE r.slug = 'jogurt-grecki-z-orzechami-i-jagodami';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 3, 'Dodaj świeże jagody i jeżyny.', 1, 0, 'assembly', false, '{}'
FROM public.recipes r WHERE r.slug = 'jogurt-grecki-z-orzechami-i-jagodami';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 4, 'Posyp nasionami chia i lnu.', 1, 0, 'assembly', false, '{}'
FROM public.recipes r WHERE r.slug = 'jogurt-grecki-z-orzechami-i-jagodami';

-- Placki z cukinii z serkiem wiejskim (15 min prep, 15 min cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Zetrzyj cukinię i odciśnij nadmiar wody.', 5, 0, 'prep', false, '{}'
FROM public.recipes r WHERE r.slug = 'placki-z-cukinii-z-serkiem-wiejskim';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Wymieszaj z jajkiem, mąką kokosową, czosnkiem i przyprawami.', 3, 0, 'prep', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Miska')]
FROM public.recipes r WHERE r.slug = 'placki-z-cukinii-z-serkiem-wiejskim';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 3, 'Formuj placki i smaż na oliwie z obu stron do zrumienienia.', 5, 10, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'placki-z-cukinii-z-serkiem-wiejskim';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 4, 'Podawaj z serkiem wiejskim i szczypiorkiem.', 2, 0, 'assembly', false, '{}'
FROM public.recipes r WHERE r.slug = 'placki-z-cukinii-z-serkiem-wiejskim';

-- Frittata z brokułami i serem cheddar (10 min prep, 20 min cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Blanszuj brokuły i pokrój na różyczki.', 3, 3, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Garnek')]
FROM public.recipes r WHERE r.slug = 'frittata-z-brokulami-i-serem-cheddar';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Roztrzep jajka z solą i pieprzem.', 2, 0, 'prep', false, '{}'
FROM public.recipes r WHERE r.slug = 'frittata-z-brokulami-i-serem-cheddar';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 3, 'Na patelni żaroodpornej zeszklij cebulę, dodaj brokuły.', 3, 0, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'frittata-z-brokulami-i-serem-cheddar';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 4, 'Wlej jajka, posyp tartym cheddarem.', 2, 0, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'frittata-z-brokulami-i-serem-cheddar';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids, required_temperature_celsius)
SELECT r.id, 5, 'Wstaw do piekarnika na 15 minut (180°C).', 1, 15, 'passive', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Piekarnik')], 180
FROM public.recipes r WHERE r.slug = 'frittata-z-brokulami-i-serem-cheddar';

-- Smoothie bowl z awokado i szpinakiem (5 min prep, 0 cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Zmiksuj awokado, szpinak, mleko migdałowe i truskawki.', 3, 0, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Blender')]
FROM public.recipes r WHERE r.slug = 'smoothie-bowl-z-awokado-i-szpinakiem';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Przelej do miski.', 1, 0, 'assembly', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Miska')]
FROM public.recipes r WHERE r.slug = 'smoothie-bowl-z-awokado-i-szpinakiem';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 3, 'Udekoruj malinami, nasionami chia i posiekanymi migdałami.', 2, 0, 'assembly', false, '{}'
FROM public.recipes r WHERE r.slug = 'smoothie-bowl-z-awokado-i-szpinakiem';

-- Jajka sadzone z boczkiem i awokado (5 min prep, 10 min cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Usmaż boczek na chrupko i odłóż.', 1, 5, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'jajka-sadzone-z-boczkiem-i-awokado';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Na tej samej patelni usmaż jajka sadzone.', 1, 3, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'jajka-sadzone-z-boczkiem-i-awokado';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 3, 'Pokrój awokado w plasterki.', 2, 0, 'prep', true, '{}'
FROM public.recipes r WHERE r.slug = 'jajka-sadzone-z-boczkiem-i-awokado';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 4, 'Ułóż na talerzu: awokado, jajka, boczek. Posyp pieprzem i szczypiorkiem.', 1, 0, 'assembly', false, '{}'
FROM public.recipes r WHERE r.slug = 'jajka-sadzone-z-boczkiem-i-awokado';

-- OBIADY - Instructions

-- Grillowana pierś z kurczaka z brokułami (10 min prep, 20 min cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Przypraw pierś z kurczaka solą, pieprzem i oregano.', 3, 0, 'prep', false, '{}'
FROM public.recipes r WHERE r.slug = 'grillowana-piers-z-kurczaka-z-brokulami';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Rozgrzej grill lub patelnię grillową na średnim ogniu.', 1, 2, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia grillowa')]
FROM public.recipes r WHERE r.slug = 'grillowana-piers-z-kurczaka-z-brokulami';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids, checkpoint_type, checkpoint_condition)
SELECT r.id, 3, 'Grilluj kurczaka po 6-7 minut z każdej strony aż będzie dobrze wypieczony.', 2, 14, 'passive', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia grillowa')], 'temperature', '75°C w środku'
FROM public.recipes r WHERE r.slug = 'grillowana-piers-z-kurczaka-z-brokulami';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 4, 'W międzyczasie ugotuj brokuły na parze przez 5-7 minut.', 1, 6, 'passive', true,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Garnek')]
FROM public.recipes r WHERE r.slug = 'grillowana-piers-z-kurczaka-z-brokulami';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 5, 'Podawaj kurczaka z brokułami skropionymi oliwą.', 1, 0, 'assembly', false, '{}'
FROM public.recipes r WHERE r.slug = 'grillowana-piers-z-kurczaka-z-brokulami';

-- Filet z łososia z szparagami (10 min prep, 15 min cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Przypraw łososia solą, pieprzem i czosnkiem.', 3, 0, 'prep', false, '{}'
FROM public.recipes r WHERE r.slug = 'filet-z-lososia-z-szparagami';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Smaż łososia na oliwie po 4 minuty z każdej strony.', 2, 8, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'filet-z-lososia-z-szparagami';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 3, 'Podsmaż szparagi na maśle ghee przez 5 minut.', 1, 5, 'active', true,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'filet-z-lososia-z-szparagami';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 4, 'Podawaj łososia ze szparagami i plasterkami cytryny.', 1, 0, 'assembly', false, '{}'
FROM public.recipes r WHERE r.slug = 'filet-z-lososia-z-szparagami';

-- Stek wołowy z sałatką z rukoli (10 min prep, 15 min cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Przypraw stek solą i pieprzem. Wyjmij z lodówki 30 min przed smażeniem.', 2, 0, 'prep', false, '{}'
FROM public.recipes r WHERE r.slug = 'stek-wolowy-z-salatka-z-rukoli';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids, checkpoint_type, checkpoint_condition)
SELECT r.id, 2, 'Rozgrzej patelnię do bardzo wysokiej temperatury i smaż steak po 3-4 minuty z każdej strony (medium).', 2, 8, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')], 'temperature', '55-60°C dla medium'
FROM public.recipes r WHERE r.slug = 'stek-wolowy-z-salatka-z-rukoli';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 3, 'Wymieszaj rukolę, pomidorki koktajlowe i parmezan.', 3, 0, 'prep', true,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Miska')]
FROM public.recipes r WHERE r.slug = 'stek-wolowy-z-salatka-z-rukoli';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 4, 'Skrop oliwą i sokiem z cytryny.', 1, 0, 'assembly', false, '{}'
FROM public.recipes r WHERE r.slug = 'stek-wolowy-z-salatka-z-rukoli';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 5, 'Podawaj stek z sałatką. Daj mięsu odpocząć 3 min.', 0, 3, 'passive', false, '{}'
FROM public.recipes r WHERE r.slug = 'stek-wolowy-z-salatka-z-rukoli';

-- Kurczak curry z mlekiem kokosowym (15 min prep, 25 min cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Pokrój kurczaka w kostkę.', 4, 0, 'prep', false, '{}'
FROM public.recipes r WHERE r.slug = 'kurczak-curry-z-mlekiem-kokosowym';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Podsmaż kurczaka na oliwie z cebulą i czosnkiem.', 3, 5, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Garnek')]
FROM public.recipes r WHERE r.slug = 'kurczak-curry-z-mlekiem-kokosowym';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 3, 'Dodaj curry, kurkumę, imbir.', 2, 0, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Garnek')]
FROM public.recipes r WHERE r.slug = 'kurczak-curry-z-mlekiem-kokosowym';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 4, 'Wlej mleko kokosowe i duś 20 minut.', 1, 20, 'passive', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Garnek')]
FROM public.recipes r WHERE r.slug = 'kurczak-curry-z-mlekiem-kokosowym';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 5, 'Ugotuj kalafior w rondelku. Podawaj curry z różyczkami kalafiora.', 2, 8, 'passive', true,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Rondel')]
FROM public.recipes r WHERE r.slug = 'kurczak-curry-z-mlekiem-kokosowym';

-- Dorsz pieczony z warzywami (10 min prep, 20 min cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Nagrzej piekarnik do 190°C.', 1, 10, 'passive', true,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Piekarnik')]
FROM public.recipes r WHERE r.slug = 'dorsz-pieczony-z-warzywami';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Ułóż filet z dorsza na blasze wyłożonej papierem.', 2, 0, 'prep', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Blacha do pieczenia')]
FROM public.recipes r WHERE r.slug = 'dorsz-pieczony-z-warzywami';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 3, 'Pokrój cukinię i paprykę. Otocz nimi rybę, dodaj pomidory.', 5, 0, 'prep', false, '{}'
FROM public.recipes r WHERE r.slug = 'dorsz-pieczony-z-warzywami';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 4, 'Skrop oliwą, posyp oregano i tymiankiem.', 2, 0, 'prep', false, '{}'
FROM public.recipes r WHERE r.slug = 'dorsz-pieczony-z-warzywami';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids, required_temperature_celsius)
SELECT r.id, 5, 'Piecz 20 minut w 190°C.', 0, 20, 'passive', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Piekarnik')], 190
FROM public.recipes r WHERE r.slug = 'dorsz-pieczony-z-warzywami';

-- Krewetki w czosnku z cukinią (10 min prep, 8 min cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Pokrój cukinię w półplasterki. Posiekaj czosnek.', 4, 0, 'prep', false, '{}'
FROM public.recipes r WHERE r.slug = 'krewetki-w-czosnku-z-cukinia';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Rozgrzej wok, dodaj oliwę i czosnek.', 1, 1, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Wok')]
FROM public.recipes r WHERE r.slug = 'krewetki-w-czosnku-z-cukinia';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 3, 'Dodaj cukinię i smaż 3 minuty.', 1, 3, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Wok')]
FROM public.recipes r WHERE r.slug = 'krewetki-w-czosnku-z-cukinia';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids, checkpoint_type, checkpoint_condition)
SELECT r.id, 4, 'Dodaj krewetki i smaż 2-3 minuty aż będą różowe.', 1, 3, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Wok')], 'visual', 'Krewetki różowe i zwarte'
FROM public.recipes r WHERE r.slug = 'krewetki-w-czosnku-z-cukinia';

-- KOLACJE - Instructions

-- Pieczony łosoś z salsą z awokado (10 min prep, 15 min cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Nagrzej piekarnik do 200°C.', 1, 10, 'passive', true,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Piekarnik')]
FROM public.recipes r WHERE r.slug = 'pieczony-losos-z-salsa-z-awokado';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Przypraw łososia i ułóż na blasze.', 3, 0, 'prep', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Blacha do pieczenia')]
FROM public.recipes r WHERE r.slug = 'pieczony-losos-z-salsa-z-awokado';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids, required_temperature_celsius)
SELECT r.id, 3, 'Piecz łososia 12-15 minut.', 0, 15, 'passive', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Piekarnik')], 200
FROM public.recipes r WHERE r.slug = 'pieczony-losos-z-salsa-z-awokado';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 4, 'Przygotuj salsę: pokrój awokado, cebulę, pomidora. Wymieszaj z sokiem z limonki i kolendrą.', 6, 0, 'prep', true,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Miska')]
FROM public.recipes r WHERE r.slug = 'pieczony-losos-z-salsa-z-awokado';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 5, 'Podawaj łososia z salsą.', 1, 0, 'assembly', false, '{}'
FROM public.recipes r WHERE r.slug = 'pieczony-losos-z-salsa-z-awokado';

-- Stek z polędwicy z masłem ziołowym (15 min prep, 10 min cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Wyjmij stek z lodówki 30 min przed. Przypraw solą i pieprzem.', 2, 0, 'prep', false, '{}'
FROM public.recipes r WHERE r.slug = 'stek-z-poledwicy-z-maslem-ziolowym';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Przygotuj masło ziołowe: wymieszaj miękkie masło z posiekanymi ziołami (tymianek, rozmaryn, pietruszka).', 5, 0, 'prep', true, '{}'
FROM public.recipes r WHERE r.slug = 'stek-z-poledwicy-z-maslem-ziolowym';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids, checkpoint_type, checkpoint_condition)
SELECT r.id, 3, 'Rozgrzej patelnię grillową. Smaż stek 3-4 min z każdej strony.', 2, 8, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia grillowa')], 'temperature', '52-55°C dla medium-rare'
FROM public.recipes r WHERE r.slug = 'stek-z-poledwicy-z-maslem-ziolowym';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 4, 'Podsmaż szparagi na patelni.', 1, 4, 'active', true,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia')]
FROM public.recipes r WHERE r.slug = 'stek-z-poledwicy-z-maslem-ziolowym';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 5, 'Połóż masło ziołowe na gorącym steku. Daj odpocząć 3 min.', 1, 3, 'passive', false, '{}'
FROM public.recipes r WHERE r.slug = 'stek-z-poledwicy-z-maslem-ziolowym';

-- Gulasz wieprzowy po węgiersku (20 min prep, 90 min cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Pokrój wieprzowinę w kostkę 3 cm. Pokrój cebulę i paprykę.', 10, 0, 'prep', false, '{}'
FROM public.recipes r WHERE r.slug = 'gulasz-wieprzowy-po-wegiersku';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Obsmaż mięso na smalcu partiami do zrumienienia.', 5, 10, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Garnek')]
FROM public.recipes r WHERE r.slug = 'gulasz-wieprzowy-po-wegiersku';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 3, 'Dodaj cebulę, podsmaż. Dodaj paprykę słodką i ostrą.', 3, 5, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Garnek')]
FROM public.recipes r WHERE r.slug = 'gulasz-wieprzowy-po-wegiersku';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 4, 'Zalej bulionem, dodaj pomidory. Duś pod przykryciem 1.5h.', 2, 90, 'passive', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Garnek')]
FROM public.recipes r WHERE r.slug = 'gulasz-wieprzowy-po-wegiersku';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids, checkpoint_type, checkpoint_condition)
SELECT r.id, 5, 'Dopraw do smaku, podawaj ze śmietaną.', 2, 0, 'assembly', false, '{}', 'texture', 'Mięso miękkie i rozpadające się'
FROM public.recipes r WHERE r.slug = 'gulasz-wieprzowy-po-wegiersku';

-- Sałatka cezar z kurczakiem (15 min prep, 10 min cook)
INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 1, 'Przypraw pierś z kurczaka solą, pieprzem i ziołami.', 2, 0, 'prep', false, '{}'
FROM public.recipes r WHERE r.slug = 'salatka-cezar-z-kurczakiem';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 2, 'Grilluj kurczaka na patelni grillowej po 5 min z każdej strony.', 2, 10, 'active', false,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Patelnia grillowa')]
FROM public.recipes r WHERE r.slug = 'salatka-cezar-z-kurczakiem';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 3, 'Porwij sałatę rzymską do miski. Zetrzyj parmezan.', 4, 0, 'prep', true,
  ARRAY[(SELECT id FROM public.equipment WHERE name = 'Miska')]
FROM public.recipes r WHERE r.slug = 'salatka-cezar-z-kurczakiem';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 4, 'Przygotuj dressing cezar: wymieszaj majonez, parmezan, czosnek, anchois.', 3, 0, 'prep', true, '{}'
FROM public.recipes r WHERE r.slug = 'salatka-cezar-z-kurczakiem';

INSERT INTO public.recipe_instructions (recipe_id, step_number, description, active_minutes, passive_minutes, action_type, is_parallelizable, equipment_ids)
SELECT r.id, 5, 'Pokrój kurczaka w paski. Wymieszaj sałatę z dressingiem, dodaj kurczaka i parmezan.', 3, 0, 'assembly', false, '{}'
FROM public.recipes r WHERE r.slug = 'salatka-cezar-z-kurczakiem';

-- =====================================================================
-- 3. PRZYPISANIA SPRZĘTU DO PRZEPISÓW
-- =====================================================================
-- Usunięcie istniejących przypisań (jeśli są)
DELETE FROM public.recipe_equipment;

-- ŚNIADANIA - Equipment

-- Omlet ze szpinakiem i fetą: Patelnia
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'średnia, nieprzywierająca'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'omlet-ze-szpinakiem-i-serem-feta' AND e.name = 'Patelnia';

-- Jajecznica z łososiem: Patelnia
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'nieprzywierająca'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'jajecznica-z-lososiem-wedzonym-i-awokado' AND e.name = 'Patelnia';

-- Shakshuka: Patelnia głęboka z pokrywką
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'głęboka z pokrywką'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'shakshuka-z-pomidorami-i-papryka' AND e.name = 'Patelnia';

-- Jogurt grecki: Miska
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, NULL
FROM public.recipes r, public.equipment e
WHERE r.slug = 'jogurt-grecki-z-orzechami-i-jagodami' AND e.name = 'Miska';

-- Placki z cukinii: Patelnia + Miska
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'nieprzywierająca'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'placki-z-cukinii-z-serkiem-wiejskim' AND e.name = 'Patelnia';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do mieszania ciasta'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'placki-z-cukinii-z-serkiem-wiejskim' AND e.name = 'Miska';

-- Frittata: Patelnia żaroodporna + Piekarnik + Garnek
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'żaroodporna'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'frittata-z-brokulami-i-serem-cheddar' AND e.name = 'Patelnia';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, '180°C'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'frittata-z-brokulami-i-serem-cheddar' AND e.name = 'Piekarnik';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do blanszowania brokułów'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'frittata-z-brokulami-i-serem-cheddar' AND e.name = 'Garnek';

-- Chia pudding: Miska
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do namoczenia chia'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'chia-pudding-kokosowy-z-borowkami' AND e.name = 'Miska';

-- Twaróg z orzechami: Miska
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, NULL
FROM public.recipes r, public.equipment e
WHERE r.slug = 'twarog-z-orzechami-laskowymi-i-cynamonem' AND e.name = 'Miska';

-- Jajka sadzone z boczkiem: Patelnia
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do smażenia boczku i jajek'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'jajka-sadzone-z-boczkiem-i-awokado' AND e.name = 'Patelnia';

-- Smoothie bowl: Blender
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, NULL
FROM public.recipes r, public.equipment e
WHERE r.slug = 'smoothie-bowl-z-awokado-i-szpinakiem' AND e.name = 'Blender';

-- Zapiekane awokado: Piekarnik + Patelnia
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, '180°C'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'zapiekane-awokado-z-jajkiem-i-boczkiem' AND e.name = 'Piekarnik';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do boczku'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'zapiekane-awokado-z-jajkiem-i-boczkiem' AND e.name = 'Patelnia';

-- OBIADY - Equipment

-- Grillowana pierś z kurczaka: Patelnia grillowa + Garnek (parownik)
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, NULL
FROM public.recipes r, public.equipment e
WHERE r.slug = 'grillowana-piers-z-kurczaka-z-brokulami' AND e.name = 'Patelnia grillowa';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do gotowania brokułów na parze'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'grillowana-piers-z-kurczaka-z-brokulami' AND e.name = 'Garnek';

-- Filet z łososia: Patelnia x2
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 2, 'jedna do łososia, druga do szparagów'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'filet-z-lososia-z-szparagami' AND e.name = 'Patelnia';

-- Stek wołowy: Patelnia + Miska
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'żeliwna, dobrze rozgrzana'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'stek-wolowy-z-salatka-z-rukoli' AND e.name = 'Patelnia';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do sałatki'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'stek-wolowy-z-salatka-z-rukoli' AND e.name = 'Miska';

-- Kurczak curry: Garnek + Rondel
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'głęboki'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'kurczak-curry-z-mlekiem-kokosowym' AND e.name = 'Garnek';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do kalafiora'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'kurczak-curry-z-mlekiem-kokosowym' AND e.name = 'Rondel';

-- Dorsz pieczony: Piekarnik + Blacha
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, '190°C'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'dorsz-pieczony-z-warzywami' AND e.name = 'Piekarnik';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'wyłożona papierem'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'dorsz-pieczony-z-warzywami' AND e.name = 'Blacha do pieczenia';

-- Kotlety z indyka: Patelnia + Garnek + Blender ręczny
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do smażenia kotletów'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'kotlety-z-indyka-z-puree-z-kalafiora' AND e.name = 'Patelnia';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do gotowania kalafiora'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'kotlety-z-indyka-z-puree-z-kalafiora' AND e.name = 'Garnek';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do miksowania puree'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'kotlety-z-indyka-z-puree-z-kalafiora' AND e.name = 'Blender ręczny';

-- Sałatka z tuńczyka: Garnek + Miska
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do gotowania jajek'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'salatka-z-tunczyka-i-jajkiem' AND e.name = 'Garnek';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do mieszania sałatki'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'salatka-z-tunczyka-i-jajkiem' AND e.name = 'Miska';

-- Udka z kurczaka pieczone: Piekarnik + Brytfanna + Patelnia
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, '200°C'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'udka-z-kurczaka-pieczone-z-ziolami' AND e.name = 'Piekarnik';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, NULL
FROM public.recipes r, public.equipment e
WHERE r.slug = 'udka-z-kurczaka-pieczone-z-ziolami' AND e.name = 'Brytfanna';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do szpinaku'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'udka-z-kurczaka-pieczone-z-ziolami' AND e.name = 'Patelnia';

-- Krewetki w czosnku: Wok/Patelnia
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, NULL
FROM public.recipes r, public.equipment e
WHERE r.slug = 'krewetki-w-czosnku-z-cukinia' AND e.name = 'Wok';

-- Schab wieprzowy: Patelnia x2
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 2, 'jedna do mięsa, druga do kapusty'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'schab-wieprzowy-z-kapusta' AND e.name = 'Patelnia';

-- KOLACJE - Equipment

-- Pieczony łosoś z salsą: Piekarnik + Blacha + Miska
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, '200°C'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'pieczony-losos-z-salsa-z-awokado' AND e.name = 'Piekarnik';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'wyłożona papierem'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'pieczony-losos-z-salsa-z-awokado' AND e.name = 'Blacha do pieczenia';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do salsy'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'pieczony-losos-z-salsa-z-awokado' AND e.name = 'Miska';

-- Pierś z indyka w sosie grzybowym: Patelnia + Garnek
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'głęboka'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'piers-z-indyka-w-sosie-grzybowym' AND e.name = 'Patelnia';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do brokułów'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'piers-z-indyka-w-sosie-grzybowym' AND e.name = 'Garnek';

-- Stek z polędwicy: Patelnia grillowa + Patelnia
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do steka'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'stek-z-poledwicy-z-maslem-ziolowym' AND e.name = 'Patelnia grillowa';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do szparagów'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'stek-z-poledwicy-z-maslem-ziolowym' AND e.name = 'Patelnia';

-- Kurczak pieczony z cytryną: Piekarnik + Brytfanna
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, '190°C'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'kurczak-pieczony-z-cytryna' AND e.name = 'Piekarnik';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, NULL
FROM public.recipes r, public.equipment e
WHERE r.slug = 'kurczak-pieczony-z-cytryna' AND e.name = 'Brytfanna';

-- Dorsz z pesto: Patelnia + Blender
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do smażenia dorsza'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'dorsz-z-pesto-bazyliowym' AND e.name = 'Patelnia';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do pesto'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'dorsz-z-pesto-bazyliowym' AND e.name = 'Blender';

-- Kotlety z baraniny: Patelnia grillowa + Miska
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, NULL
FROM public.recipes r, public.equipment e
WHERE r.slug = 'kotlety-z-baraniny-z-sosem-mietowym' AND e.name = 'Patelnia grillowa';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do sosu miętowego'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'kotlety-z-baraniny-z-sosem-mietowym' AND e.name = 'Miska';

-- Krewetki w maśle czosnkowym: Patelnia
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, NULL
FROM public.recipes r, public.equipment e
WHERE r.slug = 'krewetki-w-masle-czosnkowym' AND e.name = 'Patelnia';

-- Gulasz wieprzowy: Garnek głęboki
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'głęboki, żeliwny'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'gulasz-wieprzowy-po-wegiersku' AND e.name = 'Garnek';

-- Łosoś teriyaki: Patelnia + Wok
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do łososia'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'losos-teriyaki-z-bok-choy' AND e.name = 'Patelnia';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do bok choy'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'losos-teriyaki-z-bok-choy' AND e.name = 'Wok';

-- Sałatka cezar z kurczakiem: Patelnia grillowa + Miska
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do grillowania kurczaka'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'salatka-cezar-z-kurczakiem' AND e.name = 'Patelnia grillowa';

INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do mieszania sałatki'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'salatka-cezar-z-kurczakiem' AND e.name = 'Miska';

-- SNACKI - Equipment (większość nie wymaga sprzętu)

-- Twaróg z truskawkami: Miska
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, NULL
FROM public.recipes r, public.equipment e
WHERE r.slug = 'twarog-z-truskawkami-i-stewia' AND e.name = 'Miska';

-- Jogurt z orzechami: Miska
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, NULL
FROM public.recipes r, public.equipment e
WHERE r.slug = 'jogurt-grecki-z-orzechami-wloskimi' AND e.name = 'Miska';

-- Jajka na twardo: Garnek
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do gotowania jajek'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'jajka-na-twardo-z-majonezem' AND e.name = 'Garnek';

-- Papryka z guacamole: Miska
INSERT INTO public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
SELECT r.id, e.id, 1, 'do mieszania guacamole'
FROM public.recipes r, public.equipment e
WHERE r.slug = 'papryka-z-guacamole' AND e.name = 'Miska';

-- =====================================================================
-- 4. VERIFICATION QUERIES
-- =====================================================================

SELECT 'Recipes with prep_time_min:' as info, count(*)::text as count
FROM public.recipes WHERE prep_time_min IS NOT NULL;

SELECT 'Recipes with cook_time_min:' as info, count(*)::text as count
FROM public.recipes WHERE cook_time_min IS NOT NULL;

SELECT 'Recipe instructions:' as info, count(*)::text as count
FROM public.recipe_instructions;

SELECT 'Recipe equipment assignments:' as info, count(*)::text as count
FROM public.recipe_equipment;

-- Verify instructions by recipe
SELECT r.name as recipe, count(ri.id) as steps
FROM public.recipes r
LEFT JOIN public.recipe_instructions ri ON r.id = ri.recipe_id
GROUP BY r.name
HAVING count(ri.id) > 0
ORDER BY steps DESC;

-- Verify equipment distribution
SELECT e.name as equipment, count(*) as recipe_count
FROM public.recipe_equipment re
JOIN public.equipment e ON re.equipment_id = e.id
GROUP BY e.name
ORDER BY recipe_count DESC;

-- Verify action types distribution
SELECT action_type, count(*) as count
FROM public.recipe_instructions
GROUP BY action_type
ORDER BY count DESC;

-- =====================================================================
-- SEED DATA V2.0 UPDATE COMPLETE
-- =====================================================================
-- Updated: prep_time_min, cook_time_min, difficulty_level for all recipes
-- Added: recipe_instructions with active/passive times (for Timeline!)
-- Added: equipment assignments for all recipes
-- NOTE: Image URLs remain unchanged (already in Supabase Storage)
-- NOTE: recipe_ingredients already populated from seed_recipes_public.sql
-- =====================================================================
