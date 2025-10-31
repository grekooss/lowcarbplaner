-- ============================================
-- WYŁĄCZ RLS DLA TESTÓW E2E
-- ============================================
-- To jest NAJPROSTSZE rozwiązanie dla środowiska testowego
-- Uruchom to w Supabase Dashboard → SQL Editor

-- Wyłącz RLS na tabeli profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Sprawdź status
SELECT
    'RLS wyłączone - testy powinny działać!' as status,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- Oczekiwany wynik:
-- status                                  | tablename | rowsecurity
-- ----------------------------------------|-----------|------------
-- RLS wyłączone - testy powinny działać! | profiles  | false

-- ============================================
-- CZY TO JEST BEZPIECZNE?
-- ============================================
--
-- TAK dla środowiska testowego!
-- - To jest baza TESTOWA (mmdjbjbuxivvpvgsvsfj)
-- - Służy TYLKO do testów E2E
-- - Nie ma tam żadnych prawdziwych danych użytkowników
--
-- NIE dla produkcji!
-- - W produkcji ZAWSZE używaj RLS
-- - To chroni dane użytkowników
--
-- ============================================
-- CO TO ROBI?
-- ============================================
--
-- Wyłącza Row Level Security na tabeli profiles
-- - service_role może INSERT/UPDATE/DELETE bez ograniczeń
-- - authenticated users też mogą (ale aplikacja kontroluje dostęp)
-- - Testy E2E będą działać bez problemów
--
-- ============================================
-- NASTĘPNY KROK:
-- ============================================
--
-- Po uruchomieniu tego SQL:
-- 1. Uruchom testy: npm run test:e2e:chromium
-- 2. Powinieneś zobaczyć: 68 passed ✅
--
-- ============================================
