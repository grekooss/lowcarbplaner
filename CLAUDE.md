# CLAUDE.md - Wytyczne dla Projektu "LowCarbPlaner"

**Claude, komunikuj się wyłącznie w języku polskim. Używaj profesjonalnego, technicznego języka.**

Jesteś Claude Code, ekspertem AI dla projektu "LowCarbPlaner". Ten dokument zawiera kluczowe wytyczne - szczegółowa dokumentacja znajduje się w `.claude/docs/`.

---

## 📋 Przegląd Projektu

**LowCarbPlaner** - Aplikacja webowa (MVP) do planowania diety niskowęglowodanowej z priorytetem dla wersji desktop.

Automatyczne generowanie 7-dniowych planów posiłków, śledzenie dziennych postępów kalorycznych i makroskładników, oraz interaktywna lista zakupów dla osób stosujących dietę low-carb.

---

## 🛠️ Stos Technologiczny (Core)

### Frontend

- Next.js 15+ (App Router, Turbopack, RSC)
- TypeScript 5+ (strict mode)
- Tailwind CSS + shadcn/ui (New York)
- Zustand + TanStack Query
- React Hook Form + Zod

### Backend

- Supabase (Auth, PostgreSQL, Storage)
- Next.js Server Actions
- Row Level Security (RLS) - **zawsze włączone**

### Testing & DevOps

- Vitest + RTL, Playwright
- GitHub Actions + Cloudflare Pages
- ESLint, Prettier

📚 **Szczegóły:** [.claude/docs/01-architecture.md](.claude/docs/01-architecture.md)

---

## ⚡ Quick Reference

### Komendy

```bash
npm run dev              # Development server
npm run build            # Production build
npm test                 # Unit tests
npm run test:e2e         # E2E tests
npm run lint             # ESLint
npm run format           # Prettier format
```

📚 **Szczegóły:** [.claude/docs/02-development.md](.claude/docs/02-development.md)

### Struktura Projektu

```
app/          # Next.js App Router (routes, layouts)
components/   # UI components (ui/, forms/, layout/, features/)
lib/          # Core logic (supabase/, react-query/, zustand/, actions/, validation/)
hooks/        # Custom React hooks
types/        # TypeScript definitions
constants/    # App constants
services/     # Business logic (BMR calculator, meal generator)
supabase/     # Database migrations
```

📚 **Szczegóły:** [.claude/docs/01-architecture.md](.claude/docs/01-architecture.md)

---

## 🔟 10 Najważniejszych Zasad

### 1. **TypeScript Strict Mode - ZAWSZE**

```typescript
// ✅ Wszystkie komponenty, funkcje, zmienne muszą być typowane
const user: User = { id: '123', email: 'user@example.com' }
const mealPlan: MealPlan = { id: '456', userId: '123', meals: [] }
```

### 2. **RLS dla Każdej Tabeli w Supabase**

```sql
alter table public.meal_plans enable row level security;

create policy "Users can view their own meal plans"
  on public.meal_plans for select
  to authenticated using (auth.uid() = user_id);
```

### 3. **Server Components Domyślnie**

```typescript
// ✅ Domyślnie Server Component
export default async function DailyView() {
  const meals = await getMealsForToday();
  return <div>{meals}</div>;
}

// Tylko gdy potrzebne: 'use client'
```

### 4. **Walidacja Danych na Serwerze**

```typescript
// lib/actions/onboarding.ts
'use server'
const validated = onboardingSchema.safeParse(rawData)
if (!validated.success) return { error: 'Validation failed' }
```

### 5. **Service Role Key TYLKO na Serwerze**

```typescript
// ✅ Server Action / Server Component
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ❌ NIGDY na kliencie!
```

### 6. **Path Aliases Wszędzie**

```typescript
// ✅ Używaj path aliases
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { calculateBMR } from '@/services/calculator'

// ❌ Unikaj relative paths
import { Button } from '../../../components/ui/button'
```

### 7. **Testuj Krytyczne Ścieżki (>80% coverage)**

```typescript
// Testy dla: calculator, meal generation, validation, business logic
describe('calculateBMR', () => {
  it('calculates BMR correctly for female', () => { ... });
  it('blocks unsafe calorie deficit', () => { ... });
});
```

### 8. **Conventional Commits**

```bash
git commit -m "feat(onboarding): add BMR calculator"
git commit -m "fix(meals): correct macro calculation"
```

### 9. **`.env.local` NIE w Git**

```bash
# .gitignore
.env.local
.env*.local
```

### 10. **Optymalizuj Obrazy (next/image)**

```typescript
import Image from 'next/image';
<Image src="/meals/breakfast.jpg" alt="Śniadanie" width={800} height={600} />
```

---

## 🔒 Bezpieczeństwo (Must-Know)

### RLS Policies - Granularne i Szczegółowe

