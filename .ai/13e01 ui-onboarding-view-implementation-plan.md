# Plan implementacji widoku Kreator Onboardingu

## 1. Przegląd

Widok Kreator Onboardingu to **wieloetapowy formularz** umożliwiający nowemu użytkownikowi skonfigurowanie profilu i wygenerowanie spersonalizowanego planu żywieniowego. Jest to **kluczowy proces** w ścieżce użytkownika, który po raz pierwszy loguje się do aplikacji.

Główne cele widoku:

- Zebranie danych personalizacyjnych (płeć, wiek, waga, wzrost, aktywność, cel żywieniowy)
- Obliczenie i prezentacja dziennych celów kalorycznych i makroskładników
- Akceptacja obowiązkowego disclaimera dotyczącego braku obsługi alergii
- Automatyczne wygenerowanie pierwszego 7-dniowego planu posiłków

Kluczowe cechy UX:

- **Podział na małe kroki** - każdy ekran zbiera minimalną ilość informacji, aby nie przytłoczyć użytkownika
- **Walidacja krok po kroku** - niemożliwość przejścia dalej bez wypełnienia aktualnego kroku
- **Wizualizacja postępu** - stepper pokazujący obecny krok i łączną liczbę kroków
- **Inteligentne obliczenia** - walidacja minimum kalorycznego i dynamiczne wyszarzanie niedostępnych opcji
- **Accessibility-first** - pełna obsługa klawiatury i screen readerów

## 2. Routing widoku

**Ścieżka:** `/onboarding`

**Lokalizacja pliku:** `app/(public)/onboarding/page.tsx`

**Middleware:**

- Sprawdzenie czy użytkownik zalogowany (jeśli nie → redirect na `/login`)
- Sprawdzenie czy profil już istnieje (jeśli tak → redirect na `/` lub `/dashboard`)

**Parametry URL:** Brak (stan zarządzany wewnętrznie)

## 3. Struktura komponentów

```
OnboardingPage (Server Component)
└── OnboardingClient (Client Component - główny wrapper)
    ├── StepperIndicator (Client Component)
    └── Warunkowe renderowanie kroków:
        ├── GenderStep (Client Component)
        ├── AgeStep (Client Component)
        ├── WeightStep (Client Component)
        ├── HeightStep (Client Component)
        ├── ActivityLevelStep (Client Component)
        ├── GoalStep (Client Component)
        ├── WeightLossRateStep (Client Component - warunkowy)
        ├── SummaryStep (Client Component)
        ├── DisclaimerStep (Client Component)
        └── GeneratingStep (Client Component - loading)
    └── NavigationButtons (Client Component)
```

**Separacja odpowiedzialności:**

- **OnboardingPage (Server Component):** Initial auth check, middleware protection
- **OnboardingClient (Client Component):** Zarządzanie stanem formularza, walidacja, nawigacja między krokami
- **Komponenty kroków:** Prezentacja UI i zbieranie danych dla pojedynczego kroku
- **NavigationButtons:** Przyciski "Wstecz" i "Dalej" z walidacją

## 4. Szczegóły komponentów

### OnboardingPage (Server Component)

**Opis:** Główny kontener widoku, odpowiedzialny za sprawdzenie autoryzacji i przekierowanie do Client Component.

**Główne elementy:**

- Sprawdzenie sesji użytkownika
- Sprawdzenie czy profil już nie istnieje
- Wrapper `<main>` z odpowiednimi klasami
- Komponent `<OnboardingClient>`

**Obsługiwane interakcje:** Brak (Server Component)

**Obsługiwana walidacja:**

- Sprawdzenie czy użytkownik zalogowany
- Sprawdzenie czy profil nie istnieje (redirect jeśli istnieje)

**Typy:**

- `User` (z Supabase Auth)
- `Profile` (sprawdzenie istnienia)

**Propsy:** Brak (root page component)

---

### OnboardingClient (Client Component)

**Opis:** Główny komponent kliencki zarządzający stanem formularza onboardingu, nawigacją między krokami, walidacją i komunikacją z API.

**Główne elementy:**

- `<div>` wrapper z layoutem (flex flex-col gap-8)
- `<StepperIndicator>` - wizualizacja postępu
- Warunkowe renderowanie aktualnego kroku (switch/case)
- `<NavigationButtons>` - przyciski nawigacji (poza GeneratingStep)

**Obsługiwane interakcje:**

- Zmiana wartości w krokach → `updateFormData(field, value)`
- Kliknięcie "Dalej" → `goToNextStep()` z walidacją
- Kliknięcie "Wstecz" → `goToPreviousStep()`
- Submit formularza → `handleSubmit()` → API calls

**Obsługiwana walidacja:**

- Walidacja każdego kroku przed przejściem dalej
- Wykorzystanie Zod schema z `createProfileSchema`
- Walidacja minimum kalorycznego w WeightLossRateStep

**Typy:**

- `OnboardingFormData` (ViewModel)
- `OnboardingStepConfig` (konfiguracja kroków)
- `CreateProfileCommand` (DTO do API)
- `GeneratePlanResponseDTO` (odpowiedź API)

**Propsy:** Brak (root client component)

**Implementacja hooka zarządzania stanem:**

```typescript
// hooks/useOnboardingForm.ts
interface OnboardingFormData {
  gender: 'male' | 'female' | null
  age: number | null
  weight_kg: number | null
  height_cm: number | null
  activity_level: ActivityLevelEnum | null
  goal: GoalEnum | null
  weight_loss_rate_kg_week: number | null
  disclaimer_accepted: boolean
}
```

---

### StepperIndicator (Client Component)

**Opis:** Wizualizacja postępu użytkownika w procesie onboardingu. Wyświetla obecny krok i łączną liczbę kroków.

**Główne elementy:**

- `<div>` wrapper z flex layout
- Dynamiczna lista kroków z wizualnym oznaczeniem:
  - Ukończone (checkmark)
  - Aktualny (highlight)
  - Nieukończone (disabled)
- Tekst "Krok X z Y"

**Obsługiwane interakcje:** Brak (tylko prezentacja)

**Obsługiwana walidacja:** Brak

**Typy:**

- `currentStep: number`
- `totalSteps: number`

**Propsy:**

```typescript
interface StepperIndicatorProps {
  currentStep: number
  totalSteps: number
  steps: Array<{
    id: string
    label: string
    isCompleted: boolean
  }>
}
```

---

### GenderStep (Client Component)

**Opis:** Krok wyboru płci użytkownika (male/female).

**Główne elementy:**

- `<div>` wrapper
- Heading h2: "Jaka jest Twoja płeć?"
- `RadioGroup` z shadcn/ui:
  - `<RadioGroupItem value="female">` + Label "Kobieta"
  - `<RadioGroupItem value="male">` + Label "Mężczyzna"

**Obsługiwane interakcje:**

- `onValueChange` → aktualizacja `formData.gender`

**Obsługiwana walidacja:**

- Wymagane pole - przycisk "Dalej" disabled gdy `gender === null`

**Typy:**

- `Enums<'gender_enum'>` ('male' | 'female')

**Propsy:**

```typescript
interface GenderStepProps {
  value: 'male' | 'female' | null
  onChange: (value: 'male' | 'female') => void
}
```

---

### AgeStep (Client Component)

**Opis:** Krok wprowadzenia wieku użytkownika.

**Główne elementy:**

- Heading h2: "Ile masz lat?"
- `<Input type="number">` z shadcn/ui
  - placeholder: "Wpisz swój wiek"
  - min: 18
  - max: 100
- Komunikat walidacji (jeśli błąd)

**Obsługiwane interakcje:**

- `onChange` → aktualizacja `formData.age`
- `onBlur` → walidacja zakresu

**Obsługiwana walidacja:**

- Wymagane: `age !== null`
- Min: 18
- Max: 100
- Liczba całkowita

**Typy:**

- `number | null`

**Propsy:**

```typescript
interface AgeStepProps {
  value: number | null
  onChange: (value: number) => void
  error?: string
}
```

---

### WeightStep (Client Component)

