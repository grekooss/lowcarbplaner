/**
 * Intercepting Route - Modal z szczegółami przepisu
 *
 * Ten route przechwytuje nawigację z /recipes do /recipes/[id]
 * i wyświetla modal zamiast pełnej strony.
 *
 * Wzorzec: (.)[id] oznacza przechwycenie na tym samym poziomie
 */

import { notFound } from 'next/navigation'
import { RecipeModal } from '@/components/recipes/RecipeModal'
import { getRecipeById } from '@/lib/actions/recipes'

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Intercepting route page - Modal z przepisem
 *
 * Używa bezpośrednio Server Action zamiast fetch do API,
 * co działa poprawnie zarówno lokalnie jak i w produkcji.
 */
export default async function RecipeModalPage({ params }: PageProps) {
  const { id } = await params
  const recipeId = Number(id)

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

  return <RecipeModal recipe={result.data} />
}
