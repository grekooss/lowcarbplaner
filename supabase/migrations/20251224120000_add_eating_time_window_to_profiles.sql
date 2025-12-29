-- ============================================
-- Migration: Add eating time window to profiles
-- Description: Dodaje okno czasowe posiłków (godzina rozpoczęcia i zakończenia jedzenia)
-- Author: Claude Code
-- Date: 2025-12-24
-- ============================================

-- 1. Dodaj kolumny eating_start_time i eating_end_time do tabeli profiles
alter table public.profiles
  add column eating_start_time time without time zone,
  add column eating_end_time time without time zone;

-- 2. Migracja danych dla istniejących użytkowników z meal_plan_type = '2_main'
-- Na podstawie selected_meals obliczamy domyślne okno czasowe
update public.profiles
set
  eating_start_time = case
    when 'breakfast' = any(selected_meals) then '07:00'::time
    when 'lunch' = any(selected_meals) then '12:00'::time
    else '12:00'::time
  end,
  eating_end_time = case
    when 'dinner' = any(selected_meals) then '19:00'::time
    when 'lunch' = any(selected_meals) and not ('dinner' = any(selected_meals)) then '14:00'::time
    else '19:00'::time
  end
where meal_plan_type = '2_main' and selected_meals is not null;

-- 3. Ustaw domyślne wartości dla pozostałych użytkowników (którzy nie mają 2_main)
update public.profiles
set
  eating_start_time = '07:00'::time,
  eating_end_time = '19:00'::time
where eating_start_time is null or eating_end_time is null;

-- 4. Ustaw kolumny jako NOT NULL po migracji danych
alter table public.profiles
  alter column eating_start_time set not null,
  alter column eating_end_time set not null;

-- 5. Dodaj domyślne wartości dla nowych rekordów
alter table public.profiles
  alter column eating_start_time set default '07:00'::time,
  alter column eating_end_time set default '19:00'::time;

-- 6. Dodaj constraint sprawdzający, że end_time > start_time
alter table public.profiles
  add constraint check_eating_time_window
  check (eating_end_time > eating_start_time);

-- 7. Komentarze dla dokumentacji
comment on column public.profiles.eating_start_time is 'Godzina rozpoczęcia jedzenia (pierwsze posiłki)';
comment on column public.profiles.eating_end_time is 'Godzina zakończenia jedzenia (ostatni posiłek)';
