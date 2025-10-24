# Instrukcje naprawy błędu 404

## Problem

Next.js musi przeładować routing po przeniesieniu pliku `generate-plan/route.ts`.

## Rozwiązanie

### Krok 1: Zatrzymaj serwer deweloperski

W swoim terminalu naciśnij `Ctrl+C` aby zatrzymać `npm run dev`

### Krok 2: Wyczyść cache Next.js

```bash
rm -rf .next
```

Lub w PowerShell:

```powershell
Remove-Item -Recurse -Force .next
```

### Krok 3: Uruchom ponownie serwer

```bash
npm run dev
```

### Krok 4: Wyczyść cache przeglądarki

W Chrome/Edge:

- Otwórz DevTools (F12)
- Kliknij prawym na ikonę odświeżania
- Wybierz "Empty Cache and Hard Reload"

Lub użyj: `Ctrl+Shift+R`

## Weryfikacja

Po wykonaniu tych kroków:

1. Otwórz http://localhost:3000/meal-plan
2. W konsoli DevTools powinieneś zobaczyć:
   - `POST /api/profile/generate-plan 200` (zamiast 404)
   - Komunikat o wygenerowaniu brakujących posiłków

## Co zostało zmienione?

### Poprzednia struktura (BŁĘDNA):

```
app/api/profile/me/route.ts              ← GET/PATCH /api/profile/me
app/api/profile/me/generate-plan/route.ts ← 404! Konflikt routingu
```

### Nowa struktura (POPRAWNA):

```
app/api/profile/me/route.ts            ← GET/PATCH /api/profile/me
app/api/profile/generate-plan/route.ts ← POST /api/profile/generate-plan ✅
```

### Zmieniony kod:

- `src/hooks/useAutoGenerateMealPlan.ts:43` - endpoint z `/api/profile/me/generate-plan` → `/api/profile/generate-plan`
