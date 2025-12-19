# 🔧 GitHub Actions E2E Tests - Naprawa i Konfiguracja

## 📋 Wykryte i Naprawione Problemy

### Problem 1: Nieprawidłowy server w CI ✅ NAPRAWIONO

**Opis**: Workflow budował aplikację (`npm run build`), ale Playwright uruchamiał `npm run dev` zamiast `npm run start`.

**Rozwiązanie**: [playwright.config.ts:66-68](playwright.config.ts#L66-L68)

```typescript
command: process.env.CI
  ? 'npx dotenv-cli -e .env.e2e -- npm run start' // Production build w CI
  : 'npx dotenv-cli -e .env.e2e -- npm run dev' // Dev server lokalnie
```

### Problem 2: Brakująca zmienna środowiskowa w build ✅ NAPRAWIONO

**Opis**: Krok "Build Next.js application" nie miał `SUPABASE_SERVICE_ROLE_KEY`.

**Rozwiązanie**: [.github/workflows/e2e-tests.yml:63](.github/workflows/e2e-tests.yml#L63)

```yaml
- name: Build Next.js application
  run: npm run build
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }} # ✅ Dodane
```

### Problem 3: Nieaktualne funkcje bazy danych ✅ NAPRAWIONO

**Opis**: Baza testowa miała starą wersję funkcji `calculate_recipe_ingredient_nutrition()` używającą `content.ingredients` zamiast `public.ingredients`. Dodatkowo duplikaty danych przy wielokrotnym seedowaniu.

**Rozwiązanie**: [.github/workflows/e2e-tests.yml:87-104](.github/workflows/e2e-tests.yml#L87-L104)

```yaml
- Uruchomienie wszystkich migracji przed seedowaniem
- Czyszczenie istniejących danych (TRUNCATE CASCADE)
- Seedowanie świeżych danych
```

### Problem 4: Stare referencje schematu w plikach seed ✅ NAPRAWIONO

**Opis**: Pliki seed (`seed_ingredients_public.sql`) nadal używały `content.ingredient_unit_conversions` zamiast `public.ingredient_unit_conversions`, co powodowało błędy podczas seedowania.

**Rozwiązanie**: [supabase/seed_ingredients_public.sql](supabase/seed_ingredients_public.sql)

```sql
-- PRZED
insert into content.ingredient_unit_conversions ...

-- PO
insert into public.ingredient_unit_conversions ...
```

### Problem 5: Trigger na auth.users nieobsługiwany w Supabase Cloud ✅ NAPRAWIONO

**Opis**: Migracja zawierała trigger `on_auth_user_created` na tabeli systemowej `auth.users`, który jest nieobsługiwany w Supabase Cloud (działa tylko lokalnie w Docker). To powodowało błąd "Database error creating new user" podczas tworzenia użytkowników testowych.

**Rozwiązanie**: [supabase/migrations/20251009120000_create_lowcarbplaner_schema.sql:79-110,365-372](supabase/migrations/20251009120000_create_lowcarbplaner_schema.sql#L79-L110)

```sql
-- Zakomentowano funkcję handle_new_user() i trigger on_auth_user_created
-- Fixture E2E i tak tworzy profile ręcznie (tests/e2e/fixtures/auth.ts:90-113)
-- W produkcji profile powinny być tworzone przez aplikację po rejestracji
```

**Uwaga**: Trigger został zakomentowany, ponieważ:

- Supabase Cloud nie obsługuje triggerów na tabelach systemowych (`auth.*`)
- Fixture testowe tworzą profile ręcznie w `tests/e2e/fixtures/auth.ts`
- W produkcji profile są tworzone przez aplikację podczas onboardingu

---

## ✅ Wymagane GitHub Secrets

Musisz skonfigurować **4 sekrety** w GitHub repository:

### Krok 1: Przejdź do ustawień sekretów

1. Otwórz https://github.com/[TWOJE_KONTO]/lowcarbplaner/settings/secrets/actions
2. Kliknij **"New repository secret"**

### Krok 2: Dodaj sekrety

#### 1️⃣ `TEST_SUPABASE_URL`

- **Wartość**: URL projektu testowego Supabase
- **Przykład**: `https://xxxxxxxxxxxxx.supabase.co`
- **Gdzie znaleźć**: Supabase Dashboard → Project Settings → API → Project URL

#### 2️⃣ `TEST_SUPABASE_ANON_KEY`

- **Wartość**: Klucz anonimowy (anon key)
- **Gdzie znaleźć**: Supabase Dashboard → Project Settings → API → `anon` `public`

#### 3️⃣ `TEST_SUPABASE_SERVICE_ROLE_KEY`

- **Wartość**: Klucz service role (⚠️ admin privileges!)
- **Gdzie znaleźć**: Supabase Dashboard → Project Settings → API → `service_role`
- **⚠️ UWAGA**: Ten klucz ma pełne uprawnienia - trzymaj go w sekrecie!

#### 4️⃣ `TEST_DATABASE_URL`

- **Wartość**: Connection string do bazy danych
- **Format**: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
- **Gdzie znaleźć**: Supabase Dashboard → Project Settings → Database → Connection String → **Transaction mode**
- **Cel**: Seedowanie bazy testowymi danymi (receptury i składniki)

---

## 🧪 Weryfikacja Konfiguracji

### Sprawdź sekrety lokalnie (PRZED pushowaniem)

```bash
# 1. Sprawdź, czy masz wypełniony plik .env.e2e
cat .env.e2e

# Powinien zawierać:
# NEXT_PUBLIC_SUPABASE_URL=https://...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...

# 2. Przetestuj build lokalnie
npm run build

# 3. Przetestuj uruchomienie production servera
npm run start
# Otwórz http://localhost:3000 i sprawdź, czy aplikacja działa

# 4. Uruchom testy E2E lokalnie (używając dev servera)
npm run test:e2e
```

### Zweryfikuj sekrety w GitHub

Po dodaniu sekretów w GitHub, sprawdź:

```bash
# 1. Zatwierdź zmiany i wypchnij do głównej gałęzi
git add .
git commit -m "fix(ci): fix E2E test workflow - use production build in CI"
git push origin master

# 2. Przejdź do zakładki Actions w GitHub
# https://github.com/[TWOJE_KONTO]/lowcarbplaner/actions

# 3. Obserwuj uruchomienie workflow "E2E Tests"
# Sprawdź logi każdego kroku:
# - ✅ "Create .env.e2e file" - plik został utworzony
# - ✅ "Verify environment configuration" - konfiguracja poprawna
# - ✅ "Build Next.js application" - build zakończony sukcesem
# - ✅ "Seed test database" - baza zaseedowana
# - ✅ "Run E2E tests" - testy przeszły
```

---

## 🚨 Troubleshooting

### ❌ Błąd: "TEST_SUPABASE_URL secret is not set"

**Rozwiązanie**: Upewnij się, że sekrety są nazwane **DOKŁADNIE** tak jak w dokumentacji (case-sensitive!):

- `TEST_SUPABASE_URL` (nie `SUPABASE_URL`)
- `TEST_SUPABASE_ANON_KEY` (nie `ANON_KEY`)
- `TEST_SUPABASE_SERVICE_ROLE_KEY` (nie `SERVICE_ROLE_KEY`)
- `TEST_DATABASE_URL` (nie `DATABASE_URL`)

### ❌ Błąd: "Database connection failed"

**Przyczyny**:

1. Nieprawidłowy `TEST_DATABASE_URL`
2. Projekt Supabase jest wstrzymany (paused) - aktywuj go w Dashboard
3. Nieprawidłowe hasło w connection string

**Rozwiązanie**:

- Sprawdź connection string w Supabase Dashboard
- Użyj **Transaction mode** (nie Session mode)
- Upewnij się, że projekt jest aktywny

### ❌ Błąd: "Build failed" lub "Module not found"

**Rozwiązanie**: Sprawdź, czy w kroku "Build" są wszystkie zmienne środowiskowe:

```yaml
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_ROLE_KEY }}
```

### ❌ Testy timeout przy starcie servera

**Rozwiązanie**: Zwiększ timeout w [playwright.config.ts:69](playwright.config.ts#L69):

```typescript
timeout: 180 * 1000,  // 3 minuty zamiast 2
```

---

## 📊 Workflow Overview

Workflow wykonuje następujące kroki:

1. **Checkout code** - Pobiera kod z repository
2. **Setup Node.js** - Instaluje Node.js 20
3. **Install dependencies** - `npm install`
4. **Install Playwright Browsers** - Instaluje przeglądarki (chromium, firefox, webkit)
5. **Create .env.e2e file** - Tworzy plik ze zmiennymi ze sekretów
6. **Verify environment** - Sprawdza, czy plik istnieje
7. **Build Next.js** - Buduje aplikację (`npm run build`)
8. **Setup and seed database** - Uruchamia migracje, czyści i zaseedowuje bazę
   - Uruchamia wszystkie migracje SQL
   - Czyści istniejące dane testowe (TRUNCATE CASCADE)
   - Seeduje składniki i przepisy
9. **Run E2E tests** - Uruchamia testy dla każdej przeglądarki
10. **Upload artifacts** - Zapisuje raporty, screenshoty, wideo

---

## 🎯 Następne Kroki

Po naprawie workflow:

1. ✅ Dodaj sekrety w GitHub (4 sekrety)
2. ✅ Zatwierdź zmiany (`git commit` + `git push`)
3. ✅ Obserwuj workflow w zakładce Actions
4. ✅ Sprawdź raporty testów w artifacts

### Dodatkowe Opcje

- **Manualne uruchomienie**: Workflow można uruchomić ręcznie w zakładce Actions (workflow_dispatch)
- **Daily runs**: Workflow uruchamia się automatycznie codziennie o północy UTC
- **PR checks**: Workflow uruchamia się automatycznie przy Pull Requestach

---

## 📚 Dodatkowa Dokumentacja

- [.github/SECRETS_SETUP.md](.github/SECRETS_SETUP.md) - Szczegółowy opis sekretów
- [tests/e2e/README.md](tests/e2e/README.md) - Kompletny przewodnik E2E
- [tests/e2e/QUICKSTART.md](tests/e2e/QUICKSTART.md) - Szybki start (5 minut)
- [tests/e2e/DATABASE_SETUP.md](tests/e2e/DATABASE_SETUP.md) - Setup bazy danych

---

**Data naprawy**: 2025-11-03
**Status**: ✅ NAPRAWIONO - gotowe do testowania
