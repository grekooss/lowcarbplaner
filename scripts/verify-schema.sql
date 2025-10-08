-- =====================================================================
-- Schema Verification Script
-- Purpose: Verify that all tables and objects were created successfully
-- =====================================================================

-- Check custom types (enums)
SELECT
  'ENUM TYPES' as category,
  typname as name,
  'EXISTS' as status
FROM pg_type
WHERE typname IN ('gender_enum', 'activity_level_enum', 'goal_enum', 'meal_type_enum')
ORDER BY typname;

-- Check tables in content schema
SELECT
  'CONTENT TABLES' as category,
  table_name as name,
  'EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'content'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check tables in public schema (excluding auth/storage tables)
SELECT
  'PUBLIC TABLES' as category,
  table_name as name,
  'EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN ('profiles', 'planned_meals', 'feedback')
ORDER BY table_name;

-- Check RLS is enabled
SELECT
  'RLS STATUS' as category,
  schemaname || '.' || tablename as name,
  CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_tables
WHERE schemaname IN ('public', 'content')
  AND tablename NOT LIKE 'pg_%'
ORDER BY schemaname, tablename;

-- Check policies count
SELECT
  'POLICIES COUNT' as category,
  schemaname || '.' || tablename as name,
  count(*)::text as status
FROM pg_policies
WHERE schemaname IN ('public', 'content')
GROUP BY schemaname, tablename
ORDER BY schemaname, tablename;

-- Check triggers
SELECT
  'TRIGGERS' as category,
  trigger_name as name,
  event_object_schema || '.' || event_object_table as status
FROM information_schema.triggers
WHERE event_object_schema IN ('public', 'content', 'auth')
  AND trigger_name IN ('profiles_updated_at', 'recipes_updated_at', 'on_auth_user_created',
                       'recipe_ingredients_insert_update_calories',
                       'recipe_ingredients_update_update_calories',
                       'recipe_ingredients_delete_update_calories')
ORDER BY trigger_name;

-- Check indexes
SELECT
  'INDEXES' as category,
  indexname as name,
  schemaname || '.' || tablename as status
FROM pg_indexes
WHERE schemaname IN ('public', 'content')
  AND indexname LIKE 'idx_%'
ORDER BY indexname;
