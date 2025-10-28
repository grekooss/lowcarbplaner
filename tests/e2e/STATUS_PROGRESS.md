# 📊 Status testów E2E - Postęp

## ✅ Co działa:

1. **Środowisko testowe** ✅
   - Aplikacja używa TEST DB (mmdjbjbuxivvpvgsvsfj)
   - `dotenv-cli` ładuje `.env.e2e` poprawnie
   - Fixture tworzy użytkownika + profil

2. **Testy walidacji** ✅ (2/7 = 29%)
   - ✅ Test #3: show validation error for empty email
   - ✅ Test #4: show validation error for empty password

## ❌ Co NIE działa:

### Problem główny: **Logowanie nie przekierowuje poprawnie**

**Symptom**: Po wypełnieniu formularza logowania i kliknięciu "Zaloguj się", strona pozostaje na `/auth` z parametrami w URL:

```
/auth?email=test-...@lowcarbplaner.test&password=Test123%21Pass
```

**Testy które nie przechodzą** (5/7 = 71%):

- ❌ Test #1: should successfully login with valid credentials
- ❌ Test #2: should show error with invalid credentials
- ❌ Test #5: should navigate to registration form
- ❌ Test #6: should navigate to forgot password
- ❌ Test #7: should persist session after page reload

## 🔍 Możliwe przyczyny:

### 1. **Race condition** (NAJBARDZIEJ PRAWDOPODOBNE)

- Profil jest tworzony asynchronicznie
- Logowanie próbuje się zanim profil jest w pełni dostępny w bazie
- Dodano już `await new Promise(resolve => setTimeout(resolve, 500))` ale to może nie wystarczać

### 2. **Supabase Auth błąd**

- Email może nie być faktycznie potwierdzony mimo `email_confirm: true`
- Może być problem z politykami Auth w bazie testowej
- Hasło może nie być poprawnie zapisane

### 3. **Formularz submission**

- Może być problem z tym jak formularz jest submitowany
- JavaScript może mieć błąd który nie jest widoczny w testach

## 📋 Następne kroki do debugowania:

### Krok 1: Sprawdź Network tab w Playwright UI

1. Otwórz Playwright UI: `.\run-e2e-tests.bat ui`
2. Uruchom test "should successfully login"
3. W zakładce "Network" znajdź request do `/auth/v1/token?grant_type=password`
4. Sprawdź:
   - **Status code**: 200 (sukces) czy 400/401 (błąd)?
   - **Response body**: Co zwraca Supabase?

### Krok 2: Sprawdź Console w Playwright UI

1. W Playwright UI → zakładka "Console"
2. Uruchom test
3. Sprawdź czy są błędy JavaScript

### Krok 3: Zwiększ opóźnienie po utworzeniu profilu

Jeśli race condition, zwiększ timeout w `tests/e2e/fixtures/auth.ts:115`:

```typescript
await new Promise((resolve) => setTimeout(resolve, 2000)) // Zwiększ z 500ms do 2s
```

### Krok 4: Sprawdź czy profil faktycznie istnieje

W Supabase Dashboard SQL Editor:

```sql
SELECT * FROM profiles
WHERE email = 'test-1761673085778@lowcarbplaner.test';
```

Sprawdź czy:

- Profil istnieje ✓
- Ma wszystkie wymagane pola ✓
- `disclaimer_accepted_at` jest wypełnione ✓

### Krok 5: Sprawdź Supabase Auth Logs

1. Supabase Dashboard → Logs → Auth
2. Filtruj po email testowym
3. Szukaj błędów typu:
   - "Invalid login credentials"
   - "Email not confirmed"
   - "User not found"

## 🎯 Priorytet #1:

**Sprawdź Network tab** aby zobaczyć **dokładną odpowiedź** od Supabase Auth podczas logowania.

To pokaże czy:

- ✅ Logowanie się udaje (status 200) ale przekierowanie nie działa
- ❌ Logowanie się nie udaje (status 400/401) - błąd credentials

---

**Proszę wykonaj Krok 1 (Network tab) i pokaż mi:**

1. Status code requestu do Supabase Auth
2. Response body (jeśli jest błąd)
3. Screenshot zakładki Network z tym requestem
