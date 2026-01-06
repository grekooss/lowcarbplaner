/**
 * Intercepting Route - Modal z szczegółami przepisu (SEO-friendly URL)
 *
 * Ten route przechwytuje nawigację z /recipes do /przepisy/[slug]
 * i wyświetla modal zamiast pełnej strony.
 *
 * Wzorzec: (..)przepisy/[slug] oznacza przechwycenie na poziomie rodzica
 * - (..) przechodzi poziom wyżej (z /recipes do /)
 * - przepisy/[slug] to ścieżka do przechwycenia
 */

import { notFound } from 'next/navigation'
import { RecipeModal } from '@/components/recipes/RecipeModal'
import { getRecipeBySlug } from '@/lib/actions/recipes'

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * Intercepting route page - Modal z przepisem (SEO-friendly URL)
 *
 * Używa bezpośrednio Server Action zamiast fetch do API,
 * co działa poprawnie zarówno lokalnie jak i w produkcji.
 */
export default async function RecipeModalPage({ params }: PageProps) {
  const { slug } = await params

  // Walidacja slug
  if (!slug || typeof slug !== 'string') {
    notFound()
  }

  // Pobierz dane przepisu (SSR) po slug
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

  return <RecipeModal recipe={result.data} />
}
