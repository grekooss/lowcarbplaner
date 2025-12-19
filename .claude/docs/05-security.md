# Bezpieczeństwo

## Row Level Security (RLS)

### Podstawy RLS

**Zasada #1**: **ZAWSZE włączaj RLS** dla każdej tabeli w Supabase.

```sql
-- Włączenie RLS
alter table public.profiles enable row level security;
alter table public.planned_meals enable row level security;
```

### Kompletny Przykład: Tabela User Profiles

Plik: `supabase/migrations/20250101120000_create_user_profiles.sql`

```sql
-- Tworzenie tabeli
create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  gender text check (gender in ('male', 'female')) not null,
  age int not null check (age between 18 and 120),
  weight numeric not null check (weight between 30 and 300),
  height int not null check (height between 120 and 250),
  activity_level text not null,
  goal text not null check (goal in ('lose', 'maintain', 'gain')),
  bmr numeric not null,
  tdee numeric not null,
  target_calories numeric not null,
  target_protein numeric not null,
  target_carbs numeric not null,
  target_fats numeric not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Włącz RLS
alter table public.user_profiles enable row level security;

-- Polityka: użytkownicy mogą czytać tylko swój profil
create policy "Users can view own profile"
  on public.user_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Polityka: użytkownicy mogą tworzyć swój profil
create policy "Users can create own profile"
  on public.user_profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Polityka: użytkownicy mogą edytować swój profil
create policy "Users can update own profile"
  on public.user_profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Polityka: użytkownicy mogą usuwać swój profil
create policy "Users can delete own profile"
  on public.user_profiles
  for delete
  to authenticated
  using (auth.uid() = user_id);
```

### Zaawansowane Polityki RLS

#### 1. Polityka z Relacjami - Meal Plans

```sql
-- Użytkownicy mogą zobaczyć tylko swoje plany posiłków
create policy "Users can view own meal plans"
  on public.meal_plans
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Użytkownicy mogą dodawać tylko swoje plany
create policy "Users can create own meal plans"
  on public.meal_plans
  for insert
  to authenticated
  with check (auth.uid() = user_id);
```

#### 2. Polityka Warunkowa - Recipes

```sql
-- Przepisy publiczne mogą czytać wszyscy
create policy "Anyone can view public recipes"
  on public.recipes
  for select
  to authenticated, anon
  using (is_public = true or created_by = auth.uid());

-- Tylko twórca może edytować własne przepisy
create policy "Users can update own recipes"
  on public.recipes
  for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);
```

#### 3. Polityka dla Content Schema (Read-Only)

```sql
-- Składniki i przepisy są read-only dla użytkowników (zarządzane przez admina)
create policy "ingredients_select_authenticated"
  on content.ingredients for select
  to authenticated using (true);

create policy "recipes_select_authenticated"
  on content.recipes for select
  to authenticated using (true);

create policy "recipe_ingredients_select_authenticated"
  on content.recipe_ingredients for select
  to authenticated using (true);
```

#### 4. Polityka dla Daily Progress

```sql
-- Użytkownicy mogą zobaczyć tylko swoje postępy
create policy "Users can view own progress"
  on public.daily_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Użytkownicy mogą dodawać swoje postępy
create policy "Users can insert own progress"
  on public.daily_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Użytkownicy mogą aktualizować swoje postępy
create policy "Users can update own progress"
  on public.daily_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

---

## Walidacja Danych

### 1. Walidacja na Serwerze (Server Actions)

**Zasada**: **ZAWSZE** waliduj dane na serwerze, nie ufaj danym z klienta.

```typescript
// lib/actions/matches.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { createMatchSchema } from '@/lib/validation/match'
import { z } from 'zod'

export async function generateMealPlan(rawData: unknown) {
  const supabase = createClient()

  // 1. Walidacja autentykacji
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized', code: 'UNAUTHORIZED' }
  }

  // 2. Walidacja danych
  const validated = mealPlanSchema.safeParse(rawData)
  if (!validated.success) {
    return {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      issues: validated.error.issues,
    }
  }

  // 3. Dodatkowa walidacja biznesowa (minimum kalorii)
  if (validated.data.targetCalories < 1400) {
    return {
      error: 'Kalorie poniżej bezpiecznego minimum',
      code: 'INVALID_CALORIES',
    }
  }

  // 4. Operacja na bazie danych
  const { data, error } = await supabase
    .from('meal_plans')
    .insert({
      ...validated.data,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    return { error: 'Failed to generate meal plan', code: 'DATABASE_ERROR' }
  }

  revalidatePath('/meal-plans')
  return { data }
}
```

### 2. Sanityzacja Input

```typescript
import DOMPurify from 'isomorphic-dompurify'

const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  })
}

// Użycie
const matchSchema = z.object({
  description: z.string().transform((val) => sanitizeHtml(val)),
})
```

### 3. Rate Limiting (opcjonalnie)

```typescript
// lib/utils/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10s
})

