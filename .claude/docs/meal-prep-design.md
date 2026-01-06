# Advanced Meal Prep - Szczegółowy Plan Implementacji

> **Status**: Dokument projektowy do zatwierdzenia
> **Data**: 2026-01-06
> **Wersja**: 1.0

---

## Spis treści

1. [Podsumowanie](#1-podsumowanie)
2. [Schemat bazy danych](#2-schemat-bazy-danych)
3. [Typy TypeScript](#3-typy-typescript)
4. [Serwisy i logika biznesowa](#4-serwisy-i-logika-biznesowa)
5. [Komponenty UI](#5-komponenty-ui)
6. [Plan migracji danych](#6-plan-migracji-danych)
7. [Timeline implementacji](#7-timeline-implementacji)
8. [Ryzyka i mitygacje](#8-ryzyka-i-mitygacje)

---

## 1. Podsumowanie

### Cel funkcjonalności

System **Advanced Meal Prep** umożliwi użytkownikom:

- Planowanie sesji gotowania wielu dań jednocześnie
- Śledzenie kroków gotowania z timerami
- Optymalizację wykorzystania sprzętu kuchennego (równoległe operacje)
- Generowanie "leftovers" (resztki na następne dni)

### Obecny stan vs wymagania

| Element             | Obecny stan                         | Wymagany                            | Praca do wykonania |
| ------------------- | ----------------------------------- | ----------------------------------- | ------------------ |
| Instrukcje przepisu | JSON array w `recipes.instructions` | Osobna tabela `recipe_instructions` | Migracja struktury |
| Timing per-step     | ❌ Brak                             | `active_minutes`, `passive_minutes` | Dodanie pól        |
| Equipment per-step  | ❌ Brak                             | `equipment_ids[]` per instruction   | Dodanie powiązań   |
| Sesje gotowania     | ❌ Brak                             | `cooking_sessions` tabela           | Nowa tabela        |
| Leftovers tracking  | ❌ Brak                             | `source_meal_id` w `planned_meals`  | Dodanie pola       |

---

## 2. Schemat bazy danych

### 2.1. Nowa tabela: `recipe_instructions`

```sql
-- ============================================================
-- Migration: Create recipe_instructions table
-- Description: Migrate instructions from JSON to relational table
-- ============================================================

-- 1. Typ akcji kroku
CREATE TYPE instruction_action_type AS ENUM (
  'active',      -- wymaga aktywnej pracy (krojenie, mieszanie)
  'passive',     -- pasywne oczekiwanie (pieczenie, gotowanie)
  'prep',        -- przygotowanie składników
  'assembly'     -- składanie końcowe
);

-- 2. Tabela instrukcji
CREATE TABLE recipe_instructions (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  description TEXT NOT NULL,

  -- Timing (nowe pola)
  active_minutes INTEGER DEFAULT 0,     -- czas aktywnej pracy
  passive_minutes INTEGER DEFAULT 0,    -- czas pasywnego oczekiwania

  -- Typ akcji i równoległość
  action_type instruction_action_type DEFAULT 'active',
  is_parallelizable BOOLEAN DEFAULT false,  -- czy można wykonać równolegle

  -- Powiązanie ze sprzętem (opcjonalne)
  equipment_ids INTEGER[] DEFAULT '{}',

  -- Wskazówki sensoryczne (opcjonalne)
  sensory_cues JSONB DEFAULT '{}',
  -- Struktura: { "visual": "złocistobrązowy", "sound": "syczy", "smell": "aromat" }

  -- Punkty krytyczne (nie można przerwać)
  is_critical_timing BOOLEAN DEFAULT false,

  -- Multiplikator czasu dla początkujących
  beginner_time_multiplier NUMERIC(3,2) DEFAULT 1.50,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_recipe_step UNIQUE (recipe_id, step_number)
);

-- 3. Indeksy
CREATE INDEX idx_recipe_instructions_recipe_id ON recipe_instructions(recipe_id);
CREATE INDEX idx_recipe_instructions_action_type ON recipe_instructions(action_type);

-- 4. RLS
ALTER TABLE recipe_instructions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipe instructions readable by everyone"
  ON recipe_instructions FOR SELECT USING (true);

CREATE POLICY "Recipe instructions modifiable by service role only"
  ON recipe_instructions FOR ALL
  USING (auth.role() = 'service_role');

-- 5. Komentarze
COMMENT ON TABLE recipe_instructions IS 'Szczegółowe instrukcje kroków przepisu z czasami i sprzętem';
COMMENT ON COLUMN recipe_instructions.active_minutes IS 'Czas wymagający aktywnej pracy użytkownika';
COMMENT ON COLUMN recipe_instructions.passive_minutes IS 'Czas pasywnego oczekiwania (pieczenie, gotowanie)';
COMMENT ON COLUMN recipe_instructions.is_parallelizable IS 'Czy krok można wykonać równolegle z innymi';
COMMENT ON COLUMN recipe_instructions.is_critical_timing IS 'Czy timing jest krytyczny (nie można przerwać)';
```

### 2.2. Nowa tabela: `cooking_sessions`

```sql
-- ============================================================
-- Migration: Create cooking_sessions and session_meals tables
-- Description: Track meal prep sessions with multiple recipes
-- ============================================================

-- 1. Status sesji gotowania
CREATE TYPE cooking_session_status AS ENUM (
  'planned',       -- zaplanowana
  'in_progress',   -- w trakcie
  'paused',        -- wstrzymana
  'completed',     -- zakończona
  'cancelled'      -- anulowana
);

-- 2. Tabela sesji gotowania
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

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela powiązań sesji z posiłkami
CREATE TABLE session_meals (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES cooking_sessions(id) ON DELETE CASCADE,
  planned_meal_id INTEGER NOT NULL REFERENCES planned_meals(id) ON DELETE CASCADE,

  -- Czy to posiłek źródłowy (gotowany) czy leftover
  is_source_meal BOOLEAN DEFAULT true,

  -- Ilość porcji do przygotowania (dla batch cooking)
  portions_to_cook INTEGER DEFAULT 1,

  -- Kolejność w sesji
  cooking_order INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_session_meal UNIQUE (session_id, planned_meal_id)
);

-- 4. Rozszerzenie planned_meals o source_meal_id (leftovers)
ALTER TABLE planned_meals
ADD COLUMN source_meal_id INTEGER REFERENCES planned_meals(id) ON DELETE SET NULL;

COMMENT ON COLUMN planned_meals.source_meal_id IS 'ID posiłku źródłowego dla leftovers';

-- 5. Indeksy
CREATE INDEX idx_cooking_sessions_user_id ON cooking_sessions(user_id);
CREATE INDEX idx_cooking_sessions_planned_date ON cooking_sessions(planned_date);
CREATE INDEX idx_cooking_sessions_status ON cooking_sessions(status);
CREATE INDEX idx_session_meals_session_id ON session_meals(session_id);
CREATE INDEX idx_session_meals_planned_meal_id ON session_meals(planned_meal_id);
CREATE INDEX idx_planned_meals_source_meal_id ON planned_meals(source_meal_id);

-- 6. RLS
ALTER TABLE cooking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_meals ENABLE ROW LEVEL SECURITY;

-- Cooking sessions: użytkownik widzi tylko swoje sesje
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

-- Session meals: użytkownik widzi tylko swoje
CREATE POLICY "Users can view own session meals"
  ON session_meals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cooking_sessions cs
      WHERE cs.id = session_meals.session_id
      AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own session meals"
  ON session_meals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM cooking_sessions cs
      WHERE cs.id = session_meals.session_id
      AND cs.user_id = auth.uid()
    )
  );
```

### 2.3. Tabela postępu kroków: `session_step_progress`

```sql
-- ============================================================
-- Migration: Create session_step_progress table
-- Description: Track progress of individual steps in cooking session
-- ============================================================

CREATE TABLE session_step_progress (
  id SERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES cooking_sessions(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,

  -- Status kroku
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Timer (jeśli aktywny)
  timer_started_at TIMESTAMPTZ,
  timer_duration_seconds INTEGER,

  -- Notatki użytkownika do kroku
  user_notes TEXT,

  CONSTRAINT unique_session_step UNIQUE (session_id, recipe_id, step_number)
);

CREATE INDEX idx_session_step_progress_session_id ON session_step_progress(session_id);
CREATE INDEX idx_session_step_progress_recipe_id ON session_step_progress(recipe_id);

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
```

### 2.4. Diagram ERD

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│    recipes      │     │  recipe_instructions │     │    equipment    │
├─────────────────┤     ├──────────────────────┤     ├─────────────────┤
│ id (PK)         │────<│ recipe_id (FK)       │     │ id (PK)         │
│ name            │     │ step_number          │     │ name            │
│ instructions    │     │ description          │>────│ category        │
│ (JSON-legacy)   │     │ active_minutes       │     └─────────────────┘
│ ...             │     │ passive_minutes      │
└─────────────────┘     │ action_type          │
        │               │ equipment_ids[]      │
        │               │ is_parallelizable    │
        │               └──────────────────────┘
        │
        ▼
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────────────┐
│  planned_meals  │────<│    session_meals     │>────│   cooking_sessions      │
├─────────────────┤     ├──────────────────────┤     ├─────────────────────────┤
│ id (PK)         │     │ session_id (FK)      │     │ id (PK, UUID)           │
│ user_id (FK)    │     │ planned_meal_id (FK) │     │ user_id (FK)            │
│ recipe_id (FK)  │     │ is_source_meal       │     │ planned_date            │
│ meal_date       │     │ portions_to_cook     │     │ status                  │
│ source_meal_id  │     │ cooking_order        │     │ estimated_total_minutes │
│ (FK, nullable)  │     └──────────────────────┘     │ current_step_index      │
└─────────────────┘                                   └─────────────────────────┘
        │                                                      │
        └──────────────────────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │   session_step_progress      │
                    ├──────────────────────────────┤
                    │ session_id (FK)              │
                    │ recipe_id (FK)               │
                    │ step_number                  │
                    │ is_completed                 │
                    │ timer_started_at             │
                    └──────────────────────────────┘
```

---

## 3. Typy TypeScript

### 3.1. Rozszerzenie `database.types.ts`

Po migracji wygenerować nowe typy komendą:

```bash
npx supabase gen types typescript --project-id "<project-ref>" --schema public > src/types/database.types.ts
```

### 3.2. Nowe typy DTO (`src/types/dto.types.ts`)

```typescript
// ============================================================
// Meal Prep Types
// ============================================================

/**
 * Typ akcji kroku instrukcji
 */
export type InstructionActionType = 'active' | 'passive' | 'prep' | 'assembly'

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
 * Wskazówki sensoryczne dla kroku
 */
export interface SensoryCues {
  visual?: string // np. "złocistobrązowy kolor"
  sound?: string // np. "syczy przy kontakcie"
  smell?: string // np. "aromat czosnku"
}

/**
 * Instrukcja przepisu (z nowej tabeli)
 */
export interface RecipeInstructionDTO {
  id: number
  recipe_id: number
  step_number: number
  description: string
  active_minutes: number
  passive_minutes: number
  action_type: InstructionActionType
  is_parallelizable: boolean
  equipment_ids: number[]
  sensory_cues: SensoryCues
  is_critical_timing: boolean
  beginner_time_multiplier: number
}

/**
 * Sesja gotowania
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
  created_at: string
  updated_at: string

  // Relacje
  meals: SessionMealDTO[]
}

/**
 * Posiłek w sesji gotowania
 */
export interface SessionMealDTO {
  id: number
  session_id: string
  planned_meal_id: number
  is_source_meal: boolean
  portions_to_cook: number
  cooking_order: number | null

  // Relacja
  planned_meal: PlannedMealDTO
}

/**
 * Postęp kroku w sesji
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
  user_notes: string | null
}

/**
 * Krok na osi czasu sesji (wygenerowany)
 */
export interface TimelineStep {
  id: string // Unikalny ID kroku
  recipe_id: number
  recipe_name: string
  step_number: number
  description: string
  action_type: InstructionActionType

  // Timing
  start_minute: number // Minuta rozpoczęcia (od startu sesji)
  active_duration: number // Czas aktywny
  passive_duration: number // Czas pasywny
  total_duration: number // Suma active + passive

  // Równoległość
  parallel_group_id: string | null // ID grupy równoległych kroków

  // Sprzęt
  equipment_ids: number[]
  equipment_names: string[]

  // Status
  status: 'pending' | 'active' | 'waiting' | 'completed'

  // Wskazówki
  sensory_cues: SensoryCues
  is_critical: boolean
}

/**
 * Wygenerowana oś czasu sesji
 */
export interface CookingTimeline {
  session_id: string
  total_estimated_minutes: number
  active_minutes: number
  passive_minutes: number
  steps: TimelineStep[]

  // Grupowanie zadań prep
  prep_groups: PrepTaskGroup[]

  // Lista wymaganego sprzętu
  required_equipment: EquipmentDTO[]
}

/**
 * Grupa zadań przygotowawczych (np. "pokrój wszystkie warzywa")
 */
export interface PrepTaskGroup {
  id: string
  name: string // np. "Przygotowanie warzyw"
  tasks: {
    recipe_id: number
    recipe_name: string
    ingredient_name: string
    action: string // np. "pokrój w kostkę"
  }[]
  estimated_minutes: number
}
```

---

## 4. Serwisy i logika biznesowa

### 4.1. `src/services/meal-prep-optimizer.ts`

```typescript
/**
 * Service Layer dla Meal Prep Optimizer
 *
 * Odpowiada za:
 * - Tworzenie sesji gotowania
 * - Generowanie osi czasu z optymalizacją równoległości
 * - Grupowanie zadań przygotowawczych
 * - Obliczanie czasów z uwzględnieniem poziomu umiejętności
 */

import { createAdminClient } from '@/lib/supabase/server'
import type {
  CookingSessionDTO,
  CookingTimeline,
  TimelineStep,
  PrepTaskGroup,
  RecipeInstructionDTO,
  PlannedMealDTO,
  EquipmentDTO,
} from '@/types/dto.types'
import type { Enums } from '@/types/database.types'

// ============================================================
// Types
// ============================================================

type SkillLevel = 'beginner' | 'intermediate' | 'advanced'

interface CreateSessionInput {
  user_id: string
  planned_meal_ids: number[]
  planned_date: string
  planned_start_time?: string
  skill_level?: SkillLevel
}

interface CreateSessionResult {
  session: CookingSessionDTO
  timeline: CookingTimeline
}

// ============================================================
// Constants
// ============================================================

const SKILL_MULTIPLIERS: Record<SkillLevel, number> = {
  beginner: 1.5,
  intermediate: 1.0,
  advanced: 0.8,
}

// ============================================================
// Main Functions
// ============================================================

/**
 * Tworzy nową sesję gotowania
 */
export async function createCookingSession(
  input: CreateSessionInput
): Promise<CreateSessionResult> {
  const supabase = createAdminClient()
  const skillMultiplier = SKILL_MULTIPLIERS[input.skill_level || 'intermediate']

  // 1. Pobierz planned_meals z przepisami i instrukcjami
  const { data: meals, error: mealsError } = await supabase
    .from('planned_meals')
    .select(
      `
      id,
      recipe_id,
      meal_date,
      meal_type,
      recipes (
        id,
        name,
        recipe_instructions (
          id,
          step_number,
          description,
          active_minutes,
          passive_minutes,
          action_type,
          is_parallelizable,
          equipment_ids,
          sensory_cues,
          is_critical_timing,
          beginner_time_multiplier
        ),
        recipe_equipment (
          equipment_id,
          equipment (id, name, category)
        )
      )
    `
    )
    .in('id', input.planned_meal_ids)
    .eq('user_id', input.user_id)

  if (mealsError)
    throw new Error(`Failed to fetch meals: ${mealsError.message}`)
  if (!meals || meals.length === 0) throw new Error('No meals found')

  // 2. Generuj oś czasu
  const timeline = generateTimeline(meals, skillMultiplier)

  // 3. Utwórz sesję w bazie
  const { data: session, error: sessionError } = await supabase
    .from('cooking_sessions')
    .insert({
      user_id: input.user_id,
      planned_date: input.planned_date,
      planned_start_time: input.planned_start_time,
      estimated_total_minutes: timeline.total_estimated_minutes,
      status: 'planned',
    })
    .select()
    .single()

  if (sessionError)
    throw new Error(`Failed to create session: ${sessionError.message}`)

  // 4. Dodaj posiłki do sesji
  const sessionMeals = meals.map((meal, index) => ({
    session_id: session.id,
    planned_meal_id: meal.id,
    is_source_meal: true,
    portions_to_cook: 1,
    cooking_order: index + 1,
  }))

  const { error: sessionMealsError } = await supabase
    .from('session_meals')
    .insert(sessionMeals)

  if (sessionMealsError)
    throw new Error(
      `Failed to add meals to session: ${sessionMealsError.message}`
    )

  return {
    session: { ...session, meals: [] } as CookingSessionDTO,
    timeline,
  }
}

/**
 * Generuje oś czasu gotowania z optymalizacją równoległości
 */
function generateTimeline(
  meals: any[], // PlannedMeal with nested recipes
  skillMultiplier: number
): CookingTimeline {
  const steps: TimelineStep[] = []
  let currentMinute = 0

  // Zbierz wszystkie instrukcje ze wszystkich przepisów
  const allInstructions: {
    recipe_id: number
    recipe_name: string
    instruction: RecipeInstructionDTO
  }[] = []

  for (const meal of meals) {
    const recipe = meal.recipes
    if (!recipe?.recipe_instructions) continue

    for (const instruction of recipe.recipe_instructions) {
      allInstructions.push({
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        instruction,
      })
    }
  }

  // Sortuj instrukcje: prep -> active -> passive -> assembly
  const actionOrder: Record<string, number> = {
    prep: 1,
    active: 2,
    passive: 3,
    assembly: 4,
  }

  allInstructions.sort((a, b) => {
    const orderA = actionOrder[a.instruction.action_type] || 2
    const orderB = actionOrder[b.instruction.action_type] || 2
    if (orderA !== orderB) return orderA - orderB
    return a.instruction.step_number - b.instruction.step_number
  })

  // Generuj kroki osi czasu
  for (const item of allInstructions) {
    const { instruction, recipe_id, recipe_name } = item

    // Oblicz czas z uwzględnieniem poziomu umiejętności
    const activeTime = Math.round(instruction.active_minutes * skillMultiplier)
    const passiveTime = instruction.passive_minutes // Pasywny czas nie zależy od umiejętności

    const step: TimelineStep = {
      id: `${recipe_id}-${instruction.step_number}`,
      recipe_id,
      recipe_name,
      step_number: instruction.step_number,
      description: instruction.description,
      action_type: instruction.action_type as any,
      start_minute: currentMinute,
      active_duration: activeTime,
      passive_duration: passiveTime,
      total_duration: activeTime + passiveTime,
      parallel_group_id: null, // TODO: Implementacja grupowania równoległego
      equipment_ids: instruction.equipment_ids || [],
      equipment_names: [], // TODO: Pobierz nazwy sprzętu
      status: 'pending',
      sensory_cues: instruction.sensory_cues || {},
      is_critical: instruction.is_critical_timing,
    }

    steps.push(step)

    // Aktualizuj currentMinute (uproszczona logika - sekwencyjna)
    // TODO: Zaimplementować równoległość dla kroków pasywnych
    currentMinute += step.active_duration
    if (!instruction.is_parallelizable) {
      currentMinute += step.passive_duration
    }
  }

  // Oblicz sumy
  const totalActive = steps.reduce((sum, s) => sum + s.active_duration, 0)
  const totalPassive = steps.reduce((sum, s) => sum + s.passive_duration, 0)

  // Zbierz wymagany sprzęt
  const equipmentSet = new Set<number>()
  for (const step of steps) {
    step.equipment_ids.forEach((id) => equipmentSet.add(id))
  }

  return {
    session_id: '', // Zostanie ustawione po utworzeniu sesji
    total_estimated_minutes: currentMinute,
    active_minutes: totalActive,
    passive_minutes: totalPassive,
    steps,
    prep_groups: [], // TODO: Implementacja grupowania prep
    required_equipment: [], // TODO: Pobierz pełne dane sprzętu
  }
}

/**
 * Pobiera sesję gotowania z pełnymi danymi
 */
export async function getCookingSession(
  sessionId: string,
  userId: string
): Promise<CookingSessionDTO | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('cooking_sessions')
    .select(
      `
      *,
      session_meals (
        *,
        planned_meals (
          *,
          recipes (
            id,
            name,
            image_url,
            recipe_instructions (*)
          )
        )
      )
    `
    )
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  return data as unknown as CookingSessionDTO
}

/**
 * Aktualizuje status sesji
 */
export async function updateSessionStatus(
  sessionId: string,
  userId: string,
  status: Enums<'cooking_session_status'>,
  currentStepIndex?: number
): Promise<boolean> {
  const supabase = createAdminClient()

  const updateData: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'in_progress' && !updateData.actual_start_at) {
    updateData.actual_start_at = new Date().toISOString()
  }

  if (status === 'completed') {
    updateData.actual_end_at = new Date().toISOString()
  }

  if (currentStepIndex !== undefined) {
    updateData.current_step_index = currentStepIndex
  }

  const { error } = await supabase
    .from('cooking_sessions')
    .update(updateData)
    .eq('id', sessionId)
    .eq('user_id', userId)

  return !error
}

/**
 * Oznacza krok jako ukończony
 */
export async function completeStep(
  sessionId: string,
  recipeId: number,
  stepNumber: number
): Promise<boolean> {
  const supabase = createAdminClient()

  const { error } = await supabase.from('session_step_progress').upsert({
    session_id: sessionId,
    recipe_id: recipeId,
    step_number: stepNumber,
    is_completed: true,
    completed_at: new Date().toISOString(),
  })

  return !error
}

/**
 * Grupuje posiłki na dany dzień do batch cooking
 */
export async function getMealsForBatchCooking(
  userId: string,
  date: string
): Promise<PlannedMealDTO[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('planned_meals')
    .select(
      `
      *,
      recipes (
        id,
        name,
        image_url,
        prep_time_min,
        cook_time_min,
        difficulty_level,
        recipe_equipment (
          equipment_id,
          equipment (id, name, category)
        )
      )
    `
    )
    .eq('user_id', userId)
    .eq('meal_date', date)
    .is('source_meal_id', null) // Tylko oryginalne posiłki, nie leftovers
    .order('meal_type')

  if (error) throw new Error(`Failed to fetch meals: ${error.message}`)

  return (data || []) as unknown as PlannedMealDTO[]
}
```

### 4.2. Server Actions (`src/lib/actions/cooking-sessions.ts`)

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import {
  createCookingSession,
  getCookingSession,
  updateSessionStatus,
  completeStep,
  getMealsForBatchCooking,
} from '@/services/meal-prep-optimizer'
import type { ActionResult } from '@/types/actions'
import type { CookingSessionDTO, CookingTimeline } from '@/types/dto.types'

/**
 * Tworzy nową sesję gotowania
 */
export async function createSessionAction(
  plannedMealIds: number[],
  plannedDate: string,
  plannedStartTime?: string
): Promise<
  ActionResult<{ session: CookingSessionDTO; timeline: CookingTimeline }>
> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    const result = await createCookingSession({
      user_id: user.id,
      planned_meal_ids: plannedMealIds,
      planned_date: plannedDate,
      planned_start_time: plannedStartTime,
    })

    revalidatePath('/meal-prep')

    return { data: result }
  } catch (error) {
    console.error('createSessionAction error:', error)
    return { error: 'Nie udało się utworzyć sesji gotowania' }
  }
}

/**
 * Pobiera sesję gotowania
 */
export async function getSessionAction(
  sessionId: string
): Promise<ActionResult<CookingSessionDTO>> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    const session = await getCookingSession(sessionId, user.id)

    if (!session) {
      return { error: 'Sesja nie została znaleziona' }
    }

    return { data: session }
  } catch (error) {
    console.error('getSessionAction error:', error)
    return { error: 'Nie udało się pobrać sesji' }
  }
}

/**
 * Rozpoczyna sesję gotowania
 */
export async function startSessionAction(
  sessionId: string
): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    const success = await updateSessionStatus(sessionId, user.id, 'in_progress')

    if (!success) {
      return { error: 'Nie udało się rozpocząć sesji' }
    }

    revalidatePath('/meal-prep')

    return { data: true }
  } catch (error) {
    console.error('startSessionAction error:', error)
    return { error: 'Nie udało się rozpocząć sesji' }
  }
}

/**
 * Kończy sesję gotowania
 */
export async function completeSessionAction(
  sessionId: string
): Promise<ActionResult<boolean>> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    const success = await updateSessionStatus(sessionId, user.id, 'completed')

    if (!success) {
      return { error: 'Nie udało się zakończyć sesji' }
    }

    revalidatePath('/meal-prep')
    revalidatePath('/dashboard')

    return { data: true }
  } catch (error) {
    console.error('completeSessionAction error:', error)
    return { error: 'Nie udało się zakończyć sesji' }
  }
}

/**
 * Oznacza krok jako ukończony
 */
export async function completeStepAction(
  sessionId: string,
  recipeId: number,
  stepNumber: number
): Promise<ActionResult<boolean>> {
  try {
    const success = await completeStep(sessionId, recipeId, stepNumber)

    if (!success) {
      return { error: 'Nie udało się oznaczyć kroku' }
    }

    return { data: true }
  } catch (error) {
    console.error('completeStepAction error:', error)
    return { error: 'Nie udało się oznaczyć kroku' }
  }
}

/**
 * Pobiera posiłki do batch cooking na dany dzień
 */
export async function getMealsForDateAction(
  date: string
): Promise<ActionResult<PlannedMealDTO[]>> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Musisz być zalogowany' }
    }

    const meals = await getMealsForBatchCooking(user.id, date)

    return { data: meals }
  } catch (error) {
    console.error('getMealsForDateAction error:', error)
    return { error: 'Nie udało się pobrać posiłków' }
  }
}
```

---

## 5. Komponenty UI

### 5.1. Struktura katalogów

```
src/components/meal-prep/
├── PrepSessionPlanner.tsx      # Wybór dań do sesji
├── CookingTimeline.tsx         # Główny kokpit z osią czasu
├── TimelineStep.tsx            # Pojedynczy krok na osi
├── ActiveTimer.tsx             # Timer z powiadomieniami
├── PrepChecklist.tsx           # Checklist przed startem
├── EquipmentNeeded.tsx         # Lista wymaganego sprzętu
├── StepCard.tsx                # Karta pojedynczego kroku
├── SensoryCuesBadge.tsx        # Badge z wskazówkami sensorycznymi
└── SessionSummary.tsx          # Podsumowanie sesji
```

### 5.2. Główne komponenty

#### `PrepSessionPlanner.tsx`

- Wyświetla posiłki na wybrany dzień
- Pozwala wybrać które dania gotować razem
- Pokazuje szacowany czas i wymagany sprzęt
- Przycisk "Zacznij gotować"

#### `CookingTimeline.tsx`

- Oś czasu z wszystkimi krokami
- Podświetlanie aktualnego kroku
- Progress bar całej sesji
- Timery dla kroków pasywnych
- Wskaźniki równoległości

#### `ActiveTimer.tsx`

- Odliczanie czasu z Web Notifications API
- Dźwięk alarmu (opcjonalny)
- Pauza/wznów
- "+1 min" / "-1 min" przyciski

### 5.3. Wireframe głównego widoku

```
┌──────────────────────────────────────────────────────────────┐
│  🍳 Sesja gotowania - 6 stycznia 2026                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 45%                  │
│  Szacowany czas: 1h 15min | Pozostało: ~40min                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ✅ Krok 1: Przygotuj składniki          [Jajecznica]    │ │
│  │    Pokrój szczypiorek, rozbij jajka do miski            │ │
│  │    ⏱ 5 min aktywnie                                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ 🔄 Krok 2: Smaż jajecznicę              [Jajecznica]    │ │
│  │    Rozgrzej patelnię, dodaj masło...                    │ │
│  │    🍳 Patelnia | 👀 złocisty kolor                       │ │
│  │    ⏱ 8 min aktywnie                                      │ │
│  │    ┌──────────────────────────────────────┐              │ │
│  │    │  ⏱ 3:45 pozostało    [Pauza] [+1min] │              │ │
│  │    └──────────────────────────────────────┘              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ ⏳ Krok 3: Przygotuj sałatkę            [Sałatka]       │ │
│  │    Pokrój pomidory i ogórki...                          │ │
│  │    🔪 Deska, Nóż                                         │ │
│  │    ⏱ 10 min aktywnie                                     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────┐                                   │
│  │ [Wstrzymaj sesję]     │  [Zakończ sesję]                 │
│  └───────────────────────┘                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Plan migracji danych

### 6.1. Strategia migracji instrukcji

Migracja z JSON (`recipes.instructions`) do tabeli `recipe_instructions` będzie przebiegać w 3 etapach:

#### Etap 1: Utworzenie tabeli (bez usuwania JSON)

```sql
-- Uruchom migrację tworzącą recipe_instructions
-- JSON pozostaje jako fallback
```

#### Etap 2: Migracja danych

```sql
-- Skrypt migracji danych z JSON do tabeli
INSERT INTO recipe_instructions (recipe_id, step_number, description)
SELECT
  r.id as recipe_id,
  (step->>'step')::integer as step_number,
  step->>'description' as description
FROM recipes r,
LATERAL jsonb_array_elements(r.instructions::jsonb) as step
ON CONFLICT (recipe_id, step_number) DO NOTHING;
```

#### Etap 3: Aktualizacja kodu

- Zmień `RecipeDTO` aby pobierał z `recipe_instructions`
- Dodaj fallback na JSON dla starych danych
- Po weryfikacji - usuń kolumnę `recipes.instructions`

### 6.2. Backward compatibility

```typescript
// src/lib/utils/recipe-transformer.ts

export function getRecipeInstructions(
  recipe: RecipeWithInstructions
): RecipeInstructionDTO[] {
  // Preferuj nową tabelę
  if (recipe.recipe_instructions && recipe.recipe_instructions.length > 0) {
    return recipe.recipe_instructions
  }

  // Fallback na JSON (legacy)
  if (recipe.instructions && Array.isArray(recipe.instructions)) {
    return recipe.instructions.map((step, index) => ({
      id: 0,
      recipe_id: recipe.id,
      step_number: step.step || index + 1,
      description: step.description,
      active_minutes: 0,
      passive_minutes: 0,
      action_type: 'active' as const,
      is_parallelizable: false,
      equipment_ids: [],
      sensory_cues: {},
      is_critical_timing: false,
      beginner_time_multiplier: 1.5,
    }))
  }

  return []
}
```

---

## 7. Timeline implementacji

### Faza 1: Fundamenty (5-7 dni)

| Dzień | Zadanie                                          | Estymacja |
| ----- | ------------------------------------------------ | --------- |
| 1     | Migracja DB: `recipe_instructions`               | 4h        |
| 1     | Migracja DB: `cooking_sessions`, `session_meals` | 3h        |
| 2     | Migracja danych JSON → tabela                    | 2h        |
| 2     | Generowanie nowych typów TypeScript              | 1h        |
| 2-3   | Serwis `meal-prep-optimizer.ts` (podstawy)       | 8h        |
| 3-4   | Server Actions dla sesji                         | 6h        |
| 4-5   | Komponenty UI: `PrepSessionPlanner`              | 8h        |
| 5-6   | Komponenty UI: `CookingTimeline`, `StepCard`     | 10h       |
| 6-7   | Komponenty UI: `ActiveTimer` z notifications     | 6h        |
| 7     | Strona `/meal-prep` + routing                    | 4h        |
| 7     | Testy jednostkowe                                | 4h        |

**Suma Faza 1**: ~56h (7 dni roboczych)

### Faza 2: Rozszerzenia (4-6 dni)

| Zadanie                              | Estymacja |
| ------------------------------------ | --------- |
| Logika równoległości kroków          | 8h        |
| Grupowanie zadań prep                | 6h        |
| Leftovers tracking (batch cooking)   | 8h        |
| Kitchen Profile (sprzęt użytkownika) | 6h        |
| Pre-prep notifications               | 4h        |
| Responsywność mobile                 | 6h        |
| Testy E2E                            | 4h        |

**Suma Faza 2**: ~42h (5-6 dni)

### Faza 3: Przyszłe rozszerzenia (TBD)

- ML do personalizacji czasów
- Voice control
- Photo checkpoints
- Integracja z listą zakupów (auto-grouping)

---

## 8. Ryzyka i mitygacje

### Ryzyko 1: Migracja danych instrukcji

- **Problem**: Utrata danych lub niespójność
- **Mitygacja**: Zachowaj JSON jako fallback, migruj stopniowo, waliduj po migracji

### Ryzyko 2: Wydajność generowania osi czasu

- **Problem**: Wolne generowanie dla wielu przepisów
- **Mitygacja**: Cache'owanie, eager loading, optymalizacja zapytań

### Ryzyko 3: Web Notifications API

- **Problem**: Brak wsparcia w niektórych przeglądarkach
- **Mitygacja**: Graceful degradation, fallback na dźwięk w przeglądarce

### Ryzyko 4: Złożoność logiki równoległości

- **Problem**: Trudna implementacja i testowanie
- **Mitygacja**: MVP bez pełnej równoległości, dodaj w Fazie 2

---

## Podsumowanie

Dokument przedstawia kompleksowy plan implementacji funkcjonalności Advanced Meal Prep. Kluczowe decyzje:

1. **Migracja do relacyjnej struktury** - `recipe_instructions` jako osobna tabela
2. **Zachowanie backward compatibility** - JSON jako fallback
3. **Fazowe wdrożenie** - MVP w 7 dni, rozszerzenia w kolejnych 5-6 dniach
4. **Focus na UX** - Timery, powiadomienia, wskazówki sensoryczne

---

**Następne kroki po zatwierdzeniu**:

1. Utworzenie migracji SQL
2. Wygenerowanie typów TypeScript
3. Implementacja serwisu `meal-prep-optimizer.ts`
4. Budowa komponentów UI
