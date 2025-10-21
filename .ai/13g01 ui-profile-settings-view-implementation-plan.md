# Plan implementacji widoku Profil i Ustawienia

## 1. Przegląd

Widok Profil i Ustawienia to **strona zarządzania kontem użytkownika** umożliwiająca edycję danych profilowych, reset planu posiłków oraz wysyłanie feedbacku do twórców aplikacji. Jest to kluczowy widok pozwalający użytkownikowi na **aktualizację swoich parametrów** w miarę postępu w diecie oraz **zarządzanie swoim doświadczeniem** z aplikacją.

Kluczowe funkcjonalności:

- Edycja danych profilowych (waga, poziom aktywności) z automatycznym przeliczeniem celów żywieniowych
- Reset całego profilu i planu (powrót do onboardingu)
- Wysyłanie feedbacku i zgłaszanie problemów
- Wyświetlanie aktualnych celów żywieniowych (tylko odczyt)
- Toast notification po zapisaniu zmian

Kluczowe cechy UX:

- **Sekcyjny layout** - wyraźne rozdzielenie obszarów funkcjonalnych
- **Inline validation** - walidacja w czasie rzeczywistym przy edycji pól
- **Confirmation dialogs** - potwierdzenie destruktywnych akcji (reset profilu)
- **Toast feedback** - natychmiastowa informacja o zapisaniu zmian
- **Accessibility-first** - pełna obsługa klawiatury i screen readerów

## 2. Routing widoku

**Ścieżka:** `/profile` lub `/settings`

**Lokalizacja pliku:** `app/(authenticated)/profile/page.tsx`

**Middleware:** Automatyczne sprawdzenie autentykacji i przekierowanie na `/login` jeśli użytkownik niezalogowany, lub na `/onboarding` jeśli profil nie jest ukończony.

**Parametry URL:** Brak

## 3. Struktura komponentów

```
ProfilePage (Server Component)
└── ProfileClient (Client Component - wrapper)
    ├── PageHeader (Presentation Component)
    ├── CurrentTargetsCard (Presentation Component)
    │   └── MacroCard x4 (kalorie, białko, węgle, tłuszcze)
    ├── ProfileEditForm (Client Component)
    │   ├── FormField "Waga" (Input)
    │   ├── FormField "Poziom aktywności" (Select)
    │   ├── FormField "Cel" (Select)
    │   ├── FormField "Tempo utraty wagi" (Select - warunkowe)
    │   └── Button "Zapisz zmiany"
    ├── DangerZoneCard (Client Component)
    │   ├── AlertDialog (reset confirmation)
    │   └── Button "Zacznij od nowa"
    └── FeedbackCard (Client Component)
        ├── Textarea
        └── Button "Wyślij opinię"
```

**Separacja odpowiedzialności:**

- **ProfilePage (Server Component):** Initial data fetching (profil użytkownika)
- **ProfileClient (Client Component):** Zarządzanie stanem edycji, walidacja, komunikacja z API
- **CurrentTargetsCard:** Prezentacja aktualnych celów żywieniowych (read-only)
- **ProfileEditForm:** Formularz edycji z walidacją i submitowaniem
- **DangerZoneCard:** Destruktywne akcje z confirmation dialog
- **FeedbackCard:** Formularz opinii

## 4. Szczegóły komponentów

### ProfilePage (Server Component)

**Ścieżka:** `app/(authenticated)/profile/page.tsx`

**Opis:** Główna strona widoku Profilu. Server Component odpowiedzialny za pobranie danych profilu użytkownika i przekazanie ich do Client Component.

**Główne elementy:**

- Wywołanie Server Action `getMyProfile()` (GET /profile/me)
- Renderowanie `<ProfileClient>` z initial data
- SEO metadata (title, description)
- Error boundary dla obsługi błędów

**Obsługiwane interakcje:** Brak (Server Component)

**Warunki walidacji:**

- Walidacja odpowiedzi z `getMyProfile()` (error handling)
- Obsługa braku profilu (redirect na onboarding)

**Typy:**

- `ProfileDTO` - dane profilu użytkownika
- `ActionResult<ProfileDTO>` - z error handling

**Props:** Brak (root page component)

**Implementacja:**

```typescript
// app/(authenticated)/profile/page.tsx
import { createServerClient } from '@/lib/supabase/server'
import { getMyProfile } from '@/lib/actions/profile'
import { ProfileClient } from '@/components/profile/ProfileClient'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Profil i Ustawienia - LowCarbPlaner',
  description: 'Zarządzaj swoim profilem i ustawieniami aplikacji'
}

export default async function ProfilePage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Pobierz profil użytkownika
  const profileResult = await getMyProfile()

  if (profileResult.error) {
    // Jeśli profil nie istnieje, przekieruj na onboarding
    if (profileResult.code === 'PROFILE_NOT_FOUND') {
      redirect('/onboarding')
    }
    // Inne błędy obsługi przez error boundary
    throw new Error(profileResult.error)
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <ProfileClient initialProfile={profileResult.data} />
    </main>
  )
}
```

---

### ProfileClient (Client Component)

**Ścieżka:** `components/profile/ProfileClient.tsx`

**Opis:** Główny wrapper po stronie klienta. Zarządza stanem edycji profilu, walidacją formularzy i komunikacją z API. Koordynuje wszystkie pod-komponenty i ich interakcje.

**Główne elementy:**

- `<PageHeader>` - nagłówek strony
- `<div className="space-y-6">` - grid layout dla sekcji
  - `<CurrentTargetsCard>` - aktualne cele żywieniowe
  - `<ProfileEditForm>` - formularz edycji
  - `<DangerZoneCard>` - reset profilu
  - `<FeedbackCard>` - formularz opinii

**Obsługiwane interakcje:**

- Edycja pól w formularzu → update lokalnego stanu
- Submit formularza → wywołanie `updateMyProfile()` → toast notification
- Reset profilu → wywołanie AlertDialog → usunięcie danych → redirect na onboarding
- Wysłanie feedbacku → wywołanie `createFeedback()` → toast notification

**Warunki walidacji:**

- Walidacja formularza edycji (Zod schema z `updateProfileSchema`)
- Walidacja minimum kalorycznego przy wyborze tempa utraty wagi
- Walidacja długości feedbacku (min 10 znaków)

**Typy:**

- `ProfileDTO` - dane profilu
- `UpdateProfileInput` - dane do aktualizacji
- `ProfileEditFormData` - ViewModel formularza

**Props:**

```typescript
interface ProfileClientProps {
  initialProfile: ProfileDTO
}
```

**Implementacja hooka zarządzania stanem:**

