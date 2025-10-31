-- =====================================================================
-- Seed Data for LowCarbPlaner - RECIPES WITH INGREDIENTS
-- Description: 30 low-carb recipes (10 breakfasts, 10 lunches, 10 dinners)
-- =====================================================================
-- IMPORTANT: Run seed_ingredients.sql FIRST!
-- All ingredients verified against seed_ingredients.sql
-- =====================================================================

-- =====================================================================
-- ŚNIADANIA (BREAKFASTS) - 10 przepisów
-- =====================================================================

-- Śniadanie 1: Omlet ze szpinakiem i fetą
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Omlet ze szpinakiem i fetą', null, '[{"step":1,"description":"Rozbij jajka do miski i ubij widelcem. Dodaj szczyptę soli i pieprzu."},{"step":2,"description":"Rozgrzej oliwę na patelni na średnim ogniu."},{"step":3,"description":"Dodaj szpinak i smaż przez 2 minuty aż się zmniejszy."},{"step":4,"description":"Wlej jajka na patelnię. Gdy brzegi zaczną tężeć, posyp pokruszonym serem feta."},{"step":5,"description":"Złóż omlet na pół i smaż jeszcze 1-2 minuty."}]'::jsonb, array['breakfast']::public.meal_type_enum[], array['jajka', 'szybkie', 'patelnia', 'wegetariańskie']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Omlet ze szpinakiem i fetą'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 120, 'g', true, 1),
((select id from public.recipes where name = 'Omlet ze szpinakiem i fetą'), (select id from public.ingredients where name = 'Szpinak (świeży)'), 100, 'g', true, 3),
((select id from public.recipes where name = 'Omlet ze szpinakiem i fetą'), (select id from public.ingredients where name = 'Ser feta'), 50, 'g', true, 4),
((select id from public.recipes where name = 'Omlet ze szpinakiem i fetą'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 2),
((select id from public.recipes where name = 'Omlet ze szpinakiem i fetą'), (select id from public.ingredients where name = 'Sól'), 1, 'g', false, 1),
((select id from public.recipes where name = 'Omlet ze szpinakiem i fetą'), (select id from public.ingredients where name = 'Pieprz czarny'), 0.5, 'g', false, 1);

-- Śniadanie 2: Jajecznica z łososiem wędzonym
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Jajecznica z łososiem wędzonym i awokado', null, '[{"step":1,"description":"Roztrzep jajka z odrobiną śmietany 18%."},{"step":2,"description":"Rozgrzej masło na patelni i wlej jajka."},{"step":3,"description":"Smaż mieszając delikatnie aż jajka będą kremowe."},{"step":4,"description":"Podawaj z plasterkami łososia wędzonego i pokrojonym awokado."},{"step":5,"description":"Posyp szczypiorkiem i pieprzem."}]'::jsonb, array['breakfast']::public.meal_type_enum[], array['jajka', 'ryba', 'premium', 'szybkie']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Jajecznica z łososiem wędzonym i awokado'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 150, 'g', true, 1),
((select id from public.recipes where name = 'Jajecznica z łososiem wędzonym i awokado'), (select id from public.ingredients where name = 'Śmietana 18%'), 30, 'ml', true, 1),
((select id from public.recipes where name = 'Jajecznica z łososiem wędzonym i awokado'), (select id from public.ingredients where name = 'Masło'), 10, 'g', false, 2),
((select id from public.recipes where name = 'Jajecznica z łososiem wędzonym i awokado'), (select id from public.ingredients where name = 'Łosoś wędzony'), 80, 'g', true, 4),
((select id from public.recipes where name = 'Jajecznica z łososiem wędzonym i awokado'), (select id from public.ingredients where name = 'Awokado'), 100, 'g', true, 4),
((select id from public.recipes where name = 'Jajecznica z łososiem wędzonym i awokado'), (select id from public.ingredients where name = 'Szczypiork (świeży)'), 5, 'g', false, 5);

