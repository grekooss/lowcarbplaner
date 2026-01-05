-- ============================================
-- Migration: Update existing macro_ratio values
-- Description: Aktualizuje istniejące rekordy z 40_40_20 na 35_40_25
-- Author: Claude Code
-- Date: 2025-12-29
-- ============================================

-- UWAGA: Ta migracja musi być uruchomiona PO zatwierdzeniu nowych wartości enum
-- z migracji 20251229120000_add_new_macro_ratios.sql

-- Zaktualizuj istniejące rekordy z 40_40_20 na 35_40_25
update public.profiles
set macro_ratio = '35_40_25'
where macro_ratio = '40_40_20';