```typescript
// hooks/useProfileForm.ts
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from '@/lib/validation/profile'
import { updateMyProfile } from '@/lib/actions/profile'
import { toast } from '@/hooks/use-toast'
import type { ProfileDTO } from '@/types/dto.types'

export function useProfileForm(initialProfile: ProfileDTO) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      weight_kg: initialProfile.weight_kg,
      activity_level: initialProfile.activity_level,
      goal: initialProfile.goal,
      weight_loss_rate_kg_week: initialProfile.weight_loss_rate_kg_week,
    },
  })

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsSubmitting(true)
    try {
      const result = await updateMyProfile(data)

      if (result.error) {
        toast({
          title: 'Błąd',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Sukces',
        description:
          'Profil został zaktualizowany. Twoje cele żywieniowe zostały przeliczone.',
      })

      // Opcjonalnie: refresh strony lub invalidate query
      window.location.reload()
    } catch (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować profilu',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    isSubmitting,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
```

---

### PageHeader (Presentation Component)

**Ścieżka:** `components/profile/PageHeader.tsx`

**Opis:** Nagłówek strony profilu z tytułem i opisem.

**Główne elementy:**

- `<div>` wrapper
- `<h1>` tytuł: "Profil i Ustawienia"
- `<p>` opis: "Zarządzaj swoimi danymi i celami żywieniowymi"

**Obsługiwane interakcje:** Brak

**Warunki walidacji:** Brak

**Typy:** Brak specjalnych typów

**Props:** Brak (statyczny content)

**Implementacja:**

```typescript
// components/profile/PageHeader.tsx
export const PageHeader = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">Profil i Ustawienia</h1>
      <p className="text-muted-foreground">
        Zarządzaj swoimi danymi i celami żywieniowymi
      </p>
    </div>
  )
}
```

---

### CurrentTargetsCard (Presentation Component)

**Ścieżka:** `components/profile/CurrentTargetsCard.tsx`

**Opis:** Karta wyświetlająca aktualne cele żywieniowe użytkownika (read-only). Wizualizacja dziennych wartości docelowych w formie grid z 4 kartami.

**Główne elementy:**

- `<Card>` z shadcn/ui
- `<CardHeader>`:
  - `<CardTitle>` "Twoje dzienne cele"
  - `<CardDescription>` "Wartości obliczone na podstawie Twoich parametrów"
- `<CardContent>`:
  - Grid 2x2 (desktop) lub 1x4 (mobile)
  - 4x `<MacroCard>`:
    - Kalorie (kcal)
    - Białko (g)
    - Węglowodany (g)
    - Tłuszcze (g)

**Obsługiwane interakcje:** Brak (tylko prezentacja)

**Warunki walidacji:** Brak

**Typy:**

- `ProfileDTO` - zawiera target_calories, target_protein_g, target_carbs_g, target_fats_g

**Props:**

```typescript
interface CurrentTargetsCardProps {
  targets: {
    target_calories: number
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  }
}
```

**Implementacja:**

```typescript
// components/profile/CurrentTargetsCard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MacroCard } from './MacroCard'

export const CurrentTargetsCard = ({ targets }: CurrentTargetsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Twoje dzienne cele</CardTitle>
        <CardDescription>
          Wartości obliczone na podstawie Twoich parametrów
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MacroCard
            label="Kalorie"
            value={targets.target_calories}
            unit="kcal"
            icon="flame"
            color="orange"
          />
          <MacroCard
            label="Białko"
            value={targets.target_protein_g}
            unit="g"
            icon="beef"
            color="red"
          />
          <MacroCard
            label="Węglowodany"
            value={targets.target_carbs_g}
            unit="g"
            icon="wheat"
            color="yellow"
          />
          <MacroCard
            label="Tłuszcze"
            value={targets.target_fats_g}
            unit="g"
            icon="droplet"
            color="blue"
          />
        </div>
      </CardContent>
    </Card>
  )
}
```

---

### MacroCard (Presentation Component)

**Ścieżka:** `components/profile/MacroCard.tsx`

**Opis:** Pojedyncza karta makroskładnika z ikoną, wartością i jednostką.

**Główne elementy:**

- `<div>` wrapper z border i padding
- Ikona (z lucide-react)
- `<div>` wartość liczbowa (duża czcionka)
- `<div>` jednostka + label (małe, muted)

**Obsługiwane interakcje:** Brak

**Warunki walidacji:**

- Formatowanie liczb (zaokrąglenie do całości)

**Typy:**

- `number` - wartość
- `string` - jednostka i label
- `IconName` - nazwa ikony

**Props:**

```typescript
interface MacroCardProps {
  label: string
  value: number
  unit: string
  icon: 'flame' | 'beef' | 'wheat' | 'droplet'
  color: 'orange' | 'red' | 'yellow' | 'blue'
}
```

**Implementacja:**

```typescript
// components/profile/MacroCard.tsx
import { Flame, Beef, Wheat, Droplet } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS = {
  flame: Flame,
  beef: Beef,
  wheat: Wheat,
  droplet: Droplet,
}

const COLOR_CLASSES = {
  orange: 'text-orange-500 bg-orange-50',
  red: 'text-red-500 bg-red-50',
  yellow: 'text-yellow-500 bg-yellow-50',
  blue: 'text-blue-500 bg-blue-50',
}

export const MacroCard = ({ label, value, unit, icon, color }: MacroCardProps) => {
  const Icon = ICONS[icon]

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <div className={cn('p-3 rounded-full', COLOR_CLASSES[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-2xl font-bold">{Math.round(value)}</div>
        <div className="text-sm text-muted-foreground">
          {unit} {label}
        </div>
      </div>
    </div>
  )
}
```

---

### ProfileEditForm (Client Component)

**Ścieżka:** `components/profile/ProfileEditForm.tsx`

**Opis:** Formularz edycji danych profilowych z walidacją i submitowaniem. Zawiera pola: waga, poziom aktywności, cel i tempo utraty wagi (warunkowe).

**Główne elementy:**

- `<Card>` z shadcn/ui
- `<CardHeader>`:
  - `<CardTitle>` "Edycja profilu"
- `<CardContent>`:
  - `<form>` z react-hook-form
  - `<FormField>` Waga (Input type="number", step="0.1", unit="kg")
  - `<FormField>` Poziom aktywności (Select z 5 opcjami)
  - `<FormField>` Cel (Select: weight_loss / weight_maintenance)
  - `<FormField>` Tempo utraty wagi (Select, warunkowe gdy goal='weight_loss')
  - `<Button type="submit">` "Zapisz zmiany" (loading state)

**Obsługiwane interakcje:**

- onChange pól → aktualizacja form state (react-hook-form)
- onSubmit → walidacja → wywołanie `updateMyProfile()` → toast
- Zmiana celu na 'weight_maintenance' → ukrycie pola "Tempo utraty wagi"

**Warunki walidacji:**

- Waga: min 40 kg, max 300 kg, required
- Poziom aktywności: required (enum)
- Cel: required (enum)
- Tempo utraty wagi: required gdy goal='weight_loss', zakres 0.25-1.0 kg/tydzień
- **Walidacja minimum kalorycznego:** opcje tempa disabled jeśli kalorie < (gender === 'female' ? 1400 : 1600)

