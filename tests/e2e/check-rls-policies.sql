-- ============================================
-- SPRAWDŹ CZY POLITYKI RLS ISTNIEJĄ
-- ============================================
-- Uruchom to w Supabase Dashboard → SQL Editor

-- 1️⃣ Sprawdź czy RLS jest włączone na tabeli profiles
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- OCZEKIWANY WYNIK:
-- profiles | true

-- Jeśli rowsecurity = false, to MUSISZ włączyć RLS:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================

-- 2️⃣ Sprawdź jakie polityki RLS istnieją
SELECT
    policyname,
    roles::text,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- OCZEKIWANY WYNIK (powinny być 2 polityki):
-- service_role_all_profiles | {service_role} | ALL
-- users_own_profile         | {authenticated}| ALL

-- Jeśli PUSTY WYNIK lub brak service_role_all_profiles:
-- Musisz uruchomić create-rls-policies.sql

-- ============================================

-- 3️⃣ Sprawdź szczegóły polityki dla service_role
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles::text,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND 'service_role' = ANY(roles);

-- OCZEKIWANY WYNIK:
-- policyname: service_role_all_profiles
-- roles: {service_role}
-- cmd: ALL
-- qual: true (oznacza USING (true))
-- with_check: true (oznacza WITH CHECK (true))

-- ============================================
-- CO TO OZNACZA?
-- ============================================
--
-- RLS (Row Level Security) = bezpieczeństwo na poziomie wierszy
--
-- Nawet jeśli service_role ma uprawnienia GRANT ALL,
-- to RLS może blokować operacje jeśli:
-- 1. RLS jest włączone (rowsecurity = true)
-- 2. Nie ma polityki dla service_role
--
-- Polityka service_role_all_profiles z USING (true):
-- - Pozwala service_role na wszystko (INSERT, SELECT, UPDATE, DELETE)
-- - Bez żadnych ograniczeń (true = zawsze przepuszcza)
--
-- ============================================
