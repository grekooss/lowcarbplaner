# 🎯 Podsumowanie problemu i rozwiązania E2E

## ❌ Problem

**Aplikacja Next.js używa bazy DEV zamiast testowej podczas testów E2E.**

### Dowód:

```
❌ Dev DB requests (pkjdgaqwdletfkvniljx): 20
✅ Test DB requests (mmdjbjbuxivvpvgsvsfj): 0
```

### Przyczyna:

Next.js 15 ładuje zmienne środowiskowe podczas **startu procesu**, a nie z `playwright.config.ts`.

- `dotenv-cli` przekazuje zmienne do procesu `npm run dev`
- Ale Next.js już wcześniej załadował `.env.local`
- Zmienne z `dotenv-cli` są ignorowane przez Next.js

## ✅ Rozwiązanie

### Opcja 1: Restart serwera przy każdym teście (OBECNE)

**Wymaga:** Wyłączenie `reuseExistingServer`

```typescript
webServer: {
  command: 'npx dotenv-cli -e .env.e2e -- npm run dev',
  reuseExistingServer: false  // ← Zawsze restartuj z .env.e2e
}
```

### Opcja 2: Tymczasowa podmiana pliku (ZALECANE)

Przed testami:

1. Skopiuj `.env.local` → `.env.local.backup`
2. Skopiuj `.env.e2e` → `.env.local`
3. Uruchom testy
4. Przywróć `.env.local.backup` → `.env.local`

### Opcja 3: Użyj Next.js 15 env file priority

Ustaw `DOTENV_CONFIG_PATH=.env.e2e` w playwright.config.ts

## 📝 Kroki do naprawy

1. **Zatrzymaj wszystkie działające serwery Next.js**

   ```bash
   # Znajdź procesy
   netstat -ano | findstr :3000
   # Zabij proces
   taskkill /PID <PID> /F
   ```

2. **Zmień `reuseExistingServer` na `false`**

   ```typescript
   // playwright.config.ts
   webServer: {
     reuseExistingServer: false // ← ZMIEŃ NA FALSE
   }
   ```

3. **Uruchom test ponownie**
   ```bash
   npx playwright test tests/e2e/auth/login.spec.ts
   ```

## 🔍 Weryfikacja

Uruchom test diagnostyczny:

```bash
npx playwright test tests/e2e/diagnostic-env.spec.ts
```

Powinien pokazać:

```
✅ SUCCESS: Application is using TEST database!
✅ Test DB requests (mmdjbjbuxivvpvgsvsfj): >0
❌ Dev DB requests (pkjdgaqwdletfkvniljx): 0
```

## 📊 Status

- [x] Problem zidentyfikowany (aplikacja używa DEV DB)
- [x] Test diagnostyczny stworzony
- [ ] **TODO: Zatrzymaj stare procesy Next.js**
- [ ] **TODO: Wyłącz `reuseExistingServer`**
- [ ] **TODO: Przetestuj ponownie**
