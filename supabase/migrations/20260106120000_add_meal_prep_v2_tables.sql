-- ============================================================
-- Migration: Add Meal Prep v2.0 Tables
-- Description: Complete meal prep system with recursive recipes,
--              cooking sessions, timelines, and virtual pantry
-- Tables Affected:
--   - prep_action_categories (new) - Mise en Place categories
--   - recipe_instructions (new) - Detailed recipe steps
--   - recipe_components (new) - Recursive recipe composition
--   - cooking_sessions (new) - Cooking session management
--   - session_meals (new) - Meals in a session
--   - session_step_progress (new) - Step progress tracking
--   - session_adjustments (new) - Dynamic time adjustments
--   - user_inventory (new) - Virtual pantry
--   - equipment (extended) - Additional conflict columns
--   - planned_meals (extended) - source_meal_id for leftovers
-- Special Notes:
--   - RLS enabled on all user tables
--   - Cycle detection trigger for recipe_components
--   - All times in minutes, scaling factors as decimals
-- ============================================================

-- ============================================================
-- 1. Create ENUM types
-- ============================================================

-- Typ skalowania czasu
CREATE TYPE time_scaling_type AS ENUM (
  'linear',      -- czas rosnie proporcjonalnie (krojenie: 2x porcji = 2x czasu)
  'constant',    -- czas staly niezaleznie od porcji (pieczenie)
  'logarithmic'  -- czas rosnie wolniej niz liniowo (gotowanie wody)
);

COMMENT ON TYPE time_scaling_type IS 'Okresla jak czas kroku skaluje sie z liczba porcji';

-- Typ akcji instrukcji (rozszerzony)
CREATE TYPE instruction_action_type AS ENUM (
  'active',      -- wymaga aktywnej pracy (krojenie, mieszanie)
  'passive',     -- pasywne oczekiwanie (pieczenie, gotowanie)
  'prep',        -- przygotowanie skladnikow (Mise en Place)
  'assembly',    -- skladanie koncowe
  'checkpoint'   -- punkt kontrolny (sprawdzenie temperatury)
);

COMMENT ON TYPE instruction_action_type IS 'Typ akcji w kroku instrukcji przepisu';

-- Typ checkpointu bezpieczenstwa
CREATE TYPE checkpoint_type AS ENUM (
  'temperature',    -- sprawdzenie temperatury (mieso 75C)
  'visual',         -- sprawdzenie wizualne (zloty kolor)
  'texture',        -- sprawdzenie tekstury (al dente)
  'safety',         -- checkpoint bezpieczenstwa ogolny
  'equipment_ready' -- sprzet gotowy do uzycia
);

COMMENT ON TYPE checkpoint_type IS 'Typ checkpointu bezpieczenstwa';

-- Kategoria konfliktow smakowych
CREATE TYPE flavor_conflict_category AS ENUM (
  'neutral',      -- brak wplywu na inne potrawy
  'fish',         -- intensywny zapach ryby
  'garlic_onion', -- intensywny czosnek/cebula
  'spicy',        -- ostre przyprawy
  'sweet',        -- slodkie aromaty
  'smoke'         -- wedzenie/grillowanie
);

COMMENT ON TYPE flavor_conflict_category IS 'Kategoria konfliktow smakowych przy rownoczesnym gotowaniu';

-- Status sesji gotowania
CREATE TYPE cooking_session_status AS ENUM (
  'planned',
  'in_progress',
  'paused',
  'completed',
  'cancelled'
);

COMMENT ON TYPE cooking_session_status IS 'Status sesji gotowania';

-- Lokalizacja przechowywania
CREATE TYPE storage_location AS ENUM (
  'fridge',
  'freezer',
  'pantry',
  'counter'
);

COMMENT ON TYPE storage_location IS 'Lokalizacja przechowywania w wirtualnej spizarni';

-- ============================================================
-- 2. Create prep_action_categories table (Mise en Place)
-- ============================================================

CREATE TABLE prep_action_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_plural TEXT,
  description TEXT,
  icon_name TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE prep_action_categories IS 'Kategorie akcji przygotowawczych dla grupowania Mise en Place';
