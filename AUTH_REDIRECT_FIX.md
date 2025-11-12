# Fix: Google OAuth przekierowuje na localhost zamiast Vercel

## Problem

Po zalogowaniu przez Google na produkcji (Vercel) aplikacja przekierowuje na `localhost` zamiast na domenę produkcyjną.

## Przyczyna

Błędna konfiguracja URL-i przekierowań w Google OAuth i/lub Supabase.

## Rozwiązanie

### 1. Konfiguracja Supabase Dashboard

**Supabase Dashboard → Authentication → URL Configuration**

Upewnij się, że masz poprawnie ustawione:

```
Site URL: https://twoja-domena.vercel.app
Redirect URLs:
  - https://twoja-domena.vercel.app/auth/callback
  - http://localhost:3000/auth/callback (opcjonalnie dla dev)
```

### 2. Konfiguracja Google Cloud Console

**Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client**

W "Authorized redirect URIs" dodaj:

```
https://pkjdgaqwdletfkvniljx.supabase.co/auth/v1/callback
https://twoja-domena.vercel.app/auth/callback
```

⚠️ **WAŻNE**: Pierwsza URL to callback Supabase (tam Google przekierowuje najpierw), druga to twoja aplikacja.

### 3. Zmienne środowiskowe w Vercel

**Vercel Dashboard → Settings → Environment Variables**

Upewnij się, że są ustawione dla **Production**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://pkjdgaqwdletfkvniljx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<twój-klucz>
DISABLE_AUTH=false
```

### 4. Deploy i test

Po zmianie konfiguracji:

```bash
# Redeploy na Vercel
git add .
git commit -m "fix: update OAuth redirect URLs"
git push

# Lub w Vercel Dashboard kliknij "Redeploy"
```

### 5. Weryfikacja

1. Otwórz produkcyjną stronę: `https://twoja-domena.vercel.app/auth`
2. Kliknij "Zaloguj przez Google"
3. Zaloguj się w Google
4. **Powinno przekierować na**: `https://twoja-domena.vercel.app/` lub `/onboarding`

## Sprawdzenie konfiguracji

### Supabase Dashboard

```
1. Idź do: https://supabase.com/dashboard/project/pkjdgaqwdletfkvniljx
2. Authentication → URL Configuration
3. Sprawdź "Site URL" i "Redirect URLs"
```

### Google Cloud Console

```
1. Idź do: https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Znajdź swojego OAuth 2.0 Client
4. Sprawdź "Authorized redirect URIs"
```

## Debug (jeśli nadal nie działa)

Sprawdź logi w przeglądarce (F12 → Console):

```javascript
// W konsoli na produkcji:
console.log('Origin:', window.location.origin)
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

Jeśli `window.location.origin` = `http://localhost:3000` → problem jest w konfiguracji Supabase/Google.

## Najczęstsze błędy

1. ❌ Brak domeny produkcyjnej w "Authorized redirect URIs" w Google
2. ❌ Niepoprawny "Site URL" w Supabase (ustawiony na localhost)
3. ❌ Brak zmiennych środowiskowych w Vercel dla Production
4. ❌ Cache przeglądarki (wyczyść cookies i cache po zmianach)

## Rozwiązanie awaryjne

Jeśli nadal nie działa, możesz tymczasowo wymusić domenę:

```typescript
// src/hooks/useAuth.ts (linia 147)
const productionUrl =
  process.env.NEXT_PUBLIC_APP_URL || 'https://twoja-domena.vercel.app'
const callbackUrl =
  process.env.NODE_ENV === 'production'
    ? `${productionUrl}/auth/callback?redirect=${redirectTo || '/'}`
    : `${window.location.origin}/auth/callback?redirect=${redirectTo || '/'}`

const { error: authError } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: callbackUrl,
  },
})
```

I dodaj zmienną środowiskową w Vercel:

```
NEXT_PUBLIC_APP_URL=https://twoja-domena.vercel.app
```
