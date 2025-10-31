# 🚀 Rozpocznij Tutaj - E2E Tests Quick Start

## 🔴 PILNE - Testy są zablokowane!

**Problem**: Brak uprawnień w bazie danych Supabase
**Rozwiązanie**: 5 minut pracy w Supabase Dashboard

---

## ⚡ Szybka Naprawa (3 kroki)

### 1️⃣ Sprawdź Uprawnienia

Otwórz: **[check-permissions-simple.sql](./check-permissions-simple.sql)** ⚡ (Proste, 3 zapytania)

1. Przejdź do: https://supabase.com/dashboard
2. Wybierz projekt: `mmdjbjbuxivvpvgsvsfj`
3. Kliknij **SQL Editor**
4. Skopiuj zawartość `check-permissions-simple.sql`
5. Wklej i uruchom (Ctrl+Enter)

**Czy widzisz `service_role` z uprawnieniem INSERT w Query 1?**

- ✅ **TAK** → Przejdź do kroku 3
- ❌ **NIE** → Przejdź do kroku 2

> **Alternatywa**: Pełna diagnostyka w [check-permissions.sql](./check-permissions.sql)

---

### 2️⃣ Napraw Uprawnienia

Otwórz: **[fix-permissions-complete.sql](./fix-permissions-complete.sql)**

1. W tym samym SQL Editor w Supabase
2. Skopiuj **całą zawartość** `fix-permissions-complete.sql`
3. Wklej i uruchom (Ctrl+Enter)
4. Sprawdź wyniki weryfikacji na końcu

**Oczekiwany wynik**:

```
grantee       | privilege_type
--------------|---------------
service_role  | SELECT
service_role  | INSERT
service_role  | UPDATE
service_role  | DELETE
```

---

### 3️⃣ Uruchom Testy

```bash
npm run test:e2e:chromium
```

**Oczekiwany wynik**:

```
✅ Created test user: test-xxx@lowcarbplaner.test
✅ Created test profile for: test-xxx@lowcarbplaner.test

  68 passed (2-3 min)
```

---

## 📚 Szczegółowe Przewodniki

| Plik                                                               | Co zawiera                | Kiedy użyć        |
| ------------------------------------------------------------------ | ------------------------- | ----------------- |
| **[SPRAWDZ_UPRAWNIENIA.md](./SPRAWDZ_UPRAWNIENIA.md)** 🇵🇱          | Szczegółowy przewodnik PL | Krok po kroku     |
| **[fix-permissions-complete.sql](./fix-permissions-complete.sql)** | Gotowy SQL do naprawy     | Skopiuj i uruchom |
| **[check-permissions.sql](./check-permissions.sql)**               | SQL do sprawdzenia        | Diagnostyka       |
| **[ACTION_REQUIRED.md](./ACTION_REQUIRED.md)** 🇬🇧                  | English guide             | English speakers  |
| **[QUICK_FIX.md](./QUICK_FIX.md)** 🇬🇧                              | 3-step fix EN             | Fast reference    |

---

## 🆘 Najczęstsze Problemy

### ❌ "permission denied for schema public"

**Rozwiązanie**: Uruchom `fix-permissions-complete.sql` w Supabase

### ❌ "policy already exists"

**To normalne!** Skrypt sprawdza czy polityka istnieje przed utworzeniem.
Sprawdź czy na końcu widzisz wyniki weryfikacji.

### ❌ Testy nadal failują po SQL

1. Sprawdź czy użyłeś **właściwego projektu** (`mmdjbjbuxivvpvgsvsfj`)
2. Sprawdź `.env.e2e`:
   ```bash
   cat .env.e2e | grep -E "SUPABASE_URL|SERVICE_ROLE"
   ```
3. Zobacz szczegóły: [SPRAWDZ_UPRAWNIENIA.md](./SPRAWDZ_UPRAWNIENIA.md)

---

## ✅ Status Implementacji

**Co jest zrobione**:

- ✅ 68 testów E2E (+56 nowych)
- ✅ Naprawiona infrastruktura
- ✅ CI/CD z GitHub Actions
- ✅ Kompletna dokumentacja

**Co musisz zrobić**:

- 🔧 Uruchomić SQL w Supabase (5 minut)
- ✅ Uruchomić testy ponownie

---

## 🎯 Podsumowanie

1. **Sprawdź**: [check-permissions.sql](./check-permissions.sql)
2. **Napraw**: [fix-permissions-complete.sql](./fix-permissions-complete.sql)
3. **Testuj**: `npm run test:e2e:chromium`

**Czas**: ~5-10 minut
**Efekt**: Wszystkie 68 testów działają ✅

---

## 📞 Potrzebujesz Pomocy?

- **Polski przewodnik**: [SPRAWDZ_UPRAWNIENIA.md](./SPRAWDZ_UPRAWNIENIA.md)
- **English guide**: [ACTION_REQUIRED.md](./ACTION_REQUIRED.md)
- **Szczegóły techniczne**: [TEST_ISSUES_REPORT.md](./TEST_ISSUES_REPORT.md)

---

**Ostatnia aktualizacja**: 29 października 2025
