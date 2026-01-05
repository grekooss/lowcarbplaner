/**
 * Rate Limiter with Upstash Redis and In-Memory Fallback
 *
 * Uses Upstash Redis for distributed rate limiting in production.
 * Falls back to in-memory rate limiting if Upstash is not configured.
 *
 * Environment Variables:
 * - UPSTASH_REDIS_REST_URL: Upstash Redis REST API URL
 * - UPSTASH_REDIS_REST_TOKEN: Upstash Redis REST API token
 *
 * @example
 * ```typescript
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

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { NextRequest } from 'next/server'
import { logWarning } from '@/lib/error-logger'
import { env } from '@/lib/env'

// ============================================================================
// Types
// ============================================================================

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

interface RateLimitEntry {
  count: number
  resetTime: number
}

// ============================================================================
// Upstash Redis Configuration
// ============================================================================

const UPSTASH_URL = env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = env.UPSTASH_REDIS_REST_TOKEN

/**
 * Check if Upstash Redis is configured
 */
const isUpstashConfigured = !!(UPSTASH_URL && UPSTASH_TOKEN)

/**
 * Redis client instance (only created if configured)
 */
const redis = isUpstashConfigured
  ? new Redis({
      url: UPSTASH_URL!,
      token: UPSTASH_TOKEN!,
    })
  : null

// ============================================================================
// In-Memory Fallback Rate Limiter
// ============================================================================

/**
 * In-memory rate limiter for development/fallback
 *
 * Note: This resets on server restart and doesn't work across multiple instances.
 */
class InMemoryRateLimiter {
  private cache: Map<string, RateLimitEntry> = new Map()
  private config: RateLimitConfig
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor(config: RateLimitConfig) {
    this.config = config

    // Cleanup expired entries every minute (only in non-edge environments)
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
    }
  }

  async check(identifier: string): Promise<RateLimitResult> {
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

  reset(identifier: string): void {
    this.cache.delete(identifier)
  }

  clear(): void {
    this.cache.clear()
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

// ============================================================================
// Unified Rate Limiter
// ============================================================================

/**
 * Unified rate limiter that uses Upstash Redis when available,
 * falls back to in-memory rate limiting otherwise.
 */
class UnifiedRateLimiter {
  private upstashLimiter: Ratelimit | null = null
  private fallbackLimiter: InMemoryRateLimiter

  constructor(config: RateLimitConfig) {
    this.fallbackLimiter = new InMemoryRateLimiter(config)

    // Create Upstash limiter if configured
    if (isUpstashConfigured && redis) {
      // Convert windowMs to seconds for Upstash
      const windowSeconds = Math.ceil(config.windowMs / 1000)

      this.upstashLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          config.maxRequests,
          `${windowSeconds} s`
        ),
        analytics: true,
        prefix: 'lowcarbplaner:ratelimit',
      })
    }
  }

  /**
   * Check if a request should be allowed
   *
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @param prefix - Optional prefix for namespacing (e.g., 'auth', 'api')
   * @returns Rate limit result
   */
  async check(identifier: string, prefix?: string): Promise<RateLimitResult> {
    const key = prefix ? `${prefix}:${identifier}` : identifier

    // Use Upstash if available
    if (this.upstashLimiter) {
      try {
        const result = await this.upstashLimiter.limit(key)
        return {
          success: result.success,
          remaining: result.remaining,
          resetTime: result.reset,
        }
      } catch (error) {
        // Log error and fall back to in-memory
        logWarning(error, {
          source: 'rate-limit.UnifiedRateLimiter.check',
          metadata: { key, fallback: 'in-memory' },
        })
        return this.fallbackLimiter.check(key)
      }
    }

    // Use in-memory fallback
    return this.fallbackLimiter.check(key)
  }

  /**
   * Reset rate limit for an identifier
   */
  async reset(identifier: string, prefix?: string): Promise<void> {
    const key = prefix ? `${prefix}:${identifier}` : identifier

    if (this.upstashLimiter && redis) {
      try {
        // Delete all rate limit keys for this identifier
        const pattern = `lowcarbplaner:ratelimit:${key}*`
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
          await redis.del(...keys)
        }
      } catch (error) {
        logWarning(error, {
          source: 'rate-limit.UnifiedRateLimiter.reset',
          metadata: { key },
        })
      }
    }

    this.fallbackLimiter.reset(key)
  }

  /**
   * Check if using Redis (for monitoring/debugging)
   */
  get isUsingRedis(): boolean {
    return !!this.upstashLimiter
  }
}

// ============================================================================
// Rate Limiter Instances
// ============================================================================

/**
 * Default rate limiter: 60 requests per minute
 * Use for: general API endpoints
 */
export const rateLimit = new UnifiedRateLimiter({
  maxRequests: 60,
  windowMs: 60 * 1000, // 1 minute
})

/**
 * Strict rate limiter: 10 requests per minute
 * Use for: login, registration, password reset, feedback submission
 */
export const strictRateLimit = new UnifiedRateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
})

/**
 * Very strict rate limiter: 3 requests per minute
 * Use for: password reset requests, account deletion
 */
export const veryStrictRateLimit = new UnifiedRateLimiter({
  maxRequests: 3,
  windowMs: 60 * 1000, // 1 minute
})

/**
 * API rate limiter: 100 requests per minute
 * Use for: public API endpoints with higher limits
 */
export const apiRateLimit = new UnifiedRateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
})

// ============================================================================
// Helper Functions
// ============================================================================

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

  // Vercel
  const vercelIp = request.headers.get('x-vercel-forwarded-for')
  if (vercelIp) {
    const firstIp = vercelIp.split(',')[0]?.trim()
    if (firstIp) return firstIp
  }

  // Fallback
  return 'unknown'
}

/**
 * Create rate limit headers for response
 *
 * @param result - Rate limit check result
 * @param maxRequests - Maximum requests allowed (for header)
 * @returns Headers object
 */
export function rateLimitHeaders(
  result: RateLimitResult,
  maxRequests: number = 60
): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(maxRequests),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
  }
}

/**
 * Check if Upstash Redis is being used for rate limiting
 * Useful for health checks and debugging
 */
export function isUsingRedisRateLimiting(): boolean {
  return isUpstashConfigured
}

// ============================================================================
// Re-export for backward compatibility
// ============================================================================

export type { RateLimitResult, RateLimitConfig }
