# 📚 Dokumentacja Projektu "LowCarbPlaner"

Szczegółowa dokumentacja techniczna podzielona na moduły tematyczne.

---

## 📖 Spis Treści

### 🏗️ Architektura i Konfiguracja

**[01-architecture.md](./01-architecture.md)**

- Pełna struktura katalogów projektu
- Path aliases i konfiguracja TypeScript
- shadcn/ui components
- Tailwind CSS setup
- Prettier i ESLint
- Konwencje nazewnictwa

**[02-development.md](./02-development.md)**

- Setup lokalny krok po kroku
- Wszystkie komendy deweloperskie
- Zmienne środowiskowe (szczegółowo)
- Debugowanie (React DevTools, Supabase Studio)
- Git workflow i Conventional Commits
- Troubleshooting

---

### 🎯 Stan, Formularze, Dane

**[03-state-management.md](./03-state-management.md)**

- TanStack Query (React Query) - queries, mutations
- Zustand - stores, persist, devtools
- Integracja TanStack Query + Zustand
- Best practices i wzorce dla meal planning i progress tracking

**[04-forms-validation.md](./04-forms-validation.md)**

- React Hook Form podstawy i zaawansowane wzorce
- Zod schemas i walidacja (onboarding, profile)
- shadcn/ui Form components
- Custom validation rules (BMR limits, macro ratios)
- Error handling

---

### 🔒 Bezpieczeństwo i Baza Danych

**[05-security.md](./05-security.md)**

- Row Level Security (RLS) - kompletne przykłady
- Granularne polityki RLS dla user data
- Walidacja danych na serwerze (BMR, TDEE calculations)
- Klucze API i zmienne środowiskowe
- XSS, CSRF, SQL Injection protection
- Middleware auth
- Best practices checklist

**[06-database.md](./06-database.md)**

- Konwencje nazewnictwa migracji
- Struktura migracji SQL
- Relacje i Foreign Keys (users, meal_plans, recipes)
- Generowanie typów TypeScript
- Storage (recipe images)
- Query optimization
- Database functions (meal matching algorithm)
- Seed data (recipes database)

---

### 🧪 Testowanie, Wydajność, CI/CD

**[07-testing.md](./07-testing.md)**

- Unit tests (Vitest) - BMR calculator, meal generator
- Component tests (React Testing Library)
- E2E tests (Playwright) - onboarding flow, meal planning
- Mockowanie Supabase
- Test coverage

**[08-performance.md](./08-performance.md)**

- Next.js optimization (Image, Font, Code Splitting)
- Bundle analysis
- Database performance (indeksy, queries)
- Caching strategies (React cache, revalidate)

**[09-ci-cd.md](./09-ci-cd.md)**

- GitHub Actions workflow
- Deployment na Cloudflare Pages
- Environment variables w produkcji
- Build configuration

---

### 💡 Przykłady Kodu

**[10-examples.md](./10-examples.md)**

- Server Components (Daily View, Meal Plan)
- Client Components (Progress Bars, Meal Swap)
- Server Actions (Generate Meal Plan, Update Progress)
- Middleware (Auth, Onboarding Check)
- BMR/TDEE Calculator Examples
- Meal Matching Algorithm
- Shopping List Aggregation
- Gotowe snippety kodu

---

## 🚀 Jak Używać Tej Dokumentacji

### Dla Nowych Programistów

1. Zacznij od [02-development.md](./02-development.md) - setup projektu
2. Przeczytaj [01-architecture.md](./01-architecture.md) - zrozum strukturę
3. Zapoznaj się z [05-security.md](./05-security.md) - fundamenty bezpieczeństwa
4. Zobacz [10-examples.md](./10-examples.md) - praktyczne przykłady

### Podczas Developmentu

- **Tworzysz onboarding?** → [04-forms-validation.md](./04-forms-validation.md)
- **Implementujesz BMR calculator?** → [10-examples.md](./10-examples.md)
- **Zarządzasz stanem postępu?** → [03-state-management.md](./03-state-management.md)
- **Tworzysz migrację receptur?** → [06-database.md](./06-database.md)
- **Piszesz testy kalkulatora?** → [07-testing.md](./07-testing.md)
- **Optymalizujesz obrazy posiłków?** → [08-performance.md](./08-performance.md)

### Referencja Szybka

- **CLAUDE.md (root)** - zawsze najpierw sprawdź główny plik
- Używaj Ctrl+F / Cmd+F do wyszukiwania w plikach
- Wszystkie przykłady są gotowe do skopiowania

---

## 📊 Statystyki Dokumentacji

| Moduł               | Rozmiar         | Tematyka                   |
| ------------------- | --------------- | -------------------------- |
| 01-architecture     | ~300 linii      | Struktura, konfiguracja    |
| 02-development      | ~350 linii      | Setup, workflow            |
| 03-state-management | ~350 linii      | TanStack Query, Zustand    |
| 04-forms-validation | ~400 linii      | Formularze, Zod            |
| 05-security         | ~500 linii      | RLS, bezpieczeństwo        |
| 06-database         | ~450 linii      | Migracje, relacje          |
| 07-testing          | ~200 linii      | Vitest, Playwright         |
| 08-performance      | ~150 linii      | Optymalizacja              |
| 09-ci-cd            | ~100 linii      | GitHub Actions             |
| 10-examples         | ~300 linii      | Przykłady kodu             |
| **RAZEM**           | **~3100 linii** | **Kompletna dokumentacja** |

**Główny CLAUDE.md**: ~525 linii (zawiera Quick Reference + linki + MVP features)

---

## 🔄 Aktualizacja Dokumentacji

Dokumentacja jest **living document** - aktualizuj gdy:

1. Dodajesz nową funkcjonalność (np. nowe algorytmy meal matching)
2. Zmieniasz ważne wzorce (np. BMR formula)
3. Aktualizujesz zależności
4. Odkrywasz nowe best practices

### Zasady Aktualizacji

- **Przykłady**: Zawsze działające, aktualne
- **Konfiguracja**: Zsynchronizowana z rzeczywistymi plikami
- **Best Practices**: Weryfikowane przez zespół
- **Spójność**: Jednolity styl i struktura
- **Business Logic**: Szczegółowa dokumentacja wzorów (BMR, TDEE, macro ratios)

---

## 🎯 Kluczowe Obszary Aplikacji

### Onboarding Flow

- Multi-step form z walidacją
- BMR/TDEE calculation (Mifflin-St Jeor)
- Safety limits (min 1400/1600 kcal)
- Macro distribution (15/35/50%)

### Meal Planning

- 7-day rolling plan generation
- Meal swap algorithm (+/- 15% calories)
- Ingredient scaling (+/- 10%)
- Recipe database integration

### Progress Tracking

- Daily view with 3 meals
- 4 progress bars (calories, protein, carbs, fat)
- Mark as eaten functionality
- State persistence

### Shopping List

- 7-day ingredient aggregation
- Category grouping
- Check/uncheck functionality
- State persistence

---

## 💬 Feedback

Znalazłeś błąd? Masz sugestię? Utwórz issue lub PR!

---

**Happy Coding! 🥗**