```sql
-- Przykład: użytkownik może zarządzać tylko swoimi danymi
create policy "Users can update their own profile"
  on public.user_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can view their own meal plans"
  on public.meal_plans for select
  to authenticated using (auth.uid() = user_id);
```

### Walidacja z Zod

```typescript
// lib/validation/onboarding.ts
export const onboardingSchema = z.object({
  gender: z.enum(['male', 'female']),
  age: z.number().int().min(18).max(100),
  weight: z.number().min(40).max(300),
  height: z.number().min(140).max(250),
  activityLevel: z.enum([
    'sedentary',
    'light',
    'moderate',
    'active',
    'very_active',
  ]),
  goal: z.enum(['lose_weight', 'maintain_weight']),
  weightLossRate: z.enum(['slow', 'moderate', 'fast']).optional(),
})
```

### Klucze API

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=...           # Publiczny
NEXT_PUBLIC_SUPABASE_ANON_KEY=...      # Publiczny
SUPABASE_SERVICE_ROLE_KEY=...          # ⚠️ TYLKO SERVER!
```

📚 **Szczegóły:** [.claude/docs/05-security.md](.claude/docs/05-security.md)

---

## 🗄️ Migracje Bazy Danych (Quick Ref)

### Konwencja Nazewnictwa

```
supabase/migrations/YYYYMMDDHHmmss_krotki_opis.sql
```

Przykład: `20250101120000_create_user_profiles.sql`

### Struktura Migracji

```sql
-- Tworzenie tabeli
create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  gender text not null,
  age integer not null,
  weight numeric not null,
  height numeric not null,
  created_at timestamptz default now()
);

-- Włącz RLS
alter table public.user_profiles enable row level security;

-- Indeksy
create index user_profiles_user_id_idx on public.user_profiles(user_id);

-- Polityki RLS (granularne dla SELECT, INSERT, UPDATE, DELETE)
create policy "Users can view their own profile"
  on public.user_profiles for select
  to authenticated using (auth.uid() = user_id);

-- Trigger dla updated_at
create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function update_updated_at_column();
```

### Komendy

```bash
npx supabase migration new nazwa        # Nowa migracja
npx supabase db push                    # Zastosuj migracje
npx supabase db reset                   # Reset (OSTROŻNIE!)
```

📚 **Szczegóły:** [.claude/docs/06-database.md](.claude/docs/06-database.md)

---

## 🎯 Stan i Dane

### TanStack Query (Server State)

```typescript
// lib/react-query/queries/useMealPlanQuery.ts
export const useMealPlanQuery = (date: Date) => {
  return useQuery({
    queryKey: ['mealPlan', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*, meals(*)')
        .eq('date', date)
        .single()
      if (error) throw error
      return data
    },
  })
}
```

### Zustand (Client State)

```typescript
// lib/zustand/stores/useProgressStore.ts
export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      consumedCalories: 0,
      consumedMacros: { protein: 0, carbs: 0, fat: 0 },
      markMealAsEaten: (meal) =>
        set((state) => ({
          consumedCalories: state.consumedCalories + meal.calories,
          consumedMacros: {
            protein: state.consumedMacros.protein + meal.protein,
            carbs: state.consumedMacros.carbs + meal.carbs,
            fat: state.consumedMacros.fat + meal.fat,
          },
        })),
    }),
    { name: 'progress-storage' }
  )
)
```

📚 **Szczegóły:** [.claude/docs/03-state-management.md](.claude/docs/03-state-management.md)

---

## 📝 Formularze

### React Hook Form + Zod

```typescript
const form = useForm<OnboardingInput>({
  resolver: zodResolver(onboardingSchema),
  defaultValues: {
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'lose_weight',
  },
});

const onSubmit = async (data: OnboardingInput) => {
  const result = await calculateGoals.mutateAsync(data);
  router.push('/dashboard');
};

