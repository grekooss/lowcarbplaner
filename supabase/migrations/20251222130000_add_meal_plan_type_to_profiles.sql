-- ============================================
-- Migration: Add meal_plan_type to profiles
-- Description: Dodaje typ planu posiłków (ile posiłków dziennie) do profilu użytkownika
-- Author: Claude Code
-- Date: 2025-12-22
-- ============================================

-- 1. Dodaj 'snack' do istniejącego enum meal_type_enum
alter type public.meal_type_enum add value if not exists 'snack';

-- 2. Typ ENUM dla rodzajów planów posiłków
create type public.meal_plan_type_enum as enum (
  '3_main_2_snacks',  -- 3 główne + 2 przekąski (śniadanie, przekąska, obiad, przekąska, kolacja)
  '3_main_1_snack',   -- 3 główne + 1 przekąska (śniadanie, obiad, przekąska, kolacja)
  '3_main',           -- 3 główne (śniadanie, obiad, kolacja)
  '2_main'            -- 2 główne (obiad, kolacja)
);

-- 3. Dodaj kolumnę meal_plan_type do tabeli profiles
alter table public.profiles
  add column meal_plan_type public.meal_plan_type_enum not null default '3_main_2_snacks';

-- 4. Komentarze dla dokumentacji
comment on column public.profiles.meal_plan_type is 'Typ planu posiłków: ile posiłków dziennie (3_main_2_snacks, 3_main_1_snack, 3_main, 2_main)';