**Opis:** Krok wprowadzenia wagi użytkownika w kilogramach.

**Główne elementy:**

- Heading h2: "Ile ważysz?"
- `<Input type="number">` z jednostką "kg"
  - placeholder: "Wpisz swoją wagę"
  - min: 40
  - max: 300
  - step: 0.1
- Komunikat walidacji

**Obsługiwane interakcje:**

- `onChange` → aktualizacja `formData.weight_kg`
- `onBlur` → walidacja zakresu

**Obsługiwana walidacja:**

- Wymagane: `weight_kg !== null`
- Min: 40 kg
- Max: 300 kg

**Typy:**

- `number | null`

**Propsy:**

```typescript
interface WeightStepProps {
  value: number | null
  onChange: (value: number) => void
  error?: string
}
```

---

### HeightStep (Client Component)

**Opis:** Krok wprowadzenia wzrostu użytkownika w centymetrach.

**Główne elementy:**

- Heading h2: "Jaki jest Twój wzrost?"
- `<Input type="number">` z jednostką "cm"
  - placeholder: "Wpisz swój wzrost"
  - min: 140
  - max: 250
- Komunikat walidacji

**Obsługiwane interakcje:**

- `onChange` → aktualizacja `formData.height_cm`
- `onBlur` → walidacja zakresu

**Obsługiwana walidacja:**

- Wymagane: `height_cm !== null`
- Min: 140 cm
- Max: 250 cm
- Liczba całkowita

**Typy:**

- `number | null`

**Propsy:**

```typescript
interface HeightStepProps {
  value: number | null
  onChange: (value: number) => void
  error?: string
}
```

---

### ActivityLevelStep (Client Component)

**Opis:** Krok wyboru poziomu aktywności fizycznej użytkownika.

**Główne elementy:**

- Heading h2: "Jaki jest Twój poziom aktywności?"
- `RadioGroup` z 5 opcjami:
  - "Bardzo niska" (very_low) + opis
  - "Niska" (low) + opis
  - "Umiarkowana" (moderate) + opis
  - "Wysoka" (high) + opis
  - "Bardzo wysoka" (very_high) + opis

**Obsługiwane interakcje:**

- `onValueChange` → aktualizacja `formData.activity_level`

**Obsługiwana walidacja:**

- Wymagane pole

**Typy:**

- `Enums<'activity_level_enum'>`

**Propsy:**

```typescript
interface ActivityLevelStepProps {
  value: ActivityLevelEnum | null
  onChange: (value: ActivityLevelEnum) => void
}
```

---

### GoalStep (Client Component)

**Opis:** Krok wyboru celu użytkownika (utrata wagi lub utrzymanie wagi).

**Główne elementy:**

- Heading h2: "Jaki jest Twój cel?"
- `RadioGroup` z 2 opcjami:
  - "Utrata wagi" (weight_loss) + opis
  - "Utrzymanie wagi" (weight_maintenance) + opis

**Obsługiwane interakcje:**

- `onValueChange` → aktualizacja `formData.goal`
- Wpływa na następny krok (WeightLossRateStep jest warunkowy)

**Obsługiwana walidacja:**

- Wymagane pole

**Typy:**

- `Enums<'goal_enum'>` ('weight_loss' | 'weight_maintenance')

**Propsy:**

```typescript
interface GoalStepProps {
  value: GoalEnum | null
  onChange: (value: GoalEnum) => void
}
```

---

### WeightLossRateStep (Client Component - WARUNKOWY)

**Opis:** Krok wyboru tempa utraty wagi. **Wyświetlany tylko gdy `goal === 'weight_loss'`**. Opcje są dynamicznie wyszarzane jeśli prowadzą do diety poniżej minimum kalorycznego (1400 kcal dla kobiet, 1600 kcal dla mężczyzn).

**Główne elementy:**

- Heading h2: "Wybierz tempo utraty wagi"
- `RadioGroup` z 4 opcjami:
  - "0.25 kg/tydzień" (powolne, bezpieczne)
  - "0.5 kg/tydzień" (umiarkowane, zalecane) - domyślnie zaznaczone
  - "0.75 kg/tydzień" (szybkie)
  - "1.0 kg/tydzień" (bardzo szybkie)
- Każda opcja ma:
  - Label z tempem
  - Opis konsekwencji (np. "Deficyt ~250 kcal/dzień")
  - Stan disabled jeśli kalorie < minimum
  - Tooltip/opis dlaczego disabled

**Obsługiwane interakcje:**

- `onValueChange` → aktualizacja `formData.weight_loss_rate_kg_week`

**Obsługiwana walidacja:**

- Wymagane gdy `goal === 'weight_loss'`
- Zakres: 0.25 - 1.0 kg/tydzień
- **Obliczanie minimum kalorycznego:**
  - Oblicz TDEE (Total Daily Energy Expenditure) na podstawie:
    - BMR (Mifflin-St Jeor): 10×waga + 6.25×wzrost - 5×wiek + offset_płci
    - TDEE = BMR × współczynnik_aktywności
  - Dla każdej opcji tempa:
    - Deficyt = tempo × 7700 kcal / 7 dni
    - Kalorie = TDEE - Deficyt
    - Sprawdź: kalorie >= (gender === 'female' ? 1400 : 1600)
  - Wyłącz opcje które nie spełniają warunku

**Typy:**

- `number` (0.25 | 0.5 | 0.75 | 1.0)
- `WeightLossOption[]` (ViewModel)

**Propsy:**

```typescript
interface WeightLossRateStepProps {
  value: number | null
  onChange: (value: number) => void
  options: WeightLossOption[]
}

interface WeightLossOption {
  value: number
  label: string
  description: string
  isDisabled: boolean
  reasonDisabled?: string
}
```

---

### SummaryStep (Client Component)

**Opis:** Krok podsumowania wszystkich wprowadzonych danych i **prezentacji obliczonych celów żywieniowych**. Użytkownik widzi swoje odpowiedzi i obliczone dzienne zapotrzebowanie.

**Główne elementy:**

- Heading h2: "Podsumowanie Twoich danych"
- Sekcja "Dane personalne":
  - Płeć, wiek, waga, wzrost
  - Poziom aktywności
  - Cel i tempo utraty wagi (jeśli dotyczy)
- Separator
- Sekcja "Twoje cele dzienne" (karty makroskładników):
  - Kalorie (kcal)
  - Białko (g)
  - Węglowodany (g)
  - Tłuszcze (g)
- Przycisk "Zatwierdź i kontynuuj"

**Obsługiwane interakcje:**

- Kliknięcie "Zatwierdź" → przejście do DisclaimerStep

**Obsługiwana walidacja:**

- Brak (tylko prezentacja)
- Obliczenia wykonane przez `calculateNutritionTargets` (client-side preview)

**Typy:**

- `OnboardingFormData`
- `CalculatedTargets` (ViewModel)

**Propsy:**

```typescript
interface SummaryStepProps {
  formData: OnboardingFormData
  calculatedTargets: CalculatedTargets
  onConfirm: () => void
}

interface CalculatedTargets {
  target_calories: number
  target_carbs_g: number
  target_protein_g: number
  target_fats_g: number
}
```

---

### DisclaimerStep (Client Component)

**Opis:** Krok akceptacji obowiązkowego disclaimera informującego o braku obsługi alergii i nietolerancji pokarmowych. Przycisk "Rozpocznij" jest nieaktywny dopóki checkbox nie zostanie zaznaczony.

**Główne elementy:**

- Heading h2: "Ważna informacja"
- `<Card>` z treścią disclaimera:
  - Alert icon
  - Treść: "Aplikacja nie obsługuje alergii ani nietolerancji pokarmowych. Sprawdzaj składniki każdego przepisu pod kątem swoich alergii. Przed rozpoczęciem diety skonsultuj się z lekarzem."
- `<Checkbox>` + Label: "Rozumiem i akceptuję powyższe warunki"
- Przycisk "Rozpocznij" (disabled gdy !disclaimer_accepted)

**Obsługiwane interakcje:**

