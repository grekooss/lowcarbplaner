# Modul Meal Prep - Planowanie

## 1. Analiza obecnego stanu

### Dostepne dane w systemie

- **Czasy gotowania**: `prep_time_min`, `cook_time_min` w tabeli `recipes`
- **Instrukcje**: JSON array `[{step, description}]` - kroki przepisu
- **Skladniki**: powiazanie przez `recipe_ingredients` z `step_number` (ktory krok)
- **Sprzet**: tabela `equipment` (30+ narzedzi) + `recipe_equipment` (junction)
- **Poziom trudnosci**: `difficulty_level` (easy/medium/hard)
- **Plan posilkow**: `planned_meals` z datami i przepisami

### Brakujace dane (do dodania)

- Czas wykonania kroków (`step_duration_min` per instruction)
- Typ czynnosci (`action_type`: prep/cook/passive/rest)
- Czy krok wymaga nadzoru (`requires_attention`)
- Mozliwosc laczenia czynnosci (`parallelizable`)
- Temperatura gotowania (dla optymalizacji piekarnika)

---

## 2. Proponowane funkcjonalnosci

### 2.1 Widok Meal Prep Session

**Cel**: Optymalne przygotowanie posilkow na kilka dni z wyprzedzeniem

```
+------------------------------------------+
|  MEAL PREP SESSION                       |
|  Sobota, 28.12 | 3 przepisy | ~2h 15min  |
+------------------------------------------+
|                                          |
|  [Timeline wizualna]                     |
|  14:00 -------- 15:00 -------- 16:15    |
|  |===PREP===|   |===GOTOWANIE===|       |
|                                          |
|  Aktualne czynnosci:                     |
|  - Piekarnik: Kurczak (jeszcze 25min)    |
|  - Patelnia: Wolna                       |
|  - Ty: Krojenie warzyw do salatki        |
|                                          |
+------------------------------------------+
```

### 2.2 Smart Batch Cooking

**Algorytm laczenia czynnosci**:

1. **Grupowanie skladnikow**
   - Wspolne skladniki z roznych przepisow -> jedno krojenie
   - Np. cebula w 3 przepisach = pokroj 3 cebule naraz

2. **Optymalizacja sprzetu**
   - Piekarnik: lacz przepisy o podobnej temperaturze (±10°C)
   - Patelnia: sekwencjonowanie wedlug tlustosci (najpierw mieso, potem warzywa)
   - Garnek: zupy/sosy moga gotowac sie rownolegle

3. **Czynnosci pasywne vs aktywne**
   - Pasywne: gotowanie, pieczenie, marynowanie -> rownolegle
   - Aktywne: krojenie, mieszanie -> sekwencyjnie

### 2.3 Prep Scheduler

**Planowanie z wyprzedzeniem**:

```typescript
interface PrepSession {
  id: string
  user_id: string
  scheduled_date: Date // Kiedy gotujemy
  target_dates: Date[] // Na ktore dni przygotowujemy
  planned_meal_ids: string[] // Ktore posilki
  estimated_duration_min: number
  status: 'planned' | 'in_progress' | 'completed'
}
```

**Widok tygodniowy**:

```
Pon  Wto  Sro  Czw  Pia  Sob  Nie
 |    |    |    |    |    |    |
 v    v    v    v    |    |    |
[========PREP SESSION========]
        Sobota 14:00
        Przygotuj: Pon-Czw
```

### 2.4 Cooking Timer & Steps

**Interaktywny asystent gotowania**:

1. **Step-by-step mode**
   - Duzy tekst instrukcji
   - Przycisk "Zrobione" -> nastepny krok
   - Timer dla czynnosci czasowych
   - Powiadomienia audio/push

2. **Parallel cooking view**
   - Kilka przepisow naraz
   - Unified timeline
   - "Teraz rob X, za 5 min sprawdz Y"

3. **Smart notifications**
   - "Za 2 min obróc kurczaka"
   - "Piekarnik wolny - wstaw zapiekanke"
   - "Czas odpoczynku miesa - 10 min"

### 2.5 Equipment Checklist

**Przed rozpoczeciem**:

- Automatyczna lista sprzetu dla wszystkich przepisow
- Checkboxy do odhaczania
- Alerty o brakujacym sprzecie
- Sugestie zamiennikow

### 2.6 Ingredient Prep List

