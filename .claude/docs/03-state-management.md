# Zarządzanie Stanem

## Przegląd

W projekcie używamy **dwóch systemów** zarządzania stanem:

1. **TanStack Query (React Query)** - Stan serwera (dane z API/Supabase)
2. **Zustand** - Stan klienta (UI, preferences, lokalna logika)

---

## TanStack Query (Stan Serwera)

### Konfiguracja

#### 1. Setup Client

Plik: `lib/react-query/client.ts`

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minut
      gcTime: 1000 * 60 * 30, // 30 minut (TanStack Query v5: gcTime zastępuje cacheTime)
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})
```

#### 2. Provider Setup

Plik: `app/layout.tsx`

```typescript
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/react-query/client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
```

### Podstawowe Operacje

#### Query (Fetch Data)

Plik: `lib/react-query/queries/useMealPlansQuery.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { MealPlan } from '@/types/meal-plan';

export const useMealPlansQuery = () => {
  return useQuery({
    queryKey: ['meal-plans'],
    queryFn: async (): Promise<MealPlan[]> => {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minut
  });
};

// Użycie w komponencie
export function MealPlansList() {
  const { data: mealPlans, isLoading, error } = useMealPlansQuery();

  if (isLoading) return <div>Ładowanie...</div>;
  if (error) return <div>Błąd: {error.message}</div>;

  return (
    <div>
      {mealPlans?.map((plan) => (
        <MealPlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}
```

#### Query z Parametrami

```typescript
export const useMealPlanQuery = (planId: string) => {
  return useQuery({
    queryKey: ['meal-plans', planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*, user_profile:user_profiles(*), meals:meals(*)')
        .eq('id', planId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!planId, // Query uruchomi się tylko gdy planId istnieje
  })
}
```

#### Mutation (Create/Update/Delete)

Plik: `lib/react-query/mutations/useGenerateMealPlanMutation.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';

export const useGenerateMealPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planData: InsertMealPlan) => {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert(planData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate i refetch queries
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });

      // Lub dodaj nowy plan do cache
      queryClient.setQueryData(['meal-plans', data.id], data);
    },
    onError: (error) => {
      console.error('Error generating meal plan:', error);
      // Opcjonalnie: pokaż toast notification
    },
  });
};

// Użycie
export function GenerateMealPlanForm() {
  const generatePlan = useGenerateMealPlanMutation();

  const handleSubmit = async (values: InsertMealPlan) => {
    try {
      await generatePlan.mutateAsync(values);
      // Sukces
    } catch (error) {
      // Błąd
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
      <button disabled={generatePlan.isPending}>
        {generatePlan.isPending ? 'Generowanie...' : 'Wygeneruj plan'}
      </button>
    </form>
  );
}
```

#### Query dla Progress Tracking

```typescript
export const useDailyProgressQuery = (date: string) => {
  return useQuery({
    queryKey: ['progress', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('date', date)
        .single()

      if (error && error.code !== 'PGRST116') throw error // Ignore "not found"
      return data
    },
    staleTime: 1000 * 60, // 1 minuta
  })
}
```

---

## Zustand (Stan Klienta)

### Podstawowy Store

Plik: `lib/zustand/stores/useUIStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  language: 'pl' | 'en'

  // Actions
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  setLanguage: (language: 'pl' | 'en') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      theme: 'light',
      sidebarOpen: true,
      language: 'pl',

      // Actions
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'ui-storage', // Nazwa w localStorage
    }
  )
)
```

### Store z Immer (Immutable Updates) - Progress Tracking

```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'

interface ProgressState {
  dailyProgress: {
    calories: number
    protein: number
    carbs: number
    fats: number
  }
  goals: {
    calories: number
    protein: number
    carbs: number
    fats: number
  }
  addMeal: (macros: {
    calories: number
    protein: number
    carbs: number
    fats: number
  }) => void
  resetProgress: () => void
  setGoals: (goals: ProgressState['goals']) => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    immer((set) => ({
      dailyProgress: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      },
      goals: {
        calories: 2000,
        protein: 150,
        carbs: 75,
        fats: 111,
      },

      addMeal: (macros) =>
        set((state) => {
          state.dailyProgress.calories += macros.calories
          state.dailyProgress.protein += macros.protein
          state.dailyProgress.carbs += macros.carbs
          state.dailyProgress.fats += macros.fats
        }),

      resetProgress: () =>
        set((state) => {
          state.dailyProgress = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
          }
        }),

      setGoals: (goals) =>
        set((state) => {
          state.goals = goals
        }),
    })),
    { name: 'progress-storage' }
  )
)
```

### Użycie w Komponentach

```typescript
'use client';

import { useProgressStore } from '@/lib/zustand/stores/useProgressStore';

export function ProgressBar() {
  const { dailyProgress, goals } = useProgressStore();

  const caloriePercentage = (dailyProgress.calories / goals.calories) * 100;

  return (
    <div>
      <h3>Kalorie: {dailyProgress.calories} / {goals.calories}</h3>
      <progress value={caloriePercentage} max={100} />
    </div>
  );
}
```

---

## Best Practices

### 1. Query Keys Convention

```typescript
// ✅ Hierarchiczne klucze
;['meal-plans'][('meal-plans', planId)][('meal-plans', planId, 'meals')][ // Wszystkie plany // Pojedynczy plan // Posiłki w planie
  ('progress', date)
][('user-profile', userId)][ // Postępy dla daty // Profil użytkownika
  // ❌ Płaskie klucze
  'plan-123'
]['user-data']
```

### 2. Error Handling

```typescript
const { data, error, isError } = useMealPlansQuery();

if (isError) {
  return <ErrorBoundary error={error} />;
}
```

### 3. Loading States

```typescript
const { data, isLoading, isFetching } = useMealPlansQuery();

// isLoading - pierwsza próba pobrania danych
// isFetching - refetchowanie w tle

return isLoading ? <Skeleton /> : <MealPlansList plans={data} />;
```

### 4. Zustand DevTools

```typescript
import { devtools } from 'zustand/middleware'

export const useProgressStore = create<ProgressState>()(
  devtools(
    persist(
      immer((set) => ({
        // ...
      })),
      { name: 'progress-storage' }
    ),
    { name: 'ProgressStore' }
  )
)
```

---

📚 **Więcej szczegółów:** Zobacz inne pliki w `.claude/docs/`
