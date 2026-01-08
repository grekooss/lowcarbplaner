# Advanced Meal Prep v2.0 - Kompletna Specyfikacja

> **Status**: Zatwierdzona do implementacji
> **Data**: 2026-01-06
> **Wersja**: 2.0 (rozszerzona)

---

## Spis treści

1. [Podsumowanie](#1-podsumowanie)
2. [Schemat bazy danych](#2-schemat-bazy-danych)
3. [Typy TypeScript](#3-typy-typescript)
4. [Serwisy i logika biznesowa](#4-serwisy-i-logika-biznesowa)
5. [Komponenty UI](#5-komponenty-ui)
6. [Plan migracji danych](#6-plan-migracji-danych)
7. [Ryzyka i mitygacje](#7-ryzyka-i-mitygacje)

---

## 1. Podsumowanie

### Cel funkcjonalności

System **Advanced Meal Prep v2.0** umożliwia:

- **Rekurencyjne przepisy** - przepis A może używać przepisu B jako składnika (np. kanapka = chleb + pasta jajeczna)
- **Planowanie sesji gotowania** wielu dań jednocześnie
- **Śledzenie kroków** z timerami i powiadomieniami
- **Skalowanie czasowe** - rozróżnienie między czasem liniowym (krojenie) a stałym (pieczenie)
- **Mise en Place** - grupowanie podobnych czynności przygotowawczych
- **Zarządzanie konfliktami zasobów** - temperatura sprzętu, sloty, konflikty smakowe
- **Screen Wake Lock** - ekran nie gaśnie podczas gotowania
- **Dynamiczne korekty** - przyciski +5min/-5min
- **Checkpointy bezpieczeństwa** - weryfikacja temperatury, gotowości składników
- **Wirtualna spiżarnia** - śledzenie zapasów z batch cooking
- **Synchronizacja multi-device** - Supabase Realtime

### Kluczowe elementy v2.0

| Element                    | Opis                                          | Nowość w v2.0 |
| -------------------------- | --------------------------------------------- | ------------- |
| `recipe_components`        | Rekurencyjne przepisy (przepis jako składnik) | ✅            |
| `time_scaling_type`        | Liniowe vs stałe skalowanie czasu             | ✅            |
| `prep_action_categories`   | Grupowanie Mise en Place                      | ✅            |
| `equipment_slot_count`     | Konflikty slotów sprzętu                      | ✅            |
| `flavor_conflict_category` | Konflikty smakowe                             | ✅            |
| `user_inventory`           | Wirtualna spiżarnia                           | ✅            |
| `session_adjustments`      | Dynamiczne korekty czasowe                    | ✅            |
| `checkpoint_type`          | Checkpointy bezpieczeństwa                    | ✅            |
| Screen Wake Lock API       | Ekran nie gaśnie                              | ✅            |
| Supabase Realtime          | Multi-device sync                             | ✅            |

---

## 2. Schemat bazy danych

### 2.1. Nowe typy ENUM

```sql
-- ============================================================
-- Migration: Add Meal Prep v2.0 ENUM types
-- ============================================================

-- Typ skalowania czasu
CREATE TYPE time_scaling_type AS ENUM (
  'linear',      -- czas rośnie proporcjonalnie (krojenie: 2x porcji = 2x czasu)
  'constant',    -- czas stały niezależnie od porcji (pieczenie)
  'logarithmic'  -- czas rośnie wolniej niż liniowo (gotowanie wody)
);

-- Typ akcji instrukcji (rozszerzony)
CREATE TYPE instruction_action_type AS ENUM (
  'active',      -- wymaga aktywnej pracy (krojenie, mieszanie)
  'passive',     -- pasywne oczekiwanie (pieczenie, gotowanie)
  'prep',        -- przygotowanie składników (Mise en Place)
  'assembly',    -- składanie końcowe
  'checkpoint'   -- punkt kontrolny (sprawdzenie temperatury)
);

-- Typ checkpointu bezpieczeństwa
CREATE TYPE checkpoint_type AS ENUM (
  'temperature',    -- sprawdzenie temperatury (mięso 75°C)
  'visual',         -- sprawdzenie wizualne (złoty kolor)
  'texture',        -- sprawdzenie tekstury (al dente)
  'safety',         -- checkpoint bezpieczeństwa ogólny
  'equipment_ready' -- sprzęt gotowy do użycia
);

-- Kategoria konfliktów smakowych
CREATE TYPE flavor_conflict_category AS ENUM (
  'neutral',      -- brak wpływu na inne potrawy
  'fish',         -- intensywny zapach ryby
  'garlic_onion', -- intensywny czosnek/cebula
  'spicy',        -- ostre przyprawy
  'sweet',        -- słodkie aromaty
  'smoke'         -- wędzenie/grillowanie
);

-- Status sesji gotowania
CREATE TYPE cooking_session_status AS ENUM (
  'planned',
  'in_progress',
  'paused',
  'completed',
  'cancelled'
);

-- Lokalizacja przechowywania
CREATE TYPE storage_location AS ENUM (
  'fridge',
  'freezer',
  'pantry',
  'counter'
);

COMMENT ON TYPE time_scaling_type IS 'Określa jak czas kroku skaluje się z liczbą porcji';
COMMENT ON TYPE checkpoint_type IS 'Typ checkpointu bezpieczeństwa';
COMMENT ON TYPE flavor_conflict_category IS 'Kategoria konfliktów smakowych przy równoległym gotowaniu';
```

### 2.2. Tabela: `prep_action_categories` (Mise en Place)

```sql
-- ============================================================
-- Migration: Create prep_action_categories table
-- Description: Categories for grouping similar prep actions
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

-- Dane początkowe
INSERT INTO prep_action_categories (name, name_plural, description, icon_name, sort_order) VALUES
  ('Krojenie warzyw', 'Krojenie warzyw', 'Krojenie, szatkowanie, siekanie warzyw', 'knife', 1),
  ('Krojenie mięsa', 'Krojenie mięsa', 'Porcjowanie, krojenie mięsa', 'meat', 2),
  ('Ważenie składników', 'Ważenie składników', 'Odmierzanie składników suchych', 'scale', 3),
  ('Odmierzanie płynów', 'Odmierzanie płynów', 'Odmierzanie płynów i sosów', 'measuring-cup', 4),
  ('Przygotowanie przypraw', 'Przygotowanie przypraw', 'Mieszanie przypraw, marynaty', 'spices', 5),
  ('Rozmrażanie', 'Rozmrażanie', 'Rozmrażanie składników', 'snowflake', 6),
  ('Mycie', 'Mycie', 'Mycie warzyw i owoców', 'water', 7),
  ('Ubijanie', 'Ubijanie', 'Ubijanie jaj, śmietany', 'whisk', 8);

-- RLS
ALTER TABLE prep_action_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prep categories readable by everyone"
  ON prep_action_categories FOR SELECT USING (true);

CREATE POLICY "Prep categories modifiable by service role"
  ON prep_action_categories FOR ALL
  USING (auth.role() = 'service_role');
```

### 2.3. Tabela: `recipe_instructions` (rozszerzona)

```sql
-- ============================================================
-- Migration: Create recipe_instructions table (v2.0)
-- Description: Detailed recipe steps with timing and equipment
-- ============================================================

CREATE TABLE recipe_instructions (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL,

  -- Timing (podstawowe)
  active_minutes INTEGER DEFAULT 0,     -- czas aktywnej pracy
  passive_minutes INTEGER DEFAULT 0,    -- czas pasywnego oczekiwania

  -- Skalowanie czasowe (NOWE w v2.0)
  time_scaling_type time_scaling_type DEFAULT 'linear',
  time_scaling_factor NUMERIC(3,2) DEFAULT 1.0,  -- współczynnik dla logarithmic

  -- Typ akcji i równoległość
  action_type instruction_action_type DEFAULT 'active',
  is_parallelizable BOOLEAN DEFAULT false,

  -- Sprzęt (rozszerzone w v2.0)
  equipment_ids INTEGER[] DEFAULT '{}',
  equipment_slot_count INTEGER DEFAULT 1,  -- ile slotów zajmuje
  required_temperature_celsius INTEGER,    -- wymagana temperatura sprzętu

  -- Mise en Place (NOWE w v2.0)
  prep_action_category_id INTEGER REFERENCES prep_action_categories(id),

  -- Checkpointy (NOWE w v2.0)
  checkpoint_condition TEXT,              -- np. "temperatura wewnętrzna 75°C"
  checkpoint_type checkpoint_type,

  -- Wskazówki sensoryczne
  sensory_cues JSONB DEFAULT '{}',
  -- Struktura: { "visual": "złocisty", "sound": "syczy", "smell": "aromat", "texture": "chrupiący" }

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
COMMENT ON TABLE recipe_instructions IS 'Szczegółowe kroki przepisu z czasami, sprzętem i checkpointami';
COMMENT ON COLUMN recipe_instructions.time_scaling_type IS 'Jak czas skaluje się z liczbą porcji: linear/constant/logarithmic';
COMMENT ON COLUMN recipe_instructions.equipment_slot_count IS 'Ile slotów sprzętu zajmuje (np. 2 palniki na kuchence)';
COMMENT ON COLUMN recipe_instructions.checkpoint_type IS 'Typ checkpointu bezpieczeństwa';
```

### 2.4. Tabela: `recipe_components` (rekurencyjne przepisy)

```sql
-- ============================================================
-- Migration: Create recipe_components table
-- Description: Recursive recipe composition (recipe as ingredient)
-- ============================================================

CREATE TABLE recipe_components (
  parent_recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  component_recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

  -- Ilość składnika-przepisu
  required_amount NUMERIC(10,2) NOT NULL,  -- ile gramów/sztuk potrzeba
  unit TEXT NOT NULL DEFAULT 'g',          -- jednostka (g, szt, porcje)

  -- Fallback na składnik (jeśli przepis nie jest dostępny)
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
COMMENT ON TABLE recipe_components IS 'Rekurencyjna kompozycja przepisów - przepis może używać innego przepisu jako składnika';
COMMENT ON COLUMN recipe_components.required_amount IS 'Ilość składnika-przepisu potrzebna w przepisie nadrzędnym';
COMMENT ON COLUMN recipe_components.fallback_ingredient_id IS 'Alternatywny składnik jeśli przepis komponentu niedostępny';

-- ============================================================
-- Funkcja: Sprawdzenie cykli w recipe_components
-- ============================================================
CREATE OR REPLACE FUNCTION check_recipe_component_cycle()
RETURNS TRIGGER AS $$
DECLARE
  cycle_found BOOLEAN;
BEGIN
  -- Sprawdź czy nowy komponent nie tworzy cyklu
  WITH RECURSIVE component_tree AS (
    -- Bazowy przypadek: nowy komponent
    SELECT NEW.component_recipe_id AS recipe_id, 1 AS depth

    UNION ALL

    -- Rekurencja: komponenty komponentów
    SELECT rc.component_recipe_id, ct.depth + 1
    FROM component_tree ct
    JOIN recipe_components rc ON rc.parent_recipe_id = ct.recipe_id
    WHERE ct.depth < 10  -- limit głębokości
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
```

### 2.5. Rozszerzenie tabeli `equipment` (konflikty)

```sql
-- ============================================================
-- Migration: Extend equipment table with conflict info
-- ============================================================

ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS max_slots INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_temperature_celsius INTEGER,
ADD COLUMN IF NOT EXISTS flavor_conflict_category flavor_conflict_category DEFAULT 'neutral';

COMMENT ON COLUMN equipment.max_slots IS 'Maksymalna liczba równoczesnych operacji (np. 4 palniki)';
COMMENT ON COLUMN equipment.max_temperature_celsius IS 'Maksymalna temperatura urządzenia (°C)';
COMMENT ON COLUMN equipment.flavor_conflict_category IS 'Kategoria konfliktów smakowych';

-- Aktualizacja istniejących danych
UPDATE equipment SET max_slots = 4, max_temperature_celsius = 300 WHERE name = 'Kuchenka';
UPDATE equipment SET max_slots = 1, max_temperature_celsius = 250 WHERE name = 'Piekarnik';
UPDATE equipment SET max_slots = 1 WHERE name = 'Patelnia';
UPDATE equipment SET max_slots = 1 WHERE name = 'Garnek';
UPDATE equipment SET max_slots = 1 WHERE name = 'Blender';
```

### 2.6. Tabele sesji gotowania (rozszerzone)

```sql
-- ============================================================
-- Migration: Create cooking session tables (v2.0)
-- ============================================================

-- Główna tabela sesji
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

  -- Synchronizacja multi-device (NOWE v2.0)
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  active_device_id TEXT,  -- identyfikator aktywnego urządzenia

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela powiązań sesji z posiłkami
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

-- Tabela postępu kroków
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

-- NOWE v2.0: Tabela dynamicznych korekt
CREATE TABLE session_adjustments (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES cooking_sessions(id) ON DELETE CASCADE,
  step_id INTEGER REFERENCES session_step_progress(id),

  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('time_add', 'time_subtract', 'skip', 'repeat')),
  adjustment_value INTEGER,  -- sekundy dla time adjustments
  reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy
CREATE INDEX idx_cooking_sessions_user_id ON cooking_sessions(user_id);
CREATE INDEX idx_cooking_sessions_planned_date ON cooking_sessions(planned_date);
CREATE INDEX idx_cooking_sessions_status ON cooking_sessions(status);
CREATE INDEX idx_session_meals_session_id ON session_meals(session_id);
CREATE INDEX idx_session_step_progress_session_id ON session_step_progress(session_id);
CREATE INDEX idx_session_adjustments_session_id ON session_adjustments(session_id);

-- RLS dla wszystkich tabel sesji
ALTER TABLE cooking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_step_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_adjustments ENABLE ROW LEVEL SECURITY;

-- Polityki dla cooking_sessions
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

-- Polityki dla session_meals (przez relację z cooking_sessions)
CREATE POLICY "Users can manage own session meals"
  ON session_meals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cooking_sessions cs
      WHERE cs.id = session_meals.session_id
      AND cs.user_id = auth.uid()
    )
  );

-- Polityki dla session_step_progress
CREATE POLICY "Users can manage own step progress"
  ON session_step_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cooking_sessions cs
      WHERE cs.id = session_step_progress.session_id
      AND cs.user_id = auth.uid()
    )
  );

-- Polityki dla session_adjustments
CREATE POLICY "Users can manage own adjustments"
  ON session_adjustments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cooking_sessions cs
      WHERE cs.id = session_adjustments.session_id
      AND cs.user_id = auth.uid()
    )
  );

-- Rozszerzenie planned_meals o source_meal_id (leftovers)
ALTER TABLE planned_meals
ADD COLUMN IF NOT EXISTS source_meal_id INTEGER REFERENCES planned_meals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_planned_meals_source_meal_id ON planned_meals(source_meal_id);

COMMENT ON COLUMN planned_meals.source_meal_id IS 'ID posiłku źródłowego dla leftovers z batch cooking';
```

### 2.7. Tabela: `user_inventory` (wirtualna spiżarnia)

```sql
-- ============================================================
-- Migration: Create user_inventory table
-- Description: Virtual pantry for tracking batch cooking results
-- ============================================================

CREATE TABLE user_inventory (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Typ pozycji
  item_type TEXT NOT NULL CHECK (item_type IN ('ingredient', 'component', 'meal')),

  -- Odniesienia (jedno z nich musi być wypełnione)
  ingredient_id INTEGER REFERENCES ingredients(id),
  recipe_id INTEGER REFERENCES recipes(id),

  -- Ilość
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'g',

  -- Przechowywanie
  storage_location storage_location DEFAULT 'fridge',
  expires_at TIMESTAMPTZ,

  -- Źródło
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
COMMENT ON TABLE user_inventory IS 'Wirtualna spiżarnia użytkownika - śledzenie zapasów z batch cooking';
COMMENT ON COLUMN user_inventory.item_type IS 'ingredient = surowy składnik, component = półprodukt z przepisu, meal = gotowy posiłek';
COMMENT ON COLUMN user_inventory.source_session_id IS 'Sesja gotowania która wytworzyła ten zapas';
```

### 2.8. Diagram ERD v2.0

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│    recipes      │     │  recipe_instructions │     │    equipment    │
├─────────────────┤     ├──────────────────────┤     ├─────────────────┤
│ id (PK)         │────<│ recipe_id (FK)       │     │ id (PK)         │
│ name            │     │ step_number          │>────│ name            │
│ instructions    │     │ description          │     │ max_slots       │
│ (JSON-legacy)   │     │ active_minutes       │     │ max_temperature │
│ ...             │     │ passive_minutes      │     │ flavor_conflict │
└─────────────────┘     │ time_scaling_type    │     └─────────────────┘
        │               │ equipment_ids[]      │
        │               │ equipment_slot_count │
        │               │ checkpoint_type      │
        │               │ prep_action_cat_id───│────>┌────────────────────────┐
        │               └──────────────────────┘     │ prep_action_categories │
        │                                            ├────────────────────────┤
        │   ┌──────────────────────┐                 │ id (PK)                │
        │   │  recipe_components   │                 │ name                   │
        │   ├──────────────────────┤                 │ icon_name              │
        ├──<│ parent_recipe_id (FK)│                 └────────────────────────┘
        └──<│ component_recipe_id  │
            │ required_amount      │
            │ fallback_ingredient  │
            └──────────────────────┘

┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────────────┐
│  planned_meals  │────<│    session_meals     │>────│   cooking_sessions      │
├─────────────────┤     ├──────────────────────┤     ├─────────────────────────┤
│ id (PK)         │     │ session_id (FK)      │     │ id (PK, UUID)           │
│ user_id (FK)    │     │ planned_meal_id (FK) │     │ user_id (FK)            │
│ recipe_id (FK)  │     │ is_source_meal       │     │ planned_date            │
│ meal_date       │     │ portions_to_cook     │     │ status                  │
│ source_meal_id  │     └──────────────────────┘     │ estimated_total_minutes │
│ (FK, leftover)  │                                   │ current_step_index      │
└─────────────────┘                                   │ active_device_id        │
                                                      └─────────────────────────┘
                                                               │
              ┌────────────────────────────────────────────────┼────────────────────┐
              │                                                │                    │
              ▼                                                ▼                    ▼
┌──────────────────────────────┐   ┌────────────────────────────┐   ┌─────────────────────┐
│   session_step_progress      │   │   session_adjustments      │   │   user_inventory    │
├──────────────────────────────┤   ├────────────────────────────┤   ├─────────────────────┤
│ session_id (FK)              │   │ session_id (FK)            │   │ id (PK)             │
│ recipe_id (FK)               │   │ step_id (FK)               │   │ user_id (FK)        │
│ step_number                  │   │ adjustment_type            │   │ item_type           │
│ is_completed                 │   │ adjustment_value           │   │ recipe_id (FK)      │
│ timer_started_at             │   │ reason                     │   │ quantity            │
│ timer_remaining_seconds      │   └────────────────────────────┘   │ storage_location    │
└──────────────────────────────┘                                     │ expires_at          │
                                                                     │ source_session_id   │
                                                                     └─────────────────────┘
```

---

## 3. Typy TypeScript

### 3.1. Nowe typy DTO (`src/types/dto.types.ts`)

```typescript
// ============================================================
// Meal Prep v2.0 Types
// ============================================================

/**
 * Typ skalowania czasu
 */
export type TimeScalingType = 'linear' | 'constant' | 'logarithmic'

/**
 * Typ akcji instrukcji
 */
export type InstructionActionType =
  | 'active'
  | 'passive'
  | 'prep'
  | 'assembly'
  | 'checkpoint'

/**
 * Typ checkpointu bezpieczeństwa
 */
export type CheckpointType =
  | 'temperature'
  | 'visual'
  | 'texture'
  | 'safety'
  | 'equipment_ready'

/**
 * Kategoria konfliktów smakowych
 */
export type FlavorConflictCategory =
  | 'neutral'
  | 'fish'
  | 'garlic_onion'
  | 'spicy'
  | 'sweet'
  | 'smoke'

/**
 * Status sesji gotowania
 */
export type CookingSessionStatus =
  | 'planned'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'cancelled'

/**
 * Lokalizacja przechowywania
 */
export type StorageLocation = 'fridge' | 'freezer' | 'pantry' | 'counter'

/**
 * Wskazówki sensoryczne
 */
export interface SensoryCues {
  visual?: string
  sound?: string
  smell?: string
  texture?: string
}

/**
 * Instrukcja przepisu (v2.0)
 */
export interface RecipeInstructionDTO {
  id: number
  recipe_id: number
  step_number: number
  description: string

  // Timing
  active_minutes: number
  passive_minutes: number
  time_scaling_type: TimeScalingType
  time_scaling_factor: number

  // Akcja
  action_type: InstructionActionType
  is_parallelizable: boolean

  // Sprzęt
  equipment_ids: number[]
  equipment_slot_count: number
  required_temperature_celsius: number | null

  // Mise en Place
  prep_action_category_id: number | null
  prep_action_category?: PrepActionCategoryDTO

  // Checkpointy
  checkpoint_condition: string | null
  checkpoint_type: CheckpointType | null

  // Pozostałe
  sensory_cues: SensoryCues
  is_critical_timing: boolean
}

/**
 * Kategoria akcji przygotowawczej
 */
export interface PrepActionCategoryDTO {
  id: number
  name: string
  name_plural: string | null
  description: string | null
  icon_name: string | null
  sort_order: number
}

/**
 * Komponent przepisu (przepis jako składnik)
 */
export interface RecipeComponentDTO {
  parent_recipe_id: number
  component_recipe_id: number
  required_amount: number
  unit: string
  fallback_ingredient_id: number | null

  // Relacja
  component_recipe?: RecipeDTO
  fallback_ingredient?: IngredientDTO
}

/**
 * Sesja gotowania (v2.0)
 */
export interface CookingSessionDTO {
  id: string
  user_id: string
  planned_date: string
  planned_start_time: string | null
  estimated_total_minutes: number | null
  actual_start_at: string | null
  actual_end_at: string | null
  status: CookingSessionStatus
  current_step_index: number
  notes: string | null
  last_sync_at: string
  active_device_id: string | null
  created_at: string
  updated_at: string

  // Relacje
  meals: SessionMealDTO[]
  step_progress?: SessionStepProgressDTO[]
  adjustments?: SessionAdjustmentDTO[]
}

/**
 * Posiłek w sesji
 */
export interface SessionMealDTO {
  id: number
  session_id: string
  planned_meal_id: number
  is_source_meal: boolean
  portions_to_cook: number
  cooking_order: number | null
  planned_meal: PlannedMealDTO
}

/**
 * Postęp kroku
 */
export interface SessionStepProgressDTO {
  id: number
  session_id: string
  recipe_id: number
  step_number: number
  is_completed: boolean
  started_at: string | null
  completed_at: string | null
  timer_started_at: string | null
  timer_duration_seconds: number | null
  timer_paused_at: string | null
  timer_remaining_seconds: number | null
  user_notes: string | null
}

/**
 * Korekta w sesji
 */
export interface SessionAdjustmentDTO {
  id: number
  session_id: string
  step_id: number | null
  adjustment_type: 'time_add' | 'time_subtract' | 'skip' | 'repeat'
  adjustment_value: number | null
  reason: string | null
  created_at: string
}

/**
 * Pozycja w wirtualnej spiżarni
 */
export interface UserInventoryItemDTO {
  id: number
  user_id: string
  item_type: 'ingredient' | 'component' | 'meal'
  ingredient_id: number | null
  recipe_id: number | null
  quantity: number
  unit: string
  storage_location: StorageLocation
  expires_at: string | null
  source_session_id: string | null
  is_consumed: boolean
  consumed_at: string | null
  created_at: string
  updated_at: string

  // Relacje
  ingredient?: IngredientDTO
  recipe?: RecipeDTO
}

/**
 * Krok na osi czasu (wygenerowany)
 */
export interface TimelineStep {
  id: string
  recipe_id: number
  recipe_name: string
  step_number: number
  description: string
  action_type: InstructionActionType

  // Timing
  start_minute: number
  active_duration: number
  passive_duration: number
  total_duration: number

  // Skalowanie
  time_scaling_type: TimeScalingType
  scaled_active_duration: number
  scaled_passive_duration: number

  // Równoległość
  parallel_group_id: string | null
  can_run_parallel: boolean

  // Sprzęt
  equipment_ids: number[]
  equipment_names: string[]
  equipment_slot_count: number
  required_temperature: number | null

  // Checkpointy
  checkpoint_type: CheckpointType | null
  checkpoint_condition: string | null

  // Status
  status: 'pending' | 'active' | 'waiting' | 'completed' | 'skipped'

  // Pozostałe
  sensory_cues: SensoryCues
  is_critical: boolean
  prep_action_category_id: number | null
}

/**
 * Grupa Mise en Place
 */
export interface MisePlaceGroup {
  id: string
  category: PrepActionCategoryDTO
  tasks: {
    recipe_id: number
    recipe_name: string
    step_number: number
    description: string
    estimated_minutes: number
    ingredients: string[]
  }[]
  total_estimated_minutes: number
}

/**
 * Konflikt zasobów
 */
export interface ResourceConflict {
  type: 'equipment_slot' | 'temperature' | 'flavor'
  equipment_id: number
  equipment_name: string
  conflicting_steps: {
    step_id: string
    recipe_name: string
    description: string
  }[]
  resolution_suggestion: string
}

/**
 * Wygenerowana oś czasu sesji
 */
export interface CookingTimeline {
  session_id: string
  total_estimated_minutes: number
  active_minutes: number
  passive_minutes: number

  // Kroki
  steps: TimelineStep[]

  // Mise en Place
  mise_place_groups: MisePlaceGroup[]

  // Konflikty
  resource_conflicts: ResourceConflict[]

  // Sprzęt
  required_equipment: EquipmentDTO[]
  equipment_utilization: Map<number, number> // equipment_id -> % wykorzystania

  // Komponenty przepisów
  recipe_components: RecipeComponentDTO[]
  component_production_order: number[] // recipe_ids w kolejności produkcji
}
```

---

## 4. Serwisy i logika biznesowa

### 4.1. `src/services/meal-prep-optimizer.ts` (szkielet)

```typescript
/**
 * Meal Prep Optimizer Service v2.0
 *
 * Główne funkcjonalności:
 * - Tworzenie i zarządzanie sesjami gotowania
 * - Generowanie zoptymalizowanej osi czasu
 * - Rozwiązywanie zależności przepisów (rekurencja)
 * - Grupowanie Mise en Place
 * - Wykrywanie i rozwiązywanie konfliktów zasobów
 * - Skalowanie czasów dla batch cooking
 * - Zarządzanie wirtualną spiżarnią
 */

// Główne eksporty:
export async function createCookingSession(
  input: CreateSessionInput
): Promise<CreateSessionResult>
export async function getCookingSession(
  sessionId: string,
  userId: string
): Promise<CookingSessionDTO | null>
export async function updateSessionStatus(
  sessionId: string,
  userId: string,
  status: CookingSessionStatus
): Promise<boolean>
export async function completeStep(
  sessionId: string,
  recipeId: number,
  stepNumber: number
): Promise<boolean>
export async function addTimeAdjustment(
  sessionId: string,
  stepId: number,
  seconds: number
): Promise<boolean>

// Generowanie osi czasu
export function generateTimeline(
  meals: PlannedMealWithRecipe[],
  options: TimelineOptions
): CookingTimeline

// Rozwiązywanie zależności przepisów
export function resolveRecipeDependencies(
  recipeIds: number[]
): Promise<RecipeDependencyTree>
export function flattenIngredients(
  recipeId: number,
  portions: number
): Promise<FlattenedIngredient[]>

// Mise en Place
export function groupMisePlaceTasks(
  steps: RecipeInstructionDTO[]
): MisePlaceGroup[]

// Konflikty zasobów
export function detectResourceConflicts(
  timeline: TimelineStep[],
  equipment: EquipmentDTO[]
): ResourceConflict[]
export function resolveTemperatureConflicts(
  conflicts: ResourceConflict[]
): TimelineStep[]

// Skalowanie czasów
export function scaleStepTime(
  step: RecipeInstructionDTO,
  portions: number
): ScaledTime

// Wirtualna spiżarnia
export async function addToInventory(
  userId: string,
  items: InventoryAddInput[]
): Promise<void>
export async function consumeFromInventory(
  userId: string,
  itemId: number
): Promise<void>
export async function getAvailableInventory(
  userId: string
): Promise<UserInventoryItemDTO[]>
```

### 4.2. Logika skalowania czasu

```typescript
interface ScaledTime {
  active_minutes: number
  passive_minutes: number
  total_minutes: number
}

export function scaleStepTime(
  step: RecipeInstructionDTO,
  portions: number,
  basePortions: number = 1
): ScaledTime {
  const portionRatio = portions / basePortions

  let activeMinutes: number
  let passiveMinutes: number

  switch (step.time_scaling_type) {
    case 'constant':
      // Czas stały (pieczenie, gotowanie)
      activeMinutes = step.active_minutes
      passiveMinutes = step.passive_minutes
      break

    case 'logarithmic':
      // Czas rośnie logarytmicznie
      const logFactor = 1 + Math.log2(portionRatio) * step.time_scaling_factor
      activeMinutes = Math.round(step.active_minutes * logFactor)
      passiveMinutes = step.passive_minutes // passive zazwyczaj stały
      break

    case 'linear':
    default:
      // Czas rośnie liniowo (krojenie)
      activeMinutes = Math.round(step.active_minutes * portionRatio)
      passiveMinutes = step.passive_minutes // passive zazwyczaj stały
      break
  }

  return {
    active_minutes: activeMinutes,
    passive_minutes: passiveMinutes,
    total_minutes: activeMinutes + passiveMinutes,
  }
}
```

### 4.3. Logika rozwiązywania zależności przepisów

```typescript
interface RecipeDependencyNode {
  recipe_id: number
  recipe_name: string
  required_amount: number
  unit: string
  depth: number
  children: RecipeDependencyNode[]
}

export async function resolveRecipeDependencies(
  recipeIds: number[]
): Promise<RecipeDependencyNode[]> {
  const supabase = createAdminClient()

  // Pobierz wszystkie komponenty rekurencyjnie
  const { data: components } = await supabase.from('recipe_components').select(`
      parent_recipe_id,
      component_recipe_id,
      required_amount,
      unit,
      component_recipe:recipes!component_recipe_id (
        id,
        name
      )
    `)

  // Zbuduj drzewo zależności
  function buildTree(
    recipeId: number,
    depth: number = 0
  ): RecipeDependencyNode | null {
    const directComponents =
      components?.filter((c) => c.parent_recipe_id === recipeId) || []

    if (directComponents.length === 0) return null

    return {
      recipe_id: recipeId,
      recipe_name: '', // wypełniane osobno
      required_amount: 0,
      unit: '',
      depth,
      children: directComponents.map((c) => ({
        recipe_id: c.component_recipe_id,
        recipe_name: c.component_recipe?.name || '',
        required_amount: c.required_amount,
        unit: c.unit,
        depth: depth + 1,
        children: buildTree(c.component_recipe_id, depth + 1)?.children || [],
      })),
    }
  }

  return recipeIds
    .map((id) => buildTree(id))
    .filter((node): node is RecipeDependencyNode => node !== null)
}

/**
 * Spłaszcza składniki z zagnieżdżonych przepisów
 */
export async function flattenIngredients(
  recipeId: number,
  portions: number
): Promise<FlattenedIngredient[]> {
  const dependencies = await resolveRecipeDependencies([recipeId])
  const allIngredients: FlattenedIngredient[] = []

  // Rekurencyjnie zbierz składniki
  async function collectIngredients(
    node: RecipeDependencyNode,
    multiplier: number
  ) {
    const { data: recipeIngredients } = await supabase
      .from('recipe_ingredients')
      .select('*, ingredient:ingredients(*)')
      .eq('recipe_id', node.recipe_id)

    for (const ri of recipeIngredients || []) {
      const scaledAmount = ri.amount * multiplier * portions

      // Sprawdź czy składnik już istnieje (agregacja)
      const existing = allIngredients.find(
        (i) => i.ingredient_id === ri.ingredient_id
      )
      if (existing) {
        existing.amount += scaledAmount
      } else {
        allIngredients.push({
          ingredient_id: ri.ingredient_id,
          name: ri.ingredient.name,
          amount: scaledAmount,
          unit: ri.unit,
          source_recipe_id: node.recipe_id,
          source_recipe_name: node.recipe_name,
        })
      }
    }

    // Rekurencja dla komponentów
    for (const child of node.children) {
      const childMultiplier = child.required_amount / 100 // zakładamy że required_amount to % bazowego przepisu
      await collectIngredients(child, multiplier * childMultiplier)
    }
  }

  for (const dep of dependencies) {
    await collectIngredients(dep, 1)
  }

  return allIngredients
}
```

---

## 5. Komponenty UI

### 5.1. Struktura katalogów

```
src/components/meal-prep/
├── session/
│   ├── PrepSessionPlanner.tsx      # Wybór dań do sesji
│   ├── SessionProgress.tsx         # Główny widok postępu
│   ├── SessionSummary.tsx          # Podsumowanie po zakończeniu
│   └── SessionControls.tsx         # Przyciski kontrolne
│
├── timeline/
│   ├── CookingTimeline.tsx         # Oś czasu z krokami
│   ├── TimelineStep.tsx            # Pojedynczy krok
│   ├── ParallelStepGroup.tsx       # Grupa równoległych kroków
│   └── TimelineProgress.tsx        # Pasek postępu
│
├── mise-place/
│   ├── MisePlaceChecklist.tsx      # Checklist przygotowania
│   ├── MisePlaceGroup.tsx          # Grupa czynności
│   └── PrepTaskItem.tsx            # Pojedyncze zadanie prep
│
├── timers/
│   ├── ActiveTimer.tsx             # Timer z odliczaniem
│   ├── TimerControls.tsx           # +5min/-5min, pauza
│   ├── TimerNotification.tsx       # Powiadomienie o końcu
│   └── MultiTimerDashboard.tsx     # Dashboard wielu timerów
│
├── equipment/
│   ├── EquipmentNeeded.tsx         # Lista wymaganego sprzętu
│   ├── EquipmentConflicts.tsx      # Konflikty zasobów
│   └── EquipmentSlotIndicator.tsx  # Wskaźnik zajętości
│
├── checkpoints/
│   ├── CheckpointModal.tsx         # Modal checkpointu
│   ├── TemperatureCheck.tsx        # Sprawdzenie temperatury
│   └── VisualConfirmation.tsx      # Potwierdzenie wizualne
│
├── inventory/
│   ├── InventoryList.tsx           # Lista zapasów
│   ├── InventoryItem.tsx           # Pojedynczy zapas
│   ├── AddToInventory.tsx          # Dodawanie do spiżarni
│   └── ExpirationWarning.tsx       # Ostrzeżenie o terminie
│
└── hooks/
    ├── useCookingSession.ts        # Hook sesji gotowania
    ├── useTimeline.ts              # Hook osi czasu
    ├── useTimer.ts                 # Hook pojedynczego timera
    ├── useMultiTimer.ts            # Hook wielu timerów
    ├── useWakeLock.ts              # Screen Wake Lock API
    ├── useNotifications.ts         # Web Notifications API
    └── useSessionSync.ts           # Supabase Realtime sync
```

### 5.2. Hook: `useWakeLock.ts`

```typescript
import { useState, useEffect, useCallback, useRef } from 'react'

interface UseWakeLockReturn {
  isSupported: boolean
  isActive: boolean
  request: () => Promise<boolean>
  release: () => Promise<void>
  error: Error | null
}

export function useWakeLock(): UseWakeLockReturn {
  const [isSupported] = useState(() => 'wakeLock' in navigator)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const request = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError(new Error('Wake Lock API not supported'))
      return false
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
      setIsActive(true)
      setError(null)

      wakeLockRef.current.addEventListener('release', () => {
        setIsActive(false)
      })

      return true
    } catch (err) {
      setError(err as Error)
      setIsActive(false)
      return false
    }
  }, [isSupported])

  const release = useCallback(async (): Promise<void> => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
      setIsActive(false)
    }
  }, [])

  // Automatyczne ponowne żądanie po powrocie na stronę
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (
        document.visibilityState === 'visible' &&
        isActive &&
        !wakeLockRef.current
      ) {
        await request()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive, request])

  // Cleanup przy odmontowaniu
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release()
      }
    }
  }, [])

  return { isSupported, isActive, request, release, error }
}
```

### 5.3. Hook: `useSessionSync.ts` (Supabase Realtime)

```typescript
import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseSessionSyncOptions {
  sessionId: string
  deviceId: string
  onStepUpdate: (stepProgress: SessionStepProgressDTO) => void
  onSessionUpdate: (session: Partial<CookingSessionDTO>) => void
  onDeviceChange: (activeDeviceId: string) => void
}