**Lista przygotowania skladnikow**:

```
PRZYGOTOWANIE SKLADNIKOW
========================
KROJENIE (15 min)
[ ] Cebula x3 - pokroj w kostke
    -> Kurczak curry, Zapiekanka, Salatka
[ ] Papryka x2 - pokroj w paski
    -> Kurczak curry, Wrap

MIERZENIE (5 min)
[ ] Oliwa 45ml (3x15ml)
[ ] Sol 2 lyzeczki

WCZESNIEJSZE PRZYGOTOWANIE
[ ] Kurczak - zamarynuj min 30 min przed
```

---

## 3. Struktura bazy danych

### Nowe tabele

```sql
-- Rozszerzenie instructions w recipes
-- Zmiana z JSON na JSONB z rozszerzonym schematem
ALTER TABLE content.recipes
  ALTER COLUMN instructions TYPE JSONB;

-- Schemat instruction step:
-- {
--   "step": 1,
--   "description": "Pokroj cebule w kostke",
--   "duration_min": 5,
--   "action_type": "prep",        -- prep/cook/passive/rest
--   "requires_attention": true,
--   "equipment_id": 123,          -- opcjonalne
--   "temperature_celsius": null,  -- dla pieczenia
--   "parallelizable": true
-- }

-- Sesje meal prep
CREATE TABLE public.prep_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  target_start_date DATE NOT NULL,
  target_end_date DATE NOT NULL,
  status prep_session_status DEFAULT 'planned',
  estimated_duration_min INTEGER,
  actual_duration_min INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE prep_session_status AS ENUM (
  'planned', 'in_progress', 'completed', 'cancelled'
);

-- Posilki w sesji prep
CREATE TABLE public.prep_session_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prep_session_id UUID REFERENCES prep_sessions ON DELETE CASCADE,
  planned_meal_id UUID REFERENCES planned_meals,
  preparation_order INTEGER,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ
);

-- Aktywne timery (dla powiadomien)
CREATE TABLE public.active_timers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  prep_session_id UUID REFERENCES prep_sessions,
  recipe_id INTEGER REFERENCES content.recipes,
  step_number INTEGER,
  timer_name TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  notification_sent BOOLEAN DEFAULT FALSE
);
```

### Rozszerzenie istniejacych tabel

```sql
-- Dodanie do recipe_ingredients
ALTER TABLE content.recipe_ingredients
  ADD COLUMN prep_action TEXT,           -- 'dice', 'slice', 'mince', 'grate', etc.
  ADD COLUMN prep_size TEXT;             -- 'fine', 'medium', 'coarse'

-- Indeksy dla wydajnosci
CREATE INDEX idx_prep_sessions_user_date
  ON prep_sessions(user_id, scheduled_date);
CREATE INDEX idx_active_timers_ends_at
  ON active_timers(ends_at) WHERE NOT is_completed;
```

---

## 4. Serwisy i logika biznesowa

### 4.1 PrepSessionGenerator

```typescript
// src/services/prep-session-generator.ts

interface PrepSessionConfig {
  userId: string
  targetDates: Date[] // Dni na ktore przygotowujemy
  scheduledDate: Date // Kiedy gotujemy
  scheduledTime?: string // Opcjonalna godzina startu
}

interface PrepStep {
  stepId: string
  recipeId: number
  recipeName: string
  stepNumber: number
  description: string
  durationMin: number
  actionType: 'prep' | 'cook' | 'passive' | 'rest'
  requiresAttention: boolean
  equipmentId?: number
  equipmentName?: string
  temperatureCelsius?: number
  startOffset: number // Minuty od startu sesji
  parallelizable: boolean
  ingredientIds?: number[] // Skladniki uzyte w tym kroku
}

interface OptimizedPrepPlan {
  totalDurationMin: number
  steps: PrepStep[]
  parallelGroups: PrepStep[][] // Kroki wykonywane rownolegle
  equipmentTimeline: Map<number, PrepStep[]>
  sharedIngredients: SharedIngredient[]
}

interface SharedIngredient {
  ingredientId: number
  ingredientName: string
  totalAmount: number
  unit: string
  prepAction: string
  usedInRecipes: { recipeId: number; recipeName: string; amount: number }[]
}

export class PrepSessionGenerator {
  // Glowna funkcja generujaca zoptymalizowany plan
  async generateOptimizedPlan(
    plannedMeals: PlannedMealDTO[]
  ): Promise<OptimizedPrepPlan>

  // Grupowanie wspolnych skladnikow
  private groupSharedIngredients(recipes: RecipeDTO[]): SharedIngredient[]

  // Optymalizacja kolejnosci krokow
  private optimizeStepOrder(steps: PrepStep[]): PrepStep[][]

  // Wykrywanie mozliwosci rownoleglosci
  private findParallelOpportunities(steps: PrepStep[]): PrepStep[][]

  // Optymalizacja uzycia piekarnika
  private optimizeOvenUsage(ovenSteps: PrepStep[]): PrepStep[][]

  // Estymacja calkowitego czasu
  private estimateTotalDuration(parallelGroups: PrepStep[][]): number
}
```

