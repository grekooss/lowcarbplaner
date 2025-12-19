/**
 * Simple in-memory rate limiter for API routes
 *
 * For production, consider using:
 * - @upstash/ratelimit with Redis for distributed rate limiting
 * - Cloudflare Rate Limiting for edge protection
 *
 * @example
 * ```typescript
 * // In API route
 * import { rateLimit, getClientIp } from '@/lib/utils/rate-limit'
 *
 * export async function POST(request: NextRequest) {
 *   const ip = getClientIp(request)
 *   const { success, remaining } = await rateLimit.check(ip)
 *
 *   if (!success) {
 *     return NextResponse.json(
 *       { error: 'Too many requests' },
 *       { status: 429, headers: { 'Retry-After': '60' } }
 *     )
 *   }
 *
 *   // Process request...
 * }
 * ```
 */

import type { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
}

/**
 * In-memory rate limiter
 *
 * Note: This resets on server restart and doesn't work across multiple instances.
 * For production, use Redis-based rate limiting.
 */
class RateLimiter {
  private cache: Map<string, RateLimitEntry> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config

    // Cleanup expired entries every minute
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 60000)
    }
  }

  /**
   * Check if a request should be allowed
   *
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @returns Rate limit result
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now()
    const entry = this.cache.get(identifier)

    // First request or window expired
    if (!entry || now > entry.resetTime) {
      const resetTime = now + this.config.windowMs
      this.cache.set(identifier, { count: 1, resetTime })
      return {
        success: true,
        remaining: this.config.maxRequests - 1,
        resetTime,
      }
    }

    // Within window - check limit
    if (entry.count >= this.config.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
      }
    }

    // Increment counter
    entry.count++
    return {
      success: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  /**
   * Remove expired entries from cache
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.cache.forEach((entry, key) => {
      if (now > entry.resetTime) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach((key) => this.cache.delete(key))
  }

  /**
   * Reset rate limit for an identifier (useful for testing)
   */
  reset(identifier: string): void {
    this.cache.delete(identifier)
  }

  /**
   * Clear all rate limit entries
   */
  clear(): void {
    this.cache.clear()
  }
}

/**
 * Default rate limiter: 60 requests per minute
 */
export const rateLimit = new RateLimiter({
  maxRequests: 60,
  windowMs: 60 * 1000, // 1 minute
})

/**
 * Strict rate limiter for sensitive operations: 10 requests per minute
 * Use for: login, registration, password reset, feedback submission
 */
export const strictRateLimit = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
})

/**
 * Very strict rate limiter: 3 requests per minute
 * Use for: password reset requests, account deletion
 */
export const veryStrictRateLimit = new RateLimiter({
  maxRequests: 3,
  windowMs: 60 * 1000, // 1 minute
})

/**
 * Extract client IP address from Next.js request
 *
 * Checks common headers used by proxies and CDNs.
 *
 * @param request - Next.js request object
 * @returns Client IP address or 'unknown'
 */
export function getClientIp(request: NextRequest): string {
  // Cloudflare
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp

  // Standard proxy headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs: client, proxy1, proxy2
    const firstIp = forwardedFor.split(',')[0]?.trim()
    if (firstIp) return firstIp
  }

  // Real IP header (nginx)
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp

  // Fallback
  return 'unknown'
}

/**
 * Create rate limit headers for response
 *
 * @param result - Rate limit check result
 * @returns Headers object
 */
export function rateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(60), // Could be dynamic
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
  }
}
