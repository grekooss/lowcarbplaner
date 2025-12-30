-- ============================================
-- Migration: Add new macro ratio enum values
-- Description: Dodaje nowe wartości do enum macro_ratio_enum
-- Author: Claude Code
-- Date: 2025-12-29
-- ============================================

-- UWAGA: Nowe wartości enum muszą być zatwierdzone przed użyciem.
-- Update rekordów musi być w osobnej migracji.

-- Dodaj nowe wartości do enum macro_ratio_enum
alter type public.macro_ratio_enum add value if not exists '60_30_10';  -- 60% tłuszcz, 30% białko, 10% węglowodany (zbalansowane keto)
alter type public.macro_ratio_enum add value if not exists '45_30_25';  -- 45% tłuszcz, 30% białko, 25% węglowodany (liberalne low-carb)
alter type public.macro_ratio_enum add value if not exists '35_40_25';  -- 35% tłuszcz, 40% białko, 25% węglowodany (wysokobiałkowe low-carb)
