# 🔴 E2E Test Issues Report

**Data**: 2025-10-29
**Uruchomienie**: `npm run test:e2e:chromium`

---

## 🚨 PROBLEMY DO NAPRAWY

### Problem #1: Port 3000 Already Used ✅ NAPRAWIONE

**Error**: `http://localhost:3000 is already used`

**Przyczyna**: Playwright config miało `reuseExistingServer: false` - próbowało zabić istniejący dev server.

**Rozwiązanie**: ✅ Zmieniono na `reuseExistingServer: !process.env.CI` ([playwright.config.ts:69](../../../playwright.config.ts#L69))

- W development: używa istniejącego serwera
- W CI: restartuje serwer z .env.e2e

### Problem #2: Permission Denied for Schema Public ⚠️ WYMAGA NAPRAWY

### Error Message

```
❌ Failed to create profile: {
  code: '42501',
  details: null,
  hint: null,
  message: 'permission denied for schema public'
}
```

### Root Cause

**Supabase Test Database nie ma odpowiednich uprawnień dla tabeli `profiles`.**

Błąd PostgreSQL `42501` oznacza brak uprawnień do wykonania operacji INSERT na schemacie `public`.

---

## 📊 Wyniki Testów

### Passing Tests (✅)

- ✅ `should show error with invalid credentials` - walidacja działa
- ✅ `should show validation error for empty email` - walidacja formularza
- ✅ `should show validation error for empty password` - walidacja formularza
- ✅ `should navigate to registration form` - nawigacja tabs
- ✅ `should navigate to forgot password` - **UN-SKIPPED** - działa!
- ✅ `should successfully register new user` - rejestracja działa
- ✅ `should validate password confirmation match` - walidacja
- ✅ `should validate email format` - walidacja

**Status**: 8/14 testów auth PASSED (testy bez tworzenia profilu)

### Failing Tests (❌)

Wszystkie testy wymagające `authenticatedPage` fixture failują z powodu:

- ❌ Auth fixture nie może utworzyć profilu w DB
- ❌ Dashboard tests (wszystkie wymagają profilu)
- ❌ Onboarding tests (wszystkie nowe)
- ❌ Profile management tests (wszystkie nowe)
- ❌ Meal planning tests (wszystkie nowe)
- ❌ Recipes tests (wszystkie nowe)
- ❌ Shopping list tests (wszystkie nowe)

### Skipped Tests (-)

- `-` 4 testy w registration (już były skip)

---

## 🔧 ROZWIĄZANIE

### Krok 1: Sprawdź Uprawnienia w Supabase Dashboard

1. **Przejdź do**: Supabase Dashboard → Test Project → SQL Editor

2. **Wykonaj sprawdzenie uprawnień**:

```sql
-- Sprawdź kto może wstawić do profiles
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'profiles';
```

3. **Dodaj uprawnienia dla authenticated i service_role**:

```sql
-- Grant INSERT na profiles dla authenticated users
GRANT INSERT, UPDATE, DELETE, SELECT ON public.profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE, SELECT ON public.profiles TO service_role;

-- Grant INSERT na inne tabele używane w testach
GRANT INSERT, UPDATE, DELETE, SELECT ON public.planned_meals TO authenticated;
GRANT INSERT, UPDATE, DELETE, SELECT ON public.planned_meals TO service_role;

GRANT INSERT, UPDATE, DELETE, SELECT ON public.shopping_list TO authenticated;
GRANT INSERT, UPDATE, DELETE, SELECT ON public.shopping_list TO service_role;

-- Jeśli są sekwencje (sequences)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
```

### Krok 2: Sprawdź RLS (Row Level Security) Policies

```sql
-- Sprawdź czy RLS jest włączone
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'planned_meals', 'shopping_list');

-- Jeśli RLS jest ON, dodaj policy dla testów
-- Policy dla INSERT na profiles
CREATE POLICY "Allow service role to insert profiles"
ON public.profiles
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

### Krok 3: Zweryfikuj Connection String

Sprawdź czy w `.env.e2e` używasz:

```bash
# ✅ POPRAWNY - Transaction pooler (port 6543)
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Service role key (ma pełne uprawnienia)

# ❌ NIE UŻYWAJ ANON KEY do tworzenia profili w fixture
```

### Krok 4: Alternatywne Rozwiązanie - Użyj Supabase Auth Admin API

Jeśli polícy są zbyt restrykcyjne, możesz utworzyć profil przez REST API:

```typescript
// W fixtures/auth.ts, po utworzeniu użytkownika:
const { error: profileError } = await supabaseClient.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: {
    age: 30,
    gender: 'male',
    // ... inne dane profilu
  },
})
```

Lub użyj bezpośredniego SQL przez service role:

```typescript
// Bezpośredni SQL INSERT (bypassing RLS)
const { error } = await supabaseClient.rpc('create_test_profile', {
  user_id: authData.user.id,
  user_email: email,
  // ... params
})
```

---

## 🎯 OCZEKIWANY REZULTAT

Po naprawie uprawnień:

- ✅ Auth fixture utworzy profile pomyślnie
- ✅ `authenticatedPage` fixture zadziała
- ✅ ~60+ testów powinno przejść (dashboard, onboarding, profile, recipes, shopping)
- ✅ Pokrycie testowe: **~70-75%**

---

## 📋 Action Items

### Natychmiast (Do Zrobienia TERAZ)

1. [ ] Otwórz Supabase Dashboard → Test Project
2. [ ] SQL Editor → Wykonaj grant uprawnienia (Krok 1)
3. [ ] Sprawdź RLS policies (Krok 2)
4. [ ] Uruchom testy ponownie: `npm run test:e2e:chromium`

### Po Naprawie

1. [ ] Zweryfikuj że profile są tworzone (check logs)
2. [ ] Uruchom pełny test suite: `npm run test:e2e`
3. [ ] Zobacz raport HTML: `npm run test:e2e:report`
4. [ ] Update dokumentacji z sukcesem

---

## 💡 Dodatkowe Wskazówki

### Debug Auth Fixture

Jeśli nadal nie działa, dodaj więcej logów w `tests/e2e/fixtures/auth.ts`:

```typescript
console.log('🔍 DEBUG: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log(
  '🔍 DEBUG: Has service key:',
  !!process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Po próbie INSERT
if (profileError) {
  console.log('🔍 DEBUG: Full error:', JSON.stringify(profileError, null, 2))
}
```

### Zweryfikuj .env.e2e

```bash
# Sprawdź czy plik jest załadowany
cat .env.e2e | grep SUPABASE

# Powinno pokazać:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-TEST-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # <-- Ten klucz ma admin rights
```

### Test Ręczny (Supabase Dashboard)

1. Otwórz Table Editor → profiles
2. Spróbuj ręcznie dodać wiersz
3. Jeśli nie możesz - problem z uprawnieniami jest potwierdzony

---

## 📚 Referencje

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL GRANT](https://www.postgresql.org/docs/current/sql-grant.html)
- [tests/e2e/fixtures/auth.ts:89-107](../fixtures/auth.ts) - Profile creation code

---

## ✅ Success Criteria

Testy będą działać gdy zobaczysz:

```
✅ Created test user: test-xxx@lowcarbplaner.test (ID: xxx)
✅ Created test profile for: test-xxx@lowcarbplaner.test
✅ Profile verified in database (took XXXms)
```

Zamiast:

```
✅ Created test user: ...
❌ Failed to create profile: permission denied for schema public  <-- TEN BŁĄD
```

---

**Następny krok**: Napraw uprawnienia w Supabase i uruchom testy ponownie! 🚀
