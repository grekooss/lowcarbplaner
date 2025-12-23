-- ============================================
-- Migration: Add macro_ratio to profiles
-- Description: Dodaje wybór proporcji makroskładników do profilu użytkownika
-- Author: Claude Code
-- Date: 2025-12-22
-- ============================================

-- 1. Typ ENUM dla proporcji makroskładników (tłuszcz-białko-węglowodany)
-- Format: fats_protein_carbs (procenty)
create type public.macro_ratio_enum as enum (
  '70_25_5',   -- 70% tłuszcz, 25% białko, 5% węglowodany (bardzo restrykcyjne keto)
  '60_35_5',   -- 60% tłuszcz, 35% białko, 5% węglowodany (keto wysokobiałkowe)
  '60_25_15',  -- 60% tłuszcz, 25% białko, 15% węglowodany (standardowe keto)
  '50_30_20',  -- 50% tłuszcz, 30% białko, 20% węglowodany (umiarkowane low-carb)
  '40_40_20'   -- 40% tłuszcz, 40% białko, 20% węglowodany (wysokobiałkowe low-carb)
);

-- 2. Dodaj kolumnę macro_ratio do tabeli profiles
alter table public.profiles
  add column macro_ratio public.macro_ratio_enum not null default '60_25_15';

-- 3. Komentarze dla dokumentacji
comment on column public.profiles.macro_ratio is 'Proporcje makroskładników: format tłuszcz_białko_węglowodany (np. 60_25_15 = 60% tłuszcz, 25% białko, 15% węglowodany)';
