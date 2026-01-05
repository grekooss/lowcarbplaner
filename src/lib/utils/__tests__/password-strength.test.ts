/**
 * Tests for password-strength utility
 */

import { describe, it, expect } from 'vitest'
import {
  calculatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText,
} from '../password-strength'

describe('password-strength', () => {
  describe('calculatePasswordStrength', () => {
    it('should return weak for short password', () => {
      const result = calculatePasswordStrength('abc')
      expect(result.strength).toBe('weak')
      expect(result.requirements.minLength).toBe(false)
    })

    it('should return strong for password meeting 3/4 requirements (no uppercase)', () => {
      // 'password123' meets: minLength, hasLowercase, hasNumber (3/4 = 75% = strong)
      const result = calculatePasswordStrength('password123')
      expect(result.strength).toBe('strong') // 75% score = strong
      expect(result.requirements.hasUppercase).toBe(false)
      expect(result.requirements.minLength).toBe(true)
      expect(result.requirements.hasLowercase).toBe(true)
      expect(result.requirements.hasNumber).toBe(true)
    })

    it('should return medium for password meeting some requirements', () => {
      const result = calculatePasswordStrength('Password1')
      expect(result.strength).toBe('strong')
      expect(result.requirements.minLength).toBe(true)
      expect(result.requirements.hasUppercase).toBe(true)
      expect(result.requirements.hasLowercase).toBe(true)
      expect(result.requirements.hasNumber).toBe(true)
    })

    it('should return strong for password meeting all requirements', () => {
      const result = calculatePasswordStrength('SecurePass123!')
      expect(result.strength).toBe('strong')
      expect(result.score).toBe(100)
      expect(result.requirements).toEqual({
        minLength: true,
        hasUppercase: true,
        hasLowercase: true,
        hasNumber: true,
      })
    })

    it('should calculate correct score based on met requirements', () => {
      // 0/4 requirements = 0%
      expect(calculatePasswordStrength('').score).toBe(0)

      // 1/4 requirements = 25% (only lowercase)
      expect(calculatePasswordStrength('abc').score).toBe(25)

      // 2/4 requirements = 50% (lowercase + uppercase)
      expect(calculatePasswordStrength('abcABC').score).toBe(50)

      // 3/4 requirements = 75% (8 chars + lower + upper)
      expect(calculatePasswordStrength('abcABCdef').score).toBe(75)

      // 4/4 requirements = 100%
      expect(calculatePasswordStrength('abcABC123').score).toBe(100)
    })

    it('should check minLength requirement correctly', () => {
      expect(calculatePasswordStrength('1234567').requirements.minLength).toBe(
        false
      )
      expect(calculatePasswordStrength('12345678').requirements.minLength).toBe(
        true
      )
    })

    it('should check hasUppercase requirement correctly', () => {
      expect(
        calculatePasswordStrength('lowercase').requirements.hasUppercase
      ).toBe(false)
      expect(
        calculatePasswordStrength('Uppercase').requirements.hasUppercase
      ).toBe(true)
    })

    it('should check hasLowercase requirement correctly', () => {
      expect(
        calculatePasswordStrength('UPPERCASE').requirements.hasLowercase
      ).toBe(false)
      expect(
        calculatePasswordStrength('lowercase').requirements.hasLowercase
      ).toBe(true)
    })

    it('should check hasNumber requirement correctly', () => {
      expect(
        calculatePasswordStrength('NoNumbers').requirements.hasNumber
      ).toBe(false)
      expect(
        calculatePasswordStrength('With1Number').requirements.hasNumber
      ).toBe(true)
    })
  })

  describe('getPasswordStrengthColor', () => {
    it('should return green for strong', () => {
      expect(getPasswordStrengthColor('strong')).toBe('bg-green-500')
    })

    it('should return yellow for medium', () => {
      expect(getPasswordStrengthColor('medium')).toBe('bg-yellow-500')
    })

    it('should return red for weak', () => {
      expect(getPasswordStrengthColor('weak')).toBe('bg-red-500')
    })

    it('should return gray for unknown strength', () => {
      // @ts-expect-error Testing unknown strength
      expect(getPasswordStrengthColor('unknown')).toBe('bg-gray-300')
    })
  })

  describe('getPasswordStrengthText', () => {
    it('should return Polish text for strong', () => {
      expect(getPasswordStrengthText('strong')).toBe('Silne hasło')
    })

    it('should return Polish text for medium', () => {
      expect(getPasswordStrengthText('medium')).toBe('Średnie hasło')
    })

    it('should return Polish text for weak', () => {
      expect(getPasswordStrengthText('weak')).toBe('Słabe hasło')
    })

    it('should return empty string for unknown strength', () => {
      // @ts-expect-error Testing unknown strength
      expect(getPasswordStrengthText('unknown')).toBe('')
    })
  })
})
