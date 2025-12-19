# 11. Shadcn/UI Components

## Przegląd

Projekt wykorzystuje **@shadcn/ui** - kolekcję pięknie zaprojektowanych, dostępnych komponentów UI, które można dostosować do aplikacji.

**Konfiguracja projektu:**

- **Wariant stylu**: `new-york`
- **Kolor bazowy**: `neutral`
- **Tryb CSS**: zmienne CSS dla motywów (light/dark)
- **Path alias**: `@/components/ui`

---

## Struktura Komponentów

### Lokalizacja

Komponenty są dostępne w folderze zgodnym z `components.json`:

```
src/components/ui/
├── accordion.tsx
├── alert.tsx
├── alert-dialog.tsx
├── badge.tsx
├── button.tsx
├── card.tsx
├── checkbox.tsx
├── charts/
│   └── index.tsx      # Recharts wrapper
├── dialog.tsx
├── form.tsx
├── input.tsx
├── label.tsx
├── progress.tsx
├── radio-group.tsx
├── scroll-area.tsx
├── select.tsx
├── separator.tsx
├── skeleton.tsx
├── slider.tsx
├── sonner.tsx         # Toast notifications
├── tabs.tsx
├── textarea.tsx
└── visually-hidden.tsx
```

### Zainstalowane Komponenty (23)

accordion, alert, alert-dialog, badge, button, card, checkbox, charts, dialog, form, input, label, progress, radio-group, scroll-area, select, separator, skeleton, slider, sonner, tabs, textarea, visually-hidden

---

## Wykorzystanie Komponentów

### Import

Importuj komponenty zgodnie z aliasem `@/`:

```tsx
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
```

### Podstawowe Przykłady

#### Button

```tsx
<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button disabled>Disabled</Button>
```

#### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Śniadanie</CardTitle>
    <CardDescription>Jajecznica z warzywami</CardDescription>
  </CardHeader>
  <CardContent>
    <p>450 kcal | Białko: 25g | Tłuszcze: 35g | Węgle: 8g</p>
  </CardContent>
  <CardFooter>
    <Button>Oznacz jako zjedzone</Button>
  </CardFooter>
</Card>
```

#### Tabs

```tsx
<Tabs defaultValue='daily'>
  <TabsList>
    <TabsTrigger value='daily'>Dzienny</TabsTrigger>
    <TabsTrigger value='weekly'>Tygodniowy</TabsTrigger>
  </TabsList>
  <TabsContent value='daily'>{/* Widok dzienny */}</TabsContent>
  <TabsContent value='weekly'>{/* Widok tygodniowy */}</TabsContent>
</Tabs>
```

#### Progress (dla makroskładników)

```tsx
<div className="space-y-2">
  <Label>Kalorie: 1200 / 1600 kcal</Label>
  <Progress value={75} />
</div>

<div className="space-y-2">
  <Label>Białko: 80g / 140g</Label>
  <Progress value={57} className="bg-blue-200" />
</div>
```

---

## Instalacja Nowych Komponentów

### Komenda CLI

```bash
npx shadcn@latest add [component-name]
```

**⚠️ UWAGA**: Używaj `npx shadcn@latest`, NIE `npx shadcn-ui@latest` (wycofane)

### Przykłady

```bash
# Pojedynczy komponent
npx shadcn@latest add accordion

# Wiele komponentów
npx shadcn@latest add dialog dropdown-menu

# Wszystkie komponenty (ostrożnie!)
npx shadcn@latest add --all
```

---

## Popularne Komponenty

### Nawigacja i Layout

- **Tabs** - zakładki (widok dzienny/tygodniowy)
- **Navigation Menu** - menu nawigacyjne
- **Sheet** - boczny panel (mobilne menu)
- **Separator** - separator wizualny
- **ScrollArea** - obszar z przewijaniem

### Formularze i Inputy

- **Form** - integracja z React Hook Form
- **Input** - pole tekstowe
- **Textarea** - pole tekstowe wieloliniowe
- **Select** - rozwijana lista
- **Checkbox** - pole wyboru
- **Radio Group** - grupa radio buttonów
- **Switch** - przełącznik
- **Slider** - suwak
- **Calendar** - kalendarz
- **Date Picker** - wybór daty

### Wyświetlanie Danych

- **Card** - karta (posiłki, przepisy)
- **Table** - tabela
- **Data Table** - zaawansowana tabela z sortowaniem
- **Progress** - pasek postęu (makroskładniki)
- **Avatar** - awatar użytkownika
- **Badge** - etykieta (kategorie)
- **Skeleton** - loader szkieletowy

### Feedback i Dialogi

- **Alert** - powiadomienie
- **Alert Dialog** - dialog potwierdzenia
- **Dialog** - modal dialog
- **Sonner** - toasty (poprzednio Toast)
- **Tooltip** - dymek podpowiedzi
- **Hover Card** - karta przy hoverze
- **Popover** - popover

### Interakcje

- **Accordion** - rozwijane sekcje
- **Collapsible** - zwijany element
- **Context Menu** - menu kontekstowe
- **Dropdown Menu** - rozwijane menu
- **Command** - paleta komend (Cmd+K)
- **Toggle** - przycisk toggle

---

## Stylowanie i Dostosowanie

### Zmienne CSS (Light/Dark Mode)

Projekt używa zmiennych CSS zdefiniowanych w `app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  /* ... więcej zmiennych */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  /* ... więcej zmiennych */
}
```

### Dostosowanie Komponentu

Komponenty są w pełni edytowalne - znajdują się w folderze projektu:

```tsx
// components/ui/button.tsx
export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Możesz edytować implementację
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

