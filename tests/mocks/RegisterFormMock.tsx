/**
 * Mock RegisterForm Component
 *
 * Used in tests to avoid 'use client' directive issues with Vitest/esbuild
 */

import { useState } from 'react'

export interface RegisterFormProps {
  onSubmit: (email: string, password: string) => void | Promise<void>
  isLoading: boolean
  error: string | null
}

export function RegisterForm({ onSubmit, isLoading, error }: RegisterFormProps) {
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 8) return 'weak'

    let strength = 0
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++

    if (strength <= 2) return 'weak'
    if (strength === 3) return 'medium'
    return 'strong'
  }

  const validateEmail = (val: string) => {
    if (!val.includes('@')) {
      setEmailError('Nieprawidłowy format email')
      return false
    }
    setEmailError('')
    return true
  }

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError('Hasło jest wymagane')
      return false
    }
    if (val.length < 8) {
      setPasswordError('Hasło musi mieć minimum 8 znaków')
      return false
    }
    if (!/[A-Z]/.test(val)) {
      setPasswordError('Hasło musi zawierać wielką literę')
      return false
    }
    if (!/[0-9]/.test(val)) {
      setPasswordError('Hasło musi zawierać cyfrę')
      return false
    }
    setPasswordError('')
    return true
  }

  const validateConfirmPassword = (password: string, confirmPassword: string) => {
    if (password !== confirmPassword) {
      setConfirmPasswordError('Hasła muszą być identyczne')
      return false
    }
    setConfirmPasswordError('')
    return true
  }

  const handlePasswordChange = (val: string) => {
    const strength = calculatePasswordStrength(val)
    setPasswordStrength(strength)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const emailVal = (form.elements.namedItem('email') as HTMLInputElement).value
    const passVal = (form.elements.namedItem('password') as HTMLInputElement).value
    const confirmPassVal = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value

    const emailValid = validateEmail(emailVal)
    const passValid = validatePassword(passVal)
    const confirmValid = validateConfirmPassword(passVal, confirmPassVal)

    if (emailValid && passValid && confirmValid && !isLoading) {
      onSubmit(emailVal, passVal)
    }
  }

  return (
    <form onSubmit={handleSubmit} data-testid="register-form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          disabled={isLoading}
          aria-invalid={emailError ? 'true' : 'false'}
          aria-describedby={emailError ? 'email-error' : undefined}
          onBlur={(e) => validateEmail(e.target.value)}
        />
        {emailError && <span id="email-error">{emailError}</span>}
      </div>

      <div>
        <label htmlFor="password">Hasło</label>
        <input
          id="password"
          name="password"
          aria-label="Hasło"
          type={showPassword ? 'text' : 'password'}
          disabled={isLoading}
          onBlur={(e) => validatePassword(e.target.value)}
          onChange={(e) => handlePasswordChange(e.target.value)}
        />
        <button
          type="button"
          aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
          onClick={() => setShowPassword(!showPassword)}
          disabled={isLoading}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
        {passwordError && <span>{passwordError}</span>}

        {/* Password strength indicator */}
        <div data-testid="password-strength">
          <span>Siła hasła:</span>
          <span data-strength={passwordStrength}>
            {passwordStrength === 'weak' && 'Słabe'}
            {passwordStrength === 'medium' && 'Średnie'}
            {passwordStrength === 'strong' && 'Silne'}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword">Potwierdź hasło</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          aria-label="Potwierdź hasło"
          type={showConfirmPassword ? 'text' : 'password'}
          disabled={isLoading}
          onBlur={(e) => {
            const passVal = (document.getElementById('password') as HTMLInputElement).value
            validateConfirmPassword(passVal, e.target.value)
          }}
        />
        <button
          type="button"
          aria-label={showConfirmPassword ? 'Ukryj potwierdzenie hasła' : 'Pokaż potwierdzenie hasła'}
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          disabled={isLoading}
        >
          {showConfirmPassword ? 'Hide' : 'Show'}
        </button>
        {confirmPasswordError && <span>{confirmPasswordError}</span>}
      </div>

      {error && <div role="alert">{error}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
      </button>

      <a href="/auth/login">Masz już konto? Zaloguj się</a>
    </form>
  )
}
