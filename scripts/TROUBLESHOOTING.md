# 🔧 Troubleshooting - Database Cloning Scripts

Rozwiązywanie problemów z klonowaniem bazy danych.

---

## ❌ Błąd: `pg_dump: error: aborting because of server version mismatch`

### Przyczyna:

pg_dump 16.x odmawia pracy z PostgreSQL 15.x (Supabase)

### ⚡ Szybkie rozwiązanie (2 minuty):

**Ręczne klonowanie bez skryptów:**

```powershell
# Ustaw zmienne (zmień hasło!)
$SOURCE = "postgresql://postgres.pkjdgaqwdletfkvniljx:grekoss123@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
$TARGET = "postgresql://postgres.mmdjbjbuxivvpvgsvsfj:grekoss123@aws-1-us-east-2.pooler.supabase.com:6543/postgres"

# Clean + Copy
psql $TARGET -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"
pg_dump $SOURCE --schema=public --data-only --no-owner --no-privileges | psql $TARGET
```

### Rozwiązanie długoterminowe:

**Opcja 1: Downgrade do PostgreSQL 15**

```powershell
choco uninstall postgresql16
choco install postgresql15
```

**Opcja 2: Użyj Supabase CLI**

```powershell
npm install -g supabase
supabase db dump --db-url="$env:SOURCE_DATABASE_URL" -f backup.sql
```

📚 **Pełny przewodnik:** [SOLUTION.md](SOLUTION.md)

---

## ❌ Błąd: `pg_dump: executing SELECT pg_catalog.set_config('search_path', '', false);`

### Przyczyna:

Problem z kompatybilnością między pg_dump a Supabase connection pooler.

### Rozwiązanie 1: Użyj bezpośredniego połączenia (Direct Connection)

Zamiast transaction pooler (port 6543), użyj direct connection (port 5432).

**Krok 1:** Otwórz Supabase Dashboard → Settings → Database

**Krok 2:** Znajdź **Connection String** i wybierz **URI** (nie Transaction mode!)

**Przykład:**

```bash
# ❌ Transaction pooler (port 6543) - może nie działać z pg_dump
postgresql://postgres.xxx:pass@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# ✅ Direct connection (port 5432) - zalecane dla pg_dump
postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres
```

**Krok 3:** Zaktualizuj `.env.e2e`:

```bash
# Zamień pooler.supabase.com:6543 na db.xxx.supabase.co:5432
SOURCE_DATABASE_URL=postgresql://postgres:PASSWORD@db.pkjdgaqwdletfkvniljx.supabase.co:5432/postgres
TARGET_DATABASE_URL=postgresql://postgres:PASSWORD@db.mmdjbjbuxivvpvgsvsfj.supabase.co:5432/postgres
```

---

### Rozwiązanie 2: Użyj starszej wersji pg_dump

Jeśli masz PostgreSQL 18.x, rozważ downgrade do 16.x:

```powershell
# Odinstaluj PostgreSQL 18
choco uninstall postgresql

# Zainstaluj PostgreSQL 16 (stabilna wersja)
choco install postgresql16
```

---

### Rozwiązanie 3: Użyj Supabase CLI

Alternatywnie możesz użyć Supabase CLI:

```bash
# Instalacja
npm install -g supabase

# Login
supabase login

# Pull schema + data z DEV
supabase db dump --db-url="$SOURCE_DATABASE_URL" -f backup.sql

# Push do TEST
psql "$TARGET_DATABASE_URL" -f backup.sql
```

---

## ❌ Błąd: `psql: command not found`

### Przyczyna:

PostgreSQL client tools nie są zainstalowane lub nie są w PATH.

### Rozwiązanie:

**Windows (Chocolatey):**

```powershell
choco install postgresql
```

**Windows (ręcznie):**

1. Pobierz z: https://www.postgresql.org/download/windows/
2. Zainstaluj (domyślne opcje OK)
3. Dodaj do PATH:
   - Otwórz: System Properties → Environment Variables
   - Edytuj PATH
   - Dodaj: `C:\Program Files\PostgreSQL\16\bin`
4. **Zrestartuj terminal!**

**Weryfikacja:**

```powershell
psql --version
pg_dump --version
```

---

## ❌ Błąd: `connection to server failed: FATAL: password authentication failed`

### Przyczyna:

Nieprawidłowe hasło w connection stringu.

### Rozwiązanie:

1. Zresetuj hasło w Supabase Dashboard:
   - Settings → Database → Database password → Reset password
2. Skopiuj nowe hasło
3. Zaktualizuj connection string w `.env.e2e`
4. Upewnij się że hasło jest zakodowane URL-safe:
   - Zamień `@` → `%40`
   - Zamień `#` → `%23`
   - Zamień `&` → `%26`

**Przykład:**

```bash
# Hasło: My@Pass#123
# URL-encoded: My%40Pass%23123

postgresql://postgres:My%40Pass%23123@db.xxx.supabase.co:5432/postgres
```

