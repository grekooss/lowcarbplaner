# Kontekst Projektu - LowCarbPlaner

## Szybkie Odniesienie

**Nazwa Projektu:** LowCarbPlaner
**Wersja:** 0.1.0 (Rozwój MVP)
**Główny Cel:** Automatyczne planowanie posiłków dla użytkowników diety niskowęglowodanowej
**Platforma Docelowa:** Web (PWA), Przyszłość: Mobile
**Status:** Aktywny Rozwój MVP (94.2% wskaźnik zaliczonych testów)

---

## Przegląd Architektury Rdzeniowej

### Fundament Technologiczny

```yaml
Framework: Next.js 15+ (App Router, React Server Components)
Backend: Supabase (PostgreSQL + Auth + Edge Functions)
UI: Tailwind CSS v4 + shadcn/ui
Zarządzanie Stanem:
  - Stan Serwera: TanStack Query v5
  - Stan Klienta: Zustand v5
Formularze: React Hook Form + Zod v4
Testowanie:
  - Unit/Integration: Vitest v2
  - E2E: Playwright v1.56+
Deployment: Cloudflare Pages
CI/CD: GitHub Actions
```

### Kluczowe Katalogi

```
lowcarbplaner/
├── .ai/                    # Dokumentacja projektu (planowanie, PRD, specyfikacje)
├── src/
│   ├── app/                # Strony Next.js App Router
│   ├── components/         # Komponenty React (zorganizowane według domeny)
│   ├── lib/                # Podstawowe narzędzia i konfiguracje
│   │   ├── actions/        # Server Actions
│   │   ├── algorithms/     # Generator planu posiłków, kalkulator makro
│   │   ├── api/            # Wrappery klienta API
│   │   ├── auth/           # Narzędzia uwierzytelniania
│   │   ├── constants/      # Stałe globalne
│   │   ├── hooks/          # Niestandardowe hooki React
│   │   ├── stores/         # Sklepy Zustand
│   │   ├── supabase/       # Konfiguracje klienta Supabase
│   │   ├── types/          # Definicje typów TypeScript
│   │   ├── utils/          # Funkcje pomocnicze
│   │   └── validations/    # Schematy Zod
│   └── tests/              # Pliki testowe (odzwierciedla strukturę src)
├── scripts/                # Skrypty zarządzania bazą danych
├── supabase/               # Migracje i funkcje Supabase
└── tests/                  # Konfiguracja testów i testy E2E
    └── e2e/                # Testy E2E Playwright
```

---

## Model Domeny

### Encje Rdzeniowe

#### Profil Użytkownika

```typescript
{
  id: uuid(PK)
  email: string
  created_at: timestamp

  // Dane profilowe
  gender: 'male' | 'female'
  age: number(lata)
  weight: number(kg)
  height: number(cm)
  activity_level: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'

  // Cele
  goal: 'weight_loss' | 'weight_maintenance'
  weight_loss_rate: 0.25 | 0.5 | 0.75 | 1.0(kg / tydzień)

  // Cele wyliczone
  bmr: number(kcal) // Podstawowa Przemiana Materii
  tdee: number(kcal) // Całkowita Dzienna Przemiana Energii
  daily_calories: number
  daily_protein: number(g)
  daily_carbs: number(g)
  daily_fats: number(g)

  // Flagi
  onboarding_completed: boolean
  disclaimer_accepted: boolean
}
```

#### Składnik

```typescript
{
  id: uuid(PK)
  name: string
  category: 'dairy' | 'meat' | 'vegetables' | 'fats' | 'spices'

  // Wartości odżywcze (na 100g)
  calories: number
  protein: number(g)
  carbs: number(g)
  fats: number(g)

  // Właściwości skalowania
  is_scalable: boolean // true dla mięsa, olejów; false dla jajek, plastrów sera
  min_amount: number(g)
  max_amount: number(g)
  step_size: number(g)
}
```

#### Przepis

```typescript
{
  id: uuid (PK)
  name: string
  meal_type: 'breakfast' | 'lunch' | 'dinner'
  image_url: string
  instructions: string[] // Instrukcje przygotowania krok po kroku

  // Relacje
  recipe_ingredients: RecipeIngredient[]

  // Wyliczone (zagregowane ze składników)
  base_calories: number
  base_protein: number (g)
  base_carbs: number (g)
  base_fats: number (g)
}
```

#### Zaplanowany Posiłek

