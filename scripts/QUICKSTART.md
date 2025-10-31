# 🚀 Quick Start - Database Cloning

Szybki przewodnik klonowania bazy danych z DEV do TEST dla testów E2E.

---

## ⚡ Szybki Start (3 minuty)

### 1. Przygotuj konfigurację

```bash
# Skopiuj przykładowy plik
cp .env.e2e.example .env.e2e

# Edytuj .env.e2e i uzupełnij:
# - SOURCE_DATABASE_URL (PostgreSQL connection string z projektu DEV)
# - TARGET_DATABASE_URL (PostgreSQL connection string z projektu TEST)
```

💡 **WAŻNE:** Potrzebujesz **PostgreSQL connection strings**, nie HTTP URLs!

**Prawidłowy format:**

```
postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**Nieprawidłowy format:**

```
https://xxx.supabase.co  ❌
```

📚 **Szczegółowy przewodnik:** [setup-database-urls.md](setup-database-urls.md)

---

### 2. Zainstaluj PostgreSQL Client (jednorazowo)

<details>
<summary><strong>Windows</strong></summary>

```powershell
# Opcja 1: Chocolatey (zalecane)
choco install postgresql

# Opcja 2: Ręcznie
# 1. Pobierz z: https://www.postgresql.org/download/windows/
# 2. Zainstaluj (domyślne opcje OK)
# 3. Dodaj do PATH: C:\Program Files\PostgreSQL\16\bin
```

</details>

<details>
<summary><strong>Mac</strong></summary>

```bash
brew install postgresql
```

</details>

<details>
<summary><strong>Linux (Ubuntu/Debian)</strong></summary>

```bash
sudo apt-get update
sudo apt-get install postgresql-client
```

</details>

---

### 3. Uruchom klonowanie

#### Dla testów E2E (zalecane - szybkie):

```bash
npm run db:clone
```

✅ Klonuje schemat + podzbiór danych (10 składników, 5 przepisów)
⏱️ Czas: ~30 sekund

#### Dla staging/debugging (pełna baza):

```bash
npm run db:clone:full
```

✅ Klonuje schemat + WSZYSTKIE dane
⏱️ Czas: ~2-5 minut

---

## ✅ Weryfikacja

Po sklonowaniu sprawdź czy wszystko działa:

```bash
# Sprawdź liczbę składników
psql $TARGET_DATABASE_URL -c "SELECT COUNT(*) FROM public.ingredients;"

# Sprawdź liczbę przepisów
psql $TARGET_DATABASE_URL -c "SELECT COUNT(*) FROM public.recipes;"
```

**Oczekiwane wyniki:**

- `db:clone`: ~10 ingredients, ~5 recipes
- `db:clone:full`: pełna liczba z bazy DEV

---

## 🎯 Co dalej?

Teraz możesz uruchomić testy E2E:

```bash
npm run test:e2e
```

---

## 🐛 Problemy?

### `psql: command not found`

→ Zainstaluj PostgreSQL Client Tools (patrz krok 2)

### `Connection refused`

→ Sprawdź URL-e w `.env.e2e` i hasła

### `permission denied` (Linux/Mac)

```bash
chmod +x scripts/clone-database.sh
chmod +x scripts/clone-database-full.sh
```

### Inne problemy?

→ Zobacz pełną dokumentację: [scripts/README.md](README.md)

---

## 📚 Dodatkowa dokumentacja

- **Pełna dokumentacja:** [scripts/README.md](README.md)
- **Porównanie skryptów:** [scripts/README.md#porównanie-skryptów](README.md#📊-porównanie-skryptów)
- **Troubleshooting:** [scripts/README.md#troubleshooting](README.md#🐛-troubleshooting)
