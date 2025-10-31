-- ============================================
-- COMPLETE FIX FOR E2E TEST PERMISSIONS
-- ============================================
-- Execute this ENTIRE file in Supabase Dashboard SQL Editor
-- This will fix all permission issues for E2E tests
--
-- HOW TO USE:
-- 1. Copy this entire file
-- 2. Paste into Supabase Dashboard → SQL Editor
-- 3. Click "Run" (or press Ctrl+Enter)
-- 4. Run tests: npm run test:e2e:chromium
-- ============================================

-- Step 1: Grant table permissions
-- This allows service_role to INSERT/UPDATE/DELETE on all tables
GRANT ALL ON public.profiles TO authenticated, service_role;
GRANT ALL ON public.planned_meals TO authenticated, service_role;
GRANT ALL ON public.shopping_list TO authenticated, service_role;
GRANT ALL ON public.recipes TO authenticated, service_role;
GRANT ALL ON public.ingredients TO authenticated, service_role;

-- Step 2: Grant sequence permissions
-- This allows using auto-increment IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- Step 3: Create RLS policy for service_role
-- This bypasses RLS restrictions for test user creation
DO $$
BEGIN
    -- Check if policy already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'profiles'
          AND policyname = 'service_role_all_profiles'
    ) THEN
        CREATE POLICY "service_role_all_profiles" ON public.profiles
            FOR ALL TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Step 4: Create RLS policy for authenticated users
-- This allows users to access their own profile
DO $$
BEGIN
    -- Check if policy already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'profiles'
          AND policyname = 'users_own_profile'
    ) THEN
        CREATE POLICY "users_own_profile" ON public.profiles
            FOR ALL TO authenticated
            USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Step 5: Verify the fix
-- This will show you the current permissions
SELECT
    'VERIFICATION: Table Permissions' as check_type,
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND grantee IN ('authenticated', 'service_role')
ORDER BY grantee, privilege_type;

-- Step 6: Verify RLS policies
SELECT
    'VERIFICATION: RLS Policies' as check_type,
    policyname,
    roles::text,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- ============================================
-- EXPECTED OUTPUT:
-- ============================================
--
-- Query 1-4: Success (no output)
--
-- Query 5 should show:
-- grantee       | privilege_type
-- --------------|---------------
-- authenticated | SELECT
-- authenticated | INSERT
-- authenticated | UPDATE
-- authenticated | DELETE
-- service_role  | SELECT
-- service_role  | INSERT
-- service_role  | UPDATE
-- service_role  | DELETE
--
-- Query 6 should show:
-- policyname                  | roles          | cmd
-- ----------------------------|----------------|-----
-- service_role_all_profiles   | {service_role} | ALL
-- users_own_profile           | {authenticated}| ALL
--
-- ============================================
-- IF YOU SEE THE EXPECTED OUTPUT:
-- ✅ Permissions are fixed!
-- ✅ Run: npm run test:e2e:chromium
-- ✅ All 68 tests should pass
-- ============================================
