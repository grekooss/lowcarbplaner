/**
 * Next.js Proxy (Next.js 16+)
 *
 * Handles authentication and route protection:
 * - Updates Supabase auth session from cookies
 * - Protects authenticated routes (/dashboard, /meal-plan, etc.)
 * - Protects onboarding route (requires auth + no profile)
 * - Redirects authenticated users away from public auth routes
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create response object
  let response = NextResponse.next({
    request,
  })

  // Create Supabase client for proxy
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // DEBUG: Log auth state (remove after debugging)
  console.log('[PROXY]', {
    pathname,
    hasUser: !!user,
    userId: user?.id?.slice(0, 8),
  })

  // Public auth routes that don't require authentication
  const isAuthRoute = pathname.startsWith('/auth')

  // Onboarding route (requires auth but redirects if profile exists)
  const isOnboardingRoute = pathname.startsWith('/onboarding')

  // Protected routes that require authentication
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/meal-plan') ||
    pathname.startsWith('/shopping-list') ||
    pathname.startsWith('/settings')

  // Public routes that require onboarding for authenticated users
  const isPublicButRequiresOnboarding = pathname.startsWith('/recipes')

  // If user is not authenticated and tries to access protected route or onboarding
  if (!user && (isProtectedRoute || isOnboardingRoute)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated, check onboarding status
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('disclaimer_accepted_at')
      .eq('id', user.id)
      .maybeSingle()

    const hasCompletedOnboarding = !!profile?.disclaimer_accepted_at

    // If on onboarding route and already completed → redirect to home
    if (isOnboardingRoute && hasCompletedOnboarding) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/'
      return NextResponse.redirect(redirectUrl)
    }

    // If on auth route → redirect to onboarding or home
    if (isAuthRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = hasCompletedOnboarding ? '/' : '/onboarding'
      return NextResponse.redirect(redirectUrl)
    }

    // If on protected route and not completed onboarding → redirect to onboarding
    if (isProtectedRoute && !hasCompletedOnboarding) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/onboarding'
      return NextResponse.redirect(redirectUrl)
    }

    // If on public route that requires onboarding and not completed → redirect to onboarding
    if (isPublicButRequiresOnboarding && !hasCompletedOnboarding) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/onboarding'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
