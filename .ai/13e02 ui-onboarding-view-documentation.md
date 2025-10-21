# Onboarding View - Dokumentacja techniczna

## Przegląd

Onboarding View to wieloetapowy kreator (wizard) dla nowych użytkowników aplikacji LowCarbPlaner. Umożliwia zbieranie danych użytkownika, obliczanie celów żywieniowych i generowanie spersonalizowanego planu posiłków na 7 dni.

**Lokalizacja**: `/onboarding`
**Status**: ✅ Zaimplementowane
**Wersja**: 1.0.0

## User Stories

- **US-005**: Użytkownik podaje płeć, wiek, wagę, wzrost
- **US-006**: Użytkownik określa poziom aktywności fizycznej i cel (utrata wagi / utrzymanie wagi)
- **US-007**: System oblicza dzienne zapotrzebowanie kaloryczne i makroskładniki
- **US-008**: Użytkownik akceptuje disclaimer przed kontynuacją
- **US-009**: System generuje 7-dniowy plan posiłków

## Architektura

### Struktura plików

```
src/
├── components/onboarding/
│   ├── index.ts                    # Barrel export
│   ├── OnboardingClient.tsx        # Main orchestrator (Client Component)
│   ├── GenderStep.tsx              # Step 1: Gender selection
│   ├── AgeStep.tsx                 # Step 2: Age input
│   ├── WeightStep.tsx              # Step 3: Weight input
│   ├── HeightStep.tsx              # Step 4: Height input
│   ├── ActivityLevelStep.tsx       # Step 5: Activity level selection
│   ├── GoalStep.tsx                # Step 6: Goal selection
│   ├── WeightLossRateStep.tsx      # Step 7: Weight loss rate (conditional)
│   ├── SummaryStep.tsx             # Step 8: Summary with calculated targets
│   ├── DisclaimerStep.tsx          # Step 9: Disclaimer acceptance
│   ├── GeneratingStep.tsx          # Step 10: Loading/generating state
│   ├── StepperIndicator.tsx        # Progress indicator
│   └── NavigationButtons.tsx       # Navigation controls
├── types/
│   └── onboarding-view.types.ts    # TypeScript type definitions
├── lib/
│   ├── utils/
│   │   ├── nutrition-calculator-client.ts     # Client-side nutrition calculations
│   │   ├── onboarding-helpers.ts              # Helper functions
│   │   └── __tests__/
│   │       └── nutrition-calculator-client.test.ts
│   └── actions/
│       └── profile.ts              # Server actions (createProfile, generateMealPlan)
└── app/(public)/
    └── onboarding/
        └── page.tsx                # Server Component (route handler)

middleware.ts                       # Route protection
```

## Przepływ danych

### 1. Inicjalizacja (OnboardingPage - Server Component)

```typescript
// app/(public)/onboarding/page.tsx
export default async function OnboardingPage() {
  // 1. Sprawdź autentykację
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Sprawdź czy profil istnieje
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  // 3. Redirect jeśli profil już istnieje
  if (profile) redirect('/dashboard')

  // 4. Renderuj OnboardingClient
  return <OnboardingClient />
}
```

### 2. State Management (OnboardingClient)

```typescript
const [currentStep, setCurrentStep] = useState(1)
const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_FORM_DATA)
const [isSubmitting, setIsSubmitting] = useState(false)
const [submitError, setSubmitError] = useState<string | null>(null)
```

### 3. Walidacja kroków

Każdy krok ma dedykowaną funkcję walidacji:

```typescript
const isStep1Valid = formData.gender !== null
const isStep2Valid =
  formData.age !== null && formData.age >= 18 && formData.age <= 100
// ... etc
```

### 4. Kalkulacje w czasie rzeczywistym

```typescript
// Obliczenia wykonywane na bieżąco przy zmianie danych
const calculatedTargets = useMemo(() => {
  return calculateNutritionTargetsClient(formData)
}, [formData])

const weightLossOptions = useMemo(() => {
  if (formData.goal !== 'weight_loss') return []
  return generateWeightLossOptions(formData)
}, [formData])
```

### 5. Submitowanie

```typescript
const handleSubmit = async () => {
  // 1. Utworzenie profilu
  const profileResult = await createProfile({
    gender: formData.gender!,
    age: formData.age!,
    weight_kg: formData.weight_kg!,
    height_cm: formData.height_cm!,
    activity_level: formData.activity_level!,
    goal: formData.goal!,
    weight_loss_rate_kg_week: formData.weight_loss_rate_kg_week ?? undefined,
    disclaimer_accepted_at: new Date().toISOString(),
  })

  // 2. Generowanie planu posiłków
  const mealPlanResult = await generateMealPlan()

  // 3. Redirect do dashboardu
  router.push('/dashboard')
}
```