COMMENT ON COLUMN prep_action_categories.name IS 'Nazwa kategorii (liczba pojedyncza)';
COMMENT ON COLUMN prep_action_categories.icon_name IS 'Identyfikator ikony dla UI';
COMMENT ON COLUMN prep_action_categories.sort_order IS 'Kolejnosc wyswietlania';

-- Dane poczatkowe
INSERT INTO prep_action_categories (name, name_plural, description, icon_name, sort_order) VALUES
  ('Krojenie warzyw', 'Krojenie warzyw', 'Krojenie, szatkowanie, siekanie warzyw', 'knife', 1),
  ('Krojenie miesa', 'Krojenie miesa', 'Porcjowanie, krojenie miesa', 'meat', 2),
  ('Wazenie skladnikow', 'Wazenie skladnikow', 'Odmierzanie skladnikow suchych', 'scale', 3),
  ('Odmierzanie plynow', 'Odmierzanie plynow', 'Odmierzanie plynow i sosow', 'measuring-cup', 4),
  ('Przygotowanie przypraw', 'Przygotowanie przypraw', 'Mieszanie przypraw, marynaty', 'spices', 5),
  ('Rozmrazanie', 'Rozmrazanie', 'Rozmrazanie skladnikow', 'snowflake', 6),
  ('Mycie', 'Mycie', 'Mycie warzyw i owocow', 'water', 7),
  ('Ubijanie', 'Ubijanie', 'Ubijanie jaj, smietany', 'whisk', 8);

-- RLS
ALTER TABLE prep_action_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prep categories readable by everyone"
  ON prep_action_categories FOR SELECT USING (true);

CREATE POLICY "Prep categories modifiable by service role"
  ON prep_action_categories FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- 3. Create recipe_instructions table
-- ============================================================

CREATE TABLE recipe_instructions (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL,

  -- Timing (podstawowe)
  active_minutes INTEGER DEFAULT 0,
  passive_minutes INTEGER DEFAULT 0,

  -- Skalowanie czasowe
  time_scaling_type time_scaling_type DEFAULT 'linear',
  time_scaling_factor NUMERIC(3,2) DEFAULT 1.0,

  -- Typ akcji i rownoleglosc
  action_type instruction_action_type DEFAULT 'active',
  is_parallelizable BOOLEAN DEFAULT false,

  -- Sprzet
  equipment_ids INTEGER[] DEFAULT '{}',
  equipment_slot_count INTEGER DEFAULT 1,
  required_temperature_celsius INTEGER,

  -- Mise en Place
  prep_action_category_id INTEGER REFERENCES prep_action_categories(id),

  -- Checkpointy
  checkpoint_condition TEXT,
  checkpoint_type checkpoint_type,

  -- Wskazowki sensoryczne
  sensory_cues JSONB DEFAULT '{}',

  -- Punkty krytyczne
  is_critical_timing BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_recipe_step UNIQUE (recipe_id, step_number)
);

-- Indeksy
CREATE INDEX idx_recipe_instructions_recipe_id ON recipe_instructions(recipe_id);
CREATE INDEX idx_recipe_instructions_action_type ON recipe_instructions(action_type);
CREATE INDEX idx_recipe_instructions_prep_category ON recipe_instructions(prep_action_category_id);

-- RLS
ALTER TABLE recipe_instructions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipe instructions readable by everyone"
  ON recipe_instructions FOR SELECT USING (true);

CREATE POLICY "Recipe instructions modifiable by service role"
  ON recipe_instructions FOR ALL
  USING (auth.role() = 'service_role');

