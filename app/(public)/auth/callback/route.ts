/**
 * Auth Callback Route Handler
 *
 * Handles OAuth callback from providers (Google)
 * Exchanges authorization code for session and redirects appropriately
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET handler dla OAuth callback
 *
 * Flow:
 * 1. Użytkownik autoryzuje w Google
 * 2. Google przekierowuje na /auth/callback?code=...
 * 3. Exchange code na session (Supabase)
 * 4. Sprawdzenie czy profil istnieje
 * 5. Redirect na onboarding lub dashboard (lub custom redirect param)
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/'

  // If no code provided, redirect to auth page
  if (!code) {
    return NextResponse.redirect(new URL('/auth', requestUrl.origin))
  }

  try {
    const supabase = await createServerClient()

    // Exchange code for session
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('OAuth callback error:', exchangeError)
      // Redirect to auth page with error
      return NextResponse.redirect(
        new URL('/auth?error=oauth_failed', requestUrl.origin)
      )
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/auth', requestUrl.origin))
    }

    // Check if profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('disclaimer_accepted_at')
      .eq('id', user.id)
      .maybeSingle()

    // Redirect based on profile completion
    if (!profile?.disclaimer_accepted_at) {
      // New user - redirect to onboarding
      return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
    } else {
      // Existing user - redirect to requested page or dashboard
      return NextResponse.redirect(new URL(redirect, requestUrl.origin))
    }
  } catch (error) {
    console.error('Unexpected error in OAuth callback:', error)
    return NextResponse.redirect(
      new URL('/auth?error=unexpected', requestUrl.origin)
    )
  }
}
