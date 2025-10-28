# 🔍 Plan debugowania testów E2E

## ✅ Co już działa:

1. **Aplikacja używa TEST DB** ✅

   ```
   ✅ Test DB requests: 1
   ❌ Dev DB requests: 0
   ```

2. **Fixture tworzy użytkowników** ✅
   - Email: `test-<timestamp>@lowcarbplaner.test`
   - Hasło: `Test123!Pass`
   - Profil z pełnymi danymi

3. **Konfiguracja środowiska** ✅
   - `playwright.config.ts` używa `dotenv-cli -e .env.e2e`
   - `reuseExistingServer: false` - zawsze świeży serwer

## ❌ Problem:

**Logowanie nie działa** - strona przekierowuje na `/auth?email=...&password=...` zamiast `/dashboard` lub `/onboarding`

### Możliwe przyczyny:

1. **Użytkownik nie jest tworzony w bazie** (mało prawdopodobne - fixture się wykonuje)
2. **Email nie jest potwierdzony** (fixture ustawia `email_confirm: true`)
3. **Profil nie jest tworzony poprawnie** (enum może być błędny)
4. **RLS blokuje dostęp** (wyłączony wcześniej)
5. **Supabase Auth ma opóźnienie** (użytkownik jest tworzony, ale nie jest natychmiast dostępny)

## 📋 Kroki do wykonania PRZEZ UŻYTKOWNIKA:

### Krok 1: Sprawdź użytkowników w Supabase Dashboard

1. Idź do https://supabase.com/dashboard
2. Wybierz projekt testowy (mmdjbjbuxivvpvgsvsfj)
3. Authentication → Users
4. Sprawdź czy są użytkownicy `test-*@lowcarbplaner.test`
5. Sprawdź kolumnę "Email Confirmed" - czy jest zaznaczona?

### Krok 2: Sprawdź profile w bazie danych

1. W Supabase Dashboard → SQL Editor
2. Wykonaj:

   ```sql
   SELECT
     p.id,
     p.email,
     p.disclaimer_accepted_at,
     p.created_at,
     u.email_confirmed_at
   FROM profiles p
   LEFT JOIN auth.users u ON u.id = p.id
   WHERE p.email LIKE 'test-%@lowcarbplaner.test'
   ORDER BY p.created_at DESC
   LIMIT 5;
   ```

3. Sprawdź czy:
   - Profile istnieją ✓
   - `disclaimer_accepted_at` jest wypełnione ✓
   - `email_confirmed_at` jest wypełnione ✓

### Krok 3: Sprawdź logi Supabase Auth

1. W Supabase Dashboard → Logs → Auth
2. Filtruj po email `test-*@lowcarbplaner.test`
3. Sprawdź błędy logowania (jeśli są)

### Krok 4: Uruchom test w Playwright UI z otwartą konsolą

1. Otwórz Playwright UI:

   ```powershell
   .\run-e2e-tests.bat ui
   ```

2. Uruchom test "should successfully login"

3. **W zakładce "Console"** sprawdź czy są błędy JavaScript

4. **W zakładce "Network"** sprawdź:
   - Request do `/auth/v1/token?grant_type=password`
   - Jaki status code? (200, 400, 401?)
   - Jaka odpowiedź? (success czy error?)

## 🔧 Możliwe rozwiązania (do wykonania po weryfikacji):

### Jeśli użytkownicy NIE są tworz

oni:

- [ ] Sprawdź czy `SUPABASE_SERVICE_ROLE_KEY` w `.env.e2e` jest poprawny
- [ ] Sprawdź uprawnienia service_role w Supabase

### Jeśli użytkownicy SĄ utworzeni, ale logowanie nie działa:

- [ ] Dodaj opóźnienie po utworzeniu użytkownika (await page.waitForTimeout(2000))
- [ ] Sprawdź czy RLS jest faktycznie wyłączony dla `profiles`
- [ ] Sprawdź czy jest trigger który może blokować dostęp

### Jeśli email nie jest potwierdzony:

- [ ] Sprawdź czy `email_confirm: true` jest faktycznie ustawione
- [ ] Sprawdź Supabase Settings → Authentication → Email confirmation

## 📸 Wyślij te informacje:

Po wykonaniu kroków wyślij mi:

1. Screenshot z Authentication → Users (z 2-3 użytkownikami testowymi)
2. Wynik SQL query z Kroku 2
3. Screenshot z Playwright UI → Network → request do `/auth/v1/token`
4. Screenshot z Playwright UI → Console (jeśli są błędy)

## 🎯 Następny krok:

**Proszę wykonaj Krok 1-4 i wyślij wyniki. Na ich podstawie zdiagn ozuję dokładny problem.**
