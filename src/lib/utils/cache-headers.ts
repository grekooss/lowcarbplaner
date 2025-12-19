/**
 * HTTP Cache Headers Utility
 *
 * Provides standardized cache control headers for API routes.
 * Different strategies for different types of content.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching
 */

/**
 * Cache strategy types
 */
type CacheStrategy =
  | 'static' // Rarely changing content (recipes, ingredients)
  | 'dynamic' // User-specific, frequently changing (planned meals, profile)
  | 'private' // User-specific, should not be cached by CDN
  | 'none' // No caching at all

/**
 * Cache configuration per strategy
 */
const cacheConfig: Record<
  CacheStrategy,
  { directive: string; maxAge?: number; staleWhileRevalidate?: number }
> = {
  // Static content: cache for 5 minutes, revalidate in background for 1 hour
  static: {
    directive: 'public, s-maxage=300, stale-while-revalidate=3600',
    maxAge: 300,
    staleWhileRevalidate: 3600,
  },
  // Dynamic content: short cache, always revalidate
  dynamic: {
    directive: 'private, max-age=60, must-revalidate',
    maxAge: 60,
  },
  // Private content: browser cache only, no CDN
  private: {
    directive: 'private, no-store, must-revalidate',
  },
  // No caching
  none: {
    directive: 'no-store, no-cache, must-revalidate',
  },
}

/**
 * Get cache headers for a given strategy
 *
 * @param strategy - Cache strategy to apply
 * @returns Headers object for NextResponse
 *
 * @example
 * ```typescript
 * // In API route
 * return NextResponse.json(data, {
 *   headers: getCacheHeaders('static'),
 * })
 * ```
 */
export function getCacheHeaders(
  strategy: CacheStrategy
): Record<string, string> {
  const config = cacheConfig[strategy]

  return {
    'Cache-Control': config.directive,
    Vary: 'Accept-Encoding',
  }
}

/**
 * Cache headers for recipe endpoints (static content)
 * Recipes don't change often, safe to cache
 */
export const recipeCacheHeaders = getCacheHeaders('static')

/**
 * Cache headers for user-specific endpoints (planned meals, profile)
 * Should not be cached by CDN, short browser cache
 */
export const userDataCacheHeaders = getCacheHeaders('private')

/**
 * Cache headers for shopping list (computed from user data)
 * Private, no caching to ensure fresh calculations
 */
export const shoppingListCacheHeaders = getCacheHeaders('none')

/**
 * Merge cache headers with existing headers
 *
 * @param strategy - Cache strategy
 * @param additionalHeaders - Other headers to include
 * @returns Combined headers object
 */
export function withCacheHeaders(
  strategy: CacheStrategy,
  additionalHeaders: Record<string, string> = {}
): Record<string, string> {
  return {
    ...getCacheHeaders(strategy),
    ...additionalHeaders,
  }
}
