/**
 * Redirect ze starego URL /recipes/[id] do nowego SEO-friendly /przepisy/[slug]
 *
 * Ten route istnieje tylko dla zachowania kompatybilności wstecznej.
 * Przekierowuje trwale (301) na nowy URL z slug.
 */

import { redirect } from 'next/navigation'
import { getRecipeById } from '@/lib/actions/recipes'

interface RecipeDetailPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Przekierowanie ze starego URL do nowego SEO-friendly URL
 *
 * - /recipes/123 → /przepisy/jajecznica-z-boczkiem
 * - Używa trwałego przekierowania (301) dla SEO
 */
export default async function RecipeRedirectPage({
  params: paramsPromise,
}: RecipeDetailPageProps) {
  const params = await paramsPromise
  const recipeId = Number(params.id)

  // Walidacja ID
  if (isNaN(recipeId) || recipeId <= 0) {
    // Przekieruj na listę przepisów jeśli ID nieprawidłowe
    redirect('/przepisy')
  }

  // Pobierz dane przepisu aby uzyskać slug
  const result = await getRecipeById(recipeId)

  // Jeśli przepis nie istnieje, przekieruj na listę
  if (result.error || !result.data) {
    redirect('/przepisy')
  }

  // Przekieruj na nowy URL z slug (301 - trwałe przekierowanie)
  redirect(`/przepisy/${result.data.slug}`)
}
