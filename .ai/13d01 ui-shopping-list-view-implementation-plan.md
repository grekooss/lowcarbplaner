# Plan implementacji widoku Lista Zakupów

## 1. Przegląd

Widok Lista Zakupów to narzędzie ułatwiające użytkownikom cotygodniowe zakupy poprzez automatyczne generowanie zagregowanej listy składników potrzebnych na nadchodzące 6 dni. Głównym celem jest **uproszczenie procesu zakupów** poprzez dostarczenie jednej, kompletnej listy ze zsumowanymi ilościami składników, pogrupowanymi według kategorii (mięso, nabiał, warzywa, itp.).

Kluczowe funkcjonalności:

- Automatyczne generowanie listy zakupów na najbliższe 6 dni (od jutra)
- Agregacja składników z wielu posiłków (sumowanie ilości tego samego składnika)
- Grupowanie według kategorii produktów dla łatwiejszych zakupów
- Odznaczanie kupionych produktów z wizualnym przekreśleniem i przeniesieniem na koniec listy
- Przechowywanie stanu zaznaczenia w localStorage (persistence między sesjami)
- **Ważna informacja:** Lista bazuje na oryginalnych przepisach i nie uwzględnia modyfikacji użytkownika (ingredient_overrides)

## 2. Routing widoku

**Ścieżka:** `/shopping-list`

**Lokalizacja pliku:** `app/shopping-list/page.tsx`

**Middleware:** Automatyczne sprawdzenie autentykacji i przekierowanie na `/login` jeśli użytkownik niezalogowany, lub na `/onboarding` jeśli profil nie jest ukończony.

**Parametry URL:** Brak (lista generowana automatycznie dla dziś + 6 dni)

## 3. Struktura komponentów

```
ShoppingListPage (Server Component)
├── ShoppingListClient (Client Component - wrapper)
│   ├── InfoBanner (Presentation Component)
│   ├── ShoppingListAccordion (Client Component)
│   │   └── AccordionItem (shadcn/ui) xN (jedna na kategorię)
│   │       └── CategorySection (Client Component)
│   │           └── ShoppingListItem (Client Component) xM
│   │               ├── Checkbox (shadcn/ui)
│   │               └── IngredientDetails (Presentation Component)
│   │
│   └── EmptyState (Presentation Component)
```

**Separacja odpowiedzialności:**

- **ShoppingListPage (Server Component):** Initial data fetching (lista zakupów dla 6 dni)
- **ShoppingListClient (Client Component):** Zarządzanie stanem zaznaczonych produktów (localStorage persistence)
- **ShoppingListAccordion:** Kontener dla kategorii z możliwością collapse/expand
- **CategorySection:** Grupa składników w ramach kategorii
- **ShoppingListItem:** Pojedynczy produkt z checkbox i szczegółami (nazwa, ilość, jednostka)
- **Komponenty prezentacyjne:** Rendering UI bez logiki biznesowej

## 4. Szczegóły komponentów

### ShoppingListPage (Server Component)

**Ścieżka:** `app/shopping-list/page.tsx`

**Opis:** Główna strona widoku Listy Zakupów. Server Component odpowiedzialny za wygenerowanie listy zakupów i przekazanie danych do Client Component.

**Główne elementy:**

- Obliczenie zakresu dat: `start_date` = jutro (dziś + 1 dzień), `end_date` = dziś + 6 dni
- Wywołanie Server Action `getShoppingList({ start_date, end_date })`
- Renderowanie `<ShoppingListClient>` z initial data
- SEO metadata (title, description)
- Error boundary dla obsługi błędów

**Obsługiwane interakcje:** Brak (Server Component)

**Warunki walidacji:**

- Walidacja odpowiedzi z `getShoppingList()` (error handling)
- Obsługa pustej listy (brak posiłków w planie)

**Typy:**

- `ShoppingListResponseDTO` - lista kategorii ze składnikami
- `ActionResult<ShoppingListResponseDTO>` - z error handling

**Props:** Brak (root page component)

**Implementacja:**

```typescript
// app/shopping-list/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { getShoppingList } from '@/lib/actions/shopping-list'
import { ShoppingListClient } from '@/components/shopping-list/ShoppingListClient'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Lista Zakupów - LowCarbPlaner',
  description: 'Twoja zagregowana lista zakupów na nadchodzący tydzień'
}

export default async function ShoppingListPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Oblicz zakres dat (jutro + 5 dni = 6 dni)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const endDate = new Date(tomorrow)
  endDate.setDate(tomorrow.getDate() + 5)

  const startDateStr = tomorrow.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  // Pobierz listę zakupów
  const shoppingListResult = await getShoppingList({
    start_date: startDateStr,
    end_date: endDateStr
  })

  const shoppingList = shoppingListResult.error ? [] : shoppingListResult.data

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Lista Zakupów</h1>
      <p className="text-muted-foreground mb-6">
        {startDateStr} - {endDateStr}
      </p>
      <ShoppingListClient initialShoppingList={shoppingList} />
    </main>
  )
}
```

---

### ShoppingListClient (Client Component)

**Ścieżka:** `components/shopping-list/ShoppingListClient.tsx`

**Opis:** Główny wrapper po stronie klienta. Zarządza stanem zaznaczonych produktów (purchased state) z persistence w localStorage oraz integracją z TanStack Query dla re-fetching.

**Główne elementy:**

- `<InfoBanner>` - informacja o bazie listy na oryginalnych przepisach
- Warunkowe renderowanie:
  - Jeśli `shoppingList.length > 0`: `<ShoppingListAccordion>`
  - Jeśli `shoppingList.length === 0`: `<EmptyState>`

**Obsługiwane interakcje:**