-- Komentarze
COMMENT ON TABLE recipe_instructions IS 'Szczegolowe kroki przepisu z czasami, sprzetem i checkpointami';
COMMENT ON COLUMN recipe_instructions.active_minutes IS 'Czas wymagajacy aktywnej pracy uzytkownika';
COMMENT ON COLUMN recipe_instructions.passive_minutes IS 'Czas pasywnego oczekiwania (pieczenie, gotowanie)';
COMMENT ON COLUMN recipe_instructions.time_scaling_type IS 'Jak czas skaluje sie z liczba porcji: linear/constant/logarithmic';
COMMENT ON COLUMN recipe_instructions.equipment_slot_count IS 'Ile slotow sprzetu zajmuje (np. 2 palniki)';
COMMENT ON COLUMN recipe_instructions.checkpoint_type IS 'Typ checkpointu bezpieczenstwa';
COMMENT ON COLUMN recipe_instructions.sensory_cues IS 'Wskazowki sensoryczne: {"visual": "zloty", "sound": "syczy", "smell": "aromat"}';
COMMENT ON COLUMN recipe_instructions.is_critical_timing IS 'Czy timing jest krytyczny (nie mozna przerwac)';

-- ============================================================
-- 4. Create recipe_components table (recursive recipes)
-- ============================================================

CREATE TABLE recipe_components (
  parent_recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  component_recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

  -- Ilosc skladnika-przepisu
  required_amount NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'g',

  -- Fallback na skladnik (jesli przepis nie jest dostepny)
  fallback_ingredient_id INTEGER REFERENCES ingredients(id),

  PRIMARY KEY (parent_recipe_id, component_recipe_id),

  -- Zabezpieczenie przed cyklami (podstawowe)
  CONSTRAINT no_self_reference CHECK (parent_recipe_id != component_recipe_id)
);

-- Indeksy
CREATE INDEX idx_recipe_components_parent ON recipe_components(parent_recipe_id);
CREATE INDEX idx_recipe_components_component ON recipe_components(component_recipe_id);

-- RLS
ALTER TABLE recipe_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipe components readable by everyone"
  ON recipe_components FOR SELECT USING (true);

CREATE POLICY "Recipe components modifiable by service role"
  ON recipe_components FOR ALL
  USING (auth.role() = 'service_role');

-- Komentarze
COMMENT ON TABLE recipe_components IS 'Rekurencyjna kompozycja przepisow - przepis moze uzywac innego przepisu jako skladnika';
COMMENT ON COLUMN recipe_components.required_amount IS 'Ilosc skladnika-przepisu potrzebna w przepisie nadrzednym';
COMMENT ON COLUMN recipe_components.fallback_ingredient_id IS 'Alternatywny skladnik jesli przepis komponentu niedostepny';

-- Funkcja sprawdzajaca cykle
CREATE OR REPLACE FUNCTION check_recipe_component_cycle()
RETURNS TRIGGER AS $$
DECLARE
  cycle_found BOOLEAN;
BEGIN
  -- Sprawdz czy nowy komponent nie tworzy cyklu
  WITH RECURSIVE component_tree AS (
    -- Bazowy przypadek: nowy komponent
    SELECT NEW.component_recipe_id AS recipe_id, 1 AS depth

    UNION ALL

    -- Rekurencja: komponenty komponentow
    SELECT rc.component_recipe_id, ct.depth + 1
    FROM component_tree ct
    JOIN recipe_components rc ON rc.parent_recipe_id = ct.recipe_id
    WHERE ct.depth < 10
  )
  SELECT EXISTS (
    SELECT 1 FROM component_tree WHERE recipe_id = NEW.parent_recipe_id
  ) INTO cycle_found;

  IF cycle_found THEN
    RAISE EXCEPTION 'Circular reference detected in recipe components';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_recipe_component_cycle
  BEFORE INSERT OR UPDATE ON recipe_components
  FOR EACH ROW
  EXECUTE FUNCTION check_recipe_component_cycle();

-- ============================================================
-- 5. Extend equipment table with conflict info
-- ============================================================

ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS max_slots INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_temperature_celsius INTEGER,
ADD COLUMN IF NOT EXISTS flavor_conflict_category flavor_conflict_category DEFAULT 'neutral';

COMMENT ON COLUMN equipment.max_slots IS 'Maksymalna liczba rownoczesnych operacji (np. 4 palniki)';
COMMENT ON COLUMN equipment.max_temperature_celsius IS 'Maksymalna temperatura urzadzenia (C)';
COMMENT ON COLUMN equipment.flavor_conflict_category IS 'Kategoria konfliktow smakowych';

