# Wydajność

## Next.js Optimization

### 1. Image Optimization - Meal Images

> **Uwaga**: Zdjęcia przepisów przechowywane są w Supabase Storage, nie lokalnie w `/public`.

```typescript
import Image from 'next/image';

// ✅ Z remote images (Supabase Storage)
<Image
  src="https://your-project.supabase.co/storage/v1/object/public/recipe-images/meal.jpg"
  alt="Meal photo"
  width={800}
  height={600}
  priority // dla LCP images
/>

// ✅ Z dynamicznym URL z bazy danych
<Image
  src={recipe.image_url || '/placeholder-meal.jpg'}
  alt={recipe.name}
  width={800}
  height={600}
  className="object-cover"
/>
```

### 2. Font Optimization

```typescript
// app/layout.tsx
import { GeistSans, GeistMono } from 'geist/font';

export default function RootLayout({ children }) {
  return (
    <html className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### 3. Code Splitting

```typescript
// ✅ Dynamic imports
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // Disable SSR if not needed
});
```

---

## Bundle Analysis

> **Uwaga**: `@next/bundle-analyzer` nie jest zainstalowany domyślnie. Zainstaluj w razie potrzeby.

```bash
# Zainstaluj analyzer (opcjonalnie)
npm install -D @next/bundle-analyzer

# Konfiguracja (next.config.js)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Uruchom analizę
ANALYZE=true npm run build
```

---

## Database Performance

### 1. Indeksy

```sql
-- Indeksy dla planned_meals
create index idx_planned_meals_user_date on public.planned_meals (user_id, meal_date);
create index idx_planned_meals_recipe on public.planned_meals (recipe_id);

-- Indeksy dla recipes (content schema)
create index idx_recipes_tags_gin on content.recipes using gin (tags);
create index idx_recipes_meal_types_gin on content.recipes using gin (meal_types);
```

### 2. Optymalizacja Zapytań - Meal Plans

```typescript
// ✅ Select tylko potrzebne kolumny
const { data } = await supabase
  .from('meal_plans')
  .select('id, user_id, created_at')
  .limit(10)

// ✅ Paginacja dla recipes
const { data } = await supabase
  .from('recipes')
  .select('id, name, calories, protein, carbs, fats')
  .range(0, 9)
```

---

## Caching Strategies

### 1. React Cache

```typescript
import { cache } from 'react'

export const getRecipes = cache(async () => {
  const { data } = await supabase.from('recipes').select('*')
  return data
})
```

### 2. Revalidate

```typescript
// app/recipes/page.tsx
export const revalidate = 60; // 60 sekund

export default async function RecipesPage() {
  const recipes = await getRecipes();
  return <div>{/* ... */}</div>;
}
```

---

📚 **Więcej szczegółów:** Zobacz inne pliki w `.claude/docs/`
