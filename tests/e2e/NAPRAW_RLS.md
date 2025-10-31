# 🔧 NAPRAW RLS POLICIES (2 minuty)

## 🎯 Twój Problem

**Masz**:

- ✅ Uprawnienia GRANT ALL (pokazałeś screenshot)
- ✅ service_role ma INSERT, UPDATE, DELETE, SELECT

**Ale brakuje**:

- ❌ Polityk RLS (Row Level Security)

**Dlaczego to jest problem**:

```
GRANT ALL = "Możesz teoretycznie"
RLS POLICY = "Tak, naprawdę możesz"
```

Nawet z GRANT ALL, jeśli brakuje polityki RLS dla service_role, dostaniesz:

```
❌ permission denied for schema public
```

---

## ⚡ Rozwiązanie (2 kroki)

### Krok 1: Sprawdź co masz (30 sekund)

**W Supabase SQL Editor uruchom**:

```sql
SELECT policyname, roles::text
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND 'service_role' = ANY(roles);
```

**Co zobaczysz**:

**Opcja A** - Polityka istnieje ✅:

```
policyname                  | roles
----------------------------|-------------
service_role_all_profiles   | {service_role}
```

→ Dziwne, polityka jest... Przejdź do "Inne problemy" na końcu

**Opcja B** - PUSTY WYNIK ❌:

```
(0 rows)
```

→ To jest problem! Przejdź do Kroku 2

---

### Krok 2: Utwórz polityki (1 minuta)

**Metoda A - Z pliku** (łatwiejsza):

1. Otwórz plik w edytorze:
   ```powershell
   notepad tests\e2e\create-rls-policies.sql
   ```
2. Skopiuj całość (Ctrl+A, Ctrl+C)
3. Wklej do Supabase SQL Editor (Ctrl+V)
4. Uruchom (Ctrl+Enter)

**Metoda B - Bezpośrednio** (szybsza):
Skopiuj i wklej to do Supabase SQL Editor:

```sql
-- Włącz RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Usuń stare (jeśli istnieją)
DROP POLICY IF EXISTS "service_role_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_own_profile" ON public.profiles;

-- Utwórz dla service_role (testy E2E)
CREATE POLICY "service_role_all_profiles" ON public.profiles
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- Utwórz dla authenticated (normalni użytkownicy)
CREATE POLICY "users_own_profile" ON public.profiles
    FOR ALL TO authenticated
    USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Sprawdź
SELECT
    'OK! Polityki utworzone' as status,
    COUNT(*) as liczba
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles';
```

**Oczekiwany wynik**:

```
status                 | liczba
-----------------------|-------
OK! Polityki utworzone | 2
```

---

### Krok 3: Uruchom testy

```powershell
npm run test:e2e:chromium
```

**Oczekiwany wynik**:

```
✅ Created test user: test-xxx@lowcarbplaner.test
✅ Created test profile for: test-xxx@lowcarbplaner.test

  68 passed (2-3 min)
```

---

## 🔍 Inne problemy (jeśli nadal nie działa)

### Problem 1: Polityka istnieje, ale testy failują

**Sprawdź czy polityka ma `USING (true)`**:

```sql
SELECT
    policyname,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND policyname = 'service_role_all_profiles';
```

**Oczekiwany wynik**:

```
policyname                  | qual | with_check
----------------------------|------|------------
service_role_all_profiles   | true | true
```

**Jeśli `qual` lub `with_check` NIE SĄ `true`**:
→ Usuń i utwórz ponownie z Kroku 2

---

### Problem 2: RLS jest wyłączone

**Sprawdź**:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';
```

**Jeśli `rowsecurity = false`**:

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

---

### Problem 3: Zły projekt Supabase

**Sprawdź czy jesteś w projekcie `mmdjbjbuxivvpvgsvsfj`**:

- URL: https://supabase.com/dashboard/project/**mmdjbjbuxivvpvgsvsfj**
- Sprawdź w lewym górnym rogu Supabase Dashboard

**Jeśli nie**, zmień projekt i uruchom SQL ponownie.

---

### Problem 4: service_role_key jest zły

**Sprawdź `.env.e2e`**:

```powershell
cat .env.e2e | Select-String "SERVICE_ROLE"
```

**Powinno być**:

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Jeśli brak lub pusty**, pobierz z Supabase:

1. Dashboard → Settings → API
2. Project API keys → `service_role` → Copy
3. Wklej do `.env.e2e`

---

## 📊 Co to wszystko znaczy?

### GRANT vs RLS

```
╔════════════════════╗
║   GRANT ALL        ║ ← Uprawnienia na poziomie tabeli
║   (masz ✅)        ║    "service_role może teoretycznie"
╚════════════════════╝
         ↓
╔════════════════════╗
║   RLS POLICIES     ║ ← Reguły na poziomie wierszy
║   (brakuje ❌)     ║    "Tak, naprawdę może"
╚════════════════════╝
         ↓
╔════════════════════╗
║   OPERACJA         ║
║   (INSERT/SELECT)  ║
╚════════════════════╝
```

### RLS w praktyce

**Bez polityki RLS**:

```sql
-- service_role próbuje:
INSERT INTO profiles (id, age) VALUES ('abc', 25);

-- Postgres myśli:
-- ✅ service_role ma GRANT INSERT
-- ❌ ALE nie ma polityki RLS dla service_role
-- → DENY: permission denied
```

**Z polityką RLS `USING (true)`**:

```sql
-- service_role próbuje:
INSERT INTO profiles (id, age) VALUES ('abc', 25);

-- Postgres myśli:
-- ✅ service_role ma GRANT INSERT
-- ✅ Jest polityka RLS: USING (true) = zawsze OK
-- → ALLOW: operacja sukces
```

---

## 📞 Potrzebujesz pomocy?

**Pliki**:

- [create-rls-policies.sql](./create-rls-policies.sql) - SQL do uruchomienia
- [check-rls-policies.sql](./check-rls-policies.sql) - SQL do sprawdzenia
- [CO_TERAZ_ZROBIC.md](./CO_TERAZ_ZROBIC.md) - Główny przewodnik

**Następny krok**:
Uruchom SQL z Kroku 2, potem `npm run test:e2e:chromium`

---

**Ostatnia aktualizacja**: 29 października 2025
**Status**: ⚡ To najprawdopodobniej rozwiąże Twój problem
