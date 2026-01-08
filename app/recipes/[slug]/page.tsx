/**
 * Strona szczegółów przepisu z SEO-friendly URL
 *
 * Wyświetla modal z przepisem na tle listy przepisów.
 * Dynamic route: /recipes/[slug]
 *
 * Obsługuje zarówno:
 * - SEO-friendly slug: /recipes/jajecznica-z-boczkiem
 * - Numeryczne ID (legacy): /recipes/123 → redirect do /recipes/[slug]
 *
 * SEO features:
 * - Canonical URL with slug
 * - OpenGraph metadata
 * - JSON-LD structured data (Recipe schema)
 */

import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { RecipeModalPage } from '@/components/recipes/RecipeModalPage'
import { RecipeJsonLd } from '@/components/seo/RecipeJsonLd'
import { getRecipeBySlug, getRecipeById } from '@/lib/actions/recipes'

interface RecipePageProps {
  params: Promise<{
    slug: string
  }>
}

/**
 * Sprawdza czy parametr to numeryczne ID
 */
function isNumericId(value: string): boolean {
  return /^\d+$/.test(value)
}

/**
 * Pobiera przepis - obsługuje zarówno slug jak i numeryczne ID
 */
async function getRecipe(slugOrId: string) {
  // Jeśli to numeryczne ID - pobierz po ID i przekieruj
  if (isNumericId(slugOrId)) {
    const recipeId = Number(slugOrId)
    if (recipeId > 0) {
      const result = await getRecipeById(recipeId)
      if (result.data?.slug) {
        // Zwróć dane z informacją o przekierowaniu
        return { data: result.data, shouldRedirect: true }
      }
    }
    return {
      error: 'Przepis nie został znaleziony',
      code: 'NOT_FOUND' as const,
    }
  }

  // W przeciwnym razie szukaj po slug
  const result = await getRecipeBySlug(slugOrId)
  return { ...result, shouldRedirect: false }
}

/**
 * Generuje dynamiczne metadata dla każdego przepisu (SEO)
 */
export async function generateMetadata({
  params: paramsPromise,
}: RecipePageProps): Promise<Metadata> {
  const params = await paramsPromise
  const slugOrId = params.slug

  // Pobierz dane przepisu
  const result = await getRecipe(slugOrId)

  if (result.error || !result.data) {
    return {
      title: 'Przepis nie znaleziony | LowCarbPlaner',
      robots: { index: false, follow: false },
    }
  }

  const recipe = result.data
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lowcarbplaner.pl'

  // Buduj opis SEO z makroskładnikami
  const macroDescription = [
    recipe.total_calories ? `${Math.round(recipe.total_calories)} kcal` : null,
    recipe.total_protein_g
      ? `${Math.round(recipe.total_protein_g)}g białka`
      : null,
    recipe.total_net_carbs_g
      ? `${Math.round(recipe.total_net_carbs_g)}g węglowodanów netto`
      : null,
    recipe.total_fats_g ? `${Math.round(recipe.total_fats_g)}g tłuszczu` : null,
  ]
    .filter(Boolean)
    .join(', ')

  const description = `Przepis niskowęglowodanowy: ${recipe.name}. ${macroDescription}. Idealny na dietę keto i low-carb.`

  return {
    title: `${recipe.name} - Przepis Keto | LowCarbPlaner`,
    description,
    keywords: [
      recipe.name,
      'przepis keto',
      'dieta low-carb',
      'przepis niskowęglowodanowy',
      ...(recipe.tags || []),
    ],
    openGraph: {
      title: `${recipe.name} - Przepis Keto`,
      description,
      type: 'article',
      url: `${siteUrl}/recipes/${recipe.slug}`,
      images: recipe.image_url
        ? [
            {
              url: recipe.image_url,
              width: 1200,
              height: 630,
              alt: recipe.name,
            },
          ]
        : [],
      siteName: 'LowCarbPlaner',
      locale: 'pl_PL',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${recipe.name} - Przepis Keto`,
      description,
      images: recipe.image_url ? [recipe.image_url] : [],
    },
    alternates: {
      canonical: `${siteUrl}/recipes/${recipe.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

/**
 * Server Component - strona szczegółów przepisu
 *
 * Wyświetla modal z przepisem na tle listy przepisów.
 * Zachowuje SEO (metadata, JSON-LD) przy bezpośrednim wejściu na URL.
 * Obsługuje przekierowanie z numerycznego ID do SEO-friendly slug.
 */
export default async function RecipePage({
  params: paramsPromise,
}: RecipePageProps) {
  const params = await paramsPromise
  const slugOrId = params.slug

  // Pobierz dane przepisu (SSR) - obsługuje zarówno slug jak i numeryczne ID
  const result = await getRecipe(slugOrId)

  // Jeśli to było numeryczne ID - przekieruj na URL ze slug (301)
  if (result.shouldRedirect && result.data?.slug) {
    redirect(`/recipes/${result.data.slug}`)
  }

  // Obsługa błędów
  if (result.error) {
    // Jeśli przepis nie znaleziony - 404
    if (result.error.includes('nie został znaleziony')) {
      notFound()
    }

    // Inny błąd - throw error (error boundary złapie)
    throw new Error(result.error)
  }

  // Sprawdź czy dane istnieją
  if (!result.data) {
    notFound()
  }

  const recipe = result.data

  return (
    <>
      {/* JSON-LD Structured Data for Google Rich Results */}
      <RecipeJsonLd recipe={recipe} />

      {/* Recipe Modal Page - wyświetla modal na tle listy przepisów */}
      <RecipeModalPage recipe={recipe} />
    </>
  )
}