- Toggle checkbox produktu → aktualizacja stanu w localStorage
- Automatyczne sortowanie: odznaczone na górze, zaznaczone (przekreślone) na dole

**Warunki walidacji:**

- Sprawdzenie czy `shoppingList.length > 0`
- Walidacja localStorage (fallback do pustego stanu jeśli corrupted)

**Typy:**

- `ShoppingListResponseDTO`
- `PurchasedItemsState` - mapa zaznaczonych produktów { [itemKey: string]: boolean }

**Props:**

```typescript
interface ShoppingListClientProps {
  initialShoppingList: ShoppingListResponseDTO
}
```

**Implementacja pomocnicza:**

```typescript
// types/shopping-list-view.types.ts

/**
 * Stan zaznaczonych produktów (purchased state)
 * Key: category + name (unikalne ID dla produktu)
 * Value: boolean (czy zakupiony)
 */
export type PurchasedItemsState = Record<string, boolean>

/**
 * Helper function: generuje klucz dla produktu
 */
export function getItemKey(category: string, name: string): string {
  return `${category}__${name}`
}

/**
 * Helper function: sortuje produkty (odznaczone na górze, zaznaczone na dole)
 */
export function sortItemsByPurchasedState(
  items: { name: string; total_amount: number; unit: string }[],
  purchasedState: PurchasedItemsState,
  category: string
): {
  name: string
  total_amount: number
  unit: string
  isPurchased: boolean
}[] {
  return items
    .map((item) => ({
      ...item,
      isPurchased: purchasedState[getItemKey(category, item.name)] || false,
    }))
    .sort((a, b) => {
      // Odznaczone (false) przed zaznaczonymi (true)
      if (a.isPurchased === b.isPurchased) return 0
      return a.isPurchased ? 1 : -1
    })
}
```

**Implementacja:**

```typescript
// components/shopping-list/ShoppingListClient.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { ShoppingListAccordion } from './ShoppingListAccordion'
import { InfoBanner } from './InfoBanner'
import { EmptyState } from './EmptyState'
import type { ShoppingListResponseDTO } from '@/types/dto.types'
import type { PurchasedItemsState } from '@/types/shopping-list-view.types'

const STORAGE_KEY = 'shopping-list-purchased'

export const ShoppingListClient = ({ initialShoppingList }: ShoppingListClientProps) => {
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItemsState>({})

  // Load purchased state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setPurchasedItems(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load purchased items from localStorage:', error)
    }
  }, [])

  // Save purchased state to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(purchasedItems))
    } catch (error) {
      console.error('Failed to save purchased items to localStorage:', error)
    }
  }, [purchasedItems])

  const handleTogglePurchased = (category: string, itemName: string) => {
    const key = `${category}__${itemName}`
    setPurchasedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (initialShoppingList.length === 0) {
    return (
      <EmptyState />
    )
  }

  return (
    <div className="space-y-6">
      <InfoBanner />
      <ShoppingListAccordion
        shoppingList={initialShoppingList}
        purchasedItems={purchasedItems}
        onTogglePurchased={handleTogglePurchased}
      />
    </div>
  )
}
```

---

### InfoBanner (Presentation Component)

**Ścieżka:** `components/shopping-list/InfoBanner.tsx`

**Opis:** Banner informacyjny o tym, że lista bazuje na oryginalnych przepisach (bez modyfikacji użytkownika).

**Główne elementy:**

- `<Alert>` z shadcn/ui (variant="default" lub "info")
- Ikona `<Info>` z lucide-react
- Tekst: "Lista zakupów bazuje na oryginalnym planie i nie uwzględnia Twoich modyfikacji składników."

**Obsługiwane interakcje:** Brak

**Warunki walidacji:** Brak

**Typy:** Brak specjalnych typów

**Props:** Brak (statyczny content)

**Implementacja:**

```typescript
// components/shopping-list/InfoBanner.tsx
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'

export const InfoBanner = () => {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription>
        Lista zakupów bazuje na oryginalnym planie i nie uwzględnia Twoich modyfikacji składników.
      </AlertDescription>
    </Alert>
  )
}
```

---

### ShoppingListAccordion (Client Component)

**Ścieżka:** `components/shopping-list/ShoppingListAccordion.tsx`

**Opis:** Accordion container dla kategorii produktów. Każda kategoria to osobny AccordionItem z możliwością collapse/expand.

**Główne elementy:**

- `<Accordion>` z shadcn/ui (type="multiple" - wiele kategorii może być otwartych jednocześnie)
- Mapowanie `shoppingList.map(category => <AccordionItem>)`
- Wewnątrz każdego `<AccordionItem>`:
  - `<AccordionTrigger>` z nazwą kategorii i licznikiem produktów
  - `<AccordionContent>` z `<CategorySection>`

**Obsługiwane interakcje:**

- Collapse/Expand kategorii (Accordion z shadcn/ui)
- Przekazywanie `onTogglePurchased` callback do CategorySection

**Warunki walidacji:**

- Sortowanie kategorii alfabetycznie (już posortowane z API, ale weryfikacja)

**Typy:**

- `ShoppingListResponseDTO`
- `PurchasedItemsState`

**Props:**

```typescript
interface ShoppingListAccordionProps {
  shoppingList: ShoppingListResponseDTO
  purchasedItems: PurchasedItemsState
  onTogglePurchased: (category: string, itemName: string) => void
}
```

**Implementacja:**

