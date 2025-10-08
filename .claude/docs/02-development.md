# Workflow Deweloperski

## Setup Lokalny

### Krok po Kroku

1. **Sklonuj Repozytorium**

   ```bash
   git clone https://github.com/your-org/lowcarbplaner.git
   cd lowcarbplaner
   ```

2. **Zainstaluj Zależności**

   ```bash
   npm install
   ```

3. **Konfiguracja Zmiennych Środowiskowych**

   ```bash
   # Skopiuj szablon
   cp .env.example .env.local

   # Edytuj plik .env.local i uzupełnij wartości
   ```

4. **Konfiguracja Supabase (opcjonalnie lokalnie)**

   ```bash
   # Zainstaluj Supabase CLI
   npm install -g supabase

   # Inicjalizuj projekt
   npx supabase init

   # Uruchom lokalnie
   npx supabase start

   # Zastosuj migracje
   npx supabase db push
   ```

5. **Uruchom Serwer Deweloperski**

   ```bash
   npm run dev
   ```

6. **Otwórz w Przeglądarce**
   ```
   http://localhost:3000
   ```

---

## Zmienne Środowiskowe

### Plik `.env.local`

**Struktura:**

```bash
# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here  # TYLKO SERVER-SIDE!

# ============================================
# API KEYS (Opcjonalnie)
# ============================================
# Dla zewnętrznych API (np. analizy składu odżywczego)
# NEXT_PUBLIC_NUTRITION_API_KEY=your_api_key_here

# ============================================
# SENTRY (Opcjonalnie - Error Monitoring)
# ============================================
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your-org
SENTRY_PROJECT=lowcarbplaner

# ============================================
# APLIKACJA
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ============================================
# FEATURE FLAGS (Opcjonalnie)
# ============================================
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true
```

### Plik `.env.example` (Commitowany do Git)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Zasady Bezpieczeństwa

1. **NIGDY** nie commituj plików `.env.local`
2. **Klucze publiczne**: Prefix `NEXT_PUBLIC_*` (dostępne w przeglądarce)
3. **Klucze prywatne**: Bez prefiksu (tylko na serwerze)
4. **Service Role Key**: Używaj TYLKO w Server Actions, nigdy na kliencie
5. **Rotacja kluczy**: Regularnie rotuj klucze produkcyjne

### Dostęp do Zmiennych

```typescript
// ✅ Client-side (dostępne w przeglądarce)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

// ✅ Server-side (Server Components, Server Actions, API Routes)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ❌ Nigdy nie używaj Service Role Key na kliencie!
```

### Zmienne dla Różnych Środowisk

- **Development**: `.env.local`
- **Production**: Cloudflare Pages Dashboard → Settings → Environment Variables
- **Staging**: Oddzielna konfiguracja w Cloudflare Pages

---

## Komendy Deweloperskie

### Development

```bash
# Uruchom serwer deweloperski (http://localhost:3000)
npm run dev

# Uruchom z innym portem
PORT=3001 npm run dev

# Wyczyść cache Next.js
rm -rf .next
npm run dev
```

### Production Build

```bash
# Build dla produkcji
npm run build

# Uruchom produkcyjny build lokalnie
npm run start

# Build + start
npm run build && npm run start
```

### Code Quality

```bash
# Linting
npm run lint                 # Sprawdź błędy
npm run lint --fix           # Napraw automatyczne błędy

# Formatting
npm run format               # Formatuj wszystkie pliki
npm run format:check         # Sprawdź formatowanie bez zmian

# Type checking
npx tsc --noEmit            # Sprawdź typy TypeScript
```

### Testing

```bash
# Unit tests
npm test                     # Uruchom testy (watch mode)
npm run test:ci              # Uruchom raz (CI mode)
npm run test:coverage        # Generuj raport pokrycia

# E2E tests
npm run test:e2e            # Uruchom testy Playwright
npm run test:e2e:ui         # Otwórz Playwright UI
npm run test:e2e:debug      # Debug mode

# Vitest UI
npm run test:ui             # Otwórz interaktywny UI
```

### Database (Supabase)

```bash
# Migracje
npx supabase db push        # Zastosuj migracje
npx supabase db reset       # Reset bazy (OSTROŻNIE!)
npx supabase migration new nazwa_migracji  # Nowa migracja

# Typy TypeScript
npx supabase gen types typescript --local > types/database.types.ts

# Status
npx supabase status         # Status lokalnej instancji
npx supabase db diff        # Pokaż zmiany w schemacie
```

### Inne

