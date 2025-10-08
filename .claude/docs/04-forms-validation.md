# Formularze i Walidacja

## React Hook Form + Zod

### Podstawowa Konfiguracja

#### 1. Schema Zod - Onboarding

Plik: `lib/validation/onboarding.ts`

```typescript
import { z } from 'zod'

export const onboardingSchema = z
  .object({
    gender: z.enum(['male', 'female'], {
      required_error: 'Płeć jest wymagana',
    }),

    age: z
      .number({ invalid_type_error: 'Wiek musi być liczbą' })
      .int('Wiek musi być liczbą całkowitą')
      .min(18, 'Minimalny wiek to 18 lat')
      .max(120, 'Maksymalny wiek to 120 lat'),

    weight: z
      .number({ invalid_type_error: 'Waga musi być liczbą' })
      .min(30, 'Minimalna waga to 30 kg')
      .max(300, 'Maksymalna waga to 300 kg'),

    height: z
      .number({ invalid_type_error: 'Wzrost musi być liczbą' })
      .int('Wzrost musi być liczbą całkowitą')
      .min(120, 'Minimalny wzrost to 120 cm')
      .max(250, 'Maksymalny wzrost to 250 cm'),

    activityLevel: z.enum(
      ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      {
        required_error: 'Poziom aktywności jest wymagany',
      }
    ),

    goal: z.enum(['lose', 'maintain', 'gain'], {
      required_error: 'Cel jest wymagany',
    }),
  })
  .refine(
    (data) => {
      // Oblicz BMR i TDEE
      const bmr = calculateBMR(data.gender, data.weight, data.height, data.age)
      const tdee = calculateTDEE(bmr, data.activityLevel)
      const targetCalories = calculateTargetCalories(tdee, data.goal)

      // Walidacja minimum kalorii
      const minCalories = data.gender === 'male' ? 1600 : 1400
      return targetCalories >= minCalories
    },
    {
      message: 'Obliczone kalorie są poniżej bezpiecznego minimum',
      path: ['goal'],
    }
  )

export type OnboardingInput = z.infer<typeof onboardingSchema>
```

#### 2. Funkcje Kalkulacyjne

Plik: `lib/utils/bmr-calculator.ts`

```typescript
// Mifflin-St Jeor Equation
export function calculateBMR(
  gender: 'male' | 'female',
  weight: number, // kg
  height: number, // cm
  age: number
): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

// TDEE (Total Daily Energy Expenditure)
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }

  return Math.round(
    bmr * multipliers[activityLevel as keyof typeof multipliers]
  )
}

// Target Calories based on goal
export function calculateTargetCalories(
  tdee: number,
  goal: 'lose' | 'maintain' | 'gain'
): number {
  const adjustments = {
    lose: -500, // Deficyt 500 kcal
    maintain: 0,
    gain: 300, // Nadwyżka 300 kcal
  }

  return Math.round(tdee + adjustments[goal])
}

// Makroskładniki (15% carbs, 35% protein, 50% fats)
export function calculateMacros(calories: number) {
  return {
    carbs: Math.round((calories * 0.15) / 4), // g (4 kcal/g)
    protein: Math.round((calories * 0.35) / 4), // g (4 kcal/g)
    fats: Math.round((calories * 0.5) / 9), // g (9 kcal/g)
  }
}
```

#### 3. Formularz Onboardingowy