```typescript
{
  id: uuid (PK)
  user_id: uuid (FK -> users)
  recipe_id: uuid (FK -> recipes)
  date: date
  meal_type: 'breakfast' | 'lunch' | 'dinner'

  // Przeskalowane wartości dla tego konkretnego posiłku
  scaling_factor: number // np. 1.2 oznacza 120% przepisu bazowego

  // Wyliczone wartości odżywcze (po skalowaniu)
  calories: number
  protein: number (g)
  carbs: number (g)
  fats: number (g)

  // Interakcja użytkownika
  is_consumed: boolean
  consumed_at: timestamp

  // Zmodyfikowane składniki (dostosowania użytkownika)
  ingredient_modifications: IngredientModification[]
}
```

---

## Kluczowe Algorytmy

### 1. Generator Planu Posiłków

**Cel:** Wygenerować 7-dniowy plan posiłków odpowiadający dziennym celom makro użytkownika

**Przepływ Algorytmu:**

```
1. Oblicz cele dzienne z profilu użytkownika (TDEE - deficyt)
2. Dla każdego dnia (7 dni):
   a. Dla każdego typu posiłku (śniadanie, obiad, kolacja):
      - Pobierz przepisy kandydujące z bazy danych
      - Filtruj według meal_type i unikaj duplikatów w ciągu 7 dni
      - Oblicz współczynnik skalowania dla dopasowania do 1/3 dziennych kalorii
      - Zwaliduj rozkład makro (15%W / 35%B / 50%T ± 5%)
      - Wybierz najlepiej pasujący przepis
   b. Zwaliduj całkowite dzienne makro w tolerancji ±5%
   c. W przypadku niepowodzenia walidacji, powtórz z innymi kombinacjami przepisów
3. Utrwal zaplanowane posiłki w bazie danych
4. Zwróć status sukcesu/niepowodzenia
```

**Kluczowe Ograniczenia:**

- Ten sam przepis maksymalnie raz na 7 dni
- Tolerancja ±5% dla dziennego celu kalorycznego
- Proporcje makro: 15% Węglowodanów, 35% Białka, 50% Tłuszczów
- Skaluj tylko składniki "skalowalne" (zachowaj stałe pozycje jak jajka)

### 2. Kalkulator Makro (Mifflin-St Jeor)

**Obliczanie PPM:**

```typescript
// Mężczyźni: PPM = 10 * waga(kg) + 6.25 * wzrost(cm) - 5 * wiek(lata) + 5
// Kobiety: PPM = 10 * waga(kg) + 6.25 * wzrost(cm) - 5 * wiek(lata) - 161

const bmr =
  gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161
```

**Obliczanie TDEE:**

```typescript
const PAL_MULTIPLIERS = {
  very_low: 1.2, // Niewielki lub brak ćwiczeń
  low: 1.375, // Lekkie ćwiczenia 1-3 dni/tydzień
  moderate: 1.55, // Umiarkowane ćwiczenia 3-5 dni/tydzień
  high: 1.725, // Ciężkie ćwiczenia 6-7 dni/tydzień
  very_high: 1.9, // Bardzo ciężkie ćwiczenia, praca fizyczna
}

const tdee = bmr * PAL_MULTIPLIERS[activityLevel]
```

**Dzienny Cel Kaloryczny:**

```typescript
const calorieDeficit = (weightLossRate * 7700) / 7 // kcal/dzień
const dailyCalories = tdee - (goal === 'weight_loss' ? calorieDeficit : 0)

// Ograniczenia bezpieczeństwa
const minCalories = gender === 'male' ? 1600 : 1400
const finalCalories = Math.max(dailyCalories, minCalories)
```

**Rozkład Makro:**

```typescript
const macros = {
  carbs: (finalCalories * 0.15) / 4, // 15% kalorii, 4 kcal/g
  protein: (finalCalories * 0.35) / 4, // 35% kalorii, 4 kcal/g
  fats: (finalCalories * 0.5) / 9, // 50% kalorii, 9 kcal/g
}
```

---

## Przepływy Użytkownika

### Podstawowy Przepływ: Podróż Nowego Użytkownika

```
1. Strona Główna
   └─> Rejestracja (Email/Hasło lub Google OAuth)
       └─> Onboarding Krok 1: Płeć
           └─> Onboarding Krok 2: Wiek i Antropometria
               └─> Onboarding Krok 3: Poziom Aktywności
                   └─> Onboarding Krok 4: Cel i Tempo Utraty Wagi
                       └─> Podsumowanie Celu (wyliczone makro)
                           └─> Akceptacja Disclaimera
                               └─> [W Tle] Generowanie Planu Posiłków
                                   └─> Dashboard (Widok Dzisiaj)
```

### Codzienny Przepływ Użytkownika