- `onCheckedChange` checkbox → aktualizacja `formData.disclaimer_accepted`
- Kliknięcie "Rozpocznij" → `handleSubmit()` (wywołanie API)

**Obsługiwana walidacja:**

- Checkbox musi być zaznaczony aby kontynuować
- `disclaimer_accepted === true`

**Typy:**

- `boolean`

**Propsy:**

```typescript
interface DisclaimerStepProps {
  accepted: boolean
  onChange: (accepted: boolean) => void
  onSubmit: () => void
  isLoading: boolean
}
```

---

### GeneratingStep (Client Component - Loading)

**Opis:** Ekran ładowania wyświetlany podczas generowania planu posiłków. Pokazuje spinner, komunikat i opcjonalnie progress indicator. Po zakończeniu (sukces) przekierowuje do `/` (widok dnia).

**Główne elementy:**

- `<div>` wrapper z centrowaniem
- Spinner/Loader (z lucide-react lub shadcn/ui)
- Heading h2: "Generowanie Twojego planu..."
- `<p>` komunikat: "To potrwa tylko chwilę. Przygotowujemy dla Ciebie spersonalizowany plan posiłków."
- Opcjonalnie: Progress bar (jeśli API zwraca progress)

**Obsługiwane interakcje:** Brak (automatyczne)

**Obsługiwana walidacja:**

- Timeout: maksymalnie 15 sekund
- Obsługa błędów API

**Typy:**

- `GeneratePlanResponseDTO`

**Propsy:**

```typescript
interface GeneratingStepProps {
  isLoading: boolean
  error: string | null
  onRetry?: () => void
}
```

---

### NavigationButtons (Client Component)

**Opis:** Przyciski "Wstecz" i "Dalej" z dynamiczną widocznością i dostępnością. Nie wyświetlane w GeneratingStep.

**Główne elementy:**

- `<div>` wrapper z flex justify-between
- `<Button variant="outline">` "Wstecz"
  - Ukryty na pierwszym kroku
  - onClick → `goToPreviousStep()`
- `<Button variant="default">` "Dalej" / "Rozpocznij"
  - Disabled gdy aktualny krok nie przeszedł walidacji
  - onClick → `goToNextStep()` lub `handleSubmit()`
  - Tekst dynamiczny:
    - "Dalej" (kroki 1-8)
    - "Rozpocznij" (DisclaimerStep)

**Obsługiwane interakcje:**

- onClick "Wstecz"
- onClick "Dalej" z walidacją

**Obsługiwana walidacja:**

- `isValid` prop determinuje disabled state
- Walidacja aktualnego kroku przed przejściem

**Typy:**

- `boolean` (isFirstStep, isLastStep, isValid, isLoading)

**Propsy:**

```typescript
interface NavigationButtonsProps {
  isFirstStep: boolean
  isLastStep: boolean
  isValid: boolean
  isLoading: boolean
  onBack: () => void
  onNext: () => void
  nextButtonText?: string
}
```

---

## 5. Typy

### Istniejące typy z dto.types.ts:

```typescript
// src/types/dto.types.ts

export type CreateProfileCommand = {
  gender: Enums<'gender_enum'>
  age: number
  weight_kg: number
  height_cm: number
  activity_level: Enums<'activity_level_enum'>
  goal: Enums<'goal_enum'>
  weight_loss_rate_kg_week: number | null
  disclaimer_accepted_at: string
}

export type CreateProfileResponseDTO = {
  id: string
  email: string
  gender: Enums<'gender_enum'>
  age: number
  weight_kg: number
  height_cm: number
  activity_level: Enums<'activity_level_enum'>
  goal: Enums<'goal_enum'>
  weight_loss_rate_kg_week: number | null
  disclaimer_accepted_at: string
  target_calories: number
  target_carbs_g: number
  target_protein_g: number
  target_fats_g: number
  created_at: string
  updated_at: string
}

export type GeneratePlanResponseDTO = {
  status: 'success' | 'error'
  message: string
  generated_days: number
}
```

### Nowe typy ViewModels (do utworzenia):

```typescript
// src/types/onboarding-view.types.ts

/**
 * Stan formularza onboardingu (client-side)
 */
export interface OnboardingFormData {
  gender: Enums<'gender_enum'> | null
  age: number | null
  weight_kg: number | null
  height_cm: number | null
  activity_level: Enums<'activity_level_enum'> | null
  goal: Enums<'goal_enum'> | null
  weight_loss_rate_kg_week: number | null
  disclaimer_accepted: boolean
}

/**
 * Konfiguracja pojedynczego kroku
 */
export interface OnboardingStepConfig {
  id: string
  label: string
  description?: string
  isConditional?: boolean
  condition?: (formData: OnboardingFormData) => boolean
}

/**
 * Opcja tempa utraty wagi (z walidacją minimum kalorycznego)
 */
export interface WeightLossOption {
  value: number // 0.25, 0.5, 0.75, 1.0
  label: string // "0.5 kg/tydzień"
  description: string // "Umiarkowane tempo, zalecane"
  deficitPerDay: number // Deficyt kaloryczny dziennie
  isDisabled: boolean
  reasonDisabled?: string // "Ta opcja prowadzi do diety poniżej bezpiecznego minimum (1400 kcal)"
}

/**
 * Obliczone cele żywieniowe (preview w SummaryStep)
 */
export interface CalculatedTargets {
  target_calories: number
  target_carbs_g: number
  target_protein_g: number
  target_fats_g: number
}

/**
 * Mapowanie activity_level na polskie nazwy
 */
export const ACTIVITY_LEVEL_LABELS: Record<
  Enums<'activity_level_enum'>,
  string
> = {
  very_low: 'Bardzo niska',
  low: 'Niska',
  moderate: 'Umiarkowana',
  high: 'Wysoka',
  very_high: 'Bardzo wysoka',
}

/**
 * Opisy poziomów aktywności
 */
export const ACTIVITY_LEVEL_DESCRIPTIONS: Record<
  Enums<'activity_level_enum'>,
  string
> = {
  very_low: 'Praca siedząca, brak aktywności fizycznej',
  low: 'Lekka aktywność 1-3 razy w tygodniu',
  moderate: 'Umiarkowana aktywność 3-5 razy w tygodniu',
  high: 'Intensywna aktywność 6-7 razy w tygodniu',
  very_high: 'Bardzo intensywna aktywność, praca fizyczna',
}

/**
 * Mapowanie goal na polskie nazwy
 */
export const GOAL_LABELS: Record<Enums<'goal_enum'>, string> = {
  weight_loss: 'Utrata wagi',
  weight_maintenance: 'Utrzymanie wagi',
}

/**
 * Opisy celów
 */
export const GOAL_DESCRIPTIONS: Record<Enums<'goal_enum'>, string> = {
  weight_loss: 'Chcę schudnąć i obniżyć wagę ciała',
  weight_maintenance: 'Chcę utrzymać obecną wagę',
}
```

### Pomocnicze funkcje typów:

```typescript
/**
 * Oblicza cele żywieniowe (client-side preview)
 * Wykorzystuje tę samą logikę co serwer (calculateNutritionTargets)
 */
export function calculateNutritionTargetsClient(
  data: Partial<OnboardingFormData>
): CalculatedTargets | null {
  const {
    gender,
    age,
    weight_kg,
    height_cm,
    activity_level,
    goal,
    weight_loss_rate_kg_week,
  } = data

  if (!gender || !age || !weight_kg || !height_cm || !activity_level || !goal) {
    return null
  }

  // BMR (Mifflin-St Jeor)
  const bmr =
    gender === 'female'
      ? 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
      : 10 * weight_kg + 6.25 * height_cm - 5 * age + 5

  // Współczynniki PAL
  const PAL_MULTIPLIERS = {
    very_low: 1.2,
    low: 1.375,
    moderate: 1.55,
    high: 1.725,
    very_high: 1.9,
  }

  // TDEE
  const tdee = bmr * PAL_MULTIPLIERS[activity_level]

  // Kalorie celowe
  let targetCalories = tdee
  if (goal === 'weight_loss' && weight_loss_rate_kg_week) {
    const deficitPerDay = (weight_loss_rate_kg_week * 7700) / 7
    targetCalories = tdee - deficitPerDay
  }

  // Rozkład makro (15% W, 35% B, 50% T)
  const target_carbs_g = Math.round((targetCalories * 0.15) / 4)
  const target_protein_g = Math.round((targetCalories * 0.35) / 4)
  const target_fats_g = Math.round((targetCalories * 0.5) / 9)

  return {
    target_calories: Math.round(targetCalories),
    target_carbs_g,
    target_protein_g,
    target_fats_g,
  }
}

/**
 * Generuje opcje tempa utraty wagi z walidacją minimum kalorycznego
 */
export function generateWeightLossOptions(
  data: Partial<OnboardingFormData>
): WeightLossOption[] {
  const options: WeightLossOption[] = [
    {
      value: 0.25,
      label: '0.25 kg/tydzień',
      description: 'Powolne, bardzo bezpieczne',
      deficitPerDay: 0,
      isDisabled: false,
    },
    {
      value: 0.5,
      label: '0.5 kg/tydzień',
      description: 'Umiarkowane, zalecane',
      deficitPerDay: 0,
      isDisabled: false,
    },
    {
      value: 0.75,
      label: '0.75 kg/tydzień',
      description: 'Szybkie',
      deficitPerDay: 0,
      isDisabled: false,
    },
    {
      value: 1.0,
      label: '1.0 kg/tydzień',
      description: 'Bardzo szybkie',
      deficitPerDay: 0,
      isDisabled: false,
    },
  ]

  const { gender, age, weight_kg, height_cm, activity_level } = data

  if (!gender || !age || !weight_kg || !height_cm || !activity_level) {
    return options
  }

  // Oblicz TDEE (bez deficytu)
  const bmr =
    gender === 'female'
      ? 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
      : 10 * weight_kg + 6.25 * height_cm - 5 * age + 5

  const PAL_MULTIPLIERS = {
    very_low: 1.2,
    low: 1.375,
    moderate: 1.55,
    high: 1.725,
    very_high: 1.9,
  }

  const tdee = bmr * PAL_MULTIPLIERS[activity_level]
  const minCalories = gender === 'female' ? 1400 : 1600

  return options.map((option) => {
    const deficitPerDay = (option.value * 7700) / 7
    const targetCalories = tdee - deficitPerDay

    option.deficitPerDay = Math.round(deficitPerDay)

    if (targetCalories < minCalories) {
      option.isDisabled = true
      option.reasonDisabled = `Ta opcja prowadzi do diety poniżej bezpiecznego minimum (${minCalories} kcal)`
    }

    return option
  })
}
```

---

## 6. Zarządzanie stanem

### Custom hook: useOnboardingForm

**Lokalizacja:** `hooks/useOnboardingForm.ts`

```typescript
'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createProfile, generateMealPlan } from '@/lib/actions/profile'
import type {
  OnboardingFormData,
  OnboardingStepConfig,
  CalculatedTargets,
} from '@/types/onboarding-view.types'
import {
  calculateNutritionTargetsClient,
  generateWeightLossOptions,
} from '@/lib/utils/nutrition-calculator-client'
import { toast } from '@/hooks/use-toast'

export const useOnboardingForm = () => {
  const router = useRouter()

  // Stan formularza
  const [formData, setFormData] = useState<OnboardingFormData>({
    gender: null,
    age: null,
    weight_kg: null,
    height_cm: null,
    activity_level: null,
    goal: null,
    weight_loss_rate_kg_week: null,
    disclaimer_accepted: false,
  })

  // Stan UI
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Konfiguracja kroków (z warunkowością)
  const steps: OnboardingStepConfig[] = useMemo(() => {
    const allSteps: OnboardingStepConfig[] = [
      { id: 'gender', label: 'Płeć' },
      { id: 'age', label: 'Wiek' },
      { id: 'weight', label: 'Waga' },
      { id: 'height', label: 'Wzrost' },
      { id: 'activity', label: 'Aktywność' },
      { id: 'goal', label: 'Cel' },
      {
        id: 'weight_loss_rate',
        label: 'Tempo utraty wagi',
        isConditional: true,
        condition: (data) => data.goal === 'weight_loss',
      },
      { id: 'summary', label: 'Podsumowanie' },
      { id: 'disclaimer', label: 'Akceptacja' },
      { id: 'generating', label: 'Generowanie planu' },
    ]

    // Filtruj warunkowe kroki
    return allSteps.filter((step) => {
      if (!step.isConditional) return true
      return step.condition?.(formData) ?? true
    })
  }, [formData.goal])

  const currentStepConfig = steps[currentStep]
  const totalSteps = steps.length

  // Obliczone cele (dla SummaryStep)
  const calculatedTargets = useMemo(() => {
    return calculateNutritionTargetsClient(formData)
  }, [formData])

  // Opcje tempa utraty wagi (dla WeightLossRateStep)
  const weightLossOptions = useMemo(() => {
    return generateWeightLossOptions(formData)
  }, [
    formData.gender,
    formData.age,
    formData.weight_kg,
    formData.height_cm,
    formData.activity_level,
  ])

  // Aktualizacja pola formularza
  const updateFormData = useCallback(
    <K extends keyof OnboardingFormData>(
      field: K,
      value: OnboardingFormData[K]
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  // Walidacja aktualnego kroku
  const validateCurrentStep = useCallback((): boolean => {
    const stepId = currentStepConfig.id

    switch (stepId) {
      case 'gender':
        return formData.gender !== null
      case 'age':
        return (
          formData.age !== null && formData.age >= 18 && formData.age <= 100
        )
      case 'weight':
        return (
          formData.weight_kg !== null &&
          formData.weight_kg >= 40 &&
          formData.weight_kg <= 300
        )
      case 'height':
        return (
          formData.height_cm !== null &&
          formData.height_cm >= 140 &&
          formData.height_cm <= 250
        )
      case 'activity':
        return formData.activity_level !== null
      case 'goal':
        return formData.goal !== null
      case 'weight_loss_rate':
        return formData.weight_loss_rate_kg_week !== null
      case 'summary':
        return true // Brak walidacji, tylko prezentacja
      case 'disclaimer':
        return formData.disclaimer_accepted === true
      default:
        return true
    }
  }, [currentStepConfig, formData])

  // Nawigacja: Następny krok
  const goToNextStep = useCallback(() => {
    if (!validateCurrentStep()) {
      toast({
        title: 'Uzupełnij dane',
        description: 'Wypełnij wszystkie wymagane pola przed przejściem dalej.',
        variant: 'destructive',
      })
      return
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep, totalSteps, validateCurrentStep])

  // Nawigacja: Poprzedni krok
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  // Submit formularza (DisclaimerStep)
  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Krok 1: Utwórz profil
      const profileResult = await createProfile({
        gender: formData.gender!,
        age: formData.age!,
        weight_kg: formData.weight_kg!,
        height_cm: formData.height_cm!,
        activity_level: formData.activity_level!,
        goal: formData.goal!,
        weight_loss_rate_kg_week: formData.weight_loss_rate_kg_week,
        disclaimer_accepted_at: new Date().toISOString(),
      })

      if (profileResult.error) {
        throw new Error(profileResult.error)
      }

      // Krok 2: Przejdź do GeneratingStep
      goToNextStep()

      // Krok 3: Wygeneruj plan posiłków
      const planResult = await generateMealPlan()

      if (planResult.error) {
        // Nie blokuj użytkownika, pozwól przejść do dashboardu
        console.error('Błąd generowania planu:', planResult.error)
        toast({
          title: 'Uwaga',
          description:
            'Profil utworzony, ale wystąpił problem z generowaniem planu. Możesz wygenerować plan później.',
          variant: 'default',
        })
      }

      // Krok 4: Przekierowanie do widoku dnia
      router.push('/')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd'
      setError(errorMessage)
      toast({
        title: 'Błąd',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validateCurrentStep, goToNextStep, router])

  return {
    formData,
    updateFormData,
    currentStep,
    currentStepConfig,
    totalSteps,
    steps,
    goToNextStep,
    goToPreviousStep,
    validateCurrentStep,
    handleSubmit,
    isSubmitting,
    error,
    calculatedTargets,
    weightLossOptions,
  }
}
```

