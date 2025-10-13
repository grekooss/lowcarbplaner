-- ============================================================================
-- Migration: Feedback Table Optimization
-- Description: Adds performance indexes and optional DELETE policy for feedback table
-- Tables Affected: public.feedback
-- Special Notes:
--   - RLS is already enabled on feedback table (base migration)
--   - Base RLS policies (SELECT, INSERT) already exist
--   - This migration adds indexes for performance and optional DELETE policy
-- ============================================================================

-- ============================================================================
-- 1. Add performance indexes for feedback table
-- ============================================================================

-- Index on user_id for fast lookup of user's feedback and RLS policy optimization
-- This index speeds up queries like "SELECT * FROM feedback WHERE user_id = ?"
-- and optimizes RLS policy evaluation (auth.uid() = user_id)
CREATE INDEX IF NOT EXISTS idx_feedback_user_id
  ON public.feedback(user_id);

-- Index on created_at for sorting feedback by date (DESC - newest first)
-- This index speeds up queries like "SELECT * FROM feedback ORDER BY created_at DESC"
-- Useful for admin panel or user's feedback history
CREATE INDEX IF NOT EXISTS idx_feedback_created_at
  ON public.feedback(created_at DESC);

-- ============================================================================
-- 2. Add optional DELETE policy for GDPR compliance
-- ============================================================================

-- Policy: Users can delete their own feedback
-- This allows users to remove their feedback if needed (GDPR right to erasure)
-- Note: In production, consider soft deletes (is_deleted flag) instead of hard deletes
CREATE POLICY "feedback_delete_own"
  ON public.feedback FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- 3. Add comments for documentation
-- ============================================================================

COMMENT ON INDEX idx_feedback_user_id IS
  'Index for fast lookup of user feedback and RLS policy optimization';

COMMENT ON INDEX idx_feedback_created_at IS
  'Index for sorting feedback by creation date (newest first)';

COMMENT ON POLICY "feedback_delete_own" ON public.feedback IS
  'Users can delete their own feedback (GDPR compliance)';

-- ============================================================================
-- 4. Optional: GIN index for metadata JSONB (commented out, enable if needed)
-- ============================================================================

-- If you frequently query feedback by metadata fields (e.g., filtering by appVersion),
-- consider enabling this GIN index for better performance on JSONB queries.
-- Note: GIN indexes are larger and slower to update, use only if needed.

-- CREATE INDEX IF NOT EXISTS idx_feedback_metadata
--   ON public.feedback USING GIN (metadata);

-- COMMENT ON INDEX idx_feedback_metadata IS
--   'GIN index for fast JSONB queries on feedback metadata (e.g., filtering by appVersion)';

-- ============================================================================
-- Migration Complete
-- ============================================================================
-- Summary:
-- ✅ Added idx_feedback_user_id index for fast user lookups and RLS optimization
-- ✅ Added idx_feedback_created_at index for date sorting
-- ✅ Added DELETE policy for GDPR compliance (users can delete own feedback)
-- ✅ Added comprehensive comments for documentation
-- ⚠️  GIN index for metadata is commented out (enable if needed)
--
-- Next steps:
-- 1. Test INSERT performance with indexes
-- 2. Test DELETE policy with authenticated user
-- 3. Monitor index usage with pg_stat_user_indexes
-- 4. Consider enabling GIN index if metadata queries become frequent
-- ============================================================================
