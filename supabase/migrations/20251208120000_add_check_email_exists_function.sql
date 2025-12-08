-- ============================================================
-- Migration: Add check_email_exists function
-- Date: 2024-12-08
-- Purpose: Allow anonymous users to check if email exists for password reset
-- ============================================================

-- Function to check if email exists in profiles table
-- Uses SECURITY DEFINER to bypass RLS policies
-- Returns boolean to prevent email enumeration attacks (just true/false)
create or replace function public.check_email_exists(check_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles
    where email = lower(check_email)
  );
end;
$$;

-- Grant execute permission to anonymous and authenticated users
grant execute on function public.check_email_exists(text) to anon;
grant execute on function public.check_email_exists(text) to authenticated;

-- Add comment for documentation
comment on function public.check_email_exists(text) is
  'Check if email exists in profiles table. Used for password reset validation. Returns only boolean to prevent email enumeration.';
