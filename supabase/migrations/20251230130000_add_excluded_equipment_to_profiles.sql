-- ============================================================
-- Migration: Add Excluded Equipment to Profiles
-- Description: Allows users to specify which kitchen equipment they don't have
--              so the meal plan generator can filter out recipes requiring that equipment
-- Tables Affected:
--   - profiles (alter) - add excluded_equipment_ids column
-- ============================================================

-- ============================================================
-- 1. Add excluded_equipment_ids column to profiles
-- ============================================================
alter table profiles
add column excluded_equipment_ids integer[] not null default '{}';

comment on column profiles.excluded_equipment_ids is
  'Array of equipment IDs that the user does not have. Recipes requiring this equipment will be excluded from meal plan generation.';

-- ============================================================
-- 2. Create index for efficient filtering
-- ============================================================
create index idx_profiles_excluded_equipment on profiles using gin (excluded_equipment_ids);
