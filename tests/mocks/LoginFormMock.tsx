/**
 * Mock LoginForm Component
 *
 * Used in tests to avoid 'use client' directive issues with Vitest/esbuild
 */

import { useState } from 'react'

export interface LoginFormProps {
  onSubmit: (email: string, password: string) => void | Promise<void>
  isLoading: boolean
  error: string | null
}

export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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
    if (val.length < 6) {
      setPasswordError('Hasło musi mieć minimum 6 znaki')
      return false
    }
    setPasswordError('')
    return true
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const emailVal = (form.elements.namedItem('email') as HTMLInputElement).value
    const passVal = (form.elements.namedItem('password') as HTMLInputElement).value

    const emailValid = validateEmail(emailVal)
    const passValid = validatePassword(passVal)

    if (emailValid && passValid && !isLoading) {
      onSubmit(emailVal, passVal)
    }
  }

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
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
        {emailError && <p id="email-error" role="alert">{emailError}</p>}
      </div>

      <div>
        <label htmlFor="password">Hasło</label>
        <input
          id="password"
          name="password"
          aria-label="Hasło"
          type={showPassword ? 'text' : 'password'}
          disabled={isLoading}
          aria-invalid={passwordError ? 'true' : 'false'}
          aria-describedby={passwordError ? 'password-error' : undefined}
          onBlur={(e) => validatePassword(e.target.value)}
        />
        <button
          type="button"
          aria-label={showPassword ? 'Ukryj' : 'Pokaż'}
          onClick={() => setShowPassword(!showPassword)}
          disabled={isLoading}
          data-testid="toggle-password"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
        {passwordError && <p id="password-error" role="alert">{passwordError}</p>}
      </div>

      {error && <div role="alert">{error}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logowanie...' : 'Zaloguj się'}
      </button>

      <a href="/auth/forgot-password">Zapomniałem hasła</a>
    </form>
  )
}
