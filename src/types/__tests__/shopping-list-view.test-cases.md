# Test Cases dla Shopping List View Helper Functions

## Przegląd

Ten dokument zawiera test cases dla helper functions w `shopping-list-view.types.ts`.
Testy mogą być uruchomione manualnie lub użyte jako podstawa dla automated tests (Vitest/Jest).

---

## 1. `getItemKey(category: string, name: string): string`

### Test Case 1.1: Basic key generation

**Input:**

```typescript
getItemKey('meat', 'Kurczak')
```

**Expected Output:**

```typescript
'meat__Kurczak'
```

### Test Case 1.2: Key with special characters

**Input:**

```typescript
getItemKey('dairy', 'Ser Feta 30%')
```

**Expected Output:**

```typescript
'dairy__Ser Feta 30%'
```

### Test Case 1.3: Key uniqueness

**Input:**

```typescript
const key1 = getItemKey('meat', 'Kurczak')
const key2 = getItemKey('fish', 'Kurczak')
```

**Expected Output:**

```typescript
key1 !== key2 // true
// key1 = 'meat__Kurczak'
// key2 = 'fish__Kurczak'
```

---

## 2. `sortItemsByPurchasedState(items, purchasedState, category): ShoppingListItemViewModel[]`

### Test Case 2.1: Unpurchased items before purchased

**Input:**

```typescript
const items = [
  { name: 'A', total_amount: 100, unit: 'g' },
  { name: 'B', total_amount: 200, unit: 'g' },
  { name: 'C', total_amount: 300, unit: 'g' },
]
const purchasedState = { meat__B: true }
const category = 'meat'
```

**Expected Output:**

```typescript
;[
  { name: 'A', total_amount: 100, unit: 'g', isPurchased: false },
  { name: 'C', total_amount: 300, unit: 'g', isPurchased: false },
  { name: 'B', total_amount: 200, unit: 'g', isPurchased: true },
]
```

### Test Case 2.2: Alphabetical sorting within same purchased state

**Input:**

```typescript
const items = [
  { name: 'Ziemniak', total_amount: 100, unit: 'g' },
  { name: 'Arbuz', total_amount: 200, unit: 'g' },
  { name: 'Marchew', total_amount: 300, unit: 'g' },
]
const purchasedState = {}
const category = 'vegetables'
```

**Expected Output:**

```typescript
;[
  { name: 'Arbuz', total_amount: 200, unit: 'g', isPurchased: false },
  { name: 'Marchew', total_amount: 300, unit: 'g', isPurchased: false },
  { name: 'Ziemniak', total_amount: 100, unit: 'g', isPurchased: false },
]
```

### Test Case 2.3: All items purchased

**Input:**

```typescript
const items = [
  { name: 'A', total_amount: 100, unit: 'g' },
  { name: 'B', total_amount: 200, unit: 'g' },
]
const purchasedState = { meat__A: true, meat__B: true }
const category = 'meat'
```

**Expected Output:**

```typescript
;[
  { name: 'A', total_amount: 100, unit: 'g', isPurchased: true },
  { name: 'B', total_amount: 200, unit: 'g', isPurchased: true },
]
```

### Test Case 2.4: Empty items array

**Input:**

```typescript
const items = []
const purchasedState = {}
const category = 'meat'
```

**Expected Output:**

```typescript
;[]
```

---

## 3. `cleanupPurchasedState(currentState, currentList): PurchasedItemsState`

### Test Case 3.1: Remove stale items

**Input:**

```typescript
const currentState = {
  meat__Kurczak: true,
  meat__Wieprzowina: true,
  dairy__Ser: false,
}
const currentList = [
  {
    category: 'meat',
    items: [{ name: 'Kurczak', total_amount: 200, unit: 'g' }],
  },
]
```

**Expected Output:**

```typescript
{
  'meat__Kurczak': true
}
// 'meat__Wieprzowina' i 'dairy__Ser' zostały usunięte (nie ma ich w currentList)
```

### Test Case 3.2: Keep all valid items

**Input:**

```typescript
const currentState = {
  meat__Kurczak: true,
  dairy__Ser: false,
}
const currentList = [
  {
    category: 'meat',
    items: [{ name: 'Kurczak', total_amount: 200, unit: 'g' }],
  },
  {
    category: 'dairy',
    items: [{ name: 'Ser', total_amount: 100, unit: 'g' }],
  },
]
```

**Expected Output:**

```typescript
{
  'meat__Kurczak': true,
  'dairy__Ser': false
}
```

### Test Case 3.3: Empty current state

**Input:**

```typescript
const currentState = {}
const currentList = [
  {
    category: 'meat',
    items: [{ name: 'Kurczak', total_amount: 200, unit: 'g' }],
  },
]
```

**Expected Output:**

```typescript
{
}
```

### Test Case 3.4: Empty current list

**Input:**

```typescript
const currentState = {
  meat__Kurczak: true,
  dairy__Ser: false,
}
const currentList = []
```

**Expected Output:**

```typescript
{
}
// Wszystkie items zostały usunięte (currentList jest puste)
```

---

## Manual Testing Checklist

### Component Integration Tests

#### ShoppingListItem

- [ ] Checkbox toggles on click
- [ ] Label click toggles checkbox
- [ ] Purchased item shows line-through styling
- [ ] Purchased item has reduced opacity
- [ ] Amount is formatted to 2 decimal places

#### CategorySection

- [ ] Items are sorted (unpurchased first)
- [ ] Purchased items appear at bottom
- [ ] Alphabetical sorting within same purchased state
- [ ] useMemo prevents unnecessary re-renders

#### ShoppingListClient

