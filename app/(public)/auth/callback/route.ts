/**
 * Auth Callback Route Handler
 *
 * Handles OAuth callback from providers (Google)
 * Exchanges authorization code for session and redirects appropriately
 *
 * IMPORTANT: This route handler must properly set cookies in the response
 * for the session to persist after redirect.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'
import { logErrorLevel, logWarning } from '@/lib/error-logger'

/**
 * Helper to copy cookies from one response to another with all options preserved
 */
function copyCookies(
  from: NextResponse,
  to: NextResponse,
  cookieOptions: Map<string, CookieOptions>
) {
  from.cookies.getAll().forEach((cookie) => {
    const options = cookieOptions.get(cookie.name) || {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }
    to.cookies.set(cookie.name, cookie.value, options)
  })
}

/**
 * GET handler dla OAuth callback i Email verification
 *
 * Flow OAuth:
 * 1. Użytkownik autoryzuje w Google
 * 2. Google przekierowuje na /auth/callback?code=...
 * 3. Exchange code na session (Supabase)
 * 4. Sprawdzenie czy profil istnieje
 * 5. Redirect na onboarding lub dashboard (lub custom redirect param)
 *
 * Flow Email verification (signup, recovery, email_change):
 * 1. Użytkownik klika link z emaila
 * 2. Supabase przekierowuje na /auth/callback?token_hash=...&type=...
 * 3. Verify token i ustaw sesję
 * 4. Redirect odpowiednio
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as
    | 'signup'
    | 'recovery'
    | 'email'
    | 'email_change'
    | 'magiclink'
    | 'invite'
    | null
  const redirect = requestUrl.searchParams.get('redirect') || '/'

  // Determine the origin to use for redirects
  // In development, force localhost; in production, use the actual origin
  const origin =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : requestUrl.origin

  // If no code or token_hash provided, redirect to auth page
  if (!code && !token_hash) {
    return NextResponse.redirect(new URL('/auth', origin))
  }

  // Create a response object that we can modify cookies on
  const response = NextResponse.next({
    request,
  })

  // Store cookie options as they're set by Supabase
  const cookieOptions = new Map<string, CookieOptions>()

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
            // Store the options for later use
            cookieOptions.set(name, options)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    // Handle email verification (signup, recovery, email change, invite)
    if (token_hash && type) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type,
      })

      if (verifyError) {
        logWarning(verifyError, {
          source: 'auth.callback.verifyOtp',
          metadata: { type },
        })

        // For recovery, redirect to reset password page with error
        if (type === 'recovery') {
          return NextResponse.redirect(
            new URL('/auth/reset-password?error=invalid_token', origin)
          )
        }

        return NextResponse.redirect(
          new URL('/auth?error=verification_failed', origin)
        )
      }

      // Get current user after verification
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.redirect(new URL('/auth', origin))
      }

      // For password recovery, redirect to reset password page
      if (type === 'recovery') {
        const redirectResponse = NextResponse.redirect(
          new URL('/auth/reset-password', origin)
        )
        copyCookies(response, redirectResponse, cookieOptions)
        return redirectResponse
      }

      // For signup/invite, check profile and redirect accordingly
      const { data: profile } = await supabase
        .from('profiles')
        .select('disclaimer_accepted_at')
        .eq('id', user.id)
        .maybeSingle()

      let redirectUrl: URL
      if (!profile?.disclaimer_accepted_at) {
        redirectUrl = new URL('/onboarding', origin)
      } else {
        redirectUrl = new URL('/', origin)
      }

      const redirectResponse = NextResponse.redirect(redirectUrl)
      copyCookies(response, redirectResponse, cookieOptions)

      return redirectResponse
    }

    // Handle OAuth callback (Google)
    if (code) {
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        logWarning(exchangeError, { source: 'auth.callback.exchangeCode' })
        return NextResponse.redirect(
          new URL('/auth?error=oauth_failed', origin)
        )
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

      // Create redirect response and copy all cookies with preserved options
      const redirectResponse = NextResponse.redirect(redirectUrl)
      copyCookies(response, redirectResponse, cookieOptions)

      return redirectResponse
    }

    // No valid parameters
    return NextResponse.redirect(new URL('/auth', origin))
  } catch (error) {
    logErrorLevel(error, { source: 'auth.callback.GET' })
    return NextResponse.redirect(new URL('/auth?error=unexpected', origin))
  }
}
