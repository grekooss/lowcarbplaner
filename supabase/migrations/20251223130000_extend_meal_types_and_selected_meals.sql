-- ============================================
-- Migration: Extend meal types and add selected_meals
-- Description: Rozszerza typy posiłków o snack_morning/snack_afternoon i dodaje wybór posiłków dla konfiguracji 2_main
-- Author: Claude Code
-- Date: 2025-12-23
-- ============================================

-- 1. Rozszerz enum meal_type_enum o nowe typy przekąsek
-- UWAGA: PostgreSQL nie pozwala na usunięcie wartości z enum, więc 'snack' pozostaje dla kompatybilności wstecznej
alter type public.meal_type_enum add value if not exists 'snack_morning';
alter type public.meal_type_enum add value if not exists 'snack_afternoon';

-- 2. Dodaj kolumnę selected_meals do tabeli profiles
-- Przechowuje wybrane typy posiłków dla konfiguracji '2_main' (użytkownik wybiera które 2 posiłki)
-- Dla innych konfiguracji może być NULL (używana jest domyślna konfiguracja)
alter table public.profiles
  add column if not exists selected_meals public.meal_type_enum[] default null;

-- 3. Dodaj constraint sprawdzający poprawność selected_meals
-- Dla '2_main' musi zawierać dokładnie 2 elementy
-- Dla innych konfiguracji może być NULL
alter table public.profiles
  add constraint check_selected_meals_for_2_main
  check (
    (meal_plan_type != '2_main')
    or
    (meal_plan_type = '2_main' and selected_meals is not null and array_length(selected_meals, 1) = 2)
  );

-- 4. Dodaj constraint sprawdzający dozwolone wartości w selected_meals
-- Tylko główne posiłki mogą być wybierane (breakfast, lunch, dinner)
alter table public.profiles
  add constraint check_selected_meals_values
  check (
    selected_meals is null
    or
    selected_meals <@ array['breakfast'::public.meal_type_enum, 'lunch'::public.meal_type_enum, 'dinner'::public.meal_type_enum]
  );

-- 5. Zaktualizuj istniejące profile z '2_main' aby miały domyślny wybór (lunch, dinner)
update public.profiles
set selected_meals = array['lunch'::public.meal_type_enum, 'dinner'::public.meal_type_enum]
where meal_plan_type = '2_main' and selected_meals is null;

-- 6. Migracja istniejących danych: zamień 'snack' na odpowiednie typy
-- Dla konfiguracji 3_main_2_snacks: pierwsza przekąska to snack_morning, druga to snack_afternoon
-- Dla konfiguracji 3_main_1_snack: przekąska to snack_afternoon
-- UWAGA: Ta migracja wymaga analizy istniejących danych planned_meals
-- Na razie zostawiamy 'snack' jako valid dla kompatybilności wstecznej

-- 7. Komentarze dla dokumentacji
comment on column public.profiles.selected_meals is 'Wybrane typy posiłków dla konfiguracji 2_main (array 2 elementów: breakfast/lunch/dinner). NULL dla innych konfiguracji.';

-- 8. Indeks dla szybszego filtrowania po meal_plan_type
create index if not exists idx_profiles_meal_plan_type on public.profiles(meal_plan_type);