### Zustand Store (opcjonalnie)

**NIE jest wymagany** dla tego widoku, ponieważ:

- Stan formularza jest lokalny (nie współdzielony między komponentami)
- Proces onboardingu jest liniowy (bez skoków między krokami)
- Nie ma potrzeby persystencji między sesjami (onboarding jednorazowy)

Jeśli w przyszłości będzie potrzeba zapisywania postępu (np. wznowienie po odświeżeniu strony), można dodać Zustand + persist middleware.

---

## 7. Integracja API

### Endpoint 1: POST /profile (createProfile)

**Server Action:** `createProfile(input: CreateProfileInput)`

**Typ żądania:**

```typescript
{
  gender: 'male' | 'female'
  age: number // 18-100
  weight_kg: number // 40-300
  height_cm: number // 140-250
  activity_level: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high'
  goal: 'weight_loss' | 'weight_maintenance'
  weight_loss_rate_kg_week: number | null // 0.25-1.0, wymagane gdy goal='weight_loss'
  disclaimer_accepted_at: string // ISO 8601 datetime
}
```

**Typ odpowiedzi:**

```typescript
ActionResult<CreateProfileResponseDTO>
// gdzie ActionResult =
//   | { data: CreateProfileResponseDTO }
//   | { error: string, code?: string }

CreateProfileResponseDTO = {
  id: string
  email: string
  gender: 'male' | 'female'
  age: number
  weight_kg: number
  height_cm: number
  activity_level: ActivityLevelEnum
  goal: GoalEnum
  weight_loss_rate_kg_week: number | null
  disclaimer_accepted_at: string
  target_calories: number
  target_carbs_g: number
  target_protein_g: number
  target_fats_g: number
  created_at: string
  updated_at: string
}
```

**Kody błędów:**

- `400` - Nieprawidłowe dane lub kalorie poniżej minimum (1400K/1600M)
- `401` - Użytkownik niezalogowany
- `409` - Profil już istnieje

**Użycie w komponencie:**

```typescript
// W DisclaimerStep / handleSubmit
const result = await createProfile({
  ...formData,
  disclaimer_accepted_at: new Date().toISOString(),
})

if (result.error) {
  if (result.code === 'CALORIES_BELOW_MINIMUM') {
    // Pokaż komunikat o minimum kalorycznym
  } else if (result.code === 'PROFILE_ALREADY_EXISTS') {
    // Przekieruj do dashboardu
    router.push('/')
  } else {
    // Ogólny błąd
    toast({ title: 'Błąd', description: result.error, variant: 'destructive' })
  }
}
```

---

### Endpoint 2: POST /profile/me/generate-plan (generateMealPlan)

**Server Action:** `generateMealPlan()`

**Typ żądania:** Brak parametrów (używa zalogowanego użytkownika)

**Typ odpowiedzi:**

```typescript
ActionResult<GeneratePlanResponseDTO>

GeneratePlanResponseDTO = {
  status: 'success' | 'error'
  message: string
  generated_days: number
}
```

**Kody błędów:**

- `401` - Użytkownik niezalogowany
- `404` - Profil nie istnieje (nie powinno się zdarzyć po createProfile)
- `409` - Plan już istnieje
- `500` - Błąd generatora planu

**Użycie w komponencie:**

```typescript
// W GeneratingStep / po createProfile
const planResult = await generateMealPlan()

if (planResult.error) {
  // Nie blokuj użytkownika, pozwól przejść do dashboardu
  console.error('Błąd generowania planu:', planResult.error)
  toast({
    title: 'Uwaga',
    description: 'Profil utworzony, ale plan zostanie wygenerowany później.',
  })
}

// Przekieruj do dashboardu
router.push('/')
```

---

## 8. Interakcje użytkownika

### Interakcja 1: Wypełnienie kroku i przejście dalej

**Trigger:** Kliknięcie przycisku "Dalej"

**Flow:**

1. Użytkownik wypełnia dane w kroku (np. wybiera płeć "Kobieta")
2. Klika "Dalej"
3. System:
   - Wywołuje `validateCurrentStep()`
   - Jeśli walidacja fail → toast z komunikatem, brak zmiany kroku
   - Jeśli walidacja pass → `goToNextStep()`, przejście do następnego kroku
4. Nowy krok się renderuje

**Keyboard support:**

- Enter → trigger "Dalej" (jeśli focus na input/radio)
- Tab → nawigacja między elementami

---

### Interakcja 2: Powrót do poprzedniego kroku

**Trigger:** Kliknięcie przycisku "Wstecz"

**Flow:**

1. Użytkownik klika "Wstecz"
2. System:
   - Wywołuje `goToPreviousStep()`
   - Przechodzi do poprzedniego kroku
   - Dane zachowane (stan formularza globalny)
3. Poprzedni krok się renderuje z zachowanymi danymi

---

### Interakcja 3: Wybór tempa utraty wagi z walidacją

**Trigger:** Wejście do WeightLossRateStep

**Flow:**

1. System:
   - Wywołuje `generateWeightLossOptions(formData)`
   - Oblicza TDEE na podstawie BMR i PAL
   - Dla każdej opcji (0.25, 0.5, 0.75, 1.0 kg/tydz):
     - Oblicza deficyt kaloryczny
     - Oblicza wynikowe kalorie (TDEE - deficyt)
     - Sprawdza czy >= minimum (1400K/1600M)
     - Jeśli nie → `isDisabled: true`, dodaje `reasonDisabled`
2. Użytkownik widzi opcje:
   - Dostępne: normalny styl
   - Niedostępne: wyszarzone, disabled, z tooltip wyjaśniającym dlaczego
3. Użytkownik wybiera dostępną opcję → aktualizacja `formData.weight_loss_rate_kg_week`

---

### Interakcja 4: Prezentacja obliczonych celów

**Trigger:** Wejście do SummaryStep

**Flow:**

1. System:
   - Wywołuje `calculateNutritionTargetsClient(formData)`
   - Oblicza:
     - BMR (Mifflin-St Jeor)
     - TDEE (BMR × PAL)
     - Kalorie celowe (TDEE - deficyt dla weight_loss)
     - Makro (15% W, 35% B, 50% T)
2. Renderuje 4 karty z celami:
   - Kalorie: 1800 kcal
   - Białko: 158 g
   - Węglowodany: 68 g
   - Tłuszcze: 100 g
3. Użytkownik przegląda dane i klika "Zatwierdź"

---

### Interakcja 5: Akceptacja disclaimera i submit

**Trigger:** DisclaimerStep

**Flow:**

1. Użytkownik czyta treść disclaimera
2. Zaznacza checkbox "Rozumiem i akceptuję"
   - `onChange` → `updateFormData('disclaimer_accepted', true)`
   - Przycisk "Rozpocznij" staje się aktywny
3. Klika "Rozpocznij"
4. System:
   - `handleSubmit()` wywołany
   - Loading state: przycisk disabled, spinner
   - Wywołanie `createProfile()`
   - Jeśli sukces:
     - Przejście do GeneratingStep
     - Wywołanie `generateMealPlan()`
     - Po zakończeniu: redirect na `/`
   - Jeśli błąd:
     - Toast z komunikatem błędu
     - Użytkownik może spróbować ponownie

---

### Interakcja 6: Generowanie planu (loading)

**Trigger:** Po pomyślnym `createProfile()`

**Flow:**

1. Przejście do GeneratingStep
2. Wyświetlenie:
   - Spinner/loader
   - "Generowanie Twojego planu..."
   - Komunikat: "To potrwa tylko chwilę..."
3. Wywołanie `generateMealPlan()` w tle
4. Po zakończeniu (max 15s):
   - Sukces → redirect na `/`
   - Błąd → toast, ale i tak redirect (plan można wygenerować później)

