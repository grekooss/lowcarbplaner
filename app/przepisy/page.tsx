/**
 * Strona główna przeglądarki przepisów
 *
 * Server Component - SSR dla pierwszego batcha przepisów.
 * Publiczny widok dostępny dla niezalogowanych użytkowników.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { RecipesBrowserClient } from '@/components/recipes/RecipesBrowserClient'
import { getRecipes } from '@/lib/actions/recipes'
import { recipeQueryParamsSchema } from '@/lib/validation/recipes'

interface RecipesBrowserPageProps {
  searchParams: Promise<{
    meal_types?: string
    limit?: string
    offset?: string
  }>
}

/**
 * Metadata dla SEO
 */
export const metadata: Metadata = {
  title: 'Przepisy niskowęglowodanowe | LowCarbPlaner',
  description:
    'Przeglądaj przepisy niskowęglowodanowe. Automatyczne planowanie posiłków i śledzenie makroskładników dla diety low-carb.',
  openGraph: {
    title: 'Przepisy niskowęglowodanowe | LowCarbPlaner',
    description:
      'Odkryj pyszne przepisy niskowęglowodanowe i zacznij planować swoją dietę już dziś.',
    type: 'website',
  },
}

/**
 * Server Component - strona główna przeglądarki przepisów
 *
 * Pobiera initial batch przepisów (SSR) i przekazuje do Client Component.
 */
export default async function RecipesBrowserPage({
  searchParams: searchParamsPromise,
}: RecipesBrowserPageProps) {
  // Await searchParams w Next.js 15+
  const searchParams = await searchParamsPromise

  // Przygotuj raw params dla getRecipes (input format)
  const rawParams = {
    limit: searchParams?.limit || '20',
    offset: searchParams?.offset || '0',
    meal_types: searchParams?.meal_types,
  }

  // Pobierz initial batch przepisów (SSR)
  // getRecipes sam waliduje i transformuje parametry
  const result = await getRecipes(rawParams)

  // Waliduj dla initial filters (potrzebujemy przetransformowanych danych)
  const validationResult = recipeQueryParamsSchema.safeParse(rawParams)
  const params = validationResult.success
    ? validationResult.data
    : { limit: 20, offset: 0 }

  // Obsługa błędu - pokaż error message
  if (result.error) {
    return (
      <div className='mx-auto max-w-4xl px-4 py-16 text-center'>
        <h1 className='mb-4 text-2xl font-bold'>Wystąpił błąd</h1>
        <p className='text-muted-foreground mb-8'>{result.error}</p>
        <Link
          href='/przepisy'
          className='text-primary underline hover:no-underline'
        >
          Spróbuj ponownie
        </Link>
      </div>
    )
  }

  const initialData = result.data

  // Jeśli brak danych (edge case) - pokaż fallback
  if (!initialData) {
    return (
      <div className='mx-auto max-w-4xl px-4 py-16 text-center'>
        <h1 className='mb-4 text-2xl font-bold'>Brak danych</h1>
        <p className='text-text-muted mb-8'>
          Nie udało się załadować przepisów
        </p>
        <Link
          href='/przepisy'
          className='text-primary underline hover:no-underline'
        >
          Spróbuj ponownie
        </Link>
      </div>
    )
  }

  // Parse meal_types z searchParams dla initial filters
  const initialFilters =
    'meal_types' in params && params.meal_types
      ? { meal_types: params.meal_types }
      : undefined

  return (
    <RecipesBrowserClient
      initialData={initialData}
      initialFilters={initialFilters}
    />
  )
}
