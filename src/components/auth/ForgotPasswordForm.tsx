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
      <div className='space-y-4 text-center'>
        <div className='flex justify-center'>
          <CheckCircle2 className='h-12 w-12 text-red-600' />
        </div>
        <div className='space-y-2'>
          <h3 className='text-lg font-semibold'>Email wysłany!</h3>
          <p className='text-muted-foreground text-sm'>
            Sprawdź swoją skrzynkę pocztową i kliknij w link resetujący hasło.
          </p>
        </div>
      </div>
    )
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
        <Label htmlFor='forgot-email'>Email</Label>
        <Input
          id='forgot-email'
          type='email'
          autoComplete='email'
          placeholder='twoj@email.com'
          disabled={isLoading}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'forgot-email-error' : undefined}
          className='bg-white'
          {...register('email')}
        />
        {errors.email && (
          <p
            id='forgot-email-error'
            className='text-sm text-red-600'
            role='alert'
          >
            {errors.email.message}
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
            Wysyłanie...
          </>
        ) : (
          'Wyślij link resetujący'
        )}
      </Button>
    </form>
  )
}