**Typy:**

- `UpdateProfileInput` (z validation/profile.ts)
- `ProfileEditFormData` (ViewModel)

**Props:**

```typescript
interface ProfileEditFormProps {
  initialData: ProfileDTO
  onSubmit: (data: UpdateProfileInput) => Promise<void>
  isSubmitting: boolean
}
```

**Implementacja:**

```typescript
// components/profile/ProfileEditForm.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useProfileForm } from '@/hooks/useProfileForm'
import type { ProfileDTO } from '@/types/dto.types'

const ACTIVITY_LEVEL_LABELS = {
  very_low: 'Bardzo niska (brak ćwiczeń)',
  low: 'Niska (1-2 razy w tygodniu)',
  moderate: 'Umiarkowana (3-5 razy w tygodniu)',
  high: 'Wysoka (6-7 razy w tygodniu)',
  very_high: 'Bardzo wysoka (sport zawodowy)',
}

const GOAL_LABELS = {
  weight_loss: 'Utrata wagi',
  weight_maintenance: 'Utrzymanie wagi',
}

const WEIGHT_LOSS_RATE_OPTIONS = [
  { value: 0.25, label: '0.25 kg/tydzień (powoli)' },
  { value: 0.5, label: '0.5 kg/tydzień (zalecane)' },
  { value: 0.75, label: '0.75 kg/tydzień (szybko)' },
  { value: 1.0, label: '1.0 kg/tydzień (bardzo szybko)' },
]

export const ProfileEditForm = ({ initialData }: { initialData: ProfileDTO }) => {
  const { form, isSubmitting, onSubmit } = useProfileForm(initialData)
  const goalValue = form.watch('goal')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edycja profilu</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Waga */}
            <FormField
              control={form.control}
              name="weight_kg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waga (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="40"
                      max="300"
                      placeholder="Wpisz swoją wagę"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Poziom aktywności */}
            <FormField
              control={form.control}
              name="activity_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poziom aktywności</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz poziom aktywności" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ACTIVITY_LEVEL_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cel */}
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cel</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz swój cel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(GOAL_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tempo utraty wagi (warunkowe) */}
            {goalValue === 'weight_loss' && (
              <FormField
                control={form.control}
                name="weight_loss_rate_kg_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo utraty wagi</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseFloat(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz tempo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WEIGHT_LOSS_RATE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
```

---

### DangerZoneCard (Client Component)

**Ścieżka:** `components/profile/DangerZoneCard.tsx`

**Opis:** Sekcja "niebezpiecznej strefy" z opcją resetu profilu. Wymaga potwierdzenia w AlertDialog przed wykonaniem destruktywnej akcji.

**Główne elementy:**

- `<Card>` z border-destructive
- `<CardHeader>`:
  - `<CardTitle>` "Strefa niebezpieczna"
  - `<CardDescription>` "Akcje nieodwracalne"
- `<CardContent>`:
  - Opis: "Zresetuj swój profil i plan posiłków. Zostaniesz przekierowany na ekran onboardingu."
  - `<AlertDialog>` (confirmation)
    - Trigger: `<Button variant="destructive">` "Zacznij od nowa"
    - Content: Pytanie o potwierdzenie
    - Actions: "Anuluj" / "Tak, resetuj"

**Obsługiwane interakcje:**

- Click "Zacznij od nowa" → otworzenie AlertDialog
- Potwierdzenie → wywołanie API usuwania profilu → redirect na /onboarding

**Warunki walidacji:**

- Wymagane potwierdzenie przed wykonaniem

**Typy:** Brak specjalnych typów (primitive state)

**Props:**

```typescript
interface DangerZoneCardProps {
  onReset: () => Promise<void>
}
```

**Implementacja:**

```typescript
// components/profile/DangerZoneCard.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { createBrowserClient } from '@/lib/supabase/client'

export const DangerZoneCard = () => {
  const [isResetting, setIsResetting] = useState(false)
  const router = useRouter()

  const handleReset = async () => {
    setIsResetting(true)
    try {
      const supabase = createBrowserClient()

      // Usunięcie profilu (CASCADE usunie również planned_meals)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', (await supabase.auth.getUser()).data.user!.id)

      if (error) throw error

      toast({
        title: 'Profil zresetowany',
        description: 'Twój profil został usunięty. Możesz teraz skonfigurować go ponownie.',
      })

      // Przekierowanie na onboarding
      router.push('/onboarding')
    } catch (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się zresetować profilu',
        variant: 'destructive',
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Strefa niebezpieczna</CardTitle>
        <CardDescription>
          Akcje nieodwracalne - używaj z rozwagą
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Zresetuj swój profil i plan posiłków. Wszystkie dane zostaną usunięte
          i zostaniesz przekierowany na ekran onboardingu.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isResetting}>
              Zacznij od nowa
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Czy na pewno chcesz kontynuować?</AlertDialogTitle>
              <AlertDialogDescription>
                Ta akcja jest nieodwracalna. Wszystkie Twoje dane profilowe i plan posiłków
                zostaną usunięte. Będziesz musiał przejść ponownie przez proces onboardingu.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anuluj</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset} className="bg-destructive">
                Tak, resetuj profil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
```

---

### FeedbackCard (Client Component)

**Ścieżka:** `components/profile/FeedbackCard.tsx`

**Opis:** Formularz wysyłania opinii i zgłaszania problemów do twórców aplikacji.

**Główne elementy:**

- `<Card>` z shadcn/ui
- `<CardHeader>`:
  - `<CardTitle>` "Zgłoś problem lub prześlij opinię"
  - `<CardDescription>` "Pomóż nam ulepszyć aplikację"
- `<CardContent>`:
  - `<Textarea>` - pole na treść feedbacku
    - placeholder: "Opisz swój problem lub sugestię..."
    - rows: 5
    - maxLength: 1000
  - Licznik znaków: "X / 1000"
  - `<Button>` "Wyślij opinię" (loading state)

**Obsługiwane interakcje:**

- onChange textarea → aktualizacja licznika znaków
- onSubmit → walidacja (min 10 znaków) → wywołanie `createFeedback()` → toast → reset textarea

**Warunki walidacji:**

- Content: min 10 znaków, max 1000 znaków, required
- Trim whitespace przed walidacją

**Typy:**

- `CreateFeedbackCommand` (z dto.types.ts)
- `FeedbackFormData` (ViewModel)

**Props:** Brak (standalone component)

**Implementacja:**

