# 🔧 NAPRAW UPRAWNIENIA SCHEMA (1 minuta)

## 🎯 Problem

Masz:

- ✅ RLS wyłączone (`rowsecurity = false`)
- ✅ GRANT ALL na tabelach
- ❌ Testy nadal failują: `permission denied for schema public`

**Nowa hipoteza**: Problem jest z **uprawnieniami na SCHEMA**, nie na tabelach.

---

## ⚡ Krok 1: Sprawdź uprawnienia (30 sekund)

**W Supabase SQL Editor uruchom**:

```sql
SELECT
    n.nspname as schema_name,
    r.rolname as role_name,
    has_schema_privilege(r.rolname, n.nspname, 'USAGE') as has_usage,
    has_schema_privilege(r.rolname, n.nspname, 'CREATE') as has_create
FROM pg_namespace n
CROSS JOIN pg_roles r
WHERE n.nspname = 'public'
  AND r.rolname = 'service_role';
```

**Co zobaczysz**:

### Opcja A - Brak uprawnień ❌

```
schema_name | role_name    | has_usage | has_create
------------|--------------|-----------|------------
public      | service_role | false     | false
```

→ **To jest problem!** Przejdź do Kroku 2

### Opcja B - Uprawnienia są ✅

```
schema_name | role_name    | has_usage | has_create
------------|--------------|-----------|------------
public      | service_role | true      | true
```

→ **Dziwne...** Problem jest gdzie indziej (przejdź do sekcji "Problem nadal występuje")

---

## ⚡ Krok 2: Nadaj uprawnienia na schema (30 sekund)

**W Supabase SQL Editor uruchom**:

```sql
-- Nadaj uprawnienia na schema public
GRANT USAGE ON SCHEMA public TO service_role, authenticated, anon;
GRANT ALL ON SCHEMA public TO service_role, authenticated;

-- Nadaj uprawnienia na wszystkie obiekty w schema
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role, authenticated;

-- Ustaw domyślne uprawnienia dla przyszłych obiektów
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO service_role, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO service_role, authenticated;

-- Sprawdź czy zadziałało
SELECT
    'Uprawnienia nadane!' as status,
    has_schema_privilege('service_role', 'public', 'USAGE') as has_usage,
    has_schema_privilege('service_role', 'public', 'CREATE') as has_create;
```

**Oczekiwany wynik**:

```
status                 | has_usage | has_create
-----------------------|-----------|------------
Uprawnienia nadane!    | true      | true
```

---

## ⚡ Krok 3: Uruchom testy

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

## 🔍 Problem nadal występuje?

Jeśli testy nadal failują MIMO że `has_usage = true` i `has_create = true`, problem może być:

### 1. Connection Pooler Issue

**Sprawdź connection string w `.env.e2e`**:

```powershell
cat .env.e2e | Select-String "TARGET_DATABASE_URL"
```

**Jeśli używasz pooler.supabase.com**:

```
postgresql://postgres.mmdjbjbuxivvpvgsvsfj:grekoss123@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

**Możliwe problemy**:

- Pooler ma własne uprawnienia (oddzielne od Supabase Dashboard)
- Spróbuj użyć **direct connection** zamiast pooler

**Pobierz direct connection string**:

1. Supabase Dashboard → Settings → Database
2. Connection string → Direct connection (nie Pooling)
3. Zamień w `.env.e2e` wartość `TARGET_DATABASE_URL`

---

### 2. PostgREST Cache

**Zrestartuj projekt Supabase**:

1. Supabase Dashboard → Settings → General
2. Scroll down → "Pause project"
3. Poczekaj 1 minutę
4. "Resume project"

To wyczyści PostgREST cache i odświeży uprawnienia.

---

### 3. Alternatywne podejście: Direct PostgreSQL Connection

Jeśli Supabase JS SDK nadal nie działa, możemy użyć direct PostgreSQL connection (`pg` library) w test fixtures.

**Zmień `tests/e2e/fixtures/auth.ts`**:

```typescript
import { Client } from 'pg'

const client = new Client({
  connectionString: process.env.TARGET_DATABASE_URL,
})

await client.connect()
await client.query('INSERT INTO profiles...')
await client.end()
```

To ominęłoby Supabase JS SDK i PostgREST całkowicie.

---

## 📊 Diagnostyka dodatkowa

**Sprawdź czy problem jest z specific table czy schema**:

```sql
-- Test 1: Sprawdź czy możesz SELECT
SELECT current_user, current_database();

-- Test 2: Sprawdź czy możesz INSERT (symulacja service_role)
SET ROLE service_role;
INSERT INTO profiles (id, email, age) VALUES ('test-id', 'test@test.com', 25);
ROLLBACK; -- Nie commituj
```

**Jeśli INSERT działa w SQL Editor ale nie w testach**:
→ Problem jest z Supabase JS SDK / PostgREST, nie z bazą danych

---

## 📞 Następne kroki

1. **Uruchom Krok 1** - Sprawdź `has_usage`
2. **Jeśli false** → Uruchom Krok 2 (nadaj uprawnienia)
3. **Jeśli true** → Problem jest z connection pooler lub PostgREST
4. Napisz wynik, pomogę dalej!

---

**Ostatnia aktualizacja**: 29 października 2025
**Status**: ⚡ Najprawdopodobniej to jest problem