---

### Interakcja 7: Obsługa błędu minimum kalorycznego

**Trigger:** API zwraca error `CALORIES_BELOW_MINIMUM`

**Flow:**

1. `createProfile()` zwraca `{ error, code: 'CALORIES_BELOW_MINIMUM' }`
2. System:
   - Toast z komunikatem: "Wybrane tempo utraty wagi prowadzi do zbyt niskiego spożycia kalorii"
   - Cofnięcie do WeightLossRateStep
   - Sugestia: "Wybierz wolniejsze tempo lub zmień parametry"
3. Użytkownik wybiera inną opcję

---

## 9. Warunki i walidacja

### Frontend validation (useOnboardingForm):

#### GenderStep:

- **Warunek:** Wymagane pole
- **Walidacja:** `formData.gender !== null`
- **Wpływ na UI:** Przycisk "Dalej" disabled gdy nie wybrano

#### AgeStep:

- **Warunek:** Min 18, max 100, liczba całkowita
- **Walidacja:**
  ```typescript
  formData.age !== null &&
    formData.age >= 18 &&
    formData.age <= 100 &&
    Number.isInteger(formData.age)
  ```
- **Wpływ na UI:**
  - Inline error message przy input
  - Przycisk "Dalej" disabled gdy invalid

#### WeightStep:

- **Warunek:** Min 40 kg, max 300 kg
- **Walidacja:**
  ```typescript
  formData.weight_kg !== null &&
    formData.weight_kg >= 40 &&
    formData.weight_kg <= 300
  ```
- **Wpływ na UI:** Inline error + disabled "Dalej"

#### HeightStep:

- **Warunek:** Min 140 cm, max 250 cm, liczba całkowita
- **Walidacja:**
  ```typescript
  formData.height_cm !== null &&
    formData.height_cm >= 140 &&
    formData.height_cm <= 250 &&
    Number.isInteger(formData.height_cm)
  ```
- **Wpływ na UI:** Inline error + disabled "Dalej"

#### ActivityLevelStep:

- **Warunek:** Wymagane pole
- **Walidacja:** `formData.activity_level !== null`
- **Wpływ na UI:** Disabled "Dalej"

#### GoalStep:

- **Warunek:** Wymagane pole
- **Walidacja:** `formData.goal !== null`
- **Wpływ na UI:** Disabled "Dalej"

#### WeightLossRateStep:

- **Warunek:** Wymagane gdy `goal === 'weight_loss'`
- **Walidacja:**
  ```typescript
  formData.weight_loss_rate_kg_week !== null &&
    formData.weight_loss_rate_kg_week >= 0.25 &&
    formData.weight_loss_rate_kg_week <= 1.0
  ```
- **Walidacja minimum kalorycznego:**

  ```typescript
  const tdee = calculateTDEE(formData)
  const deficitPerDay = (rate * 7700) / 7
  const targetCalories = tdee - deficitPerDay
  const minCalories = formData.gender === 'female' ? 1400 : 1600

  if (targetCalories < minCalories) {
    option.isDisabled = true
  }
  ```

- **Wpływ na UI:**
  - Wyszarzone opcje z tooltip
  - Disabled radio buttons
  - "Dalej" disabled gdy nie wybrano

#### DisclaimerStep:

- **Warunek:** Checkbox musi być zaznaczony
- **Walidacja:** `formData.disclaimer_accepted === true`
- **Wpływ na UI:**
  - Przycisk "Rozpocznij" disabled gdy `!disclaimer_accepted`
  - Checkbox required attribute

### Backend validation (z profile.ts + createProfileSchema):

#### createProfileSchema (Zod):

```typescript
// lib/validation/profile.ts
createProfileSchema = z
  .object({
    gender: z.enum(['male', 'female']),
    age: z.number().int().min(18).max(100),
    weight_kg: z.number().min(40).max(300),
    height_cm: z.number().min(140).max(250),
    activity_level: z.enum([
      'very_low',
      'low',
      'moderate',
      'high',
      'very_high',
    ]),
    goal: z.enum(['weight_loss', 'weight_maintenance']),
    weight_loss_rate_kg_week: z.number().min(0.25).max(1.0).optional(),
    disclaimer_accepted_at: z.string().datetime(),
  })
  .refine(
    (data) => {
      // weight_loss_rate_kg_week wymagane gdy goal='weight_loss'
      if (data.goal === 'weight_loss' && !data.weight_loss_rate_kg_week) {
        return false
      }
      return true
    },
    {
      message: 'Tempo utraty wagi jest wymagane dla celu "utrata wagi"',
      path: ['weight_loss_rate_kg_week'],
    }
  )
```

#### calculateNutritionTargets (serwer):

```typescript
// services/nutrition-calculator.ts
// Walidacja minimum kalorycznego
const minCalories = gender === 'female' ? 1400 : 1600
if (targetCalories < minCalories) {
  throw new Error(
    `Obliczone kalorie (${targetCalories}) są poniżej bezpiecznego minimum (${minCalories} kcal)`
  )
}
```

**Obsługa błędów:**

- `VALIDATION_ERROR` → toast + focus na błędnym polu
- `CALORIES_BELOW_MINIMUM` → toast + cofnięcie do WeightLossRateStep
- `PROFILE_ALREADY_EXISTS` → redirect na `/`
- `UNAUTHORIZED` → redirect na `/login`

---

## 10. Obsługa błędów

### Scenariusz 1: Błąd walidacji formularza (client-side)

**Przyczyna:** Użytkownik próbuje przejść dalej bez wypełnienia pola

**Obsługa:**

- Wywołanie `validateCurrentStep()` zwraca `false`
- Toast: "Uzupełnij dane. Wypełnij wszystkie wymagane pola przed przejściem dalej."
- Brak zmiany kroku
- Focus na pierwszym błędnym polu (opcjonalnie)

---

### Scenariusz 2: Błąd 400 (Bad Request) z API

**Przyczyna:** Nieprawidłowe dane (nie powinno się zdarzyć jeśli client-side validation działa)

**Obsługa:**

```typescript
if (result.error && result.code === 'VALIDATION_ERROR') {
  toast({
    title: 'Błąd walidacji',
    description: result.error,
    variant: 'destructive',
  })
  // Opcjonalnie: cofnij do odpowiedniego kroku
}
```

---

### Scenariusz 3: Błąd minimum kalorycznego (CALORIES_BELOW_MINIMUM)

**Przyczyna:** Wybrane tempo utraty wagi prowadzi do < 1400/1600 kcal

**Obsługa:**

```typescript
if (result.error && result.code === 'CALORIES_BELOW_MINIMUM') {
  toast({
    title: 'Tempo zbyt szybkie',
    description:
      'Wybrane tempo utraty wagi prowadzi do diety poniżej bezpiecznego minimum. Wybierz wolniejsze tempo.',
    variant: 'destructive',
  })
  // Cofnij do WeightLossRateStep
  setCurrentStep(steps.findIndex((s) => s.id === 'weight_loss_rate'))
}
```

**Preventive measure:** Client-side walidacja w `generateWeightLossOptions` powinna zapobiec temu błędowi.

---

### Scenariusz 4: Błąd 409 (Conflict) - profil już istnieje

**Przyczyna:** Użytkownik już ukończył onboarding

**Obsługa:**

```typescript
if (result.error && result.code === 'PROFILE_ALREADY_EXISTS') {
  toast({
    title: 'Profil już istnieje',
    description:
      'Twój profil został już utworzony. Przekierowujemy do aplikacji.',
  })
  router.push('/')
}
```

---

### Scenariusz 5: Błąd 401 (Unauthorized) - sesja wygasła

**Przyczyna:** Sesja użytkownika wygasła podczas onboardingu

**Obsługa:**

```typescript
if (result.error && result.code === 'UNAUTHORIZED') {
  toast({
    title: 'Sesja wygasła',
    description: 'Twoja sesja wygasła. Zaloguj się ponownie.',
    variant: 'destructive',
  })
  router.push('/login')
}
```