```typescript
// components/profile/FeedbackCard.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { createFeedback } from '@/lib/actions/feedback'

const MIN_LENGTH = 10
const MAX_LENGTH = 1000

export const FeedbackCard = () => {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedContent = content.trim()

    // Walidacja
    if (trimmedContent.length < MIN_LENGTH) {
      toast({
        title: 'Zbyt krótka treść',
        description: `Wpisz co najmniej ${MIN_LENGTH} znaków`,
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createFeedback({ content: trimmedContent })

      if (result.error) {
        toast({
          title: 'Błąd',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Dziękujemy za opinię!',
        description: 'Twoja wiadomość została wysłana do zespołu.',
      })

      // Reset formularza
      setContent('')
    } catch (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się wysłać opinii',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const charCount = content.length
  const isValid = content.trim().length >= MIN_LENGTH

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zgłoś problem lub prześlij opinię</CardTitle>
        <CardDescription>
          Pomóż nam ulepszyć aplikację - napisz o swoich doświadczeniach
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Opisz swój problem lub sugestię..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              maxLength={MAX_LENGTH}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Minimum {MIN_LENGTH} znaków</span>
              <span className={charCount > MAX_LENGTH * 0.9 ? 'text-destructive' : ''}>
                {charCount} / {MAX_LENGTH}
              </span>
            </div>
          </div>
          <Button type="submit" disabled={!isValid || isSubmitting} className="w-full">
            {isSubmitting ? 'Wysyłanie...' : 'Wyślij opinię'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

---

## 5. Typy

### Istniejące typy z dto.types.ts:

```typescript
// src/types/dto.types.ts (już zdefiniowane)

/**
 * DTO: Kompletny profil użytkownika (GET /api/profile/me, PATCH /api/profile/me)
 */
export type ProfileDTO = Omit<
  Tables<'profiles'>,
  'id' | 'created_at' | 'updated_at'
>

/**
 * Command Model: Aktualizacja profilu użytkownika (PATCH /api/profile/me)
 */
export type UpdateProfileCommand = Pick<
  TablesUpdate<'profiles'>,
  | 'gender'
  | 'age'
  | 'weight_kg'
  | 'height_cm'
  | 'activity_level'
  | 'goal'
  | 'weight_loss_rate_kg_week'
>

/**
 * Command Model: Tworzenie feedbacku (POST /api/feedback)
 */
export type CreateFeedbackCommand = {
  content: string
  metadata?: Record<string, unknown>
}

/**
 * DTO: Odpowiedź dla POST /api/feedback
 */
export type FeedbackResponseDTO = {
  id: number
  user_id: string
  content: string
  metadata: Record<string, unknown> | null
  created_at: string
}
```

### Istniejące typy z validation/profile.ts:

```typescript
// src/lib/validation/profile.ts (już zdefiniowane)

/**
 * Schema dla PATCH /api/profile/me - aktualizacja profilu użytkownika
 * Wszystkie pola są opcjonalne (partial update)
 */
export const updateProfileSchema = createProfileSchema
  .partial()
  .omit({
    disclaimer_accepted_at: true,
  })
  .refine(
    (data) => {
      // Walidacja: weight_loss_rate_kg_week wymagane gdy goal='weight_loss'
      if (
        data.goal === 'weight_loss' &&
        data.weight_loss_rate_kg_week === undefined
      ) {
        return false
      }
      return true
    },
    {
      message:
        'Tempo utraty wagi jest wymagane, gdy cel zostaje zmieniony na utratę wagi',
      path: ['weight_loss_rate_kg_week'],
    }
  )

/**
 * Typ wejściowy dla updateProfileSchema
 */
export type UpdateProfileInput = z.input<typeof updateProfileSchema>
```

### Nowe typy ViewModels (do utworzenia):

```typescript
// src/types/profile-view.types.ts

/**
 * ViewModel dla formularza edycji profilu
 */
export interface ProfileEditFormData {
  weight_kg: number
  activity_level: Enums<'activity_level_enum'>
  goal: Enums<'goal_enum'>
  weight_loss_rate_kg_week?: number | null
}

/**
 * ViewModel dla feedbacku
 */
export interface FeedbackFormData {
  content: string
}

/**
 * Mapowanie poziomów aktywności na polskie etykiety
 */
export const ACTIVITY_LEVEL_LABELS: Record<
  Enums<'activity_level_enum'>,
  string
> = {
  very_low: 'Bardzo niska (brak ćwiczeń)',
  low: 'Niska (1-2 razy w tygodniu)',
  moderate: 'Umiarkowana (3-5 razy w tygodniu)',
  high: 'Wysoka (6-7 razy w tygodniu)',
  very_high: 'Bardzo wysoka (sport zawodowy)',
}

/**
 * Mapowanie celów na polskie etykiety
 */
export const GOAL_LABELS: Record<Enums<'goal_enum'>, string> = {
  weight_loss: 'Utrata wagi',
  weight_maintenance: 'Utrzymanie wagi',
}

/**
 * Opcje tempa utraty wagi
 */
export interface WeightLossRateOption {
  value: number
  label: string
  description: string
}

export const WEIGHT_LOSS_RATE_OPTIONS: WeightLossRateOption[] = [
  {
    value: 0.25,
    label: '0.25 kg/tydzień',
    description: 'Powolne i bezpieczne tempo',
  },
  {
    value: 0.5,
    label: '0.5 kg/tydzień',
    description: 'Zalecane tempo (deficyt ~500 kcal/dzień)',
  },
  {
    value: 0.75,
    label: '0.75 kg/tydzień',
    description: 'Szybkie tempo (deficyt ~750 kcal/dzień)',
  },
  {
    value: 1.0,
    label: '1.0 kg/tydzień',
    description: 'Bardzo szybkie tempo (deficyt ~1000 kcal/dzień)',
  },
]
```

---

## 6. Zarządzanie stanem

### Stan serwera (TanStack Query - opcjonalnie):

**useProfileQuery (opcjonalny - dla re-fetching po update):**

```typescript
// hooks/useProfileQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyProfile, updateMyProfile } from '@/lib/actions/profile'
import { toast } from '@/hooks/use-toast'
import type { UpdateProfileInput } from '@/lib/validation/profile'

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const result = await getMyProfile()
      if (result.error) throw new Error(result.error)
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5 minut
    refetchOnWindowFocus: false,
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const result = await updateMyProfile(data)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['planned-meals'] })

      toast({
        title: 'Sukces',
        description:
          'Profil został zaktualizowany. Twoje cele żywieniowe zostały przeliczone.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Błąd',
        description: error.message || 'Nie udało się zaktualizować profilu',
        variant: 'destructive',
      })
    },
  })
}
```

**Uwaga:** TanStack Query nie jest konieczny dla MVP (SSR + reload wystarczy), ale może poprawić UX przez automatyczne invalidation queries po update.

### Stan klienta (React useState + React Hook Form):

**W ProfileEditForm:**

```typescript
// Wykorzystanie react-hook-form z Zod resolver
const form = useForm<UpdateProfileInput>({
  resolver: zodResolver(updateProfileSchema),
  defaultValues: {
    weight_kg: initialProfile.weight_kg,
    activity_level: initialProfile.activity_level,
    goal: initialProfile.goal,
    weight_loss_rate_kg_week: initialProfile.weight_loss_rate_kg_week,
  },
})

