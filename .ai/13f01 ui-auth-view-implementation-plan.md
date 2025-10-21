# Plan implementacji widoku Uwierzytelniania

## 1. Przegląd

Widok Uwierzytelniania to **publiczny formularz** umożliwiający nowym użytkownikom rejestrację, a istniejącym logowanie do aplikacji LowCarbPlaner. Jest to **punkt wejścia** do aplikacji, dostępny pod ścieżką `/auth`.

Główne cele widoku:

- Umożliwienie rejestracji nowych użytkowników (email + hasło)
- Umożliwienie logowania istniejących użytkowników (email + hasło)
- Rejestracja i logowanie przez Google OAuth
- Odzyskiwanie zapomnianego hasła
- Automatyczne przekierowanie po zalogowaniu (do onboardingu lub dashboardu)

Kluczowe cechy UX:

- **Przełączanie między trybami** - tabs "Logowanie" / "Rejestracja" bez przeładowania strony
- **Walidacja w czasie rzeczywistym** - feedback natychmiast po blur/change
- **Walidacja siły hasła** - wizualizacja wymagań bezpieczeństwa
- **Social auth** - jednym kliknięciem przez Google
- **Accessibility-first** - pełna obsługa klawiatury i screen readerów
- **Komunikacja przez HTTPS** - wymuszone połączenie bezpieczne

## 2. Routing widoku

**Ścieżka główna:** `/auth`

**Lokalizacja pliku:** `app/(public)/auth/page.tsx`

**Dodatkowe ścieżki:**

- **`/auth/reset-password`** - Formularz resetowania hasła (z tokenem z email)
- **`/auth/callback`** - Callback OAuth (Google, obsługiwany przez Supabase)

**Parametry URL:**

- `tab` (opcjonalny) - tryb formularza: `login` (default) lub `register`
- `redirect` (opcjonalny) - ścieżka do przekierowania po zalogowaniu (np. `/recipes/123`)

**Middleware:**

- Sprawdzenie czy użytkownik NIE jest zalogowany (jeśli zalogowany → redirect na `/` lub `redirect` param)

## 3. Struktura komponentów

```
AuthPage (Server Component)
└── AuthClient (Client Component - główny wrapper)
    ├── Tabs (shadcn/ui)
    │   ├── TabsList
    │   │   ├── TabsTrigger "Logowanie"
    │   │   └── TabsTrigger "Rejestracja"
    │   ├── TabsContent "Logowanie"
    │   │   └── LoginForm (Client Component)
    │   │       ├── Input email
    │   │       ├── Input password
    │   │       ├── Link "Zapomniałem hasła"
    │   │       └── Button "Zaloguj się"
    │   └── TabsContent "Rejestracja"
    │       └── RegisterForm (Client Component)
    │           ├── Input email
    │           ├── Input password
    │           ├── Input confirmPassword
    │           ├── PasswordStrengthIndicator
    │           └── Button "Załóż konto"
    ├── Separator + tekst "lub"
    ├── SocialAuthButton (Client Component)
    │   └── Button "Kontynuuj z Google"
    └── ErrorMessage (opcjonalnie)
```

**Separacja odpowiedzialności:**

- **AuthPage (Server Component):** Initial check (redirect jeśli zalogowany)
- **AuthClient (Client Component):** Zarządzanie trybem (tab), komunikacja z Supabase Auth
- **LoginForm / RegisterForm:** Walidacja formularzy, submit
- **SocialAuthButton:** OAuth flow (Google)
- **PasswordStrengthIndicator:** Wizualizacja wymagań hasła

## 4. Szczegóły komponentów

### AuthPage (Server Component)

**Opis:** Główny kontener widoku, odpowiedzialny za sprawdzenie sesji i przekierowanie zalogowanych użytkowników.

**Główne elementy:**

- Sprawdzenie sesji użytkownika
- Przekierowanie jeśli zalogowany
- Wrapper `<main>` z centrowaniem
- Komponent `<AuthClient>`

**Obsługiwane interakcje:** Brak (Server Component)

**Obsługiwana walidacja:**

- Sprawdzenie czy użytkownik NIE jest zalogowany
- Sprawdzenie czy profil istnieje (przekierowanie odpowiednio do `/` lub `/onboarding`)

**Typy:**

- `User` (z Supabase Auth)
- `searchParams` (redirect, tab)

**Propsy:**

```typescript
interface AuthPageProps {
  searchParams: {
    tab?: 'login' | 'register'
    redirect?: string
  }
}
```

---

### AuthClient (Client Component)

**Opis:** Główny komponent kliencki zarządzający trybem (login/register), stanem formularzy i komunikacją z Supabase Auth.

**Główne elementy:**

- `<div>` wrapper z layoutem (max-width: 400px, centered)
- Heading h1: "Witaj w LowCarbPlaner"
- `<Tabs>` z shadcn/ui (domyślnie `tab` z URL lub 'login')
- `<LoginForm>` lub `<RegisterForm>` (conditional)
- `<Separator>` + tekst "lub"
- `<SocialAuthButton>`
- Komunikaty błędów/sukcesu (toast lub inline)

**Obsługiwane interakcje:**

- Zmiana tab → update URL param
- Submit form → wywołanie Supabase Auth API
- Click "Google" → OAuth flow

**Obsługiwana walidacja:**

- Przekazanie błędów z Supabase Auth do formularzy
- Obsługa redirectów po zalogowaniu

**Typy:**

- `AuthMode` ('login' | 'register')
- `AuthError` (ViewModel)

**Propsy:**

```typescript
interface AuthClientProps {
  initialTab: 'login' | 'register'
  redirectTo?: string
}
```

**Implementacja hooka zarządzania stanem:**

```typescript
// hooks/useAuth.ts
interface UseAuthReturn {
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}
```

---

### LoginForm (Client Component)

**Opis:** Formularz logowania z walidacją email i hasła.

**Główne elementy:**