```typescript
// components/shopping-list/ShoppingListAccordion.tsx
'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { CategorySection } from './CategorySection'
import { INGREDIENT_CATEGORY_LABELS } from '@/types/recipes-view.types'
import type { ShoppingListResponseDTO } from '@/types/dto.types'
import type { PurchasedItemsState } from '@/types/shopping-list-view.types'

export const ShoppingListAccordion = ({
  shoppingList,
  purchasedItems,
  onTogglePurchased,
}: ShoppingListAccordionProps) => {
  return (
    <Accordion type="multiple" className="w-full space-y-2">
      {shoppingList.map((categoryData) => {
        const categoryLabel = INGREDIENT_CATEGORY_LABELS[categoryData.category]
        const itemCount = categoryData.items.length

        return (
          <AccordionItem
            key={categoryData.category}
            value={categoryData.category}
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-semibold text-lg">{categoryLabel}</span>
                <span className="text-sm text-muted-foreground">
                  {itemCount} {itemCount === 1 ? 'produkt' : 'produkty'}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <CategorySection
                category={categoryData.category}
                items={categoryData.items}
                purchasedItems={purchasedItems}
                onTogglePurchased={onTogglePurchased}
              />
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
```

---

### CategorySection (Client Component)

**Ścieżka:** `components/shopping-list/CategorySection.tsx`

**Opis:** Sekcja dla jednej kategorii produktów. Sortuje produkty (odznaczone na górze, zaznaczone na dole) i renderuje listę `<ShoppingListItem>`.

**Główne elementy:**

- `<ul>` wrapper (semantyczny HTML)
- Mapowanie posortowanych items:
  ```tsx
  sortedItems.map(item => <ShoppingListItem key={item.name} ... />)
  ```

**Obsługiwane interakcje:**

- Przekazywanie `onTogglePurchased` callback do ShoppingListItem

**Warunki walidacji:**

- Sortowanie items: odznaczone (isPurchased: false) przed zaznaczonymi (isPurchased: true)
- Użycie helper function `sortItemsByPurchasedState`

**Typy:**

- `Enums<'ingredient_category_enum'>` - category
- Item type: `{ name: string; total_amount: number; unit: string }`
- `PurchasedItemsState`

**Props:**

```typescript
interface CategorySectionProps {
  category: Enums<'ingredient_category_enum'>
  items: { name: string; total_amount: number; unit: string }[]
  purchasedItems: PurchasedItemsState
  onTogglePurchased: (category: string, itemName: string) => void
}
```

**Implementacja:**

```typescript
// components/shopping-list/CategorySection.tsx
'use client'

import { useMemo } from 'react'
import { ShoppingListItem } from './ShoppingListItem'
import { sortItemsByPurchasedState, getItemKey } from '@/types/shopping-list-view.types'
import type { Enums } from '@/types/database.types'
import type { PurchasedItemsState } from '@/types/shopping-list-view.types'

export const CategorySection = ({
  category,
  items,
  purchasedItems,
  onTogglePurchased,
}: CategorySectionProps) => {
  const sortedItems = useMemo(() => {
    return sortItemsByPurchasedState(items, purchasedItems, category)
  }, [items, purchasedItems, category])

  return (
    <ul className="space-y-2">
      {sortedItems.map((item) => (
        <ShoppingListItem
          key={getItemKey(category, item.name)}
          item={item}
          category={category}
          isPurchased={item.isPurchased}
          onToggle={() => onTogglePurchased(category, item.name)}
        />
      ))}
    </ul>
  )
}
```

---

### ShoppingListItem (Client Component)

**Ścieżka:** `components/shopping-list/ShoppingListItem.tsx`

**Opis:** Pojedynczy produkt na liście zakupów. Zawiera checkbox, nazwę składnika, ilość i jednostkę. Produkt zaznaczony (zakupiony) jest wizualnie przekreślony.

**Główne elementy:**

- `<li>` wrapper z flex layout
- `<Checkbox>` z shadcn/ui (controlled: checked={isPurchased})
- `<label>` z kliknięciem na checkbox:
  - `<span>` nazwa składnika (z line-through jeśli isPurchased)
  - `<span>` ilość + jednostka (małym tekstem, muted)

**Obsługiwane interakcje:**

- onChange na checkbox → wywołanie onToggle()
- onClick na label → toggle checkbox (accessibility)

**Warunki walidacji:**

- Formatowanie ilości: zaokrąglenie do 2 miejsc po przecinku
- Conditional styling: line-through + opacity-60 jeśli isPurchased

**Typy:**

- `{ name: string; total_amount: number; unit: string; isPurchased: boolean }`
- `Enums<'ingredient_category_enum'>`

**Props:**

```typescript
interface ShoppingListItemProps {
  item: {
    name: string
    total_amount: number
    unit: string
    isPurchased: boolean
  }
  category: Enums<'ingredient_category_enum'>
  isPurchased: boolean
  onToggle: () => void
}
```

**Implementacja:**

```typescript
// components/shopping-list/ShoppingListItem.tsx
'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Enums } from '@/types/database.types'

export const ShoppingListItem = ({
  item,
  category,
  isPurchased,
  onToggle,
}: ShoppingListItemProps) => {
  const itemId = `${category}__${item.name}`

  return (
    <li className="flex items-start gap-3 py-2">
      <Checkbox
        id={itemId}
        checked={isPurchased}
        onCheckedChange={onToggle}
        className="mt-1"
      />
      <label
        htmlFor={itemId}
        className={cn(
          "flex-1 cursor-pointer select-none",
          "transition-all duration-200"
        )}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={cn(
              "font-medium",
              isPurchased && "line-through opacity-60"
            )}
          >
            {item.name}
          </span>
          <span
            className={cn(
              "text-sm text-muted-foreground whitespace-nowrap",
              isPurchased && "opacity-60"
            )}
          >
            {item.total_amount.toFixed(2)} {item.unit}
          </span>
        </div>
      </label>
    </li>
  )
}
```

---

### EmptyState (Presentation Component)

**Ścieżka:** `components/shopping-list/EmptyState.tsx`

