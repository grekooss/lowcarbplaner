# Tymczasowe Wyłączenie Autentykacji dla Shopping List

**Data:** 2025-10-18
**Status:** ⚠️ **Temporary Development Mode**

---

## 🎯 Cel

Umożliwienie testowania widoku Shopping List (`/shopping-list`) bez wymagania logowania dla celów developmentu i testowania UI.

---

## ✏️ Wprowadzone Zmiany

### 1. **app/shopping-list/page.tsx**

📁 [app/shopping-list/page.tsx](../app/shopping-list/page.tsx)

**Zmieniono:**

```typescript
// PRZED:
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const supabase = await createServerClient()
const {
  data: { user },
} = await supabase.auth.getUser()
if (!user) redirect('/login')

// PO:
// TODO: Przywrócić autentykację po testach
// const supabase = await createServerClient()
// const { data: { user } } = await supabase.auth.getUser()
// if (!user) redirect('/login')
```

**Efekt:**

- ✅ Strona `/shopping-list` dostępna bez logowania
- ✅ Brak redirectu na `/login`

---

### 2. **src/lib/actions/shopping-list.ts**

📁 [src/lib/actions/shopping-list.ts](../src/lib/actions/shopping-list.ts)

**Zmieniono:**

```typescript
// PRZED:
import { createServerClient } from '@/lib/supabase/server'

const supabase = await createServerClient()
const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser()

if (authError || !user) {
  return {
    error: 'Brak autoryzacji. Wymagane logowanie.',
    code: 'UNAUTHORIZED',
  }
}

const shoppingList = await generateShoppingList(user.id, start_date, end_date)

// PO:
// import { createServerClient } from '@/lib/supabase/server' // TODO: Przywrócić po testach

// TODO: Przywrócić autentykację po testach
// const supabase = await createServerClient()
// const { data: { user }, error: authError } = await supabase.auth.getUser()
// if (authError || !user) {
//   return { error: 'Brak autoryzacji. Wymagane logowanie.', code: 'UNAUTHORIZED' }
// }

// TEMPORARY: Hardcoded user ID dla testów
const userId = '00000000-0000-0000-0000-000000000000' // UUID placeholder

const shoppingList = await generateShoppingList(userId, start_date, end_date)
```

**Efekt:**

- ✅ Server Action `getShoppingList` działa bez autentykacji
- ✅ Używa hardcoded user ID: `00000000-0000-0000-0000-000000000000`
- ⚠️ W produkcji zwróci pustą listę (brak planned meals dla tego user ID)

---

## ⚠️ Ważne Uwagi

### **Dla Testowania:**

1. Strona `/shopping-list` będzie dostępna bez logowania
2. Lista zakupów będzie pusta (brak planned meals dla hardcoded user ID)
3. Wszystkie funkcjonalności UI działają (localStorage, sortowanie, zaznaczanie)
4. Można testować EmptyState i wszystkie komponenty

### **Dla Produkcji:**

🚨 **PRZED DEPLOYMENTEM NALEŻY PRZYWRÓCIĆ AUTENTYKACJĘ!**

---

## 🔄 Jak Przywrócić Autentykację

### Krok 1: app/shopping-list/page.tsx

```typescript
// Odkomentuj:
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const supabase = await createServerClient()
const {
  data: { user },
} = await supabase.auth.getUser()
if (!user) redirect('/login')

// Usuń komentarz TODO
```

### Krok 2: src/lib/actions/shopping-list.ts

```typescript
// Odkomentuj:
import { createServerClient } from '@/lib/supabase/server'

const supabase = await createServerClient()
const {
  data: { user },
  error: authError,
} = await supabase.auth.getUser()

if (authError || !user) {
  return {
    error: 'Brak autoryzacji. Wymagane logowanie.',
    code: 'UNAUTHORIZED',
  }
}

const shoppingList = await generateShoppingList(user.id, start_date, end_date)

// Usuń:
// const userId = '00000000-0000-0000-0000-000000000000'
// const shoppingList = await generateShoppingList(userId, start_date, end_date)

// Usuń komentarze TODO
```

### Krok 3: Weryfikacja

```bash
npm run type-check  # Sprawdź TypeScript
npm run lint        # Sprawdź ESLint
npm run build       # Sprawdź czy build przechodzi
```

---

## ✅ Status TypeScript & ESLint

**TypeScript type-check:** ✅ Passed
**ESLint check:** ✅ Passed
**Build:** ⏳ Not tested (inne błędy API endpoints)

---

## 📝 Pliki Zmodyfikowane

1. `app/shopping-list/page.tsx` - wyłączono sprawdzenie autentykacji
2. `src/lib/actions/shopping-list.ts` - hardcoded user ID dla testów
3. `.ai/TEMP-no-auth-shopping-list.md` - dokumentacja zmian (ten plik)

---

## 🎯 Kolejne Kroki

1. ✅ Strona dostępna bez logowania
2. ⏳ Uruchomić dev server: `npm run dev`
3. ⏳ Przetestować widok `/shopping-list` w przeglądarce
4. ⏳ Przetestować wszystkie funkcjonalności UI
5. ⏳ Przywrócić autentykację przed deploymentem

---

**Uwaga:** Ten plik (`.ai/TEMP-no-auth-shopping-list.md`) należy usunąć po przywróceniu autentykacji.
