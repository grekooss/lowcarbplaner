/**
 * Mock ForgotPasswordForm Component
 *
 * Used in tests to avoid 'use client' directive issues with Vitest/esbuild
 */

import { useState } from 'react'

export interface ForgotPasswordFormProps {
  onSubmit: (email: string) => void | Promise<void>
  isLoading: boolean
  error: string | null
  success: boolean
}

export function ForgotPasswordForm({
  onSubmit,
  isLoading,
  error,
  success,
}: ForgotPasswordFormProps) {
  const [emailError, setEmailError] = useState('')

  const validateEmail = (val: string) => {
    if (!val) {
      setEmailError('Email jest wymagany')
      return false
    }
    if (!val.includes('@')) {
      setEmailError('Nieprawidłowy format email')
      return false
    }
    setEmailError('')
    return true
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const emailVal = (form.elements.namedItem('email') as HTMLInputElement)
      .value

    const emailValid = validateEmail(emailVal)

    if (emailValid && !isLoading) {
      onSubmit(emailVal)
    }
  }

  if (success) {
    return (
      <div data-testid='success-message' role='status'>
        <h2>Link resetowania wysłany</h2>
        <p>
          Sprawdź swoją skrzynkę pocztową. Jeśli konto istnieje, otrzymasz link
          do zresetowania hasła.
        </p>
        <a href='/auth/login'>Powrót do logowania</a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} data-testid='forgot-password-form'>
      <p>Podaj adres email, a wyślemy link resetujący hasło.</p>
      <div>
        <label htmlFor='email'>Email</label>
        <input
          id='email'
          name='email'
          type='email'
          disabled={isLoading}
          aria-invalid={emailError ? 'true' : 'false'}
          aria-describedby={emailError ? 'email-error' : undefined}
          onBlur={(e) => validateEmail(e.target.value)}
        />
        {emailError && <span id='email-error'>{emailError}</span>}
      </div>

      {error && <div role='alert'>{error}</div>}

      <button type='submit' disabled={isLoading} aria-busy={isLoading}>
        {isLoading ? 'Wysyłanie...' : 'Wyślij link resetowania'}
      </button>

      <a href='/auth/login'>Powrót do logowania</a>
    </form>
  )
}