### 4.2 CookingAssistant

```typescript
// src/services/cooking-assistant.ts

interface ActiveCookingSession {
  sessionId: string
  currentSteps: ActiveStep[]
  completedSteps: string[]
  activeTimers: Timer[]
  nextActions: NextAction[]
}

interface ActiveStep {
  stepId: string
  recipeName: string
  description: string
  startedAt: Date
  estimatedEndAt?: Date
  requiresAttention: boolean
}

interface Timer {
  id: string
  name: string
  endsAt: Date
  remainingSeconds: number
  recipeId: number
  stepNumber: number
}

interface NextAction {
  description: string
  inMinutes: number
  priority: 'high' | 'medium' | 'low'
  type: 'start' | 'check' | 'flip' | 'remove' | 'add'
}

export class CookingAssistant {
  // Rozpoczecie sesji gotowania
  async startSession(prepSessionId: string): Promise<ActiveCookingSession>

  // Oznaczenie kroku jako wykonany
  async completeStep(
    sessionId: string,
    stepId: string
  ): Promise<ActiveCookingSession>

  // Uruchomienie timera
  async startTimer(
    sessionId: string,
    stepId: string,
    durationSeconds: number,
    name: string
  ): Promise<Timer>

  // Pobranie aktualnego stanu
  async getCurrentState(sessionId: string): Promise<ActiveCookingSession>

  // Pobranie nadchodzacych akcji
  async getUpcomingActions(
    sessionId: string,
    nextMinutes: number
  ): Promise<NextAction[]>
}
```

### 4.3 EquipmentOptimizer

```typescript
// src/services/equipment-optimizer.ts

interface EquipmentUsage {
  equipmentId: number
  equipmentName: string
  category: equipment_category_enum
  usageSlots: TimeSlot[]
  totalUsageMin: number
}

interface TimeSlot {
  startMin: number
  endMin: number
  recipeId: number
  recipeName: string
  stepDescription: string
}

interface EquipmentConflict {
  equipmentId: number
  equipmentName: string
  conflictingRecipes: string[]
  suggestedResolution: string
}

export class EquipmentOptimizer {
  // Analiza uzycia sprzetu
  analyzeEquipmentUsage(recipes: RecipeDTO[]): EquipmentUsage[]

  // Wykrywanie konfliktow
  detectConflicts(usages: EquipmentUsage[]): EquipmentConflict[]

  // Sugestie zamiennikow
  suggestAlternatives(missingEquipment: number[]): Map<number, number[]>

  // Optymalizacja timeline sprzetu
  optimizeTimeline(usages: EquipmentUsage[]): EquipmentUsage[]
}
```

---

## 5. Komponenty UI

### 5.1 Struktura stron

