-- ============================================
-- WYCZYŚĆ TESTOWE DANE PRZED URUCHOMIENIEM TESTÓW
-- ============================================
-- Uruchom to w Supabase Dashboard → SQL Editor
-- Usuwa wszystkie testowe użytkowników z poprzednich uruchomień

-- 1️⃣ Usuń testowe profile
DELETE FROM public.profiles
WHERE email LIKE '%@lowcarbplaner.test';

-- 2️⃣ Usuń testowych użytkowników auth (usuwa również powiązane dane)
DELETE FROM auth.users
WHERE email LIKE '%@lowcarbplaner.test';

-- 3️⃣ Wyczyść planned_meals dla testowych użytkowników (orphaned records)
DELETE FROM public.planned_meals
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- 4️⃣ Sprawdź wynik
SELECT
    (SELECT COUNT(*) FROM public.profiles WHERE email LIKE '%@lowcarbplaner.test') as remaining_profiles,
    (SELECT COUNT(*) FROM auth.users WHERE email LIKE '%@lowcarbplaner.test') as remaining_auth_users,
    'Database cleaned! Ready for tests.' as status;

-- ============================================
-- OCZEKIWANY WYNIK:
-- remaining_profiles: 0
-- remaining_auth_users: 0
-- status: Database cleaned! Ready for tests.
-- ============================================
