/**
 * ResetPasswordForm Component
 *
 * Form for setting new password after clicking reset link
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator'
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/lib/validation/auth'
import { cn } from '@/lib/utils'

interface ResetPasswordFormProps {
  /** Callback function to handle form submission */
  onSubmit: (password: string) => Promise<void>
  /** Loading state during form submission */
  isLoading: boolean
  /** Error message from authentication */
  error: string | null
}

/**
 * Formularz ustawienia nowego hasła
 *
 * Funkcje:
 * - Walidacja hasła (min 8 znaków, uppercase, lowercase, number)
 * - Walidacja potwierdzenia hasła
 * - PasswordStrengthIndicator
 * - Show/hide password toggle
 * - Submit → aktualizacja hasła
 * - Loading state podczas submit
 *
 * @example
 * ```tsx
 * const { updatePassword, isLoading, error } = useAuth()
 *
 * <ResetPasswordForm
 *   onSubmit={updatePassword}
 *   isLoading={isLoading}
 *   error={error}
 * />
 * ```
 */
export function ResetPasswordForm({
  onSubmit,
  isLoading,
  error,
}: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  })

  // Watch password value for strength indicator
  const passwordValue = watch('password', '')

  const handleFormSubmit = async (data: ResetPasswordFormData) => {
    await onSubmit(data.password)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
      {/* General error from auth */}
      {error && (
        <div
          className='bg-destructive/10 text-destructive rounded-md p-3 text-sm'
          role='alert'
          aria-live='polite'
        >
          {error}
        </div>
      )}

      {/* Password field */}
      <div className='space-y-2'>
        <Label htmlFor='reset-password'>Nowe hasło</Label>
        <div className='relative'>
          <Input
            id='reset-password'
            type={showPassword ? 'text' : 'password'}
            autoComplete='new-password'
            placeholder='••••••••'
            disabled={isLoading}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? 'reset-password-error' : undefined
            }
            className='pr-10'
            {...register('password')}
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className={cn(
              'absolute top-1/2 right-2 -translate-y-1/2',
              'hover:bg-muted rounded p-1',
              'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
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
            id='reset-password-error'
            className='text-destructive text-sm'
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
        <Label htmlFor='reset-confirm-password'>Potwierdź nowe hasło</Label>
        <div className='relative'>
          <Input
            id='reset-confirm-password'
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete='new-password'
            placeholder='••••••••'
            disabled={isLoading}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword
                ? 'reset-confirm-password-error'
                : undefined
            }
            className='pr-10'
            {...register('confirmPassword')}
          />
          <button
            type='button'
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
            className={cn(
              'absolute top-1/2 right-2 -translate-y-1/2',
              'hover:bg-muted rounded p-1',
              'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            aria-label={showConfirmPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
          >
            {showConfirmPassword ? (
              <EyeOff className='text-muted-foreground h-4 w-4' />
            ) : (
              <Eye className='text-muted-foreground h-4 w-4' />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p
            id='reset-confirm-password-error'
            className='text-destructive text-sm'
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
            Zmiana hasła...
          </>
        ) : (
          'Zmień hasło'
        )}
      </Button>
    </form>
  )
}
