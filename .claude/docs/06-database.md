# Baza Danych i Migracje

## Konwencje Migracji

### Nazewnictwo Plików

```
supabase/migrations/YYYYMMDDHHmmss_krotki_opis.sql
```

**Przykłady:**

- `20250101120000_create_user_profiles.sql`
- `20250101130000_create_recipes.sql`
- `20250102100000_create_meal_plans.sql`

### Tworzenie Nowej Migracji

```bash
# Utwórz nowy plik migracji
npx supabase migration new nazwa_migracji

# Zastosuj migracje lokalnie
npx supabase db push

# Reset bazy (OSTROŻNIE!)
npx supabase db reset
```

---

## Struktura Migracji

### Kompletny Przykład: Tabela Recipes

```sql
-- ============================================
-- Tabela: recipes
-- Opis: Przechowuje przepisy na posiłki
-- ============================================

-- Tworzenie tabeli
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  calories numeric not null check (calories >= 0),
  protein numeric not null check (protein >= 0),
  carbs numeric not null check (carbs >= 0),
  fats numeric not null check (fats >= 0),
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  is_public boolean default true,
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  constraint recipes_macros_valid check (
    (protein * 4 + carbs * 4 + fats * 9) <= calories * 1.05
    and (protein * 4 + carbs * 4 + fats * 9) >= calories * 0.95
  )
);

-- Komentarze do dokumentacji
comment on table public.recipes is 'Przepisy na posiłki low-carb';
comment on column public.recipes.calories is 'Kalorie (kcal)';
comment on column public.recipes.protein is 'Białko (g)';
comment on column public.recipes.carbs is 'Węglowodany (g)';
comment on column public.recipes.fats is 'Tłuszcze (g)';

-- Indeksy dla wydajności
create index recipes_meal_type_idx on public.recipes(meal_type);
create index recipes_calories_idx on public.recipes(calories);
create index recipes_created_by_idx on public.recipes(created_by);

-- Włącz RLS
alter table public.recipes enable row level security;

-- Polityki RLS
create policy "Anyone can view public recipes"
  on public.recipes
  for select
  to authenticated, anon
  using (is_public = true or created_by = auth.uid());

-- Trigger dla updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger recipes_updated_at
  before update on public.recipes
  for each row
  execute function public.handle_updated_at();
```

---

## Relacje i Foreign Keys

### 1. One-to-Many (Meal Plan → Meals)

```sql
-- Tabela posiłków w planie
create table public.meals (
  id uuid primary key default gen_random_uuid(),
  meal_plan_id uuid references public.meal_plans(id) on delete cascade not null,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  day_number int not null check (day_number between 1 and 7),
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  created_at timestamptz default now(),

  unique(meal_plan_id, day_number, meal_type)
);

-- RLS
alter table public.meals enable row level security;

create policy "Users can view own meals"
  on public.meals for select to authenticated
  using (
    exists (
      select 1 from public.meal_plans
      where meal_plans.id = meals.meal_plan_id
        and meal_plans.user_id = auth.uid()
    )
  );
```

### 2. Zapytania z Relacjami

```typescript
// Pobierz plan posiłków ze wszystkimi przepisami
const { data } = await supabase
  .from('meal_plans')
  .select(
    `
    *,
    user_profile:user_profiles(id, target_calories),
    meals:meals(
      id,
      day_number,
      meal_type,
      recipe:recipes(name, calories, protein, carbs, fats)
    )
  `
  )
  .eq('id', planId)
  .single()
```

---

## Typy TypeScript z Supabase

### Generowanie Typów

```bash
# Generuj typy z bazy danych
npx supabase gen types typescript --local > types/database.types.ts
```

### Użycie Typów

```typescript
// types/database.types.ts (auto-generated)
export type Database = {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string
          name: string
          calories: number
          // ...
        }
        Insert: {
          id?: string
          name: string
          calories: number
          // ...
        }
        Update: {
          id?: string
          name?: string
          calories?: number
          // ...
        }
      }
      meal_plans: {
        Row: {
          id: string
          user_id: string
          created_at: string
          // ...
        }
        // ...
      }
    }
  }
}

// lib/supabase/client.ts
import type { Database } from '@/types/database.types'

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Teraz masz type-safety!
const { data } = await supabase
  .from('recipes') // autocomplete
  .select('*') // type-safe columns
```

---

## Real-time Subscriptions

### 1. Włączenie Realtime dla Tabeli

```sql
-- Włącz realtime dla tabeli
alter publication supabase_realtime add table public.daily_progress;
```

### 2. Subskrypcja Zmian

```typescript
'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export function useProgressRealtime(userId: string, date: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('progress-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // 'INSERT' | 'UPDATE' | 'DELETE'
          schema: 'public',
          table: 'daily_progress',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Progress changed:', payload);

          // Invalidate queries
          queryClient.invalidateQueries({ queryKey: ['progress', date] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId, date]);
}

// Użycie w komponencie
export function DailyView() {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  useProgressRealtime(user.id, today); // Auto-refresh on changes
  const { data: progress } = useProgressQuery(today);

  return <div>{/* ... */}</div>;
}
```

---

## Storage (Pliki)

### 1. Tworzenie Bucketa dla Zdjęć Posiłków

