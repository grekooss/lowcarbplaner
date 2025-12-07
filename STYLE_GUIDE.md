# LowCarbPlaner - Style Guide

Ten dokument stanowi przewodnik po systemie stylów dla projektu LowCarbPlaner - aplikacji do planowania niskowęglowodanowej diety. Służy jako źródło prawdy dla deweloperów i projektantów, zapewniając spójność wizualną i techniczną.

## Spis treści

1. [Przegląd](#1-przegląd)
2. [Filozofia Designu](#2-filozofia-designu)
3. [Paleta Kolorów](#3-paleta-kolorów)
4. [Typografia](#4-typografia)
5. [System Spacingu](#5-system-spacingu)
6. [Border Radius](#6-border-radius)
7. [System Cieni](#7-system-cieni)
8. [Glassmorphism](#8-glassmorphism)
9. [Komponenty UI](#9-komponenty-ui)
10. [Ikony](#10-ikony)
11. [Animacje i Przejścia](#11-animacje-i-przejścia)
12. [Responsywność](#12-responsywność)
13. [Zmienne CSS](#13-zmienne-css)
14. [Wzorce Layoutu](#14-wzorce-layoutu)
15. [Dostępność](#15-dostępność)
16. [Przykłady Komponentów](#16-przykłady-komponentów)

---

## 1. Przegląd

### Tech Stack

| Technologia         | Wersja  | Przeznaczenie                 |
| ------------------- | ------- | ----------------------------- |
| **Next.js**         | 15.5.4  | Framework React z App Router  |
| **React**           | 19.1.0  | Biblioteka UI                 |
| **TypeScript**      | 5.x     | Typowanie statyczne           |
| **Tailwind CSS**    | v4      | Framework CSS (utility-first) |
| **Radix UI**        | Latest  | Headless komponenty UI        |
| **lucide-react**    | 0.545.0 | Biblioteka ikon               |
| **Recharts**        | 3.5.1   | Wykresy i wizualizacje        |
| **Zustand**         | 5.0.8   | Zarządzanie stanem            |
| **React Hook Form** | 7.65.0  | Obsługa formularzy            |
| **Zod**             | 4.1.12  | Walidacja schematów           |
| **Supabase**        | 2.75.0  | Backend i baza danych         |

### Biblioteki UI (Radix)

- `@radix-ui/react-dialog` - Modalne okna dialogowe
- `@radix-ui/react-select` - Rozwijane listy wyboru
- `@radix-ui/react-checkbox` - Pola wyboru
- `@radix-ui/react-tabs` - Zakładki
- `@radix-ui/react-accordion` - Akordeony
- `@radix-ui/react-progress` - Paski postępu
- `@radix-ui/react-radio-group` - Grupy radio
- `@radix-ui/react-scroll-area` - Obszary przewijania

### Narzędzia Stylowania

- **class-variance-authority (CVA)** - Warianty komponentów
- **clsx** - Kompozycja klas CSS
- **tailwind-merge** - Inteligentne łączenie klas Tailwind

---

## 2. Filozofia Designu

### Zasady Główne

1. **Glassmorphism-First**: Efekt szkła jako dominujący element wizualny - przezroczyste tła z blur, delikatne cienie
2. **Czystość i Minimalizm**: Funkcjonalny interfejs bez zbędnych ozdobników, skupiony na danych żywieniowych
3. **Mobile-First RWD**: Responsywny design z breakpointami Tailwind
4. **Kategoryzacja Kolorami**: Posiłki (śniadanie, obiad, przekąska, kolacja) mają dedykowane palety kolorów
5. **Dostępność (a11y)**: WCAG 2.1 AA - wysoki kontrast, semantyczny HTML, obsługa klawiatury

### Hierarchia Priorytetów

```
Użyteczność > Czytelność > Estetyka > Efekty wizualne
```

### Charakterystyka Wizualna

- Ciepłe, jasne tło (#f3f4f6)
- Białe karty z efektem szkła
- Czerwony akcent jako kolor główny (#dc2626)
- Zaokrąglone krawędzie (12-20px)
- Subtelne cienie i przejścia
- Font Montserrat dla czytelności

---

## 3. Paleta Kolorów

### Kolory Podstawowe

| Nazwa             | Zmienna CSS       | Hex       | Przeznaczenie                       |
| ----------------- | ----------------- | --------- | ----------------------------------- |
| **Primary**       | `--primary`       | `#dc2626` | Przyciski główne, linki, akcenty    |
| **Primary Light** | `--primary-light` | `#ef4444` | Hover states, tła                   |
| **Primary Dark**  | `--primary-dark`  | `#b91c1c` | Active states, ciemniejsze warianty |
| **Primary Hover** | `--primary-hover` | `#c81e1e` | Stan hover przycisków               |

### Kolory Dodatkowe

| Nazwa               | Zmienna CSS         | Hex       | Przeznaczenie                           |
| ------------------- | ------------------- | --------- | --------------------------------------- |
| **Secondary**       | `--secondary`       | `#6b7280` | Przyciski drugorzędne, tekst pomocniczy |
| **Secondary Light** | `--secondary-light` | `#9ca3af` | Jasne elementy neutralne                |
| **Secondary Dark**  | `--secondary-dark`  | `#4b5563` | Ciemniejsze elementy neutralne          |
| **Tertiary**        | `--tertiary`        | `#f97316` | Akcenty pomarańczowe, ostrzeżenia       |
| **Quaternary**      | `--quaternary`      | `#e5e7eb` | Tła sekcji, bordery                     |

### Kolory Kategorii Posiłków

| Posiłek       | Tło       | Tekst     | Przeznaczenie              |
| ------------- | --------- | --------- | -------------------------- |
| **Śniadanie** | `#fef3c7` | `#92400e` | Żółty - poranna energia    |
| **Obiad**     | `#dcfce7` | `#166534` | Zielony - główny posiłek   |
| **Przekąska** | `#fce7f3` | `#9d174d` | Różowy - lekka przekąska   |
| **Kolacja**   | `#e0e7ff` | `#3730a3` | Indygo - wieczorny posiłek |

### Kolory Semantyczne

| Stan         | Zmienna CSS  | Hex       | Przeznaczenie           |
| ------------ | ------------ | --------- | ----------------------- |
| **Success**  | `--success`  | `#22c55e` | Sukces, potwierdzenia   |
| **Warning**  | `--warning`  | `#f59e0b` | Ostrzeżenia, uwagi      |
| **Error**    | `--error`    | `#ef4444` | Błędy, usuwanie         |
| **Error BG** | `--error-bg` | `#fef2f2` | Tło komunikatów błędów  |
| **Info**     | `--info`     | `#3b82f6` | Informacje, podpowiedzi |

### Kolory Tekstu

| Typ           | Zmienna CSS        | Hex       | Przeznaczenie          |
| ------------- | ------------------ | --------- | ---------------------- |
| **Main**      | `--text-main`      | `#1f2937` | Tekst główny, nagłówki |
| **Secondary** | `--text-secondary` | `#4b5563` | Tekst drugorzędny      |
| **Muted**     | `--text-muted`     | `#6b7280` | Tekst wyciszony, opisy |
| **Disabled**  | `--text-disabled`  | `#9ca3af` | Tekst nieaktywny       |

### Kolory Tła

| Warstwa          | Zmienna CSS      | Wartość   | Przeznaczenie     |
| ---------------- | ---------------- | --------- | ----------------- |
| **Background**   | `--background`   | `#f3f4f6` | Główne tło strony |
| **BG Main**      | `--bg-main`      | `#ffffff` | Białe tło kart    |
| **BG Secondary** | `--bg-secondary` | `#f9fafb` | Tło sekcji        |
| **BG Tertiary**  | `--bg-tertiary`  | `#f3f4f6` | Tło hover         |

---

## 4. Typografia

### Font Family

```css
--font-sans: var(--font-montserrat);
--font-mono: var(--font-geist-mono);
```

**Montserrat** (Google Fonts) - font główny aplikacji

- Wagi: 300, 400, 500, 600, 700, 800
- Subset: Latin, Latin-ext (obsługa polskich znaków)
- `display: 'swap'` - zapobiega FOUT

**Geist Mono** - font techniczny

- Kod, dane numeryczne, ID

### Skala Rozmiarów

| Token              | Rozmiar   | Pixels | Przeznaczenie                         |
| ------------------ | --------- | ------ | ------------------------------------- |
| `--font-size-tiny` | 0.6875rem | 11px   | Mikro etykiety, tooltips              |
| `--font-size-xs`   | 0.75rem   | 12px   | Badge, małe etykiety                  |
| `--font-size-sm`   | 0.875rem  | 14px   | Etykiety formularzy, tekst pomocniczy |
| `--font-size-base` | 1rem      | 16px   | Tekst główny (domyślny)               |
| `--font-size-lg`   | 1.125rem  | 18px   | Podtytuły                             |
| `--font-size-xl`   | 1.25rem   | 20px   | Nagłówki sekcji                       |
| `--font-size-2xl`  | 1.5rem    | 24px   | Duże nagłówki                         |
| `--font-size-3xl`  | 1.875rem  | 30px   | Tytuły stron                          |
| `--font-size-4xl`  | 2rem      | 32px   | Hero, główne tytuły                   |

### Wagi Fontów

| Waga      | Wartość | Przeznaczenie               |
| --------- | ------- | --------------------------- |
| Light     | 300     | Tekst dekoracyjny, subtelny |
| Regular   | 400     | Tekst główny, opisy         |
| Medium    | 500     | Etykiety, podkreślenia      |
| SemiBold  | 600     | Przyciski, nagłówki kart    |
| Bold      | 700     | Nagłówki sekcji             |
| ExtraBold | 800     | Hero, główne tytuły         |

### Line Height

```css
body {
  line-height: 1.5; /* 24px przy 16px base */
}
```

- **Tight (1.2)**: Nagłówki, tytuły
- **Normal (1.5)**: Tekst główny
- **Relaxed (1.75)**: Długie opisy

---

## 5. System Spacingu

### Jednostka Bazowa

**4px** - wszystkie wartości spacingu są wielokrotnościami 4px.

### Skala Spacingu

| Token          | Wartość | Pixels | Przeznaczenie          |
| -------------- | ------- | ------ | ---------------------- |
| `--spacing-1`  | 0.25rem | 4px    | Minimalny odstęp       |
| `--spacing-2`  | 0.5rem  | 8px    | Gap między ikonami     |
| `--spacing-3`  | 0.75rem | 12px   | Padding mały           |
| `--spacing-4`  | 1rem    | 16px   | **Padding domyślny**   |
| `--spacing-5`  | 1.25rem | 20px   | Padding średni         |
| `--spacing-6`  | 1.5rem  | 24px   | Padding duży           |
| `--spacing-8`  | 2rem    | 32px   | Odstęp sekcji          |
| `--spacing-10` | 2.5rem  | 40px   | Duży odstęp            |
| `--spacing-12` | 3rem    | 48px   | Odstęp między sekcjami |

### Standardowe Użycie

**Przyciski:**

- Default: `h-10 (40px) px-6 (24px) py-2.5 (10px)`
- Small: `h-9 (36px) px-4 (16px) py-2 (8px)`
- Large: `h-11 (44px) px-8 (32px) py-3 (12px)`
- Icon: `h-9 w-9 (36x36px) p-2 (8px)`

**Inputy:**

- Height: `40px (h-10)`
- Padding: `px-4 (16px) py-2.5 (10px)`

**Karty:**

- Padding: `16px (p-4)`
- Header/Footer: `16px`
- Content spacing: `space-y-1.5`

**Badge:**

- Default: `h-7 (28px) px-3 (12px)`
- Small: `h-6 (24px) px-2 (8px)`
- Large: `h-8 (32px) px-4 (16px)`

---

## 6. Border Radius

### Skala Zaokrągleń

| Token           | Wartość | Przeznaczenie                       |
| --------------- | ------- | ----------------------------------- |
| `--radius-sm`   | 8px     | Inputy, przyciski, małe karty       |
| `--radius`      | 12px    | Karty, modalne (domyślny)           |
| `--radius-md`   | 16px    | Karty glassmorphism                 |
| `--radius-lg`   | 20px    | Duże komponenty, strong glass       |
| `--radius-xl`   | 24px    | Panele, duże karty                  |
| `--radius-2xl`  | 28px    | Extra duże komponenty               |
| `--radius-full` | 9999px  | Pełne zaokrąglenie (pills, avatary) |

### Zastosowanie

```tsx
// Inputy
className = 'rounded-[8px]'

// Karty standardowe
className = 'rounded-[12px]'

// Karty glassmorphism
className = 'rounded-[16px]'

// Badge, pills
className = 'rounded-full'
```

---

## 7. System Cieni

### Tokeny Cieni

| Token                 | Wartość                                 | Przeznaczenie       |
| --------------------- | --------------------------------------- | ------------------- |
| `--shadow-card`       | `0 4px 20px rgba(0, 0, 0, 0.02)`        | Subtelny cień kart  |
| `--shadow-card-hover` | `0 8px 30px rgba(0, 0, 0, 0.08)`        | Hover na kartach    |
| `--shadow-hero`       | `0 8px 30px rgba(0, 0, 0, 0.04)`        | Sekcje hero         |
| `--shadow-elevated`   | `0 25px 50px -12px rgba(0, 0, 0, 0.25)` | Modalne, dropdown   |
| `--shadow-glass`      | `0 8px 32px rgba(0, 0, 0, 0.1)`         | Efekt glassmorphism |

### Użycie w Tailwind

```tsx
// Karta standardowa
className = 'shadow-[var(--shadow-card)]'

// Hover effect
className = 'hover:shadow-[var(--shadow-card-hover)]'

// Modal/Dialog
className = 'shadow-[var(--shadow-elevated)]'
```

---

## 8. Glassmorphism

### Efekt Szkła - Standardowy

```css
.card-glass {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 2px solid rgba(255, 255, 255, 1);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}
```

### Efekt Szkła - Mocny

```css
.card-glass-strong {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 1);
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}
```

### Zmienne CSS dla Glass

```css
--glass-bg: rgba(255, 255, 255, 0.4);
--glass-bg-light: rgba(255, 255, 255, 0.6);
--glass-bg-strong: rgba(255, 255, 255, 0.8);
--glass-border: rgba(255, 255, 255, 1);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

### Użycie

```tsx
// Karta ze szklanym efektem
<div className="card-glass">
  {/* content */}
</div>

// Silniejszy efekt
<div className="card-glass-strong">
  {/* content */}
</div>
```

---

## 9. Komponenty UI

Projekt wykorzystuje **21 komponentów bazowych** w katalogu `src/components/ui/`.

### Button

**Warianty:**

| Wariant       | Styl                      | Przeznaczenie                |
| ------------- | ------------------------- | ---------------------------- |
| `default`     | Czerwony, biały tekst     | Główne akcje (CTA)           |
| `secondary`   | Szary, biały tekst        | Akcje drugorzędne            |
| `tertiary`    | Pomarańczowy, biały tekst | Akcje alternatywne           |
| `outline`     | Przezroczysty, border     | Akcje neutralne              |
| `ghost`       | Przezroczysty             | Akcje subtelne               |
| `destructive` | Czerwony error            | Usuwanie, akcje destrukcyjne |
| `link`        | Tekst z underline         | Linki w tekście              |

**Rozmiary:**

| Rozmiar   | Wymiary   | Przeznaczenie |
| --------- | --------- | ------------- |
| `default` | h-10 px-6 | Standardowy   |
| `sm`      | h-9 px-4  | Kompaktowy    |
| `lg`      | h-11 px-8 | Wyróżniony    |
| `icon`    | h-9 w-9   | Tylko ikona   |
| `icon-sm` | h-8 w-8   | Mała ikona    |
| `icon-lg` | h-10 w-10 | Duża ikona    |

**Przykład:**

```tsx
import { Button } from '@/components/ui/button'

// Przycisk główny
<Button variant="default">Zapisz przepis</Button>

// Przycisk z ikoną
<Button variant="outline" size="sm">
  <Plus className="size-4" />
  Dodaj składnik
</Button>

// Przycisk ikony
<Button variant="ghost" size="icon">
  <Settings className="size-5" />
</Button>
```

### Card

**Warianty:**

| Wariant     | Opis                       | Przeznaczenie           |
| ----------- | -------------------------- | ----------------------- |
| `default`   | Białe tło z borderem       | Standardowa karta       |
| `hero`      | Bez bordera i cienia       | Sekcje wyróżnione       |
| `elevated`  | Bez bordera, cień elevated | Dropdown, modal content |
| `flat`      | Bez cienia                 | Płaska karta            |
| `breakfast` | Żółte tło                  | Karta śniadania         |
| `lunch`     | Zielone tło                | Karta obiadu            |
| `snack`     | Różowe tło                 | Karta przekąski         |
| `dinner`    | Indygo tło                 | Karta kolacji           |
| `panel`     | Szare tło                  | Panel informacyjny      |

**Struktura:**

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

;<Card variant='default' hoverable>
  <CardHeader>
    <CardTitle>Tytuł karty</CardTitle>
    <CardDescription>Opis karty</CardDescription>
  </CardHeader>
  <CardContent>{/* Treść */}</CardContent>
  <CardFooter>{/* Stopka z akcjami */}</CardFooter>
</Card>
```

### Badge

**Warianty:**

| Kategoria               | Warianty                                                    |
| ----------------------- | ----------------------------------------------------------- |
| **Posiłki**             | `breakfast`, `lunch`, `snack`, `dinner`                     |
| **Status**              | `success`, `pending`, `warning`, `error`, `destructive`     |
| **Trudność**            | `easy`, `medium`, `hard`                                    |
| **Kategorie produktów** | `grains`, `veggies`, `protein`, `fruits`, `dairy`, `others` |
| **Neutralne**           | `default`, `secondary`, `tertiary`, `outline`               |

**Rozmiary:** `default`, `sm`, `lg`

```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant="breakfast">Śniadanie</Badge>
<Badge variant="success" size="sm">Gotowe</Badge>
<Badge variant="protein">Białko</Badge>
```

### Input

```tsx
import { Input } from '@/components/ui/input'

;<Input type='text' placeholder='Nazwa przepisu' className='w-full' />
```

**Stylowanie:**

- Border radius: 8px
- Height: 40px (h-10)
- Padding: px-4 py-2.5
- Focus: `border-primary ring-primary/10`
- Placeholder: `text-text-disabled`

### Select

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

;<Select>
  <SelectTrigger>
    <SelectValue placeholder='Wybierz kategorię' />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value='breakfast'>Śniadanie</SelectItem>
    <SelectItem value='lunch'>Obiad</SelectItem>
    <SelectItem value='snack'>Przekąska</SelectItem>
    <SelectItem value='dinner'>Kolacja</SelectItem>
  </SelectContent>
</Select>
```

### Dialog

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

;<Dialog>
  <DialogTrigger asChild>
    <Button>Otwórz</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Tytuł dialogu</DialogTitle>
      <DialogDescription>Opis dialogu</DialogDescription>
    </DialogHeader>
    {/* Treść */}
    <DialogFooter>
      <Button variant='outline'>Anuluj</Button>
      <Button>Zapisz</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Progress

```tsx
import { Progress } from '@/components/ui/progress'

<Progress value={75} className="h-2" />

// Z custom kolorem wskaźnika
<Progress
  value={50}
  indicatorClassName="bg-success"
/>
```

### Alert

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

;<Alert variant='destructive'>
  <AlertCircle className='h-4 w-4' />
  <AlertTitle>Błąd</AlertTitle>
  <AlertDescription>Nie udało się zapisać przepisu.</AlertDescription>
</Alert>
```

### Form (React Hook Form)

```tsx
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Nazwa musi mieć min. 2 znaki'),
})

function RecipeForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa przepisu</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Podaj nazwę przepisu</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
```

---

## 10. Ikony

### Biblioteka Główna - lucide-react

```tsx
import {
  LayoutDashboard,
  CalendarRange,
  Utensils,
  ShoppingCart,
  User,
  Settings,
  Plus,
  X,
  ChevronDown,
  Search,
  Edit,
  Trash2,
  Check,
  AlertCircle,
  Info,
  LogOut,
  Menu,
} from 'lucide-react'
```

### Rozmiary Ikon

| Klasa    | Rozmiar | Przeznaczenie                          |
| -------- | ------- | -------------------------------------- |
| `size-4` | 16px    | Małe ikony (input, badge)              |
| `size-5` | 20px    | **Standardowy** (przyciski, nawigacja) |
| `size-6` | 24px    | Duże ikony (hero, nagłówki)            |

### Konwencja Użycia

```tsx
// Przycisk z ikoną
<Button>
  <Plus className="size-5" />
  Dodaj przepis
</Button>

// Ikona w input
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
  <Input className="pl-10" />
</div>

// Ikona standalone
<div className="p-2 rounded-full bg-primary/10">
  <Utensils className="size-5 text-primary" />
</div>
```

### SVG Management w Przyciskach

```tsx
// Automatyczne zarządzanie SVG w Button
className = '[&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:pointer-events-none'
```

---

## 11. Animacje i Przejścia

### Globalne Przejścia

```css
* {
  transition-property: color, background-color, border-color, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
```

### Wyłączenia

```css
/* Radix UI dropdowns - bez animacji transform */
[data-radix-select-content],
[data-radix-popper-content-wrapper] {
  transition: none !important;
}
```

### Animacje Custom

**animate-in** (500ms)

```css
@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**fade-in** (500ms)

```css
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

**slide-in-from-bottom-10** (1s)

```css
@keyframes slide-in-from-bottom-10 {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Hover na Kartach

```tsx
// Z prop hoverable na Card
<Card hoverable>{/* Na hover: -translate-y-0.5 shadow-card-hover */}</Card>
```

---

## 12. Responsywność

### Breakpoints (Tailwind)

| Breakpoint | Prefix    | Viewport | Opis               |
| ---------- | --------- | -------- | ------------------ |
| X-Small    | (default) | < 640px  | Telefony           |
| Small      | `sm:`     | ≥ 640px  | Telefony landscape |
| Medium     | `md:`     | ≥ 768px  | Tablety            |
| Large      | `lg:`     | ≥ 1024px | Laptopy            |
| X-Large    | `xl:`     | ≥ 1280px | Desktopy           |
| 2X-Large   | `2xl:`    | ≥ 1536px | Duże ekrany        |

### Przykłady Użycia

```tsx
// Responsywna siatka
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>

// Ukrywanie elementów
<div className="hidden md:block">
  Widoczne od tabletu
</div>

// Responsywny tekst
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Tytuł
</h1>

// Responsywny padding
<section className="px-4 md:px-6 lg:px-8">
  Treść
</section>
```

---

## 13. Zmienne CSS

### Pełna Lista Zmiennych

```css
:root {
  /* Kolory podstawowe */
  --background: #f3f4f6;
  --foreground: #1f2937;

  /* Primary (czerwony) */
  --primary: #dc2626;
  --primary-light: #ef4444;
  --primary-dark: #b91c1c;
  --primary-hover: #c81e1e;
  --primary-foreground: #ffffff;

  /* Secondary (szary) */
  --secondary: #6b7280;
  --secondary-light: #9ca3af;
  --secondary-dark: #4b5563;
  --secondary-foreground: #ffffff;

  /* Tertiary (pomarańczowy) */
  --tertiary: #f97316;
  --tertiary-light: #fb923c;
  --tertiary-dark: #ea580c;
  --tertiary-foreground: #ffffff;

  /* Quaternary (jasny szary) */
  --quaternary: #e5e7eb;
  --quaternary-light: #f3f4f6;
  --quaternary-dark: #d1d5db;
  --quaternary-foreground: #1f2937;

  /* Kategorie posiłków */
  --breakfast: #fef3c7;
  --breakfast-foreground: #92400e;
  --lunch: #dcfce7;
  --lunch-foreground: #166534;
  --snack: #fce7f3;
  --snack-foreground: #9d174d;
  --dinner: #e0e7ff;
  --dinner-foreground: #3730a3;

  /* Stany */
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --error-bg: #fef2f2;
  --error-hover: #dc2626;
  --info: #3b82f6;

  /* Tekst */
  --text-main: #1f2937;
  --text-secondary: #4b5563;
  --text-muted: #6b7280;
  --text-disabled: #9ca3af;
  --muted-foreground: #6b7280;

  /* Tła */
  --bg-main: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --bg-card: rgba(255, 255, 255, 0.4);

  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.4);
  --glass-bg-light: rgba(255, 255, 255, 0.6);
  --glass-bg-strong: rgba(255, 255, 255, 0.8);
  --glass-border: rgba(255, 255, 255, 1);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  /* Bordery */
  --border: rgba(255, 255, 255, 0.8);
  --border-light: rgba(255, 255, 255, 1);
  --border-focus: var(--primary);

  /* Cienie */
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.02);
  --shadow-card-hover: 0 8px 30px rgba(0, 0, 0, 0.08);
  --shadow-hero: 0 8px 30px rgba(0, 0, 0, 0.04);
  --shadow-elevated: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-glass: 0 8px 32px rgba(0, 0, 0, 0.1);

  /* Border Radius */
  --radius-sm: 8px;
  --radius: 12px;
  --radius-md: 16px;
  --radius-lg: 20px;
  --radius-xl: 24px;
  --radius-2xl: 28px;
  --radius-full: 9999px;

  /* Typografia */
  --font-sans: var(--font-montserrat);
  --font-mono: var(--font-geist-mono);

  --font-size-tiny: 0.6875rem;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2rem;

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-5: 1.25rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-10: 2.5rem;
  --spacing-12: 3rem;
}
```

---

## 14. Wzorce Layoutu

### Layout Główny (AppShell)

```tsx
<div className='bg-background min-h-screen'>
  {/* Sidebar (desktop) */}
  <aside className='fixed top-0 left-0 hidden h-full w-64 lg:block'>
    <Navigation />
  </aside>

  {/* Main Content */}
  <main className='min-h-screen lg:ml-64'>
    <div className='container mx-auto px-4 py-6'>{children}</div>
  </main>

  {/* Mobile Bottom Navigation */}
  <nav className='fixed right-0 bottom-0 left-0 lg:hidden'>
    <MobileNav />
  </nav>
</div>
```

### Siatka Przepisów

```tsx
<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
  {recipes.map((recipe) => (
    <RecipeCard key={recipe.id} recipe={recipe} />
  ))}
</div>
```

### Plan Posiłków (Tygodniowy)

```tsx
<div className='grid grid-cols-7 gap-2'>
  {days.map((day) => (
    <DayColumn key={day} day={day}>
      {meals.map((meal) => (
        <MealCard key={meal.id} meal={meal} />
      ))}
    </DayColumn>
  ))}
</div>
```

### Formularz z Sidebar

```tsx
<div className='flex gap-6'>
  {/* Formularz główny */}
  <div className='flex-1 space-y-6'>
    <Card>
      <CardHeader>
        <CardTitle>Szczegóły przepisu</CardTitle>
      </CardHeader>
      <CardContent>{/* Pola formularza */}</CardContent>
    </Card>
  </div>

  {/* Sidebar */}
  <aside className='w-80 shrink-0'>
    <Card>
      <CardHeader>
        <CardTitle>Makroskładniki</CardTitle>
      </CardHeader>
      <CardContent>{/* Podsumowanie */}</CardContent>
    </Card>
  </aside>
</div>
```

### Flex Utilities

```tsx
// Wyrównanie poziome z przerwą
<div className="flex items-center gap-2">
  <Icon />
  <span>Tekst</span>
</div>

// Rozciągnięcie na szerokość
<div className="flex justify-between items-center">
  <div>Lewa strona</div>
  <div>Prawa strona</div>
</div>

// Stack pionowy
<div className="flex flex-col space-y-4">
  <Item />
  <Item />
</div>
```

---

## 15. Dostępność

### Wbudowane Funkcje (Radix UI)

- Pełna obsługa klawiatury
- Prawidłowe atrybuty ARIA
- Focus management w modalach
- Screen reader support

### Focus States

```css
focus-visible:ring-3
focus:ring-primary/10
focus:outline-none
```

### Semantyczny HTML

```tsx
// Używaj semantycznych elementów
<main>
  <section aria-labelledby="recipes-heading">
    <h2 id="recipes-heading">Przepisy</h2>
    {/* content */}
  </section>
</main>

// Przyciski vs Linki
<Button>Akcja</Button>           // Dla akcji
<Link href="/page">Nawigacja</Link>  // Dla nawigacji

// Alertyr
<Alert role="alert">
  <AlertDescription>Błąd</AlertDescription>
</Alert>
```

### Visually Hidden

```tsx
import { VisuallyHidden } from '@/components/ui/visually-hidden'

;<Button variant='icon'>
  <X className='size-5' />
  <VisuallyHidden>Zamknij</VisuallyHidden>
</Button>
```

### Kontrast Kolorów

Wszystkie kombinacje kolorów tekst/tło spełniają WCAG 2.1 AA:

- Tekst główny (#1f2937) na białym tle - kontrast 14.7:1
- Tekst pomocniczy (#6b7280) na białym tle - kontrast 5.0:1
- Biały tekst na primary (#dc2626) - kontrast 4.6:1

---

## 16. Przykłady Komponentów

### Karta Przepisu

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Users, Flame } from 'lucide-react'

interface RecipeCardProps {
  recipe: {
    id: string
    name: string
    category: 'breakfast' | 'lunch' | 'snack' | 'dinner'
    calories: number
    prepTime: number
    servings: number
    imageUrl?: string
  }
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card hoverable className='overflow-hidden'>
      {recipe.imageUrl && (
        <div className='relative aspect-video overflow-hidden'>
          <img
            src={recipe.imageUrl}
            alt={recipe.name}
            className='h-full w-full object-cover'
          />
        </div>
      )}

      <CardHeader>
        <div className='flex items-center justify-between'>
          <Badge variant={recipe.category}>
            {recipe.category === 'breakfast' && 'Śniadanie'}
            {recipe.category === 'lunch' && 'Obiad'}
            {recipe.category === 'snack' && 'Przekąska'}
            {recipe.category === 'dinner' && 'Kolacja'}
          </Badge>
          <span className='text-text-muted flex items-center gap-1 text-sm'>
            <Flame className='size-4' />
            {recipe.calories} kcal
          </span>
        </div>
        <CardTitle className='mt-2 text-lg'>{recipe.name}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className='text-text-secondary flex items-center gap-4 text-sm'>
          <span className='flex items-center gap-1'>
            <Clock className='size-4' />
            {recipe.prepTime} min
          </span>
          <span className='flex items-center gap-1'>
            <Users className='size-4' />
            {recipe.servings} porcji
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Button variant='outline' className='w-full'>
          Zobacz przepis
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### Pasek Postępu Makro

```tsx
import { Progress } from '@/components/ui/progress'

interface MacroProgressProps {
  label: string
  current: number
  target: number
  unit?: string
  color?: string
}

export function MacroProgress({
  label,
  current,
  target,
  unit = 'g',
  color = 'bg-primary',
}: MacroProgressProps) {
  const percentage = Math.min((current / target) * 100, 100)
  const isOver = current > target

  return (
    <div className='space-y-2'>
      <div className='flex justify-between text-sm'>
        <span className='text-text-main font-medium'>{label}</span>
        <span className={isOver ? 'text-error' : 'text-text-secondary'}>
          {current} / {target} {unit}
        </span>
      </div>
      <Progress
        value={percentage}
        indicatorClassName={isOver ? 'bg-error' : color}
      />
    </div>
  )
}
```

### Formularz Dodawania Przepisu

```tsx
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const recipeSchema = z.object({
  name: z.string().min(2, 'Nazwa musi mieć min. 2 znaki'),
  category: z.enum(['breakfast', 'lunch', 'snack', 'dinner']),
  description: z.string().optional(),
  prepTime: z.number().min(1, 'Podaj czas przygotowania'),
  servings: z.number().min(1, 'Podaj liczbę porcji'),
})

export function AddRecipeForm() {
  const form = useForm({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: '',
      category: 'lunch',
      description: '',
      prepTime: 30,
      servings: 2,
    },
  })

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dodaj nowy przepis</CardTitle>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nazwa przepisu</FormLabel>
                  <FormControl>
                    <Input placeholder='np. Jajecznica z awokado' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Wybierz kategorię' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='breakfast'>Śniadanie</SelectItem>
                      <SelectItem value='lunch'>Obiad</SelectItem>
                      <SelectItem value='snack'>Przekąska</SelectItem>
                      <SelectItem value='dinner'>Kolacja</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='prepTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Czas przygotowania (min)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='servings'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Liczba porcji</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis (opcjonalnie)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Krótki opis przepisu...'
                      className='min-h-[100px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className='flex justify-end gap-3'>
            <Button type='button' variant='outline'>
              Anuluj
            </Button>
            <Button type='submit'>Zapisz przepis</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
```

### Toast Notifications

```tsx
import { toast } from 'sonner'

// Sukces
toast.success('Przepis został zapisany')

// Błąd
toast.error('Nie udało się zapisać przepisu')

// Informacja
toast.info('Przepis dodany do planu')

// Z akcją
toast('Przepis usunięty', {
  action: {
    label: 'Cofnij',
    onClick: () => restoreRecipe(),
  },
})
```

---

## Podsumowanie

### Kluczowe Zasady

1. **Glassmorphism**: Używaj `.card-glass` i `.card-glass-strong` dla efektu szkła
2. **Kolory Posiłków**: Zawsze stosuj odpowiednie kolory dla kategorii (breakfast/lunch/snack/dinner)
3. **Spacing 4px**: Wszystkie odstępy w wielokrotnościach 4px
4. **Radix + CVA**: Komponenty oparte na Radix UI z wariantami CVA
5. **Mobile-First**: Zawsze zaczynaj od mobile, rozszerzaj dla większych ekranów
6. **Dostępność**: Semantyczny HTML, focus states, ARIA labels

### Checklist dla Nowych Komponentów

- [ ] Użyj istniejących komponentów z `@/components/ui/`
- [ ] Zastosuj zmienne CSS (`var(--...)`) zamiast hardcoded wartości
- [ ] Dodaj warianty przez CVA jeśli komponent ma różne stany
- [ ] Zapewnij responsywność (mobile → tablet → desktop)
- [ ] Dodaj focus states i hover effects
- [ ] Przetestuj z czytnikiem ekranu
- [ ] Użyj odpowiednich kolorów kategorii dla posiłków

### Pliki Konfiguracyjne

- `app/globals.css` - Zmienne CSS i globalne style
- `tailwind.config.ts` - Konfiguracja Tailwind
- `src/components/ui/` - Komponenty bazowe
- `src/lib/utils.ts` - Funkcja `cn()` do łączenia klas
