# Database Cloning Scripts

Skrypty do klonowania bazy danych z projektu DEV do projektu TEST w Supabase Cloud.

## 📋 Dostępne Skrypty

### 1. **clone-database.sh / .ps1** - PRZESTARZAŁE ⚠️

Ten skrypt został zastąpiony przez `clone-database-full` (patrz poniżej).

**Uwaga:** Zalecamy używanie `clone-database-full` dla wszystkich operacji klonowania.

---

### 2. **clone-database-full.sh / .ps1** - Klonowanie ze Seed Data ⭐ ZALECANE

Kopiuje **schemat z DEV** + **dane testowe z tabel seed**

- ✅ Szybkie (~1-2min)
- ✅ Dane testowe z `seed_ingredients.sql` i `seed_recipes.sql`
- ✅ Idealne do testów E2E i developmentu
- ✅ Przewidywalne dane testowe

**Użycie:**

```bash
# Linux/Mac
npm run db:clone:full

# Windows
npm run db:clone:full:win
# lub bezpośrednio:
.\scripts\clone-database-full.ps1

# Dry run (test bez zmian)
npm run db:clone:full -- --dry-run

# Pomiń backup TEST (szybciej)
npm run db:clone:full -- --skip-backup
```

**Co robi:**

1. **Backup TEST** (zabezpieczenie przed utratą danych)
2. Zrzuca **schemat DEV** (struktura bez danych)
3. Czyści bazę TEST
4. Naprawia referencje schematów (content → public)
5. Przywraca **schemat do TEST**
6. **Seeduje dane testowe** z `seed_ingredients.sql` i `seed_recipes.sql`
7. Weryfikuje liczby rekordów

---

## 🔧 Konfiguracja

### 1. Przygotuj plik `.env.e2e`

```bash
# Skopiuj przykładowy plik
cp .env.e2e.example .env.e2e
```

### 2. Uzupełnij URL-e baz danych

```env
# .env.e2e
SOURCE_DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
TARGET_DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[TEST-PROJECT].supabase.co:5432/postgres"
```

### 3. Zainstaluj PostgreSQL Client Tools

**Windows:**

```powershell
# Opcja 1: Chocolatey
choco install postgresql

# Opcja 2: Ręcznie
# Pobierz z: https://www.postgresql.org/download/windows/
# Dodaj do PATH: C:\Program Files\PostgreSQL\16\bin
```

**Mac:**

```bash
brew install postgresql
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt-get install postgresql-client
```

---

## 📊 Aktualne Rozwiązanie

**clone-database-full** (zalecane):

- ✅ **Schemat bazy**: TAK (z DEV)
- ✅ **Dane testowe**: TAK (z seed_ingredients.sql i seed_recipes.sql)
- ⏱️ **Czas wykonania**: ~1-2min
- 📦 **Rozmiar backupu**: ~500KB-2MB
- 🔒 **Backup TEST**: TAK (opcjonalne)
- 🎯 **Najlepsze do**: Testy E2E, Development, CI/CD

---

## 🎯 Kiedy używać `clone-database-full`?

Używaj dla:

- ✅ **Testy E2E** - przewidywalne dane testowe
- ✅ **Development** - szybki setup środowiska
- ✅ **CI/CD pipelines** - automatyczne seedowanie
- ✅ **Testing nowych funkcji** - kontrolowane dane
- ✅ **Staging environment** - konsystentne dane testowe

**Zalety seed data:**

- 🔄 Powtarzalne i przewidywalne dane
- 📝 Wersjonowane w Git (seed_ingredients.sql, seed_recipes.sql)
- ⚡ Szybsze niż klonowanie pełnych danych produkcyjnych
- 🎯 Dostosowane do testów i developmentu

---

## 🔍 Weryfikacja

Po sklonowaniu sprawdź dane:

```bash
# Zweryfikuj liczbę rekordów
psql $TARGET_DATABASE_URL -c "SELECT COUNT(*) FROM public.ingredients;"
psql $TARGET_DATABASE_URL -c "SELECT COUNT(*) FROM public.recipes;"

# Sprawdź wszystkie tabele
psql $TARGET_DATABASE_URL -c "\dt public.*"
```

---

## 📁 Backupy

Wszystkie backupy są zapisywane w katalogu `backups/`:

```
backups/
├── schema-dump-20251028_120000.sql           # Dump schematu z DEV
├── test-db-backup-before-clone-*.sql         # Backup TEST (przed klonem)
└── ...
```

**Automatyczne czyszczenie:** Skrypty zachowują **ostatnie 5 backupów** każdego typu.

**Seed Data:**

- `supabase/seed_ingredients.sql` - Dane składników (schema: content) - ŹRÓDŁO
- `supabase/seed_recipes.sql` - Dane przepisów (schema: content) - ŹRÓDŁO
- `supabase/seed_ingredients_public.sql` - Dane składników (schema: public) ⭐ UŻYWANE przez skrypty
- `supabase/seed_recipes_public.sql` - Dane przepisów (schema: public) ⭐ UŻYWANE przez skrypty

**Uwaga:**

- Skrypty klonowania używają wersji `_public`, które wstawiają dane do schematu `public` zamiast `content`
- Pliki `_public` są generowane automatycznie ze źródłowych plików za pomocą:
  ```bash
  npm run db:generate-seeds      # Linux/Mac
  npm run db:generate-seeds:win  # Windows
  ```
- Proces generowania:
  1. Zamienia `content.*` na `public.*`
  2. Dodaje prefix `public.` do ENUM-ów (np. `meal_type_enum` → `public.meal_type_enum`)

---

## ⚠️ Uwagi Bezpieczeństwa

1. **NIE commituj** plików `.env.e2e` do Git (już w .gitignore)
2. **NIE udostępniaj** plików backup z produkcyjnymi danymi
3. **Używaj** różnych haseł dla DEV i TEST
4. **Sprawdź** czy backupy nie zawierają wrażliwych danych przed udostępnieniem

---

## 🐛 Troubleshooting

**📚 Pełny przewodnik troubleshooting:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Najczęstsze problemy:

#### `pg_dump: executing SELECT pg_catalog.set_config('search_path', '', false);`

**Rozwiązanie:** Użyj direct connection (port 5432) zamiast pooler (port 6543)

```bash
# W .env.e2e zamień:
# postgresql://...pooler.supabase.com:6543/postgres
# na:
# postgresql://postgres:PASS@db.PROJECT.supabase.co:5432/postgres
```

#### `psql: command not found`

**Rozwiązanie:** Zainstaluj PostgreSQL Client Tools

```powershell
choco install postgresql  # Windows
brew install postgresql    # Mac
```

#### `password authentication failed`

**Rozwiązanie:** Zresetuj hasło w Supabase Dashboard i zaktualizuj `.env.e2e`

#### `connection refused`

**Rozwiązanie:**

- Sprawdź czy projekty Supabase są aktywne (nie paused)
- Sprawdź format connection stringu
- Test: `psql "$SOURCE_DATABASE_URL" -c "SELECT version();"`

**Więcej rozwiązań:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📚 Dodatkowe Zasoby

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [PostgreSQL pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)
- [PostgreSQL psql](https://www.postgresql.org/docs/current/app-psql.html)
