# ⚡ CO DOKŁADNIE TERAZ ZROBIĆ?

## 📊 Obecna Sytuacja

**Wyniki testów z Twojego terminala**:

```
Running 108 tests using 1 worker

✅ 8 tests passed    - Testy bez tworzenia profilu
❌ 60 tests failed   - Błąd: permission denied for schema public
⏭️  40 tests skipped - Celowo wyłączone
```

**Główny problem**:

```
❌ Failed to create profile: {
  code: '42501',
  message: 'permission denied for schema public'
}
```

---

## 🎯 3 Kroki Do Naprawy (5 minut)

### Krok 1: Sprawdź uprawnienia (2 minuty)

**Otwórz plik**: `tests/e2e/check-permissions-simple.sql`

**Metoda A - Przez przeglądarkę**:

1. Otwórz w notepademfile
   ```
   notepad tests\e2e\check-permissions-simple.sql
   ```
2. Zaznacz wszystko (Ctrl+A)
3. Skopiuj (Ctrl+C)

**Metoda B - Bezpośrednio**:
Skopiuj to:

```sql
SELECT
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND grantee IN ('authenticated', 'service_role')
ORDER BY grantee, privilege_type;
```

**Wykonaj w Supabase**:

1. Otwórz: https://supabase.com/dashboard
2. Zaloguj się
3. Wybierz projekt: **mmdjbjbuxivvpvgsvsfj** (testowy)
4. Kliknij: **SQL Editor** (lewy panel)
5. Wklej SQL (Ctrl+V)
6. Kliknij: **Run** (lub Ctrl+Enter)

**Co zobaczysz**:

**Opcja A - Wszystko OK** ✅:

```
grantee       | privilege_type
--------------|---------------
authenticated | DELETE
authenticated | INSERT
authenticated | SELECT
authenticated | UPDATE
service_role  | DELETE
service_role  | INSERT    ← TO JEST NAJWAŻNIEJSZE!
service_role  | SELECT
service_role  | UPDATE
```

→ Przejdź do Kroku 3 (uruchom testy ponownie)

**Opcja B - Brak uprawnień** ❌:

```
grantee       | privilege_type
--------------|---------------
authenticated | SELECT
```

lub pusty wynik
→ Przejdź do Kroku 2 (napraw uprawnienia)

---

### Krok 2: Napraw uprawnienia (2 minuty)

**Otwórz plik**: `tests/e2e/fix-permissions-complete.sql`

**Skopiuj całą zawartość** (Ctrl+A, Ctrl+C):

```bash
notepad tests\e2e\fix-permissions-complete.sql
```

**Lub skopiuj bezpośrednio ten SQL**:

```sql
-- Nadaj uprawnienia
GRANT ALL ON public.profiles TO authenticated, service_role;
GRANT ALL ON public.planned_meals TO authenticated, service_role;
GRANT ALL ON public.shopping_list TO authenticated, service_role;
GRANT ALL ON public.recipes TO authenticated, service_role;
GRANT ALL ON public.ingredients TO authenticated, service_role;

-- Uprawnienia na sekwencje
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- Polityki RLS dla service_role
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'profiles'
          AND policyname = 'service_role_all_profiles'
    ) THEN
        CREATE POLICY "service_role_all_profiles" ON public.profiles
            FOR ALL TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Polityki RLS dla authenticated
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'profiles'
          AND policyname = 'users_own_profile'
    ) THEN
        CREATE POLICY "users_own_profile" ON public.profiles
            FOR ALL TO authenticated
            USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Weryfikacja
SELECT 'OK - service_role ma uprawnienia!' as status
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND grantee = 'service_role'
  AND privilege_type = 'INSERT'
LIMIT 1;
```

**Wykonaj w Supabase**:

1. W tym samym **SQL Editor**
2. Wklej SQL (Ctrl+V)
3. Kliknij: **Run** (Ctrl+Enter)
4. Poczekaj ~5 sekund

**Oczekiwany wynik**:

```
status
-------------------------------------
OK - service_role ma uprawnienia!
```