```
Dashboard (Widok Dzisiaj)
├─> Oznacz posiłek jako zjedzony → Aktualizuj paski postępu
├─> Kliknij posiłek → Widok Szczegółów Przepisu
│   ├─> Zobacz składniki i instrukcje
│   ├─> Modyfikuj ilości składników skalowalnych (tylko dzisiaj)
│   └─> Zamień posiłek → Przeglądaj alternatywy
├─> Nawiguj do Listy Zakupów
│   └─> Odznaczaj kupione produkty
└─> Nawiguj do Ustawień Profilu
    ├─> Aktualizuj wagę/poziom aktywności → Wygeneruj plan ponownie
    └─> Zresetuj plan → Wróć do Onboardingu
```

---

## Wzorce Dostępu do Danych

### Polityki Row Level Security (RLS)

**Tabela Users:**

```sql
-- Użytkownicy mogą tylko odczytywać/aktualizować swój własny profil
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

**Tabela Planned Meals:**

```sql
-- Użytkownicy mogą tylko uzyskać dostęp do swoich własnych planów posiłków
CREATE POLICY "Users can view own meals"
  ON planned_meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can modify own meals"
  ON planned_meals FOR ALL
  USING (auth.uid() = user_id);
```

**Przepisy i Składniki:**

```sql
-- Publiczny dostęp odczytu (brak insert/update/delete dla użytkowników)
CREATE POLICY "Anyone can view recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (true);
```

### Typowe Zapytania

**Pobierz Dzisiejsze Posiłki:**

```typescript
const { data: meals } = await supabase
  .from('planned_meals')
  .select(
    `
    *,
    recipe:recipes (
      id,
      name,
      image_url,
      meal_type,
      recipe_ingredients (
        amount,
        ingredient:ingredients (*)
      )
    )
  `
  )
  .eq('user_id', userId)
  .eq('date', today)
  .order('meal_type')
```

**Pobierz Listę Zakupów (Następne 6 Dni):**

```typescript
const startDate = tomorrow
const endDate = addDays(tomorrow, 5)

const { data: meals } = await supabase
  .from('planned_meals')
  .select(
    `
    recipe:recipes (
      recipe_ingredients (
        amount,
        ingredient:ingredients (name, category)
      )
    )
  `
  )
  .eq('user_id', userId)
  .gte('date', startDate)
  .lte('date', endDate)

// Zagreguj składniki według nazwy
const shoppingList = aggregateIngredients(meals)
```

---

## Strategia Zarządzania Stanem

### Stan Serwera (TanStack Query)

```typescript
// Zarządzany przez React Query dla danych zsynchronizowanych z serwerem
- Dane profilu użytkownika
- Plany posiłków (bieżący tydzień)
- Przepisy (cache dla offline)
- Lista zakupów (pochodna planów posiłków)
- Postęp użytkownika (zjedzone posiłki)
```

### Stan Klienta (Zustand)

```typescript
// Lekki stan lokalny dla spraw UI
- Stan autoryzacji (bieżąca sesja użytkownika)
- Preferencja motywu (tryb jasny/ciemny)
- Otwarcie/zamknięcie menu mobilnego
- Aktywna data w nawigacji kalendarza
- Stan formularza dla wieloetapowego onboardingu
```

### Local Storage / IndexedDB

```typescript
// Persystencja danych offline-first
- Cache planów posiłków (7 dni)
- Cache przepisów ze zdjęciami
- Stan listy zakupów (odznaczone pozycje)
- Postęp onboardingu (możliwość wznowienia)
```

---

## Cele Wydajności

### Web Vitals (Lighthouse)

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **Wynik Wydajności:** ≥ 90

### Rozmiar Bundla

- Początkowy bundle JS: < 100KB (gzip)
- Całkowita waga strony: < 500KB (bez obrazów)
- Obrazy: Format WebP, ładowanie opóźnione, responsywne srcsets

### Czasy Odpowiedzi API

- Uwierzytelnianie: < 500ms
- Generowanie planu posiłków: < 15s (z stanem ładowania)
- Pobieranie danych (cache): < 100ms
- Mutacje danych: < 300ms

---

## Aspekty Bezpieczeństwa

### Uwierzytelnianie

- Supabase Auth z tokenami JWT
- Ciasteczka HTTP-only dla zarządzania sesją
- Integracja Google OAuth (opcjonalna)
- Reset hasła przez link magiczny email

### Autoryzacja

- Row Level Security (RLS) wymuszane na poziomie bazy danych
- Walidacja po stronie serwera wszystkich mutacji
- Brak bezpośredniego dostępu do bazy danych z klienta

### Walidacja Danych

- Schematy Zod dla wszystkich danych wejściowych użytkownika
- Ponowna walidacja po stronie serwera danych formularzy
- Ochrona przed SQL injection przez sparametryzowane zapytania

### Prywatność

- Brak analityki stron trzecich w MVP
- Dane użytkowników przechowywane w UE (region Supabase)
- Usuwanie danych zgodnie z GDPR po usunięciu konta

---

## Podsumowanie Strategii Testowania

### Testy Jednostkowe (Vitest)

- Poprawność algorytmów (generator posiłków, kalkulator makro)
- Funkcje pomocnicze (pomocniki dat, formatowanie)
- Niestandardowe hooki React
- Walidacje schematów Zod

### Testy Integracyjne (Vitest + React Testing Library)

- Zachowanie komponentów z zamockowanym API
- Przepływy przesyłania formularzy
- Logika zarządzania stanem
- Wrappery klienta API

### Testy E2E (Playwright)

- Kompletne podróże użytkownika (rejestracja → generowanie planu → dashboard)
- Zgodność międzyprzeglądarkowa (Chrome, Firefox, Safari)
- Testowanie widoku mobilnego
- Krytyczne przepływy użytkownika (zamiana posiłku, edycja składników, lista zakupów)

**Aktualny Status:** 94.2% wskaźnik zaliczonych (114/121 testów)

---

## Pipeline Deployment

### Przepływ CI/CD (GitHub Actions + Cloudflare Pages)

```
1. Push do gałęzi main
   └─> Uruchom workflow GitHub Actions
       ├─> Zainstaluj zależności
       ├─> Uruchom sprawdzanie typów (tsc --noEmit)
       ├─> Uruchom linting (eslint)
       ├─> Uruchom testy jednostkowe (vitest)
       ├─> Uruchom testy E2E (playwright)
       └─> Zbuduj aplikację Next.js (next build)
           └─> Wdroż na Cloudflare Pages
               ├─> Deployment podglądu (gałęzie PR)
               └─> Deployment produkcyjny (gałąź main)
