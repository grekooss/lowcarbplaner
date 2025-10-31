-- ============================================
-- NAPRAW UPRAWNIENIA NA POZIOMIE SCHEMA
-- ============================================
-- Problem: "permission denied for schema public"
-- Nawet z wyłączonym RLS i GRANT ALL na tabelach

-- Nadaj uprawnienia na sam schemat public
GRANT USAGE ON SCHEMA public TO service_role, authenticated, anon;
GRANT ALL ON SCHEMA public TO service_role, authenticated;

-- Nadaj uprawnienia na wszystkie istniejące tabele
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role, authenticated;

-- Nadaj uprawnienia na wszystkie sekwencje (auto-increment)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, authenticated;

-- Nadaj uprawnienia na wszystkie funkcje
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role, authenticated;

-- Ustaw domyślne uprawnienia dla przyszłych obiektów
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO service_role, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO service_role, authenticated;

-- Sprawdź uprawnienia na schemat
SELECT
    'Schema permissions' as check_type,
    nspname as schema_name,
    nspacl as permissions
FROM pg_namespace
WHERE nspname = 'public';

-- Sprawdź uprawnienia na tabele
SELECT
    'Table permissions' as check_type,
    tablename,
    tableowner,
    array_agg(DISTINCT grantee) as grantees
FROM pg_tables
LEFT JOIN information_schema.table_privileges ON table_name = tablename
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'recipes', 'ingredients', 'planned_meals')
GROUP BY tablename, tableowner;

-- ============================================
-- OCZEKIWANY WYNIK:
-- ============================================
-- Powinny być uprawnienia dla service_role na:
-- 1. Schemat public (USAGE, CREATE)
-- 2. Wszystkie tabele (SELECT, INSERT, UPDATE, DELETE)
-- 3. Wszystkie sekwencje (SELECT, UPDATE, USAGE)
-- ============================================
