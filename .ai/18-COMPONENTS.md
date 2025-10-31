# Component Library Documentation - LowCarbPlaner

## Overview

This document catalogs all reusable components in the LowCarbPlaner application, organized by domain and functionality. It serves as a reference for developers to understand what components exist and how to use them.

---

## Table of Contents

1. [Base UI Components (shadcn/ui)](#1-base-ui-components-shadcnui)
2. [Authentication Components](#2-authentication-components)
3. [Dashboard Components](#3-dashboard-components)
4. [Meal Plan Components](#4-meal-plan-components)
5. [Shopping List Components](#5-shopping-list-components)
6. [Onboarding Components](#6-onboarding-components)
7. [Profile Components](#7-profile-components)
8. [Layout Components](#8-layout-components)
9. [Shared Components](#9-shared-components)
10. [Component Patterns](#10-component-patterns)

---

## 1. Base UI Components (shadcn/ui)

These are primitive components from [shadcn/ui](https://ui.shadcn.com/), customized for our design system. Located in `src/components/ui/`.

### Available Base Components

| Component       | Purpose                | Import Path                    |
| --------------- | ---------------------- | ------------------------------ |
| **Button**      | Primary action buttons | `@/components/ui/button`       |
| **Input**       | Text input fields      | `@/components/ui/input`        |
| **Label**       | Form labels            | `@/components/ui/label`        |
| **Card**        | Content containers     | `@/components/ui/card`         |
| **Checkbox**    | Boolean toggles        | `@/components/ui/checkbox`     |
| **RadioGroup**  | Single-select options  | `@/components/ui/radio-group`  |
| **Select**      | Dropdown selections    | `@/components/ui/select`       |
| **Dialog**      | Modal dialogs          | `@/components/ui/dialog`       |
| **AlertDialog** | Confirmation dialogs   | `@/components/ui/alert-dialog` |
| **Tabs**        | Tab navigation         | `@/components/ui/tabs`         |
| **Progress**    | Progress bars          | `@/components/ui/progress`     |
| **Separator**   | Visual dividers        | `@/components/ui/separator`    |
| **ScrollArea**  | Scrollable containers  | `@/components/ui/scroll-area`  |
| **Accordion**   | Collapsible sections   | `@/components/ui/accordion`    |

### Usage Example

```tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function MyForm() {
  return (
    <form>
      <Label htmlFor='email'>Email</Label>
      <Input id='email' type='email' placeholder='Enter your email' />
      <Button type='submit'>Submit</Button>
    </form>
  )
}
```

---

## 2. Authentication Components

Located in `src/components/auth/`.

### `<LoginForm />`

**Purpose:** User login with email/password or Google OAuth.

**Props:**

```typescript
interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
}
```

**Usage:**

```tsx
<LoginForm onSuccess={() => router.push('/dashboard')} />
```

**Features:**

- Email/password validation with Zod
- Google OAuth integration
- Password visibility toggle
- "Forgot password" link
- Error message display

---

### `<RegisterForm />`

**Purpose:** New user registration.

**Props:**

```typescript
interface RegisterFormProps {
  onSuccess?: (userId: string) => void
}
```

**Features:**

- Email/password validation
- Password strength indicator
- Password confirmation
- Automatic redirect to onboarding after registration

---

### `<ForgotPasswordForm />`

**Purpose:** Password reset request form.

**Features:**

- Email validation
- Sends password reset magic link
- Success/error feedback

---

### `<ResetPasswordForm />`

**Purpose:** Set new password after clicking reset link.

**Props:**

```typescript
interface ResetPasswordFormProps {
  token: string // From URL query param
}
```

---

### `<PasswordStrengthIndicator />`

**Purpose:** Visual password strength meter.

**Props:**

```typescript
interface PasswordStrengthIndicatorProps {
  password: string
}
```

**Features:**

- Real-time strength calculation
- Color-coded indicator (red → yellow → green)
- Feedback messages ("Too weak", "Good", "Strong")

---

### `<SocialAuthButton />`

**Purpose:** Reusable OAuth provider button.

**Props:**

```typescript
interface SocialAuthButtonProps {
  provider: 'google' | 'facebook' | 'github'
  onSuccess?: () => void
}
```

**Usage:**

```tsx
<SocialAuthButton
  provider='google'
  onSuccess={() => router.push('/dashboard')}
/>
```

---

## 3. Dashboard Components

Located in `src/components/dashboard/`.

### `<DashboardClient />`

**Purpose:** Main dashboard container (client component).

**Features:**

- Fetches today's meals via `useMealPlan` hook
- Displays calendar strip for date navigation
- Shows meal cards and macro progress
- Handles loading and error states

---

### `<CalendarStrip />`

**Purpose:** Horizontal date picker for selecting day.

**Props:**

```typescript
interface CalendarStripProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  availableDates?: Date[] // Dates with meal plans
}
```

**Features:**

- Shows 7 days: yesterday, today, next 5 days
- Highlights selected date
- Indicates dates with generated plans (dot indicator)
- Swipeable on mobile

---

### `<MealCard />`

**Purpose:** Displays a single meal with consumption toggle.

**Props:**

```typescript
interface MealCardProps {
  meal: PlannedMeal
  onToggleConsumed: (mealId: string, isConsumed: boolean) => void
  onClick?: () => void // Navigate to recipe detail
}
```

**Features:**

- Shows recipe image, name, calories, macros
- Checkbox to mark as consumed
- Click to open recipe modal
- "Swap meal" button

**Design:**

```
┌─────────────────────────────────┐
│ [Image]  Scrambled Eggs    [✓] │
│          350 kcal               │
│          P: 25g | C: 5g | F: 28g│
│                                 │
│          [Zmień danie]          │
└─────────────────────────────────┘
```

---

### `<MacroProgressSection />`

**Purpose:** Container for all macro progress bars.

**Props:**

```typescript
interface MacroProgressSectionProps {
  current: MacroValues
  target: MacroValues
}

interface MacroValues {
  calories: number
  protein: number
  carbs: number
  fats: number
}
```

**Features:**

- Displays 4 progress bars (Calories, Protein, Carbs, Fats)
- Color-coded: green (<100%), orange (100-110%), red (>110%)
- Shows current/target values

---

### `<MacroProgressBar />`

**Purpose:** Single macro progress bar.

**Props:**

```typescript
interface MacroProgressBarProps {
  label: string
  current: number
  target: number
  unit: 'kcal' | 'g'
  color?: 'green' | 'orange' | 'red'
}
```

---

### `<IngredientEditor />`

**Purpose:** Edit ingredient amounts in meal.

**Props:**

```typescript
interface IngredientEditorProps {
  meal: PlannedMeal
  onUpdate: (modifications: IngredientModification[]) => void
}
```

**Features:**

- Shows list of ingredients with current amounts
- +/- buttons for scalable ingredients
- Numeric input for manual entry
- Real-time macro recalculation
- "Składnik stały" badge for non-scalable ingredients

---

### `<EditableIngredientRow />`

**Purpose:** Single editable ingredient row.

**Props:**

```typescript
interface EditableIngredientRowProps {
  ingredient: RecipeIngredient
  isScalable: boolean
  onChange: (newAmount: number) => void
}
```

---

### `<LiveMacroPreview />`

**Purpose:** Shows recalculated macros as user edits ingredients.

**Props:**

```typescript
interface LiveMacroPreviewProps {
  originalMacros: MacroValues
  updatedMacros: MacroValues
  showDiff?: boolean
}
```

**Features:**

- Side-by-side comparison (original → updated)
- Highlights changes in color (green for decrease, red for increase)

---

### `<EmptyState />`

**Purpose:** Placeholder when no meals are available.

**Props:**

```typescript
interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}
```

**Usage:**

```tsx
<EmptyState
  title='Brak posiłków na ten dzień'
  description='Plan posiłków jeszcze nie został wygenerowany.'
  action={{ label: 'Generuj plan', onClick: handleGenerate }}
/>
```

---

### `<DashboardSkeleton />`

**Purpose:** Loading skeleton for dashboard.

**Features:**

- Shows shimmering placeholders for meal cards and progress bars
- Matches layout of actual dashboard

---

## 4. Meal Plan Components

Located in `src/components/meal-plan/`.

### `<RecipeModal />`

**Purpose:** Full-screen recipe detail modal.

**Props:**

```typescript
interface RecipeModalProps {
  meal: PlannedMeal
  isOpen: boolean
  onClose: () => void
}
```

**Features:**

- Recipe image (full-width header)
- Ingredient list grouped by category
- Ingredient macros breakdown
- Step-by-step cooking instructions
- Total recipe macros
- "Edit ingredients" button (for today's meals only)
- Allergy disclaimer

**Sections:**

```
┌───────────────────────────┐
│   [Recipe Image]          │
├───────────────────────────┤
│ Scrambled Eggs            │
│ 350 kcal | P:25 C:5 F:28  │
├───────────────────────────┤
│ Składniki:                │
│                           │
│ Nabiał                    │
│ • 2 jajka (140 kcal)      │
│                           │
│ Mięso                     │
│ • 100g bekon (300 kcal)   │
│                           │
│ Tłuszcze                  │
│ • 10g masło (70 kcal)     │
├───────────────────────────┤
│ Instrukcje:               │
│ 1. Roztrzep jajka...      │
│ 2. Rozgrzej patelnię...   │
└───────────────────────────┘
```

---

### `<MealAlternativesModal />`

**Purpose:** Show alternative recipes for meal swap.

**Props:**

```typescript
interface MealAlternativesModalProps {
  currentMeal: PlannedMeal
  alternatives: Recipe[]
  onSelect: (recipeId: string) => void
  isOpen: boolean
  onClose: () => void
}
```

**Features:**

- Lists alternative recipes sorted by calorie similarity
- Shows calorie difference badge (+50 kcal / -30 kcal)
- Preview image for each alternative
- "Wybierz" button to swap

---

### `<MealPlanCalendar />`

**Purpose:** Week view of meal plan (optional future feature).

**Props:**

```typescript
interface MealPlanCalendarProps {
  startDate: Date
  meals: PlannedMeal[]
  onDateClick: (date: Date) => void
}
```

---

## 5. Shopping List Components

Located in `src/components/shopping/`.

### `<ShoppingListClient />`

**Purpose:** Main shopping list container.

**Features:**

- Fetches aggregated ingredients for next 6 days
- Groups by category (Nabiał, Mięso, Warzywa, etc.)
- Checkboxes to mark items as purchased
- Checked items move to bottom and are crossed out

---

### `<ShoppingListItem />`

**Purpose:** Single shopping list item.

**Props:**

```typescript
interface ShoppingListItemProps {
  ingredient: AggregatedIngredient
  isChecked: boolean
  onToggle: (ingredientId: string) => void
}

interface AggregatedIngredient {
  id: string
  name: string
  totalAmount: number
  unit: string
  category: string
}
```

**Design:**

```
┌────────────────────────────┐
│ [✓] Kurczak - 500g         │  ← Checked (crossed out)
│ [ ] Jajka - 10 szt.        │
│ [ ] Oliwa - 150ml          │
└────────────────────────────┘
```

---

### `<ShoppingListCategory />`

**Purpose:** Collapsible ingredient category.

**Props:**

```typescript
interface ShoppingListCategoryProps {
  category: string
  items: AggregatedIngredient[]
}
```

**Features:**

- Accordion-style collapse/expand
- Shows item count badge

---

## 6. Onboarding Components

Located in `src/components/onboarding/`.

### `<OnboardingFlow />`

**Purpose:** Multi-step onboarding wizard.

**Features:**

- Step indicator (1/5, 2/5, etc.)
- Progress bar
- "Back" and "Next" navigation
- Prevents skipping steps

**Steps:**

1. Gender selection
2. Age, weight, height inputs
3. Activity level selection
4. Goal and weight loss rate
5. Goal summary and disclaimer

---

### `<GenderStep />`

**Purpose:** Step 1 - Gender selection.

**Features:**

- Large radio buttons with icons
- Options: Mężczyzna, Kobieta

---

### `<AnthropometricsStep />`

**Purpose:** Step 2 - Age, weight, height.

**Features:**

- Numeric inputs with validation
- Unit labels (lat, kg, cm)
- Error messages for invalid ranges

---

### `<ActivityLevelStep />`

**Purpose:** Step 3 - Activity level selection.

**Features:**

- Radio group with 5 options
- Descriptions for each level
  - Very Low: Siedzący tryb życia
  - Low: Lekka aktywność 1-3 dni/tydzień
  - Moderate: Umiarkowana aktywność 3-5 dni
  - High: Intensywna aktywność 6-7 dni
  - Very High: Bardzo intensywna + praca fizyczna

---

### `<GoalStep />`

**Purpose:** Step 4 - Goal and weight loss rate.

**Features:**

- Goal radio buttons (Utrata wagi, Utrzymanie wagi)
- Weight loss rate selector (0.25, 0.5, 0.75, 1.0 kg/week)
- Disabled options that violate minimum calorie constraints
- Tooltip explaining why options are disabled

---

### `<GoalSummaryStep />`

**Purpose:** Step 5 - Calculated results and disclaimer.

**Features:**

- Displays calculated BMR, TDEE, daily calories
- Shows macro breakdown (15%C / 35%P / 50%F)
- Mandatory disclaimer acceptance checkbox
- "Rozpocznij" button disabled until checkbox checked

---

### `<StepIndicator />`

**Purpose:** Visual step progress indicator.

**Props:**

```typescript
interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}
```

**Design:**

```
Step 2 of 5
[●]━[●]━[○]━[○]━[○]
```

---

## 7. Profile Components

Located in `src/components/profile/`.

### `<ProfileSettings />`

**Purpose:** User profile editor.

**Features:**

- Edit weight
- Edit activity level
- Save button
- Confirmation dialog for plan regeneration

---

### `<ProfileForm />`

**Purpose:** Form for editing profile data.

**Props:**

```typescript
interface ProfileFormProps {
  initialData: UserProfile
  onSubmit: (data: UserProfile) => void
}
```

---

### `<ResetPlanDialog />`

**Purpose:** Confirm meal plan reset.

**Features:**

- Warning message
- "Cancel" and "Confirm" buttons
- Redirects to onboarding after confirmation

---

### `<FeedbackForm />`

**Purpose:** Submit feedback/bug reports.

**Features:**

- Textarea for message
- Automatically captures app version and OS
- Success toast after submission

---

## 8. Layout Components

Located in `src/components/layout/`.

### `<AppShell />`

**Purpose:** Main application layout wrapper.

**Features:**

- Top navigation bar
- Bottom navigation (mobile)
- Content area with max-width constraint

**Structure:**

```
┌─────────────────────────┐
│   [Logo]  [Nav Links]   │  ← Header
├─────────────────────────┤
│                         │
│   [Page Content]        │
│                         │
│                         │
├─────────────────────────┤
│ [Dashboard][Plan][Shop] │  ← Mobile bottom nav
└─────────────────────────┘
```

---

### `<Header />`

**Purpose:** Top navigation bar.

**Features:**

- Logo/brand name
- Navigation links (Dashboard, Profile)
- User avatar with dropdown menu (Settings, Logout)

---

### `<MobileBottomNav />`

**Purpose:** Mobile bottom navigation.

**Features:**

- 3 main tabs: Dashboard, Meal Plan, Shopping List
- Active tab highlighted
- Icons + labels

---

### `<Sidebar />` (Future)

**Purpose:** Desktop sidebar navigation (not yet implemented).

---

## 9. Shared Components

Located in `src/components/shared/`.

### `<LoadingSpinner />`

**Purpose:** Generic loading indicator.

**Props:**

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}
```

---

### `<ErrorMessage />`

**Purpose:** Display error messages.

**Props:**

```typescript
interface ErrorMessageProps {
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}
```

---

### `<ConfirmDialog />`

**Purpose:** Reusable confirmation dialog.

**Props:**

```typescript
interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
}
```

---

### `<Toast />`

**Purpose:** Notification toasts (via `sonner` library).

**Usage:**

```tsx
import { toast } from 'sonner'

toast.success('Posiłek oznaczony jako zjedzony!')
toast.error('Nie udało się zaktualizować planu')
toast.info('Plan został wygenerowany')
```

---

## 10. Component Patterns

### Composition Pattern

```tsx
// Bad: Monolithic component
<MealCard
  image={meal.image}
  name={meal.name}
  calories={meal.calories}
  protein={meal.protein}
  showCheckbox={true}
  showSwapButton={true}
/>

// Good: Composable components
<MealCard meal={meal}>
  <MealCard.Image />
  <MealCard.Content>
    <MealCard.Title />
    <MealCard.Macros />
  </MealCard.Content>
  <MealCard.Actions>
    <MealCard.ConsumedCheckbox />
    <MealCard.SwapButton />
  </MealCard.Actions>
</MealCard>
```

### Render Props Pattern

```tsx
<DataFetcher
  query={fetchMeals}
  render={({ data, isLoading, error }) => {
    if (isLoading) return <Spinner />
    if (error) return <ErrorMessage error={error} />
    return <MealsList meals={data} />
  }}
/>
```

### Compound Components Pattern

```tsx
<Tabs defaultValue='breakfast'>
  <Tabs.List>
    <Tabs.Trigger value='breakfast'>Śniadanie</Tabs.Trigger>
    <Tabs.Trigger value='lunch'>Obiad</Tabs.Trigger>
    <Tabs.Trigger value='dinner'>Kolacja</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value='breakfast'>
    <BreakfastRecipes />
  </Tabs.Content>
</Tabs>
```

### Custom Hooks Pattern

```tsx
// Extract complex logic into custom hooks
function useMealActions(mealId: string) {
  const queryClient = useQueryClient()

  const toggleConsumed = useMutation({
    mutationFn: (isConsumed: boolean) => toggleMealConsumed(mealId, isConsumed),
    onSuccess: () => queryClient.invalidateQueries(['meals']),
  })

  const swapMeal = useMutation({
    mutationFn: (newRecipeId: string) => swapMeal(mealId, newRecipeId),
    onSuccess: () => queryClient.invalidateQueries(['meals']),
  })

  return { toggleConsumed, swapMeal }
}

// Usage in component
function MealCard({ meal }: MealCardProps) {
  const { toggleConsumed, swapMeal } = useMealActions(meal.id)
  // ...
}
```

---

## Component Guidelines

### 1. Props Interface

Always define explicit TypeScript interfaces for props.

```typescript
// ✅ Good
interface MealCardProps {
  meal: PlannedMeal
  onToggleConsumed: (mealId: string, isConsumed: boolean) => void
}

// ❌ Bad
function MealCard({ meal, onToggleConsumed }: any) {}
```

### 2. Accessibility

- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Add ARIA labels for screen readers
- Ensure keyboard navigation works
- Test with keyboard only (Tab, Enter, Escape)

```tsx
<Checkbox
  checked={meal.isConsumed}
  aria-label={`Oznacz ${meal.recipe.name} jako zjedzony`}
/>
```

### 3. Error Boundaries

Wrap components that fetch data in error boundaries.

```tsx
<ErrorBoundary fallback={<ErrorMessage />}>
  <DashboardClient />
</ErrorBoundary>
```

### 4. Loading States

Always handle loading and error states explicitly.

```tsx
if (isLoading) return <DashboardSkeleton />
if (error) return <ErrorMessage error={error} />
return <DashboardContent data={data} />
```

### 5. Test IDs

Add `data-testid` attributes for E2E tests.

```tsx
<div data-testid='meal-card' data-meal-id={meal.id}>
  {/* content */}
</div>
```

---

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)

---

**Last Updated:** 2025-10-30
**Maintained by:** Frontend Team
