-- ============================================
-- CHECK CURRENT PERMISSIONS IN SUPABASE
-- ============================================
-- Execute this in Supabase Dashboard SQL Editor
-- to verify current table permissions

-- 1. Check table permissions for profiles table
SELECT
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY grantee, privilege_type;

-- 2. Check if RLS (Row Level Security) is enabled
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'planned_meals', 'shopping_list', 'recipes', 'ingredients');

-- 3. Check existing RLS policies on profiles table
SELECT
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- 4. Check sequence permissions (for auto-increment IDs)
SELECT
    n.nspname as sequence_schema,
    c.relname as sequence_name,
    r.rolname as grantee,
    p.privilege_type
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
CROSS JOIN LATERAL (
    SELECT unnest(ARRAY['USAGE', 'SELECT', 'UPDATE']) as privilege_type
) p
JOIN pg_roles r ON r.rolname IN ('authenticated', 'service_role', 'anon')
WHERE c.relkind = 'S'
  AND n.nspname = 'public'
  AND has_sequence_privilege(r.oid, c.oid, p.privilege_type)
ORDER BY c.relname, r.rolname;

-- 5. Check all tables in public schema
SELECT
    table_name,
    grantee,
    string_agg(privilege_type, ', ') as privileges
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND grantee IN ('authenticated', 'service_role', 'anon')
GROUP BY table_name, grantee
ORDER BY table_name, grantee;

-- ============================================
-- EXPECTED RESULTS FOR WORKING E2E TESTS:
-- ============================================
--
-- Query 1 should show:
-- - service_role: SELECT, INSERT, UPDATE, DELETE
-- - authenticated: SELECT, INSERT, UPDATE, DELETE
--
-- Query 2 should show:
-- - rowsecurity: true (for all tables)
--
-- Query 3 should show policies:
-- - service_role_all_profiles (for service_role)
-- - users_own_profile (for authenticated)
--
-- Query 4 should show:
-- - authenticated: USAGE, SELECT
-- - service_role: USAGE, SELECT
--
-- ============================================