Plik: `components/forms/OnboardingForm.tsx`

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, type OnboardingInput } from '@/lib/validation/onboarding';
import { calculateBMR, calculateTDEE, calculateTargetCalories, calculateMacros } from '@/lib/utils/bmr-calculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export function OnboardingForm() {
  const form = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      gender: 'male',
      age: 30,
      weight: 80,
      height: 175,
      activityLevel: 'moderate',
      goal: 'maintain',
    },
  });

  const onSubmit = async (data: OnboardingInput) => {
    const bmr = calculateBMR(data.gender, data.weight, data.height, data.age);
    const tdee = calculateTDEE(bmr, data.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, data.goal);
    const macros = calculateMacros(targetCalories);

    console.log({
      bmr,
      tdee,
      targetCalories,
      macros,
    });

    // Zapisz do bazy danych
    // await createUserProfile({ ...data, bmr, tdee, targetCalories, macros });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Płeć */}
      <div>
        <label>Płeć</label>
        <Select
          value={form.watch('gender')}
          onValueChange={(value) => form.setValue('gender', value as 'male' | 'female')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Wybierz płeć" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Mężczyzna</SelectItem>
            <SelectItem value="female">Kobieta</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.gender && (
          <p className="text-sm text-destructive">{form.formState.errors.gender.message}</p>
        )}
      </div>

      {/* Wiek */}
      <div>
        <label htmlFor="age">Wiek (lata)</label>
        <Input
          id="age"
          type="number"
          {...form.register('age', { valueAsNumber: true })}
          placeholder="30"
        />
        {form.formState.errors.age && (
          <p className="text-sm text-destructive">{form.formState.errors.age.message}</p>
        )}
      </div>

      {/* Waga */}
      <div>
        <label htmlFor="weight">Waga (kg)</label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          {...form.register('weight', { valueAsNumber: true })}
          placeholder="80"
        />
        {form.formState.errors.weight && (
          <p className="text-sm text-destructive">{form.formState.errors.weight.message}</p>
        )}
      </div>

      {/* Wzrost */}
      <div>
        <label htmlFor="height">Wzrost (cm)</label>
        <Input
          id="height"
          type="number"
          {...form.register('height', { valueAsNumber: true })}
          placeholder="175"
        />
        {form.formState.errors.height && (
          <p className="text-sm text-destructive">{form.formState.errors.height.message}</p>
        )}
      </div>

      {/* Poziom aktywności */}
      <div>
        <label>Poziom aktywności</label>
        <Select
          value={form.watch('activityLevel')}
          onValueChange={(value) => form.setValue('activityLevel', value as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Wybierz poziom aktywności" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sedentary">Siedzący (brak ćwiczeń)</SelectItem>
            <SelectItem value="light">Lekko aktywny (1-3 dni/tydzień)</SelectItem>
            <SelectItem value="moderate">Umiarkowanie aktywny (3-5 dni/tydzień)</SelectItem>
            <SelectItem value="active">Aktywny (6-7 dni/tydzień)</SelectItem>
            <SelectItem value="very_active">Bardzo aktywny (codziennie intensywnie)</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.activityLevel && (
          <p className="text-sm text-destructive">{form.formState.errors.activityLevel.message}</p>
        )}
      </div>

      {/* Cel */}
      <div>
        <label>Cel</label>
        <Select
          value={form.watch('goal')}
          onValueChange={(value) => form.setValue('goal', value as 'lose' | 'maintain' | 'gain')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Wybierz cel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lose">Utrata wagi</SelectItem>
            <SelectItem value="maintain">Utrzymanie wagi</SelectItem>
            <SelectItem value="gain">Przyrost wagi</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.goal && (
          <p className="text-sm text-destructive">{form.formState.errors.goal.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Obliczanie...' : 'Oblicz i zapisz'}
      </Button>
    </form>
  );
}
```

---

## Walidacja na Serwerze

### Server Action z Walidacją

Plik: `lib/actions/user-profile.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { onboardingSchema } from '@/lib/validation/onboarding'
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
} from '@/lib/utils/bmr-calculator'
import { revalidatePath } from 'next/cache'

export async function createUserProfile(formData: FormData) {
  const supabase = createClient()

  // 1. Sprawdź autentykację
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // 2. Parsuj i waliduj dane
  const rawData = {
    gender: formData.get('gender'),
    age: Number(formData.get('age')),
    weight: Number(formData.get('weight')),
    height: Number(formData.get('height')),
    activityLevel: formData.get('activityLevel'),
    goal: formData.get('goal'),
  }

  const validated = onboardingSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      error: 'Validation failed',
      issues: validated.error.issues,
    }
  }

  // 3. Oblicz BMR, TDEE, target calories, macros
  const bmr = calculateBMR(
    validated.data.gender,
    validated.data.weight,
    validated.data.height,
    validated.data.age
  )
  const tdee = calculateTDEE(bmr, validated.data.activityLevel)
  const targetCalories = calculateTargetCalories(tdee, validated.data.goal)
  const macros = calculateMacros(targetCalories)

  // 4. Zapisz do bazy danych
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: user.id,
      ...validated.data,
      bmr,
      tdee,
      target_calories: targetCalories,
      target_protein: macros.protein,
      target_carbs: macros.carbs,
      target_fats: macros.fats,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // 5. Revalidate cache
  revalidatePath('/dashboard')

  return { data }
}
```

---

## Custom Validation Rules

### 1. Meal Swap Validation (+/- 15% kalorii)

```typescript
export const mealSwapSchema = z
  .object({
    originalMealId: z.string().uuid(),
    newMealId: z.string().uuid(),
  })
  .refine(
    async (data) => {
      const originalMeal = await getMealById(data.originalMealId)
      const newMeal = await getMealById(data.newMealId)

      if (!originalMeal || !newMeal) return false

      const caloriesDiff = Math.abs(newMeal.calories - originalMeal.calories)
      const allowedDiff = originalMeal.calories * 0.15

      return caloriesDiff <= allowedDiff
    },
    {
      message: 'Nowy posiłek różni się o więcej niż 15% kalorii',
    }
  )
