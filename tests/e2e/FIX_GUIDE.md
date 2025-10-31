# 🔧 E2E Tests - Quick Fix Guide

**Cel**: Naprawić testy E2E aby działały z Supabase Cloud

---

## ✅ Problem #1: Port 3000 Already Used - NAPRAWIONE

**Fix**: Zmieniono `playwright.config.ts` na `reuseExistingServer: !process.env.CI`

Teraz Playwright używa istniejącego dev servera zamiast próbować go restartować.

---

## ⚠️ Problem #2: Permission Denied - WYMAGA TWOJEJ AKCJI

### Szybka Diagnoza

Testy failują z:

```
❌ Failed to create profile: permission denied for schema public
```

To znaczy: **Supabase Test Database nie ma uprawnień do INSERT na tabeli `profiles`**

---

## 🎯 OPCJA A: Najprostsze Rozwiązanie (5 minut)

### Krok 1: Otwórz Supabase Dashboard

1. Idź do https://supabase.com/dashboard
2. Wybierz **TEST PROJECT** (ten z `.env.e2e`)
3. Kliknij **SQL Editor** w menu po lewej

### Krok 2: Wykonaj Ten SQL

**Skopiuj i wklej to do SQL Editor, potem kliknij RUN:**

```sql
-- ============================================================
-- Grant uprawnienia dla authenticated i service_role
-- ============================================================

-- Tabela profiles
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Tabela planned_meals
GRANT ALL ON public.planned_meals TO authenticated;
GRANT ALL ON public.planned_meals TO service_role;

-- Tabela shopping_list (jeśli istnieje)
GRANT ALL ON public.shopping_list TO authenticated;
GRANT ALL ON public.shopping_list TO service_role;

-- Inne tabele które mogą być potrzebne
GRANT ALL ON public.recipe_ingredients TO authenticated;
GRANT ALL ON public.recipe_ingredients TO service_role;

-- Sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Pokaż rezultat
SELECT 'Permissions granted successfully!' as status;
```

### Krok 3: Napraw RLS Policies (jeśli RLS jest włączone)

**Sprawdź czy RLS jest włączone:**

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';
```

**Jeśli `rowsecurity = true`, wykonaj:**

```sql
-- Policy dla service_role (używany w testach)
CREATE POLICY "service_role_all_profiles" ON public.profiles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy dla authenticated users (backup)
CREATE POLICY "users_own_profile" ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- To samo dla planned_meals
CREATE POLICY "service_role_all_planned_meals" ON public.planned_meals
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_own_meals" ON public.planned_meals
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Krok 4: Zweryfikuj .env.e2e

**WAŻNE**: Upewnij się że używasz **SERVICE_ROLE_KEY**, nie ANON_KEY:

```bash
# .env.e2e
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-TEST-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...  # Dla frontend
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...     # <-- TEN ma pełne uprawnienia!
```

**Gdzie znaleźć SERVICE_ROLE_KEY:**

1. Supabase Dashboard → Settings → API
2. Scrolluj w dół do "**service_role secret**"
3. Kliknij "**Reveal**" i skopiuj

### Krok 5: Restart Dev Server Z .env.e2e

**WAŻNE**: Dev server musi być uruchomiony z `.env.e2e`!

```bash
# 1. Zatrzymaj obecny dev server (Ctrl+C w terminalu gdzie działa)

# 2. Uruchom z .env.e2e
npx dotenv-cli -e .env.e2e -- npm run dev

# LUB (jeśli masz Git Bash na Windows)
npm run dev  # Playwright automatycznie załaduje .env.e2e
```

### Krok 6: Uruchom Testy Ponownie

```bash
npm run test:e2e:chromium
```

**Szukaj tego w outputcie:**

```
✅ Created test user: test-xxx@lowcarbplaner.test
✅ Created test profile for: test-xxx@lowcarbplaner.test  <-- POWINNO BYĆ!
✅ Profile verified in database (took XXXms)
```

---

## 🎯 OPCJA B: Jeśli Nadal Nie Działa

### Diagnostyka: Sprawdź Uprawnienia Bezpośrednio

```sql
-- Pokaż wszystkie uprawnienia na profiles
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'profiles';
```

**Oczekiwany rezultat:**