- `<form>` z onSubmit
- `<Input>` email (type="email", required, autocomplete="email")
- `<Input>` password (type="password", required, autocomplete="current-password")
  - Przycisk "show/hide password" (eye icon)
- `<Link>` "Zapomniałem hasła" → `/auth/forgot-password`
- `<Button type="submit">` "Zaloguj się" (loading state podczas submit)
- Komunikaty błędów inline (pod inputami)

**Obsługiwane interakcje:**

- onChange → walidacja w czasie rzeczywistym (blur)
- onSubmit → wywołanie `login(email, password)`
- Click "show password" → toggle visibility

**Obsługiwana walidacja:**

- Email: format email (regex), required
- Password: required, min 6 znaków
- Błędy z API: "Nieprawidłowy email lub hasło", "Konto nie istnieje", etc.

**Typy:**

- `LoginFormData` (ViewModel)
- `LoginFormErrors` (ViewModel)

**Propsy:**

```typescript
interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  isLoading: boolean
  error: string | null
}
```

**Implementacja z React Hook Form + Zod:**

```typescript
// lib/validation/auth.ts
export const loginSchema = z.object({
  email: z
    .string()
    .email('Nieprawidłowy format email')
    .min(1, 'Email jest wymagany'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
})

export type LoginFormData = z.infer<typeof loginSchema>
```

---

### RegisterForm (Client Component)

**Opis:** Formularz rejestracji z walidacją email, hasła i potwierdzenia hasła.

**Główne elementy:**

- `<form>` z onSubmit
- `<Input>` email (type="email", required, autocomplete="email")
- `<Input>` password (type="password", required, autocomplete="new-password")
  - Przycisk "show/hide password"
- `<Input>` confirmPassword (type="password", required, autocomplete="new-password")
- `<PasswordStrengthIndicator>` (pod password input)
- `<Button type="submit">` "Załóż konto" (loading state)
- Komunikaty błędów inline

**Obsługiwane interakcje:**

- onChange password → aktualizacja `PasswordStrengthIndicator`
- onSubmit → wywołanie `register(email, password)`
- Walidacja confirmPassword → sprawdzenie czy === password

**Obsługiwana walidacja:**

- Email: format email, required, sprawdzenie czy nie istnieje (API)
- Password:
  - Min 8 znaków
  - Co najmniej 1 wielka litera
  - Co najmniej 1 mała litera
  - Co najmniej 1 cyfra
  - Opcjonalnie: co najmniej 1 znak specjalny
- Confirm Password: musi być identyczne z password
- Błędy z API: "Email już zarejestrowany", etc.

**Typy:**

- `RegisterFormData` (ViewModel)
- `RegisterFormErrors` (ViewModel)
- `PasswordStrength` ('weak' | 'medium' | 'strong')

**Propsy:**

```typescript
interface RegisterFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  isLoading: boolean
  error: string | null
}
```

**Implementacja z React Hook Form + Zod:**

```typescript
// lib/validation/auth.ts
export const registerSchema = z
  .object({
    email: z
      .string()
      .email('Nieprawidłowy format email')
      .min(1, 'Email jest wymagany'),
    password: z
      .string()
      .min(8, 'Hasło musi mieć co najmniej 8 znaków')
      .regex(/[A-Z]/, 'Hasło musi zawierać co najmniej 1 wielką literę')
      .regex(/[a-z]/, 'Hasło musi zawierać co najmniej 1 małą literę')
      .regex(/[0-9]/, 'Hasło musi zawierać co najmniej 1 cyfrę'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła muszą być identyczne',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
```

---

### PasswordStrengthIndicator (Client Component)

**Opis:** Wizualizacja siły hasła i wymagań bezpieczeństwa.

**Główne elementy:**

- Progress bar (0-100%) z kolorowaniem:
  - 0-33%: red (słabe)
  - 34-66%: yellow (średnie)
  - 67-100%: green (silne)
- Lista wymagań (checkmarki):
  - ✅/❌ "Co najmniej 8 znaków"
  - ✅/❌ "Co najmniej 1 wielka litera"
  - ✅/❌ "Co najmniej 1 mała litera"
  - ✅/❌ "Co najmniej 1 cyfra"

**Obsługiwane interakcje:** Brak (tylko prezentacja)

**Obsługiwana walidacja:**

- Obliczanie siły hasła (0-100%) na podstawie spełnionych wymagań
- Dynamiczne aktualizowanie checkmarków

**Typy:**

- `PasswordStrength` ('weak' | 'medium' | 'strong')
- `PasswordRequirements` (ViewModel)

**Propsy:**

```typescript
interface PasswordStrengthIndicatorProps {
  password: string
}
```

**Implementacja pomocnicza:**

```typescript
// utils/password-strength.ts
export interface PasswordRequirements {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
}

export function calculatePasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong'
  score: number // 0-100
  requirements: PasswordRequirements
} {
  const requirements: PasswordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }

  const metRequirements = Object.values(requirements).filter(Boolean).length
  const score = (metRequirements / 4) * 100

  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (score >= 67) strength = 'strong'
  else if (score >= 34) strength = 'medium'

  return { strength, score, requirements }
}
```

---

### SocialAuthButton (Client Component)

**Opis:** Przycisk logowania/rejestracji przez Google OAuth.

**Główne elementy:**

- `<Button>` z ikoną Google
  - Tekst: "Kontynuuj z Google"
  - variant="outline"
  - fullWidth
- Loading state (spinner) podczas OAuth flow

**Obsługiwane interakcje:**

