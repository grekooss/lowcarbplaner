# 🔍 Jak Sprawdzić Uprawnienia w Supabase

## Krok 1: Otwórz Supabase Dashboard

1. Przejdź do: https://supabase.com/dashboard
2. Zaloguj się
3. Wybierz projekt testowy: **mmdjbjbuxivvpvgsvsfj**
4. W lewym menu kliknij **SQL Editor**

---

## Krok 2: Sprawdź Obecne Uprawnienia

### Opcja A: Szybkie Sprawdzenie (1 zapytanie)

Skopiuj i uruchom to zapytanie:

```sql
-- Sprawdź uprawnienia dla tabeli profiles
SELECT
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND grantee IN ('authenticated', 'service_role')
ORDER BY grantee, privilege_type;
```

**Oczekiwany wynik** (jeśli wszystko OK):

```
grantee         | privilege_type
----------------|---------------
authenticated   | SELECT
authenticated   | INSERT
authenticated   | UPDATE
authenticated   | DELETE
service_role    | SELECT
service_role    | INSERT
service_role    | UPDATE
service_role    | DELETE
```

**Jeśli widzisz to ✅** - uprawnienia są OK
**Jeśli widzisz mniej wierszy ❌** - brakuje uprawnień

---

### Opcja B: Pełna Diagnostyka (użyj pliku)

1. Otwórz plik: [check-permissions.sql](./check-permissions.sql)
2. Skopiuj całą zawartość
3. Wklej do SQL Editor w Supabase
4. Kliknij **Run** (lub Ctrl+Enter)

To zapytanie sprawdzi:

- ✅ Uprawnienia na tabelach
- ✅ Czy RLS (Row Level Security) jest włączone
- ✅ Jakie polityki RLS istnieją
- ✅ Uprawnienia na sekwencjach (auto-increment)
- ✅ Wszystkie tabele w schemacie public

---

## Krok 3: Interpretacja Wyników

### ❌ Problem: Brak uprawnień

Jeśli widzisz **pusty wynik** lub **brakuje service_role**:

```sql
-- Pusty wynik lub tylko anon/postgres
grantee    | privilege_type
-----------|---------------
anon       | SELECT
```

**Rozwiązanie**: Musisz nadać uprawnienia - przejdź do [ACTION_REQUIRED.md](./ACTION_REQUIRED.md)

---

### ✅ OK: Uprawnienia są poprawne

Jeśli widzisz **service_role** z wszystkimi uprawnieniami:

```sql
grantee         | privilege_type
----------------|---------------
service_role    | SELECT
service_role    | INSERT
service_role    | UPDATE
service_role    | DELETE
```

**Super!** Spróbuj uruchomić testy ponownie:

```bash
npm run test:e2e:chromium
```

Jeśli nadal nie działają, sprawdź:

1. Czy `.env.e2e` ma poprawny `SUPABASE_SERVICE_ROLE_KEY`
2. Czy polityki RLS są utworzone (Query 3 w check-permissions.sql)

---

## Krok 4: Sprawdź Polityki RLS

Uruchom to zapytanie:

```sql
-- Sprawdź polityki RLS dla profiles
SELECT
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles';
```

**Oczekiwany wynik**:

```
policyname                  | roles          | cmd
----------------------------|----------------|-------
service_role_all_profiles   | {service_role} | ALL
users_own_profile           | {authenticated}| ALL
```

**Jeśli widzisz 0 wierszy** ❌ - musisz dodać polityki RLS

---

## Krok 5: Napraw Problem (jeśli potrzeba)

### Jeśli brakuje uprawnień:

```sql
-- Nadaj uprawnienia
GRANT ALL ON public.profiles TO authenticated, service_role;
GRANT ALL ON public.planned_meals TO authenticated, service_role;
GRANT ALL ON public.shopping_list TO authenticated, service_role;
GRANT ALL ON public.recipes TO authenticated, service_role;
GRANT ALL ON public.ingredients TO authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
```

### Jeśli brakuje polityk RLS:

```sql
-- Dodaj polityki
CREATE POLICY "service_role_all_profiles" ON public.profiles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_own_profile" ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

---

## 🆘 Szybka Pomoc

### Problem: "permission denied for schema public"

**Przyczyna**: service_role nie ma uprawnień INSERT na tabeli profiles

**Rozwiązanie**: Uruchom SQL z Kroku 5 (sekcja "Nadaj uprawnienia")

### Problem: "relation does not exist"

**Przyczyna**: Tabela nie istnieje lub użytkownik nie ma dostępu

**Rozwiązanie**:

1. Sprawdź czy tabela istnieje: `SELECT * FROM public.profiles LIMIT 1;`
2. Jeśli błąd - uruchom migracje Supabase
3. Jeśli działa - problem z uprawnieniami (użyj SQL z Kroku 5)

### Problem: Testy nadal failują po nadaniu uprawnień

**Sprawdź**:

1. Czy `.env.e2e` ma poprawny SERVICE_ROLE_KEY:
   ```bash
   cat .env.e2e | grep SERVICE_ROLE
   ```
2. Czy używasz właściwej bazy (testowej):
   ```bash
   cat .env.e2e | grep SUPABASE_URL
   ```
3. Czy RLS jest włączone i polityki istnieją (Query 2 i 3)

---

## 📚 Dodatkowe Zasoby

- **Pełna naprawa**: [ACTION_REQUIRED.md](./ACTION_REQUIRED.md)
- **Szybka naprawa**: [QUICK_FIX.md](./QUICK_FIX.md)
- **Szczegółowy przewodnik**: [FIX_GUIDE.md](./FIX_GUIDE.md)
- **Analiza problemu**: [TEST_ISSUES_REPORT.md](./TEST_ISSUES_REPORT.md)

---

## ✅ Podsumowanie Kroków

1. **Otwórz Supabase Dashboard** → SQL Editor
2. **Uruchom zapytanie sprawdzające** (Opcja A lub B)
3. **Sprawdź wyniki**:
   - ✅ service_role ma wszystkie uprawnienia → Uruchom testy
   - ❌ Brak service_role → Nadaj uprawnienia (Krok 5)
4. **Sprawdź polityki RLS** (Krok 4)
5. **Uruchom testy**: `npm run test:e2e:chromium`

**Oczekiwany czas**: 5-10 minut

---

**Ostatnia aktualizacja**: 29 października 2025
