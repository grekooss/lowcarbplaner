-- ============================================
-- UTWÓRZ POLITYKI RLS DLA E2E TESTÓW
-- ============================================
-- Uruchom to w Supabase Dashboard → SQL Editor

-- KROK 1: Włącz RLS na tabeli profiles (jeśli jeszcze nie jest)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- KROK 2: Usuń stare polityki jeśli istnieją (bezpieczne)
DROP POLICY IF EXISTS "service_role_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_own_profile" ON public.profiles;

-- KROK 3: Utwórz politykę dla service_role (testy E2E)
-- Ta polityka pozwala service_role na wszystko bez ograniczeń
CREATE POLICY "service_role_all_profiles" ON public.profiles
    FOR ALL                          -- Wszystkie operacje (SELECT, INSERT, UPDATE, DELETE)
    TO service_role                  -- Tylko dla roli service_role
    USING (true)                     -- Zawsze przepuszcza (bez ograniczeń)
    WITH CHECK (true);               -- Zawsze przepuszcza (bez ograniczeń)

-- KROK 4: Utwórz politykę dla authenticated (normalni użytkownicy)
-- Ta polityka pozwala użytkownikom tylko na swój własny profil
CREATE POLICY "users_own_profile" ON public.profiles
    FOR ALL                          -- Wszystkie operacje
    TO authenticated                 -- Dla zalogowanych użytkowników
    USING (auth.uid() = id)         -- Tylko jeśli ID profilu = ID zalogowanego użytkownika
    WITH CHECK (auth.uid() = id);   -- Tylko jeśli ID profilu = ID zalogowanego użytkownika

-- KROK 5: Weryfikacja
SELECT
    'Polityki RLS utworzone pomyślnie!' as status,
    COUNT(*) as liczba_polityk
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND policyname IN ('service_role_all_profiles', 'users_own_profile');

-- OCZEKIWANY WYNIK:
-- status                                | liczba_polityk
-- --------------------------------------|---------------
-- Polityki RLS utworzone pomyślnie!    | 2

-- ============================================
-- CO TO ROBI?
-- ============================================
--
-- 1. Włącza RLS (Row Level Security) na tabeli profiles
--    - RLS = każdy wiersz jest chroniony politykami
--
-- 2. Tworzy politykę dla service_role:
--    - USING (true) = zawsze przepuszcza
--    - Pozwala testom E2E na tworzenie użytkowników testowych
--
-- 3. Tworzy politykę dla authenticated:
--    - USING (auth.uid() = id) = tylko własny profil
--    - Chroni dane użytkowników przed sobą nawzajem
--
-- ============================================
-- DLACZEGO TO JEST POTRZEBNE?
-- ============================================
--
-- Nawet jeśli masz GRANT ALL permissions,
-- RLS policies mogą dalej blokować operacje!
--
-- service_role potrzebuje polityki RLS która mówi:
-- "TAK, service_role może wszystko"
--
-- Bez tej polityki:
-- ❌ permission denied for schema public
--
-- Z tą polityką:
-- ✅ service_role może tworzyć profile testowe
--
-- ============================================