## Komponenty

### OnboardingClient

**Typ**: Client Component
**Odpowiedzialności**:

- Zarządzanie stanem formularza (10 kroków)
- Walidacja danych na każdym kroku
- Nawigacja między krokami (z obsługą warunkowego kroku 7)
- Kalkulacje żywieniowe w czasie rzeczywistym
- Submitowanie danych i integracja z API
- Keyboard navigation (Enter/Escape)
- Focus management i accessibility

**Kluczowe funkcje**:

- `updateField()` - aktualizacja pola formularza
- `isCurrentStepValid()` - walidacja bieżącego kroku
- `handleNext()` - przejście do następnego kroku
- `handleBack()` - powrót do poprzedniego kroku
- `handleSubmit()` - submitowanie formularza
- `renderStep()` - renderowanie aktualnego kroku

### Step Components

#### GenderStep (Krok 1)

- **Input**: RadioGroup (2 opcje: female/male)
- **Walidacja**: Wymagana selekcja
- **UI**: Radio buttons z labels

#### AgeStep (Krok 2)

- **Input**: Number input (18-100)
- **Walidacja**: 18 ≤ age ≤ 100
- **UI**: Input field z error message

#### WeightStep (Krok 3)

- **Input**: Number input (40-300 kg)
- **Walidacja**: 40 ≤ weight_kg ≤ 300
- **UI**: Input field z dokładnością 0.1 kg

#### HeightStep (Krok 4)

- **Input**: Number input (140-250 cm)
- **Walidacja**: 140 ≤ height_cm ≤ 250
- **UI**: Input field

#### ActivityLevelStep (Krok 5)

- **Input**: RadioGroup (5 opcji)
- **Opcje**: very_low, low, moderate, high, very_high
- **UI**: Radio buttons z opisami PAL

#### GoalStep (Krok 6)

- **Input**: RadioGroup (2 opcje)
- **Opcje**: weight_loss, weight_maintenance
- **UI**: Radio buttons z opisami
- **Akcja**: Reset weight_loss_rate_kg_week przy zmianie na maintenance

#### WeightLossRateStep (Krok 7) - WARUNKOWY

- **Warunek**: Wyświetlany tylko gdy goal === 'weight_loss'
- **Input**: RadioGroup (4 opcje: 0.25, 0.5, 0.75, 1.0 kg/tydzień)
- **Walidacja**: Minimum kaloryczne (1400K/1600M)
- **UI**: Radio buttons z deficytem kalorycznym i disable state

#### SummaryStep (Krok 8)

- **Display**: Card z danymi użytkownika + Card z celami żywieniowymi
- **Kalorie**: Obliczone w czasie rzeczywistym
- **Makroskładniki**: 15% carbs, 35% protein, 50% fats

#### DisclaimerStep (Krok 9)

- **Input**: Checkbox
- **Content**: Alert z pełnym tekstem disclaimera
- **Walidacja**: Musi być zaznaczony

#### GeneratingStep (Krok 10)

- **Display**: Loading spinner + komunikaty
- **States**: Loading lub Error
- **UI**: Loader2 icon + tekst informacyjny

### Navigation Components

#### StepperIndicator

- **Desktop**: Pełny stepper z ikonami i tytułami (9 kroków)
- **Mobile**: Uproszczony progress bar z tekstem "Krok X z Y"
- **Features**: Check icons dla ukończonych kroków, highlight dla aktualnego

#### NavigationButtons

- **Layout**: Flex-col (mobile) / Flex-row (desktop)
- **Buttons**: Wstecz, Progress indicator, Dalej/Wygeneruj
- **States**: disabled (gdy invalid), loading (podczas submitu)
- **Mobile**: Reversed order, shorter text labels

## Kalkulacje żywieniowe

### Wzory

#### BMR (Podstawowa Przemiana Materii) - Mifflin-St Jeor

```typescript
// Kobiety
BMR = 10 × weight_kg + 6.25 × height_cm - 5 × age - 161

// Mężczyźni
BMR = 10 × weight_kg + 6.25 × height_cm - 5 × age + 5
```

#### TDEE (Całkowite Dzienne Wydatkowanie Energii)

```typescript
TDEE = BMR × PAL_MULTIPLIER

// PAL Multipliers
very_low:   1.2   // Brak aktywności
low:        1.375 // 1-3 treningi/tydzień
moderate:   1.55  // 3-5 treningów/tydzień
high:       1.725 // 6-7 treningów/tydzień
very_high:  1.9   // 2× dziennie lub praca fizyczna
```

