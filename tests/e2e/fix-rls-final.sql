-- ============================================
-- FINALNA NAPRAWA RLS - Supabase SDK Compatible
-- ============================================
-- Problem: Supabase JS SDK z service_role nie omija RLS automatycznie!
-- Rozwiązanie: Wyłącz RLS LUB dodaj politykę PERMISSIVE

-- OPCJA 1: Wyłącz RLS na tabeli profiles (NAJPROSTSZE)
-- Uwaga: To wyłącza RLS całkowicie, authenticated users
-- będą musieli polegać na application-level security

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Jeśli to nie działa, użyj OPCJA 2 poniżej:

/*
-- OPCJA 2: Force PERMISSIVE policy dla service_role
-- (Zakomentowane, użyj tylko jeśli OPCJA 1 nie zadziałała)

-- Usuń stare polityki
DROP POLICY IF EXISTS "service_role_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_own_profile" ON public.profiles;

-- Utwórz PERMISSIVE policy (domyślny typ)
CREATE POLICY "service_role_bypass" ON public.profiles
    AS PERMISSIVE  -- Explicitnie PERMISSIVE, nie RESTRICTIVE
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Utwórz policy dla authenticated
CREATE POLICY "authenticated_own_profile" ON public.profiles
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Utwórz policy dla anon (tylko SELECT)
CREATE POLICY "anon_no_access" ON public.profiles
    AS PERMISSIVE
    FOR SELECT
    TO anon
    USING (false);  -- Anon nie może nic

-- RLS musi być włączone
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
*/

-- ============================================
-- Weryfikacja
-- ============================================

-- Sprawdź status RLS
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- OPCJA 1: Oczekiwany wynik: rls_enabled = false (wyłączone)
-- OPCJA 2: Oczekiwany wynik: rls_enabled = true (włączone z politykami)

-- Sprawdź polityki (jeśli używasz OPCJA 2)
SELECT
    policyname,
    permissive::text,
    roles::text,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- ============================================
-- DLACZEGO TO POWINNO ZADZIAŁAĆ?
-- ============================================
--
-- OPCJA 1 (Wyłączenie RLS):
-- - Najprostsze rozwiązanie
-- - service_role będzie mógł INSERT bez żadnych ograniczeń
-- - authenticated users też będą mogli (ale aplikacja powinna
--   kontrolować dostęp na poziomie kodu)
--
-- OPCJA 2 (PERMISSIVE policies):
-- - PERMISSIVE policy = "OR" logic
-- - Jeśli JAKAKOLWIEK polityka przepuści, operacja przechodzi
-- - RESTRICTIVE policy = "AND" logic (wszystkie muszą przepuścić)
--
-- Supabase JS SDK + service_role + PERMISSIVE policy = powinno działać
--
-- ============================================
-- UWAGA DLA PRODUKCJI:
-- ============================================
--
-- Jeśli używasz OPCJA 1 (RLS wyłączone):
-- - To jest OK dla środowiska testowego!
-- - Dla produkcji powinieneś użyć OPCJA 2
--
-- Dla produkcji najlepiej:
-- - RLS włączone
-- - PERMISSIVE policies dla wszystkich ról
-- - Dodatkowa polityka "authenticated users only"
--
-- ============================================