### Dodanie Wariantu

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center...',
  {
    variants: {
      variant: {
        default: '...',
        destructive: '...',
        outline: '...',
        // ✅ Dodaj nowy wariant
        success: 'bg-green-600 text-white hover:bg-green-700',
      },
      // ...
    },
  }
)

// Użycie
<Button variant="success">Zapisz</Button>
```

---

## Najlepsze Praktyki

### 1. Używaj Komponentów Shadcn/UI Zamiast Raw HTML

```tsx
// ❌ Unikaj
<button className="px-4 py-2 bg-blue-500...">Click me</button>

// ✅ Używaj shadcn/ui
<Button variant="default">Click me</Button>
```

### 2. Kompozycja Komponentów

```tsx
// ✅ Komponuj komponenty dla złożonych UI
function MealCard({ meal }: { meal: Meal }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{meal.name}</CardTitle>
        <CardDescription>{meal.mealType}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <Progress value={(meal.calories / 600) * 100} />
          <p className='text-muted-foreground text-sm'>
            {meal.calories} kcal | P: {meal.protein}g | T: {meal.fat}g | W:{' '}
            {meal.carbs}g
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant='outline' className='w-full'>
          Oznacz jako zjedzone
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### 3. Accessibility

Komponenty shadcn/ui są dostępne domyślnie (ARIA attributes, keyboard navigation):

```tsx
// ✅ Dialog automatycznie dodaje ARIA attributes
<Dialog>
  <DialogTrigger asChild>
    <Button>Otwórz dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Tytuł</DialogTitle>
      <DialogDescription>Opis</DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### 4. TypeScript Support

Wszystkie komponenty są w pełni typowane:

```tsx
import { ButtonProps } from '@/components/ui/button'

// ✅ Tworzenie custom komponentu z typami
function SubmitButton(props: ButtonProps) {
  return <Button type='submit' {...props} />
}
```

### 5. Server vs Client Components

```tsx
// ✅ Komponenty shadcn/ui działają z Server Components
export default async function MealPlanPage() {
  const meals = await getMeals() // Server-side fetch

  return (
    <div className='space-y-4'>
      {meals.map((meal) => (
        <Card key={meal.id}>
          <CardHeader>
            <CardTitle>{meal.name}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

// ⚠️ Interaktywne komponenty wymagają 'use client'
;('use client')

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export function InteractiveMealCard() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ... */}
    </Dialog>
  )
}
```

---

## Użyteczne Linki

- **Oficjalna dokumentacja**: https://ui.shadcn.com
- **Lista komponentów**: https://ui.shadcn.com/docs/components
- **Przykłady**: https://ui.shadcn.com/examples
- **GitHub**: https://github.com/shadcn-ui/ui
- **Tailwind CSS**: https://tailwindcss.com/docs

---

## Troubleshooting

### "Module not found: @/components/ui/..."

**Problem**: Path alias nie działa

**Rozwiązanie**: Sprawdź `tsconfig.json` i `components.json`

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### "Component styles not applying"

**Problem**: Style nie są aplikowane

**Rozwiązanie**: Sprawdź czy `app/globals.css` jest zaimportowany w `app/layout.tsx`

```tsx
// app/layout.tsx
import './globals.css'
```

### "Dark mode not working"

**Problem**: Tryb ciemny nie działa

**Rozwiązanie**: Zaimplementuj ThemeProvider (next-themes)

```bash
npm install next-themes
```

```tsx
// app/providers.tsx
'use client'

import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      {children}
    </ThemeProvider>
  )
}
```

---

**Shadcn/UI to fundament UI dla LowCarbPlaner - używaj go konsekwentnie dla spójnego, dostępnego interfejsu.**
