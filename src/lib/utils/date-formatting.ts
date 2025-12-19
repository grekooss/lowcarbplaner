/**
 * Date Formatting Utility
 *
 * Centralized date formatting functions used across the application.
 * All dates are formatted in local timezone to avoid timezone issues.
 *
 * @module lib/utils/date-formatting
 */

/**
 * Formats a Date object to YYYY-MM-DD string in local timezone
 *
 * Uses local date components to avoid timezone offset issues.
 * This is the standard format for API requests and database storage.
 *
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format
 *
 * @example
 * ```typescript
 * const today = new Date()
 * const formatted = formatLocalDate(today)
 * // Result: "2025-01-15" (in local timezone)
 * ```
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formats a date range to YYYY-MM-DD strings
 *
 * Convenience function for API requests that require date ranges.
 *
 * @param start - Start date
 * @param end - End date
 * @returns Object with formatted start and end date strings
 *
 * @example
 * ```typescript
 * const range = formatDateRange(startDate, endDate)
 * // Result: { startDate: "2025-01-15", endDate: "2025-01-21" }
 * ```
 */
export function formatDateRange(
  start: Date,
  end: Date
): { startDate: string; endDate: string } {
  return {
    startDate: formatLocalDate(start),
    endDate: formatLocalDate(end),
  }
}

/**
 * Returns a new Date offset by the specified number of days
 *
 * Creates a new Date object, leaving the original unchanged.
 *
 * @param date - Base date
 * @param days - Number of days to add (negative for subtraction)
 * @returns New Date object with the offset applied
 *
 * @example
 * ```typescript
 * const tomorrow = addDays(new Date(), 1)
 * const lastWeek = addDays(new Date(), -7)
 * ```
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Gets the start of the current week (Monday)
 *
 * Returns a new Date set to Monday 00:00:00 of the current week.
 *
 * @param date - Reference date
 * @returns Date set to Monday of that week
 *
 * @example
 * ```typescript
 * const monday = getWeekStart(new Date())
 * ```
 */
export function getWeekStart(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  // Adjust for Monday start (Sunday = 0, so we need special handling)
  const diff = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Gets the end of the current week (Sunday)
 *
 * Returns a new Date set to Sunday 23:59:59 of the current week.
 *
 * @param date - Reference date
 * @returns Date set to Sunday of that week
 *
 * @example
 * ```typescript
 * const sunday = getWeekEnd(new Date())
 * ```
 */
export function getWeekEnd(date: Date): Date {
  const monday = getWeekStart(date)
  const sunday = addDays(monday, 6)
  sunday.setHours(23, 59, 59, 999)
  return sunday
}

/**
 * Parses a YYYY-MM-DD string to a Date object
 *
 * Creates a Date in local timezone from a date string.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object or null if invalid
 *
 * @example
 * ```typescript
 * const date = parseLocalDate("2025-01-15")
 * ```
 */
export function parseLocalDate(dateString: string): Date | null {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null

  const year = match[1]
  const month = match[2]
  const day = match[3]

  if (!year || !month || !day) return null

  const yearNum = parseInt(year, 10)
  const monthNum = parseInt(month, 10)
  const dayNum = parseInt(day, 10)

  const date = new Date(yearNum, monthNum - 1, dayNum)

  // Validate the date is real (handles invalid dates like 2025-02-30)
  if (
    date.getFullYear() !== yearNum ||
    date.getMonth() !== monthNum - 1 ||
    date.getDate() !== dayNum
  ) {
    return null
  }

  return date
}