```

### Środowiska

- **Development:** Lokalne (`localhost:3000`)
- **Staging:** Deployments podglądu Cloudflare Pages
- **Production:** `lowcarbplaner.pages.dev` (lub domena niestandardowa)

---

## Znane Ograniczenia (Zakres MVP)

### Funkcje Intencjonalnie Wykluczone

1. **Ręczne logowanie jedzenia** - Użytkownicy nie mogą dodawać niestandardowych posiłków lub składników
2. **Niestandardowe proporcje makro** - Stałe na 15%W / 35%B / 50%T
3. **Ograniczenia dietetyczne** - Brak wsparcia dla alergii, wegetarianizmu itp.
4. **Dane historyczne** - Brak długoterminowego śledzenia lub analityki
5. **Funkcje społecznościowe** - Brak udostępniania, społeczności lub gamifikacji
6. **Integracja sprzętowa** - Brak synchronizacji ze smartwatchami lub aplikacjami zdrowotnymi
7. **Monetyzacja** - Całkowicie darmowe w fazie MVP

### Elementy Długu Technicznego

- Optymalizacja wydajności generowania planu posiłków (cel < 15s)
- Ulepszona obsługa błędów dla przypadków brzegowych
- Ulepszone rozwiązywanie konfliktów synchronizacji offline
- Zaawansowane strategie cachowania obrazów przepisów
- Optymalizacja zapytań bazy danych dla dużych baz użytkowników

---

## Kontakt i Zasoby

**Indeks Dokumentacji:**

- [00-next-starting-package.md](./00%20next-starting-package.md) - Przewodnik konfiguracji Next.js
- [04-PRD.md](./04%20PRD.md) - Dokument Wymagań Produktu
- [05-TECH-STACK.md](./05%20TECH-STACK.md) - Przegląd stosu technologicznego
- [09-DB-PLAN.md](./09%20DB-PLAN.md) - Projekt schematu bazy danych
- [10-API-PLAN.md](./10%20API-PLAN.md) - Architektura API
- [13-UI-PLAN.md](./13%20UI-PLAN.md) - Specyfikacje UI/UX

**Linki Zewnętrzne:**

- Repozytorium: `https://github.com/your-username/lowcarbplaner`
- Dashboard Supabase: `https://app.supabase.com/project/YOUR_PROJECT_ID`
- Cloudflare Pages: `https://dash.cloudflare.com/`

---

**Ostatnia Aktualizacja:** 2025-10-30
**Utrzymywane przez:** Zespół Deweloperski
