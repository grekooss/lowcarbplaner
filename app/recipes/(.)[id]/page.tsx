/**
 * Intercepting Route - Redirect ze starego URL do nowego
 *
 * Ten route przechwytuje nawigację z /recipes do /recipes/[id]
 * i przekierowuje na nowy SEO-friendly URL /przepisy/[slug]
 */

import { redirect } from 'next/navigation'
import { getRecipeById } from '@/lib/actions/recipes'

interface PageProps {
  params: Promise<{ id: string }>
}

/**
 * Intercepting route - przekierowanie na nowy URL
 *
 * Stare linki /recipes/[id] są przekierowywane na /przepisy/[slug]
 */
export default async function RecipeModalRedirectPage({ params }: PageProps) {
  const { id } = await params
  const recipeId = Number(id)

  // Walidacja ID
  if (isNaN(recipeId) || recipeId <= 0) {
    redirect('/recipes')
  }

  // Pobierz dane przepisu aby uzyskać slug
  const result = await getRecipeById(recipeId)

  // Jeśli przepis nie istnieje, wróć do listy
  if (result.error || !result.data) {
    redirect('/recipes')
  }

  // Przekieruj na nowy URL z slug
  redirect(`/przepisy/${result.data.slug}`)
}
