/**
 * Tests for auth-errors utility
 */

import { describe, it, expect } from 'vitest'
import { translateAuthError, AUTH_ERROR_MESSAGES } from '../auth-errors'

describe('auth-errors', () => {
  describe('translateAuthError', () => {
    it('should translate "Invalid login credentials"', () => {
      expect(translateAuthError('Invalid login credentials')).toBe(
        'Nieprawidłowy email lub hasło'
      )
    })

    it('should translate "Email not confirmed"', () => {
      expect(translateAuthError('Email not confirmed')).toBe(
        'Email nie został potwierdzony. Sprawdź swoją skrzynkę.'
      )
    })

    it('should translate "User already registered"', () => {
      expect(translateAuthError('User already registered')).toBe(
        'Użytkownik z tym emailem już istnieje'
      )
    })

    it('should translate "Password should be at least 6 characters"', () => {
      expect(
        translateAuthError('Password should be at least 6 characters')
      ).toBe('Hasło musi mieć co najmniej 6 znaków')
    })

    it('should translate "Email rate limit exceeded"', () => {
      expect(translateAuthError('Email rate limit exceeded')).toBe(
        'Zbyt wiele prób. Spróbuj ponownie później.'
      )
    })

    it('should translate "User not found"', () => {
      expect(translateAuthError('User not found')).toBe(
        'Użytkownik nie został znaleziony'
      )
    })

    it('should translate "Invalid email"', () => {
      expect(translateAuthError('Invalid email')).toBe(
        'Nieprawidłowy format email'
      )
    })

    it('should translate "Signup not allowed for this instance"', () => {
      expect(translateAuthError('Signup not allowed for this instance')).toBe(
        'Rejestracja jest obecnie niedostępna'
      )
    })

    it('should translate "Database error saving new user"', () => {
      expect(translateAuthError('Database error saving new user')).toBe(
        'Błąd podczas tworzenia konta'
      )
    })

    it('should translate "New password should be different from the old password"', () => {
      expect(
        translateAuthError(
          'New password should be different from the old password'
        )
      ).toBe('Nowe hasło musi być inne niż poprzednie')
    })

    it('should return default message for unknown error', () => {
      expect(translateAuthError('Some unknown error')).toBe(
        'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.'
      )
    })

    it('should return default message for empty error', () => {
      expect(translateAuthError('')).toBe(
        'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.'
      )
    })
  })

  describe('AUTH_ERROR_MESSAGES', () => {
    it('should contain all expected error mappings', () => {
      expect(Object.keys(AUTH_ERROR_MESSAGES).length).toBeGreaterThanOrEqual(10)
    })

    it('should have Polish translations for all keys', () => {
      Object.values(AUTH_ERROR_MESSAGES).forEach((translation) => {
        expect(translation).toBeTruthy()
        expect(typeof translation).toBe('string')
      })
    })
  })
})
