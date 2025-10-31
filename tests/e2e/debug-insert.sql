-- ============================================
-- DEBUG: Test INSERT directly as service_role
-- ============================================
-- Uruchom to w Supabase Dashboard → SQL Editor

-- 1️⃣ Sprawdź current_user i current_setting
SELECT
    current_user as aktualny_user,
    current_setting('role') as aktualna_rola;

-- Oczekiwany wynik w Supabase Dashboard:
-- aktualny_user: postgres
-- aktualna_rola: postgres

-- ============================================

-- 2️⃣ Test INSERT jako postgres (powinien działać)
INSERT INTO public.profiles (
    id,
    email,
    disclaimer_accepted_at,
    age,
    gender,
    height_cm,
    weight_kg,
    activity_level,
    goal,
    target_calories
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'test-debug@example.com',
    NOW(),
    30,
    'male',
    175,
    75,
    'moderate',
    'weight_loss',
    2000
)
ON CONFLICT (id) DO NOTHING;

-- Jeśli to działa ✅, to problem jest z service_role access
-- Jeśli to failuje ❌, to problem jest głębszy

-- ============================================

-- 3️⃣ Usuń testowy rekord
DELETE FROM public.profiles
WHERE id = '00000000-0000-0000-0000-000000000001';

-- ============================================

-- 4️⃣ Sprawdź czy service_role może INSERT
-- (nie możemy tego wykonać bezpośrednio w Dashboard,
--  ale możemy sprawdzić uprawnienia)

SELECT
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND grantee = 'service_role'
  AND privilege_type = 'INSERT';

-- Oczekiwany wynik:
-- service_role | profiles | INSERT

-- ============================================

-- 5️⃣ Sprawdź polityki RLS dla service_role
SELECT
    policyname,
    permissive,
    roles::text,
    cmd,
    qual::text as using_clause,
    with_check::text as check_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND 'service_role' = ANY(roles);

-- Oczekiwany wynik:
-- policyname: service_role_all_profiles
-- permissive: PERMISSIVE
-- roles: {service_role}
-- cmd: ALL
-- using_clause: true
-- check_clause: true

-- ============================================