```bash
# Analiza bundle'a
ANALYZE=true npm run build

# Czyszczenie
rm -rf node_modules .next
npm install

# Aktualizacja zależności
npm outdated                # Sprawdź nieaktualne pakiety
npm update                  # Aktualizuj pakiety
```

---

## Debugowanie

### React DevTools

1. Zainstaluj rozszerzenie: [React DevTools](https://react.dev/learn/react-developer-tools)
2. Otwórz DevTools (F12) → zakładka "Components"
3. Inspekcja komponentów, props, state

### Next.js DevTools

- Automatycznie dostępne w development mode
- Informacje o Server Components, routing, performance

### Chrome DevTools

```typescript
// Breakpoints w kodzie
debugger

// Console logging
console.log('User:', user)
console.table(mealPlans)
console.error('Error:', error)

// Performance profiling
console.time('calculateBMR')
await calculateBMR()
console.timeEnd('calculateBMR')
```

### Supabase Studio

```bash
# Lokalny Supabase Studio
npx supabase start
# Otwórz: http://localhost:54323

# Features:
# - Table Editor
# - SQL Editor
# - Auth Manager
# - Storage Browser
# - Database Logs
```

### VS Code Debug Configuration

Plik: `.vscode/launch.json`

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Network Debugging

```typescript
// lib/supabase/client.ts - dodaj logging
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      debug: process.env.NODE_ENV === 'development',
    },
  }
)
```

### Error Logging

```typescript
// lib/utils/logger.ts
export const logger = {
  error: (message: string, error: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, error)
    }
    // W produkcji: wysyłaj do Sentry
  },

  warn: (message: string, data?: unknown) => {
    console.warn(`[WARN] ${message}`, data)
  },

  info: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, data)
    }
  },
}
```

---

## Hot Reload

### Next.js Fast Refresh

- **Automatyczne**: Zmiany w komponentach React są natychmiast widoczne
- **Zachowuje state**: Stan komponentu nie jest resetowany
- **Error Recovery**: Automatyczne odświeżenie po naprawie błędu

### Turbopack

Next.js 15 domyślnie używa Turbopack (szybszy niż Webpack):

```bash
# Już włączony w `npm run dev`
```

**Korzyści:**

- 🚀 5-10x szybszy cold start
- ⚡ Szybsze HMR (Hot Module Replacement)
- 📦 Mniejsze zużycie pamięci

---

## Git Workflow

### Branch Strategy

```bash
# Main branch (produkcja)
main

# Feature branches
git checkout -b feature/user-onboarding
git checkout -b feature/meal-plan-generator

# Bugfix branches
git checkout -b fix/bmr-calculation

# Hotfix (produkcja)
git checkout -b hotfix/critical-security-issue
```

### Commit Messages (Conventional Commits)

```bash
# Format: <typ>[zakres opcjonalny]: <opis>

# Przykłady
git commit -m "feat(onboarding): add BMR calculator form"
git commit -m "fix(meals): correct macro calculation logic"
git commit -m "docs: update README with setup instructions"
git commit -m "refactor(ui): simplify progress bar component styles"
git commit -m "test(calculator): add unit tests for TDEE calculation"
git commit -m "chore: update dependencies"
```

**Typy:**

- `feat` - Nowa funkcjonalność
- `fix` - Naprawa błędu
- `docs` - Dokumentacja
- `style` - Formatowanie (bez zmian logiki)
- `refactor` - Refaktoryzacja
- `test` - Testy
- `chore` - Zmiany w buildzie, zależnościach

### Pre-commit Hook (opcjonalnie)

```bash
# Instalacja Husky
npm install -D husky lint-staged

# Konfiguracja
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

Plik: `package.json`

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## Troubleshooting

### Typowe Problemy

#### 1. Port 3000 już zajęty

```bash
# Znajdź proces
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Zabij proces lub użyj innego portu
PORT=3001 npm run dev
```

#### 2. Cache issues

```bash
# Wyczyść cache Next.js
rm -rf .next
npm run dev

# Wyczyść node_modules
rm -rf node_modules
npm install
```

#### 3. TypeScript errors

```bash
# Regeneruj typy
npx tsc --noEmit

# Restart TypeScript server (VS Code)
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

#### 4. Supabase connection issues

```typescript
// Sprawdź zmienne środowiskowe
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

// Sprawdź połączenie
const { data, error } = await supabase.from('meal_plans').select('count')
console.log('Connection test:', { data, error })
```

---

📚 **Więcej szczegółów:** Zobacz inne pliki w `.claude/docs/`