---

### Scenariusz 6: Błąd generowania planu (500 Internal Server Error)

**Przyczyna:** Błąd w `MealPlanGenerator`

**Obsługa:**

```typescript
const planResult = await generateMealPlan()

if (planResult.error) {
  console.error('Błąd generowania planu:', planResult.error)

  // Nie blokuj użytkownika
  toast({
    title: 'Plan zostanie wygenerowany później',
    description:
      'Profil utworzony pomyślnie. Możesz wygenerować plan później w ustawieniach.',
  })

  // Przekieruj do dashboardu (z pustym planem)
  router.push('/')
}
```

**Rationale:** Generowanie planu nie powinno blokować ukończenia onboardingu. Użytkownik może wygenerować plan później.

---

### Scenariusz 7: Timeout generowania planu (> 15s)

**Przyczyna:** Generowanie trwa zbyt długo

**Obsługa:**

```typescript
// W GeneratingStep
const TIMEOUT_MS = 15000

useEffect(() => {
  const timer = setTimeout(() => {
    toast({
      title: 'Generowanie trwa dłużej niż oczekiwano',
      description: 'Plan zostanie wygenerowany w tle. Możesz kontynuować.',
    })
    router.push('/')
  }, TIMEOUT_MS)

  return () => clearTimeout(timer)
}, [])
```

---

### Scenariusz 8: Błąd sieci (Network Error)

**Przyczyna:** Brak połączenia internetowego

**Obsługa:**

```typescript
try {
  const result = await createProfile(...)
} catch (err) {
  if (err.message.includes('fetch')) {
    toast({
      title: 'Brak połączenia',
      description: 'Sprawdź połączenie internetowe i spróbuj ponownie.',
      variant: 'destructive',
    })
  }
}
```

---

## 11. Kroki implementacji

### Krok 1: Struktura projektu i typy (2h)

1.1. Utwórz strukturę katalogów:

```bash
mkdir -p app/(public)/onboarding
mkdir -p components/onboarding
mkdir -p lib/utils
mkdir -p hooks
```

1.2. Utwórz plik typów:

```bash
touch src/types/onboarding-view.types.ts
```

1.3. Dodaj typy ViewModels zgodnie z sekcją 5:

- `OnboardingFormData`
- `OnboardingStepConfig`
- `WeightLossOption`
- `CalculatedTargets`
- Label mappings i descriptions

  1.4. Zainstaluj brakujące komponenty shadcn/ui:

```bash
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add button
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add badge
```

---

### Krok 2: Pomocnicze funkcje obliczeniowe (3h)

2.1. Utwórz plik:

```bash
touch src/lib/utils/nutrition-calculator-client.ts
```

2.2. Implementuj funkcje:

- `calculateNutritionTargetsClient(data)` - obliczanie celów (BMR, TDEE, makro)
- `generateWeightLossOptions(data)` - opcje tempa z walidacją minimum

  2.3. Testy jednostkowe:

```bash
touch src/lib/utils/__tests__/nutrition-calculator-client.test.ts
```

Test cases:

- Obliczanie BMR dla różnych płci
- Obliczanie TDEE dla różnych poziomów aktywności
- Walidacja minimum kalorycznego (1400K/1600M)
- Wyszarzanie opcji tempa

---

### Krok 3: Custom hook useOnboardingForm (4h)

3.1. Utwórz plik:

```bash
touch src/hooks/useOnboardingForm.ts
```

3.2. Implementuj hook zgodnie z sekcją 6:

- Stan formularza (`formData`)
- Stan UI (`currentStep`, `isSubmitting`, `error`)
- Konfiguracja kroków (z warunkowością WeightLossRateStep)
- Metody:
  - `updateFormData(field, value)`
  - `validateCurrentStep()`
  - `goToNextStep()`
  - `goToPreviousStep()`
  - `handleSubmit()` (createProfile + generateMealPlan)
- useMemo dla:
  - `calculatedTargets`
  - `weightLossOptions`

  3.3. Testy jednostkowe:

```bash
touch src/hooks/__tests__/useOnboardingForm.test.ts
```

Test cases:

- Walidacja każdego kroku
- Nawigacja między krokami
- Warunkowe wyświetlanie WeightLossRateStep
- Obsługa błędów API

---

### Krok 4: Komponenty kroków (8h)

Implementuj w kolejności (bottom-up):

4.1. **GenderStep** (1h)

```bash
touch src/components/onboarding/GenderStep.tsx
```

- RadioGroup z shadcn/ui
- 2 opcje: male/female
- onChange callback

  4.2. **AgeStep** (1h)

```bash
touch src/components/onboarding/AgeStep.tsx
```

- Input number
- Walidacja 18-100
- Inline error messages

  4.3. **WeightStep** (1h)

```bash
touch src/components/onboarding/WeightStep.tsx
```

- Input number z jednostką "kg"
- Walidacja 40-300

  4.4. **HeightStep** (1h)

```bash
touch src/components/onboarding/HeightStep.tsx
```

- Input number z jednostką "cm"
- Walidacja 140-250

  4.5. **ActivityLevelStep** (1h)

```bash
touch src/components/onboarding/ActivityLevelStep.tsx
```

- RadioGroup z 5 opcjami
- Opisy poziomów aktywności

  4.6. **GoalStep** (1h)

```bash
touch src/components/onboarding/GoalStep.tsx
```

- RadioGroup z 2 opcjami
- Wpływa na następny krok

  4.7. **WeightLossRateStep** (2h)

```bash
touch src/components/onboarding/WeightLossRateStep.tsx
```

- RadioGroup z 4 opcjami
- Dynamiczne wyszarzanie z tooltip
- Integration z `weightLossOptions` z hooka

---

### Krok 5: Komponenty podsumowania i finalizacji (4h)

5.1. **SummaryStep** (2h)

```bash
touch src/components/onboarding/SummaryStep.tsx
```

- Wyświetlenie wszystkich danych
- Karty z obliczonymi celami (kalorie, makro)
- Przycisk "Zatwierdź"

  5.2. **DisclaimerStep** (1h)

```bash
touch src/components/onboarding/DisclaimerStep.tsx
```

- Card z treścią disclaimera
- Checkbox "Rozumiem i akceptuję"
- Przycisk "Rozpocznij" (disabled gdy !accepted)

  5.3. **GeneratingStep** (1h)

```bash
touch src/components/onboarding/GeneratingStep.tsx
```

- Spinner/loader
- Komunikat "Generowanie Twojego planu..."
- Obsługa timeout (15s)

---

### Krok 6: Komponenty nawigacji i UI (3h)

6.1. **StepperIndicator** (1h)

```bash
touch src/components/onboarding/StepperIndicator.tsx
```

- Wizualizacja postępu
- Lista kroków z oznaczeniami (completed/current/upcoming)

  6.2. **NavigationButtons** (1h)

```bash
touch src/components/onboarding/NavigationButtons.tsx
```

- Przyciski "Wstecz" i "Dalej"
- Warunkowa widoczność i disabled state
- Dynamiczny tekst ("Dalej" / "Rozpocznij")

  6.3. **EmptyState/ErrorState** (opcjonalnie, 1h)

```bash
touch src/components/onboarding/ErrorState.tsx
```

- Komponent do wyświetlania błędów
- Przycisk "Spróbuj ponownie"

---

### Krok 7: Główny komponent kliencki (3h)

7.1. Utwórz:

```bash
touch src/components/onboarding/OnboardingClient.tsx
```

7.2. Implementacja:

- Oznacz jako `'use client'`
- Użyj `useOnboardingForm` hook
- Warunkowe renderowanie kroków (switch/case na `currentStepConfig.id`)
- Integracja wszystkich komponentów kroków
- `<StepperIndicator>` + `<NavigationButtons>`

  7.3. Obsługa stanów:

- Loading state podczas submit
- Error state z możliwością retry

---

### Krok 8: Server Component (Page) (2h)

8.1. Utwórz:

```bash
touch app/(public)/onboarding/page.tsx
```

