# Przykłady Kodu

## Server Components

### Fetching Data - Meal Plans

```typescript
// app/(main)/meal-plans/page.tsx
import { createClient } from '@/lib/supabase/server';
import { MealPlanCard } from '@/components/features/MealPlanCard';

export default async function MealPlansPage() {
  const supabase = createClient();

  const { data: mealPlans, error } = await supabase
    .from('meal_plans')
    .select('*, meals:meals(*, recipe:recipes(*))')
    .order('created_at', { ascending: false });

  if (error) {
    return <div>Błąd: {error.message}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mealPlans?.map((plan) => (
        <MealPlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}
```

---

## Client Components

### Interactive Form - Onboarding

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, type OnboardingInput } from '@/lib/validation/onboarding';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { calculateBMR, calculateTDEE, calculateTargetCalories } from '@/lib/utils/bmr-calculator';

export function OnboardingForm() {
  const router = useRouter();
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

  const handleSubmit = async (data: OnboardingInput) => {
    const bmr = calculateBMR(data.gender, data.weight, data.height, data.age);
    const tdee = calculateTDEE(bmr, data.activityLevel);
    const targetCalories = calculateTargetCalories(tdee, data.goal);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const response = await fetch('/api/user-profile', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <Input {...form.register('age', { valueAsNumber: true })} placeholder="Wiek" type="number" />
      <Input {...form.register('weight', { valueAsNumber: true })} placeholder="Waga (kg)" type="number" step="0.1" />
      <Input {...form.register('height', { valueAsNumber: true })} placeholder="Wzrost (cm)" type="number" />

      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Obliczanie...' : 'Oblicz i zapisz'}
      </Button>
    </form>
  );
}
```

---

## Server Actions

### Generate Meal Plan Action

```typescript
// lib/actions/meal-plans.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function generateMealPlan() {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // 1. Pobierz profil użytkownika
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'Profile not found' }
  }

  // 2. Wygeneruj plan (tu logika generowania 7-dniowego planu)
  const { data, error } = await supabase
    .from('meal_plans')
    .insert({
      user_id: user.id,
      target_calories: profile.target_calories,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // 3. Dodaj posiłki do planu (przykład)
  // await generateMealsForPlan(data.id, profile.target_calories);

  revalidatePath('/meal-plans')
  return { data }
}
```

---

## Middleware

### Auth Middleware

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Przekieruj niezalogowanych z dashboard
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Przekieruj zalogowanych z onboarding jeśli profil istnieje
  if (session && req.nextUrl.pathname === '/onboarding') {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (profile) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding', '/meal-plans/:path*'],
}
```

---

## Real-time Updates

```typescript
'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useQueryClient } from '@tanstack/react-query'

export function useProgressRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('progress-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_progress',
        },
        (payload) => {
          console.log('Progress updated:', payload)
          queryClient.invalidateQueries({ queryKey: ['progress'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
```

---

## BMR Calculator Helper

```typescript
// lib/utils/bmr-calculator.ts
export function calculateBMR(
  gender: 'male' | 'female',
  weight: number,
  height: number,
  age: number
): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161
  }
}

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

export function calculateTargetCalories(
  tdee: number,
  goal: 'lose' | 'maintain' | 'gain'
): number {
  const adjustments = {
    lose: -500,
    maintain: 0,
    gain: 300,
  }
  return Math.round(tdee + adjustments[goal])
}

export function calculateMacros(calories: number) {
  return {
    carbs: Math.round((calories * 0.15) / 4),
    protein: Math.round((calories * 0.35) / 4),
    fats: Math.round((calories * 0.5) / 9),
  }
}
```

---

## Progress Tracking Component

```typescript
'use client';

import { useProgressStore } from '@/lib/zustand/stores/useProgressStore';

export function ProgressBars() {
  const { dailyProgress, goals } = useProgressStore();

  const progressPercentages = {
    calories: (dailyProgress.calories / goals.calories) * 100,
    protein: (dailyProgress.protein / goals.protein) * 100,
    carbs: (dailyProgress.carbs / goals.carbs) * 100,
    fats: (dailyProgress.fats / goals.fats) * 100,
  };

  return (
    <div className="space-y-4">
      <ProgressBar
        label="Kalorie"
        current={dailyProgress.calories}
        target={goals.calories}
        percentage={progressPercentages.calories}
      />
      <ProgressBar
        label="Białko"
        current={dailyProgress.protein}
        target={goals.protein}
        percentage={progressPercentages.protein}
      />
      <ProgressBar
        label="Węglowodany"
        current={dailyProgress.carbs}
        target={goals.carbs}
        percentage={progressPercentages.carbs}
      />
      <ProgressBar
        label="Tłuszcze"
        current={dailyProgress.fats}
        target={goals.fats}
        percentage={progressPercentages.fats}
      />
    </div>
  );
}

function ProgressBar({ label, current, target, percentage }: {
  label: string;
  current: number;
  target: number;
  percentage: number;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-medium">{label}</span>
        <span>{current}g / {target}g</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
```

---

📚 **Więcej szczegółów:** Zobacz inne pliki w `.claude/docs/`
