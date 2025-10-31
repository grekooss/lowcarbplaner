# 🔧 Jak uzyskać Database Connection String z Supabase

Aby używać skryptów klonowania bazy danych, potrzebujesz **PostgreSQL connection strings**, a nie URL-i HTTP.

---

## 📋 Krok po kroku

### 1. Otwórz Supabase Dashboard

Przejdź do: https://app.supabase.com

---

### 2. Wybierz projekt DEV (źródłowy)

1. Kliknij na swój projekt **DEV** (źródło danych)
2. W lewym menu wybierz: **Settings** ⚙️
3. Wybierz: **Database** 🗄️
4. Przewiń do sekcji: **Connection String**

---

### 3. Skopiuj Connection String

Znajdziesz kilka opcji:

```
URI                  ← ZALECANE dla pg_dump!
Session mode
Transaction mode
```

**Dla klonowania bazy zalecamy: URI (direct connection, port 5432)**

String wygląda tak:

```
postgresql://postgres:[YOUR-PASSWORD]@db.pkjdgaqwdletfkvniljx.supabase.co:5432/postgres
```

**Alternatywnie możesz użyć Transaction mode (port 6543):**

```
postgresql://postgres.pkjdgaqwdletfkvniljx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

⚠️ **Uwaga:** Jeśli masz problemy z Transaction mode, użyj URI (direct connection).

---

### 4. Zamień `[YOUR-PASSWORD]` na prawdziwe hasło

1. W tym samym miejscu (Database Settings) znajdź sekcję: **Database password**
2. Kliknij: **Reset database password** (jeśli nie pamiętasz hasła)
3. Skopiuj nowe hasło
4. Zamień `[YOUR-PASSWORD]` w connection stringu na prawdziwe hasło

**Przykład:**

```
# PRZED:
postgresql://postgres.pkjdgaqwdletfkvniljx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# PO (z prawdziwym hasłem):
postgresql://postgres.pkjdgaqwdletfkvniljx:MySecretPass123!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

---

### 5. Powtórz dla projektu TEST (docelowy)

1. Wróć do listy projektów
2. Wybierz projekt **TEST** (docelowa baza)
3. Powtórz kroki 2-4 dla projektu TEST
4. Zapisz drugi connection string

---

### 6. Uzupełnij `.env.e2e`

Otwórz plik `.env.e2e` i uzupełnij:

```bash
# ❌ NIEPRAWIDŁOWE (HTTP URLs):
SOURCE_DATABASE_URL=https://pkjdgaqwdletfkvniljx.supabase.co
TARGET_DATABASE_URL=https://mmdjbjbuxivvpvgsvsfj.supabase.co

# ✅ PRAWIDŁOWE (PostgreSQL connection strings):
SOURCE_DATABASE_URL=postgresql://postgres.pkjdgaqwdletfkvniljx:DevPassword123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
TARGET_DATABASE_URL=postgresql://postgres.mmdjbjbuxivvpvgsvsfj:TestPassword456@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

---

## 📸 Screenshot Guide

### Gdzie znaleźć Connection String:

```
Supabase Dashboard
└── Select Project
    └── Settings (⚙️ left sidebar)
        └── Database (🗄️)
            └── Connection String section
                └── Transaction mode ← COPY THIS!
```

### Sekcja wygląda tak:

```
┌─────────────────────────────────────────────────────────────┐
│ Connection String                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ URI:                                                        │
│ postgresql://postgres:[YOUR-PASSWORD]@db.xxx...            │
│                                                             │
│ Session mode:                                               │
│ postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0...6543...  │
│                                                             │
│ Transaction mode:  ← USE THIS!                             │
│ postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0...6543...  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Uwagi Bezpieczeństwa

1. **NIE commituj** pliku `.env.e2e` do Git (już w .gitignore)
2. **Używaj różnych haseł** dla DEV i TEST
3. **Regularnie resetuj** hasła bazy danych
4. **Nigdy nie udostępniaj** connection stringów publicznie

---

## ✅ Weryfikacja

Po uzupełnieniu sprawdź czy connection stringi działają:

```powershell
# Test połączenia do DEV
psql "$env:SOURCE_DATABASE_URL" -c "SELECT version();"

# Test połączenia do TEST
psql "$env:TARGET_DATABASE_URL" -c "SELECT version();"
```

Jeśli widzisz wersję PostgreSQL - wszystko działa! ✅

---

## 🚀 Następne kroki

Teraz możesz uruchomić klonowanie:

```powershell
# Test (dry run)
npm run db:clone:full:win -- -DryRun

# Prawdziwe klonowanie
npm run db:clone:full:win
```

---

## 🐛 Troubleshooting

### Problem: "connection to localhost failed"

**Przyczyna:** Używasz HTTP URL zamiast PostgreSQL connection string
**Rozwiązanie:** Sprawdź czy w `.env.e2e` masz connection stringi zaczynające się od `postgresql://`

### Problem: "password authentication failed"

**Przyczyna:** Nieprawidłowe hasło w connection stringu
**Rozwiązanie:** Zresetuj hasło w Supabase Dashboard i zaktualizuj `.env.e2e`

### Problem: "could not translate host name"

**Przyczyna:** Nieprawidłowy format connection stringu
**Rozwiązanie:** Upewnij się że skopiowałeś **Transaction mode** connection string (port 6543)
