# 🔍 Jak uzyskać prawidłowy Connection String z Supabase

**Problem:** Format `db.xxx.supabase.co` może nie działać dla niektórych projektów.

---

## ✅ Prawidłowy sposób (krok po kroku)

### 1. Otwórz Supabase Dashboard

https://app.supabase.com

---

### 2. Wybierz projekt (DEV lub TEST)

---

### 3. Przejdź do: **Settings** → **Database**

---

### 4. Znajdź sekcję: **Connection String**

Zobaczysz kilka opcji. **NIE KOPIUJ** bezpośrednio - musisz je zmodyfikować!

---

### 5. Skopiuj **Connection pooling** → **Transaction Mode**

Przykład tego co zobaczysz:

```
postgresql://postgres.pkjdgaqwdletfkvniljx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**To jest już prawidłowy format!** ✅

---

### 6. Zamień `[YOUR-PASSWORD]` na prawdziwe hasło

**Gdzie znaleźć hasło:**

1. W tej samej sekcji **Database Settings**
2. Znajdź: **Database password**
3. Jeśli nie pamiętasz hasła, kliknij: **Reset database password**
4. Skopiuj nowe hasło

**WAŻNE:** Jeśli hasło zawiera specjalne znaki, musisz je zakodować!

---

### 7. Kodowanie hasła (jeśli zawiera specjalne znaki)

**Znaki które wymagają kodowania:**

- `@` → `%40`
- `#` → `%23`
- `&` → `%26`
- `%` → `%25`
- `/` → `%2F`
- `?` → `%3F`
- `:` → `%3A`

**Przykład:**

```bash
# Hasło: My@Pass#123
# Zakodowane: My%40Pass%23123

# Connection string:
postgresql://postgres.pkjdgaqwdletfkvniljx:My%40Pass%23123@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

### 8. Uzupełnij `.env.e2e`

**Przykład dla Twojego projektu:**

```bash
# DEV (pkjdgaqwdletfkvniljx w regionie us-east-2)
SOURCE_DATABASE_URL=postgresql://postgres.pkjdgaqwdletfkvniljx:grekoss123@aws-1-us-east-2.pooler.supabase.com:6543/postgres

# TEST (mmdjbjbuxivvpvgsvsfj w regionie us-east-2)
TARGET_DATABASE_URL=postgresql://postgres.mmdjbjbuxivvpvgsvsfj:grekoss123@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

---

## 🧪 Test połączenia

```powershell
# Test DEV
psql "postgresql://postgres.pkjdgaqwdletfkvniljx:grekoss123@aws-1-us-east-2.pooler.supabase.com:6543/postgres" -c "SELECT version();"

# Test TEST
psql "postgresql://postgres.mmdjbjbuxivvpvgsvsfj:grekoss123@aws-1-us-east-2.pooler.supabase.com:6543/postgres" -c "SELECT version();"
```

**Oczekiwany wynik:**

```
                                                 version
---------------------------------------------------------------------------------------------------------
 PostgreSQL 15.8 (Ubuntu 15.8-1.pgdg20.04+1) on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 9.4.0-1ubuntu1~20.04.2) 9.4.0, 64-bit
```

✅ Jeśli widzisz wersję PostgreSQL - działa!
❌ Jeśli błąd - sprawdź hasło i region

---

## 🗺️ Różne regiony AWS

Supabase używa różnych regionów AWS. **Twój region musi być zgodny!**

**Możliwe regiony:**

- `aws-0-us-east-1` (Virginia)
- `aws-1-us-east-2` (Ohio) ← **TY**
- `aws-0-us-west-1` (California)
- `aws-0-us-west-2` (Oregon)
- `aws-0-eu-central-1` (Frankfurt)
- `aws-0-eu-west-1` (Ireland)
- `aws-0-eu-west-2` (London)
- `aws-0-ap-northeast-1` (Tokyo)
- `aws-0-ap-southeast-1` (Singapore)
- `aws-0-ap-southeast-2` (Sydney)

**Jak sprawdzić region projektu:**

1. Supabase Dashboard → Settings → General
2. Znajdź: **Region** (np. "East US (Ohio)")
3. Ohio = `aws-1-us-east-2` ← **To jest Twój region!**

---

## 📋 Podsumowanie dla Twoich projektów

**Projekt DEV:** pkjdgaqwdletfkvniljx (Region: us-east-2)
**Projekt TEST:** mmdjbjbuxivvpvgsvsfj (Region: us-east-2)

### Prawidłowe connection stringi:

```bash
# .env.e2e

# DEV database
SOURCE_DATABASE_URL=postgresql://postgres.pkjdgaqwdletfkvniljx:grekoss123@aws-1-us-east-2.pooler.supabase.com:6543/postgres

# TEST database
TARGET_DATABASE_URL=postgresql://postgres.mmdjbjbuxivvpvgsvsfj:grekoss123@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

✅ **Ten format już masz w `.env.e2e` - powinien działać!**

---

## ⚠️ Jeśli nadal nie działa

### Problem: `pg_dump: executing SELECT pg_catalog.set_config`

**To nie jest problem z connection stringiem - to problem z pg_dump 18.0!**

**Rozwiązanie:**

1. **Downgrade do PostgreSQL 16:**

   ```powershell
   choco uninstall postgresql
   choco install postgresql16
   ```

2. **Lub użyj Supabase CLI:**

   ```bash
   npm install -g supabase
   supabase db dump --db-url="$SOURCE_DATABASE_URL" -f backup.sql
   psql "$TARGET_DATABASE_URL" -f backup.sql
   ```

3. **Lub ręczny dump bez problematycznych opcji:**
   ```powershell
   pg_dump "$env:SOURCE_DATABASE_URL" `
     --data-only `
     --schema=public `
     --no-owner `
     --no-privileges `
     -f backup.sql
   ```

---

## 🎯 Quick Fix - Ręczne klonowanie

Jeśli skrypty nie działają, możesz sklonować ręcznie:

```powershell
# 1. Dump DEV
pg_dump "postgresql://postgres.pkjdgaqwdletfkvniljx:grekoss123@aws-1-us-east-2.pooler.supabase.com:6543/postgres" `
  --schema=public `
  --no-owner `
  --no-privileges `
  -f backup.sql

# 2. Clean TEST
psql "postgresql://postgres.mmdjbjbuxivvpvgsvsfj:grekoss123@aws-1-us-east-2.pooler.supabase.com:6543/postgres" `
  -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"

# 3. Restore to TEST
psql "postgresql://postgres.mmdjbjbuxivvpvgsvsfj:grekoss123@aws-1-us-east-2.pooler.supabase.com:6543/postgres" `
  -f backup.sql
```