#### Deficyt kaloryczny (tylko weight_loss)

```typescript
// 1 kg tłuszczu ≈ 7700 kcal
const deficitPerDay = (weight_loss_rate_kg_week × 7700) / 7
const targetCalories = TDEE - deficitPerDay
```

#### Minimum kaloryczne

```typescript
const MIN_CALORIES_FEMALE = 1400
const MIN_CALORIES_MALE = 1600

// Walidacja
if (targetCalories < minCalories) {
  // Opcja jest disabled
  option.isDisabled = true
  option.reasonDisabled = 'Poniżej bezpiecznego minimum'
}
```

#### Makroskładniki

```typescript
target_carbs_g = Math.round((targetCalories × 0.15) / 4)    // 15% kalorii
target_protein_g = Math.round((targetCalories × 0.35) / 4)  // 35% kalorii
target_fats_g = Math.round((targetCalories × 0.5) / 9)      // 50% kalorii
```

## API Integration

### createProfile (Server Action)

```typescript
// src/lib/actions/profile.ts
export async function createProfile(input: CreateProfileInput) {
  // 1. Weryfikacja autentykacji
  // 2. Walidacja danych (Zod)
  // 3. Sprawdzenie czy profil już istnieje
  // 4. Obliczenie celów żywieniowych (server-side validation)
  // 5. Zapis profilu do bazy danych
  // 6. Zwrot CreateProfileResponseDTO
}
```

### generateMealPlan (Server Action)

```typescript
// src/lib/actions/profile.ts
export async function generateMealPlan() {
  // 1. Weryfikacja autentykacji
  // 2. Pobranie profilu użytkownika
  // 3. Sprawdzenie czy plan już istnieje (7 dni)
  // 4. Generowanie 21 posiłków (7 dni × 3 posiłki)
  // 5. Batch insert do planned_meals
  // 6. Zwrot GeneratePlanResponseDTO
}
```

## Routing & Middleware

### Route Protection (middleware.ts)

```typescript
export async function middleware(request: NextRequest) {
  // 1. Refresh Supabase session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 2. Redirect niezalogowanych użytkowników
  if (!user && pathname === '/onboarding') {
    return NextResponse.redirect('/login')
  }

  // 3. Sprawdź czy profil istnieje
  if (user && pathname === '/onboarding') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    // 4. Redirect jeśli profil już istnieje
    if (profile) {
      return NextResponse.redirect('/dashboard')
    }
  }

  return response
}
```

## Accessibility (A11Y)

### ARIA Attributes

```typescript
// Step content region
<div
  role="region"
  aria-label={`Krok ${currentStep} z ${totalSteps}`}
  aria-live="polite"
  tabIndex={-1}
>

// Stepper indicator
<nav aria-label="Progress">
  <div aria-current={step.isCurrent ? 'step' : undefined}>

// Form fields
<Input
  aria-invalid={!!error}
  aria-describedby={error ? 'field-error' : undefined}
/>
<p id="field-error">{error}</p>
```

### Keyboard Navigation

- **Enter**: Przejście do następnego kroku (jeśli valid) lub submit
- **Escape**: Powrót do poprzedniego kroku
- **Tab**: Naturalna nawigacja przez elementy
- **Space**: Toggle dla checkboxów i radio buttons (Radix UI)

### Focus Management

```typescript
useEffect(() => {
  if (stepContentRef.current) {
    stepContentRef.current.focus()
    stepContentRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}, [currentStep])
```

### Screen Reader Support

- Label associations (`htmlFor` + `id`)
- Error announcements (`aria-live="polite"`)
- Progress updates (`aria-label` dynamiczne)
- Semantic HTML (nav, button, input)

## Responsywność

### Breakpoints

```css
/* Mobile-first */
sm: 640px   /* Tablet portrait */
md: 768px   /* Tablet landscape */
lg: 1024px  /* Desktop */
```

### Responsive Features

**StepperIndicator**:

- Mobile: Progress bar + "Krok X z Y"
- Desktop: Full stepper z ikonami

**NavigationButtons**:

- Mobile: flex-col, reversed order, shorter labels
- Desktop: flex-row, full labels

**Typography**:

- Mobile: text-2xl
- Tablet: text-3xl
- Desktop: text-4xl

**Padding**:

- Mobile: px-4 py-6
- Tablet: px-6 py-8
- Desktop: px-6 py-12

## Testowanie

### Unit Tests