export async function checkRateLimit(userId: string) {
  const { success, remaining } = await ratelimit.limit(userId)
  return { allowed: success, remaining }
}

// W Server Action
export async function createMatch(rawData: unknown) {
  const { allowed } = await checkRateLimit(user.id)
  if (!allowed) {
    return { error: 'Rate limit exceeded', code: 'RATE_LIMIT' }
  }
  // ...
}
```

---

## Klucze API i Środowisko

### 1. Zasady Bezpieczeństwa

```typescript
// ✅ Poprawnie - klucz publiczny w przeglądarce
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ✅ Poprawnie - klucz prywatny tylko na serwerze
// (Server Components, Server Actions, API Routes)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ❌ NIGDY nie używaj Service Role Key na kliencie!
// ❌ NIGDY nie commituj plików .env.local
```

### 2. Supabase Client Configuration

```typescript
// lib/supabase/client.ts (Client-side)
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// lib/supabase/server.ts (Server-side)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// lib/supabase/admin.ts (Admin operations - TYLKO SERVER!)
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ TYLKO NA SERWERZE!
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
```

### 3. Rotacja Kluczy

```bash
# Co 90 dni rotuj klucze w produkcji
# 1. Wygeneruj nowy klucz w Supabase Dashboard
# 2. Zaktualizuj zmienne środowiskowe w Cloudflare Pages
# 3. Redeploy aplikacji
# 4. Usuń stary klucz po 24h
```

---

## Deep Linking & Parametry URL

### 1. Walidacja Parametrów

```typescript
import { z } from 'zod'
import { notFound } from 'next/navigation'

const paramsSchema = z.object({
  id: z.string().uuid('Nieprawidłowy format ID'),
})

export default function MatchPage({ params }: { params: { id: string } }) {
  const validated = paramsSchema.safeParse(params)

  if (!validated.success) {
    notFound() // 404
  }

  const { id } = validated.data
  // Użyj walidowanego ID
}
```

### 2. Search Params Sanitization

```typescript
import { z } from 'zod'

const searchParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().max(100).optional(),
})

export default function MatchesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const validated = searchParamsSchema.parse(searchParams)
  // Użyj walidowanych parametrów
}
```

---

## XSS Protection

### 1. React Auto-Escaping

```typescript
// ✅ React automatycznie escape'uje
<div>{user.name}</div>

// ❌ Nigdy nie używaj dangerouslySetInnerHTML bez sanityzacji
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Jeśli musisz, sanityzuj
import DOMPurify from 'isomorphic-dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### 2. URL Validation

```typescript
const validateUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// Użycie
const userUrl = formData.get('website')
if (!validateUrl(userUrl)) {
  return { error: 'Invalid URL' }
}
```

---

## CSRF Protection

Next.js automatycznie chroni przed CSRF w Server Actions, ale dla API Routes:

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Sprawdź origin
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  if (origin && !origin.includes(host!)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

---

## SQL Injection Protection

Supabase automatycznie chroni przed SQL Injection, ale **NIGDY** nie buduj raw SQL:

```typescript
// ✅ Poprawnie - parametryzowane zapytanie
const { data } = await supabase
  .from('planned_meals')
  .select('*')
  .eq('user_id', userId)

// ❌ NIGDY nie używaj raw SQL z user input
const { data } = await supabase.rpc('raw_query', {
  query: `SELECT * FROM planned_meals WHERE user_id = '${userId}'`, // SQL INJECTION!
})
```

---

## Authentykacja & Autoryzacja

### 1. Middleware dla Protected Routes

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Przekieruj niezalogowanych użytkowników
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Przekieruj zalogowanych z /login
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/login'],
}
```

### 2. Server-side Auth Check

```typescript
// app/(main)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  return <div>Witaj, {user.email}!</div>;
}
```

---

## Headers Security

### 1. Security Headers (next.config.js)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

---

## Best Practices Checklist

### ✅ Must-Do

- [ ] RLS enabled dla każdej tabeli
- [ ] Granularne polityki RLS (SELECT, INSERT, UPDATE, DELETE)
- [ ] Walidacja danych na serwerze (Zod)
- [ ] Service Role Key TYLKO na serwerze
- [ ] `.env.local` w `.gitignore`
- [ ] HTTPS w produkcji
- [ ] Middleware auth dla protected routes
- [ ] Walidacja parametrów URL
- [ ] Sanityzacja HTML input
- [ ] Rate limiting dla API (opcjonalnie)

### ❌ Never-Do

- [ ] ❌ Wyłączanie RLS
- [ ] ❌ Service Role Key na kliencie
- [ ] ❌ Commitowanie `.env` files
- [ ] ❌ Raw SQL z user input
- [ ] ❌ `dangerouslySetInnerHTML` bez sanityzacji
- [ ] ❌ Ufanie danym z klienta
- [ ] ❌ Hardcodowanie sekretów w kodzie

---

📚 **Więcej szczegółów:** Zobacz inne pliki w `.claude/docs/`
