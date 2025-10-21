/**
 * Password Strength Calculator
 *
 * Utilities for calculating password strength and checking requirements
 */

import type {
  PasswordRequirements,
  PasswordStrength,
  PasswordStrengthResult,
} from '@/types/auth-view.types'

/**
 * Oblicza siłę hasła i sprawdza wymagania
 */
export function calculatePasswordStrength(
  password: string
): PasswordStrengthResult {
  const requirements: PasswordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }

  // Oblicz liczbę spełnionych wymagań
  const metRequirements = Object.values(requirements).filter(Boolean).length

  // Przelicz na score 0-100
  const score = (metRequirements / 4) * 100

  // Określ siłę hasła
  let strength: PasswordStrength = 'weak'
  if (score >= 75) {
    strength = 'strong'
  } else if (score >= 50) {
    strength = 'medium'
  }

  return {
    strength,
    score,
    requirements,
  }
}

/**
 * Zwraca kolor progress bar dla danej siły hasła
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'strong':
      return 'bg-green-500'
    case 'medium':
      return 'bg-yellow-500'
    case 'weak':
      return 'bg-red-500'
    default:
      return 'bg-gray-300'
  }
}

/**
 * Zwraca tekst dla danej siły hasła
 */
export function getPasswordStrengthText(strength: PasswordStrength): string {
  switch (strength) {
    case 'strong':
      return 'Silne hasło'
    case 'medium':
      return 'Średnie hasło'
    case 'weak':
      return 'Słabe hasło'
    default:
      return ''
  }
}
