/**
 * TanStack Query hook dla listy przepisów
 *
 * Infinite query do pobierania przepisów z paginacją (load more pattern).
 * Integracja z Server Action getRecipes().
 */

'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { getRecipes } from '@/lib/actions/recipes'
import type { RecipeQueryParamsInput } from '@/lib/validation/recipes'
import type { RecipesResponse } from '@/types/recipes-view.types'

interface UseRecipesQueryOptions {
  /**
   * Parametry filtrowania i paginacji
   */
  filters: Omit<RecipeQueryParamsInput, 'offset'>

  /**
   * Czy query jest enabled (domyślnie true)
   */
  enabled?: boolean
}

/**
 * Custom hook do pobierania listy przepisów z infinite scroll
 *
 * Używa useInfiniteQuery dla pattern "Load More" - każda strona jest cached
 * osobno i może być prefetch'owana.
 *
 * @param options - Opcje query (filters, enabled)
 * @returns TanStack Query infinite query result
 *
 * @example
 * ```tsx
 * const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useRecipesQuery({
 *   filters: {
 *     meal_types: ['breakfast'],
 *     limit: 20
 *   }
 * })
 *
 * // Renderowanie wyników
 * data?.pages.flatMap(page => page.results).map(recipe => (
 *   <RecipeCard key={recipe.id} recipe={recipe} />
 * ))
 *
 * // Load more button
 * <button
 *   onClick={() => fetchNextPage()}
 *   disabled={!hasNextPage || isFetchingNextPage}
 * >
 *   Załaduj więcej
 * </button>
 * ```
 */
export function useRecipesQuery(options: UseRecipesQueryOptions) {
  const { filters, enabled = true } = options

  return useInfiniteQuery({
    queryKey: ['recipes', filters],

    queryFn: async ({ pageParam = 0 }) => {
      const result = await getRecipes({
        ...filters,
        offset: pageParam,
      })

      if (result.error || !result.data) {
        throw new Error(result.error || 'Nie udało się załadować przepisów')
      }

      return result.data
    },

    getNextPageParam: (lastPage: RecipesResponse) => {
      // Parse next URL dla offset
      if (!lastPage.next) return undefined

      try {
        // next ma format: "/recipes?limit=20&offset=20&meal_types=breakfast"
        // Musimy wyciągnąć offset
        const url = new URL(lastPage.next, 'http://dummy.com')
        const nextOffset = url.searchParams.get('offset')
        return nextOffset ? Number(nextOffset) : undefined
      } catch {
        // Jeśli parsing fails, return undefined (nie ma next page)
        return undefined
      }
    },

    initialPageParam: 0,

    enabled,

    // Dodatkowe opcje (można override przez QueryProvider defaults)
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}
