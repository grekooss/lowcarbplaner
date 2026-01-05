/**
 * Centralized error logging utility
 *
 * In development: logs to console with detailed output
 * In production: outputs structured JSON for log aggregators
 */

type ErrorSeverity = 'warning' | 'error' | 'critical'

interface ErrorContext {
  /** Where the error occurred */
  source: string
  /** User ID if available */
  userId?: string
  /** Additional metadata */
  metadata?: Record<string, unknown>
}

interface LoggedError {
  message: string
  severity: ErrorSeverity
  context: ErrorContext
  timestamp: string
  stack?: string
}

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Logs an error with context information
 * Non-blocking - safe to use in fire-and-forget scenarios
 */
export function logError(
  error: unknown,
  severity: ErrorSeverity,
  context: ErrorContext
): void {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  const loggedError: LoggedError = {
    message: errorMessage,
    severity,
    context,
    timestamp: new Date().toISOString(),
    stack: errorStack,
  }

  if (isDevelopment) {
    // Development: detailed console output
    const consoleMethod =
      severity === 'critical'
        ? console.error
        : severity === 'error'
          ? console.error
          : console.warn

    consoleMethod(
      `[${severity.toUpperCase()}] ${context.source}:`,
      errorMessage
    )
    if (context.metadata) {
      consoleMethod('  Metadata:', context.metadata)
    }
    if (errorStack) {
      consoleMethod('  Stack:', errorStack)
    }
  } else {
    // Production: structured console output that can be captured by log aggregators
    console.error(JSON.stringify(loggedError))
  }
}

/**
 * Convenience function for warning-level errors (non-critical, recoverable)
 */
export function logWarning(error: unknown, context: ErrorContext): void {
  logError(error, 'warning', context)
}

/**
 * Convenience function for error-level errors (important but not critical)
 */
export function logErrorLevel(error: unknown, context: ErrorContext): void {
  logError(error, 'error', context)
}

/**
 * Convenience function for critical errors (requires immediate attention)
 */
export function logCritical(error: unknown, context: ErrorContext): void {
  logError(error, 'critical', context)
}