// Watch dla conditional rendering (tempo utraty wagi)
const goalValue = form.watch('goal')
```

**W FeedbackCard:**

```typescript
// Prosty stan dla textarea
const [content, setContent] = useState('')
const [isSubmitting, setIsSubmitting] = useState(false)
```

**W DangerZoneCard:**

```typescript
// Stan dla loading podczas resetu
const [isResetting, setIsResetting] = useState(false)
```

---

## 7. Integracja API

### Endpoint: GET /profile/me

**Server Action:** `getMyProfile()`

**Typ żądania:** Brak (automatycznie używa zalogowanego usera)

**Typ odpowiedzi:**

```typescript
ActionResult<ProfileDTO>
```

**Użycie:**

- W ProfilePage (Server Component) - initial load
- Opcjonalnie: w useProfileQuery (Client) - re-fetching

**Specyfikacja odpowiedzi (z API plan):**

```json
{
  "email": "user@example.com",
  "gender": "female",
  "age": 30,
  "weight_kg": 70,
  "height_cm": 165,
  "activity_level": "moderate",
  "goal": "weight_loss",
  "weight_loss_rate_kg_week": 0.5,
  "disclaimer_accepted_at": "2023-10-27T10:00:00Z",
  "target_calories": 1800,
  "target_carbs_g": 68,
  "target_protein_g": 158,
  "target_fats_g": 100
}
```

---

### Endpoint: PATCH /profile/me

**Server Action:** `updateMyProfile(input: UpdateProfileInput)`

**Typ żądania:**

```typescript
{
  weight_kg?: number
  activity_level?: ActivityLevelEnum
  goal?: GoalEnum
  weight_loss_rate_kg_week?: number | null
}
```

**Typ odpowiedzi:**

```typescript
ActionResult<ProfileDTO>
```

**Użycie:**

- W ProfileEditForm onSubmit

**Flow:**

1. Użytkownik edytuje pola w formularzu
2. Walidacja przez Zod (react-hook-form)
3. onSubmit → `updateMyProfile(data)`
4. Server Action:
   - Pobiera aktualny profil
   - Merge danych (aktualne + nowe)
   - Przelicza cele żywieniowe (BMR, TDEE, makro)
   - Waliduje minimum kaloryczne
   - Zapisuje do bazy
5. Sukces:
   - Toast: "Profil został zaktualizowany. Twoje cele żywieniowe zostały przeliczone."
   - Reload strony lub invalidate query
6. Błąd:
   - Toast z komunikatem błędu
   - Formularz pozostaje otwarty

**Walidacja parametrów (backend - z profile.ts):**

- Partial update - wszystkie pola opcjonalne
- Jeśli goal zmienione na 'weight_loss' → weight_loss_rate_kg_week wymagane
- Przeliczenie celów: CALORIES_BELOW_MINIMUM → error

**Kody błędów:**

- 400 Bad Request: Walidacja nie powiodła się
- 400 Bad Request: Kalorie poniżej minimum (1400K/1600M)
- 401 Unauthorized: Użytkownik niezalogowany
- 404 Not Found: Profil nie istnieje

---

### Endpoint: POST /feedback

**Server Action:** `createFeedback(input: CreateFeedbackCommand)`

**Typ żądania:**

```typescript
{
  content: string
  metadata?: Record<string, unknown>
}
```

**Typ odpowiedzi:**

```typescript
ActionResult<FeedbackResponseDTO>
```

**Użycie:**

- W FeedbackCard onSubmit

**Flow:**

1. Użytkownik wpisuje treść feedbacku
2. Click "Wyślij opinię"
3. Walidacja (min 10 znaków, max 1000 znaków)
4. `createFeedback({ content: trimmedContent })`
5. Server Action zapisuje do tabeli `feedback` z user_id
6. Sukces:
   - Toast: "Dziękujemy za opinię! Twoja wiadomość została wysłana do zespołu."
   - Reset formularza
7. Błąd:
   - Toast z komunikatem błędu
   - Formularz pozostaje otwarty

**Specyfikacja odpowiedzi (z API plan):**

```json
{
  "id": 123,
  "user_id": "uuid-of-user",
  "content": "Świetna aplikacja, ale...",
  "metadata": null,
  "created_at": "2023-10-27T10:00:00Z"
}
```

---

## 8. Interakcje użytkownika

### 1. Wejście na stronę profilu

**Trigger:** Nawigacja na `/profile`

**Flow:**

1. ProfilePage (SSR) pobiera profil użytkownika
2. Jeśli profil nie istnieje → redirect na `/onboarding`
3. Renderuje ProfileClient z initial data
4. Użytkownik widzi:
   - Aktualne cele żywieniowe (CurrentTargetsCard)
   - Formularz edycji profilu (pola pre-filled)
   - Sekcję "Strefa niebezpieczna"
   - Formularz feedbacku

---

### 2. Edycja wagi

**Trigger:** Zmiana wartości w polu "Waga"

**Flow:**

1. Użytkownik klika w pole "Waga"
2. Wpisuje nową wartość (np. 69.5)
3. onBlur → walidacja (min 40, max 300)
4. Jeśli błąd → pokazanie komunikatu pod polem
5. Użytkownik klika "Zapisz zmiany"
6. Walidacja całego formularza (Zod)
7. Sukces walidacji → wywołanie `updateMyProfile({ weight_kg: 69.5 })`
8. Loading state (button disabled, spinner)
9. API response:
   - Sukces: Toast + reload/invalidate → nowe cele widoczne w CurrentTargetsCard
   - Błąd: Toast z komunikatem

---

### 3. Zmiana celu na "Utrzymanie wagi"

**Trigger:** Zmiana wartości w polu "Cel" z "Utrata wagi" na "Utrzymanie wagi"

**Flow:**

1. Użytkownik klika Select "Cel"
2. Wybiera "Utrzymanie wagi"
3. Form watch wykrywa zmianę → `goalValue === 'weight_maintenance'`
4. Pole "Tempo utraty wagi" znika (conditional rendering)
5. `weight_loss_rate_kg_week` ustawiane na `null` (automatycznie przez schema)
6. Użytkownik klika "Zapisz zmiany"
7. Walidacja (brak wymagania weight_loss_rate_kg_week dla weight_maintenance)
8. API call → przeliczenie celów bez deficytu kalorycznego
9. Toast + aktualizacja CurrentTargetsCard

---

### 4. Wysłanie feedbacku

**Trigger:** Wpisanie tekstu w Textarea i kliknięcie "Wyślij opinię"

**Flow:**

1. Użytkownik wpisuje treść w Textarea
2. onChange → aktualizacja licznika znaków
3. Gdy content.length >= 10 → Button enabled
4. Click "Wyślij opinię"
5. e.preventDefault() → walidacja (trim, min 10 znaków)
6. Jeśli walidacja nie przejdzie → Toast z komunikatem
7. Sukces walidacji → `createFeedback({ content: trimmedContent })`
8. Loading state (button disabled, "Wysyłanie...")
9. API response:
   - Sukces:
     - Toast: "Dziękujemy za opinię!"
     - Reset textarea (setContent(''))
   - Błąd: Toast z komunikatem, textarea pozostaje

---

### 5. Reset profilu (Zacznij od nowa)

**Trigger:** Kliknięcie "Zacznij od nowa" i potwierdzenie w AlertDialog

**Flow:**

1. Użytkownik klika "Zacznij od nowa" w DangerZoneCard
2. AlertDialog otwiera się:
   - Tytuł: "Czy na pewno chcesz kontynuować?"
   - Opis: "Ta akcja jest nieodwracalna..."
   - Przyciski: "Anuluj" / "Tak, resetuj profil"
3. Użytkownik klika "Tak, resetuj profil"
4. handleReset() → setIsResetting(true)
5. Wywołanie Supabase delete:
   ```typescript
   await supabase.from('profiles').delete().eq('id', userId)
   ```
6. Sukces:
   - Toast: "Profil zresetowany"
   - Router.push('/onboarding')
   - Użytkownik widzi pierwszy ekran onboardingu
7. Błąd:
   - Toast: "Nie udało się zresetować profilu"
   - Dialog pozostaje otwarty

---

### 6. Próba zmiany tempa utraty wagi na wartość poniżej minimum kalorycznego

**Trigger:** Wybór tempa 1.0 kg/tydzień przy niskiej wadze/wzroście

**Flow:**

1. Użytkownik ma goal='weight_loss'
2. Pole "Tempo utraty wagi" widoczne
3. Użytkownik wybiera "1.0 kg/tydzień"
4. onSubmit → walidacja
5. Backend (updateMyProfile):
   - Oblicza TDEE
   - Oblicza deficyt (1.0 × 7700 / 7 = 1100 kcal/dzień)
   - Kalorie = TDEE - 1100
   - Sprawdza: kalorie >= (gender === 'female' ? 1400 : 1600)
   - Jeśli NIE: return error "Kalorie poniżej minimum (1400K/1600M)"
6. Frontend:
   - Toast: "Wybrane tempo utraty wagi prowadzi do zbyt niskiej kaloryczności. Wybierz wolniejsze tempo."
   - Formularz pozostaje otwarty
   - Użytkownik może wybrać mniejsze tempo (np. 0.5 kg/tydzień)

**Opcjonalne ulepszenie (future):** Frontend może obliczać kalorie client-side i disabled opcje przed submitowaniem (jak w onboarding WeightLossRateStep).

---

## 9. Warunki i walidacja

### Frontend validation:

#### ProfileEditForm:

- **Waga:**
  - Wymagane: `weight_kg !== null && weight_kg !== undefined`
  - Min: 40 kg
  - Max: 300 kg
  - Typ: number (float)
  - Implementacja: Zod schema + react-hook-form
  - Wpływ na UI: Komunikat błędu pod polem, button disabled

- **Poziom aktywności:**
  - Wymagane: `activity_level !== null`
  - Enum: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
  - Implementacja: Zod schema + Select validation
  - Wpływ na UI: Komunikat błędu, button disabled

- **Cel:**
  - Wymagane: `goal !== null`
  - Enum: 'weight_loss' | 'weight_maintenance'
  - Implementacja: Zod schema + Select validation
  - Wpływ na UI: Conditional rendering pola "Tempo utraty wagi"

- **Tempo utraty wagi:**
  - Wymagane: tylko gdy `goal === 'weight_loss'`
  - Zakres: 0.25 - 1.0 kg/tydzień
  - Implementacja: Zod refine + conditional validation
  - Wpływ na UI: Komunikat błędu gdy goal='weight_loss' i pole puste

#### FeedbackCard:

- **Content:**
  - Wymagane: `content.trim().length > 0`
  - Min: 10 znaków
  - Max: 1000 znaków
  - Implementacja: JavaScript validation (trim before check)
  - Wpływ na UI:
    - Button disabled gdy < 10 znaków
    - Licznik znaków zmienia kolor gdy > 900 znaków
    - Toast z komunikatem przy próbie submitu < 10 znaków

### Backend validation (z profile.ts i feedback.ts):

#### updateMyProfile:

- **Parametry:**
  - Wszystkie pola opcjonalne (partial update)
  - `weight_kg`: 40-300 kg (już walidowane na froncie)
  - `activity_level`: enum validation
  - `goal`: enum validation
  - `weight_loss_rate_kg_week`: 0.25-1.0 kg/tydzień, wymagane gdy goal='weight_loss'

- **Logika biznesowa:**
  - Merge danych: aktualne + nowe
  - Przeliczenie celów żywieniowych (BMR, TDEE, makro)
  - **Walidacja minimum kalorycznego:**
    ```typescript
    if (target_calories < (gender === 'female' ? 1400 : 1600)) {
      return {
        error:
          'Wybrane tempo utraty wagi prowadzi do zbyt niskiej kaloryczności. Wybierz wolniejsze tempo.',
        code: 'CALORIES_BELOW_MINIMUM',
        details: { gender, calculated_calories: target_calories },
      }
    }
    ```

- **Kody błędów:**
  - 400 VALIDATION_ERROR: Nieprawidłowe dane wejściowe
  - 400 CALORIES_BELOW_MINIMUM: Kalorie poniżej minimum
  - 401 UNAUTHORIZED: Użytkownik niezalogowany
  - 404 PROFILE_NOT_FOUND: Profil nie istnieje

#### createFeedback:

- **Parametry:**
  - `content`: string, wymagane, min 1 znak (już walidowane na froncie)
  - `metadata`: opcjonalne (nie używane w MVP)

- **Kody błędów:**
  - 400 VALIDATION_ERROR: Pusta treść
  - 401 UNAUTHORIZED: Użytkownik niezalogowany

---

## 10. Obsługa błędów

### 1. Brak profilu (PROFILE_NOT_FOUND)

**Scenariusz:** `getMyProfile()` zwraca błąd z kodem PROFILE_NOT_FOUND

**Obsługa:**

```typescript
// W ProfilePage (Server Component)
if (profileResult.error) {
  if (profileResult.code === 'PROFILE_NOT_FOUND') {
    redirect('/onboarding')
  }
  throw new Error(profileResult.error)
}
```

**UI:** Automatyczne przekierowanie na onboarding

---

### 2. Błąd aktualizacji profilu (CALORIES_BELOW_MINIMUM)

**Scenariusz:** PATCH /profile/me zwraca błąd "Kalorie poniżej minimum"

**Obsługa:**

```typescript
// W useProfileForm hook
onError: (error) => {
  toast({
    title: 'Błąd aktualizacji',
    description:
      error.message ||
      'Wybrane tempo utraty wagi prowadzi do zbyt niskiej kaloryczności. Wybierz wolniejsze tempo.',
    variant: 'destructive',
  })
}
```

**UI:**

- Toast notification z komunikatem błędu
- Formularz pozostaje otwarty
- Użytkownik może zmienić tempo lub inne parametry

---

### 3. Błąd walidacji formularza (frontend)

**Scenariusz:** Użytkownik wpisuje wagę poza zakresem (np. 30 kg)

**Obsługa:**

```typescript
// Zod schema validation
weight_kg: z.number()
  .min(40, 'Waga musi wynosić co najmniej 40 kg')
  .max(300, 'Waga nie może przekraczać 300 kg')