```

### 2. Ingredient Scaling (+/- 10%)

```typescript
export const scaleIngredientSchema = z.object({
  ingredientId: z.string().uuid(),
  scaleFactor: z
    .number()
    .min(0.9, 'Minimalne skalowanie to -10%')
    .max(1.1, 'Maksymalne skalowanie to +10%'),
})
```

### 3. Shopping List Validation

```typescript
export const shoppingListSchema = z.object({
  mealPlanId: z.string().uuid('Nieprawidłowy ID planu posiłków'),

  items: z
    .array(
      z.object({
        ingredientId: z.string().uuid(),
        name: z.string().min(1, 'Nazwa składnika jest wymagana'),
        quantity: z.number().positive('Ilość musi być dodatnia'),
        unit: z.string().min(1, 'Jednostka jest wymagana'),
        category: z
          .enum(['vegetables', 'meat', 'dairy', 'grains', 'other'])
          .optional(),
      })
    )
    .min(1, 'Lista zakupów musi zawierać przynajmniej 1 składnik'),
})
```

---

## Error Handling

### 1. Display Errors

```typescript
// Pojedynczy błąd
{form.formState.errors.age && (
  <p className="text-sm text-destructive">
    {form.formState.errors.age.message}
  </p>
)}

// Wszystkie błędy
{Object.keys(form.formState.errors).length > 0 && (
  <div className="bg-destructive/10 p-4 rounded">
    <h3>Popraw następujące błędy:</h3>
    <ul>
      {Object.entries(form.formState.errors).map(([field, error]) => (
        <li key={field}>
          {field}: {error.message}
        </li>
      ))}
    </ul>
  </div>
)}
```

### 2. Toast Notifications

```typescript
import { toast } from 'sonner'

const onSubmit = async (data: OnboardingInput) => {
  try {
    await createUserProfile(data)
    toast.success('Profil został utworzony!')
  } catch (error) {
    toast.error('Wystąpił błąd podczas tworzenia profilu')
  }
}
```

---

## Best Practices

### 1. Reusable Schemas

```typescript
// lib/validation/common.ts
export const emailSchema = z.string().email('Nieprawidłowy email')
export const passwordSchema = z
  .string()
  .min(8, 'Minimum 8 znaków')
  .regex(/[A-Z]/, 'Minimum 1 wielka litera')
  .regex(/[0-9]/, 'Minimum 1 cyfra')

// Użycie
import { emailSchema, passwordSchema } from '@/lib/validation/common'

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})
```

### 2. Type-Safe Forms

```typescript
// ✅ Type-safe
type OnboardingInput = z.infer<typeof onboardingSchema>;
const form = useForm<OnboardingInput>({ ... });

// ❌ Nie type-safe
const form = useForm({ ... });
```

### 3. Reset Form po Submit

```typescript
const onSubmit = async (data: OnboardingInput) => {
  await createUserProfile(data)
  form.reset() // Reset formularza
}
```

### 4. Disable Submit During Loading

```typescript
<Button
  type="submit"
  disabled={form.formState.isSubmitting}
>
  {form.formState.isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
</Button>
```

---

📚 **Więcej szczegółów:** Zobacz inne pliki w `.claude/docs/`
