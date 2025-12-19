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
| **Next.js**         | 16.x    | Framework React z App Router  |
| **React**           | 19.x    | Biblioteka UI                 |
| **TypeScript**      | 5.x     | Typowanie statyczne           |
| **Tailwind CSS**    | v4      | Framework CSS (utility-first) |
| **Radix UI**        | Latest  | Headless komponenty UI        |
| **lucide-react**    | 0.545.0 | Biblioteka ikon               |
| **Recharts**        | 3.x     | Wykresy i wizualizacje        |
| **Zustand**         | 5.x     | Zarządzanie stanem            |
| **React Hook Form** | 7.x     | Obsługa formularzy            |
| **Zod**             | 4.x     | Walidacja schematów           |
| **Supabase**        | 2.x     | Backend i baza danych         |

### Biblioteki UI (Radix)

- `@radix-ui/react-dialog` - Modalne okna dialogowe
- `@radix-ui/react-select` - Rozwijane listy wyboru
- `@radix-ui/react-checkbox` - Pola wyboru
- `@radix-ui/react-tabs` - Zakładki
- `@radix-ui/react-accordion` - Akordeony
- `@radix-ui/react-progress` - Paski postępu
- `@radix-ui/react-radio-group` - Grupy radio
- `@radix-ui/react-scroll-area` - Obszary przewijania
- `@radix-ui/react-slider` - Suwaki

### Narzędzia Stylowania

- **class-variance-authority (CVA)** - Warianty komponentów
- **clsx** - Kompozycja klas CSS
- **tailwind-merge** - Inteligentne łączenie klas Tailwind

### Komponenty UI w Projekcie

Projekt zawiera **22 komponenty bazowe** w katalogu `src/components/ui/`:

