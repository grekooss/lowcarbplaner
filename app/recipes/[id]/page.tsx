/**
 * Strona szczegółów przepisu
 *
 * Server Component - SSR dla szczegółów przepisu.
 * Dynamic route: /recipes/[id]
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RecipeDetailPage } from '@/components/recipes/detail/RecipeDetailPage'
import { getRecipeById } from '@/lib/actions/recipes'

interface RecipeDetailPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Generuje dynamiczne metadata dla każdego przepisu (SEO)
 */
export async function generateMetadata({
  params: paramsPromise,
}: RecipeDetailPageProps): Promise<Metadata> {
  const params = await paramsPromise
  const recipeId = Number(params.id)

  // Walidacja ID
  if (isNaN(recipeId) || recipeId <= 0) {
    return {
      title: 'Przepis nie znaleziony | LowCarbPlaner',
    }
  }

  // Pobierz dane przepisu
  const result = await getRecipeById(recipeId)

  if (result.error || !result.data) {
    return {
      title: 'Przepis nie znaleziony | LowCarbPlaner',
    }
  }

  const recipe = result.data

  return {
    title: `${recipe.name} | LowCarbPlaner`,
    description: `Przepis: ${recipe.name}. Kalorie: ${recipe.total_calories || '—'} kcal. Białko: ${recipe.total_protein_g || '—'}g, Węglowodany: ${recipe.total_carbs_g || '—'}g, Tłuszcze: ${recipe.total_fats_g || '—'}g.`,
    openGraph: {
      title: recipe.name,
      description: `Przepis niskowęglowodanowy: ${recipe.name}`,
      type: 'article',
      images: recipe.image_url ? [{ url: recipe.image_url }] : [],
    },
  }
}

/**
 * Server Component - strona szczegółów przepisu
 *
 * Pobiera pełne dane przepisu (SSR) i przekazuje do Client Component.
 */
export default async function RecipeDetailRoute({
  params: paramsPromise,
}: RecipeDetailPageProps) {
  const params = await paramsPromise
  const recipeId = Number(params.id)

  // Walidacja ID
  if (isNaN(recipeId) || recipeId <= 0) {
    notFound()
  }

  // Pobierz dane przepisu (SSR)
  const result = await getRecipeById(recipeId)

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

  return <RecipeDetailPage recipe={recipe} />
}
