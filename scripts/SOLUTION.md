# ⚡ OSTATECZNE ROZWIĄZANIE - pg_dump Version Mismatch

## 🎯 Problem

```
pg_dump: error: aborting because of server version mismatch
```

**Przyczyna:** pg_dump 16.10 ma zbyt restrykcyjną walidację i odmawia pracy z PostgreSQL 15.x (Supabase)

---

## ✅ ROZWIĄZANIE 1: Użyj Supabase CLI (ZALECANE)

Supabase CLI ma wbudowaną kompatybilność i omija problem z wersjami.

### Instalacja:

```powershell
npm install -g supabase
```

### Użycie:

```powershell
# 1. Dump z DEV
supabase db dump --db-url="$env:SOURCE_DATABASE_URL" --data-only -f backups\dev-data.sql

# 2. Clean TEST
psql "$env:TARGET_DATABASE_URL" -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"

# 3. Restore do TEST
psql "$env:TARGET_DATABASE_URL" -f backups\dev-data.sql
```

---

## ✅ ROZWIĄZANIE 2: Downgrade do PostgreSQL 15

Zainstaluj dokładnie tę samą wersję co Supabase.

```powershell
# Odinstaluj PostgreSQL 16
choco uninstall postgresql16

# Zainstaluj PostgreSQL 15
choco install postgresql15

# Zrestartuj terminal i sprawdź
pg_dump --version  # Powinno być 15.x
```

**Po instalacji:**

```powershell
npm run db:clone:full:win
```

---

## ✅ ROZWIĄZANIE 3: Ręczne klonowanie (szybkie)

Pomiń skrypty i zrób to ręcznie:

```powershell
# Ustaw zmienne
$SOURCE = "postgresql://postgres.pkjdgaqwdletfkvniljx:grekoss123@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
$TARGET = "postgresql://postgres.mmdjbjbuxivvpvgsvsfj:grekoss123@aws-1-us-east-2.pooler.supabase.com:6543/postgres"

# 1. Clean TEST database
psql $TARGET -c "DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;"

# 2. Copy data using psql + pg_dump pipe
pg_dump $SOURCE --schema=public --data-only --no-owner --no-privileges | psql $TARGET

# 3. Verify
psql $TARGET -c "SELECT COUNT(*) FROM public.ingredients;"
psql $TARGET -c "SELECT COUNT(*) FROM public.recipes;"
```

---

## 🎯 ZALECENIE

**Najprostsze i najszybsze:** ROZWIĄZANIE 3 (ręczne klonowanie)

Całość zajmie 2-3 minuty i nie wymaga instalacji dodatkowych narzędzi.

---

## 📋 Jeśli chcesz używać skryptów

1. Zainstaluj PostgreSQL 15:

   ```powershell
   choco uninstall postgresql16
   choco install postgresql15
   ```

2. Zrestartuj terminal

3. Uruchom:
   ```powershell
   npm run db:clone:full:win
   ```

---

## 🆘 Dalsze problemy?

Zobacz pełną dokumentację:

- [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- [get-connection-string.md](get-connection-string.md)
