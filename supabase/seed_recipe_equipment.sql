-- =====================================================================
-- Seed Data for LowCarbPlaner - RECIPE EQUIPMENT
-- Description: Equipment assignments for existing recipes
-- =====================================================================
-- IMPORTANT: Run after seed_recipes_public.sql and 20251223120000_add_equipment_tables.sql migration!
-- =====================================================================

-- Helper function to get equipment_id by name
-- (Uses existing equipment from migration)

-- =====================================================================
-- ŚNIADANIA (BREAKFASTS) - Equipment
-- =====================================================================

-- Omlet ze szpinakiem i fetą: patelnia
insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Omlet ze szpinakiem i fetą'),
  (select id from public.equipment where name = 'Patelnia'),
  1,
  'średnia, nieprzywierająca'
where exists (select 1 from public.recipes where name = 'Omlet ze szpinakiem i fetą');

-- Jajecznica z łososiem wędzonym i awokado: patelnia
insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Jajecznica z łososiem wędzonym i awokado'),
  (select id from public.equipment where name = 'Patelnia'),
  1,
  'nieprzywierająca'
where exists (select 1 from public.recipes where name = 'Jajecznica z łososiem wędzonym i awokado');

-- Shakshuka z pomidorami i papryką: patelnia głęboka
insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Shakshuka z pomidorami i papryką'),
  (select id from public.equipment where name = 'Patelnia'),
  1,
  'głęboka z pokrywką'
where exists (select 1 from public.recipes where name = 'Shakshuka z pomidorami i papryką');

-- Jogurt grecki z orzechami i jagodami: miska
insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Jogurt grecki z orzechami i jagodami'),
  (select id from public.equipment where name = 'Miska'),
  1,
  null
where exists (select 1 from public.recipes where name = 'Jogurt grecki z orzechami i jagodami');

-- Placki z cukinii: patelnia + tarka (deska do krojenia jako substytut tarki)
insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Placki z cukinii z serkiem wiejskim'),
  (select id from public.equipment where name = 'Patelnia'),
  1,
  'nieprzywierająca'
where exists (select 1 from public.recipes where name = 'Placki z cukinii z serkiem wiejskim');

-- Frittata z brokułami i serem cheddar: patelnia żaroodporna + piekarnik
insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'),
  (select id from public.equipment where name = 'Patelnia'),
  1,
  'żaroodporna'
where exists (select 1 from public.recipes where name = 'Frittata z brokułami i serem cheddar');

insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'),
  (select id from public.equipment where name = 'Piekarnik'),
  1,
  '180°C'
where exists (select 1 from public.recipes where name = 'Frittata z brokułami i serem cheddar');

insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Frittata z brokułami i serem cheddar'),
  (select id from public.equipment where name = 'Garnek'),
  1,
  'do blanszowania brokułów'
where exists (select 1 from public.recipes where name = 'Frittata z brokułami i serem cheddar');

-- Chia pudding kokosowy: miska + lodówka (brak w equipment, pomijamy)
insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Chia pudding kokosowy z borówkami'),
  (select id from public.equipment where name = 'Miska'),
  1,
  null
where exists (select 1 from public.recipes where name = 'Chia pudding kokosowy z borówkami');

-- =====================================================================
-- OBIADY (LUNCHES) - Equipment - wybrane przepisy
-- =====================================================================

-- Sałatka z kurczakiem i awokado: patelnia grillowa + miska
insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Sałatka z grillowanym kurczakiem i awokado'),
  (select id from public.equipment where name = 'Patelnia grillowa'),
  1,
  null
where exists (select 1 from public.recipes where name = 'Sałatka z grillowanym kurczakiem i awokado');

insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Sałatka z grillowanym kurczakiem i awokado'),
  (select id from public.equipment where name = 'Miska'),
  1,
  'duża do mieszania sałatki'
where exists (select 1 from public.recipes where name = 'Sałatka z grillowanym kurczakiem i awokado');

-- Zupa krem z brokułów: garnek + blender
insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Zupa krem z brokułów'),
  (select id from public.equipment where name = 'Garnek'),
  1,
  'duży'
where exists (select 1 from public.recipes where name = 'Zupa krem z brokułów');

insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Zupa krem z brokułów'),
  (select id from public.equipment where name = 'Blender ręczny'),
  1,
  null
where exists (select 1 from public.recipes where name = 'Zupa krem z brokułów');

-- Kotlety z cukinii: patelnia
insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Kotlety z cukinii w parmezanie'),
  (select id from public.equipment where name = 'Patelnia'),
  1,
  'nieprzywierająca'
where exists (select 1 from public.recipes where name = 'Kotlety z cukinii w parmezanie');

-- Pieczony łosoś z warzywami: piekarnik + blacha
insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Pieczony łosoś z warzywami'),
  (select id from public.equipment where name = 'Piekarnik'),
  1,
  '200°C'
where exists (select 1 from public.recipes where name = 'Pieczony łosoś z warzywami');

insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Pieczony łosoś z warzywami'),
  (select id from public.equipment where name = 'Blacha do pieczenia'),
  1,
  'wyłożona papierem'
where exists (select 1 from public.recipes where name = 'Pieczony łosoś z warzywami');

-- =====================================================================
-- KOLACJE (DINNERS) - Equipment - wybrane przepisy
-- =====================================================================

-- Stek wołowy z masłem czosnkowym: patelnia żeliwna
insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Stek wołowy z masłem czosnkowym'),
  (select id from public.equipment where name = 'Patelnia'),
  1,
  'żeliwna, dobrze rozgrzana'
where exists (select 1 from public.recipes where name = 'Stek wołowy z masłem czosnkowym');

-- Kurczak w sosie serowym: patelnia + garnek
insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Kurczak w sosie serowym z brokułami'),
  (select id from public.equipment where name = 'Patelnia'),
  1,
  'głęboka'
where exists (select 1 from public.recipes where name = 'Kurczak w sosie serowym z brokułami');

insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Kurczak w sosie serowym z brokułami'),
  (select id from public.equipment where name = 'Garnek'),
  1,
  'do gotowania brokułów'
where exists (select 1 from public.recipes where name = 'Kurczak w sosie serowym z brokułami');

-- Krewetki z cukinią: wok
insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Krewetki z cukinią w maśle czosnkowym'),
  (select id from public.equipment where name = 'Wok'),
  1,
  null
where exists (select 1 from public.recipes where name = 'Krewetki z cukinią w maśle czosnkowym');

-- Pieczone udka z kurczaka: piekarnik + brytfanna
insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Pieczone udka z kurczaka z rozmarynem'),
  (select id from public.equipment where name = 'Piekarnik'),
  1,
  '180°C'
where exists (select 1 from public.recipes where name = 'Pieczone udka z kurczaka z rozmarynem');

insert into public.recipe_equipment (recipe_id, equipment_id, quantity, notes)
select
  (select id from public.recipes where name = 'Pieczone udka z kurczaka z rozmarynem'),
  (select id from public.equipment where name = 'Brytfanna'),
  1,
  null
where exists (select 1 from public.recipes where name = 'Pieczone udka z kurczaka z rozmarynem');
