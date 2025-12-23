-- ============================================================
-- Migration: Add Equipment Tables
-- Description: Add kitchen equipment/utensils tracking for recipes
-- Tables Affected:
--   - equipment (new) - master data of kitchen equipment
--   - recipe_equipment (new) - many-to-many junction table
-- Special Notes:
--   - RLS enabled with authenticated read access
--   - equipment categorized by type (heating, cutting, mixing, etc.)
-- ============================================================

-- ============================================================
-- 1. Create equipment category enum
-- ============================================================
create type equipment_category_enum as enum (
  'heating',      -- urządzenia grzewcze: piekarnik, kuchenka, grill
  'mixing',       -- mieszanie: blender, mikser, robot kuchenny
  'cookware',     -- naczynia do gotowania: garnek, patelnia, wok, rondel
  'bakeware',     -- formy do pieczenia
  'cutting',      -- narzędzia do krojenia: deska, nóż
  'measuring',    -- narzędzia pomiarowe: waga, miarka
  'other'         -- inne
);

comment on type equipment_category_enum is 'Categories for kitchen equipment classification';

-- ============================================================
-- 2. Create equipment table
-- ============================================================
create table equipment (
  id serial primary key,
  name text not null unique,
  name_plural text, -- plural form for display (e.g., "patelnie" for "patelnia")
  category equipment_category_enum not null default 'other',
  icon_name text, -- optional icon identifier (e.g., "pan", "pot", "oven")
  created_at timestamptz not null default now()
);

comment on table equipment is 'Master data table for kitchen equipment and utensils';
comment on column equipment.name is 'Equipment name in Polish (singular form)';
comment on column equipment.name_plural is 'Equipment name in Polish (plural form)';
comment on column equipment.category is 'Equipment category for grouping';
comment on column equipment.icon_name is 'Icon identifier for UI display (optional)';

-- ============================================================
-- 3. Create recipe_equipment junction table
-- ============================================================
create table recipe_equipment (
  recipe_id integer not null references recipes(id) on delete cascade,
  equipment_id integer not null references equipment(id) on delete cascade,
  quantity integer not null default 1,
  notes text, -- optional notes (e.g., "średnia patelnia", "duży garnek")
  primary key (recipe_id, equipment_id)
);

comment on table recipe_equipment is 'Junction table linking recipes to required equipment';
comment on column recipe_equipment.quantity is 'Number of this equipment item needed (default 1)';
comment on column recipe_equipment.notes is 'Additional notes about equipment size or type';

-- ============================================================
-- 4. Create indexes for performance
-- ============================================================
create index idx_equipment_category on equipment(category);
create index idx_recipe_equipment_recipe_id on recipe_equipment(recipe_id);
create index idx_recipe_equipment_equipment_id on recipe_equipment(equipment_id);

-- ============================================================
-- 5. Enable RLS and create policies
-- ============================================================

-- Enable RLS on equipment
alter table equipment enable row level security;

-- Equipment: anyone can read (public master data)
create policy "Equipment readable by everyone"
  on equipment for select
  using (true);

-- Equipment: only service role can modify (admin only)
create policy "Equipment modifiable by service role only"
  on equipment for all
  using (auth.role() = 'service_role');

-- Enable RLS on recipe_equipment
alter table recipe_equipment enable row level security;

-- Recipe equipment: anyone can read
create policy "Recipe equipment readable by everyone"
  on recipe_equipment for select
  using (true);

-- Recipe equipment: only service role can modify
create policy "Recipe equipment modifiable by service role only"
  on recipe_equipment for all
  using (auth.role() = 'service_role');

-- ============================================================
-- 6. Insert initial equipment data
-- ============================================================
insert into equipment (name, name_plural, category, icon_name) values
  -- Cookware (naczynia do gotowania)
  ('Patelnia', 'Patelnie', 'cookware', 'pan'),
  ('Garnek', 'Garnki', 'cookware', 'pot'),
  ('Rondel', 'Rondle', 'cookware', 'saucepan'),
  ('Wok', 'Woki', 'cookware', 'wok'),
  ('Patelnia grillowa', 'Patelnie grillowe', 'cookware', 'grill-pan'),
  ('Brytfanna', 'Brytfanny', 'cookware', 'roasting-pan'),

  -- Heating devices (urządzenia grzewcze)
  ('Piekarnik', 'Piekarniki', 'heating', 'oven'),
  ('Grill elektryczny', 'Grille elektryczne', 'heating', 'electric-grill'),
  ('Frytkownica', 'Frytkownice', 'heating', 'air-fryer'),
  ('Parownik', 'Parowniki', 'heating', 'steamer'),
  ('Kuchenka', 'Kuchenki', 'heating', 'stove'),
  ('Opiekacz', 'Opiekacze', 'heating', 'toaster'),

  -- Mixing devices (urządzenia mieszające)
  ('Blender', 'Blendery', 'mixing', 'blender'),
  ('Blender ręczny', 'Blendery ręczne', 'mixing', 'hand-blender'),
  ('Mikser', 'Miksery', 'mixing', 'mixer'),
  ('Robot kuchenny', 'Roboty kuchenne', 'mixing', 'food-processor'),
  ('Thermomix', 'Thermomixy', 'mixing', 'thermomix'),

  -- Bakeware (formy do pieczenia)
  ('Forma do pieczenia', 'Formy do pieczenia', 'bakeware', 'baking-pan'),
  ('Forma na muffinki', 'Formy na muffinki', 'bakeware', 'muffin-tin'),
  ('Blacha do pieczenia', 'Blachy do pieczenia', 'bakeware', 'baking-sheet'),
  ('Tortownica', 'Tortownice', 'bakeware', 'cake-pan'),
  ('Forma silikonowa', 'Formy silikonowe', 'bakeware', 'silicone-mold'),

  -- Cutting tools (narzędzia do krojenia)
  ('Deska do krojenia', 'Deski do krojenia', 'cutting', 'cutting-board'),
  ('Nóż szefa kuchni', 'Noże szefa kuchni', 'cutting', 'chef-knife'),

  -- Measuring tools (narzędzia pomiarowe)
  ('Waga kuchenna', 'Wagi kuchenne', 'measuring', 'scale'),
  ('Miarka kuchenna', 'Miarki kuchenne', 'measuring', 'measuring-cup'),

  -- Other (inne)
  ('Miska', 'Miski', 'other', 'bowl'),
  ('Durszlak', 'Durszlaki', 'other', 'colander'),
  ('Sitko', 'Sitka', 'other', 'strainer'),
  ('Trzepaczka', 'Trzepaczki', 'other', 'whisk'),
  ('Łopatka', 'Łopatki', 'other', 'spatula'),
  ('Szczypce kuchenne', 'Szczypce kuchenne', 'other', 'tongs');
