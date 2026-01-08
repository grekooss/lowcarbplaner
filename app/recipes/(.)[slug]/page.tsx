/**
 * Intercepting Route - Modal z szczegółami przepisu (SEO-friendly URL)
 *
 * Ten route przechwytuje nawigację z /recipes do /recipes/[slug]
 * i wyświetla modal zamiast pełnej strony.
 *
 * Obsługuje zarówno:
 * - SEO-friendly slug: /recipes/jajecznica-z-boczkiem
 * - Numeryczne ID (legacy): /recipes/123 → redirect do /recipes/[slug]
 *
 * Wzorzec: (.)[slug] oznacza przechwycenie na tym samym poziomie
 * - (.) oznacza bieżący poziom (/recipes)
 * - [slug] to dynamiczny segment do przechwycenia
 */

import { notFound, redirect } from 'next/navigation'
import { RecipeModal } from '@/components/recipes/RecipeModal'
import { getRecipeBySlug, getRecipeById } from '@/lib/actions/recipes'

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * Sprawdza czy parametr to numeryczne ID
 */
function isNumericId(value: string): boolean {
  return /^\d+$/.test(value)
}

/**
 * Intercepting route page - Modal z przepisem (SEO-friendly URL)
 *
 * Używa bezpośrednio Server Action zamiast fetch do API,
 * co działa poprawnie zarówno lokalnie jak i w produkcji.
 * Obsługuje przekierowanie z numerycznego ID do SEO-friendly slug.
 */
export default async function RecipeModalPage({ params }: PageProps) {
  const { slug: slugOrId } = await params

  // Walidacja
  if (!slugOrId || typeof slugOrId !== 'string') {
    notFound()
  }

  // Jeśli to numeryczne ID - pobierz przepis i przekieruj na URL ze slug
  if (isNumericId(slugOrId)) {
    const recipeId = Number(slugOrId)
    if (recipeId > 0) {
      const result = await getRecipeById(recipeId)
      if (result.data?.slug) {
        redirect(`/recipes/${result.data.slug}`)
      }
    }
    notFound()
  }

  // Pobierz dane przepisu (SSR) po slug
  const result = await getRecipeBySlug(slugOrId)

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

  return <RecipeModal recipe={result.data} />
}