- [ ] localStorage loads on mount
- [ ] localStorage saves on state change
- [ ] Corrupt localStorage data doesn't crash app
- [ ] Cleanup removes stale items on mount
- [ ] EmptyState shows when shoppingList is empty

#### ShoppingListAccordion

- [ ] Categories render with correct labels
- [ ] Item count is accurate
- [ ] Multiple categories can be open simultaneously
- [ ] Accordion animations work smoothly

---

## Browser Testing Checklist

### Functionality

- [ ] Load page: `/shopping-list`
- [ ] Expand/collapse categories
- [ ] Check/uncheck items
- [ ] Refresh page: purchased state persists
- [ ] Clear localStorage: state resets
- [ ] Check with empty shopping list: EmptyState shows

### Accessibility

- [ ] Keyboard navigation (Tab, Space, Enter)
- [ ] Screen reader announces checkbox state
- [ ] Focus indicators visible
- [ ] ARIA attributes correct

### Performance

- [ ] Page loads < 3s
- [ ] Smooth animations
- [ ] No layout shift
- [ ] useMemo prevents unnecessary re-renders

---

## Edge Cases Testing

### localStorage

- [ ] Quota exceeded (save fails gracefully)
- [ ] Corrupted JSON (load fails gracefully with fallback)
- [ ] localStorage disabled (app still works, no persistence)

### API

- [ ] Empty shopping list (shows EmptyState)
- [ ] Network error (error boundary shows)
- [ ] Slow API (loading state shows)

### Data

- [ ] Very long item names (UI doesn't break)
- [ ] Very large amounts (formatting works)
- [ ] Special characters in item names
- [ ] Many categories (scroll works)
- [ ] Many items per category (performance OK)

---

## Test Implementation Example (Vitest/Jest)

```typescript
// src/types/__tests__/shopping-list-view.test.ts
import { describe, it, expect } from 'vitest'
import {
  getItemKey,
  sortItemsByPurchasedState,
  cleanupPurchasedState,
} from '../shopping-list-view.types'

describe('getItemKey', () => {
  it('generates correct key format', () => {
    expect(getItemKey('meat', 'Kurczak')).toBe('meat__Kurczak')
  })

  it('handles special characters', () => {
    expect(getItemKey('dairy', 'Ser Feta 30%')).toBe('dairy__Ser Feta 30%')
  })

  it('generates unique keys for same name in different categories', () => {
    const key1 = getItemKey('meat', 'Kurczak')
    const key2 = getItemKey('fish', 'Kurczak')
    expect(key1).not.toBe(key2)
  })
})

describe('sortItemsByPurchasedState', () => {
  it('places unpurchased items before purchased', () => {
    const items = [
      { name: 'A', total_amount: 100, unit: 'g' },
      { name: 'B', total_amount: 200, unit: 'g' },
      { name: 'C', total_amount: 300, unit: 'g' },
    ]
    const purchasedState = { meat__B: true }

    const result = sortItemsByPurchasedState(items, purchasedState, 'meat')

    expect(result[0].name).toBe('A')
    expect(result[0].isPurchased).toBe(false)
    expect(result[1].name).toBe('C')
    expect(result[1].isPurchased).toBe(false)
    expect(result[2].name).toBe('B')
    expect(result[2].isPurchased).toBe(true)
  })

  it('sorts alphabetically within same purchased state', () => {
    const items = [
      { name: 'Ziemniak', total_amount: 100, unit: 'g' },
      { name: 'Arbuz', total_amount: 200, unit: 'g' },
      { name: 'Marchew', total_amount: 300, unit: 'g' },
    ]
    const purchasedState = {}

    const result = sortItemsByPurchasedState(
      items,
      purchasedState,
      'vegetables'
    )

    expect(result[0].name).toBe('Arbuz')
    expect(result[1].name).toBe('Marchew')
    expect(result[2].name).toBe('Ziemniak')
  })

  it('handles empty items array', () => {
    const result = sortItemsByPurchasedState([], {}, 'meat')
    expect(result).toEqual([])
  })
})

describe('cleanupPurchasedState', () => {
  it('removes stale items not in current list', () => {
    const currentState = {
      meat__Kurczak: true,
      meat__Wieprzowina: true,
      dairy__Ser: false,
    }
    const currentList = [
      {
        category: 'meat' as const,
        items: [{ name: 'Kurczak', total_amount: 200, unit: 'g' }],
      },
    ]

    const result = cleanupPurchasedState(currentState, currentList)

    expect(result).toEqual({ meat__Kurczak: true })
  })

  it('keeps all valid items', () => {
    const currentState = {
      meat__Kurczak: true,
      dairy__Ser: false,
    }
    const currentList = [
      {
        category: 'meat' as const,
        items: [{ name: 'Kurczak', total_amount: 200, unit: 'g' }],
      },
      {
        category: 'dairy' as const,
        items: [{ name: 'Ser', total_amount: 100, unit: 'g' }],
      },
    ]

    const result = cleanupPurchasedState(currentState, currentList)

    expect(result).toEqual({
      meat__Kurczak: true,
      dairy__Ser: false,
    })
  })

  it('handles empty current state', () => {
    const result = cleanupPurchasedState({}, [
      {
        category: 'meat' as const,
        items: [{ name: 'Kurczak', total_amount: 200, unit: 'g' }],
      },
    ])
    expect(result).toEqual({})
  })

  it('handles empty current list', () => {
    const currentState = {
      meat__Kurczak: true,
      dairy__Ser: false,
    }
    const result = cleanupPurchasedState(currentState, [])
    expect(result).toEqual({})
  })
})
```