**Opis:** Komponent wyświetlany gdy brak produktów na liście (brak zaplanowanych posiłków lub wszystkie posiłki bez przepisów).

**Główne elementy:**

- `<div>` wrapper z centrowaniem
- `<div>` ikona `<ShoppingBasket>` z lucide-react
- `<h3>` tytuł "Brak produktów na liście"
- `<p>` opis "Wygeneruj plan posiłków, aby stworzyć listę zakupów."
- `<Button>` CTA "Wygeneruj plan posiłków" (link do /dashboard lub /profile/generate)

**Obsługiwane interakcje:**

- onClick button → redirect (link component)

**Warunki walidacji:** Brak

**Typy:** Brak specjalnych typów

**Props:** Brak

**Implementacja:**

```typescript
// components/shopping-list/EmptyState.tsx
import { ShoppingBasket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <ShoppingBasket className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Brak produktów na liście</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Wygeneruj plan posiłków, aby stworzyć listę zakupów na nadchodzący tydzień.
      </p>
      <Button asChild>
        <Link href="/dashboard">Przejdź do planu posiłków</Link>
      </Button>
    </div>
  )
}
```

---

## 5. Typy

### Istniejące typy z dto.types.ts:

```typescript
// src/types/dto.types.ts (już zdefiniowane)
export type ShoppingListResponseDTO = {
  category: Enums<'ingredient_category_enum'>
  items: {
    name: string
    total_amount: number
    unit: string
  }[]
}[]
```

### Nowe typy ViewModels:

```typescript
// src/types/shopping-list-view.types.ts

import type { Enums } from './database.types'

/**
 * Stan zaznaczonych produktów (purchased state)
 * Key: unikalne ID produktu (category + name)
 * Value: boolean (czy zakupiony)
 */
export type PurchasedItemsState = Record<string, boolean>

/**
 * Item rozszerzony o stan purchased (używany po sortowaniu)
 */
export interface ShoppingListItemViewModel {
  name: string
  total_amount: number
  unit: string
  isPurchased: boolean
}

/**
 * Helper function: generuje unikalny klucz dla produktu
 */
export function getItemKey(category: string, name: string): string {
  return `${category}__${name}`
}

/**
 * Helper function: sortuje produkty według stanu purchased
 * Odznaczone (false) na górze, zaznaczone (true) na dole
 */
export function sortItemsByPurchasedState(
  items: { name: string; total_amount: number; unit: string }[],
  purchasedState: PurchasedItemsState,
  category: string
): ShoppingListItemViewModel[] {
  return items
    .map((item) => ({
      ...item,
      isPurchased: purchasedState[getItemKey(category, item.name)] || false,
    }))
    .sort((a, b) => {
      // Odznaczone (false) przed zaznaczonymi (true)
      if (a.isPurchased === b.isPurchased) {
        // Secondary sort: alfabetycznie po nazwie
        return a.name.localeCompare(b.name, 'pl')
      }
      return a.isPurchased ? 1 : -1
    })
}

/**
 * Helper function: czyści stary stan purchased (produkty, które nie są już na liście)
 * Zwraca oczyszczony state
 */
export function cleanupPurchasedState(
  currentState: PurchasedItemsState,
  currentList: ShoppingListResponseDTO
): PurchasedItemsState {
  const validKeys = new Set<string>()

  // Zbierz wszystkie aktualne klucze
  currentList.forEach((categoryData) => {
    categoryData.items.forEach((item) => {
      validKeys.add(getItemKey(categoryData.category, item.name))
    })
  })

  // Filtruj tylko aktualne klucze
  const cleanedState: PurchasedItemsState = {}
  Object.entries(currentState).forEach(([key, value]) => {
    if (validKeys.has(key)) {
      cleanedState[key] = value
    }
  })

  return cleanedState
}
```

### Reużycie istniejących typów z recipes-view.types.ts:

```typescript
// src/types/recipes-view.types.ts (już zdefiniowane)
export const INGREDIENT_CATEGORY_LABELS: Record<
  Enums<'ingredient_category_enum'>,
  string
> = {
  vegetables: 'Warzywa',
  fruits: 'Owoce',
  meat: 'Mięso',
  fish: 'Ryby',
  dairy: 'Nabiał',
  eggs: 'Jajka',
  nuts_seeds: 'Orzechy i nasiona',
  oils_fats: 'Tłuszcze i oleje',
  spices_herbs: 'Przyprawy i zioła',
  flours: 'Mąki',
  beverages: 'Napoje',
  sweeteners: 'Słodziki',
  condiments: 'Dodatki',
  other: 'Inne',
}
```

---

## 6. Zarządzanie stanem

### Stan serwera (TanStack Query - opcjonalnie):

**useShoppingListQuery (opcjonalny - dla re-fetching):**

```typescript
// hooks/useShoppingListQuery.ts
import { useQuery } from '@tanstack/react-query'
import { getShoppingList } from '@/lib/actions/shopping-list'

export const useShoppingListQuery = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['shopping-list', startDate, endDate],
    queryFn: async () => {
      const result = await getShoppingList({
        start_date: startDate,
        end_date: endDate,
      })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minut (lista się rzadko zmienia)
    refetchOnWindowFocus: false, // Nie refetch przy focus (lista offline)
  })
}
```

**Uwaga:** TanStack Query nie jest konieczny dla MVP, ponieważ:

- Lista zakupów jest statyczna (nie ulega zmianie w czasie sesji)
- Brak mutacji (tylko odczyt + localStorage purchased state)
- SSR initial load wystarcza dla prostej implementacji

Jeśli w przyszłości będzie potrzeba real-time update (np. po wymianie posiłku), można dodać hook.

### Stan klienta (React useState + localStorage):

**W ShoppingListClient:**