```
grantee          | privilege_type
-----------------+---------------
authenticated    | INSERT
authenticated    | SELECT
authenticated    | UPDATE
authenticated    | DELETE
service_role     | INSERT
service_role     | SELECT
service_role     | UPDATE
service_role     | DELETE
```

### Sprawdź Czy Profile Table Istnieje

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'profiles';
```

Jeśli **nie zwraca wyników** - tabela nie istnieje! Musisz:

1. Uruchomić migrations: `npx supabase db push`
2. Lub skopiować schema z dev DB: `npm run db:clone`

### Debug Auth Fixture

Dodaj więcej logów w `tests/e2e/fixtures/auth.ts`:

```typescript
// tests/e2e/fixtures/auth.ts, linia ~88
console.log('🔍 DEBUG: Creating profile...')
console.log('🔍 DEBUG: User ID:', authData.user.id)
console.log('🔍 DEBUG: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

const { error: profileError } = await supabaseClient
  .from('profiles')
  .insert({ ... })

if (profileError) {
  console.log('🔍 DEBUG: Full error:', JSON.stringify(profileError, null, 2))
  console.log('🔍 DEBUG: Service key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
}
```

---

## 📋 Checklist - Czy Wszystko Mam?

Przed uruchomieniem testów, sprawdź:

- [ ] ✅ Test Supabase Project utworzony
- [ ] ✅ `.env.e2e` exists i ma poprawne credentials
- [ ] ✅ `SUPABASE_SERVICE_ROLE_KEY` w `.env.e2e` (nie ANON_KEY!)
- [ ] ✅ SQL GRANT wykonany w Supabase Dashboard
- [ ] ✅ RLS policies utworzone (jeśli RLS jest ON)
- [ ] ✅ Dev server uruchomiony z `.env.e2e`
- [ ] ✅ `playwright.config.ts` ma `reuseExistingServer: !process.env.CI`

---

## 🎉 Success Criteria

Testy działają gdy zobaczysz:

```
Running 108 tests using 1 worker

✅ Created test user: test-1234@lowcarbplaner.test (ID: xxx)
✅ Created test profile for: test-1234@lowcarbplaner.test
✅ Profile verified in database (took 200ms)
  ✓   1 [chromium] › tests\e2e\auth\login.spec.ts:5:7 › should successfully login
  ✓   2 [chromium] › tests\e2e\auth\login.spec.ts:27:7 › should show error
  ...

  60 passed (2.5m)
  48 skipped
```

**Bez błędu:**

```
❌ Failed to create profile: permission denied  <-- NIE POWINNO BYĆ!
```

---

## 🆘 Nadal Nie Działa?

### Quick Debug Commands

```bash
# Sprawdź co jest w .env.e2e
cat .env.e2e | grep SUPABASE

# Sprawdź czy Playwright widzi zmienne
npx dotenv-cli -e .env.e2e -- echo $NEXT_PUBLIC_SUPABASE_URL

# Sprawdź porty
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # macOS/Linux
```

### Troubleshooting Table

| Symptom               | Przyczyna     | Rozwiązanie             |
| --------------------- | ------------- | ----------------------- |
| "permission denied"   | Brak GRANT    | Execute SQL w Krok 2    |
| "policy violation"    | RLS blokuje   | Dodaj policies w Krok 3 |
| "table doesn't exist" | Brak schema   | `npm run db:clone`      |
| "port already used"   | ✅ Naprawione | Config już poprawiony   |
| "connection refused"  | Zły URL       | Sprawdź `.env.e2e`      |

---

## 📚 Dodatkowe Zasoby

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL GRANT Docs](https://www.postgresql.org/docs/current/sql-grant.html)
- [Playwright Config](https://playwright.dev/docs/test-configuration)
- [tests/e2e/README.md](./README.md) - Full E2E guide

---

## 💡 Pro Tip

**Jeśli robisz to pierwszy raz**, najprościej:

1. ✅ Execute wszystkie SQL z Kroku 2 i 3
2. ✅ Sprawdź `.env.e2e` (service_role_key!)
3. ✅ Restart dev server z `npx dotenv-cli -e .env.e2e -- npm run dev`
4. ✅ Uruchom `npm run test:e2e:chromium`

To powinno zadziałać w 99% przypadków! 🚀

---

**Powodzenia!** Jeśli nadal są problemy, pokaż mi output z `npm run test:e2e:chromium` i pomogę dalej.
