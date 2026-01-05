/**
 * Tests for date-formatting utility
 */

import { describe, it, expect } from 'vitest'
import {
  formatLocalDate,
  formatDateRange,
  addDays,
  getWeekStart,
  getWeekEnd,
  parseLocalDate,
} from '../date-formatting'

describe('date-formatting', () => {
  describe('formatLocalDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(2025, 0, 15) // January 15, 2025
      expect(formatLocalDate(date)).toBe('2025-01-15')
    })

    it('should pad single digit month and day with zeros', () => {
      const date = new Date(2025, 5, 5) // June 5, 2025
      expect(formatLocalDate(date)).toBe('2025-06-05')
    })

    it('should handle December correctly', () => {
      const date = new Date(2025, 11, 31) // December 31, 2025
      expect(formatLocalDate(date)).toBe('2025-12-31')
    })
  })

  describe('formatDateRange', () => {
    it('should return formatted start and end dates', () => {
      const start = new Date(2025, 0, 15)
      const end = new Date(2025, 0, 21)
      const result = formatDateRange(start, end)

      expect(result).toEqual({
        startDate: '2025-01-15',
        endDate: '2025-01-21',
      })
    })
  })

  describe('addDays', () => {
    it('should add positive days', () => {
      const date = new Date(2025, 0, 15)
      const result = addDays(date, 5)
      expect(formatLocalDate(result)).toBe('2025-01-20')
    })

    it('should subtract days with negative number', () => {
      const date = new Date(2025, 0, 15)
      const result = addDays(date, -7)
      expect(formatLocalDate(result)).toBe('2025-01-08')
    })

    it('should not modify the original date', () => {
      const date = new Date(2025, 0, 15)
      addDays(date, 5)
      expect(formatLocalDate(date)).toBe('2025-01-15')
    })

    it('should handle month overflow', () => {
      const date = new Date(2025, 0, 30)
      const result = addDays(date, 5)
      expect(formatLocalDate(result)).toBe('2025-02-04')
    })
  })

  describe('getWeekStart', () => {
    it('should return Monday for a Wednesday', () => {
      // January 15, 2025 is Wednesday
      const date = new Date(2025, 0, 15)
      const monday = getWeekStart(date)
      expect(formatLocalDate(monday)).toBe('2025-01-13')
    })

    it('should return same day for Monday', () => {
      // January 13, 2025 is Monday
      const date = new Date(2025, 0, 13)
      const monday = getWeekStart(date)
      expect(formatLocalDate(monday)).toBe('2025-01-13')
    })

    it('should return previous Monday for Sunday', () => {
      // January 19, 2025 is Sunday
      const date = new Date(2025, 0, 19)
      const monday = getWeekStart(date)
      expect(formatLocalDate(monday)).toBe('2025-01-13')
    })

    it('should set time to midnight', () => {
      const date = new Date(2025, 0, 15, 15, 30, 45)
      const monday = getWeekStart(date)
      expect(monday.getHours()).toBe(0)
      expect(monday.getMinutes()).toBe(0)
      expect(monday.getSeconds()).toBe(0)
    })
  })

  describe('getWeekEnd', () => {
    it('should return Sunday for a Wednesday', () => {
      // January 15, 2025 is Wednesday
      const date = new Date(2025, 0, 15)
      const sunday = getWeekEnd(date)
      expect(formatLocalDate(sunday)).toBe('2025-01-19')
    })

    it('should set time to end of day', () => {
      const date = new Date(2025, 0, 15)
      const sunday = getWeekEnd(date)
      expect(sunday.getHours()).toBe(23)
      expect(sunday.getMinutes()).toBe(59)
      expect(sunday.getSeconds()).toBe(59)
    })
  })

  describe('parseLocalDate', () => {
    it('should parse valid YYYY-MM-DD string', () => {
      const result = parseLocalDate('2025-01-15')
      expect(result).not.toBeNull()
      expect(result?.getFullYear()).toBe(2025)
      expect(result?.getMonth()).toBe(0) // January
      expect(result?.getDate()).toBe(15)
    })

    it('should return null for invalid format', () => {
      expect(parseLocalDate('15-01-2025')).toBeNull()
      expect(parseLocalDate('2025/01/15')).toBeNull()
      expect(parseLocalDate('invalid')).toBeNull()
    })

    it('should return null for invalid dates', () => {
      expect(parseLocalDate('2025-02-30')).toBeNull() // February 30 doesn't exist
      expect(parseLocalDate('2025-13-01')).toBeNull() // Month 13 doesn't exist
    })

    it('should return null for empty string', () => {
      expect(parseLocalDate('')).toBeNull()
    })
  })
})