return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
```

📚 **Szczegóły:** [.claude/docs/04-forms-validation.md](.claude/docs/04-forms-validation.md)

---

## 🧪 Testowanie

### Unit Tests (Vitest)

```bash
npm test                 # Watch mode
npm run test:coverage    # Coverage report
```

### E2E Tests (Playwright)

```bash
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Playwright UI
```

📚 **Szczegóły:** [.claude/docs/07-testing.md](.claude/docs/07-testing.md)

---

## 📚 Szczegółowa Dokumentacja

Wszystkie szczegóły znajdują się w modułach dokumentacji:

### Architektura i Konfiguracja

- **[01-architecture.md](.claude/docs/01-architecture.md)** - Struktura projektu, path aliases, shadcn/ui, TypeScript, Prettier
- **[02-development.md](.claude/docs/02-development.md)** - Setup, komendy, zmienne środowiskowe, debugowanie

### Stan, Formularze, Dane

- **[03-state-management.md](.claude/docs/03-state-management.md)** - TanStack Query, Zustand, patterns
- **[04-forms-validation.md](.claude/docs/04-forms-validation.md)** - React Hook Form, Zod, custom rules

### Bezpieczeństwo i Baza Danych

- **[05-security.md](.claude/docs/05-security.md)** - RLS, walidacja, klucze API, XSS, CSRF
- **[06-database.md](.claude/docs/06-database.md)** - Migracje, relacje, real-time, storage

### Testowanie, Wydajność, CI/CD

- **[07-testing.md](.claude/docs/07-testing.md)** - Unit tests, component tests, E2E, mockowanie
- **[08-performance.md](.claude/docs/08-performance.md)** - Optymalizacja Next.js, bundle analysis, caching
- **[09-ci-cd.md](.claude/docs/09-ci-cd.md)** - GitHub Actions, deployment, Cloudflare Pages

### Przykłady Kodu i UI Components

- **[10-examples.md](.claude/docs/10-examples.md)** - Server Components, Client Components, Server Actions, middleware
- **[11-shadcn-ui.md](.claude/docs/11-shadcn-ui.md)** - Shadcn/UI komponenty, stylowanie, best practices

---

## 🆘 Common Patterns

### Server Action

```typescript
'use server'
export async function generateMealPlan(userId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.id !== userId) return { error: 'Unauthorized' }

  // Pobierz profil użytkownika i cele
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Generuj plan posiłków
  const mealPlan = await generateWeeklyMeals(profile)

  const { data, error } = await supabase.from('meal_plans').insert(mealPlan)

  revalidatePath('/dashboard')
  return { data, error }
}
```

### Protected Route (Middleware)

```typescript
export async function middleware(req: NextRequest) {
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Przekieruj na onboarding jeśli profil nie jest ukończony
  if (session && req.nextUrl.pathname === '/dashboard') {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('user_id', session.user.id)
      .single()

    if (!profile?.onboarding_completed) {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
  }

  return NextResponse.next()
}
```

### Query with Relations

```typescript
const { data } = await supabase
  .from('meal_plans')
  .select(
    `
    *,
    meals (
      id,
      name,
      calories,
      protein,
      carbs,
      fat,
      recipe:recipes (
        instructions,
        ingredients (*)
      )
    )
  `
  )
  .eq('user_id', userId)
  .eq('date', today)
  .single()
```

---

## 🎯 Kluczowe Funkcje MVP

### Onboarding i Kalkulator

- Wieloetapowy proces onboardingu
- Wzór Mifflin-St Jeor dla BMR
- Stały rozkład makro: 15% węgle, 35% białko, 50% tłuszcze
- Blokada diet poniżej 1400 kcal (K) / 1600 kcal (M)

### Plan Posiłków

- 7-dniowy kroczący plan (śniadanie, obiad, kolacja)
- Wymiana posiłku (+/- 15% kalorii)
- Modyfikacja gramatury składników (+/- 10%)
- Szczegółowe przepisy z instrukcjami krok po kroku

### Śledzenie Postępów

- Widok Dnia z trzema posiłkami
- 4 paski postępu: kalorie, białko, tłuszcze, węglowodany
- Oznaczanie posiłków jako zjedzonych
- Cofanie oznaczenia

### Lista Zakupów

- Automatyczna agregacja na 7 dni
- Grupowanie według kategorii
- Oznaczanie jako kupione (skreślenie)
- Stan listy zapisywany

---

## ⚠️ Najczęstsze Błędy - Unikaj

1. ❌ Wyłączanie RLS
2. ❌ Service Role Key na kliencie
3. ❌ Brak walidacji na serwerze
4. ❌ Relative imports zamiast path aliases
5. ❌ `'use client'` wszędzie (domyślnie Server Components!)
6. ❌ Commitowanie `.env.local`
7. ❌ `select('*')` bez potrzeby (wybierz tylko potrzebne kolumny)
8. ❌ Brak testów dla krytycznej logiki (BMR calculator, meal generator)
9. ❌ Ignorowanie TypeScript errors
10. ❌ Raw SQL z user input

---

## 🔗 Pomocne Linki

- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **TanStack Query**: https://tanstack.com/query/latest
- **Zod**: https://zod.dev
- **Playwright**: https://playwright.dev

---

**To jest główny plik wytycznych. Zawsze sprawdzaj szczegółową dokumentację w `.claude/docs/` dla pełnych informacji.**

✅ Przestrzegaj wszystkich zasad
✅ Używaj TypeScript strict mode
✅ Włączaj RLS dla każdej tabeli
✅ Waliduj na serwerze (szczególnie BMR/TDEE)
✅ Testuj krytyczne ścieżki (calculator, meal generation)
✅ Optymalizuj wydajność
✅ Dokumentuj logikę biznesową (wzory, algorytmy)
