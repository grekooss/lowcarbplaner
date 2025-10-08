# Wydajność

## Next.js Optimization

### 1. Image Optimization - Meal Images

```typescript
import Image from 'next/image';

// ✅ Poprawnie - zdjęcia posiłków
<Image
  src="/meals/salad.jpg"
  alt="Low-carb salad"
  width={800}
  height={600}
  priority // dla LCP images
/>

// ✅ Z remote images (storage Supabase)
<Image
  src="https://your-project.supabase.co/storage/v1/object/public/recipes/meal.jpg"
  alt="Meal photo"
  width={800}
  height={600}
  loader={({ src, width }) => `${src}?w=${width}`}
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

```bash
# Zainstaluj analyzer
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
create index matches_date_idx on public.matches(date);
create index matches_created_by_idx on public.matches(created_by);
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

export const getMatches = cache(async () => {
  const { data } = await supabase.from('matches').select('*')
  return data
})
```

### 2. Revalidate

```typescript
// app/matches/page.tsx
export const revalidate = 60; // 60 sekund

export default async function MatchesPage() {
  const matches = await getMatches();
  return <div>{/* ... */}</div>;
}
```

---

📚 **Więcej szczegółów:** Zobacz inne pliki w `.claude/docs/`