```

**UI:**

- Komunikat błędu pod polem "Waga"
- Button "Zapisz zmiany" disabled
- User nie może submitować formularza

---

### 4. Błąd wysyłania feedbacku

**Scenariusz:** POST /feedback zwraca 500 Internal Server Error

**Obsługa:**

```typescript
// W FeedbackCard
catch (error) {
  toast({
    title: 'Błąd',
    description: 'Nie udało się wysłać opinii. Spróbuj ponownie później.',
    variant: 'destructive',
  })
}
```

**UI:**

- Toast notification z komunikatem błędu
- Textarea pozostaje wypełniony (użytkownik nie traci treści)
- Button enabled ponownie (można retry)

---

### 5. Błąd resetu profilu

**Scenariusz:** DELETE profile zwraca błąd

**Obsługa:**

```typescript
// W DangerZoneCard
catch (error) {
  toast({
    title: 'Błąd',
    description: 'Nie udało się zresetować profilu. Spróbuj ponownie lub skontaktuj się z wsparciem.',
    variant: 'destructive',
  })
}
```

**UI:**

- Toast notification z komunikatem błędu
- Button "Zacznij od nowa" enabled ponownie
- AlertDialog zamknięty

---

### 6. Błąd autentykacji (401 Unauthorized)

**Scenariusz:** Sesja wygasła podczas przeglądania

**Obsługa:**

```typescript
// W middleware.ts (globalna obsługa)
if (!user) {
  return NextResponse.redirect(new URL('/login', request.url))
}