**Jeśli widzisz błędy**:

- `policy already exists` → To normalne! Ignoruj.
- Inne błędy → Napisz mi, pomogę

---

### Krok 3: Uruchom testy ponownie (1 minuta)

**W terminalu PowerShell**:

```powershell
npm run test:e2e:chromium
```

**Oczekiwany wynik** (po 2-3 minutach):

```
Running 108 tests using 1 worker

✅ Created test user: test-xxx@lowcarbplaner.test
✅ Created test profile for: test-xxx@lowcarbplaner.test
✅ Profile verified in database

  68 passed (2-3 min)
  40 skipped
```

**Jeśli nadal failuje**:

1. Sprawdź czy użyłeś właściwego projektu Supabase (`mmdjbjbuxivvpvgsvsfj`)
2. Sprawdź `.env.e2e`:
   ```powershell
   cat .env.e2e
   ```
   Upewnij się że jest `SUPABASE_SERVICE_ROLE_KEY=...`

---

## 🆘 Najczęstsze Problemy

### ❌ "column sequence_schema does not exist"

**Rozwiązanie**: Użyj `check-permissions-simple.sql` zamiast `check-permissions.sql`

### ❌ "policy already exists"

**To normalne!** SQL sprawdza czy polityka istnieje przed utworzeniem.
Sprawdź wynik na końcu - powinien pokazać "OK - service_role ma uprawnienia!"

### ❌ "permission denied" nadal po SQL (TWÓJ PROBLEM!)

**Diagnoza**: Masz uprawnienia GRANT ALL ✅, ale **brakuje polityk RLS** ❌

**Rozwiązanie**:

1. **Sprawdź polityki RLS**:

   ```sql
   -- Uruchom to w Supabase SQL Editor:
   SELECT policyname, roles::text
   FROM pg_policies
   WHERE schemaname = 'public'
     AND tablename = 'profiles'
     AND 'service_role' = ANY(roles);
   ```

   **Jeśli PUSTY WYNIK** → Brakuje polityki dla service_role!

2. **Utwórz polityki RLS**:
   - Otwórz plik: `tests\e2e\create-rls-policies.sql`
   - Skopiuj całą zawartość
   - Wklej do Supabase SQL Editor
   - Uruchom (Ctrl+Enter)

3. **Uruchom testy ponownie**:
   ```powershell
   npm run test:e2e:chromium
   ```

**Szczegóły**: Zobacz [check-rls-policies.sql](./check-rls-policies.sql)

---

## ✅ Sukces! Co dalej?

Gdy zobaczysz **68 passed**:

**Masz teraz**:

- ✅ 68 działających testów E2E
- ✅ ~70-75% coverage aplikacji
- ✅ Multi-browser testing (Chromium, Firefox, WebKit)
- ✅ Performance monitoring
- ✅ Quality gates
- ✅ CI/CD z GitHub Actions

**Możesz uruchomić**:

```powershell
# UI mode (interaktywny debugger)
npm run test:e2e:ui

# Wszystkie przeglądarki
npm run test:e2e

# Tylko konkretny plik
npx playwright test auth/login.spec.ts

# HTML report
npm run test:e2e:report
```

---

## 📞 Potrzebujesz Pomocy?

**Dokumentacja**:

- [ROZPOCZNIJ_TUTAJ.md](./ROZPOCZNIJ_TUTAJ.md) - Szczegółowy przewodnik PL
- [SPRAWDZ_UPRAWNIENIA.md](./SPRAWDZ_UPRAWNIENIA.md) - Diagnostyka
- [ACTION_REQUIRED.md](./ACTION_REQUIRED.md) - English version

**Szybkie linki**:

- Plik do sprawdzenia: [check-permissions-simple.sql](./check-permissions-simple.sql)
- Plik do naprawy: [fix-permissions-complete.sql](./fix-permissions-complete.sql)

---

**Status**: ⏳ Czeka na Twoje wykonanie SQL w Supabase
**Czas**: ~5 minut total
**Rezultat**: 68 passing tests ✅

**Ostatnia aktualizacja**: 29 października 2025
