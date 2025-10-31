# Przewodnik Workflow Deweloperskiego - LowCarbPlaner

## Przegląd

Ten przewodnik opisuje workflow deweloperski, standardy kodowania, konwencje Git i najlepsze praktyki dla współpracy przy LowCarbPlaner.

---

## Spis Treści

1. [Konfiguracja Środowiska Deweloperskiego](#1-konfiguracja-środowiska-deweloperskiego)
2. [Workflow Git](#2-workflow-git)
3. [Standardy Kodowania](#3-standardy-kodowania)
4. [Rozwój Komponentów](#4-rozwój-komponentów)
5. [Rozwój API](#5-rozwój-api)
6. [Migracje Bazy Danych](#6-migracje-bazy-danych)
7. [Workflow Testowania](#7-workflow-testowania)
8. [Proces Przeglądu Kodu](#8-proces-przeglądu-kodu)
9. [Proces Wdrożenia](#9-proces-wdrożenia)
10. [Rozwiązywanie Problemów](#10-rozwiązywanie-problemów)

---

## 1. Konfiguracja Środowiska Deweloperskiego

### Wymagania Wstępne

```bash
# Wymagane oprogramowanie
- Node.js 20+ (wersja LTS)
- npm 10+
- Git 2.40+
- VSCode (zalecane) lub preferowany edytor

# Zalecane Rozszerzenia VSCode
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- TypeScript Error Translator (mattpocock.ts-error-translator)
- Vitest Runner (vitest.explorer)
- Playwright Test for VSCode (ms-playwright.playwright)
```

### Początkowa Konfiguracja

```bash
# 1. Sklonuj repozytorium
git clone https://github.com/your-username/lowcarbplaner.git
cd lowcarbplaner

# 2. Zainstaluj zależności
npm install

# 3. Skonfiguruj zmienne środowiskowe
cp .env.example .env.local
# Edytuj .env.local z danymi logowania Supabase

# 4. Połącz z projektem Supabase (jeśli nie wykonano)
npx supabase link --project-ref TWÓJ_PROJECT_REF

# 5. Uruchom migracje bazy danych
npx supabase db push

# 6. (Opcjonalnie) Sklonuj dane testowe
npm run db:clone

# 7. Uruchom serwer deweloperski
npm run dev

# 8. Uruchom testy (w osobnym terminalu)
npm run test:watch
```

### Ustawienia VSCode

```json
// .vscode/settings.json (już skonfigurowane)
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

## 2. Workflow Git

### Konwencja Nazewnictwa Gałęzi

```
feature/   - Nowe funkcje (np. feature/meal-swap-ui)
fix/       - Poprawki błędów (np. fix/macro-calculation-rounding)
refactor/  - Refaktoryzacja kodu (np. refactor/meal-card-component)
test/      - Dodawanie/aktualizacja testów (np. test/e2e-onboarding-flow)
docs/      - Aktualizacje dokumentacji (np. docs/update-readme)
chore/     - Zmiany build/config (np. chore/update-dependencies)
```

### Konwencja Wiadomości Commitów (Conventional Commits)

**Format:** `<type>(<scope>): <subject>`

**Typy:**

- `feat`: Nowa funkcja
- `fix`: Poprawka błędu
- `refactor`: Refaktoryzacja kodu
- `test`: Dodawanie/aktualizacja testów
- `docs`: Zmiany dokumentacji
- `style`: Zmiany stylu kodu (formatowanie, bez zmian logiki)
- `chore`: Zmiany build/config
- `perf`: Ulepszenia wydajności

**Przykłady:**

```bash
# Dobre wiadomości commitów
feat(onboarding): add BMR calculator with Mifflin-St Jeor formula
fix(dashboard): resolve progress bar not updating after meal consumed
refactor(meal-card): extract ingredient list to separate component
test(e2e): add shopping list interaction tests
docs(readme): update installation instructions for Windows

# Złe wiadomości commitów (zostaną odrzucone przez commitlint)
"fixed bug"
"update code"
"WIP"
```

### Standardowy Workflow Git

```bash
# 1. Utwórz gałąź funkcji z main
git checkout main
git pull origin main
git checkout -b feature/my-new-feature

# 2. Wprowadź zmiany i commituj często
git add .
git commit -m "feat(scope): implement feature X"

# 3. Utrzymuj gałąź aktualną z main
git fetch origin
git rebase origin/main

# 4. Wypychaj na zdalne repozytorium
git push origin feature/my-new-feature

# 5. Utwórz Pull Request na GitHub
# (Zobacz sekcję Proces Przeglądu Kodu)

# 6. Po zatwierdzeniu i merge PR, usuń lokalną gałąź
git checkout main
git pull origin main
git branch -d feature/my-new-feature
```

### Obsługa Konfliktów Merge

```bash
# 1. Aktualizuj main i rebase
git fetch origin
git rebase origin/main

# 2. Rozwiąż konflikty w edytorze
# (VSCode ma doskonały interfejs rozwiązywania konfliktów merge)

# 3. Oznacz konflikty jako rozwiązane
git add <resolved-files>
git rebase --continue

# 4. Force push (rebase przepisuje historię)
git push origin feature/my-branch --force-with-lease
```

---

## 3. Standardy Kodowania

### Wytyczne TypeScript

#### ✅ RÓB

```typescript
// Używaj jawnych typów dla parametrów i wartości zwracanych funkcji
function calculateBMR(
  gender: 'male' | 'female',
  weight: number,
  height: number,
  age: number
): number {
  // ...
}

// Używaj const dla wartości niezmiennych
const PAL_MULTIPLIERS = {
  very_low: 1.2,
  low: 1.375,
} as const

// Używaj interfejsów dla kształtów obiektów
interface UserProfile {
  id: string
  email: string
  age: number
}

// Używaj typu dla unii i przecięć
type MealType = 'breakfast' | 'lunch' | 'dinner'

// Używaj optional chaining i nullish coalescing
const userName = user?.profile?.name ?? 'Guest'

// Używaj discriminated unions dla złożonego stanu
type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Meal[] }
  | { status: 'error'; error: string }
```

#### ❌ NIE RÓB

```typescript
// Nie używaj typu 'any' (użyj 'unknown' jeśli konieczne)
function process(data: any) {} // ❌

// Nie używaj var (użyj const lub let)
var count = 0 // ❌

// Nie mutuj parametrów funkcji
function updateUser(user: User) {
  user.name = 'New Name' // ❌ Mutuje parametr
}

// Nie ignoruj błędów TypeScript za pomocą @ts-ignore
// @ts-ignore ❌
const result = someFunction()

// Nie używaj non-null assertion chyba że absolutnie konieczne
const value = maybeNull! // ❌ Preferuj sprawdzanie null
```

### Organizacja Plików

```
src/
├── app/                          # Strony Next.js App Router
│   ├── (auth)/                   # Grupa routingu dla stron auth
│   │   ├── login/
│   │   └── signup/
│   ├── (protected)/              # Grupa routingu dla stron autentykowanych
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── layout.tsx            # Współdzielony layout ze sprawdzeniem auth
│   └── layout.tsx                # Layout główny
│
├── components/                   # Komponenty React
│   ├── ui/                       # Komponenty bazowe shadcn/ui (Button, Input, etc.)
│   ├── dashboard/                # Komponenty specyficzne dla Dashboard
│   │   ├── MealCard.tsx
│   │   ├── MacroProgressBar.tsx
│   │   └── __tests__/
│   ├── onboarding/               # Komponenty przepływu onboardingu
│   └── shared/                   # Współdzielone komponenty (Header, Footer, etc.)
│
├── lib/                          # Kod biblioteki rdzeniowej
│   ├── actions/                  # Server Actions
│   │   ├── meal-plan.ts
│   │   └── profile.ts
│   ├── algorithms/               # Algorytmy logiki biznesowej
│   │   ├── macroCalculator.ts
│   │   └── mealGenerator.ts
│   ├── api/                      # Wrappery klienta API
│   │   └── supabase.ts
│   ├── hooks/                    # Niestandardowe hooki React
│   │   ├── useMealPlan.ts
│   │   └── useProfile.ts
│   ├── stores/                   # Sklepy Zustand
│   │   └── authStore.ts
│   ├── types/                    # Definicje typów TypeScript
│   │   ├── database.ts           # Typy wygenerowane przez Supabase
│   │   └── models.ts             # Modele domeny
│   ├── utils/                    # Funkcje narzędziowe
│   │   ├── cn.ts                 # Narzędzie class name
│   │   ├── date.ts               # Pomocniki dat
│   │   └── format.ts             # Pomocniki formatowania
│   └── validations/              # Schematy Zod
│       ├── onboarding.ts
│       └── profile.ts
│
└── tests/                        # Konfiguracja testów
    └── e2e/                      # Testy E2E Playwright
```

### Konwencje Nazewnictwa

```typescript
// Komponenty: PascalCase
function MealCard() {}
export const MacroProgressBar = () => {}

// Funkcje/zmienne: camelCase
const calculateBMR = () => {}
const userId = '123'

// Stałe: UPPER_SNAKE_CASE
const MAX_DAILY_CALORIES = 3000
const API_ENDPOINT = 'https://api.example.com'

// Typy/Interfejsy: PascalCase
interface UserProfile {}
type MealType = 'breakfast' | 'lunch' | 'dinner'

// Pliki: kebab-case
// macro-progress-bar.tsx
// calculate-bmr.ts
// use-meal-plan.ts

// Foldery: kebab-case lub oparte na domenie
// meal-plan/
// onboarding/
// dashboard/
```

---

## 4. Rozwój Komponentów

### Szablon Komponentu

```typescript
// src/components/dashboard/MealCard.tsx

import { type FC } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { type PlannedMeal } from '@/lib/types/models'

interface MealCardProps {
  meal: PlannedMeal
  onToggleConsumed: (mealId: string, isConsumed: boolean) => void
}

/**
 * MealCard wyświetla pojedynczy posiłek ze szczegółami i statusem spożycia.
 *
 * @param meal - Dane zaplanowanego posiłku
 * @param onToggleConsumed - Callback gdy zmienia się status spożycia posiłku
 */
export const MealCard: FC<MealCardProps> = ({ meal, onToggleConsumed }) => {
  return (
    <Card data-testid="meal-card" data-meal-id={meal.id}>
      <div className="flex items-center justify-between p-4">
        <div>
          <h3 className="text-lg font-semibold">{meal.recipe.name}</h3>
          <p className="text-sm text-muted-foreground">
            {meal.calories} kcal
          </p>
        </div>
        <Checkbox
          checked={meal.isConsumed}
          onCheckedChange={(checked) =>
            onToggleConsumed(meal.id, Boolean(checked))
          }
          aria-label={`Oznacz ${meal.recipe.name} jako zjedzony`}
        />
      </div>
    </Card>
  )
}
```

### Najlepsze Praktyki Komponentów

1. **Pojedyncza Odpowiedzialność:** Każdy komponent powinien robić jedną rzecz dobrze
2. **Interfejs Props:** Zawsze definiuj jawny interfejs props
3. **Komentarze JSDoc:** Dokumentuj złożone komponenty
4. **Dostępność:** Używaj semantycznego HTML i etykiet ARIA
5. **Granice Błędów:** Owijaj ryzykowne komponenty w granice błędów
6. **Test IDs:** Dodaj `data-testid` dla testów E2E

---

## 5. Rozwój API

### Wzorzec Server Actions

```typescript
// src/lib/actions/meal-plan.ts

'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

export async function toggleMealConsumed(mealId: string, isConsumed: boolean) {
  // 1. Utwórz klienta Supabase po stronie serwera
  const supabase = await createServerClient()

  // 2. Pobierz autentykowanego użytkownika
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // 3. Wykonaj mutację bazy danych
  const { error } = await supabase
    .from('planned_meals')
    .update({
      is_consumed: isConsumed,
      consumed_at: isConsumed ? new Date().toISOString() : null,
    })
    .eq('id', mealId)
    .eq('user_id', user.id) // RLS wymusza to, ale jawne jest lepsze

  if (error) {
    console.error('Error toggling meal:', error)
    return { error: 'Failed to update meal' }
  }

  // 4. Rewaliduj dotkn stripcję stron
  revalidatePath('/dashboard')

  return { success: true }
}
```

### Integracja TanStack Query

```typescript
// src/lib/hooks/useMealPlan.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleMealConsumed } from '@/lib/actions/meal-plan'

export function useMealPlan(date: string) {
  const queryClient = useQueryClient()

  // Zapytanie do pobierania posiłków
  const query = useQuery({
    queryKey: ['meals', date],
    queryFn: () => fetchMeals(date),
    staleTime: 5 * 60 * 1000, // 5 minut
  })

  // Mutacja do przełączania spożycia
  const toggleMutation = useMutation({
    mutationFn: ({
      mealId,
      isConsumed,
    }: {
      mealId: string
      isConsumed: boolean
    }) => toggleMealConsumed(mealId, isConsumed),
    onMutate: async ({ mealId, isConsumed }) => {
      // Optymistyczna aktualizacja
      await queryClient.cancelQueries({ queryKey: ['meals', date] })
      const previousMeals = queryClient.getQueryData(['meals', date])

      queryClient.setQueryData(['meals', date], (old: any) => {
        return old.map((meal: any) =>
          meal.id === mealId ? { ...meal, isConsumed } : meal
        )
      })

      return { previousMeals }
    },
    onError: (err, variables, context) => {
      // Rollback przy błędzie
      queryClient.setQueryData(['meals', date], context?.previousMeals)
    },
    onSuccess: () => {
      // Refetch dla synchronizacji
      queryClient.invalidateQueries({ queryKey: ['meals', date] })
    },
  })

  return {
    ...query,
    toggleMeal: toggleMutation.mutate,
  }
}
```

---

## 6. Migracje Bazy Danych

### Tworzenie Nowej Migracji

```bash
# 1. Utwórz plik migracji
npx supabase migration new add_feedback_table

# 2. Edytuj wygenerowany plik w supabase/migrations/
# Przykład: 20250130_add_feedback_table.sql
```

### Szablon Migracji

```sql
-- supabase/migrations/20250130_add_feedback_table.sql

-- Utwórz tabelę feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  app_version TEXT,
  os_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Utwórz indeks na user_id dla szybszych zapytań
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);

-- Włącz Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Utwórz politykę RLS: użytkownicy mogą przeglądać własną opinię
CREATE POLICY "Users can view own feedback"
  ON public.feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- Utwórz politykę RLS: użytkownicy mogą wstawiać własną opinię
CREATE POLICY "Users can insert own feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Dodaj komentarz dla dokumentacji
COMMENT ON TABLE public.feedback IS 'User feedback and bug reports';
```

### Stosowanie Migracji

```bash
# Zastosuj do zdalnej bazy danych (produkcja/staging)
npx supabase db push

# Zresetuj lokalną bazę danych (UWAGA: destrukcyjne)
npx supabase db reset

# Generuj typy TypeScript ze schematu bazy danych
npx supabase gen types typescript --local > src/lib/types/database.ts
```

---

## 7. Workflow Testowania

### Cykl Test-Driven Development (TDD)

```
1. ❌ Napisz niepowodzący się test
   └─> 2. ✅ Napisz minimalny kod aby przeszedł
       └─> 3. 🔄 Refaktoryzuj zachowując testy zielone
           └─> Powtórz
```

### Uruchamianie Testów

```bash
# Testy jednostkowe (tryb watch dla TDD)
npm run test:watch

# Uruchom wszystkie testy jednostkowe raz
npm run test

# Uruchom testy z pokryciem
npm run test:coverage

# Testy E2E (wszystkie przeglądarki)
npm run test:e2e

# Testy E2E (pojedyncza przeglądarka)
npm run test:e2e:chromium

# Testy E2E (tryb interaktywnego UI)
npm run test:e2e:ui

# Testy E2E (tryb debugowania)
npm run test:e2e:debug
```

### Pisanie Testów

Zobacz [15-STRATEGIA-TESTOWANIA.md](./15-STRATEGIA-TESTOWANIA.md) dla kompleksowych wytycznych testowania.

---

## 8. Proces Przeglądu Kodu

### Przed Utworzeniem PR

```bash
# 1. Uruchom zestaw walidacji
npm run validate

# 2. Uruchom wszystkie testy
npm run test
npm run test:e2e

# 3. Sprawdź niezcommitowane zmiany
git status

# 4. Rebase na main
git fetch origin
git rebase origin/main

# 5. Wypchnij do swojej gałęzi
git push origin feature/my-feature
```

### Lista Kontrolna PR

- [ ] Tytuł PR przestrzega konwencji: `type(scope): description`
- [ ] Opis wyjaśnia co i dlaczego (nie tylko jak)
- [ ] Wszystkie sprawdzenia CI zaliczone (testy, lint, build)
- [ ] Pokrycie kodu utrzymane lub ulepszone
- [ ] Brak konfliktów merge z main
- [ ] Zrzuty ekranu/filmy dla zmian UI
- [ ] Migracja bazy danych przetestowana (jeśli dotyczy)
- [ ] Dokumentacja zaktualizowana (jeśli dotyczy)

### Szablon PR

```markdown
## Opis

[Krótki opis zmian]

## Typ Zmiany

- [ ] Poprawka błędu (nie-breaking zmiana naprawiająca problem)
- [ ] Nowa funkcja (nie-breaking zmiana dodająca funkcjonalność)
- [ ] Breaking change (poprawka lub funkcja zmieniająca istniejącą funkcjonalność)
- [ ] Refaktoryzacja (usprawnienie kodu bez zmiany zachowania)
- [ ] Aktualizacja dokumentacji

## Jak To Zostało Przetestowane?

- [ ] Testy jednostkowe dodane/zaktualizowane
- [ ] Testy integracyjne dodane/zaktualizowane
- [ ] Testy E2E dodane/zaktualizowane
- [ ] Ręczne testowanie wykonane

## Lista Kontrolna

- [ ] Mój kod przestrzega wytycznych stylu projektu
- [ ] Wykonałem auto-przegląd mojego kodu
- [ ] Skomentowałem kod, szczególnie w trudnych do zrozumienia miejscach
- [ ] Wprowadziłem odpowiednie zmiany w dokumentacji
- [ ] Moje zmiany nie generują nowych ostrzeżeń
- [ ] Dodałem testy potwierdzające działanie mojej poprawki lub funkcji
- [ ] Nowe i istniejące testy jednostkowe przechodzą lokalnie z moimi zmianami

## Zrzuty Ekranu (jeśli dotyczy)

[Dodaj zrzuty ekranu lub GIFy dla zmian UI]

## Powiązane Problemy

Closes #[numer problemu]
```

### Wytyczne Przeglądu (dla Recenzentów)

1. **Funkcjonalność:** Czy działa zgodnie z zamierzeniem?
2. **Jakość Kodu:** Czy jest czytelny, łatwy w utrzymaniu, dobrze zbudowany?
3. **Testy:** Czy są odpowiednie testy? Czy obejmują przypadki brzegowe?
4. **Wydajność:** Czy są jakieś obawy dotyczące wydajności?
5. **Bezpieczeństwo:** Czy są jakieś luki w bezpieczeństwie?
6. **Dostępność:** Czy przestrzega najlepszych praktyk a11y?

---

## 9. Proces Wdrożenia

### Automatyczne Wdrożenie (przez Cloudflare Pages)

```
Push do main → Webhook GitHub → Cloudflare Pages
  ├─> Uruchom build (next build)
  ├─> Uruchom testy (CI)
  ├─> Wdroż do produkcji
  └─> Wyczyść cache CDN
```

### Ręczne Wdrożenie (jeśli potrzebne)

```bash
# 1. Build lokalnie
npm run build

# 2. Przetestuj build produkcyjny
npm run start

# 3. Wdroż przez CLI (jeśli nie używasz integracji GitHub)
npx wrangler pages deploy .next
```

### Lista Kontrolna Wdrożenia

- [ ] Wszystkie testy zaliczone w CI
- [ ] Migracje bazy danych zastosowane do produkcji
- [ ] Zmienne środowiskowe zaktualizowane (jeśli zmienione)
- [ ] Monitoruj logi błędów przez pierwsze 30 minut po wdrożeniu
- [ ] Zweryfikuj krytyczne przepływy użytkownika w produkcji
- [ ] Ogłoś wdrożenie w kanale zespołowym (jeśli główne wydanie)

---

## 10. Rozwiązywanie Problemów

### Typowe Problemy i Rozwiązania

#### Problem: "Module not found" po npm install

```bash
# Rozwiązanie: Wyczyść cache i przeinstaluj
rm -rf node_modules
rm package-lock.json
npm install
```

#### Problem: Błędy TypeScript w VSCode ale nie w CLI

```bash
# Rozwiązanie: Zrestartuj serwer TypeScript w VSCode
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

#### Problem: Błędy połączenia Supabase

```bash
# Rozwiązanie 1: Sprawdź dane logowania .env.local
cat .env.local

# Rozwiązanie 2: Zweryfikuj czy projekt Supabase działa
npx supabase status

# Rozwiązanie 3: Ponownie połącz projekt
npx supabase link --project-ref TWÓJ_PROJECT_REF
```

#### Problem: Testy niepowodzące tylko w CI

```bash
# Rozwiązanie: Uruchom testy w trybie CI lokalnie
CI=true npm run test
```

#### Problem: Testy E2E niestabilne / timeout

```bash
# Rozwiązanie 1: Zwiększ timeout w playwright.config.ts
timeout: 30000 // 30 sekund

# Rozwiązanie 2: Uruchom z widoczną przeglądarką do debugowania
npm run test:e2e:headed

# Rozwiązanie 3: Użyj Playwright Inspector
npm run test:e2e:debug
```

#### Problem: Migracje bazy danych niezsynchronizowane

```bash
# Rozwiązanie: Zresetuj i ponownie zastosuj migracje
npx supabase db reset
npx supabase db push
npm run db:clone
```

---

## Szybki Przewodnik Po Poleceniach

```bash
# Development
npm run dev              # Uruchom serwer dev
npm run dev:turbo        # Uruchom dev z Turbopack
npm run build            # Build dla produkcji
npm run start            # Uruchom serwer produkcyjny

# Jakość Kodu
npm run lint             # Uruchom ESLint
npm run lint:fix         # Napraw błędy ESLint
npm run format           # Formatuj z Prettier
npm run format:check     # Sprawdź formatowanie
npm run type-check       # Uruchom kompilator TypeScript
npm run validate         # Uruchom wszystkie sprawdzenia (type + lint + format)

# Testowanie
npm run test             # Uruchom testy jednostkowe
npm run test:watch       # Uruchom testy w trybie watch
npm run test:coverage    # Generuj raport pokrycia
npm run test:e2e         # Uruchom testy E2E
npm run test:e2e:ui      # Uruchom testy E2E w trybie UI

# Baza Danych
npm run db:clone         # Sklonuj schemat + dane testowe (DEV → TEST)
npm run db:clone:full    # Sklonuj całą bazę danych (DEV → TEST)
npx supabase db push     # Zastosuj migracje do zdalnej
npx supabase db reset    # Zresetuj lokalną bazę danych
npx supabase gen types   # Generuj typy TypeScript

# Git
git add .
git commit -m "type(scope): message"
git push origin branch-name
```

---

## Zasoby

### Dokumentacja Wewnętrzna

- [14-KONTEKST-PROJEKTU.md](./14-KONTEKST-PROJEKTU.md) - Przegląd projektu
- [15-STRATEGIA-TESTOWANIA.md](./15-STRATEGIA-TESTOWANIA.md) - Wytyczne testowania
- [16-ARCHITEKTURA.md](./16-ARCHITEKTURA.md) - Decyzje architektoniczne

### Linki Zewnętrzne

- [Dokumentacja Next.js](https://nextjs.org/docs)
- [Dokumentacja Supabase](https://supabase.com/docs)
- [Dokumentacja TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Dokumentacja Tailwind CSS](https://tailwindcss.com/docs)
- [Dokumentacja Playwright](https://playwright.dev/)

---

**Ostatnia Aktualizacja:** 2025-10-30
**Utrzymywane przez:** Zespół Deweloperski