- onClick → wywołanie `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Redirect do Google → callback → redirect do aplikacji

**Obsługiwana walidacja:**

- Obsługa błędów OAuth (popup blocked, cancel, etc.)

**Typy:**

- Brak specjalnych typów (primitive props)

**Propsy:**

```typescript
interface SocialAuthButtonProps {
  onLogin: () => Promise<void>
  isLoading: boolean
}
```

**Implementacja:**

```typescript
// W AuthClient
const handleGoogleLogin = async () => {
  setIsLoading(true)
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo || '/'}`,
      },
    })
    if (error) throw error
  } catch (err) {
    setError(err.message)
    toast({
      title: 'Błąd logowania',
      description: 'Nie udało się zalogować przez Google. Spróbuj ponownie.',
      variant: 'destructive',
    })
  } finally {
    setIsLoading(false)
  }
}
```

---

### ForgotPasswordPage (Server Component)

**Ścieżka:** `/auth/forgot-password`

**Opis:** Strona z formularzem resetowania hasła (wysyłka email z linkiem).

**Główne elementy:**

- Heading h1: "Resetowanie hasła"
- `<p>` opis: "Podaj swój email, a wyślemy Ci link do zresetowania hasła"
- `<ForgotPasswordForm>` (Client Component)
  - Input email
  - Button "Wyślij link"
- Link "Powrót do logowania" → `/auth`

---

### ForgotPasswordForm (Client Component)

**Opis:** Formularz resetowania hasła.

**Główne elementy:**

- `<Input>` email
- `<Button type="submit">` "Wyślij link"
- Success message: "Link został wysłany na Twój email" (po submit)

**Obsługiwane interakcje:**

- onSubmit → `supabase.auth.resetPasswordForEmail(email)`

**Obsługiwana walidacja:**

- Email: format email, required

**Typy:**

- `ForgotPasswordFormData`

**Propsy:**

```typescript
interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>
  isLoading: boolean
  success: boolean
  error: string | null
}
```

---

### ResetPasswordPage (Server Component)

**Ścieżka:** `/auth/reset-password`

**Opis:** Strona z formularzem ustawienia nowego hasła (po kliknięciu link z email).

**Główne elementy:**

- Heading h1: "Ustaw nowe hasło"
- `<ResetPasswordForm>` (Client Component)
  - Input password
  - Input confirmPassword
  - PasswordStrengthIndicator
  - Button "Zmień hasło"

**Parametry URL:**

- `token` (z email link) - automatycznie obsługiwany przez Supabase

---

### ResetPasswordForm (Client Component)

**Opis:** Formularz ustawienia nowego hasła.

**Główne elementy:**

- `<Input>` password (type="password")
- `<Input>` confirmPassword (type="password")
- `<PasswordStrengthIndicator>`
- `<Button type="submit">` "Zmień hasło"

**Obsługiwane interakcje:**

- onSubmit → `supabase.auth.updateUser({ password: newPassword })`

**Obsługiwana walidacja:**

- Password: min 8 znaków, uppercase, lowercase, number
- Confirm Password: musi być identyczne

**Typy:**

- `ResetPasswordFormData`

**Propsy:**

```typescript
interface ResetPasswordFormProps {
  onSubmit: (password: string) => Promise<void>
  isLoading: boolean
  error: string | null
}
```

---

## 5. Typy

### Nowe typy ViewModels (do utworzenia):

```typescript
// src/types/auth-view.types.ts

/**
 * Tryb formularza uwierzytelniania
 */
export type AuthMode = 'login' | 'register'

/**
 * Dane formularza logowania
 */
export interface LoginFormData {
  email: string
  password: string
}

/**
 * Dane formularza rejestracji
 */
export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
}

/**
 * Dane formularza resetowania hasła (wysyłka email)
 */
export interface ForgotPasswordFormData {
  email: string
}

/**
 * Dane formularza ustawienia nowego hasła
 */
export interface ResetPasswordFormData {
  password: string
  confirmPassword: string
}

/**
 * Błędy formularza (generyczne)
 */
export interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

/**
 * Siła hasła (dla PasswordStrengthIndicator)
 */
export type PasswordStrength = 'weak' | 'medium' | 'strong'

/**
 * Wymagania hasła (checklist)
 */
export interface PasswordRequirements {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
}

/**
 * Wynik obliczenia siły hasła
 */
export interface PasswordStrengthResult {
  strength: PasswordStrength
  score: number // 0-100
  requirements: PasswordRequirements
}

/**
 * Stan hooka useAuth
 */
export interface UseAuthReturn {
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}
```

### Mapowanie błędów Supabase na komunikaty PL:

```typescript
// utils/auth-errors.ts

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Nieprawidłowy email lub hasło',
  'Email not confirmed':
    'Email nie został potwierdzony. Sprawdź swoją skrzynkę.',
  'User already registered': 'Użytkownik z tym emailem już istnieje',
  'Password should be at least 6 characters':
    'Hasło musi mieć co najmniej 6 znaków',
  'Email rate limit exceeded': 'Zbyt wiele prób. Spróbuj ponownie później.',
  'User not found': 'Użytkownik nie został znaleziony',
  'Invalid email': 'Nieprawidłowy format email',
  // Dodaj więcej według potrzeb
}

export function translateAuthError(error: string): string {
  return (
    AUTH_ERROR_MESSAGES[error] ||
    'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.'
  )
}
```

---

## 6. Zarządzanie stanem

### Custom hook: useAuth

**Lokalizacja:** `hooks/useAuth.ts`

