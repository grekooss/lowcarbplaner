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
import type { RecipeDTO } from '@/types/dto.types'

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Pobiera szczegóły przepisu z API
 */
async function getRecipe(id: string): Promise<RecipeDTO | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  try {
    const response = await fetch(`${apiUrl}/api/recipes/${id}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching recipe:', error)
    return null
  }
}

/**
 * Intercepting route page - Modal z przepisem
 */
export default async function RecipeModalPage({ params }: PageProps) {
  const { id } = await params
  const recipe = await getRecipe(id)

  if (!recipe) {
    notFound()
  }

  return <RecipeModal recipe={recipe} />
}