-- Aktualizacja istniejacych danych
UPDATE equipment SET max_slots = 4, max_temperature_celsius = 300 WHERE name = 'Kuchenka';
UPDATE equipment SET max_slots = 1, max_temperature_celsius = 250 WHERE name = 'Piekarnik';
UPDATE equipment SET max_slots = 1 WHERE name IN ('Patelnia', 'Garnek', 'Rondel', 'Wok');
UPDATE equipment SET max_slots = 1 WHERE name IN ('Blender', 'Blender reczny', 'Mikser', 'Robot kuchenny');

-- ============================================================
-- 6. Create cooking_sessions table
-- ============================================================

CREATE TABLE cooking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Planowanie
  planned_date DATE NOT NULL,
  planned_start_time TIME,

  -- Timing
  estimated_total_minutes INTEGER,
  actual_start_at TIMESTAMPTZ,
  actual_end_at TIMESTAMPTZ,

  -- Status
  status cooking_session_status DEFAULT 'planned',
  current_step_index INTEGER DEFAULT 0,

  -- Notatki
  notes TEXT,

  -- Synchronizacja multi-device
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  active_device_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy
CREATE INDEX idx_cooking_sessions_user_id ON cooking_sessions(user_id);
CREATE INDEX idx_cooking_sessions_planned_date ON cooking_sessions(planned_date);
CREATE INDEX idx_cooking_sessions_status ON cooking_sessions(status);

-- RLS
ALTER TABLE cooking_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cooking sessions"
  ON cooking_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cooking sessions"
  ON cooking_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cooking sessions"
  ON cooking_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cooking sessions"
  ON cooking_sessions FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE cooking_sessions IS 'Sesje gotowania uzytkownika z wieloma przepisami';
COMMENT ON COLUMN cooking_sessions.active_device_id IS 'Identyfikator aktywnego urzadzenia dla multi-device sync';

-- ============================================================
-- 7. Create session_meals table
-- ============================================================

CREATE TABLE session_meals (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES cooking_sessions(id) ON DELETE CASCADE,
  planned_meal_id INTEGER NOT NULL REFERENCES planned_meals(id) ON DELETE CASCADE,

  is_source_meal BOOLEAN DEFAULT true,
  portions_to_cook INTEGER DEFAULT 1,
  cooking_order INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_session_meal UNIQUE (session_id, planned_meal_id)
);

-- Indeksy
CREATE INDEX idx_session_meals_session_id ON session_meals(session_id);
CREATE INDEX idx_session_meals_planned_meal_id ON session_meals(planned_meal_id);

-- RLS
ALTER TABLE session_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own session meals"
  ON session_meals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cooking_sessions cs
      WHERE cs.id = session_meals.session_id
      AND cs.user_id = auth.uid()
    )
  );

COMMENT ON TABLE session_meals IS 'Posieki w sesji gotowania';
COMMENT ON COLUMN session_meals.is_source_meal IS 'Czy to posilek zrodlowy (gotowany) czy leftover';
COMMENT ON COLUMN session_meals.portions_to_cook IS 'Ilosc porcji do przygotowania (batch cooking)';

-- ============================================================
-- 8. Create session_step_progress table
-- ============================================================

CREATE TABLE session_step_progress (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES cooking_sessions(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,

  -- Status
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Timer
  timer_started_at TIMESTAMPTZ,
  timer_duration_seconds INTEGER,
  timer_paused_at TIMESTAMPTZ,
  timer_remaining_seconds INTEGER,

  -- Notatki
  user_notes TEXT,

  CONSTRAINT unique_session_step UNIQUE (session_id, recipe_id, step_number)
);

-- Indeksy
CREATE INDEX idx_session_step_progress_session_id ON session_step_progress(session_id);
CREATE INDEX idx_session_step_progress_recipe_id ON session_step_progress(recipe_id);

-- RLS
ALTER TABLE session_step_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own step progress"
  ON session_step_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cooking_sessions cs
      WHERE cs.id = session_step_progress.session_id
      AND cs.user_id = auth.uid()
    )
  );