```
app/
├── meal-prep/
│   ├── page.tsx                    # Lista sesji prep
│   ├── new/
│   │   └── page.tsx                # Tworzenie nowej sesji
│   ├── [sessionId]/
│   │   ├── page.tsx                # Szczegoly sesji
│   │   ├── cooking/
│   │   │   └── page.tsx            # Tryb gotowania
│   │   └── checklist/
│   │       └── page.tsx            # Checklista przed startem

src/components/meal-prep/
├── PrepSessionCard.tsx             # Karta sesji na liscie
├── PrepSessionWizard/
│   ├── index.tsx                   # Wizard tworzenia sesji
│   ├── DateSelector.tsx            # Wybor dat
│   ├── MealSelector.tsx            # Wybor posilkow
│   └── SummaryStep.tsx             # Podsumowanie
├── PrepTimeline/
│   ├── index.tsx                   # Glowna timeline
│   ├── TimelineStep.tsx            # Pojedynczy krok
│   ├── ParallelGroup.tsx           # Grupa rownolegla
│   └── EquipmentLane.tsx           # Pas sprzetu
├── CookingMode/
│   ├── index.tsx                   # Tryb gotowania
│   ├── CurrentStep.tsx             # Aktualny krok
│   ├── ActiveTimers.tsx            # Aktywne timery
│   ├── TimerWidget.tsx             # Pojedynczy timer
│   ├── NextActions.tsx             # Nadchodzace akcje
│   └── QuickActions.tsx            # Szybkie akcje
├── Checklists/
│   ├── EquipmentChecklist.tsx      # Lista sprzetu
│   ├── IngredientPrepList.tsx      # Lista skladnikow
│   └── ChecklistItem.tsx           # Pojedynczy item
└── shared/
    ├── DurationBadge.tsx           # Badge z czasem
    ├── DifficultyIndicator.tsx     # Wskaznik trudnosci
    └── ProgressRing.tsx            # Pierscien postepu
```

### 5.2 Przykladowe komponenty

```tsx
// PrepTimeline - wizualizacja planu
<PrepTimeline>
  <TimelineHeader totalDuration='2h 15min' startTime='14:00' endTime='16:15' />

  <EquipmentLanes>
    <EquipmentLane name='Piekarnik' icon='oven'>
      <TimeSlot start={30} end={75} recipe='Kurczak' />
      <TimeSlot start={80} end={110} recipe='Zapiekanka' />
    </EquipmentLane>

    <EquipmentLane name='Patelnia' icon='pan'>
      <TimeSlot start={0} end={20} recipe='Warzywa' />
    </EquipmentLane>

    <EquipmentLane name='Ty' icon='user'>
      <TimeSlot start={0} end={15} recipe='Krojenie' />
      <TimeSlot start={15} end={25} recipe='Przyprawianie' />
      {/* Przerwa 5 min */}
      <TimeSlot start={30} end={45} recipe='Mieszanie' />
    </EquipmentLane>
  </EquipmentLanes>
</PrepTimeline>
```

```tsx
// CookingMode - tryb gotowania
<CookingMode session={session}>
  <CurrentStepCard>
    <StepNumber>Krok 3/12</StepNumber>
    <RecipeName>Kurczak curry</RecipeName>
    <StepDescription>
      Dodaj pokrojona paprykę i smaż 3 minuty, mieszajac co jakis czas.
    </StepDescription>
    <TimerButton duration={180} />
    <CompleteButton onClick={handleComplete} />
  </CurrentStepCard>

  <ActiveTimers>
    <TimerWidget
      name='Ryz'
      remaining='8:45'
      total='15:00'
      onComplete={handleTimerComplete}
    />
    <TimerWidget name='Piekarnik - kurczak' remaining='23:15' total='45:00' />
  </ActiveTimers>

  <NextActionsPanel>
    <NextAction time='za 3 min' action='Sprawdz ryz' priority='medium' />
    <NextAction time='za 8 min' action='Wyjmij ryz z ognia' priority='high' />
  </NextActionsPanel>
</CookingMode>
```

---

## 6. Flow uzytkownika

### 6.1 Tworzenie sesji Meal Prep

```
1. Dashboard/Meal Plan
   [Przycisk "Zaplanuj Meal Prep"]
         |
         v
2. Wybor dni docelowych
   "Na ktore dni chcesz przygotowac posilki?"
   [Pon] [Wto] [Sro] [Czw] [Pia]
         |
         v
3. Wybor posilkow
   Automatycznie zaznaczone wszystkie z wybranych dni
   Mozliwosc odznaczenia pojedynczych
   Podglad: "5 przepisow | ~2h 30min | 12 skladnikow"
         |
         v
4. Wybor daty gotowania
   "Kiedy chcesz gotowac?"
   [Sobota 28.12] [Godzina: 14:00]
         |
         v
5. Podsumowanie i optymalizacja
   - Lista wspolnych skladnikow
   - Wymagany sprzet
   - Zoptymalizowany timeline
   [Utworz sesje]
```

### 6.2 Przeprowadzenie sesji