```typescript
const [purchasedItems, setPurchasedItems] = useState<PurchasedItemsState>({})

// Load from localStorage on mount
useEffect(() => {
  try {
    const stored = localStorage.getItem('shopping-list-purchased')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Cleanup: usuń produkty, które nie są już na aktualnej liście
      const cleaned = cleanupPurchasedState(parsed, initialShoppingList)
      setPurchasedItems(cleaned)
    }
  } catch (error) {
    console.error('Failed to load purchased items:', error)
  }
}, [initialShoppingList])

// Save to localStorage on change
useEffect(() => {
  try {
    localStorage.setItem(
      'shopping-list-purchased',
      JSON.stringify(purchasedItems)
    )
  } catch (error) {
    console.error('Failed to save purchased items:', error)
  }
}, [purchasedItems])
```

**Dlaczego localStorage a nie Zustand/database?**

- **localStorage:** Prosty, szybki, offline-first, nie wymaga API calls
- **Zustand:** Overkill dla jednego prostego stanu (purchased items)
- **Database:** Niepotrzebne (stan purchased jest lokalny dla urządzenia użytkownika, nie wymaga sync między urządzeniami)

**Lifecycle stanu purchased:**

1. **Mount:** Load z localStorage → cleanup (usuń nieaktualne produkty) → setState
2. **Toggle checkbox:** setState → automatic save do localStorage (useEffect)
3. **Unmount:** Brak (useEffect cleanup nie potrzebny)

---

## 7. Integracja API

### Endpoint: GET /shopping-list

**Server Action:** `getShoppingList(params: ShoppingListQueryInput)`

**Typ żądania:**

```typescript
{
  start_date: string // YYYY-MM-DD (jutro)
  end_date: string // YYYY-MM-DD (jutro + 5 dni)
}
```

**Typ odpowiedzi:**

```typescript
ActionResult<ShoppingListResponseDTO>
// gdzie ActionResult = { data: ShoppingListResponseDTO } | { error: string }
// i ShoppingListResponseDTO = Array<{ category, items[] }>
```

**Użycie w komponencie:**

```typescript
// W ShoppingListPage (Server Component)
const shoppingListResult = await getShoppingList({
  start_date: startDateStr,
  end_date: endDateStr,
})

const shoppingList = shoppingListResult.error ? [] : shoppingListResult.data
```

**Specyfikacja odpowiedzi (z API plan):**

```json
[
  {
    "category": "meat",
    "items": [
      { "name": "Pierś z kurczaka", "total_amount": 350, "unit": "g" },
      { "name": "Boczek wędzony", "total_amount": 100, "unit": "g" }
    ]
  },
  {
    "category": "dairy",
    "items": [
      { "name": "Ser Feta", "total_amount": 80, "unit": "g" },
      { "name": "Śmietana 30%", "total_amount": 150, "unit": "ml" }
    ]
  }
]
```

**Walidacja parametrów (backend - z implementation plan):**

- `start_date` i `end_date`: format YYYY-MM-DD (regex validation)
- `end_date >= start_date`
- Zakres dat <= 30 dni (ochrona przed DoS)

**Cache strategy:**

- Server Component: Next.js automatic caching (ISR)
- Opcjonalnie: TanStack Query z staleTime: 5 minut (jeśli używamy Client re-fetching)

**Error handling:**

- 400 Bad Request: Nieprawidłowe parametry → Error boundary w Page
- 401 Unauthorized: Redirect na /login (middleware)
- 500 Internal Server Error: Error boundary z retry button

---

## 8. Interakcje użytkownika

### 1. Wejście na stronę listy zakupów

**Trigger:** Nawigacja na `/shopping-list`

**Flow:**

1. ShoppingListPage (SSR) pobiera listę zakupów (jutro + 5 dni)
2. Renderuje ShoppingListClient z initial data
3. ShoppingListClient ładuje purchased state z localStorage
4. Renderuje Accordion z kategoriami (domyślnie: wszystkie zamknięte lub pierwsza otwarta)

---

### 2. Otwarcie/zamknięcie kategorii

**Trigger:** onClick na AccordionTrigger

**Flow:**

1. Użytkownik klika na kategorię (np. "Mięso")
2. Accordion (shadcn/ui) automatycznie obsługuje expand/collapse
3. AccordionContent z listą produktów się pokazuje/ukrywa
4. Smooth animation (Radix UI built-in)

**Implementacja:** Automatyczna (shadcn/ui Accordion z type="multiple")

---

### 3. Zaznaczenie produktu jako zakupiony

**Trigger:** onClick na Checkbox lub label w ShoppingListItem

**Flow:**

1. Użytkownik zaznacza checkbox obok produktu
2. handleTogglePurchased(category, itemName) wywoływane
3. setPurchasedItems aktualizuje state:
   ```typescript
   setPurchasedItems((prev) => ({
     ...prev,
     [`${category}__${itemName}`]: true,
   }))
   ```
4. useEffect automatycznie zapisuje do localStorage
5. CategorySection re-renderuje się (useMemo z purchasedItems w dependencies)
6. sortItemsByPurchasedState przesuwa produkt na dół listy
7. UI aktualizuje się:
   - Checkbox zaznaczony
   - Nazwa produktu przekreślona (line-through)
   - Opacity zmniejszona (opacity-60)
   - Produkt na dole sekcji

**Implementacja:**

```typescript
// W ShoppingListClient
const handleTogglePurchased = (category: string, itemName: string) => {
  const key = `${category}__${itemName}`
  setPurchasedItems((prev) => ({
    ...prev,
    [key]: !prev[key],
  }))
}
```

---

### 4. Odznaczenie produktu (cofnięcie zakupu)

**Trigger:** onClick na zaznaczonym checkbox

**Flow:**
Identyczny jak w punkcie 3, ale:

- Stan zmienia się z `true` → `false`
- Produkt przesuwa się z powrotem na górę listy (sortowanie)
- Line-through i opacity znikają
- Checkbox odznaczony

---

### 5. Persistence między sesjami

**Trigger:** Zamknięcie i ponowne otwarcie aplikacji

**Flow:**

1. Użytkownik zamyka aplikację (lub odświeża stronę)
2. ShoppingListClient unmount → useEffect cleanup (brak - localStorage już zapisany)
3. Użytkownik wraca na `/shopping-list`
4. ShoppingListPage (SSR) pobiera świeżą listę zakupów
5. ShoppingListClient mount → useEffect ładuje purchased state z localStorage
6. cleanupPurchasedState usuwa produkty, które nie są już na aktualnej liście
7. UI renderuje się z przywróconym stanem zaznaczenia

**Edge case:** Jeśli użytkownik wymienił posiłek (np. wczoraj) i produkt zniknął z listy, purchased state dla tego produktu zostanie usunięty przez cleanup function.

---

### 6. Brak produktów na liście (EmptyState)

**Trigger:** `shoppingList.length === 0`

**Flow:**

1. ShoppingListPage (SSR) pobiera pustą listę (brak posiłków w planie)
2. ShoppingListClient renderuje EmptyState
3. Użytkownik widzi komunikat "Brak produktów na liście"
4. Kliknięcie "Przejdź do planu posiłków" → redirect na /dashboard
5. Użytkownik może wygenerować plan → wrócić na /shopping-list

---

## 9. Warunki i walidacja

### Frontend validation:

#### ShoppingListClient:

- **Warunek:** Sprawdzenie czy `shoppingList.length > 0`
- **Implementacja:** Warunkowe renderowanie EmptyState vs ShoppingListAccordion
- **Wpływ na UI:** Wyświetlenie odpowiedniego widoku

#### localStorage:

- **Warunek:** Walidacja JSON.parse (try-catch)
- **Implementacja:**
  ```typescript
  try {
    const stored = localStorage.getItem('shopping-list-purchased')
    if (stored) {
      setPurchasedItems(JSON.parse(stored))
    }
  } catch (error) {
    console.error('Failed to load purchased items:', error)
    // Fallback: pusta mapa (wszystko odznaczone)
  }
  ```
- **Wpływ na UI:** Graceful degradation (brak crash, użytkownik może ponownie zaznaczyć produkty)

#### CategorySection:

- **Warunek:** Sortowanie items (odznaczone na górze)
- **Implementacja:** `sortItemsByPurchasedState` w useMemo
- **Wpływ na UI:** Produkty zaznaczone zawsze na dole, odznaczone na górze

#### ShoppingListItem:

- **Warunek:** Formatowanie ilości (zaokrąglenie do 2 miejsc)
- **Implementacja:** `item.total_amount.toFixed(2)`
- **Wpływ na UI:** Czytelne wartości (np. "150.00 g" zamiast "150 g" lub "150.123456 g")

### Backend validation (z shopping-list.ts):

#### getShoppingList:

- **Parametry:**
  - `start_date` i `end_date`: format YYYY-MM-DD (regex: `^\d{4}-\d{2}-\d{2}$`)
  - `start_date <= end_date`
  - Zakres dat <= 30 dni
- **Obsługa błędów:**
  - 400: "Nieprawidłowy format daty" → Error boundary
  - 400: "start_date nie może być późniejsza niż end_date" → Error boundary
  - 400: "Zakres dat nie może przekraczać 30 dni" → Error boundary
  - 401: Redirect na /login (middleware)
  - 500: "Błąd serwera" → Error boundary z retry

**Wszystkie błędy walidacji są już obsłużone w Server Action (`getShoppingList`), więc komponent tylko musi obsłużyć error boundary.**

---

## 10. Obsługa błędów

### 1. Brak produktów na liście (pusta lista)

**Scenariusz:** API zwraca `shoppingList.length === 0` (brak posiłków w planie)

**Obsługa:**

```typescript
// W ShoppingListClient
if (initialShoppingList.length === 0) {
  return <EmptyState />
}
```

**UI:** EmptyState z komunikatem i CTA "Przejdź do planu posiłków"

---

### 2. Błąd API (GET /shopping-list)

**Scenariusz:** Network error, 500 Internal Server Error

**Obsługa:**

```typescript
// W ShoppingListPage (Server Component)
const shoppingListResult = await getShoppingList({
  start_date: startDateStr,
  end_date: endDateStr,
})

if (shoppingListResult.error) {
  // Error boundary will catch
  throw new Error(shoppingListResult.error)
}
```

**Error Boundary:**

```typescript
// app/shopping-list/error.tsx
'use client'

export default function ShoppingListError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-4">Nie udało się załadować listy zakupów</h1>
      <p className="text-muted-foreground mb-8">{error.message}</p>
      <Button onClick={reset}>Spróbuj ponownie</Button>
    </div>
  )
}
```

---

### 3. Błąd localStorage (quota exceeded, corrupted data)

**Scenariusz:** localStorage pełny lub uszkodzony JSON

**Obsługa:**

```typescript
// W ShoppingListClient
useEffect(() => {
  try {
    const stored = localStorage.getItem('shopping-list-purchased')
    if (stored) {
      setPurchasedItems(JSON.parse(stored))
    }
  } catch (error) {
    console.error('Failed to load purchased items from localStorage:', error)
    // Fallback: pusta mapa
    setPurchasedItems({})
  }
}, [])

useEffect(() => {
  try {
    localStorage.setItem(
      'shopping-list-purchased',
      JSON.stringify(purchasedItems)
    )
  } catch (error) {
    console.error('Failed to save purchased items to localStorage:', error)
    // Optional: Show toast notification
    // toast({ title: 'Błąd', description: 'Nie udało się zapisać stanu listy' })
  }
}, [purchasedItems])
```