export function useSessionSync({
  sessionId,
  deviceId,
  onStepUpdate,
  onSessionUpdate,
  onDeviceChange,
}: UseSessionSyncOptions) {
  const supabase = createClient()

  useEffect(() => {
    let channel: RealtimeChannel

    const setupChannel = async () => {
      channel = supabase
        .channel(`session:${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'session_step_progress',
            filter: `session_id=eq.${sessionId}`,
          },
          (payload) => {
            if (payload.new) {
              onStepUpdate(payload.new as SessionStepProgressDTO)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'cooking_sessions',
            filter: `id=eq.${sessionId}`,
          },
          (payload) => {
            if (payload.new) {
              const session = payload.new as CookingSessionDTO
              onSessionUpdate(session)

              if (
                session.active_device_id &&
                session.active_device_id !== deviceId
              ) {
                onDeviceChange(session.active_device_id)
              }
            }
          }
        )
        .subscribe()
    }

    setupChannel()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [
    sessionId,
    deviceId,
    onStepUpdate,
    onSessionUpdate,
    onDeviceChange,
    supabase,
  ])

  const claimActiveDevice = useCallback(async () => {
    await supabase
      .from('cooking_sessions')
      .update({
        active_device_id: deviceId,
        last_sync_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
  }, [sessionId, deviceId, supabase])

  return { claimActiveDevice }
}
```

---

## 6. Plan migracji danych

### 6.1. Kolejność migracji

1. **ENUM types** - wszystkie nowe typy
2. **prep_action_categories** - kategorie Mise en Place
3. **recipe_instructions** - nowa tabela instrukcji
4. **recipe_components** - rekurencyjne przepisy
5. **Rozszerzenie equipment** - dodatkowe kolumny
6. **cooking_sessions** + powiązane tabele
7. **user_inventory** - wirtualna spiżarnia
8. **Migracja danych** z JSON do recipe_instructions

### 6.2. Skrypt migracji danych z JSON

```sql
-- Migracja istniejących instrukcji z JSON do tabeli
INSERT INTO recipe_instructions (
  recipe_id,
  step_number,
  description,
  action_type,
  active_minutes,
  passive_minutes,
  time_scaling_type
)
SELECT
  r.id as recipe_id,
  (step->>'step')::integer as step_number,
  step->>'description' as description,
  'active'::instruction_action_type,
  COALESCE((step->>'active_minutes')::integer, 5),
  COALESCE((step->>'passive_minutes')::integer, 0),
  'linear'::time_scaling_type
FROM recipes r,
LATERAL jsonb_array_elements(
  CASE
    WHEN r.instructions IS NOT NULL AND r.instructions::text != 'null'
    THEN r.instructions::jsonb
    ELSE '[]'::jsonb
  END
) as step
WHERE r.instructions IS NOT NULL
ON CONFLICT (recipe_id, step_number) DO UPDATE SET
  description = EXCLUDED.description;
```

### 6.3. Backward compatibility

```typescript
// src/lib/utils/recipe-transformer.ts

export function getRecipeInstructions(
  recipe: RecipeWithInstructions
): RecipeInstructionDTO[] {
  // Preferuj nową tabelę
  if (recipe.recipe_instructions?.length > 0) {
    return recipe.recipe_instructions
  }

  // Fallback na JSON (legacy)
  if (recipe.instructions && Array.isArray(recipe.instructions)) {
    return recipe.instructions.map((step, index) => ({
      id: 0,
      recipe_id: recipe.id,
      step_number: step.step || index + 1,
      description: step.description,
      active_minutes: step.active_minutes || 5,
      passive_minutes: step.passive_minutes || 0,
      time_scaling_type: 'linear',
      time_scaling_factor: 1.0,
      action_type: 'active',
      is_parallelizable: false,
      equipment_ids: [],
      equipment_slot_count: 1,
      required_temperature_celsius: null,
      prep_action_category_id: null,
      checkpoint_condition: null,
      checkpoint_type: null,
      sensory_cues: {},
      is_critical_timing: false,
    }))
  }

  return []
}
```

---

## 7. Ryzyka i mitygacje

### Ryzyko 1: Cykle w recipe_components

- **Problem**: Przepis A używa B, B używa A
- **Mitygacja**: Trigger `check_recipe_component_cycle` zapobiega cyklom

### Ryzyko 2: Wydajność rekurencji

- **Problem**: Głęboko zagnieżdżone przepisy = wolne zapytania
- **Mitygacja**: Limit głębokości (10), cache'owanie drzewa zależności

### Ryzyko 3: Wake Lock API

- **Problem**: Brak wsparcia w starszych przeglądarkach
- **Mitygacja**: Feature detection, fallback na ostrzeżenie użytkownika

### Ryzyko 4: Konflikty multi-device

- **Problem**: Dwa urządzenia modyfikują sesję jednocześnie
- **Mitygacja**: `active_device_id` + Realtime sync + konflikt resolution UI

### Ryzyko 5: Złożoność UI

- **Problem**: Zbyt skomplikowany interfejs dla użytkownika
- **Mitygacja**: Progressive disclosure, domyślne ustawienia, tutorial

---

## Podsumowanie

Specyfikacja v2.0 rozszerza funkcjonalność Meal Prep o:

1. **Rekurencyjne przepisy** - pełna kompozycja przepisów
2. **Inteligentne skalowanie czasu** - rozróżnienie linear/constant/logarithmic
3. **Mise en Place** - grupowanie podobnych czynności
4. **Zarządzanie konfliktami** - temperatura, sloty, smaki
5. **Screen Wake Lock** - ekran nie gaśnie podczas gotowania
6. **Dynamiczne korekty** - przyciski +5/-5 min
7. **Checkpointy bezpieczeństwa** - weryfikacja temperatury
8. **Wirtualna spiżarnia** - śledzenie zapasów
9. **Multi-device sync** - Supabase Realtime

---

**Następne kroki implementacji:**

1. Utworzenie migracji SQL (pojedynczy plik)
2. Wygenerowanie typów TypeScript
3. Implementacja serwisu `meal-prep-optimizer.ts`
4. Hook `useWakeLock.ts`
5. Komponenty UI
