-- ============================================
-- SPRAWDŹ UPRAWNIENIA NA SCHEMA PUBLIC
-- ============================================
-- Uruchom to w Supabase Dashboard → SQL Editor
-- Sprawdza czy service_role ma dostęp do schema public

-- 1️⃣ Sprawdź kto ma uprawnienia do schema public
SELECT
    nspname as schema_name,
    nspacl as permissions_acl
FROM pg_namespace
WHERE nspname = 'public';

-- OCZEKIWANY WYNIK:
-- Powinien zawierać coś jak:
-- {postgres=UC/postgres,=UC/postgres,service_role=UC/postgres}
-- UC = USAGE i CREATE

-- ============================================

-- 2️⃣ Sprawdź jakie konkretnie uprawnienia ma service_role
SELECT
    n.nspname as schema_name,
    r.rolname as role_name,
    has_schema_privilege(r.rolname, n.nspname, 'USAGE') as has_usage,
    has_schema_privilege(r.rolname, n.nspname, 'CREATE') as has_create
FROM pg_namespace n
CROSS JOIN pg_roles r
WHERE n.nspname = 'public'
  AND r.rolname IN ('service_role', 'authenticated', 'anon', 'postgres')
ORDER BY r.rolname;

-- OCZEKIWANY WYNIK dla service_role:
-- has_usage: true
-- has_create: true

-- ============================================

-- 3️⃣ Sprawdź default privileges (dla przyszłych tabel)
SELECT
    defaclrole::regrole::text as grantor,
    defaclnamespace::regnamespace::text as schema,
    defaclobjtype as object_type,
    defaclacl as default_acl
FROM pg_default_acl
WHERE defaclnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- OCZEKIWANY WYNIK:
-- Powinny być wpisy dla service_role z prawami ALL

-- ============================================
-- CO TO OZNACZA?
-- ============================================
--
-- Jeśli service_role NIE MA has_usage = true:
-- → To jest problem! Musisz uruchomić fix-schema-permissions.sql
--
-- Jeśli service_role MA has_usage = true:
-- → Problem jest gdzie indziej (może connection pooler, PostgREST)
--
-- ============================================
