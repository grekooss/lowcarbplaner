/**
 * Auth Callback Route Handler
 *
 * Handles OAuth callback from providers (Google)
 * Exchanges authorization code for session and redirects appropriately
 *
 * IMPORTANT: This route handler must properly set cookies in the response
 * for the session to persist after redirect.
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

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

  // Determine the origin to use for redirects
  // In development, force localhost; in production, use the actual origin
  const origin =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : requestUrl.origin

  // If no code provided, redirect to auth page
  if (!code) {
    return NextResponse.redirect(new URL('/auth', origin))
  }

  // Create a response object that we can modify cookies on
  const response = NextResponse.next({
    request,
  })

  // Create Supabase client that can set cookies on the response
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    // Exchange code for session - this sets the auth cookies
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('OAuth callback error:', exchangeError)
      return NextResponse.redirect(new URL('/auth?error=oauth_failed', origin))
    }

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/auth', origin))
    }

    // Check if profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('disclaimer_accepted_at')
      .eq('id', user.id)
      .maybeSingle()

    // Build redirect response with cookies from the response object
    let redirectUrl: URL
    if (!profile?.disclaimer_accepted_at) {
      // New user - redirect to onboarding
      redirectUrl = new URL('/onboarding', origin)
    } else {
      // Existing user - redirect to requested page or home
      // Validate redirect to prevent open redirect attacks
      const targetPath = redirect.startsWith('/') ? redirect : '/'
      redirectUrl = new URL(targetPath, origin)
    }

    // Create redirect response and copy all cookies from the response object
    // Preserve original cookie options set by Supabase
    const redirectResponse = NextResponse.redirect(redirectUrl)
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })

    return redirectResponse
  } catch (error) {
    console.error('Unexpected error in OAuth callback:', error)
    return NextResponse.redirect(new URL('/auth?error=unexpected', origin))
  }
}
