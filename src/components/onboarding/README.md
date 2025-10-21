# Onboarding Components

Multi-step wizard for new user registration and profile setup.

## Quick Start

```typescript
import { OnboardingClient } from '@/components/onboarding'

// In your page component
export default function OnboardingPage() {
  return <OnboardingClient />
}
```

## Components Overview

| Component            | Type   | Description                              |
| -------------------- | ------ | ---------------------------------------- |
| `OnboardingClient`   | Client | Main orchestrator component              |
| `GenderStep`         | Client | Step 1: Gender selection                 |
| `AgeStep`            | Client | Step 2: Age input (18-100)               |
| `WeightStep`         | Client | Step 3: Weight input (40-300 kg)         |
| `HeightStep`         | Client | Step 4: Height input (140-250 cm)        |
| `ActivityLevelStep`  | Client | Step 5: Activity level (5 options)       |
| `GoalStep`           | Client | Step 6: Goal (weight loss / maintenance) |
| `WeightLossRateStep` | Client | Step 7: Weight loss rate (conditional)   |
| `SummaryStep`        | Client | Step 8: Summary with calculated targets  |
| `DisclaimerStep`     | Client | Step 9: Disclaimer acceptance            |
| `GeneratingStep`     | Client | Step 10: Loading state                   |
| `StepperIndicator`   | Client | Progress indicator                       |
| `NavigationButtons`  | Client | Navigation controls                      |

## Architecture

```
OnboardingClient (State Management)
├── StepperIndicator (Progress)
├── Step Components (Content)
│   ├── GenderStep
│   ├── AgeStep
│   ├── WeightStep
│   ├── HeightStep
│   ├── ActivityLevelStep
│   ├── GoalStep
│   ├── WeightLossRateStep (conditional)
│   ├── SummaryStep
│   ├── DisclaimerStep
│   └── GeneratingStep
└── NavigationButtons (Controls)
```

## State Flow

```typescript
// OnboardingClient manages:
const [currentStep, setCurrentStep] = useState(1)
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

// Real-time calculations:
const calculatedTargets = useMemo(
  () => calculateNutritionTargetsClient(formData),
  [formData]
)
```

## Navigation Logic

### Next Step

```typescript
const handleNext = () => {
  // Skip step 7 if goal is maintenance
  if (currentStep === 6 && formData.goal === 'weight_maintenance') {
    setCurrentStep(8)
  } else {
    setCurrentStep((prev) => prev + 1)
  }
}
```

### Previous Step

```typescript
const handleBack = () => {
  // Skip step 7 when going back if goal is maintenance
  if (currentStep === 8 && formData.goal === 'weight_maintenance') {
    setCurrentStep(6)
  } else {
    setCurrentStep((prev) => prev - 1)
  }
}
```

## Validation

Each step has validation logic:

```typescript
const isStep1Valid = formData.gender !== null
const isStep2Valid = formData.age >= 18 && formData.age <= 100
const isStep3Valid = formData.weight_kg >= 40 && formData.weight_kg <= 300
// ... etc
```

## Keyboard Shortcuts

- **Enter**: Next step / Submit
- **Escape**: Previous step
- **Tab**: Navigate through fields

## Accessibility

- ARIA labels and descriptions
- Screen reader announcements
- Focus management
- Keyboard navigation
- WCAG 2.1 AA compliant

## Responsive Design

### Mobile

- Simplified progress bar
- Stacked buttons
- Shorter labels
- Touch-friendly (size="lg")

### Desktop

- Full stepper with icons
- Horizontal layout
- Full labels
- Keyboard optimized

## API Integration

```typescript
// 1. Create profile
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

// 2. Generate meal plan
const mealPlanResult = await generateMealPlan()

// 3. Redirect to dashboard
router.push('/dashboard')
```

## Customization

### Adding a New Step

1. Create step component:

```typescript
// NewStep.tsx
export function NewStep({ value, onChange, error }: NewStepProps) {
  return (
    <div className="space-y-6">
      <h2>Your Question</h2>
      {/* Your input */}
    </div>
  )
}
```

2. Add to OnboardingFormData:

```typescript
interface OnboardingFormData {
  // ... existing fields
  new_field: string | null
}
```

3. Add validation:

```typescript
const isNewStepValid = formData.new_field !== null
```

4. Add to renderStep():

```typescript
case 11:
  return <NewStep value={formData.new_field} onChange={...} />
```

### Changing Calculation Formulas

Update `nutrition-calculator-client.ts`:

```typescript
export function calculateNutritionTargetsClient(
  data: Partial<OnboardingFormData>
): CalculatedTargets | null {
  // Your custom calculations
}
```

## Testing

```bash
# Unit tests
npm run test

# Type check
npm run type-check

# Lint
npm run lint
```

## Performance

- Real-time calculations use `useMemo`
- Navigation handlers use `useCallback`
- Only current step is rendered
- Server Components for initial load

## Security

- Client-side validation (UX)
- Server-side validation (Zod)
- RLS policies on database
- Middleware route protection

## Dependencies

```json
{
  "@radix-ui/react-radio-group": "^1.x",
  "@radix-ui/react-label": "^2.x",
  "sonner": "^1.x",
  "lucide-react": "^0.x"
}
```

## Related Documentation

- [Full Documentation](.ai/13e02 ui-onboarding-view-documentation.md)
- [Implementation Plan](.ai/13e01 ui-onboarding-view-implementation-plan.md)
- [Type Definitions](../../types/onboarding-view.types.ts)
- [Nutrition Calculator](../../lib/utils/nutrition-calculator-client.ts)
