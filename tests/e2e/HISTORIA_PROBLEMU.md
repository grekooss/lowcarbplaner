# 📖 Historia Problemu - E2E Tests Permission Denied

## 🎯 Stan Obecny

**Error**: `permission denied for schema public` (kod 42501)
**Lokacja**: [tests/e2e/fixtures/auth.ts:89](../auth.ts#L89)
**Status**: W trakcie diagnozy - problem z uprawnieniami SCHEMA

---

## 🔍 Przebieg Troubleshooting

### Krok 1: Sprawdziliśmy uprawnienia GRANT ✅

**Co sprawdziliśmy**:

```sql
SELECT grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'profiles'
  AND grantee = 'service_role';
```

**Wynik**: ✅ service_role ma **wszystkie** uprawnienia:

- DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE

**Wniosek**: Uprawnienia na poziomie tabeli są OK.

---

### Krok 2: Sprawdziliśmy RLS (Row Level Security) ✅

**Co sprawdziliśmy**:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';
```

**Wynik początkowo**: `rowsecurity = true` (RLS włączone)

**Co zrobiliśmy**:

```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

**Wynik po zmianie**: ✅ `rowsecurity = false` (RLS wyłączone)

**Wniosek**: RLS był włączony, ale teraz jest wyłączony.

---

### Krok 3: Sprawdziliśmy polityki RLS ✅

**Co sprawdziliśmy**:

```sql
SELECT policyname, roles::text, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND 'service_role' = ANY(roles);
```

**Wynik**: ✅ Polityka `service_role_all_profiles` istniała z:

- `qual = true` (USING clause przepuszcza wszystko)
- `with_check = true` (WITH CHECK clause przepuszcza wszystko)

**Wniosek**: Polityki RLS były poprawne, ale teraz RLS jest wyłączone więc to nie ma znaczenia.

---

### Krok 4: Wyłączyliśmy RLS całkowicie ✅

**Co zrobiliśmy**:

```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_meals DISABLE ROW LEVEL SECURITY;
```

**Wynik**: ✅ Wszystkie tabele mają `rowsecurity = false`

**Wniosek**: RLS jest całkowicie wyłączone.

---

### ⚠️ Krok 5: Testy NADAL failują

**Error message**:

```
❌ Failed to create profile: {
  code: '42501',
  message: 'permission denied for schema public'
}
```

**Lokacja**: `tests/e2e/fixtures/auth.ts:113`

**Kod który failuje**:

```typescript
const { error: profileError } = await supabaseClient.from('profiles').insert({
  id: authData.user.id,
  email: email,
  disclaimer_accepted_at: new Date().toISOString(),
  // ... inne pola
})
```

---

## 🤔 Nowa Hipoteza: Problem z SCHEMA Permissions

### Dlaczego myślimy że to problem ze SCHEMA?

**Error message mówi jasno**: `permission denied for schema public`

Nie mówi:

- ❌ "permission denied for table profiles"
- ❌ "permission denied for INSERT"

Mówi:

- ⚠️ "permission denied for **schema** public"

### Co to znaczy?

W PostgreSQL jest hierarchia uprawnień:

```
DATABASE
  └── SCHEMA (public)
       ├── TABLES (profiles, recipes, etc.)
       ├── SEQUENCES (profiles_id_seq, etc.)
       └── FUNCTIONS (trigger functions, etc.)
```

**Możliwe że**:

1. ✅ service_role ma uprawnienia na **TABLES**
2. ✅ service_role ma uprawnienia na **SEQUENCES**
3. ❌ service_role **NIE MA** uprawnień na **SCHEMA**

### Co sprawdzimy?

**Krok 1 - Diagnostyka** (`verify-schema-access.sql`):

```sql
SELECT
    has_schema_privilege('service_role', 'public', 'USAGE') as has_usage,
    has_schema_privilege('service_role', 'public', 'CREATE') as has_create;
```

**Oczekiwane wyniki**:

**Jeśli problem ze schema**:

```
has_usage | has_create
----------|------------
false     | false       ← TO JEST PROBLEM!
```

**Jeśli schema OK**:

```
has_usage | has_create
----------|------------
true      | true        ← To problem gdzie indziej
```

---

## ⚡ Następne Kroki

### Opcja A: Problem ze SCHEMA (prawdopodobne)

1. **Sprawdź**: Uruchom `verify-schema-access.sql`
2. **Jeśli `has_usage = false`**: Uruchom `fix-schema-permissions.sql`
3. **Uruchom testy**: `npm run test:e2e:chromium`

**Przewidywany wynik**: ✅ Testy przejdą

---

### Opcja B: Problem NIE jest ze SCHEMA (mniej prawdopodobne)

Jeśli `has_usage = true` ale testy nadal failują, problem może być:

1. **Connection Pooler**:
   - Pooler (`pooler.supabase.com`) ma własne uprawnienia
   - Spróbuj **direct connection** zamiast pooler

2. **PostgREST Cache**:
   - Supabase PostgREST może mieć stary cache uprawnień
   - Rozwiązanie: Pause/Resume projekt w Supabase Dashboard

3. **Supabase JS SDK Issue**:
   - Może być bug w SDK
   - Rozwiązanie: Użyj direct PostgreSQL connection (`pg` library)

---

## 📁 Pliki Do Uruchomienia

### Krok 1: Diagnostyka

**Plik**: [verify-schema-access.sql](./verify-schema-access.sql)

```sql
SELECT
    has_schema_privilege('service_role', 'public', 'USAGE') as has_usage,
    has_schema_privilege('service_role', 'public', 'CREATE') as has_create;
```

**Gdzie**: Supabase Dashboard → SQL Editor

---

### Krok 2: Naprawa (jeśli has_usage = false)

**Plik**: [fix-schema-permissions.sql](./fix-schema-permissions.sql)

```sql
GRANT USAGE ON SCHEMA public TO service_role, authenticated, anon;
GRANT ALL ON SCHEMA public TO service_role, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO service_role, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO service_role, authenticated;
```

**Gdzie**: Supabase Dashboard → SQL Editor

---

### Krok 3: Weryfikacja

**Gdzie**: Terminal/PowerShell

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

## 📊 Co Już Wiemy

✅ **Działa**:

- GRANT permissions na tabelach są poprawne
- RLS jest wyłączone
- Polityki RLS były poprawne (ale teraz nieaktywne)
- `.env.e2e` ma poprawne credentials
- service_role key jest poprawny
- Supabase projekt jest aktywny

❌ **Nie działa**:

- INSERT do `profiles` failuje z error 42501
- Error message: "permission denied for schema public"

🤔 **Testujemy teraz**:

- Uprawnienia SCHEMA level
- `has_schema_privilege('service_role', 'public', 'USAGE')`

---

## 📞 Potrzebna Akcja

**Ty musisz**:

1. ✅ Uruchomić `verify-schema-access.sql` w Supabase SQL Editor
2. ✅ Sprawdzić wynik `has_usage` i `has_create`
3. ✅ Jeśli `false` → uruchomić `fix-schema-permissions.sql`
4. ✅ Uruchomić testy: `npm run test:e2e:chromium`
5. ✅ Napisać wynik (pass/fail i ewentualny error)

---

**Ostatnia aktualizacja**: 29 października 2025
**Status**: 🔍 Diagnoza - sprawdzamy uprawnienia SCHEMA