```sql
-- Utwórz bucket dla zdjęć przepisów
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true);

-- Polityki dla storage
create policy "Anyone can view recipe images"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

create policy "Authenticated users can upload recipe images"
  on storage.objects for insert
  with check (
    bucket_id = 'recipe-images'
    and auth.role() = 'authenticated'
  );

create policy "Users can update their own recipe images"
  on storage.objects for update
  using (
    bucket_id = 'recipe-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 2. Upload Pliku

```typescript
// lib/utils/storage.ts
export async function uploadRecipeImage(file: File, recipeId: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `recipes/${recipeId}.${fileExt}`

  const { error } = await supabase.storage
    .from('recipe-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from('recipe-images').getPublicUrl(fileName)

  return publicUrl
}
```

---

## Query Optimization

### 1. Indeksy

```sql
-- Dodaj indeksy dla często używanych kolumn
create index recipes_meal_type_idx on public.recipes(meal_type);
create index recipes_calories_idx on public.recipes(calories);

-- Composite index
create index recipes_meal_type_calories_idx
  on public.recipes(meal_type, calories);

-- Partial index (tylko low-carb recipes)
create index recipes_low_carb_idx
  on public.recipes(carbs)
  where carbs <= 15;

-- Index dla meal plans
create index meal_plans_user_date_idx
  on public.meal_plans(user_id, start_date);

-- Index dla daily progress
create index daily_progress_user_date_idx
  on public.daily_progress(user_id, date);
```

### 2. Optymalizacja Zapytań

```typescript
// ✅ Wybierz tylko potrzebne kolumny
const { data } = await supabase
  .from('recipes')
  .select('id, name, calories, protein, carbs, fats') // Nie używaj '*'
  .eq('meal_type', 'breakfast')
  .limit(10)

// ✅ Paginacja
const { data } = await supabase
  .from('recipes')
  .select('*')
  .range(0, 9) // 0-9 = pierwsze 10
  .order('calories', { ascending: true })

// ❌ Unikaj N+1 queries
// Zamiast:
for (const meal of meals) {
  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', meal.recipe_id)
}

// ✅ Użyj relacji:
const { data } = await supabase.from('meals').select('*, recipe:recipes(*)')
```

---

## Database Functions

### 1. Custom Function (Generuj Plan Posiłków)

```sql
create or replace function generate_meal_plan(
  p_user_id uuid,
  p_target_calories numeric,
  p_start_date date
)
returns json as $$
declare
  v_meal_plan_id uuid;
  v_day int;
  v_meal_type text;
  v_target_calories_per_meal numeric;
  v_recipe record;
begin
  -- Utwórz nowy plan posiłków
  insert into meal_plans (user_id, start_date, target_calories)
  values (p_user_id, p_start_date, p_target_calories)
  returning id into v_meal_plan_id;

  -- Kalorie na posiłek (dzielimy na 3 posiłki)
  v_target_calories_per_meal := p_target_calories / 3;

  -- Dla każdego dnia (1-7)
  for v_day in 1..7 loop
    -- Dla każdego typu posiłku
    foreach v_meal_type in array array['breakfast', 'lunch', 'dinner'] loop
      -- Znajdź losowy przepis w odpowiednim zakresie kalorii (±15%)
      select * into v_recipe
      from recipes
      where meal_type = v_meal_type
        and calories between (v_target_calories_per_meal * 0.85)
        and (v_target_calories_per_meal * 1.15)
        and is_public = true
      order by random()
      limit 1;

      -- Dodaj posiłek do planu
      if v_recipe.id is not null then
        insert into meals (meal_plan_id, recipe_id, day_number, meal_type)
        values (v_meal_plan_id, v_recipe.id, v_day, v_meal_type);
      end if;
    end loop;
  end loop;

  return json_build_object(
    'success', true,
    'meal_plan_id', v_meal_plan_id
  );
end;
$$ language plpgsql security definer;
```

```typescript
// Wywołanie z TypeScript
const { data, error } = await supabase.rpc('generate_meal_plan', {
  p_user_id: user.id,
  p_target_calories: 2000,
  p_start_date: new Date().toISOString().split('T')[0],
})
```

---

## Seed Data (Opcjonalnie)

```sql
-- supabase/seed.sql
-- Dane testowe dla development

-- Wstaw użytkownika testowego
insert into auth.users (id, email)
values
  ('11111111-1111-1111-1111-111111111111', 'test@example.com')
on conflict (id) do nothing;

-- Wstaw profil użytkownika
insert into public.user_profiles (user_id, gender, age, weight, height, target_calories)
values
  ('11111111-1111-1111-1111-111111111111', 'male', 30, 80, 180, 2000)
on conflict (user_id) do nothing;

-- Wstaw przykładowe przepisy
insert into public.recipes (name, description, calories, protein, carbs, fats, meal_type, is_public)
values
  ('Jajecznica z awokado', 'Pyszne śniadanie low-carb', 350, 18, 8, 28, 'breakfast', true),
  ('Grillowany kurczak z warzywami', 'Zdrowy obiad', 450, 45, 15, 22, 'lunch', true),
  ('Stek z sałatką', 'Kolacja bogata w białko', 500, 50, 10, 30, 'dinner', true)
on conflict do nothing;
```

```bash
# Załaduj seed data
npx supabase db reset
```

---

📚 **Więcej szczegółów:** Zobacz inne pliki w `.claude/docs/`