```typescript
// nutrition-calculator-client.test.ts
describe('calculateNutritionTargetsClient', () => {
  test('oblicza BMR dla kobiety')
  test('oblicza BMR dla mężczyzny')
  test('oblicza TDEE z różnymi poziomami PAL')
  test('oblicza deficyt kaloryczny dla utraty wagi')
  test('zwraca null dla niepełnych danych')
})

describe('generateWeightLossOptions', () => {
  test('generuje 4 opcje tempa utraty wagi')
  test('oznacza opcje jako disabled poniżej minimum')
  test('oblicza deficyt kaloryczny dla każdej opcji')
})
```

### Component Tests (TODO)

- Test każdego step component w izolacji
- Test walidacji
- Test NavigationButtons states
- Test StepperIndicator progress

### Integration Tests (TODO)

- Pełny flow od step 1 do step 10
- Test warunkowego kroku (weight loss rate)
- Test keyboard navigation
- Test error handling

### E2E Tests (TODO - Playwright)

- Happy path: kompletny onboarding
- Error scenarios
- Mobile responsive tests
- Keyboard navigation

## Performance

### Optymalizacje

1. **useMemo** dla kalkulacji:

   ```typescript
   const calculatedTargets = useMemo(
     () => calculateNutritionTargetsClient(formData),
     [formData]
   )
   ```

2. **useCallback** dla handlers:

   ```typescript
   const handleNext = useCallback(() => { ... }, [deps])
   ```

3. **Lazy rendering**: Tylko aktualny krok jest renderowany

4. **Server Components**: OnboardingPage jako async RSC

5. **Code splitting**: Automatyczny przez Next.js 15

### Metrics

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle size**: ~150KB (po gzip)

## Bezpieczeństwo

### Walidacja

1. **Client-side**: Real-time feedback (UX)
2. **Server-side**: Zod schemas (security)

### RLS (Row Level Security)

```sql
-- profiles table
CREATE POLICY "Users can only create their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

### Middleware Protection

- Tylko zalogowani użytkownicy
- Redirect jeśli profil już istnieje
- Session refresh przy każdym requescie

## Troubleshooting

### Błędy

**"Profil już istnieje"**

- Sprawdź czy middleware prawidłowo redirectuje
- Sprawdź czy OnboardingPage sprawdza profil

**"Minimum kaloryczne"**

- Zwiększ wiek, wagę lub wzrost
- Zmniejsz tempo utraty wagi
- Zmień poziom aktywności na wyższy

**"Nie można wygenerować planu"**

- Sprawdź czy profil został utworzony
- Sprawdź logi meal-plan-generator
- Sprawdź czy istnieją przepisy w bazie

### Debug Tips

```typescript
// Włącz logging w development
if (process.env.NODE_ENV === 'development') {
  console.log('Current step:', currentStep)
  console.log('Form data:', formData)
  console.log('Calculated targets:', calculatedTargets)
}
```

## Maintenance

### Dodawanie nowego kroku

1. Utworz komponent step (np. `NewStep.tsx`)
2. Dodaj interface do `OnboardingFormData`
3. Dodaj walidację w `OnboardingClient`
4. Dodaj case w `renderStep()`
5. Zaktualizuj `getTotalSteps()`
6. Dodaj tytuł do `stepperSteps`

### Zmiana formuł kalkulacji

1. Zaktualizuj `nutrition-calculator-client.ts`
2. Zaktualizuj `services/nutrition-calculator.ts` (server)
3. Zaktualizuj testy
4. Zaktualizuj dokumentację

## Changelog

### v1.0.0 (2025-10-20)

- ✅ Implementacja wszystkich 10 kroków
- ✅ Responsive design (mobile + desktop)
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Middleware protection
- ✅ Real-time calculations
- ✅ Error handling
- ✅ Loading states
- ✅ Toast notifications (sonner)

## Future Enhancements

### v1.1.0 (Planned)

- [ ] Animacje między krokami (framer-motion)
- [ ] Save progress (localStorage fallback)
- [ ] Multi-language support (i18n)
- [ ] Dark mode support
- [ ] Additional goals (muscle gain, body recomposition)

### v2.0.0 (Planned)

- [ ] Personalized meal preferences
- [ ] Allergy management
- [ ] Activity tracker integration
- [ ] Progress photos upload
- [ ] Social onboarding (referral codes)

## Zasoby

### Dokumentacja

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Radix UI](https://www.radix-ui.com/)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

### Narzędzia

- [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://zod.dev/)
- [TanStack Query](https://tanstack.com/query)
- [Sonner](https://sonner.emilkowal.ski/)

### Formuły

- [Mifflin-St Jeor Equation](https://en.wikipedia.org/wiki/Harris%E2%80%93Benedict_equation)
- [Physical Activity Level (PAL)](https://www.fao.org/3/Y5686E/y5686e07.htm)