```
1. Przed startem
   Checklist sprzetu [x] [x] [x] [x]
   Checklist skladnikow [x] [x] [x]
   [Zaczynam gotowac!]
         |
         v
2. Etap przygotowania (PREP)
   - Krojenie wspolnych skladnikow
   - Odmierzanie przypraw
   - Marynowanie (jesli wymagane)
         |
         v
3. Etap gotowania (COOK)
   - Interaktywne instrukcje
   - Timery i powiadomienia
   - Widok rownolegly
         |
         v
4. Zakonczenie
   - Podsumowanie czasu
   - Oznaczenie posilkow jako przygotowane
   - Instrukcje przechowywania
```

---

## 7. Notyfikacje i timery

### 7.1 Typy powiadomien

```typescript
type NotificationType =
  | 'timer_ending' // Timer konczy sie za 1 min
  | 'timer_ended' // Timer zakonczony
  | 'next_action' // Czas na nastepna czynnosc
  | 'check_required' // Sprawdz potrawe
  | 'temperature_ready' // Piekarnik nagrzany
  | 'prep_reminder' // Przypomnienie o prep (1h przed)
```

### 7.2 Implementacja

```typescript
// Wykorzystanie Web Notifications API + Service Worker
// dla powiadomien nawet gdy zakladka nieaktywna

// src/lib/notifications/prep-notifications.ts
export class PrepNotificationService {
  async scheduleTimerNotification(timer: Timer): Promise<void>

  async scheduleActionReminder(
    action: NextAction,
    sessionId: string
  ): Promise<void>

  async requestPermission(): Promise<boolean>

  // Vibration pattern dla mobilnych
  private getVibrationPattern(type: NotificationType): number[]
}
```

---

## 8. Integracja z istniejacymi modulami

### 8.1 Dashboard

- Nowy widget "Nadchodzace Meal Prep"
- Quick action "Zaplanuj prep na weekend"
- Status przygotowanych posilkow

### 8.2 Meal Plan

- Ikona przy posilkach zaplanowanych do prep
- Mozliwosc dodania do sesji prep z widoku tygodniowego
- Filtr "Pokaz tylko nieprzygotowane"

### 8.3 Shopping List

- Generowanie listy zakupow dla sesji prep
- Grupowanie skladnikow wg sesji
- "Kup na prep sobotni"

### 8.4 Recipes

- Badge "Meal Prep Friendly" dla przepisow
- Filtr przepisow nadajacych sie do prep
- Informacja o czasie przechowywania

---

## 9. Fazy implementacji

### Faza 1: Fundament (MVP)

- [ ] Rozszerzenie schematu bazy danych
- [ ] PrepSessionGenerator - podstawowa wersja
- [ ] UI tworzenia sesji (wizard)
- [ ] Widok listy sesji
- [ ] Podstawowa timeline

### Faza 2: Tryb gotowania

- [ ] CookingAssistant service
- [ ] UI trybu gotowania
- [ ] System timerow (localStorage)
- [ ] Podstawowe powiadomienia

### Faza 3: Optymalizacja

- [ ] EquipmentOptimizer
- [ ] Grupowanie wspolnych skladnikow
- [ ] Zaawansowana timeline z lanes
- [ ] Wykrywanie konfliktow sprzetu

### Faza 4: Polish

- [ ] Push notifications (Service Worker)
- [ ] Offline support dla trybu gotowania
- [ ] Instrukcje przechowywania
- [ ] Historia sesji i statystyki
- [ ] Sugestie AI dla optymalizacji

---

## 10. Metryki sukcesu

- **Adoption rate**: % uzytkownikow korzystajacych z meal prep
- **Completion rate**: % ukonczonych sesji prep
- **Time accuracy**: Roznica miedzy estymowanym a rzeczywistym czasem
- **User satisfaction**: Ocena przydatnosci modulu
- **Meal prep frequency**: Srednia liczba sesji/miesiac

---

## 11. Pytania do rozstrzygniecia

1. **Przechowywanie**: Czy dodac informacje o czasie przechowywania przepisow?
2. **Porcje**: Czy wspierac przygotowywanie wielokrotnosci przepisu?
3. **Personalizacja**: Czy uzytkownik moze dostosowac czasy prep?
4. **Social**: Czy dodac mozliwosc wspolnego meal prep (2+ osoby)?
5. **Shopping integration**: Czy automatycznie oznaczac zakupy jako "do kupienia na prep"?