**UI:** Graceful degradation (użytkownik może nadal korzystać z listy, ale stan nie będzie persisted)

---

### 4. Błąd autentykacji (401 Unauthorized)

**Scenariusz:** Sesja wygasła

**Obsługa:**

```typescript
// middleware.ts (globalna obsługa)
if (!user) {
  return NextResponse.redirect(new URL('/login', request.url))
}
```

**UI:** Automatyczne przekierowanie na /login

---

### 5. Validacja parametrów (400 Bad Request)

**Scenariusz:** Nieprawidłowe daty (edge case - nie powinno się zdarzyć w UI)

**Obsługa:**

```typescript
// W ShoppingListPage
const shoppingListResult = await getShoppingList({
  start_date: startDateStr,
  end_date: endDateStr,
})

if (shoppingListResult.error) {
  // Error boundary
  throw new Error(shoppingListResult.error)
}
```

**UI:** Error boundary z komunikatem błędu

---

## 11. Kroki implementacji

### Krok 1: Typy i helpers (30 min)

1.1. Utwórz plik typów:

```bash
touch src/types/shopping-list-view.types.ts
```

1.2. Zaimplementuj:

- `PurchasedItemsState`
- `ShoppingListItemViewModel`
- `getItemKey()`
- `sortItemsByPurchasedState()`
- `cleanupPurchasedState()`

  1.3. Zweryfikuj istniejące typy:

- `ShoppingListResponseDTO` w dto.types.ts
- `INGREDIENT_CATEGORY_LABELS` w recipes-view.types.ts (reużycie)

---

### Krok 2: shadcn/ui komponenty (15 min)

2.1. Zainstaluj brakujące komponenty:

```bash
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add alert
# Checkbox, Button już powinny być zainstalowane
```

2.2. Zweryfikuj konfigurację Tailwind

---

### Krok 3: Komponenty prezentacyjne (2h)

**Krok 3.1: InfoBanner (15 min)**

```bash
touch src/components/shopping-list/InfoBanner.tsx
```

- Alert z shadcn/ui
- Ikona Info z lucide-react
- Statyczny tekst

**Krok 3.2: ShoppingListItem (45 min)**

```bash
touch src/components/shopping-list/ShoppingListItem.tsx
```

- Checkbox z shadcn/ui
- Label z onClick
- Conditional styling (line-through, opacity)
- Formatowanie ilości (toFixed(2))

**Krok 3.3: CategorySection (30 min)**

```bash
touch src/components/shopping-list/CategorySection.tsx
```

- useMemo dla sortowania
- Mapowanie sortedItems
- Przekazywanie callbacks

**Krok 3.4: EmptyState (30 min)**

```bash
touch src/components/shopping-list/EmptyState.tsx
```

- Ikona ShoppingBasket
- Komunikat
- Button CTA z linkiem

---

### Krok 4: ShoppingListAccordion (1h)

4.1. Utwórz komponent:

```bash
touch src/components/shopping-list/ShoppingListAccordion.tsx
```

4.2. Implementacja:

- Accordion z shadcn/ui (type="multiple")
- AccordionItem dla każdej kategorii
- AccordionTrigger z nazwą kategorii i licznikiem
- AccordionContent z CategorySection
- Mapowanie kategorie z API response

---

### Krok 5: ShoppingListClient (2h)

5.1. Utwórz główny komponent:

```bash
touch src/components/shopping-list/ShoppingListClient.tsx
```

5.2. Implementacja:

- useState dla purchasedItems
- useEffect dla localStorage load (z cleanup)
- useEffect dla localStorage save
- handleTogglePurchased callback
- Warunkowe renderowanie (EmptyState vs Accordion)
- InfoBanner rendering

  5.3. Testing localStorage:

- Test load z corrupted JSON
- Test quota exceeded
- Test cleanup stale items

---

### Krok 6: Server Component (Page) (1h)

6.1. Utwórz strukturę:

```bash
mkdir -p app/shopping-list
touch app/shopping-list/page.tsx
touch app/shopping-list/loading.tsx
touch app/shopping-list/error.tsx
```

6.2. Implementuj ShoppingListPage:

- Obliczanie zakresu dat (jutro + 5 dni)
- Wywołanie getShoppingList()
- Przekazanie do ShoppingListClient
- Metadata (SEO)

  6.3. Implementuj loading.tsx:

- Skeleton UI:
  - Skeleton dla InfoBanner
  - Skeleton dla Accordion (3-4 kategorie z items)

  6.4. Implementuj error.tsx:

- Error boundary component
- Button "Spróbuj ponownie" z reset()

**Implementacja loading.tsx:**

```typescript
// app/shopping-list/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function ShoppingListLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-64 mb-2" /> {/* h1 */}
      <Skeleton className="h-5 w-48 mb-6" /> {/* date range */}

      {/* InfoBanner skeleton */}
      <Skeleton className="h-14 w-full mb-6" />

      {/* Accordion skeleton */}
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  )
}
```

---

### Krok 7: Styling i accessibility (1h)

7.1. Tailwind CSS:

- Responsive (mobile-first, ale lista jest prosta - vertical scroll)
- Hover states dla checkbox i label
- Focus indicators
- Transition dla line-through i opacity

  7.2. Accessibility:

- Semantyczny HTML (`<ul>`, `<li>` dla list)
- Label połączony z checkbox (htmlFor + id)
- Keyboard navigation (Tab, Space dla checkbox)
- ARIA attributes dla Accordion (automatic w shadcn/ui)
- Screen reader testing

---

### Krok 8: Testowanie (2-3h)

8.1. Unit testy (Vitest):