-- Śniadanie 3: Shakshuka
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Shakshuka z pomidorami i papryką', null, '[{"step":1,"description":"Podsmaż pokrojoną cebulę i paprykę na oliwie."},{"step":2,"description":"Dodaj pomidory z puszki, czosnek, kumin i paprykę ostrą."},{"step":3,"description":"Duś 10 minut aż sos zgęstnieje."},{"step":4,"description":"Zrób dołki w sosie i wbij jajka."},{"step":5,"description":"Przykryj i duś 5-7 minut aż białka się zetną. Posyp kolendrą."}]'::jsonb, array['breakfast']::public.meal_type_enum[], array['jajka', 'orientalne', 'pikantne', 'jednogarnkowe']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 180, 'g', true, 4),
((select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'), (select id from public.ingredients where name = 'Cebula biała'), 80, 'g', true, 1),
((select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'), (select id from public.ingredients where name = 'Papryka czerwona'), 120, 'g', true, 1),
((select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'), (select id from public.ingredients where name = 'Pomidory krojone (puszka)'), 200, 'g', true, 2),
((select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'), (select id from public.ingredients where name = 'Czosnek (ząbek)'), 10, 'g', false, 2),
((select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'), (select id from public.ingredients where name = 'Kminek rzymski (kmin)'), 2, 'g', false, 2),
((select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'), (select id from public.ingredients where name = 'Papryka ostra'), 1, 'g', false, 2),
((select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 15, 'ml', false, 1),
((select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'), (select id from public.ingredients where name = 'Kolendra (świeża)'), 10, 'g', false, 5);

-- Śniadanie 4: Jogurt grecki z orzechami i jagodami
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Jogurt grecki z orzechami i jagodami', null, '[{"step":1,"description":"Przełóż jogurt grecki do miski."},{"step":2,"description":"Posiekaj orzechy włoskie, migdały i orzechy pekan."},{"step":3,"description":"Dodaj świeże jagody i jeżyny."},{"step":4,"description":"Posyp nasionami chia i lnu."}]'::jsonb, array['breakfast']::public.meal_type_enum[], array['jogurt', 'orzechy', 'szybkie', 'zdrowe-tłuszcze']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'), (select id from public.ingredients where name = 'Jogurt grecki naturalny (pełnotłusty)'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'), (select id from public.ingredients where name = 'Orzechy włoskie'), 20, 'g', true, 2),
((select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'), (select id from public.ingredients where name = 'Migdały'), 15, 'g', true, 2),
((select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'), (select id from public.ingredients where name = 'Orzechy pekan'), 15, 'g', true, 2),
((select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'), (select id from public.ingredients where name = 'Jagody'), 40, 'g', true, 3),
((select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'), (select id from public.ingredients where name = 'Jeżyny'), 30, 'g', true, 3),
((select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'), (select id from public.ingredients where name = 'Nasiona chia'), 8, 'g', true, 4),
((select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'), (select id from public.ingredients where name = 'Nasiona lnu'), 5, 'g', true, 4);

-- Śniadanie 5: Placki z cukinii z serkiem wiejskim
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Placki z cukinii z serkiem wiejskim', null, '[{"step":1,"description":"Zetrzyj cukinię i odciśnij nadmiar wody."},{"step":2,"description":"Wymieszaj z jajkiem, mąką kokosową, czosnkiem i przyprawami."},{"step":3,"description":"Formuj placki i smaż na oliwie z obu stron do zrumienienia."},{"step":4,"description":"Podawaj z serkiem wiejskim i szczypiorkiem."}]'::jsonb, array['breakfast']::public.meal_type_enum[], array['placki', 'warzywa', 'wegetariańskie', 'patelnia']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Cukinia'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 60, 'g', true, 2),
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Mąka kokosowa'), 20, 'g', true, 2),
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Czosnek (ząbek)'), 5, 'g', false, 2),
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 2),
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Pieprz czarny'), 1, 'g', false, 2),
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 15, 'ml', false, 3),
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Serek wiejski'), 100, 'g', true, 4),
((select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'), (select id from public.ingredients where name = 'Szczypiork (świeży)'), 5, 'g', false, 4);

-- Śniadanie 6: Frittata z brokułami i serem cheddar
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Frittata z brokułami i serem cheddar', null, '[{"step":1,"description":"Blanszuj brokuły i pokrój na różyczki."},{"step":2,"description":"Roztrzep jajka z solą i pieprzem."},{"step":3,"description":"Na patelni żaroodpornej zeszklij cebulę, dodaj brokuły."},{"step":4,"description":"Wlej jajka, posyp tartym cheddarem."},{"step":5,"description":"Wstaw do piekarnika na 15 minut (180°C)."}]'::jsonb, array['breakfast']::public.meal_type_enum[], array['jajka', 'piekarnik', 'brokuły', 'ser']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 240, 'g', true, 2),
((select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'), (select id from public.ingredients where name = 'Brokuły'), 150, 'g', true, 1),
((select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'), (select id from public.ingredients where name = 'Cebula biała'), 60, 'g', true, 3),
((select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'), (select id from public.ingredients where name = 'Ser cheddar'), 60, 'g', true, 4),
((select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 3),
((select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 2),
((select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'), (select id from public.ingredients where name = 'Pieprz czarny'), 1, 'g', false, 2);

-- Śniadanie 7: Chia pudding kokosowy z borówkami
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Chia pudding kokosowy z borówkami', null, '[{"step":1,"description":"Wymieszaj nasiona chia z mlekiem kokosowym i erytytolem."},{"step":2,"description":"Zostaw w lodówce na noc."},{"step":3,"description":"Rano wymieszaj i przełóż do miseczki."},{"step":4,"description":"Dodaj borówki i wiórki kokosowe."}]'::jsonb, array['breakfast']::public.meal_type_enum[], array['chia', 'kokos', 'na-zimno', 'przygotowanie-wcześniej']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Chia pudding kokosowy z borówkami'), (select id from public.ingredients where name = 'Nasiona chia'), 30, 'g', true, 1),
((select id from public.recipes where name = 'Chia pudding kokosowy z borówkami'), (select id from public.ingredients where name = 'Mleko kokosowe'), 200, 'ml', true, 1),
((select id from public.recipes where name = 'Chia pudding kokosowy z borówkami'), (select id from public.ingredients where name = 'Erytrytol'), 10, 'g', false, 1),
((select id from public.recipes where name = 'Chia pudding kokosowy z borówkami'), (select id from public.ingredients where name = 'Borówki'), 50, 'g', true, 4);

-- Śniadanie 8: Twaróg z orzechami laskowymi i cynamonem
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Twaróg z orzechami laskowymi i cynamonem', null, '[{"step":1,"description":"Wymieszaj twaróg półtłusty z odrobiną kefiru."},{"step":2,"description":"Dodaj posiekane orzechy laskowe."},{"step":3,"description":"Posyp cynamonem i erytytolem."},{"step":4,"description":"Udekoruj truskawkami."}]'::jsonb, array['breakfast']::public.meal_type_enum[], array['twaróg', 'orzechy', 'szybkie', 'słodkie']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Twaróg z orzechami laskowymi i cynamonem'), (select id from public.ingredients where name = 'Twaróg półtłusty'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Twaróg z orzechami laskowymi i cynamonem'), (select id from public.ingredients where name = 'Kefir naturalny'), 30, 'ml', true, 1),
((select id from public.recipes where name = 'Twaróg z orzechami laskowymi i cynamonem'), (select id from public.ingredients where name = 'Orzechy laskowe'), 30, 'g', true, 2),
((select id from public.recipes where name = 'Twaróg z orzechami laskowymi i cynamonem'), (select id from public.ingredients where name = 'Cynamon'), 2, 'g', false, 3),
((select id from public.recipes where name = 'Twaróg z orzechami laskowymi i cynamonem'), (select id from public.ingredients where name = 'Erytrytol'), 5, 'g', false, 3),
((select id from public.recipes where name = 'Twaróg z orzechami laskowymi i cynamonem'), (select id from public.ingredients where name = 'Truskawki'), 50, 'g', true, 4);

-- Śniadanie 9: Jajka sadzone z boczkiem i awokado
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Jajka sadzone z boczkiem i awokado', null, '[{"step":1,"description":"Usmaż boczek na chrupko i odłóż."},{"step":2,"description":"Na tej samej patelni usmaż jajka sadzone."},{"step":3,"description":"Pokrój awokado w plasterki."},{"step":4,"description":"Ułóż na talerzu: awokado, jajka, boczek."},{"step":5,"description":"Posyp pieprzem i szczypiorkiem."}]'::jsonb, array['breakfast']::public.meal_type_enum[], array['jajka', 'boczek', 'wysokotłuszczowe', 'szybkie']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Jajka sadzone z boczkiem i awokado'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 120, 'g', true, 2),
((select id from public.recipes where name = 'Jajka sadzone z boczkiem i awokado'), (select id from public.ingredients where name = 'Wieprzowina - boczek surowy'), 50, 'g', true, 1),
((select id from public.recipes where name = 'Jajka sadzone z boczkiem i awokado'), (select id from public.ingredients where name = 'Awokado'), 100, 'g', true, 3),
((select id from public.recipes where name = 'Jajka sadzone z boczkiem i awokado'), (select id from public.ingredients where name = 'Pieprz czarny'), 1, 'g', false, 5),
((select id from public.recipes where name = 'Jajka sadzone z boczkiem i awokado'), (select id from public.ingredients where name = 'Szczypiork (świeży)'), 5, 'g', false, 5);

-- Śniadanie 10: Smoothie bowl z awokado i szpinakiem
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Smoothie bowl z awokado i szpinakiem', null, '[{"step":1,"description":"Zmiksuj awokado, szpinak, mleko migdałowe i truskawki."},{"step":2,"description":"Przelej do miski."},{"step":3,"description":"Udekoruj malinami, nasionami chia i posiekanymi migdałami."}]'::jsonb, array['breakfast']::public.meal_type_enum[], array['smoothie', 'zielone', 'szybkie', 'na-zimno']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Smoothie bowl z awokado i szpinakiem'), (select id from public.ingredients where name = 'Awokado'), 80, 'g', true, 1),
((select id from public.recipes where name = 'Smoothie bowl z awokado i szpinakiem'), (select id from public.ingredients where name = 'Szpinak (świeży)'), 50, 'g', true, 1),
((select id from public.recipes where name = 'Smoothie bowl z awokado i szpinakiem'), (select id from public.ingredients where name = 'Mleko migdałowe'), 150, 'ml', true, 1),
((select id from public.recipes where name = 'Smoothie bowl z awokado i szpinakiem'), (select id from public.ingredients where name = 'Truskawki'), 40, 'g', true, 1),
((select id from public.recipes where name = 'Smoothie bowl z awokado i szpinakiem'), (select id from public.ingredients where name = 'Maliny'), 30, 'g', true, 3),
((select id from public.recipes where name = 'Smoothie bowl z awokado i szpinakiem'), (select id from public.ingredients where name = 'Nasiona chia'), 10, 'g', true, 3),
((select id from public.recipes where name = 'Smoothie bowl z awokado i szpinakiem'), (select id from public.ingredients where name = 'Migdały'), 15, 'g', true, 3);

-- =====================================================================
-- OBIADY (LUNCHES) - 10 przepisów
-- =====================================================================

-- Obiad 1: Grillowana pierś z kurczaka z brokułami
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Grillowana pierś z kurczaka z brokułami', null, '[{"step":1,"description":"Przypraw pierś z kurczaka solą, pieprzem i oregano."},{"step":2,"description":"Rozgrzej grill lub patelnię grillową na średnim ogniu."},{"step":3,"description":"Grilluj kurczaka po 6-7 minut z każdej strony aż będzie dobrze wypieczony."},{"step":4,"description":"W międzyczasie ugotuj brokuły na parze przez 5-7 minut."},{"step":5,"description":"Podawaj kurczaka z brokułami skropionymi oliwą."}]'::jsonb, array['lunch']::public.meal_type_enum[], array['kurczak', 'zdrowe', 'wysokobiałkowe', 'grill']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Grillowana pierś z kurczaka z brokułami'), (select id from public.ingredients where name = 'Kurczak - pierś (bez skóry)'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Grillowana pierś z kurczaka z brokułami'), (select id from public.ingredients where name = 'Brokuły'), 200, 'g', true, 4),
((select id from public.recipes where name = 'Grillowana pierś z kurczaka z brokułami'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 5),
((select id from public.recipes where name = 'Grillowana pierś z kurczaka z brokułami'), (select id from public.ingredients where name = 'Oregano (suszone)'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Grillowana pierś z kurczaka z brokułami'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Grillowana pierś z kurczaka z brokułami'), (select id from public.ingredients where name = 'Pieprz czarny'), 1, 'g', false, 1);

-- Obiad 2: Filet z łososia z szparagami
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Filet z łososia z szparagami', null, '[{"step":1,"description":"Przypraw łososia solą, pieprzem i czosnkiem."},{"step":2,"description":"Smaż na oliwie po 4 minuty z każdej strony."},{"step":3,"description":"Podsmaż szparagi na maśle ghee przez 5 minut."},{"step":4,"description":"Podawaj łososia ze szparagami i plasterkami cytryny."}]'::jsonb, array['lunch']::public.meal_type_enum[], array['ryba', 'szparagi', 'omega3', 'zdrowe-tłuszcze']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Filet z łososia z szparagami'), (select id from public.ingredients where name = 'Łosoś (świeży)'), 180, 'g', true, 1),
((select id from public.recipes where name = 'Filet z łososia z szparagami'), (select id from public.ingredients where name = 'Szparagi'), 150, 'g', true, 3),
((select id from public.recipes where name = 'Filet z łososia z szparagami'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 2),
((select id from public.recipes where name = 'Filet z łososia z szparagami'), (select id from public.ingredients where name = 'Ghee (masło klarowane)'), 10, 'g', false, 3),
((select id from public.recipes where name = 'Filet z łososia z szparagami'), (select id from public.ingredients where name = 'Czosnek (ząbek)'), 5, 'g', false, 1),
((select id from public.recipes where name = 'Filet z łososia z szparagami'), (select id from public.ingredients where name = 'Cytryna (sok)'), 15, 'ml', false, 4),
((select id from public.recipes where name = 'Filet z łososia z szparagami'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Filet z łososia z szparagami'), (select id from public.ingredients where name = 'Pieprz czarny'), 1, 'g', false, 1);

-- Obiad 3: Stek wołowy z sałatką z rukoli
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Stek wołowy z sałatką z rukoli', null, '[{"step":1,"description":"Przypraw stek solą i pieprzem."},{"step":2,"description":"Rozgrzej patelnię do bardzo wysokiej temperatury i smaż steak po 3-4 minuty z każdej strony (medium)."},{"step":3,"description":"Wymieszaj rukolę, pomidorki koktajlowe i parmezan."},{"step":4,"description":"Skrop oliwą i sokiem z cytryny."},{"step":5,"description":"Podawaj steak z sałatką."}]'::jsonb, array['lunch']::public.meal_type_enum[], array['wołowina', 'stek', 'białkowe', 'sałatka']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Stek wołowy z sałatką z rukoli'), (select id from public.ingredients where name = 'Wołowina - antrykot (stek)'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Stek wołowy z sałatką z rukoli'), (select id from public.ingredients where name = 'Rukola'), 80, 'g', true, 3),
((select id from public.recipes where name = 'Stek wołowy z sałatką z rukoli'), (select id from public.ingredients where name = 'Pomidory koktajlowe'), 100, 'g', true, 3),
((select id from public.recipes where name = 'Stek wołowy z sałatką z rukoli'), (select id from public.ingredients where name = 'Ser parmezan'), 30, 'g', true, 3),
((select id from public.recipes where name = 'Stek wołowy z sałatką z rukoli'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 15, 'ml', false, 4),
((select id from public.recipes where name = 'Stek wołowy z sałatką z rukoli'), (select id from public.ingredients where name = 'Cytryna (sok)'), 10, 'ml', false, 4),
((select id from public.recipes where name = 'Stek wołowy z sałatką z rukoli'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Stek wołowy z sałatką z rukoli'), (select id from public.ingredients where name = 'Pieprz czarny'), 1, 'g', false, 1);

-- Obiad 4: Kurczak curry z mlekiem kokosowym
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Kurczak curry z mlekiem kokosowym', null, '[{"step":1,"description":"Pokrój kurczaka w kostkę."},{"step":2,"description":"Podsmaż na oliwie z cebulą i czosnkiem."},{"step":3,"description":"Dodaj curry, kurkumę, imbir."},{"step":4,"description":"Wlej mleko kokosowe i duś 20 minut."},{"step":5,"description":"Podawaj z różyczkami kalafiora."}]'::jsonb, array['lunch']::public.meal_type_enum[], array['kurczak', 'curry', 'kokos', 'orientalne']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Kurczak curry z mlekiem kokosowym'), (select id from public.ingredients where name = 'Kurczak - pierś (bez skóry)'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Kurczak curry z mlekiem kokosowym'), (select id from public.ingredients where name = 'Mleko kokosowe'), 200, 'ml', true, 4),
((select id from public.recipes where name = 'Kurczak curry z mlekiem kokosowym'), (select id from public.ingredients where name = 'Cebula biała'), 80, 'g', true, 2),
((select id from public.recipes where name = 'Kurczak curry z mlekiem kokosowym'), (select id from public.ingredients where name = 'Czosnek (ząbek)'), 10, 'g', false, 2),
((select id from public.recipes where name = 'Kurczak curry z mlekiem kokosowym'), (select id from public.ingredients where name = 'Imbir (świeży)'), 10, 'g', false, 3),
((select id from public.recipes where name = 'Kurczak curry z mlekiem kokosowym'), (select id from public.ingredients where name = 'Kurkuma'), 3, 'g', false, 3),
((select id from public.recipes where name = 'Kurczak curry z mlekiem kokosowym'), (select id from public.ingredients where name = 'Kalafior'), 150, 'g', true, 5),
((select id from public.recipes where name = 'Kurczak curry z mlekiem kokosowym'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 2);

-- Obiad 5: Dorsz pieczony z warzywami
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Dorsz pieczony z warzywami', null, '[{"step":1,"description":"Ułóż filet z dorsza na blasze."},{"step":2,"description":"Otocz cukinią, papryką, pomidorami."},{"step":3,"description":"Skrop oliwą, posyp oregano i tymiankiem."},{"step":4,"description":"Piecz 20 minut w 190°C."}]'::jsonb, array['lunch']::public.meal_type_enum[], array['ryba', 'warzywa', 'piekarnik', 'jednoblachowe']);

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
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Kotlety z indyka z puree z kalafiora', null, '[{"step":1,"description":"Zmieszaj mielony indyk z jajkiem, czosnkiem, solą."},{"step":2,"description":"Uformuj kotlety i smaż na patelni."},{"step":3,"description":"Ugotuj kalafior i zmiksuj z masłem i śmietaną."},{"step":4,"description":"Podawaj kotlety z puree."}]'::jsonb, array['lunch']::public.meal_type_enum[], array['indyk', 'kotlety', 'kalafior', 'puree']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Kotlety z indyka z puree z kalafiora'), (select id from public.ingredients where name = 'Indyk - pierś (bez skóry)'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Kotlety z indyka z puree z kalafiora'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 50, 'g', true, 1),
((select id from public.recipes where name = 'Kotlety z indyka z puree z kalafiora'), (select id from public.ingredients where name = 'Czosnek (ząbek)'), 5, 'g', false, 1),
((select id from public.recipes where name = 'Kotlety z indyka z puree z kalafiora'), (select id from public.ingredients where name = 'Kalafior'), 200, 'g', true, 3),
((select id from public.recipes where name = 'Kotlety z indyka z puree z kalafiora'), (select id from public.ingredients where name = 'Masło'), 20, 'g', false, 3),
((select id from public.recipes where name = 'Kotlety z indyka z puree z kalafiora'), (select id from public.ingredients where name = 'Śmietana 30%'), 30, 'ml', true, 3),
((select id from public.recipes where name = 'Kotlety z indyka z puree z kalafiora'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 2),
((select id from public.recipes where name = 'Kotlety z indyka z puree z kalafiora'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1);

-- Obiad 7: Sałatka z tuńczyka i jajkiem
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Sałatka z tuńczyka i jajkiem', null, '[{"step":1,"description":"Ugotuj jajka na twardo."},{"step":2,"description":"Wymieszaj sałatę rzymską, tuńczyka, ogórka, pomidorki."},{"step":3,"description":"Dodaj pokrojone jajka."},{"step":4,"description":"Skrop oliwą i sokiem z cytryny."}]'::jsonb, array['lunch']::public.meal_type_enum[], array['sałatka', 'tuńczyk', 'jajka', 'na-zimno']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Sałatka z tuńczyka i jajkiem'), (select id from public.ingredients where name = 'Tuńczyk w sosie własnym'), 120, 'g', true, 2),
((select id from public.recipes where name = 'Sałatka z tuńczyka i jajkiem'), (select id from public.ingredients where name = 'Jajko kurze (całe)'), 120, 'g', true, 1),
((select id from public.recipes where name = 'Sałatka z tuńczyka i jajkiem'), (select id from public.ingredients where name = 'Sałata rzymska'), 100, 'g', true, 2),
((select id from public.recipes where name = 'Sałatka z tuńczyka i jajkiem'), (select id from public.ingredients where name = 'Ogórek'), 80, 'g', true, 2),
((select id from public.recipes where name = 'Sałatka z tuńczyka i jajkiem'), (select id from public.ingredients where name = 'Pomidory koktajlowe'), 80, 'g', true, 2),
((select id from public.recipes where name = 'Sałatka z tuńczyka i jajkiem'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 15, 'ml', false, 4),
((select id from public.recipes where name = 'Sałatka z tuńczyka i jajkiem'), (select id from public.ingredients where name = 'Cytryna (sok)'), 10, 'ml', false, 4);

-- Obiad 8: Udka z kurczaka pieczone z ziołami
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Udka z kurczaka pieczone z ziołami', null, '[{"step":1,"description":"Przypraw udka solą, pieprzem, rozmarynem, tymiankiem."},{"step":2,"description":"Ułóż w naczyniu żaroodpornym z czosnkiem."},{"step":3,"description":"Piecz 40 minut w 200°C."},{"step":4,"description":"Podawaj ze smażonym szpinakiem."}]'::jsonb, array['lunch']::public.meal_type_enum[], array['kurczak', 'piekarnik', 'zioła', 'soczysty']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Udka z kurczaka pieczone z ziołami'), (select id from public.ingredients where name = 'Kurczak - udko (ze skórą)'), 250, 'g', true, 1),
((select id from public.recipes where name = 'Udka z kurczaka pieczone z ziołami'), (select id from public.ingredients where name = 'Rozmaryn (świeży)'), 5, 'g', false, 1),
((select id from public.recipes where name = 'Udka z kurczaka pieczone z ziołami'), (select id from public.ingredients where name = 'Tymianek (świeży)'), 5, 'g', false, 1),
((select id from public.recipes where name = 'Udka z kurczaka pieczone z ziołami'), (select id from public.ingredients where name = 'Czosnek (ząbek)'), 15, 'g', false, 2),
((select id from public.recipes where name = 'Udka z kurczaka pieczone z ziołami'), (select id from public.ingredients where name = 'Szpinak (świeży)'), 100, 'g', true, 4),
((select id from public.recipes where name = 'Udka z kurczaka pieczone z ziołami'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 2),
((select id from public.recipes where name = 'Udka z kurczaka pieczone z ziołami'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Udka z kurczaka pieczone z ziołami'), (select id from public.ingredients where name = 'Pieprz czarny'), 1, 'g', false, 1);

-- Obiad 9: Krewetki w czosnku z cukinią
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Krewetki w czosnku z cukinią', null, '[{"step":1,"description":"Podsmaż czosnek na oliwie."},{"step":2,"description":"Dodaj krewetki i smaż 2-3 minuty."},{"step":3,"description":"Dodaj cukinię pokrojoną w spirale (zoodles)."},{"step":4,"description":"Skrop sokiem z limonki i posyp kolendrą."}]'::jsonb, array['lunch']::public.meal_type_enum[], array['krewetki', 'czosnek', 'cukinia', 'szybkie']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Krewetki w czosnku z cukinią'), (select id from public.ingredients where name = 'Krewetki'), 180, 'g', true, 2),
((select id from public.recipes where name = 'Krewetki w czosnku z cukinią'), (select id from public.ingredients where name = 'Cukinia'), 200, 'g', true, 3),
((select id from public.recipes where name = 'Krewetki w czosnku z cukinią'), (select id from public.ingredients where name = 'Czosnek (ząbek)'), 15, 'g', false, 1),
((select id from public.recipes where name = 'Krewetki w czosnku z cukinią'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 15, 'ml', false, 1),
((select id from public.recipes where name = 'Krewetki w czosnku z cukinią'), (select id from public.ingredients where name = 'Limonka (sok)'), 15, 'ml', false, 4),
((select id from public.recipes where name = 'Krewetki w czosnku z cukinią'), (select id from public.ingredients where name = 'Kolendra (świeża)'), 10, 'g', false, 4);

-- Obiad 10: Schab wieprzowy z kapustą
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Schab wieprzowy z kapustą', null, '[{"step":1,"description":"Przypraw schab solą, pieprzem, majerankiem."},{"step":2,"description":"Usmaż na patelni do zrumienienia."},{"step":3,"description":"Podsmaż pokrojoną kapustę z cebulą."},{"step":4,"description":"Dodaj kminek."},{"step":5,"description":"Podawaj schab z kapustą."}]'::jsonb, array['lunch']::public.meal_type_enum[], array['wieprzowina', 'schab', 'kapusta', 'polskie']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Schab wieprzowy z kapustą'), (select id from public.ingredients where name = 'Wieprzowina - schab'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Schab wieprzowy z kapustą'), (select id from public.ingredients where name = 'Kapusta biała'), 150, 'g', true, 3),
((select id from public.recipes where name = 'Schab wieprzowy z kapustą'), (select id from public.ingredients where name = 'Cebula biała'), 60, 'g', true, 3),
((select id from public.recipes where name = 'Schab wieprzowy z kapustą'), (select id from public.ingredients where name = 'Majeranek (suszony)'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Schab wieprzowy z kapustą'), (select id from public.ingredients where name = 'Kminek rzymski (kmin)'), 2, 'g', false, 4),
((select id from public.recipes where name = 'Schab wieprzowy z kapustą'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 2),
((select id from public.recipes where name = 'Schab wieprzowy z kapustą'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Schab wieprzowy z kapustą'), (select id from public.ingredients where name = 'Pieprz czarny'), 1, 'g', false, 1);

-- =====================================================================
-- KOLACJE (DINNERS) - 10 przepisów
-- =====================================================================

-- Kolacja 1: Pieczony łosoś z salsą z awokado
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Pieczony łosoś z salsą z awokado', null, '[{"step":1,"description":"Rozgrzej piekarnik do 200°C."},{"step":2,"description":"Przypraw łososia solą i pieprzem. Ułóż na blasze wyłożonej papierem do pieczenia."},{"step":3,"description":"Piecz łososia przez 12-15 minut."},{"step":4,"description":"Przygotuj salsę: pokrój awokado w kostkę, pomidora, dodaj sok z cytryny, sól i pieprz."},{"step":5,"description":"Podawaj łososia z salsą z awokado i rukolą."}]'::jsonb, array['dinner']::public.meal_type_enum[], array['ryba', 'omega3', 'zdrowe-tłuszcze', 'piekarnik']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Pieczony łosoś z salsą z awokado'), (select id from public.ingredients where name = 'Łosoś (świeży)'), 180, 'g', true, 2),
((select id from public.recipes where name = 'Pieczony łosoś z salsą z awokado'), (select id from public.ingredients where name = 'Awokado'), 100, 'g', true, 4),
((select id from public.recipes where name = 'Pieczony łosoś z salsą z awokado'), (select id from public.ingredients where name = 'Pomidor'), 80, 'g', true, 4),
((select id from public.recipes where name = 'Pieczony łosoś z salsą z awokado'), (select id from public.ingredients where name = 'Rukola'), 50, 'g', true, 5),
((select id from public.recipes where name = 'Pieczony łosoś z salsą z awokado'), (select id from public.ingredients where name = 'Cytryna (sok)'), 15, 'ml', false, 4),
((select id from public.recipes where name = 'Pieczony łosoś z salsą z awokado'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 2),
((select id from public.recipes where name = 'Pieczony łosoś z salsą z awokado'), (select id from public.ingredients where name = 'Pieprz czarny'), 1, 'g', false, 2);

-- Kolacja 2: Pierś z indyka w sosie grzybowym
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Pierś z indyka w sosie grzybowym', null, '[{"step":1,"description":"Pokrój pierś z indyka w filety."},{"step":2,"description":"Usmaż na maśle do zrumienienia."},{"step":3,"description":"Podsmaż pieczarki i czosnek."},{"step":4,"description":"Dodaj śmietanę 18%, tymianek."},{"step":5,"description":"Duś 10 minut i podawaj z brokułami."}]'::jsonb, array['dinner']::public.meal_type_enum[], array['indyk', 'grzyby', 'sos', 'kremowe']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Pierś z indyka w sosie grzybowym'), (select id from public.ingredients where name = 'Indyk - pierś (bez skóry)'), 200, 'g', true, 1),
((select id from public.recipes where name = 'Pierś z indyka w sosie grzybowym'), (select id from public.ingredients where name = 'Pieczarki'), 120, 'g', true, 3),
((select id from public.recipes where name = 'Pierś z indyka w sosie grzybowym'), (select id from public.ingredients where name = 'Śmietana 18%'), 100, 'ml', true, 4),
((select id from public.recipes where name = 'Pierś z indyka w sosie grzybowym'), (select id from public.ingredients where name = 'Masło'), 15, 'g', false, 2),
((select id from public.recipes where name = 'Pierś z indyka w sosie grzybowym'), (select id from public.ingredients where name = 'Czosnek (ząbek)'), 10, 'g', false, 3),
((select id from public.recipes where name = 'Pierś z indyka w sosie grzybowym'), (select id from public.ingredients where name = 'Tymianek (świeży)'), 3, 'g', false, 4),
((select id from public.recipes where name = 'Pierś z indyka w sosie grzybowym'), (select id from public.ingredients where name = 'Brokuły'), 150, 'g', true, 5),
((select id from public.recipes where name = 'Pierś z indyka w sosie grzybowym'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1);

-- Kolacja 3: Stek z polędwicy z masłem ziołowym
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Stek z polędwicy z masłem ziołowym', null, '[{"step":1,"description":"Wymieszaj masło z pietruszką, rozmarynem, czosnkiem."},{"step":2,"description":"Przypraw stek solą i pieprzem."},{"step":3,"description":"Grilluj po 3-4 minuty z każdej strony."},{"step":4,"description":"Nałóż masło ziołowe na gorący stek."},{"step":5,"description":"Podawaj ze smażonymi szparagami."}]'::jsonb, array['dinner']::public.meal_type_enum[], array['wołowina', 'stek', 'masło-ziołowe', 'wykwintne']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Stek z polędwicy z masłem ziołowym'), (select id from public.ingredients where name = 'Wołowina - polędwica (tenderloin)'), 200, 'g', true, 2),
((select id from public.recipes where name = 'Stek z polędwicy z masłem ziołowym'), (select id from public.ingredients where name = 'Masło'), 30, 'g', false, 1),
((select id from public.recipes where name = 'Stek z polędwicy z masłem ziołowym'), (select id from public.ingredients where name = 'Pietruszka (świeża)'), 10, 'g', false, 1),
((select id from public.recipes where name = 'Stek z polędwicy z masłem ziołowym'), (select id from public.ingredients where name = 'Rozmaryn (świeży)'), 3, 'g', false, 1),
((select id from public.recipes where name = 'Stek z polędwicy z masłem ziołowym'), (select id from public.ingredients where name = 'Czosnek (ząbek)'), 5, 'g', false, 1),
((select id from public.recipes where name = 'Stek z polędwicy z masłem ziołowym'), (select id from public.ingredients where name = 'Szparagi'), 150, 'g', true, 5),
((select id from public.recipes where name = 'Stek z polędwicy z masłem ziołowym'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 2),
((select id from public.recipes where name = 'Stek z polędwicy z masłem ziołowym'), (select id from public.ingredients where name = 'Pieprz czarny'), 1, 'g', false, 2);

-- Kolacja 4: Kurczak pieczony z cytryną
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Kurczak pieczony z cytryną', null, '[{"step":1,"description":"Nadzień kurczaka plastrami cytryny i czosnkiem."},{"step":2,"description":"Przypraw solą, pieprzem, tymiankiem."},{"step":3,"description":"Piecz 50 minut w 190°C."},{"step":4,"description":"Podawaj z pieczoną papryką i cukinią."}]'::jsonb, array['dinner']::public.meal_type_enum[], array['kurczak', 'cytryna', 'piekarnik', 'aromatyczne']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Kurczak - pierś (bez skóry)'), 250, 'g', true, 1),
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Cytryna (sok)'), 30, 'ml', false, 1),
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Czosnek (ząbek)'), 15, 'g', false, 1),
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Tymianek (świeży)'), 5, 'g', false, 2),
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Papryka czerwona'), 100, 'g', true, 4),
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Cukinia'), 120, 'g', true, 4),
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 3),
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 2),
((select id from public.recipes where name = 'Kurczak pieczony z cytryną'), (select id from public.ingredients where name = 'Pieprz czarny'), 1, 'g', false, 2);

-- Kolacja 5: Dorsz z pesto bazyliowym
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Dorsz z pesto bazyliowym', null, '[{"step":1,"description":"Zmiksuj bazylię, parmezan, orzechy piniowe, oliwę, czosnek."},{"step":2,"description":"Przypraw dorsza solą."},{"step":3,"description":"Smaż po 4 minuty z każdej strony."},{"step":4,"description":"Podawaj z pesto i sałatką z rukoli."}]'::jsonb, array['dinner']::public.meal_type_enum[], array['dorsz', 'pesto', 'bazylia', 'włoskie']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Dorsz z pesto bazyliowym'), (select id from public.ingredients where name = 'Dorsz'), 180, 'g', true, 2),
((select id from public.recipes where name = 'Dorsz z pesto bazyliowym'), (select id from public.ingredients where name = 'Bazylia (świeża)'), 30, 'g', false, 1),
((select id from public.recipes where name = 'Dorsz z pesto bazyliowym'), (select id from public.ingredients where name = 'Ser parmezan'), 30, 'g', false, 1),
((select id from public.recipes where name = 'Dorsz z pesto bazyliowym'), (select id from public.ingredients where name = 'Orzeszki piniowe'), 20, 'g', false, 1),
((select id from public.recipes where name = 'Dorsz z pesto bazyliowym'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 40, 'ml', false, 1),
((select id from public.recipes where name = 'Dorsz z pesto bazyliowym'), (select id from public.ingredients where name = 'Czosnek (ząbek)'), 5, 'g', false, 1),
((select id from public.recipes where name = 'Dorsz z pesto bazyliowym'), (select id from public.ingredients where name = 'Rukola'), 80, 'g', true, 4),
((select id from public.recipes where name = 'Dorsz z pesto bazyliowym'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 2);

-- Kolacja 6: Kotlety jagnięce (baranina) z miętą
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Kotlety z baraniny z sosem miętowym', null, '[{"step":1,"description":"Przypraw kotlety z baraniny solą, pieprzem, miętą."},{"step":2,"description":"Grilluj po 4 minuty z każdej strony."},{"step":3,"description":"Przygotuj sos miętowy: mięta, jogurt grecki, czosnek."},{"step":4,"description":"Podawaj kotlety z sosem i rukolą."}]'::jsonb, array['dinner']::public.meal_type_enum[], array['baranina', 'mięta', 'grill', 'orientalne']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Kotlety z baraniny z sosem miętowym'), (select id from public.ingredients where name = 'Baranina - comber'), 220, 'g', true, 1),
((select id from public.recipes where name = 'Kotlety z baraniny z sosem miętowym'), (select id from public.ingredients where name = 'Mięta (świeża)'), 15, 'g', false, 1),
((select id from public.recipes where name = 'Kotlety z baraniny z sosem miętowym'), (select id from public.ingredients where name = 'Jogurt grecki naturalny (pełnotłusty)'), 80, 'g', true, 3),
((select id from public.recipes where name = 'Kotlety z baraniny z sosem miętowym'), (select id from public.ingredients where name = 'Czosnek (ząbek)'), 5, 'g', false, 3),
((select id from public.recipes where name = 'Kotlety z baraniny z sosem miętowym'), (select id from public.ingredients where name = 'Rukola'), 60, 'g', true, 4),
((select id from public.recipes where name = 'Kotlety z baraniny z sosem miętowym'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Kotlety z baraniny z sosem miętowym'), (select id from public.ingredients where name = 'Pieprz czarny'), 1, 'g', false, 1);

-- Kolacja 7: Krewetki w maśle czosnkowym
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Krewetki w maśle czosnkowym', null, '[{"step":1,"description":"Rozpuść masło i podsmaż czosnek."},{"step":2,"description":"Dodaj krewetki i smaż 3 minuty."},{"step":3,"description":"Skrop sokiem z cytryny."},{"step":4,"description":"Posyp pietruszką."},{"step":5,"description":"Podawaj z cukinią spiralną."}]'::jsonb, array['dinner']::public.meal_type_enum[], array['krewetki', 'czosnek', 'masło', 'szybkie']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Krewetki w maśle czosnkowym'), (select id from public.ingredients where name = 'Krewetki'), 200, 'g', true, 2),
((select id from public.recipes where name = 'Krewetki w maśle czosnkowym'), (select id from public.ingredients where name = 'Masło'), 30, 'g', false, 1),
((select id from public.recipes where name = 'Krewetki w maśle czosnkowym'), (select id from public.ingredients where name = 'Czosnek (ząbek)'), 15, 'g', false, 1),
((select id from public.recipes where name = 'Krewetki w maśle czosnkowym'), (select id from public.ingredients where name = 'Cytryna (sok)'), 15, 'ml', false, 3),
((select id from public.recipes where name = 'Krewetki w maśle czosnkowym'), (select id from public.ingredients where name = 'Pietruszka (świeża)'), 10, 'g', false, 4),
((select id from public.recipes where name = 'Krewetki w maśle czosnkowym'), (select id from public.ingredients where name = 'Cukinia'), 200, 'g', true, 5);

-- Kolacja 8: Gulasz wieprzowy po węgiersku
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Gulasz wieprzowy po węgiersku', null, '[{"step":1,"description":"Pokrój karkówkę w kostkę."},{"step":2,"description":"Podsmaż z cebulą."},{"step":3,"description":"Dodaj paprykę słodką, kminek, czosnek, bulion."},{"step":4,"description":"Duś 1,5 godziny."},{"step":5,"description":"Zagęść śmietaną."}]'::jsonb, array['dinner']::public.meal_type_enum[], array['wieprzowina', 'gulasz', 'papryka', 'węgierskie']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Gulasz wieprzowy po węgiersku'), (select id from public.ingredients where name = 'Wieprzowina - karkówka'), 220, 'g', true, 1),
((select id from public.recipes where name = 'Gulasz wieprzowy po węgiersku'), (select id from public.ingredients where name = 'Cebula biała'), 100, 'g', true, 2),
((select id from public.recipes where name = 'Gulasz wieprzowy po węgiersku'), (select id from public.ingredients where name = 'Papryka słodka'), 8, 'g', false, 3),
((select id from public.recipes where name = 'Gulasz wieprzowy po węgiersku'), (select id from public.ingredients where name = 'Kminek rzymski (kmin)'), 2, 'g', false, 3),
((select id from public.recipes where name = 'Gulasz wieprzowy po węgiersku'), (select id from public.ingredients where name = 'Czosnek (ząbek)'), 10, 'g', false, 3),
((select id from public.recipes where name = 'Gulasz wieprzowy po węgiersku'), (select id from public.ingredients where name = 'Bulion drobiowy (kostka)'), 10, 'g', false, 3),
((select id from public.recipes where name = 'Gulasz wieprzowy po węgiersku'), (select id from public.ingredients where name = 'Śmietana 30%'), 50, 'ml', true, 5),
((select id from public.recipes where name = 'Gulasz wieprzowy po węgiersku'), (select id from public.ingredients where name = 'Oliwa z oliwek extra virgin'), 10, 'ml', false, 2);

-- Kolacja 9: Łosoś teriyaki z bok choy
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Łosoś teriyaki z bok choy', null, '[{"step":1,"description":"Zamarynuj łososia w sosie teriyaki (sos sojowy, erytrytol, imbir, czosnek)."},{"step":2,"description":"Smaż po 4 minuty z każdej strony."},{"step":3,"description":"Podsmaż bok choy na woku."},{"step":4,"description":"Podawaj łososia z bok choy i posyp sezamem."}]'::jsonb, array['dinner']::public.meal_type_enum[], array['łosoś', 'teriyaki', 'azjatyckie', 'bok-choy']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Łosoś teriyaki z bok choy'), (select id from public.ingredients where name = 'Łosoś (świeży)'), 180, 'g', true, 1),
((select id from public.recipes where name = 'Łosoś teriyaki z bok choy'), (select id from public.ingredients where name = 'Bok choy (kapusta chińska)'), 120, 'g', true, 3),
((select id from public.recipes where name = 'Łosoś teriyaki z bok choy'), (select id from public.ingredients where name = 'Sos sojowy'), 30, 'ml', false, 1),
((select id from public.recipes where name = 'Łosoś teriyaki z bok choy'), (select id from public.ingredients where name = 'Erytrytol'), 10, 'g', false, 1),
((select id from public.recipes where name = 'Łosoś teriyaki z bok choy'), (select id from public.ingredients where name = 'Imbir (świeży)'), 8, 'g', false, 1),
((select id from public.recipes where name = 'Łosoś teriyaki z bok choy'), (select id from public.ingredients where name = 'Czosnek (ząbek)'), 5, 'g', false, 1),
((select id from public.recipes where name = 'Łosoś teriyaki z bok choy'), (select id from public.ingredients where name = 'Nasiona sezamu'), 5, 'g', false, 4),
((select id from public.recipes where name = 'Łosoś teriyaki z bok choy'), (select id from public.ingredients where name = 'Olej sezamowy'), 5, 'ml', false, 3);

-- Kolacja 10: Sałatka cezar z kurczakiem
insert into public.recipes (name, image_url, instructions, meal_types, tags) values
('Sałatka cezar z kurczakiem', null, '[{"step":1,"description":"Grilluj kurczaka przyprawionego solą i pieprzem."},{"step":2,"description":"Przygotuj sos: majonez, parmezan, czosnek, sok z cytryny."},{"step":3,"description":"Wymieszaj sałatę rzymską z sosem."},{"step":4,"description":"Dodaj pokrojony kurczak i parmezan."}]'::jsonb, array['dinner']::public.meal_type_enum[], array['sałatka', 'cezar', 'kurczak', 'klasyka']);

insert into public.recipe_ingredients (recipe_id, ingredient_id, base_amount, unit, is_scalable, step_number) values
((select id from public.recipes where name = 'Sałatka cezar z kurczakiem'), (select id from public.ingredients where name = 'Kurczak - pierś (bez skóry)'), 180, 'g', true, 1),
((select id from public.recipes where name = 'Sałatka cezar z kurczakiem'), (select id from public.ingredients where name = 'Sałata rzymska'), 150, 'g', true, 3),
((select id from public.recipes where name = 'Sałatka cezar z kurczakiem'), (select id from public.ingredients where name = 'Majonez'), 50, 'g', true, 2),
((select id from public.recipes where name = 'Sałatka cezar z kurczakiem'), (select id from public.ingredients where name = 'Ser parmezan'), 40, 'g', true, 2),
((select id from public.recipes where name = 'Sałatka cezar z kurczakiem'), (select id from public.ingredients where name = 'Czosnek (ząbek)'), 5, 'g', false, 2),
((select id from public.recipes where name = 'Sałatka cezar z kurczakiem'), (select id from public.ingredients where name = 'Cytryna (sok)'), 10, 'ml', false, 2),
((select id from public.recipes where name = 'Sałatka cezar z kurczakiem'), (select id from public.ingredients where name = 'Sól'), 2, 'g', false, 1),
((select id from public.recipes where name = 'Sałatka cezar z kurczakiem'), (select id from public.ingredients where name = 'Pieprz czarny'), 1, 'g', false, 1);

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

select 'Total recipes:' as info, count(*)::text as count from public.recipes;
select 'Breakfasts:' as info, count(*)::text as count from public.recipes where 'breakfast' = ANY(meal_types);
select 'Lunches:' as info, count(*)::text as count from public.recipes where 'lunch' = ANY(meal_types);
select 'Dinners:' as info, count(*)::text as count from public.recipes where 'dinner' = ANY(meal_types);
select 'Recipe ingredients:' as info, count(*)::text as count from public.recipe_ingredients;

-- Verify denormalized nutrition (should be auto-calculated by trigger)
select name, total_calories, total_protein_g, total_carbs_g, total_fats_g
from public.recipes
where total_calories is not null
order by name
limit 10;

-- =====================================================================
-- RECIPES SEED DATA COMPLETE
-- =====================================================================
-- Total: 30 recipes (10 breakfasts, 10 lunches, 10 dinners)
-- All ingredients verified against seed_ingredients.sql
-- Denormalized nutrition values calculated automatically by triggers
-- =====================================================================
