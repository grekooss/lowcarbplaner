-- ============================================
-- PROSTE SPRAWDZENIE UPRAWNIEŃ - 3 ZAPYTANIA
-- ============================================
-- Uruchom to w Supabase Dashboard → SQL Editor

-- 1️⃣ CZY service_role MA UPRAWNIENIA NA PROFILES?
SELECT
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND grantee IN ('authenticated', 'service_role')
ORDER BY grantee, privilege_type;

-- OCZEKIWANY WYNIK:
-- service_role | DELETE
-- service_role | INSERT     ← TO JEST NAJWAŻNIEJSZE!
-- service_role | SELECT
-- service_role | UPDATE

-- Jeśli NIE WIDZISZ service_role → MUSISZ URUCHOMIĆ FIX!


-- ============================================

-- 2️⃣ CZY RLS JEST WŁĄCZONE?
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- OCZEKIWANY WYNIK:
-- profiles | true

-- ============================================

-- 3️⃣ CZY ISTNIEJE POLITYKA DLA service_role?
SELECT
    policyname,
    roles::text
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND 'service_role' = ANY(roles);

-- OCZEKIWANY WYNIK:
-- service_role_all_profiles | {service_role}

-- Jeśli PUSTY WYNIK → MUSISZ URUCHOMIĆ FIX!

-- ============================================
-- PODSUMOWANIE:
-- ============================================
--
-- ✅ WSZYSTKO OK jeśli widzisz:
--    - service_role z INSERT w Query 1
--    - rowsecurity = true w Query 2
--    - service_role_all_profiles w Query 3
--
-- ❌ MUSISZ NAPRAWIĆ jeśli:
--    - Brak service_role w Query 1
--    - Pusty wynik w Query 3
--
-- NAPRAWA:
-- Uruchom plik: fix-permissions-complete.sql
--
-- ============================================
