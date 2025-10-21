/**
 * LoginForm Component
 *
 * Form for user login with email and password
 * Includes validation, show/hide password, and forgot password link
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, type LoginFormData } from '@/lib/validation/auth'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  /** Callback function to handle form submission */
  onSubmit: (email: string, password: string) => Promise<void>
  /** Loading state during form submission */
  isLoading: boolean
  /** Error message from authentication */
  error: string | null
}

/**
 * Formularz logowania z walidacją email i hasła
 *
 * Funkcje:
 * - Walidacja w czasie rzeczywistym (blur/change)
 * - Show/hide password toggle
 * - Link "Zapomniałem hasła"
 * - Loading state podczas submit
 * - Inline error messages
 *
 * @example
 * ```tsx
 * const { login, isLoading, error } = useAuth()
 *
 * <LoginForm
 *   onSubmit={login}
 *   isLoading={isLoading}
 *   error={error}
 * />
 * ```
 */
export function LoginForm({ onSubmit, isLoading, error }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  const handleFormSubmit = async (data: LoginFormData) => {
    await onSubmit(data.email, data.password)
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

      {/* Email field */}
      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          type='email'
          autoComplete='email'
          placeholder='twoj@email.com'
          disabled={isLoading}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id='email-error' className='text-destructive text-sm' role='alert'>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password field */}
      <div className='space-y-2'>
        <Label htmlFor='password'>Hasło</Label>
        <div className='relative'>
          <Input
            id='password'
            type={showPassword ? 'text' : 'password'}
            autoComplete='current-password'
            placeholder='••••••••'
            disabled={isLoading}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
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
            id='password-error'
            className='text-destructive text-sm'
            role='alert'
          >
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Forgot password link */}
      <div className='flex justify-end'>
        <Link
          href='/auth/forgot-password'
          className='text-primary focus:ring-ring rounded text-sm hover:underline focus:ring-2 focus:ring-offset-2 focus:outline-none'
          tabIndex={isLoading ? -1 : 0}
        >
          Zapomniałem hasła
        </Link>
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
            Logowanie...
          </>
        ) : (
          'Zaloguj się'
        )}
      </Button>
    </form>
  )
}
