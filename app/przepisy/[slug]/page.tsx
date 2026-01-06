/**
 * Strona szczegółów przepisu z SEO-friendly URL
 *
 * Server Component - SSR dla szczegółów przepisu.
 * Dynamic route: /przepisy/[slug]
 *
 * SEO features:
 * - Canonical URL with slug
 * - OpenGraph metadata
 * - JSON-LD structured data (Recipe schema)
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RecipeDetailPage } from '@/components/recipes/detail/RecipeDetailPage'
import { RecipeJsonLd } from '@/components/seo/RecipeJsonLd'
import { getRecipeBySlug } from '@/lib/actions/recipes'

interface RecipePageProps {
  params: Promise<{
    slug: string
  }>
}

/**
 * Generuje dynamiczne metadata dla każdego przepisu (SEO)
 */
export async function generateMetadata({
  params: paramsPromise,
}: RecipePageProps): Promise<Metadata> {
  const params = await paramsPromise
  const slug = params.slug

  // Pobierz dane przepisu
  const result = await getRecipeBySlug(slug)

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
      url: `${siteUrl}/przepisy/${recipe.slug}`,
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
      canonical: `${siteUrl}/przepisy/${recipe.slug}`,
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
 * Pobiera pełne dane przepisu (SSR) i przekazuje do Client Component.
 */
export default async function RecipePage({
  params: paramsPromise,
}: RecipePageProps) {
  const params = await paramsPromise
  const slug = params.slug

  // Pobierz dane przepisu (SSR)
  const result = await getRecipeBySlug(slug)

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

      {/* Recipe Detail Page */}
      <RecipeDetailPage recipe={recipe} />
    </>
  )
}