- `getItemKey()` function
- `sortItemsByPurchasedState()` function
- `cleanupPurchasedState()` function

```typescript
// types/__tests__/shopping-list-view.test.ts
describe('sortItemsByPurchasedState', () => {
  it('places unpurchased items before purchased items', () => {
    const items = [
      { name: 'A', total_amount: 100, unit: 'g' },
      { name: 'B', total_amount: 200, unit: 'g' },
    ]
    const purchasedState = { meat__B: true }

    const result = sortItemsByPurchasedState(items, purchasedState, 'meat')

    expect(result[0].name).toBe('A')
    expect(result[1].name).toBe('B')
    expect(result[1].isPurchased).toBe(true)
  })
})
```

8.2. Component testy (React Testing Library):

- ShoppingListItem (checkbox toggle, styling)
- CategorySection (sorting)
- ShoppingListClient (localStorage persistence)

```typescript
// components/__tests__/ShoppingListItem.test.tsx
describe('ShoppingListItem', () => {
  it('calls onToggle when checkbox is clicked', () => {
    const onToggle = jest.fn()
    render(
      <ShoppingListItem
        item={{ name: 'Kurczak', total_amount: 200, unit: 'g', isPurchased: false }}
        category="meat"
        isPurchased={false}
        onToggle={onToggle}
      />
    )

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('applies line-through style when purchased', () => {
    render(
      <ShoppingListItem
        item={{ name: 'Kurczak', total_amount: 200, unit: 'g', isPurchased: true }}
        category="meat"
        isPurchased={true}
        onToggle={() => {}}
      />
    )

    const label = screen.getByText('Kurczak')
    expect(label).toHaveClass('line-through')
  })
})
```

8.3. Integration testy:

- ShoppingListClient z mock data
- localStorage persistence flow
- Cleanup stale items

  8.4. E2E testy (Playwright):

- Happy path: Zobacz listę → zaznacz produkty → sprawdź persistence
- Happy path: Zaznacz produkt → odznacz → sprawdź sortowanie
- Error path: Brak produktów → EmptyState
- localStorage: Zaznacz produkty → odśwież stronę → sprawdź stan

```typescript
// tests/e2e/shopping-list.spec.ts
test('user can check off purchased items', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=password]', 'password')
  await page.click('button[type=submit]')

  // Navigate to shopping list
  await page.goto('/shopping-list')

  // Open first category
  await page.click('button:has-text("Mięso")')

  // Check first item
  const firstCheckbox = page.locator('input[type=checkbox]').first()
  await firstCheckbox.check()

  // Verify item is crossed out
  await expect(page.locator('.line-through').first()).toBeVisible()

  // Refresh page
  await page.reload()

  // Verify persistence
  await expect(firstCheckbox).toBeChecked()
})
```

---

### Krok 9: Optymalizacja i finalizacja (1h)

9.1. Performance:

- useMemo dla sortItemsByPurchasedState (już zaimplementowane)
- Lazy loading dla Accordion (opcjonalnie - dynamic import)
- Bundle analysis

  9.2. Code review checklist:

- TypeScript strict mode (brak `any`)
- Path aliases (@/) wszędzie
- ESLint i Prettier pass
- Brak console.log
- localStorage error handling (try-catch)

  9.3. Final testing:

- Lighthouse audit (Performance, Accessibility, Best Practices)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile testing (responsive, touch gestures)

---

### Krok 10: Dokumentacja (30 min)

10.1. JSDoc comments:

- Helper functions w shopping-list-view.types.ts
- ShoppingListClient component

  10.2. README update:

- Dodanie nowego widoku do dokumentacji
- Screenshot dla QA

---

## Podsumowanie

Plan implementacji widoku Lista Zakupów obejmuje:

1. **Architektura hybrydowa:** Server Component (initial load) + Client Component (localStorage state)
2. **Accordion UI:** Kategorie z collapse/expand dla lepszej organizacji
3. **localStorage persistence:** Stan zaznaczenia produktów zapisywany lokalnie
4. **Sortowanie automatyczne:** Odznaczone na górze, zaznaczone (przekreślone) na dole
5. **Zarządzanie stanem:** React useState + useEffect (brak potrzeby Zustand/TanStack Query dla prostego stanu)
6. **Reużycie komponentów:** INGREDIENT_CATEGORY_LABELS z recipes-view.types.ts
7. **Error handling:** Error boundary, localStorage fallback, EmptyState
8. **Testowanie:** >80% coverage dla logiki biznesowej (sorting, persistence, cleanup)
9. **Accessibility:** Semantyczny HTML, ARIA (automatic w Accordion), keyboard navigation

**Szacowany czas implementacji:** 12-15 godzin (1.5-2 dni dla jednego programisty frontend)

**Priorytety MVP:**

- ✅ Must-have: Accordion, ShoppingListItem, localStorage persistence, sortowanie, API integration
- 🔄 Should-have: InfoBanner, EmptyState, Error handling, Loading states
- ⏳ Nice-to-have: TanStack Query dla re-fetching, Animations dla sortowania, Bulk actions (zaznacz wszystko)

**Kluczowe decyzje techniczne:**

1. **localStorage vs Database:** localStorage wystarczy dla MVP (stan lokalny, offline-first, brak sync między urządzeniami)
2. **TanStack Query:** Opcjonalny (SSR initial load wystarcza, lista statyczna w sesji)
3. **Accordion vs Flat List:** Accordion dla lepszej organizacji (wiele kategorii = długa lista)
4. **Sortowanie:** Automatyczne (odznaczone na górze) vs Manual (użytkownik sortuje) → wybraliśmy automatyczne dla UX
5. **Cleanup stale items:** Konieczne (użytkownik może wymienić posiłki → produkty znikają z listy)