---

## ❌ Błąd: `connection refused` lub `timeout`

### Przyczyna:

Nieprawidłowy URL lub projekt Supabase jest paused/offline.

### Rozwiązanie:

1. **Sprawdź status projektu:**
   - Otwórz Supabase Dashboard
   - Sprawdź czy projekt jest ACTIVE (nie paused)
   - Jeśli paused → Restore project

2. **Sprawdź URL:**

   ```bash
   # Poprawny format (direct connection):
   postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres

   # Poprawny format (pooler):
   postgresql://postgres.PROJECT-REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
   ```

3. **Test połączenia:**
   ```powershell
   psql "$env:SOURCE_DATABASE_URL" -c "SELECT version();"
   ```

---

## ❌ Błąd: `permission denied` (Linux/Mac)

### Przyczyna:

Brak uprawnień wykonywania dla skryptów `.sh`.

### Rozwiązanie:

```bash
chmod +x scripts/clone-database.sh
chmod +x scripts/clone-database-full.sh
```

---

## ❌ Błąd: `no space left on device`

### Przyczyna:

Brak miejsca na dysku dla backupu bazy danych.

### Rozwiązanie:

1. **Sprawdź rozmiar bazy:**

   ```sql
   SELECT pg_size_pretty(pg_database_size('postgres'));
   ```

2. **Wyczyść stare backupy:**

   ```bash
   # Usuń backupy starsze niż 7 dni
   find backups/ -name "*.sql" -mtime +7 -delete
   ```

3. **Użyj kompresji:**
   ```bash
   # Ręczny dump z kompresją
   pg_dump "$SOURCE_DATABASE_URL" | gzip > backup.sql.gz
   ```

---

## ⚠️ Warning: `Target backup failed (database might be empty)`

### Przyczyna:

Baza TEST jest pusta (pierwsze uruchomienie) lub nie ma uprawnień.

### Rozwiązanie:

To jest **normalne ostrzeżenie** przy pierwszym klonowaniu. Możesz je zignorować.

Jeśli chcesz je pominąć, użyj:

```bash
npm run db:clone:full -- --skip-backup
```

---

## ❌ Błąd: `schema "content" does not exist`

### Przyczyna:

Baza DEV nie ma schematu `content` (normalnie dane są w `public`).

### Rozwiązanie:

To jest **oczekiwane** - skrypt automatycznie przenosi dane z `content` do `public`. Ten błąd jest ignorowany.

---

## 🐌 Bardzo wolne wykonanie (>10 minut)

### Przyczyna:

Duża baza danych lub wolne połączenie.

### Rozwiązanie:

1. **Użyj kompresji:**

   ```bash
   # Zmień format na custom (automatyczna kompresja)
   pg_dump "$SOURCE_DATABASE_URL" -Fc -f backup.dump
   pg_restore -d "$TARGET_DATABASE_URL" backup.dump
   ```

2. **Użyj pooler connection:**
   - Zmień port 5432 → 6543
   - Zmień `db.xxx.supabase.co` → `aws-0-REGION.pooler.supabase.com`

3. **Pomiń backup TEST:**

   ```bash
   npm run db:clone:full -- --skip-backup
   ```

4. **Klonuj w godzinach nocnych** (mniejsze obciążenie serwerów)

---

## 📊 Weryfikacja po klonowaniu

Sprawdź czy wszystko się skopiowało:

```sql
-- Sprawdź liczbę tabel
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';

-- Sprawdź liczbę rekordów w każdej tabeli
SELECT
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
```

---

## 🆘 Dalsze problemy?

1. **Sprawdź logi:**

   ```bash
   # Ostatnie backupy
   ls -lh backups/

   # Sprawdź rozmiar ostatniego dumpu
   du -h backups/full-db-dump-*.sql | tail -1
   ```

2. **Test ręczny:**

   ```bash
   # Sprawdź czy pg_dump działa
   pg_dump "$SOURCE_DATABASE_URL" --schema-only --schema=public -f test.sql

   # Sprawdź zawartość
   head -50 test.sql
   ```

3. **Zgłoś issue:**
   - GitHub: https://github.com/your-repo/issues
   - Dołącz: wersję pg_dump, system operacyjny, błąd

---

## 📚 Przydatne komendy

```bash
# Sprawdź wersję PostgreSQL
psql --version
pg_dump --version

# Test połączenia do DEV
psql "$SOURCE_DATABASE_URL" -c "SELECT version();"

# Test połączenia do TEST
psql "$TARGET_DATABASE_URL" -c "SELECT version();"

# Lista tabel w bazie TEST
psql "$TARGET_DATABASE_URL" -c "\dt public.*"

# Rozmiar bazy DEV
psql "$SOURCE_DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size('postgres'));"

# Liczba rekordów w tabeli
psql "$TARGET_DATABASE_URL" -c "SELECT COUNT(*) FROM public.ingredients;"
```