COMMENT ON TABLE session_step_progress IS 'Postep krokow w sesji gotowania';
COMMENT ON COLUMN session_step_progress.timer_remaining_seconds IS 'Pozostaly czas timera (dla pauzy)';

-- ============================================================
-- 9. Create session_adjustments table
-- ============================================================

CREATE TABLE session_adjustments (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES cooking_sessions(id) ON DELETE CASCADE,
  step_id INTEGER REFERENCES session_step_progress(id),

  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('time_add', 'time_subtract', 'skip', 'repeat')),
  adjustment_value INTEGER,
  reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy
CREATE INDEX idx_session_adjustments_session_id ON session_adjustments(session_id);
CREATE INDEX idx_session_adjustments_step_id ON session_adjustments(step_id);

-- RLS
ALTER TABLE session_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own adjustments"
  ON session_adjustments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cooking_sessions cs
      WHERE cs.id = session_adjustments.session_id
      AND cs.user_id = auth.uid()
    )
  );

COMMENT ON TABLE session_adjustments IS 'Dynamiczne korekty czasowe w sesji gotowania';
COMMENT ON COLUMN session_adjustments.adjustment_type IS 'Typ korekty: time_add, time_subtract, skip, repeat';
COMMENT ON COLUMN session_adjustments.adjustment_value IS 'Wartosc korekty w sekundach (dla time adjustments)';

-- ============================================================
-- 10. Create user_inventory table (virtual pantry)
-- ============================================================

CREATE TABLE user_inventory (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Typ pozycji
  item_type TEXT NOT NULL CHECK (item_type IN ('ingredient', 'component', 'meal')),

  -- Odniesienia (jedno z nich musi byc wypelnione)
  ingredient_id INTEGER REFERENCES ingredients(id),
  recipe_id INTEGER REFERENCES recipes(id),

  -- Ilosc
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'g',

  -- Przechowywanie
  storage_location storage_location DEFAULT 'fridge',
  expires_at TIMESTAMPTZ,

  -- Zrodlo
  source_session_id UUID REFERENCES cooking_sessions(id) ON DELETE SET NULL,

  -- Status
  is_consumed BOOLEAN DEFAULT false,
  consumed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_item_reference CHECK (
    (item_type = 'ingredient' AND ingredient_id IS NOT NULL) OR
    (item_type IN ('component', 'meal') AND recipe_id IS NOT NULL)
  )
);

-- Indeksy
CREATE INDEX idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX idx_user_inventory_expires_at ON user_inventory(expires_at);
CREATE INDEX idx_user_inventory_item_type ON user_inventory(item_type);
CREATE INDEX idx_user_inventory_not_consumed ON user_inventory(user_id, is_consumed) WHERE is_consumed = false;

-- RLS
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own inventory"
  ON user_inventory FOR ALL
  USING (auth.uid() = user_id);

-- Komentarze
COMMENT ON TABLE user_inventory IS 'Wirtualna spizarnia uzytkownika - sledzenie zapasow z batch cooking';
COMMENT ON COLUMN user_inventory.item_type IS 'ingredient = surowy skladnik, component = polprodukt z przepisu, meal = gotowy posilek';
COMMENT ON COLUMN user_inventory.source_session_id IS 'Sesja gotowania ktora wytworzyla ten zapas';

-- ============================================================
-- 11. Extend planned_meals with source_meal_id (leftovers)
-- ============================================================

ALTER TABLE planned_meals
ADD COLUMN IF NOT EXISTS source_meal_id INTEGER REFERENCES planned_meals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_planned_meals_source_meal_id ON planned_meals(source_meal_id);

COMMENT ON COLUMN planned_meals.source_meal_id IS 'ID posilku zrodlowego dla leftovers z batch cooking';

-- ============================================================
-- 12. Enable Realtime for cooking sessions
-- ============================================================

-- Wlacz realtime dla tabel sesji
ALTER PUBLICATION supabase_realtime ADD TABLE cooking_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE session_step_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE session_adjustments;

-- ============================================================
-- 13. Recipe time consistency validation - SEE SEPARATE MIGRATION
-- ============================================================
-- Trigger i funkcje synchronizacji czasow sa w:
-- 20260107120000_add_recipe_time_validation.sql
