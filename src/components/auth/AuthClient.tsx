/**
 * AuthClient Component
 *
 * Main client-side component for authentication
 * Manages tab switching between login and registration forms
 */

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { SocialAuthButton } from './SocialAuthButton'
import { useAuth } from '@/hooks/useAuth'
import type { AuthMode } from '@/types/auth-view.types'

interface AuthClientProps {
  /** Initial tab to display (from URL param) */
  initialTab: AuthMode
  /** Optional redirect path after successful login */
  redirectTo?: string
  /** Show close button (for standalone page) */
  showCloseButton?: boolean
}

/**
 * Główny komponent kliencki zarządzający uwierzytelnianiem
 *
 * Funkcje:
 * - Przełączanie między trybami login/register (tabs)
 * - Synchronizacja URL params z aktywnym tabem
 * - Integracja z hookiem useAuth
 * - Wyświetlanie formularzy i przycisku Google OAuth
 * - Separator "lub" między formularzami a social auth
 *
 * @example
 * ```tsx
 * <AuthClient initialTab="login" redirectTo="/dashboard" />
 * ```
 */
export function AuthClient({
  initialTab,
  redirectTo,
  showCloseButton = false,
}: AuthClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const {
    login,
    register,
    loginWithGoogle,
    isLoading,
    isGoogleLoading,
    error,
  } = useAuth(redirectTo)

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`/auth?${params.toString()}`, { scroll: false })
  }

  // Handle close button
  const handleClose = () => {
    router.back()
  }

  return (
    <div className='relative w-full max-w-2xl space-y-3 sm:space-y-6'>
      {/* Close button */}
      {showCloseButton && (
        <button
          onClick={handleClose}
          className='absolute -top-2 -right-2 rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100'
          aria-label='Zamknij'
        >
          <X className='h-5 w-5 text-gray-500' />
        </button>
      )}

      {/* Header */}
      <div className='space-y-1 text-center sm:space-y-2'>
        <h1 className='text-xl font-bold tracking-tight sm:text-3xl'>
          Witaj w LowCarbPlaner
        </h1>
        <p className='text-muted-foreground text-xs sm:text-base'>
          Zaloguj się lub utwórz konto, aby rozpocząć
        </p>
      </div>

      {/* Tabs for Login/Register */}
      <Tabs defaultValue={initialTab} onValueChange={handleTabChange}>
        <TabsList className='grid w-full grid-cols-2 bg-transparent'>
          <TabsTrigger
            value='login'
            className='hover:data-[state=inactive]:border-primary hover:data-[state=inactive]:text-primary text-xs data-[state=inactive]:border data-[state=inactive]:border-transparent data-[state=inactive]:bg-white hover:data-[state=inactive]:bg-white sm:text-sm'
          >
            Logowanie
          </TabsTrigger>
          <TabsTrigger
            value='register'
            className='hover:data-[state=inactive]:border-primary hover:data-[state=inactive]:text-primary text-xs data-[state=inactive]:border data-[state=inactive]:border-transparent data-[state=inactive]:bg-white hover:data-[state=inactive]:bg-white sm:text-sm'
          >
            Rejestracja
          </TabsTrigger>
        </TabsList>

        {/* Login Tab */}
        <TabsContent value='login' className='mt-3 sm:mt-6'>
          <LoginForm
            onSubmit={login}
            isLoading={isLoading}
            error={error}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
        </TabsContent>

        {/* Register Tab */}
        <TabsContent value='register' className='mt-3 sm:mt-6'>
          <RegisterForm
            onSubmit={register}
            isLoading={isLoading}
            error={error}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
        </TabsContent>
      </Tabs>

      {/* Separator */}
      <div className='flex justify-center'>
        <span className='text-muted-foreground text-xs uppercase'>lub</span>
      </div>

      {/* Social Auth */}
      <SocialAuthButton
        onLogin={loginWithGoogle}
        isLoading={isGoogleLoading}
        className='w-full'
      />
    </div>
  )
}