```typescript
'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { toast } from '@/hooks/use-toast'
import { translateAuthError } from '@/lib/utils/auth-errors'

export const useAuth = (redirectTo?: string) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Login z email/hasło
  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error: authError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          })

        if (authError) throw authError

        // Sprawdź czy profil istnieje
        const { data: profile } = await supabase
          .from('profiles')
          .select('disclaimer_accepted_at')
          .eq('id', data.user.id)
          .single()

        // Przekieruj odpowiednio
        if (!profile?.disclaimer_accepted_at) {
          router.push('/onboarding')
        } else {
          router.push(redirectTo || '/')
        }

        toast({
          title: 'Zalogowano pomyślnie',
          description: 'Witaj ponownie!',
        })
      } catch (err: any) {
        const errorMessage = translateAuthError(err.message)
        setError(errorMessage)
        toast({
          title: 'Błąd logowania',
          description: errorMessage,
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, router, redirectTo]
  )

  // Rejestracja z email/hasło
  const register = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (authError) throw authError

        // Supabase może automatycznie zalogować po rejestracji
        if (data.user && data.session) {
          // Przekieruj do onboardingu
          router.push('/onboarding')
          toast({
            title: 'Konto utworzone',
            description: 'Witaj w LowCarbPlaner!',
          })
        } else {
          // Wymaga potwierdzenia email
          toast({
            title: 'Sprawdź swoją skrzynkę',
            description: 'Wysłaliśmy link aktywacyjny na Twój email.',
          })
        }
      } catch (err: any) {
        const errorMessage = translateAuthError(err.message)
        setError(errorMessage)
        toast({
          title: 'Błąd rejestracji',
          description: errorMessage,
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, router]
  )

  // Login z Google
  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo || '/'}`,
        },
      })

      if (authError) throw authError
      // Redirect automatyczny przez Supabase
    } catch (err: any) {
      const errorMessage = translateAuthError(err.message)
      setError(errorMessage)
      toast({
        title: 'Błąd logowania',
        description: errorMessage,
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }, [supabase, redirectTo])

  // Reset hasła (wysyłka email)
  const resetPassword = useCallback(
    async (email: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          }
        )

        if (authError) throw authError

        toast({
          title: 'Email wysłany',
          description:
            'Sprawdź swoją skrzynkę i kliknij w link resetujący hasło.',
        })
      } catch (err: any) {
        const errorMessage = translateAuthError(err.message)
        setError(errorMessage)
        toast({
          title: 'Błąd',
          description: errorMessage,
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [supabase]
  )

  // Aktualizacja hasła (po kliknięciu link z email)
  const updatePassword = useCallback(
    async (password: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const { error: authError } = await supabase.auth.updateUser({
          password,
        })

        if (authError) throw authError

        toast({
          title: 'Hasło zmienione',
          description: 'Możesz teraz zalogować się nowym hasłem.',
        })

        router.push('/auth?tab=login')
      } catch (err: any) {
        const errorMessage = translateAuthError(err.message)
        setError(errorMessage)
        toast({
          title: 'Błąd',
          description: errorMessage,
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [supabase, router]
  )

  return {
    isLoading,
    error,
    login,
    register,
    loginWithGoogle,
    resetPassword,
    updatePassword,
  }
}
```

### Zustand Store (NIE wymagany)

Widok uwierzytelniania NIE wymaga globalnego stanu (Zustand), ponieważ:

- Stan formularzy jest lokalny (React Hook Form)
- Stan autentykacji zarządzany przez Supabase Auth
- Brak współdzielenia stanu między komponentami

---

## 7. Integracja API

### Supabase Auth API

Wszystkie operacje uwierzytelniania wykorzystują **Supabase Auth** (nie custom Server Actions).

#### Login z email/hasło

**Metoda:** `supabase.auth.signInWithPassword({ email, password })`

**Typ żądania:**

```typescript
{
  email: string
  password: string
}
```

**Typ odpowiedzi:**

```typescript
{
  data: {
    user: User | null
    session: Session | null
  }
  error: AuthError | null
}
```

**Kody błędów:**

- `Invalid login credentials` - Nieprawidłowy email lub hasło
- `Email not confirmed` - Email nie potwierdzony
- `User not found` - Użytkownik nie istnieje

---

#### Rejestracja z email/hasło

**Metoda:** `supabase.auth.signUp({ email, password })`

**Typ żądania:**

```typescript
{
  email: string
  password: string
  options?: {
    emailRedirectTo?: string
  }
}
```

**Typ odpowiedzi:**

```typescript
{
  data: {
    user: User | null
    session: Session | null
  }
  error: AuthError | null
}
```

**Kody błędów:**

- `User already registered` - Email już zarejestrowany
- `Password should be at least 6 characters` - Hasło za krótkie
- `Email rate limit exceeded` - Zbyt wiele prób

**Uwaga:** W zależności od konfiguracji Supabase, rejestracja może wymagać potwierdzenia email (link aktywacyjny) lub automatycznie zalogować użytkownika.

---

#### Login z Google OAuth

**Metoda:** `supabase.auth.signInWithOAuth({ provider: 'google' })`

**Typ żądania:**

```typescript
{
  provider: 'google'
  options?: {
    redirectTo?: string
  }
}
```

**Flow:**

1. Wywołanie `signInWithOAuth` → redirect do Google
2. Użytkownik autoryzuje w Google
3. Redirect do `/auth/callback` (obsługiwany przez Supabase)
4. Automatyczne przekierowanie do `redirectTo` (z parametru)

**Obsługa callback:**

```typescript
// app/(public)/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/'

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Sprawdź czy profil istnieje
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('disclaimer_accepted_at')
      .eq('id', session.user.id)
      .single()

    if (!profile?.disclaimer_accepted_at) {
      return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL(redirect, requestUrl.origin))
}
```

---

#### Reset hasła (wysyłka email)

**Metoda:** `supabase.auth.resetPasswordForEmail(email, { redirectTo })`

**Typ żądania:**

```typescript
{
  email: string
  redirectTo: string // URL do przekierowania po kliknięciu link
}
```

**Typ odpowiedzi:**

```typescript
{
  error: AuthError | null
}
```

---

#### Aktualizacja hasła

**Metoda:** `supabase.auth.updateUser({ password })`

**Typ żądania:**

```typescript
{
  password: string
}
```

**Typ odpowiedzi:**

```typescript
{
  data: {
    user: User | null
  }
  error: AuthError | null
}
```

**Uwaga:** Wymaga, aby użytkownik był zalogowany (sesja z token z email reset link).

---

## 8. Interakcje użytkownika

### Interakcja 1: Przełączanie między logowaniem a rejestracją

**Trigger:** Kliknięcie tab "Logowanie" / "Rejestracja"

**Flow:**

1. Użytkownik klika tab "Rejestracja"
2. System:
   - Aktualizuje URL param `?tab=register`
   - Renderuje `<RegisterForm>` zamiast `<LoginForm>`
   - Zachowuje dane formularzy (jeśli były wypełnione)
3. Użytkownik widzi formularz rejestracji

**Keyboard support:**

- Tab → nawigacja między tabami
- Arrow Left/Right → przełączanie tabów

---

### Interakcja 2: Logowanie z email/hasło

**Trigger:** Submit `LoginForm`

**Flow:**

1. Użytkownik wypełnia email i hasło
2. Klika "Zaloguj się"
3. System:
   - Walidacja formularza (client-side)
   - Jeśli błąd → inline error messages, focus na błędnym polu
   - Jeśli OK → wywołanie `supabase.auth.signInWithPassword`
   - Loading state: przycisk disabled, spinner
4. Sukces:
   - Sprawdzenie czy profil istnieje
   - Jeśli nie → redirect na `/onboarding`
   - Jeśli tak → redirect na `/` (lub `redirect` param)
   - Toast: "Zalogowano pomyślnie"
5. Błąd:
   - Wyświetlenie błędu (inline lub toast)
   - Focus na input email

---

### Interakcja 3: Rejestracja z email/hasło

**Trigger:** Submit `RegisterForm`

**Flow:**

1. Użytkownik wypełnia email, hasło i potwierdzenie hasła
2. `PasswordStrengthIndicator` pokazuje siłę hasła w czasie rzeczywistym
3. Klika "Załóż konto"
4. System:
   - Walidacja formularza (client-side)
   - Sprawdzenie czy password === confirmPassword
   - Jeśli błąd → inline errors
   - Jeśli OK → wywołanie `supabase.auth.signUp`
   - Loading state
5. Sukces (z auto-login):
   - Redirect na `/onboarding`
   - Toast: "Konto utworzone"
6. Sukces (z email confirmation):
   - Toast: "Sprawdź swoją skrzynkę. Wysłaliśmy link aktywacyjny."
   - Pozostanie na stronie logowania
7. Błąd:
   - Wyświetlenie błędu (np. "Email już zarejestrowany")

---

### Interakcja 4: Logowanie przez Google

**Trigger:** Kliknięcie "Kontynuuj z Google"

**Flow:**

1. Użytkownik klika przycisk Google
2. System:
   - Wywołanie `supabase.auth.signInWithOAuth({ provider: 'google' })`
   - Redirect do Google OAuth
3. Użytkownik autoryzuje w Google
4. Redirect do `/auth/callback`
5. System:
   - Exchange code for session
   - Sprawdzenie czy profil istnieje
   - Jeśli nie → redirect na `/onboarding`
   - Jeśli tak → redirect na `/` (lub `redirect` param)

**Obsługa błędów:**

- Popup blocked → toast z instrukcją
- User cancelled → powrót na `/auth` bez błędu
- OAuth error → toast z komunikatem

---

### Interakcja 5: Resetowanie hasła (wysyłka email)

**Trigger:** Kliknięcie "Zapomniałem hasła" → submit `ForgotPasswordForm`

**Flow:**

1. Użytkownik klika "Zapomniałem hasła" w `LoginForm`
2. Redirect na `/auth/forgot-password`
3. Użytkownik wpisuje email
4. Klika "Wyślij link"
5. System:
   - Walidacja email
   - Wywołanie `supabase.auth.resetPasswordForEmail`
   - Loading state
6. Sukces:
   - Toast: "Email wysłany. Sprawdź swoją skrzynkę."
   - Success message na stronie
7. Błąd:
   - Toast z komunikatem błędu

---

### Interakcja 6: Ustawienie nowego hasła

**Trigger:** Kliknięcie link z email → submit `ResetPasswordForm`

**Flow:**

1. Użytkownik klika link w email
2. Redirect na `/auth/reset-password?token=...`
3. System automatycznie wymienia token na sesję (Supabase)
4. Użytkownik wpisuje nowe hasło i potwierdzenie
5. `PasswordStrengthIndicator` pokazuje wymagania
6. Klika "Zmień hasło"
7. System:
   - Walidacja formularza
   - Wywołanie `supabase.auth.updateUser({ password })`
   - Loading state
8. Sukces:
   - Toast: "Hasło zmienione"
   - Redirect na `/auth?tab=login`
9. Błąd:
   - Toast z komunikatem

---

### Interakcja 7: Show/hide password

**Trigger:** Kliknięcie ikony "eye" przy input hasła

**Flow:**

1. Użytkownik klika ikonę
2. System:
   - Toggle `type` input: "password" ↔ "text"
   - Zmiana ikony: eye ↔ eye-off
3. Hasło jest widoczne/ukryte

---

## 9. Warunki i walidacja

### Frontend validation (React Hook Form + Zod):

#### LoginForm:

- **Email:**
  - Format email (regex)
  - Required
  - Błędy inline: "Nieprawidłowy format email", "Email jest wymagany"
- **Password:**
  - Required
  - Min 6 znaków (zgodnie z Supabase default)
  - Błędy inline: "Hasło jest wymagane", "Hasło musi mieć co najmniej 6 znaków"

#### RegisterForm:

- **Email:**
  - Format email
  - Required
  - Błędy inline: "Nieprawidłowy format email", "Email jest wymagany"
- **Password:**
  - Min 8 znaków
  - Co najmniej 1 wielka litera
  - Co najmniej 1 mała litera
  - Co najmniej 1 cyfra
  - Błędy inline: "Hasło musi mieć co najmniej 8 znaków", etc.
- **Confirm Password:**
  - Musi być identyczne z password
  - Błąd inline: "Hasła muszą być identyczne"

#### ForgotPasswordForm:

- **Email:**
  - Format email
  - Required

#### ResetPasswordForm:

- **Password:**
  - Min 8 znaków
  - Uppercase, lowercase, number
- **Confirm Password:**
  - Musi być identyczne

### Backend validation (Supabase Auth):

Supabase automatycznie waliduje:

- Format email
- Długość hasła (min 6 znaków default)
- Unikalność email (sprawdza czy nie istnieje)

Nie ma custom Server Actions dla uwierzytelniania - wszystko przez Supabase Auth API.

---

## 10. Obsługa błędów

### Scenariusz 1: Błąd walidacji formularza (client-side)

**Przyczyna:** Użytkownik próbuje submit z błędnymi danymi

**Obsługa:**

- React Hook Form automatycznie wyświetla błędy inline
- Focus na pierwszym błędnym polu
- Przycisk submit disabled gdy formularz invalid

---

### Scenariusz 2: Błąd logowania - nieprawidłowe dane

**Przyczyna:** Nieprawidłowy email lub hasło

**Obsługa:**

```typescript
// Supabase zwraca: { error: { message: 'Invalid login credentials' } }
const errorMessage = translateAuthError(error.message)
// "Nieprawidłowy email lub hasło"

toast({
  title: 'Błąd logowania',
  description: errorMessage,
  variant: 'destructive',
})
```

---

### Scenariusz 3: Błąd rejestracji - email już istnieje

**Przyczyna:** Email już zarejestrowany

**Obsługa:**

```typescript
// Supabase zwraca: { error: { message: 'User already registered' } }
const errorMessage = translateAuthError(error.message)
// "Użytkownik z tym emailem już istnieje"

toast({
  title: 'Błąd rejestracji',
  description: errorMessage,
  variant: 'destructive',
})

// Opcjonalnie: pokaż link "Zaloguj się" lub przełącz na tab login
```

---

### Scenariusz 4: Błąd OAuth - popup blocked

**Przyczyna:** Przeglądarka zablokował popup Google

**Obsługa:**

```typescript
try {
  await supabase.auth.signInWithOAuth({ provider: 'google' })
} catch (err) {
  if (err.message.includes('popup')) {
    toast({
      title: 'Popup zablokowany',
      description:
        'Twoja przeglądarka zablokowała okno logowania. Sprawdź ustawienia blokady popup.',
      variant: 'destructive',
    })
  }
}
```

---

### Scenariusz 5: Błąd sieci (Network Error)

**Przyczyna:** Brak połączenia internetowego

**Obsługa:**

```typescript
try {
  await supabase.auth.signInWithPassword({ email, password })
} catch (err) {
  if (err.message.includes('fetch') || err.message.includes('network')) {
    toast({
      title: 'Brak połączenia',
      description: 'Sprawdź połączenie internetowe i spróbuj ponownie.',
      variant: 'destructive',
    })
  }
}
```

---

### Scenariusz 6: Email nie potwierdzony

**Przyczyna:** Użytkownik nie kliknął link aktywacyjny

**Obsługa:**

```typescript
// Supabase zwraca: { error: { message: 'Email not confirmed' } }
const errorMessage = translateAuthError(error.message)
// "Email nie został potwierdzony. Sprawdź swoją skrzynkę."

toast({
  title: 'Email nie potwierdzony',
  description: errorMessage,
  variant: 'destructive',
})

// Opcjonalnie: przycisk "Wyślij ponownie link aktywacyjny"
```

---

### Scenariusz 7: Rate limit exceeded

**Przyczyna:** Zbyt wiele prób logowania/rejestracji

**Obsługa:**

```typescript
// Supabase zwraca: { error: { message: 'Email rate limit exceeded' } }
const errorMessage = translateAuthError(error.message)
// "Zbyt wiele prób. Spróbuj ponownie później."

toast({
  title: 'Zbyt wiele prób',
  description: errorMessage,
  variant: 'destructive',
})

// Opcjonalnie: disable form na X sekund
```

---

## 11. Kroki implementacji

### Krok 1: Struktura projektu i typy (2h)

1.1. Utwórz strukturę katalogów:

```bash
mkdir -p app/(public)/auth
mkdir -p app/(public)/auth/callback
mkdir -p app/(public)/auth/forgot-password
mkdir -p app/(public)/auth/reset-password
mkdir -p components/auth
mkdir -p lib/utils
mkdir -p hooks
```

1.2. Utwórz plik typów:

```bash
touch src/types/auth-view.types.ts
```

1.3. Dodaj typy ViewModels zgodnie z sekcją 5:

- `AuthMode`
- `LoginFormData`
- `RegisterFormData`
- `ForgotPasswordFormData`
- `ResetPasswordFormData`
- `FormErrors`
- `PasswordStrength`
- `PasswordRequirements`
- `PasswordStrengthResult`
- `UseAuthReturn`

  1.4. Zainstaluj brakujące komponenty shadcn/ui:

```bash
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add input
npx shadcn-ui@latest add button
npx shadcn-ui@latest add label
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add progress
```

---

### Krok 2: Validation schemas (Zod) (2h)

2.1. Utwórz plik:

```bash
touch src/lib/validation/auth.ts
```

2.2. Implementuj schematy:

- `loginSchema` (email, password)
- `registerSchema` (email, password, confirmPassword + refine)
- `forgotPasswordSchema` (email)
- `resetPasswordSchema` (password, confirmPassword + refine)

  2.3. Export typów:

```typescript
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
// etc.
```

---

### Krok 3: Pomocnicze funkcje (2h)

3.1. Utwórz pliki:

```bash
touch src/lib/utils/auth-errors.ts
touch src/lib/utils/password-strength.ts
```

3.2. Implementuj `auth-errors.ts`:

- `AUTH_ERROR_MESSAGES` mapping
- `translateAuthError(error: string)` function

  3.3. Implementuj `password-strength.ts`:

- `calculatePasswordStrength(password: string)` function
- Logika obliczania siły (weak/medium/strong)
- Sprawdzanie wymagań (minLength, hasUppercase, etc.)

  3.4. Testy jednostkowe:

```bash
touch src/lib/utils/__tests__/password-strength.test.ts
```

Test cases:

- Różne kombinacje znaków
- Edge cases (empty, very long)
- Wszystkie wymagania spełnione

---

### Krok 4: Custom hook useAuth (3h)

4.1. Utwórz plik:

```bash
touch src/hooks/useAuth.ts
```

4.2. Implementuj hook zgodnie z sekcją 6:

- Stan: `isLoading`, `error`
- Metody:
  - `login(email, password)`
  - `register(email, password)`
  - `loginWithGoogle()`
  - `resetPassword(email)`
  - `updatePassword(password)`
- Integracja z Supabase Auth
- Sprawdzanie profilu po loginie
- Przekierowania (onboarding vs dashboard)

  4.3. Testy jednostkowe:

```bash
touch src/hooks/__tests__/useAuth.test.ts
```

Test cases:

- Mock Supabase client
- Sukces/błąd każdej metody
- Przekierowania

---

### Krok 5: Komponenty UI (6h)

5.1. **PasswordStrengthIndicator** (1h)

```bash
touch src/components/auth/PasswordStrengthIndicator.tsx
```

- Progress bar z kolorowaniem
- Lista wymagań z checkmarkami
- Użyj `calculatePasswordStrength` helper

  5.2. **SocialAuthButton** (1h)

```bash
touch src/components/auth/SocialAuthButton.tsx
```

- Button z ikoną Google
- Loading state
- onClick → `loginWithGoogle()`

  5.3. **LoginForm** (2h)

```bash
touch src/components/auth/LoginForm.tsx
```

- React Hook Form + Zod
- Input email, password (z show/hide)
- Link "Zapomniałem hasła"
- Submit button (loading state)
- Inline error messages

  5.4. **RegisterForm** (2h)

```bash
touch src/components/auth/RegisterForm.tsx
```

- React Hook Form + Zod
- Input email, password, confirmPassword
- PasswordStrengthIndicator integration
- Submit button (loading state)
- Inline error messages

---

### Krok 6: Główny komponent kliencki (2h)

6.1. Utwórz:

```bash
touch src/components/auth/AuthClient.tsx
```

6.2. Implementacja:

- Oznacz jako `'use client'`
- Użyj `useAuth` hook
- Tabs z shadcn/ui (defaultValue z URL param)
- Conditional rendering: LoginForm / RegisterForm
- Separator + SocialAuthButton
- Obsługa zmian tab → update URL

---

### Krok 7: Server Components (Pages) (3h)

7.1. **AuthPage** (`/auth`)

```bash
touch app/(public)/auth/page.tsx
```

- Sprawdzenie sesji (redirect jeśli zalogowany)
- Renderowanie `<AuthClient>`
- Metadata (title, description)

  7.2. **Auth Callback** (`/auth/callback`)

```bash
touch app/(public)/auth/callback/route.ts
```

- Route Handler (GET)
- Exchange code for session
- Sprawdzenie profilu
- Redirect na onboarding/dashboard

  7.3. **ForgotPasswordPage** (`/auth/forgot-password`)

```bash
touch app/(public)/auth/forgot-password/page.tsx
```

- Renderowanie `<ForgotPasswordForm>`

  7.4. **ForgotPasswordForm** (Client Component)

```bash
touch src/components/auth/ForgotPasswordForm.tsx
```

- Input email
- Submit → `resetPassword(email)`
- Success state

  7.5. **ResetPasswordPage** (`/auth/reset-password`)

```bash
touch app/(public)/auth/reset-password/page.tsx
```

- Renderowanie `<ResetPasswordForm>`

  7.6. **ResetPasswordForm** (Client Component)

```bash
touch src/components/auth/ResetPasswordForm.tsx
```

- Input password, confirmPassword
- PasswordStrengthIndicator
- Submit → `updatePassword(password)`

---

### Krok 8: Middleware i routing (2h)

8.1. Zaktualizuj middleware:

```bash
touch middleware.ts
```

8.2. Dodaj logikę:

- Sprawdzenie czy użytkownik NIE jest zalogowany dla `/auth`
- Jeśli zalogowany → redirect na `/` lub `/onboarding`
- Publiczny dostęp do `/auth/*` bez sesji

  8.3. Zweryfikuj strukturę routingu:

```
app/
├── (public)/
│   └── auth/
│       ├── page.tsx (AuthPage)
│       ├── callback/
│       │   └── route.ts
│       ├── forgot-password/
│       │   └── page.tsx
│       └── reset-password/
│           └── page.tsx
├── (authenticated)/
│   └── page.tsx (Dashboard)
└── layout.tsx
```

---

### Krok 9: Styling i responsywność (2h)

9.1. Tailwind CSS:

- Mobile-first approach
- Container max-width: 400px dla formularzy
- Centrowan ie vertical/horizontal
- Consistent spacing

  9.2. Show/hide password:

- Ikona eye/eye-off (lucide-react)
- Toggle type input

  9.3. Loading states:

- Spinner w przyciskach
- Disabled state podczas submit

---

### Krok 10: Accessibility (2h)

10.1. Semantyczne HTML:

- `<form>` wrapper
- `<label htmlFor>` dla każdego input
- `<fieldset>` dla grup (opcjonalnie)

  10.2. ARIA attributes:

- `aria-label` dla show/hide password button
- `aria-live="polite"` dla error messages
- `aria-required="true"` dla wymaganych pól
- `aria-invalid="true"` przy błędach

  10.3. Keyboard navigation:

- Tab order logiczny
- Enter → submit form
- Focus visible states

  10.4. Screen reader testing:

- Test z NVDA/JAWS
- Announce błędów

---

### Krok 11: Testowanie (4h)

11.1. **Unit testy (Vitest)** (1h):

- `password-strength.ts` (wszystkie combinacje)
- `auth-errors.ts` (mapowanie błędów)

  11.2. **Component testy (React Testing Library)** (2h):

- `LoginForm` (submit, walidacja)
- `RegisterForm` (submit, walidacja, password match)
- `PasswordStrengthIndicator` (różne hasła)
- `SocialAuthButton` (onClick)

  11.3. **E2E testy (Playwright)** (1h):

```typescript
test('Login flow', async ({ page }) => {
  await page.goto('/auth')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('text=Zaloguj się')
  await page.waitForURL('/')
})

test('Register flow', async ({ page }) => {
  await page.goto('/auth?tab=register')
  await page.fill('input[name="email"]', 'new@example.com')
  await page.fill('input[name="password"]', 'Password123')
  await page.fill('input[name="confirmPassword"]', 'Password123')
  await page.click('text=Załóż konto')
  await page.waitForURL('/onboarding')
})
```

---

### Krok 12: Konfiguracja Supabase (1h)

12.1. Dashboard Supabase:

- Włącz Email provider
- Konfiguruj Email templates (dla reset password)
- Włącz Google OAuth provider:
  - Google Cloud Console: utwórz OAuth client
  - Dodaj redirect URI: `https://[project-id].supabase.co/auth/v1/callback`
  - Skopiuj Client ID i Client Secret do Supabase

  12.2. Environment variables:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

---

### Krok 13: Optymalizacja i finalizacja (1h)

13.1. Performance:

- Bundle analysis
- Code splitting (jeśli potrzebne)

  13.2. Error boundaries:

```bash
touch app/(public)/auth/error.tsx
```

13.3. Loading states:

```bash
touch app/(public)/auth/loading.tsx
```

13.4. Code review checklist:

- TypeScript strict mode
- ESLint pass
- Prettier pass
- Brak console.log

---

### Krok 14: Dokumentacja (1h)

14.1. JSDoc comments:

- Dla wszystkich hooków
- Dla wszystkich public API

  14.2. README update:

- Dodanie informacji o uwierzytelnianiu
- Instrukcje konfiguracji Google OAuth

---

## Podsumowanie czasowe

- **Krok 1 (Setup + Typy):** 2h
- **Krok 2 (Validation schemas):** 2h
- **Krok 3 (Helper functions):** 2h
- **Krok 4 (Hook):** 3h
- **Krok 5 (Komponenty UI):** 6h
- **Krok 6 (Client Component):** 2h
- **Krok 7 (Server Components):** 3h
- **Krok 8 (Middleware):** 2h
- **Krok 9 (Styling):** 2h
- **Krok 10 (Accessibility):** 2h
- **Krok 11 (Testowanie):** 4h
- **Krok 12 (Supabase config):** 1h
- **Krok 13 (Optymalizacja):** 1h
- **Krok 14 (Dokumentacja):** 1h

**Łączny szacowany czas:** **33 godziny pracy** (4-5 dni dla jednego programisty frontend)

---

## Checklist implementacji

### Must-have (MVP):

- [ ] Formularz logowania (email + hasło)
- [ ] Formularz rejestracji (email + hasło + confirm)
- [ ] Walidacja w czasie rzeczywistym (blur/change)
- [ ] Walidacja siły hasła z wizualizacją wymagań
- [ ] Show/hide password (eye icon)
- [ ] Logowanie/rejestracja przez Google OAuth
- [ ] Link "Zapomniałem hasła" → formularz reset
- [ ] Formularz resetowania hasła (email)
- [ ] Formularz ustawienia nowego hasła (z email link)
- [ ] Przekierowanie po zalogowaniu (onboarding vs dashboard)
- [ ] Obsługa błędów API (nieprawidłowe dane, email exists, etc.)
- [ ] Loading states (spinner w przyciskach)
- [ ] Responsywność (mobile + desktop)
- [ ] Keyboard navigation (Tab, Enter)
- [ ] Accessibility (ARIA labels, semantic HTML)
- [ ] Komunikacja przez HTTPS (wymuszone)

### Nice-to-have (post-MVP):

- [ ] Remember me (checkbox, localStorage)
- [ ] Biometric login (WebAuthn)
- [ ] Multi-language support (i18n)
- [ ] Social auth: Facebook, Apple
- [ ] Captcha (rate limiting)
- [ ] Two-factor authentication (2FA)
- [ ] Magic link login (passwordless)
- [ ] Password strength meter z score (zxcvbn)
- [ ] Auto-fill suggestions (browser autocomplete)
- [ ] Dark mode support
- [ ] Analytics tracking (login/register events)

---

## Dodatkowe uwagi

1. **Supabase Auth:** Wszystkie operacje uwierzytelniania przez Supabase Auth API, nie ma custom Server Actions.

2. **Email confirmation:** W zależności od konfiguracji Supabase, rejestracja może wymagać potwierdzenia email (link aktywacyjny) lub automatycznie zalogować użytkownika. Dostosuj UX odpowiednio.

3. **Google OAuth setup:** Wymaga konfiguracji w Google Cloud Console (OAuth client) i Supabase Dashboard (provider settings).

4. **Walidacja hasła:** Client-side validation (min 8 znaków, uppercase, etc.) powinna być zgodna z wymaganiami Supabase Auth (domyślnie min 6 znaków, można zmienić).

5. **Przekierowania:** Po zalogowaniu, sprawdź czy profil istnieje. Jeśli nie → `/onboarding`, jeśli tak → `/` (lub `redirect` param z URL).

6. **HTTPS:** Komunikacja z Supabase Auth wymaga HTTPS. Upewnij się, że aplikacja działa na HTTPS w produkcji (Cloudflare Pages automatycznie wymusza).

7. **Rate limiting:** Supabase Auth ma wbudowane rate limiting dla prób logowania/rejestracji. Obsłuż błąd `Email rate limit exceeded`.

8. **Accessibility priority:** Widok uwierzytelniania to kluczowy flow, więc accessibility jest must-have.

---

**Koniec planu implementacji.**
