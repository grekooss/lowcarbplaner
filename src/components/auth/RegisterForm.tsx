/**
 * RegisterForm Component
 *
 * Form for user registration with email, password, and confirmation
 * Includes password strength indicator and real-time validation
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'
import { registerSchema, type RegisterFormData } from '@/lib/validation/auth'
import { cn } from '@/lib/utils'

interface RegisterFormProps {
  /** Callback function to handle form submission */
  onSubmit: (email: string, password: string) => Promise<void>
  /** Loading state during form submission */
  isLoading: boolean
  /** Error message from authentication */
  error: string | null
  /** Whether to show password (controlled by parent) */
  showPassword: boolean
  /** Callback to toggle password visibility */
  onTogglePassword: () => void
}

/**
 * Formularz rejestracji z walidacją i wskaźnikiem siły hasła
 *
 * Funkcje:
 * - Walidacja w czasie rzeczywistym (blur/change)
 * - Walidacja siły hasła z wizualizacją wymagań
 * - Show/hide password toggle (dla obu pól)
 * - Sprawdzenie czy password === confirmPassword
 * - Loading state podczas submit
 * - Inline error messages
 *
 * @example
 * ```tsx
 * const { register, isLoading, error } = useAuth()
 *
 * <RegisterForm
 *   onSubmit={register}
 *   isLoading={isLoading}
 *   error={error}
 * />
 * ```
 */
export function RegisterForm({
  onSubmit,
  isLoading,
  error,
  showPassword,
  onTogglePassword,
}: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  // Watch password value for strength indicator
  const passwordValue = watch('password', '')

  const handleFormSubmit = async (data: RegisterFormData) => {
    await onSubmit(data.email, data.password)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
      {/* General error from auth */}
      {error && (
        <div
          className='rounded-md bg-red-50 p-3 text-sm text-red-600'
          role='alert'
          aria-live='polite'
        >
          {error}
        </div>
      )}

      {/* Email field */}
      <div className='space-y-2'>
        <Label htmlFor='register-email'>Email</Label>
        <Input
          id='register-email'
          type='email'
          autoComplete='email'
          placeholder='twoj@email.com'
          disabled={isLoading}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'register-email-error' : undefined}
          className='bg-white'
          {...register('email')}
        />
        {errors.email && (
          <p
            id='register-email-error'
            className='text-sm text-red-600'
            role='alert'
          >
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password field */}
      <div className='space-y-2'>
        <Label htmlFor='register-password'>Hasło</Label>
        <div className='relative'>
          <Input
            id='register-password'
            type={showPassword ? 'text' : 'password'}
            autoComplete='new-password'
            placeholder='••••••••'
            disabled={isLoading}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? 'register-password-error' : undefined
            }
            className='bg-white pr-10'
            {...register('password')}
          />
          <button
            type='button'
            onClick={onTogglePassword}
            disabled={isLoading}
            className={cn(
              'absolute top-1/2 right-2 -translate-y-1/2',
              'rounded p-1',
              'focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
          >
            {showPassword ? (
              <EyeOff className='text-muted-foreground h-4 w-4' />
            ) : (
              <Eye className='text-muted-foreground h-4 w-4' />
            )}
          </button>
        </div>
        {errors.password && (
          <p
            id='register-password-error'
            className='text-sm text-red-600'
            role='alert'
          >
            {errors.password.message}
          </p>
        )}

        {/* Password strength indicator */}
        <PasswordStrengthIndicator password={passwordValue} />
      </div>

      {/* Confirm password field */}
      <div className='space-y-2'>
        <Label htmlFor='confirm-password'>Potwierdź hasło</Label>
        <div className='relative'>
          <Input
            id='confirm-password'
            type={showPassword ? 'text' : 'password'}
            autoComplete='new-password'
            placeholder='••••••••'
            disabled={isLoading}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword ? 'confirm-password-error' : undefined
            }
            className='bg-white pr-10'
            {...register('confirmPassword')}
          />
          <button
            type='button'
            onClick={onTogglePassword}
            disabled={isLoading}
            className={cn(
              'absolute top-1/2 right-2 -translate-y-1/2',
              'rounded p-1',
              'focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
          >
            {showPassword ? (
              <EyeOff className='text-muted-foreground h-4 w-4' />
            ) : (
              <Eye className='text-muted-foreground h-4 w-4' />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p
            id='confirm-password-error'
            className='text-sm text-red-600'
            role='alert'
          >
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type='submit'
        className='w-full'
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' aria-hidden='true' />
            Tworzenie konta...
          </>
        ) : (
          'Załóż konto'
        )}
      </Button>
    </form>
  )
}
