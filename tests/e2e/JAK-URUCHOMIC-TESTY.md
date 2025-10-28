# 🎯 Jak uruchomić testy E2E - PROSTY PRZEWODNIK

## ✅ Co już masz gotowe:

- ✅ Baza danych testowa z danymi
- ✅ Uprawnienia do bazy skonfigurowane
- ✅ Playwright zainstalowany
- ✅ Środowisko `.env.e2e` skonfigurowane

---

## 🚀 Metoda 1: Skrypt BAT (NAJPROSTRZY)

### **Krok 1:** Otwórz PowerShell lub CMD w katalogu projektu

```cmd
cd C:\Aplikacje\lowcarbplaner
```

### **Krok 2:** Uruchom jeden z wariantów:

**WAŻNE:** W PowerShell użyj `.\` przed nazwą skryptu!

```powershell
# Wszystkie testy (headless - szybkie)
.\run-e2e-tests.bat

# Pojedynczy test login (headless)
.\run-e2e-tests.bat login

# Z widoczną przeglądarką
.\run-e2e-tests.bat headed

# Tryb UI (interaktywny) - POLECAM!
.\run-e2e-tests.bat ui
```

**W CMD (Command Prompt)** możesz bez `.\`:

```batch
run-e2e-tests.bat ui
```

---

## 🎨 Metoda 2: Skrypt PowerShell (ZAAWANSOWANY)

### **Krok 1:** Otwórz PowerShell w katalogu projektu

```powershell
cd C:\Aplikacje\lowcarbplaner
```

### **Krok 2:** Uruchom jeden z wariantów:

```powershell
# Wszystkie testy (headless)
.\run-e2e-tests.ps1

# Z widoczną przeglądarką
.\run-e2e-tests.ps1 -Headed

# Tryb UI (interaktywny)
.\run-e2e-tests.ps1 -UI

# Tryb debug (krok po kroku)
.\run-e2e-tests.ps1 -Debug

# Tylko konkretny test
.\run-e2e-tests.ps1 -Test login
```

### **Problem z uprawnieniami?**

Jeśli PowerShell odmawia uruchomienia, włącz wykonywanie skryptów:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🎬 Metoda 3: Bezpośrednio NPM (DLA DOŚWIADCZONYCH)

```bash
# Wszystkie testy E2E
npm run test:e2e

# Tylko Chromium
npm run test:e2e:chromium

# Z widoczną przeglądarką
npm run test:e2e:headed

# Tryb UI
npm run test:e2e:ui

# Zobacz raport
npm run test:e2e:report
```

---

## 📋 Dostępne testy:

```
tests/e2e/
├── auth/
│   ├── login.spec.ts          - Testy logowania
│   └── registration.spec.ts   - Testy rejestracji
│
└── dashboard/
    ├── ingredient-editing.spec.ts  - Edycja składników
    └── recipe-swapping.spec.ts     - Zamiana przepisów
```

---

## 🐛 Rozwiązywanie problemów:

### **Problem: "The term 'run-e2e-tests.bat' is not recognized" (PowerShell)**

**Przyczyna:** PowerShell wymaga `.\` przed skryptami w bieżącym katalogu

**Rozwiązanie:**

```powershell
# ❌ ZŁE (nie działa w PowerShell)
run-e2e-tests.bat ui

# ✅ DOBRE (działa!)
.\run-e2e-tests.bat ui
```

**ALBO** użyj skryptu PowerShell:

```powershell
.\run-e2e-tests.ps1 -UI
```

### **Problem: "Invalid email or password" w testach**

**Przyczyna:** Aplikacja Next.js używa innej bazy danych niż testy

**Rozwiązanie:**

1. Sprawdź czy `.env.e2e` ma poprawny URL testowej bazy
2. Upewnij się, że RLS (Row Level Security) jest wyłączony w bazie testowej
3. Uruchom ponownie Playwright UI - zmiana konfiguracji wymaga restartu

**Jak to działa?**

- Playwright uruchamia dedykowany skrypt `scripts/start-e2e-server.js`
- Skrypt ładuje `.env.e2e` PRZED startem Next.js
- Next.js używa zmiennych z `.env.e2e` zamiast `.env.local`

### **Problem: Przeglądarka się nie otwiera w trybie --headed**

**Rozwiązanie:** To znany problem na Windows. Użyj:

- `run-e2e-tests.bat ui` - otwiera interfejs Playwright
- Albo uruchom testy headless (bez przeglądarki)

### **Problem: Błąd "permission denied for schema public"**

**Rozwiązanie:** Wykonałeś już SQL z uprawnieniami, ale jeśli wraca:

1. Idź do Supabase Dashboard → SQL Editor
2. Wykonaj ponownie:

```sql
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
```

### **Problem: "Could not find table ingredients"**

**Rozwiązanie:**

1. Sprawdź, czy jesteś w właściwym projekcie Supabase (mmdjbjbuxivvpvgsvsfj)
2. Zaimportuj ponownie `supabase/test-seed.sql` przez SQL Editor

### **Problem: Timeout waiting for page**

**Rozwiązanie:**

1. Sprawdź, czy serwer dev działa: `npm run dev` (w osobnym terminalu)
2. Albo poczekaj - pierwszy start może trwać 2-3 minuty

---

## 💡 Wskazówki:

### **Dla początkujących:**

- Zacznij od `run-e2e-tests.bat ui` - zobaczysz graficzny interfejs
- Kliknij na test, żeby go uruchomić
- Zobacz krok po kroku, co się dzieje

### **Dla zaawansowanych:**

- Używaj `--headed` żeby zobaczyć, co test robi
- Używaj `--debug` żeby zatrzymać test na każdym kroku
- Używaj `--reporter=html` żeby dostać szczegółowy raport

### **Najszybszy sposób:**

```batch
run-e2e-tests.bat login
```

Uruchomi tylko test logowania (najszybszy test ~30s)

---

## 📊 Jak czytać wyniki?

### **✅ Test przeszedł:**

```
✓ tests/e2e/auth/login.spec.ts:4:3 › should successfully login
```

### **❌ Test nie przeszedł:**

```
✗ tests/e2e/auth/login.spec.ts:21:3 › should show error
  Error: Timeout waiting for element
```

### **📸 Gdzie są screenshoty?**

- `test-results/` - screenshoty z błędów
- `playwright-report/` - pełny raport HTML

---

## 🎓 Następne kroki:

1. **Uruchom pierwszy test:**

   ```batch
   run-e2e-tests.bat login
   ```

2. **Zobacz raport:**

   ```batch
   npm run test:e2e:report
   ```

3. **Eksperymentuj z testami:**
   - Zmodyfikuj [tests/e2e/auth/login.spec.ts](tests/e2e/auth/login.spec.ts)
   - Dodaj `console.log()` żeby zobaczyć, co się dzieje
   - Uruchom ponownie test

---

## 📚 Dokumentacja:

- [QUICKSTART.md](tests/e2e/QUICKSTART.md) - Szybki start
- [README.md](tests/e2e/README.md) - Pełna dokumentacja
- [DATABASE_SETUP.md](tests/e2e/DATABASE_SETUP.md) - Setup bazy danych

---

## ❓ Pytania?

Jeśli coś nie działa, sprawdź:

1. Czy serwer dev działa? (`npm run dev`)
2. Czy `.env.e2e` ma poprawne dane?
3. Czy baza testowa ma dane? (Sprawdź w Supabase Dashboard)

**Powodzenia! 🚀**
