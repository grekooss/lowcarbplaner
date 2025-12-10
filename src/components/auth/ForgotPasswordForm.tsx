/**
 * ForgotPasswordForm Component
 *
 * Form for requesting password reset email
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/validation/auth'

interface ForgotPasswordFormProps {
  /** Callback function to handle form submission, returns true on success */
  onSubmit: (email: string) => Promise<boolean>
  /** Loading state during form submission */
  isLoading: boolean
  /** Error message from authentication */
  error: string | null
}

/**
 * Formularz resetowania hasła (wysyłka email)
 *
 * Funkcje:
 * - Walidacja email
 * - Submit → wysyłka email z linkiem resetującym
 * - Success state z komunikatem
 * - Loading state podczas submit
 *
 * @example
 * ```tsx
 * const { resetPassword, isLoading, error } = useAuth()
 *
 * <ForgotPasswordForm
 *   onSubmit={resetPassword}
 *   isLoading={isLoading}
 *   error={error}
 * />
 * ```
 */
export function ForgotPasswordForm({
  onSubmit,
  isLoading,
  error,
}: ForgotPasswordFormProps) {
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  })

  const handleFormSubmit = async (data: ForgotPasswordFormData) => {
    setSuccess(false)
    const result = await onSubmit(data.email)
    if (result) {
      setSuccess(true)
    }
  }

  // Show success message after submission
  if (success) {
    return (
      <div className='space-y-3 text-center sm:space-y-4'>
        <div className='flex justify-center'>
          <CheckCircle2 className='h-10 w-10 text-red-600 sm:h-12 sm:w-12' />
        </div>
        <div className='space-y-1 sm:space-y-2'>
          <h3 className='text-base font-semibold sm:text-lg'>Email wysłany!</h3>
          <p className='text-muted-foreground text-xs sm:text-sm'>
            Sprawdź swoją skrzynkę pocztową i kliknij w link resetujący hasło.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className='space-y-2 sm:space-y-4'
    >
      {/* General error from auth */}
      {error && (
        <div
          className='rounded-md bg-red-50 p-2 text-xs text-red-600 sm:p-3 sm:text-sm'
          role='alert'
          aria-live='polite'
        >
          {error}
        </div>
      )}

      {/* Email field */}
      <div className='space-y-1 sm:space-y-2'>
        <Label htmlFor='forgot-email' className='text-xs sm:text-sm'>
          Email
        </Label>
        <Input
          id='forgot-email'
          type='email'
          autoComplete='email'
          placeholder='twoj@email.com'
          disabled={isLoading}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'forgot-email-error' : undefined}
          className='h-9 bg-white text-sm sm:h-10 sm:text-base'
          {...register('email')}
        />
        {errors.email && (
          <p
            id='forgot-email-error'
            className='text-xs text-red-600 sm:text-sm'
            role='alert'
          >
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type='submit'
        className='h-9 w-full text-sm sm:h-10 sm:text-base'
        disabled={isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' aria-hidden='true' />
            Wysyłanie...
          </>
        ) : (
          'Wyślij link resetujący'
        )}
      </Button>
    </form>
  )
}