// W Server Actions
if (authError || !user) {
  return {
    error: 'Użytkownik nie jest zalogowany',
    code: 'UNAUTHORIZED',
  }
}
```

**UI:** Automatyczne przekierowanie na `/login`

---

### 7. Błąd sieci (Network Error)

**Scenariusz:** Użytkownik offline lub problem z siecią

**Obsługa:**

```typescript
// W try-catch bloków API calls
catch (error) {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    toast({
      title: 'Brak połączenia',
      description: 'Sprawdź swoje połączenie internetowe i spróbuj ponownie.',
      variant: 'destructive',
    })
  }
}
```

**UI:**

- Toast notification z komunikatem
- Dane pozostają w formularzu
- User może retry po przywróceniu połączenia

---

## 11. Kroki implementacji

### Krok 1: Typy i helpers (30 min)

1.1. Utwórz plik typów:

```bash
touch src/types/profile-view.types.ts
```

1.2. Zaimplementuj:

- `ProfileEditFormData`
- `FeedbackFormData`
- `ACTIVITY_LEVEL_LABELS`
- `GOAL_LABELS`
- `WEIGHT_LOSS_RATE_OPTIONS`

  1.3. Zweryfikuj istniejące typy:

- `ProfileDTO` w dto.types.ts
- `UpdateProfileInput` w validation/profile.ts
- `CreateFeedbackCommand` w dto.types.ts

---

### Krok 2: Custom hooki (1.5h)

2.1. Hook do zarządzania formularzem profilu:

```bash
touch src/hooks/useProfileForm.ts
```

- Implementacja z react-hook-form + Zod resolver
- Submit handler z `updateMyProfile()`
- Toast notifications
- Loading state

  2.2. Opcjonalnie: TanStack Query hooki:

```bash
touch src/hooks/useProfileQuery.ts
```

- `useProfileQuery()` - fetching profilu
- `useUpdateProfile()` - mutation z invalidation
- `useResetProfile()` - mutation dla resetu

---

### Krok 3: shadcn/ui komponenty (15 min)

3.1. Zainstaluj brakujące komponenty:

```bash
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add form
# Card, Button, Input już powinny być zainstalowane
```

3.2. Zweryfikuj konfigurację Tailwind dla focus states

---

### Krok 4: Komponenty prezentacyjne (2h)

**Krok 4.1: PageHeader (15 min)**

```bash
touch src/components/profile/PageHeader.tsx
```

- Prosty komponent z h1 i p
- Statyczny content

**Krok 4.2: MacroCard (30 min)**

```bash
touch src/components/profile/MacroCard.tsx
```

- Ikona z lucide-react
- Formatowanie liczb
- Color-coded według typu makro

**Krok 4.3: CurrentTargetsCard (45 min)**

```bash
touch src/components/profile/CurrentTargetsCard.tsx
```

- Card z shadcn/ui
- Grid 2x2 (desktop) lub 1x4 (mobile)
- Integracja z MacroCard
- Props z ProfileDTO (targets)

---

### Krok 5: Komponenty formularzy (3h)

**Krok 5.1: ProfileEditForm (1.5h)**

```bash
touch src/components/profile/ProfileEditForm.tsx
```

- Form z shadcn/ui (react-hook-form integration)
- FormField dla każdego pola (waga, aktywność, cel, tempo)
- Conditional rendering dla tempo utraty wagi
- Select z ACTIVITY_LEVEL_LABELS i GOAL_LABELS
- Submit handler z useProfileForm hook
- Loading state

**Krok 5.2: FeedbackCard (1h)**

```bash
touch src/components/profile/FeedbackCard.tsx
```

- Card z shadcn/ui
- Textarea z licznikiem znaków
- Walidacja min/max length
- Submit handler z `createFeedback()`
- Reset formularza po sukces

**Krok 5.3: DangerZoneCard (30 min)**

```bash
touch src/components/profile/DangerZoneCard.tsx
```

- Card z border-destructive
- AlertDialog z confirmation
- Delete profile handler
- Router redirect po sukces

---

### Krok 6: Główny komponent kliencki (1h)

6.1. Utwórz ProfileClient:

```bash
touch src/components/profile/ProfileClient.tsx
```

6.2. Implementacja:

- Layout z sekcjami (CurrentTargetsCard, ProfileEditForm, DangerZoneCard, FeedbackCard)
- Responsive grid (1 kolumna mobile, 2 kolumny desktop dla niektórych sekcji)
- Przekazywanie initialProfile do sub-komponentów

---

### Krok 7: Server Component (Page) (1h)

7.1. Utwórz strukturę:

```bash
mkdir -p app/(authenticated)/profile
touch app/(authenticated)/profile/page.tsx
touch app/(authenticated)/profile/loading.tsx
touch app/(authenticated)/profile/error.tsx
```

7.2. Implementuj ProfilePage:

- Auth check z Supabase
- Wywołanie `getMyProfile()`
- Obsługa PROFILE_NOT_FOUND (redirect na onboarding)
- Przekazanie do ProfileClient
- Metadata (SEO)

  7.3. Implementuj loading.tsx:

- Skeleton dla CurrentTargetsCard (grid z 4 Skeleton)
- Skeleton dla formularzy (Input/Select skeletons)

  7.4. Implementuj error.tsx:

- Error boundary component
- Button "Spróbuj ponownie" z reset()

**Implementacja loading.tsx:**

```typescript
// app/(authenticated)/profile/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* PageHeader skeleton */}
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="space-y-6">
        {/* CurrentTargetsCard skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ProfileEditForm skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

### Krok 8: Styling i accessibility (1h)

8.1. Tailwind CSS:

- Responsive layout (max-width, padding)
- Focus states dla wszystkich interaktywnych elementów
- Hover states dla przycisków
- Color-coded dla MacroCard
- Destructive styling dla DangerZoneCard

  8.2. Accessibility:

- Semantyczne HTML (form, fieldset, legend)
- Label połączone z input (htmlFor + id)
- ARIA attributes dla AlertDialog (automatic w shadcn/ui)
- Keyboard navigation (Tab, Enter)
- Screen reader testing (alt texts, aria-label)

---

### Krok 9: Testowanie (2-3h)

9.1. Unit testy (Vitest):

```bash
touch src/hooks/__tests__/useProfileForm.test.ts
```

- Mock `updateMyProfile`
- Test walidacji Zod
- Test submit success/error

  9.2. Component testy (React Testing Library):

```bash
touch src/components/profile/__tests__/ProfileEditForm.test.tsx
touch src/components/profile/__tests__/FeedbackCard.test.tsx
```

- ProfileEditForm: rendering, onChange, onSubmit, conditional rendering
- FeedbackCard: textarea onChange, licznik znaków, submit validation
- DangerZoneCard: AlertDialog open/close, confirm action

  9.3. Integration testy:

- ProfileClient z mock data
- Submit flow: form → API → toast → reload
- Reset flow: AlertDialog → API → redirect

  9.4. E2E testy (Playwright):

```bash
touch tests/e2e/profile.spec.ts
```

- Happy path: Edycja wagi → submit → sprawdzenie nowych celów
- Happy path: Zmiana celu → conditional field → submit
- Happy path: Wysłanie feedbacku → sprawdzenie sukcesu
- Error path: Waga poza zakresem → walidacja
- Error path: Tempo utraty wagi → kalorie poniżej minimum
- Destructive path: Reset profilu → confirmation → redirect

**Przykładowy test E2E:**

```typescript
// tests/e2e/profile.spec.ts
test('user can update weight and see new targets', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[name=email]', 'test@example.com')
  await page.fill('[name=password]', 'password')
  await page.click('button[type=submit]')

  // Navigate to profile
  await page.goto('/profile')

  // Wait for page load
  await page.waitForSelector('h1:has-text("Profil i Ustawienia")')

  // Edit weight
  await page.fill('[name=weight_kg]', '65')

  // Submit form
  await page.click('button:has-text("Zapisz zmiany")')

  // Verify toast notification
  await expect(page.locator('.toast')).toContainText(
    'Profil został zaktualizowany'
  )

  // Wait for reload and verify new targets (przykład)
  await page.waitForLoadState('networkidle')
  // Tutaj można sprawdzić czy CurrentTargetsCard ma zaktualizowane wartości
})
```

---

### Krok 10: Optymalizacja i finalizacja (1h)

10.1. Performance:

- Lazy loading dla AlertDialog (opcjonalnie - dynamic import)
- Memoizacja komponentów prezentacyjnych (React.memo)
- Debounce dla onChange w textarea (feedback card)

  10.2. Code review checklist:

- TypeScript strict mode (brak `any`)
- Path aliases (@/) wszędzie
- ESLint i Prettier pass
- Brak console.log
- Error handling we wszystkich async functions

  10.3. Final testing:

- Lighthouse audit (Performance, Accessibility, Best Practices, SEO)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile testing (responsive, touch gestures, keyboard mobile)

---

### Krok 11: Dokumentacja (30 min)

11.1. JSDoc comments:

- useProfileForm hook
- Helper functions w profile-view.types.ts

  11.2. README update:

- Dodanie nowego widoku do dokumentacji
- Screenshot dla QA

---

## Podsumowanie

Plan implementacji widoku Profil i Ustawienia obejmuje:

1. **Architektura hybrydowa:** Server Component (initial load) + Client Components (edycja, feedback)
2. **Formularze z walidacją:** react-hook-form + Zod dla profileditForm
3. **Destructive actions:** AlertDialog z confirmation dla resetu profilu
4. **Toast notifications:** Feedback dla użytkownika po każdej akcji
5. **API Integration:** 3 endpointy (getMyProfile, updateMyProfile, createFeedback)
6. **Zarządzanie stanem:** React Hook Form (formularz) + useState (feedback, reset)
7. **Reużycie komponentów:** Card, Form, Button, AlertDialog z shadcn/ui
8. **Testowanie:** >80% coverage dla krytycznej logiki (walidacja, submit, reset)
9. **Accessibility:** Semantyczne HTML, ARIA labels, keyboard navigation

**Szacowany czas implementacji:** 14-18 godzin (2-2.5 dni dla jednego programisty frontend)

**Priorytety MVP:**

- ✅ Must-have: ProfileEditForm, CurrentTargetsCard, API integration (getMyProfile, updateMyProfile)
- 🔄 Should-have: FeedbackCard, DangerZoneCard, Toast notifications, Loading states
- ⏳ Nice-to-have: TanStack Query (optional), Debounced validation, Optimistic updates, Client-side calorie calculation dla weight loss rate

**Kluczowe decyzje techniczne:**

1. **react-hook-form vs Formik:** react-hook-form dla lepszej integracji z Zod i mniejszego bundle size
2. **TanStack Query:** Opcjonalny (SSR + reload wystarczy dla MVP, ale Query poprawia UX)
3. **Reset profilu:** Direct Supabase delete (CASCADE usunie planned_meals) vs dedicated API endpoint
4. **Feedback metadata:** Nie używane w MVP (przyszłość: user agent, screen resolution, etc.)
5. **Client-side calorie calculation:** Future enhancement (jak w onboarding WeightLossRateStep) - disabled options przed submitowaniem