```
accordion.tsx     alert-dialog.tsx  alert.tsx        badge.tsx
button.tsx        card.tsx          checkbox.tsx     dialog.tsx
form.tsx          input.tsx         label.tsx        progress.tsx
radio-group.tsx   scroll-area.tsx   select.tsx       separator.tsx
skeleton.tsx      slider.tsx        sonner.tsx       tabs.tsx
textarea.tsx      visually-hidden.tsx
```

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
- Białe karty z efektem szkła (bg-white/20 do bg-white/60)
- Czerwony akcent jako kolor główny (#dc2626)
- Zaokrąglone krawędzie (8-24px responsywnie)
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

| Posiłek       | Tło (CSS)     | Tekst (CSS)              | Hex Tło   | Hex Tekst |
| ------------- | ------------- | ------------------------ | --------- | --------- |
| **Śniadanie** | `--breakfast` | `--breakfast-foreground` | `#fef3c7` | `#92400e` |
| **Obiad**     | `--lunch`     | `--lunch-foreground`     | `#dcfce7` | `#166534` |
| **Przekąska** | `--snack`     | `--snack-foreground`     | `#fce7f3` | `#9d174d` |
| **Kolacja**   | `--dinner`    | `--dinner-foreground`    | `#e0e7ff` | `#3730a3` |

**Dodatkowy kolor dla Day Card:**

- `--dayCard`: `#dc2626` (używany dla wyróżnienia dni)

### Kolory Semantyczne

| Stan            | Zmienna CSS     | Hex       | Przeznaczenie            |
| --------------- | --------------- | --------- | ------------------------ |
| **Success**     | `--success`     | `#22c55e` | Sukces, potwierdzenia    |
| **Warning**     | `--warning`     | `#f59e0b` | Ostrzeżenia, uwagi       |
| **Error**       | `--error`       | `#ef4444` | Błędy, usuwanie          |
| **Error BG**    | `--error-bg`    | `#fef2f2` | Tło komunikatów błędów   |
| **Error Hover** | `--error-hover` | `#dc2626` | Hover dla destrukcyjnych |
| **Info**        | `--info`        | `#3b82f6` | Informacje, podpowiedzi  |

### Kolory Tekstu

| Typ           | Zmienna CSS        | Hex       | Przeznaczenie          |
| ------------- | ------------------ | --------- | ---------------------- |
| **Main**      | `--text-main`      | `#1f2937` | Tekst główny, nagłówki |
| **Secondary** | `--text-secondary` | `#4b5563` | Tekst drugorzędny      |
| **Muted**     | `--text-muted`     | `#6b7280` | Tekst wyciszony, opisy |
| **Disabled**  | `--text-disabled`  | `#9ca3af` | Tekst nieaktywny       |

### Kolory Tła

| Warstwa          | Zmienna CSS      | Wartość                 | Przeznaczenie         |
| ---------------- | ---------------- | ----------------------- | --------------------- |
| **Background**   | `--background`   | `#f3f4f6`               | Główne tło strony     |
| **BG Main**      | `--bg-main`      | `#ffffff`               | Białe tło kart        |
| **BG Secondary** | `--bg-secondary` | `#f9fafb`               | Tło sekcji            |
| **BG Tertiary**  | `--bg-tertiary`  | `#f3f4f6`               | Tło hover             |
| **BG Card**      | `--bg-card`      | `rgba(255,255,255,0.4)` | Tło kart glassmorphic |

---

## 4. Typografia

### Font Family

```css
--font-sans:
  var(--font-montserrat), 'Montserrat', system-ui, -apple-system, sans-serif;
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

### Wagi Fontów (rzeczywiste użycie)

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

- **Tight (leading-tight)**: Nagłówki, tytuły
- **Normal (1.5)**: Tekst główny
- **Relaxed (leading-relaxed)**: Długie opisy

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

- Default: `h-10 px-6 py-2.5` (40px height)
- Small: `h-9 px-4 py-2` (36px height)
- Large: `h-11 px-8 py-3` (44px height)
- Icon: `h-9 w-9 p-2` (36x36px)
- Icon-sm: `h-8 w-8 p-1.5` (32x32px)
- Icon-lg: `h-10 w-10 p-2.5` (40x40px)

**Inputy:**

- Height: `40px (h-10)`
- Padding: `px-4 py-2.5`
- Border: `border-[1.5px]`

**Karty:**

- Padding: `16px (p-4)`
- Header/Footer: `p-4`
- Content: `p-4 pt-0`
- Content spacing: `space-y-1.5`

**Badge:**

- Default: `h-7 px-3 py-1.5`
- Small: `h-6 px-2`
- Large: `h-8 px-4`

**Tabs:**

- TabsList: `p-1 gap-2`
- TabsTrigger: `px-6 py-3`

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

### Zastosowanie w Komponentach

| Komponent | Border Radius | Klasa Tailwind                             |
| --------- | ------------- | ------------------------------------------ |
| Button    | 8px           | `rounded-[8px]`                            |
| Card      | 12px          | `rounded-[12px]`                           |
| Badge     | 6px           | `rounded-[6px]`                            |
| Tab       | 8px           | `rounded-[8px]`                            |
| Input     | 8px           | `rounded-[8px]`                            |
| Progress  | 9999px        | `rounded-full`                             |
| Dialog    | responsive    | `sm:rounded-lg lg:rounded-3xl`             |
| Select    | 6px           | `rounded-sm` (small)                       |
| AppShell  | responsive    | `rounded-lg sm:rounded-2xl lg:rounded-3xl` |

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

### Rzeczywiste Użycie Tailwind

```tsx
// Przycisk - delikatny cień
className='shadow-sm hover:shadow-md active:shadow-none'

// Karta z hover efektem
className='hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]'

// Select dropdown
className='shadow-[0_14px_36px_rgba(15,23,42,0.12)]'

// AppShell main panel
className='shadow-2xl ring-1 ring-black/5'

// Card soft style
.card-soft {
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
}
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

### Rzeczywiste Użycie w Tailwind

```tsx
// AppShell Main Panel
className =
  'bg-white/20 backdrop-blur-md border-2 border-white ring-1 ring-black/5'

// Sidebar
className = 'bg-white/30 backdrop-blur-xl border-white/30'

// Featured Card
className = 'bg-white/40 backdrop-blur-xl border-2 border-white'

// Menu Dropdown
className = 'bg-white/90 backdrop-blur-sm'

// Navigation Active State
className = 'bg-white/60 backdrop-blur-xl border-white shadow-lg'

// Navigation Hover
className = 'hover:bg-white/10'
```

### Poziomy Przezroczystości

| Poziom | Opacity | Blur      | Użycie                  |
| ------ | ------- | --------- | ----------------------- |
| Light  | 0.2     | md (12px) | Main panel background   |
| Medium | 0.4     | xl (24px) | Featured cards          |
| Strong | 0.6     | xl (24px) | Active states, overlays |
| Solid  | 0.9     | sm (4px)  | Menu dropdowns          |

---

## 9. Komponenty UI

### Button

**Warianty:**

| Wariant       | Styl                                                         | Przeznaczenie                |
| ------------- | ------------------------------------------------------------ | ---------------------------- |
| `default`     | `bg-primary text-white shadow-sm hover:shadow-md`            | Główne akcje (CTA)           |
| `secondary`   | `bg-secondary text-white`                                    | Akcje drugorzędne            |
| `tertiary`    | `bg-tertiary text-white`                                     | Akcje alternatywne           |
| `outline`     | `border-[1.5px] border-border bg-white hover:border-primary` | Akcje neutralne              |
| `ghost`       | `bg-transparent hover:bg-bg-tertiary`                        | Akcje subtelne               |
| `destructive` | `bg-error text-white`                                        | Usuwanie, akcje destrukcyjne |
| `link`        | `text-primary underline-offset-4 hover:underline`            | Linki w tekście              |

**Rozmiary:**

| Rozmiar   | Klasy              | Przeznaczenie |
| --------- | ------------------ | ------------- |
| `default` | `h-10 px-6 py-2.5` | Standardowy   |
| `sm`      | `h-9 px-4 py-2`    | Kompaktowy    |
| `lg`      | `h-11 px-8 py-3`   | Wyróżniony    |
| `icon`    | `h-9 w-9 p-2`      | Tylko ikona   |
| `icon-sm` | `h-8 w-8 p-1.5`    | Mała ikona    |
| `icon-lg` | `h-10 w-10 p-2.5`  | Duża ikona    |

**Styl bazowy:**

```tsx
'font-semibold transition-all rounded-[8px] [&_svg]:size-5 [&_svg]:shrink-0'
```

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

| Wariant     | Opis                     | Przeznaczenie           |
| ----------- | ------------------------ | ----------------------- |
| `default`   | Białe tło z borderem     | Standardowa karta       |
| `hero`      | Bez bordera              | Sekcje wyróżnione       |
| `elevated`  | Bez bordera              | Dropdown, modal content |
| `flat`      | Border, bez shadow       | Płaska karta            |
| `breakfast` | Żółte tło (breakfast-bg) | Karta śniadania         |
| `lunch`     | Zielone tło (lunch-bg)   | Karta obiadu            |
| `snack`     | Różowe tło (snack-bg)    | Karta przekąski         |
| `dinner`    | Indygo tło (dinner-bg)   | Karta kolacji           |
| `panel`     | Szare tło (bg-secondary) | Panel informacyjny      |

**Hover Effect:**

```tsx
hoverable={true} // Dodaje: cursor-pointer hover:-translate-y-0.5 hover:shadow-[...]
```

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
    {' '}
    {/* p-4 space-y-1.5 */}
    <CardTitle>Tytuł karty</CardTitle> {/* text-base font-semibold */}
    <CardDescription>Opis karty</CardDescription>{' '}
    {/* text-sm text-text-secondary */}
  </CardHeader>
  <CardContent>
    {' '}
    {/* p-4 pt-0 */}
    {/* Treść */}
  </CardContent>
  <CardFooter>
    {' '}
    {/* flex items-center p-4 pt-0 */}
    {/* Stopka z akcjami */}
  </CardFooter>
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

**Rozmiary:**

| Rozmiar   | Klasy                  |
| --------- | ---------------------- |
| `default` | `h-7 px-3 text-xs`     |
| `sm`      | `h-6 px-2 text-[11px]` |
| `lg`      | `h-8 px-4 text-sm`     |

**Border radius:** `rounded-[6px]`

```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant="breakfast">Śniadanie</Badge>
<Badge variant="success" size="sm">Gotowe</Badge>
<Badge variant="protein">Białko</Badge>
```

### Tabs

**Warianty TabsList:**

- `default` - bg-bg-secondary
- `transparent` - bg-transparent

**Warianty TabsTrigger:**

| Wariant     | Active State                          |
| ----------- | ------------------------------------- |
| `default`   | `bg-primary text-primary-foreground`  |
| `breakfast` | `bg-breakfast-bg text-breakfast-text` |
| `lunch`     | `bg-lunch-bg text-lunch-text`         |
| `snack`     | `bg-snack-bg text-snack-text`         |
| `dinner`    | `bg-dinner-bg text-dinner-text`       |

**Style:**

- TabsList: `rounded-[8px] p-1 gap-2`
- TabsTrigger: `rounded-[8px] px-6 py-3 text-sm font-medium`

### Input

```tsx
import { Input } from '@/components/ui/input'

;<Input type='text' placeholder='Nazwa przepisu' className='w-full' />
```

**Stylowanie:**

- Border radius: `rounded-[8px]`
- Height: `h-10`
- Padding: `px-4 py-2.5`
- Border: `border-[1.5px] border-border`
- Focus: `focus:border-primary focus:ring-0`
- Placeholder: `placeholder:text-text-disabled`
- Disabled: `disabled:bg-bg-tertiary disabled:cursor-not-allowed`

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

**SelectContent Style:**

- Background: `bg-white/90 backdrop-blur-sm`
- Shadow: `shadow-[0_14px_36px_rgba(15,23,42,0.12)]`
- Border radius: `rounded-sm`

### Dialog

**Props specjalne:**

- `constrainToMainPanel` - centruje dialog w głównym panelu
- `coverMainPanel` - dialog pokrywa cały główny panel
- `coverMainPanelOnMobile` - pokrywa panel na mobile, modal na desktop
- `hideCloseButton` - ukrywa domyślny przycisk zamknięcia

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
  <DialogContent coverMainPanelOnMobile>
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

**Style:**

- Background: `bg-primary/20`
- Indicator: `bg-primary`
- Border radius: `rounded-full`

### Alert

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

;<Alert variant='destructive'>
  <AlertCircle className='h-4 w-4' />
  <AlertTitle>Błąd</AlertTitle>
  <AlertDescription>Nie udało się zapisać przepisu.</AlertDescription>
</Alert>
```

**Warianty:**

- `default` - neutralny
- `destructive` - dla błędów

---

## 10. Ikony

### Biblioteka Główna - lucide-react

```tsx
import {
  // Navigation
  LayoutDashboard,
  CalendarRange,
  Menu,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowDown,
  ArrowRight,
  ArrowUp,

  // Actions
  Plus,
  Minus,
  X,
  Check,
  Save,
  RefreshCw,
  Edit,
  Trash2,

  // UI States
  AlertCircle,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  Loader2,
  SearchX,

  // Food & Meals
  Utensils,
  UtensilsCrossed,
  ChefHat,
  Beef,
  Wheat,
  ShoppingBasket,

  // Data & Analytics
  BarChart3,
  Flame,
  Clock,
  Timer,
  Droplet,
  Star,

  // Layout
  Grid3x3,
  List,
  ListOrdered,
  MonitorPlay,

  // Status
  CheckCircle2,
  Circle,

  // Auth
  User,
  LogOut,
  Settings,
} from 'lucide-react'
```

### Radix UI Icons (uzupełniające)

```tsx
import {
  CheckIcon,
  ChevronDownIcon,
  Cross2Icon,
  ChevronUpIcon,
} from '@radix-ui/react-icons'
```

### Rozmiary Ikon

| Klasa       | Rozmiar | Przeznaczenie                          |
| ----------- | ------- | -------------------------------------- |
| `size-4`    | 16px    | Małe ikony (input, badge)              |
| `size-5`    | 20px    | **Standardowy** (przyciski, nawigacja) |
| `size-6`    | 24px    | Duże ikony (hero, nagłówki)            |
| `h-12 w-12` | 48px    | Extra duże (empty states)              |

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

// Loading spinner
<Loader2 className="size-5 animate-spin" />
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

### Wyłączenia dla Radix UI

```css
/* Radix UI dropdowns - bez animacji transform */
[data-radix-select-content],
[data-radix-popper-content-wrapper],
[data-radix-popper-content-wrapper] * {
  transition: none !important;
}
```

### Animacje Custom

**animate-in** (500ms)

```css
@keyframes animateIn {
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
@keyframes fadeIn {
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
@keyframes slideInFromBottom {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Użycie w Komponentach

```tsx
// Dialog - wbudowane animacje Radix
className='data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'

// Card hover
<Card hoverable>  {/* hover:-translate-y-0.5 */}

// Accordion chevron rotation
className='transition-transform duration-200'
```

### Klasy Utility

```tsx
.animate-in     // animateIn 0.5s ease-out forwards
.fade-in        // fadeIn 0.5s ease-out forwards
.slide-in-from-bottom-10  // slideInFromBottom 1s ease-out forwards
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

### Mobile Ad Layout (Orientation-based)

```css
/* Portrait mode - column layout */
.ad-layout-container {
  flex-direction: column !important;
  padding-bottom: 3.5rem !important;
}

/* Landscape mode (max-width: 1535px) - row layout */
@media screen and (orientation: landscape) and (max-width: 1535px) {
  .ad-layout-container {
    flex-direction: row !important;
    padding-bottom: 0 !important;
  }
}

/* 2xl screens - desktop ads */
@media screen and (min-width: 1536px) {
  .ad-panel-landscape,
  .ad-panel-portrait {
    display: none !important;
  }
}
```

### Przykłady Użycia

```tsx
// Responsywna siatka
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>...</Card>
</div>

// Ukrywanie elementów
<div className="hidden md:block">Widoczne od tabletu</div>
<div className="xl:hidden">Ukryte na desktopie</div>

// Responsywny tekst
<h1 className="text-2xl md:text-3xl lg:text-4xl">Tytuł</h1>

// Responsywny padding
<section className="px-2 sm:px-4 md:px-6 lg:px-8">Treść</section>

// Responsywny border-radius
<div className="rounded-lg sm:rounded-2xl lg:rounded-3xl">Panel</div>

// Responsywny spacing
<div className="gap-1 sm:gap-2 lg:gap-6">...</div>
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

  /* Day Card */
  --dayCard: #dc2626;

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
  --font-sans:
    var(--font-montserrat), 'Montserrat', system-ui, -apple-system, sans-serif;
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
  {/* Glassmorphic Main Container */}
  <div className='ad-layout-container flex'>
    {/* Main Panel */}
    <div className='relative flex h-full w-full flex-1 overflow-hidden rounded-lg border-2 border-white bg-white/20 shadow-2xl ring-1 ring-black/5 backdrop-blur-md sm:rounded-2xl lg:rounded-3xl'>
      {/* Desktop Sidebar */}
      <aside className='hidden w-64 flex-col bg-white/30 backdrop-blur-xl xl:flex'>
        <Navigation />
      </aside>

      {/* Content Area */}
      <main className='flex-1 overflow-y-auto'>{children}</main>
    </div>

    {/* Mobile Bottom Navigation */}
    <nav className='fixed right-0 bottom-0 left-0 xl:hidden'>
      <MobileNav />
    </nav>
  </div>
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
focus-visible:ring-primary/10
focus:ring-primary
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

// Alert z role
<Alert role="alert">
  <AlertDescription>Błąd</AlertDescription>
</Alert>
```

### Visually Hidden

```tsx
import { VisuallyHidden } from '@/components/ui/visually-hidden'

;<Button variant='ghost' size='icon'>
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

1. **Glassmorphism**: Używaj `bg-white/[20-60]` + `backdrop-blur-[md-xl]` + `border-2 border-white`
2. **Kolory Posiłków**: Zawsze stosuj odpowiednie kolory dla kategorii (breakfast/lunch/snack/dinner)
3. **Spacing 4px**: Wszystkie odstępy w wielokrotnościach 4px
4. **Radix + CVA**: Komponenty oparte na Radix UI z wariantami CVA
5. **Mobile-First**: Zawsze zaczynaj od mobile, rozszerzaj dla większych ekranów
6. **Dostępność**: Semantyczny HTML, focus states, ARIA labels
7. **Border Radius**: 6px (badge) → 8px (input/button) → 12px (card) → responsywnie do 24px

### Checklist dla Nowych Komponentów

- [ ] Użyj istniejących komponentów z `@/components/ui/`
- [ ] Zastosuj zmienne CSS (`var(--...)`) lub tokeny Tailwind
- [ ] Dodaj warianty przez CVA jeśli komponent ma różne stany
- [ ] Zapewnij responsywność (mobile → tablet → desktop)
- [ ] Dodaj focus states i hover effects
- [ ] Przetestuj z czytnikiem ekranu
- [ ] Użyj odpowiednich kolorów kategorii dla posiłków
- [ ] Sprawdź glassmorphism na różnych tłach

### Pliki Konfiguracyjne

- `app/globals.css` - Zmienne CSS i globalne style
- `src/components/ui/` - Komponenty bazowe (22 pliki)
- `src/lib/utils.ts` - Funkcja `cn()` do łączenia klas
