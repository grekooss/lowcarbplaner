/**
 * AuthClient Component
 *
 * Main client-side component for authentication
 * Manages tab switching between login and registration forms
 */

'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
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
export function AuthClient({ initialTab, redirectTo }: AuthClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, register, loginWithGoogle, isLoading, error } =
    useAuth(redirectTo)

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`/auth?${params.toString()}`, { scroll: false })
  }

  return (
    <div className='w-full max-w-md space-y-6'>
      {/* Header */}
      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Witaj w LowCarbPlaner
        </h1>
        <p className='text-muted-foreground'>
          Zaloguj się lub utwórz konto, aby rozpocząć
        </p>
      </div>

      {/* Tabs for Login/Register */}
      <Tabs defaultValue={initialTab} onValueChange={handleTabChange}>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='login'>Logowanie</TabsTrigger>
          <TabsTrigger value='register'>Rejestracja</TabsTrigger>
        </TabsList>

        {/* Login Tab */}
        <TabsContent value='login' className='mt-6'>
          <LoginForm onSubmit={login} isLoading={isLoading} error={error} />
        </TabsContent>

        {/* Register Tab */}
        <TabsContent value='register' className='mt-6'>
          <RegisterForm
            onSubmit={register}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
      </Tabs>

      {/* Separator */}
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <Separator />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background text-muted-foreground px-2'>lub</span>
        </div>
      </div>

      {/* Social Auth */}
      <SocialAuthButton
        onLogin={loginWithGoogle}
        isLoading={isLoading}
        className='w-full'
      />
    </div>
  )
}
