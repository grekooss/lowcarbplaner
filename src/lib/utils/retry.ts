/**
 * Retry Utility
 *
 * Provides retry mechanisms with exponential backoff for async operations.
 * Useful for fire-and-forget actions that need reliability without blocking.
 *
 * @example
 * ```typescript
 * import { withRetry, withRetryResult } from '@/lib/utils/retry'
 *
 * // For operations returning data
 * const result = await withRetry(
 *   () => fetchData(),
 *   { maxRetries: 3, delayMs: 1000 },
 *   { source: 'myFunction', userId: '123' }
 * )
 *
 * // For operations returning { error } (Supabase-style)
 * const success = await withRetryResult(
 *   () => supabase.from('table').delete().eq('id', id),
 *   { source: 'deleteRecord', userId: '123' }
 * )
 * ```
 */

import { logWarning, logErrorLevel } from '@/lib/error-logger'

// ============================================================================
// Types
// ============================================================================

export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number
  /** Base delay in milliseconds (default: 1000) */
  delayMs?: number
  /** Use exponential backoff (default: true) */
  backoff?: boolean
}

export interface RetryContext {
  /** Source identifier for logging */
  source: string
  /** Optional user ID for logging */
  userId?: string
  /** Additional metadata for logging */
  metadata?: Record<string, unknown>
}

// ============================================================================
// Retry Functions
// ============================================================================

/**
 * Executes an async operation with retry mechanism.
 * Returns null on failure after all retries are exhausted.
 *
 * Use for fire-and-forget operations where you want reliability
 * without blocking the main flow.
 *
 * @param operation - Async function to execute
 * @param options - Retry configuration
 * @param context - Logging context
 * @returns Operation result or null on failure
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
  context: RetryContext
): Promise<T | null> {
  const { maxRetries = 3, delayMs = 1000, backoff = true } = options

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (err) {
      const isLastAttempt = attempt === maxRetries

      if (isLastAttempt) {
        logWarning(err, {
          source: context.source,
          userId: context.userId,
          metadata: {
            ...context.metadata,
            attempt,
            maxRetries,
            finalFailure: true,
          },
        })
        return null
      }

      // Exponential backoff: delayMs, delayMs*2, delayMs*4...
      const waitTime = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  return null
}

/**
 * Executes an operation that returns { error } (Supabase-style) with retry.
 * Returns true on success, false on failure after all retries.
 *
 * Optimized for Supabase operations like delete, update, insert.
 *
 * @param operation - Async function returning { error: unknown }
 * @param context - Logging context
 * @param options - Retry configuration (default: 3 retries, 200ms base delay)
 * @returns true if successful, false if all retries failed
 */
export async function withRetryResult(
  operation: () => Promise<{ error: unknown }>,
  context: RetryContext,
  options: RetryOptions = {}
): Promise<boolean> {
  const { maxRetries = 3, delayMs = 200, backoff = true } = options

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const { error } = await operation()
    if (!error) return true

    const isLastAttempt = attempt === maxRetries

    if (isLastAttempt) {
      logErrorLevel(error, {
        source: context.source,
        userId: context.userId,
        metadata: {
          ...context.metadata,
          attempt,
          maxRetries,
          finalFailure: true,
        },
      })
      return false
    }

    // Exponential backoff: 200ms, 400ms, 800ms...
    const waitTime = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs
    await new Promise((resolve) => setTimeout(resolve, waitTime))
  }

  return false
}

/**
 * Executes an operation with retry, throwing on final failure.
 * Use when the operation is critical and must succeed.
 *
 * @param operation - Async function to execute
 * @param options - Retry configuration
 * @param context - Logging context
 * @returns Operation result
 * @throws Error if all retries are exhausted
 */
export async function withRetryOrThrow<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
  context: RetryContext
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, backoff = true } = options

  let lastError: unknown

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (err) {
      lastError = err
      const isLastAttempt = attempt === maxRetries

      if (isLastAttempt) {
        logErrorLevel(err, {
          source: context.source,
          userId: context.userId,
          metadata: {
            ...context.metadata,
            attempt,
            maxRetries,
            finalFailure: true,
          },
        })
        throw err
      }

      // Exponential backoff
      const waitTime = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  throw lastError
}
