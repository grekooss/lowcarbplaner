-- ============================================
-- Migration: Fix RLS policies for ingredient_unit_conversions
-- Description: Dodaje brakujące polityki RLS i uprawnienia GRANT dla tabeli ingredient_unit_conversions
-- Author: Claude Code
-- Date: 2025-12-29
-- ============================================

-- 1. Usuń istniejące polityki (jeśli istnieją)
DROP POLICY IF EXISTS "ingredient_unit_conversions_select_authenticated" ON public.ingredient_unit_conversions;
DROP POLICY IF EXISTS "ingredient_unit_conversions_select_anon" ON public.ingredient_unit_conversions;

-- 2. Upewnij się, że RLS jest włączone
ALTER TABLE public.ingredient_unit_conversions ENABLE ROW LEVEL SECURITY;

-- 3. Dodaj politykę dla authenticated users
CREATE POLICY "ingredient_unit_conversions_select_authenticated"
  ON public.ingredient_unit_conversions
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. Dodaj politykę dla anonymous users
CREATE POLICY "ingredient_unit_conversions_select_anon"
  ON public.ingredient_unit_conversions
  FOR SELECT
  TO anon
  USING (true);

-- 5. Nadaj uprawnienia GRANT (wymagane nawet gdy service_role pomija RLS)
GRANT SELECT ON public.ingredient_unit_conversions TO service_role;
GRANT SELECT ON public.ingredient_unit_conversions TO authenticated;
GRANT SELECT ON public.ingredient_unit_conversions TO anon;

-- 6. Komentarz dla dokumentacji
COMMENT ON TABLE public.ingredient_unit_conversions IS 'Conversion table mapping custom units to grams for precise calculations. Read-only for all users.';