8.2. Implementacja:

- Sprawdzenie sesji użytkownika (redirect jeśli niezalogowany)
- Sprawdzenie czy profil nie istnieje (redirect jeśli istnieje)
- Renderowanie `<OnboardingClient>`

  8.3. Metadata:

```typescript
export const metadata: Metadata = {
  title: 'Onboarding - LowCarbPlaner',
  description:
    'Skonfiguruj swój profil i zacznij swoją niskowęglowodanową dietę',
}
```

---

### Krok 9: Middleware i routing (2h)

9.1. Zaktualizuj middleware:

```bash
touch middleware.ts
```

9.2. Dodaj logikę:

- Sprawdzenie czy użytkownik zalogowany (jeśli nie → `/login`)
- Sprawdzenie czy profil istnieje (jeśli tak → `/` redirect)
- Dostęp do `/onboarding` tylko dla zalogowanych bez profilu

  9.3. Zweryfikuj strukturę routingu:

```
app/
├── (public)/
│   ├── onboarding/
│   │   └── page.tsx
│   ├── login/
│   └── signup/
├── (authenticated)/
│   └── page.tsx (Dashboard)
└── layout.tsx
```

---

### Krok 10: Styling i responsywność (3h)

10.1. Tailwind CSS:

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Container max-width: 600px dla onboardingu

  10.2. Komponenty:

- Consistent spacing (gap-4, gap-6, gap-8)
- Typography hierarchy (h1/h2/h3 + body)
- Focus states (focus:ring-2)

  10.3. Dark mode (opcjonalnie):

- Jeśli w scope MVP, dodaj dark mode support
- Używając CSS variables z shadcn/ui

---

### Krok 11: Accessibility (2h)

11.1. Semantyczne HTML:

- `<form>` wrapper dla całego onboardingu
- `<fieldset>` dla każdego kroku
- `<legend>` dla nagłówków kroków

  11.2. ARIA attributes:

- `aria-label` dla StepperIndicator
- `aria-live="polite"` dla error messages
- `aria-required="true"` dla wymaganych pól
- `aria-disabled="true"` dla wyszarzonych opcji

  11.3. Keyboard navigation:

- Tab order logiczny
- Enter → submit/next
- Escape → cancel/back (opcjonalnie)

  11.4. Screen reader testing:

- Test z NVDA/JAWS
- Announce kroków i błędów

---

### Krok 12: Testowanie (6h)

12.1. **Unit testy (Vitest)** (2h):

- `nutrition-calculator-client.ts` (BMR, TDEE, makro)
- `useOnboardingForm` hook (walidacja, nawigacja)

  12.2. **Component testy (React Testing Library)** (2h):

- `GenderStep` (onChange)
- `WeightLossRateStep` (disabled options)
- `DisclaimerStep` (checkbox required)
- `NavigationButtons` (disabled states)

  12.3. **Integration testy** (1h):

- OnboardingClient z mock API
- Flow: wszystkie kroki → submit → redirect

  12.4. **E2E testy (Playwright)** (1h):

```typescript
test('Complete onboarding flow', async ({ page }) => {
  await page.goto('/onboarding')

  // Krok 1: Płeć
  await page.click('text=Kobieta')
  await page.click('text=Dalej')

  // Krok 2: Wiek
  await page.fill('input[type="number"]', '30')
  await page.click('text=Dalej')

  // ... (wszystkie kroki)

  // Disclaimer
  await page.check('text=Rozumiem i akceptuję')
  await page.click('text=Rozpocznij')

  // Oczekiwanie na redirect
  await page.waitForURL('/')
})
```

---

### Krok 13: Optymalizacja i finalizacja (2h)

13.1. Performance:

- Bundle analysis
- Code splitting (jeśli potrzebne)
- Lazy loading kroków (opcjonalnie)

  13.2. Error boundaries:

```bash
touch app/(public)/onboarding/error.tsx
```

13.3. Loading states:

```bash
touch app/(public)/onboarding/loading.tsx
```

13.4. Code review checklist:

- TypeScript strict mode (brak `any`)
- ESLint pass
- Prettier pass
- Brak console.log
- Wszystkie TODOs resolved

---

### Krok 14: Dokumentacja (1h)

14.1. JSDoc comments:

- Dla wszystkich hooków
- Dla wszystkich public API

  14.2. README update (jeśli potrzebne):

- Dodanie informacji o onboardingu

  14.3. Storybook (opcjonalnie):

- Stories dla każdego kroku
- Isolated testing

---

## Podsumowanie czasowe

- **Krok 1 (Setup + Typy):** 2h
- **Krok 2 (Funkcje obliczeniowe):** 3h
- **Krok 3 (Hook):** 4h
- **Krok 4 (Komponenty kroków):** 8h
- **Krok 5 (Podsumowanie):** 4h
- **Krok 6 (Nawigacja):** 3h
- **Krok 7 (Client Component):** 3h
- **Krok 8 (Server Component):** 2h
- **Krok 9 (Middleware):** 2h
- **Krok 10 (Styling):** 3h
- **Krok 11 (Accessibility):** 2h
- **Krok 12 (Testowanie):** 6h
- **Krok 13 (Optymalizacja):** 2h
- **Krok 14 (Dokumentacja):** 1h

**Łączny szacowany czas:** **45 godzin pracy** (5-7 dni dla jednego programisty frontend)

---

## Checklist implementacji

### Must-have (MVP):

- [ ] Wszystkie 10 kroków onboardingu zaimplementowane
- [ ] Walidacja krok po kroku (niemożność przejścia bez wypełnienia)
- [ ] Obliczanie i walidacja minimum kalorycznego (1400K/1600M)
- [ ] Dynamiczne wyszarzanie opcji tempa utraty wagi
- [ ] Prezentacja obliczonych celów (kalorie + makro)
- [ ] Akceptacja disclaimera (checkbox required)
- [ ] Generowanie planu posiłków po submit
- [ ] Przekierowanie do dashboardu po zakończeniu
- [ ] Obsługa błędów API (400, 401, 409, 500)
- [ ] Loading states (spinner podczas generowania)
- [ ] Responsywność (mobile + desktop)
- [ ] Keyboard navigation (Tab, Enter)
- [ ] Accessibility (ARIA labels, semantic HTML)

### Nice-to-have (post-MVP):

- [ ] Progress bar w GeneratingStep (jeśli API wspiera)
- [ ] Animacje między krokami (fade-in/slide)
- [ ] Zapisywanie postępu w localStorage (wznowienie po refresh)
- [ ] Preview planu posiłków przed zatwierdzeniem (opcjonalnie)
- [ ] Edycja danych w SummaryStep (click-to-edit)
- [ ] Dark mode support
- [ ] Multi-language support (i18n)
- [ ] A/B testing różnych UI dla kroków
- [ ] Analytics tracking (Google Analytics, Mixpanel)

---

## Dodatkowe uwagi

1. **Walidacja klient-serwer:** Client-side walidacja (Zod schema) musi być zgodna z server-side (createProfileSchema). Używaj tego samego schema po obu stronach.

2. **Obliczenia klient-serwer:** Funkcja `calculateNutritionTargetsClient` musi używać dokładnie tej samej logiki co `calculateNutritionTargets` na serwerze, aby uniknąć rozbieżności w celach.

3. **Minimum kaloryczne:** Walidacja minimum (1400K/1600M) powinna być wykonana zarówno client-side (wyszarzanie opcji) jak i server-side (throw error jeśli kalorie < minimum).

4. **Generowanie planu:** Jeśli generowanie planu fail, nie blokuj użytkownika. Pozwól mu przejść do dashboardu i wygenerować plan później przez dedykowaną akcję.

5. **Timeout handling:** Generowanie planu może trwać do 15s. Po przekroczeniu timeout, pozwól użytkownikowi kontynuować (plan zostanie wygenerowany w tle lub później).

6. **Accessibility priority:** Onboarding to krytyczny flow, więc accessibility jest must-have, nie nice-to-have.

---

**Koniec planu implementacji.**
