/**
 * Auth View Types
 *
 * Type definitions for authentication views and forms
 */

/**
 * Tryb formularza uwierzytelniania
 */
export type AuthMode = 'login' | 'register'

/**
 * Dane formularza logowania
 */
export interface LoginFormData {
  email: string
  password: string
}

/**
 * Dane formularza rejestracji
 */
export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
}

/**
 * Dane formularza resetowania hasła (wysyłka email)
 */
export interface ForgotPasswordFormData {
  email: string
}

/**
 * Dane formularza ustawienia nowego hasła
 */
export interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

/**
 * Błędy formularza (generyczne)
 */
export interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

/**
 * Siła hasła (dla PasswordStrengthIndicator)
 */
export type PasswordStrength = 'weak' | 'medium' | 'strong'

/**
 * Wymagania hasła (checklist)
 */
export interface PasswordRequirements {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
}

/**
 * Wynik obliczenia siły hasła
 */
export interface PasswordStrengthResult {
  strength: PasswordStrength
  score: number // 0-100
  requirements: PasswordRequirements
}

/**
 * Stan hooka useAuth
 */
export interface UseAuthReturn {
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}
