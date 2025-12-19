/**
 * HTML Sanitization Utility
 *
 * Provides functions for sanitizing user input to prevent XSS attacks.
 * Uses a whitelist approach - only allows safe characters and patterns.
 *
 * @module lib/utils/sanitize
 */

/**
 * HTML entities that need to be escaped
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

/**
 * Escapes HTML special characters to prevent XSS
 *
 * Converts dangerous characters to their HTML entity equivalents.
 * Use this for user-generated content that will be displayed in HTML.
 *
 * @param input - Raw user input string
 * @returns Sanitized string safe for HTML rendering
 *
 * @example
 * ```typescript
 * const userInput = '<script>alert("xss")</script>'
 * const safe = escapeHtml(userInput)
 * // Result: '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
 * ```
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] ?? char)
}

/**
 * Strips all HTML tags from input
 *
 * Removes any HTML/XML tags while preserving text content.
 * More aggressive than escapeHtml - completely removes markup.
 *
 * @param input - Raw user input string
 * @returns String with all HTML tags removed
 *
 * @example
 * ```typescript
 * const userInput = '<b>Bold</b> and <script>evil</script>'
 * const safe = stripHtml(userInput)
 * // Result: 'Bold and evil'
 * ```
 */
export function stripHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Sanitizes text for safe storage and display
 *
 * Combines multiple sanitization techniques:
 * 1. Strips HTML tags
 * 2. Escapes remaining special characters
 * 3. Normalizes whitespace
 * 4. Trims leading/trailing whitespace
 *
 * Use this for user-generated content like feedback, comments, etc.
 *
 * @param input - Raw user input string
 * @returns Fully sanitized string
 *
 * @example
 * ```typescript
 * const feedback = '  <script>alert("xss")</script>  Great app!  '
 * const safe = sanitizeText(feedback)
 * // Result: 'alert(&quot;xss&quot;) Great app!'
 * ```
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // First strip HTML tags, then escape any remaining special chars
  const stripped = stripHtml(input)
  return escapeHtml(stripped)
}

/**
 * Sanitizes user input while preserving basic formatting
 *
 * Allows newlines and basic punctuation but removes dangerous content.
 * Suitable for multi-line text fields like feedback content.
 *
 * @param input - Raw user input string
 * @returns Sanitized string with preserved newlines
 *
 * @example
 * ```typescript
 * const feedback = 'Line 1\n<script>bad</script>\nLine 2'
 * const safe = sanitizeMultilineText(feedback)
 * // Result: 'Line 1\nalert(bad)\nLine 2'
 * ```
 */
export function sanitizeMultilineText(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Preserve newlines by replacing them temporarily
  const placeholder = '\u0000NEWLINE\u0000'
  const preserved = input.replace(/\r?\n/g, placeholder)

  // Sanitize the content
  const sanitized = sanitizeText(preserved)

  // Restore newlines
  return sanitized.replace(new RegExp(placeholder, 'g'), '\n')
}

/**
 * Validates and sanitizes a URL
 *
 * Only allows http, https, and mailto protocols.
 * Returns empty string for invalid or dangerous URLs.
 *
 * @param input - Raw URL string
 * @returns Sanitized URL or empty string if invalid
 *
 * @example
 * ```typescript
 * sanitizeUrl('https://example.com') // 'https://example.com'
 * sanitizeUrl('javascript:alert(1)') // ''
 * sanitizeUrl('data:text/html,...')  // ''
 * ```
 */
export function sanitizeUrl(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  const trimmed = input.trim()

  // Only allow safe protocols
  const safeProtocols = ['http:', 'https:', 'mailto:']

  try {
    const url = new URL(trimmed)
    if (!safeProtocols.includes(url.protocol)) {
      return ''
    }
    return url.href
  } catch {
    // If URL parsing fails, check if it's a relative URL
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed
    }
    return ''
  }
}
