/**
 * Client wrapper dla przeglądarki przepisów
 *
 * Główny komponent orchestrujący cały widok /przepisy.
 * Zarządza stanem filtrów, paginacją, auth check i modalem rejestracji.
 */

'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FeaturedRecipeCard } from './FeaturedRecipeCard'
import { RecipeFilters } from './RecipeFilters'
import { RecipesGrid } from './RecipesGrid'
import { LoadMoreButton } from './LoadMoreButton'
import { AuthPromptModal } from './AuthPromptModal'
import { useRecipesFilter } from '@/lib/hooks/useRecipesFilter'
import { useAuthPrompt } from '@/lib/hooks/useAuthPrompt'
import { useAuthCheck } from '@/lib/hooks/useAuthCheck'
import { useRecipesQuery } from '@/lib/react-query/queries/useRecipesQuery'
import type { RecipesResponse } from '@/types/recipes-view.types'

interface RecipesBrowserClientProps {
  initialData: RecipesResponse
  initialFilters?: {
    meal_types?: string[]
  }
}

/**
 * Client wrapper dla przeglądarki przepisów
 *
 * @example
 * ```tsx
 * // W Server Component (page.tsx)
 * const initialData = await getRecipes({ limit: 20, offset: 0 })
 *
 * <RecipesBrowserClient
 *   initialData={initialData}
 *   initialFilters={{ meal_types: ['breakfast'] }}
 * />
 * ```
 */
export function RecipesBrowserClient({
  initialData,
  initialFilters,
}: RecipesBrowserClientProps) {
  const router = useRouter()

  // Hooks dla state management
  const { filters, updateMealTypes, resetFilters } = useRecipesFilter({
    initialFilters,
  })

  const {
    isOpen: isAuthModalOpen,
    redirectRecipeId,
    openPrompt,
    closePrompt,
  } = useAuthPrompt()

  const { isAuthenticated, isLoading: authLoading } = useAuthCheck()

  // Infinite query dla przepisów
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useRecipesQuery({
    filters: {
      meal_types: filters.meal_types.join(','),
      limit: filters.limit,
    },
  })

  // Flatten wszystkie pages do jednej listy
  const allRecipes = data?.pages.flatMap((page) => page.results) || []

  // Featured recipe - pierwszy przepis z listy (lub można losowy)
  const featuredRecipe = allRecipes[0] || initialData.results[0]

  // Handle recipe click - sprawdź auth i pokaż modal lub navigate
  const handleRecipeClick = (recipeId: number) => {
    if (authLoading) return // Nie pozwól na klik podczas ładowania

    if (!isAuthenticated) {
      // Niezalogowany - otwórz modal
      openPrompt(recipeId)
    } else {
      // Zalogowany - nawiguj do szczegółów
      router.push(`/przepisy/${recipeId}`)
    }
  }

  // Handle signup CTA
  const handleSignup = () => {
    router.push('/signup')
  }

  return (
    <>
      <div className='mx-auto max-w-7xl space-y-12 px-4 py-8 md:px-6 lg:px-8'>
        {/* Header Section */}
        <div className='space-y-4 text-center'>
          <h1 className='text-4xl font-bold tracking-tight md:text-5xl'>
            Przeglądaj przepisy
          </h1>
          <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
            Odkryj pyszne przepisy niskowęglowodanowe. Zarejestruj się, aby
            automatycznie planować swoje posiłki i śledzić makroskładniki.
          </p>
          <Button size='lg' onClick={handleSignup}>
            Rozpocznij dietę
          </Button>
        </div>

        {/* Featured Recipe */}
        {featuredRecipe && (
          <section className='space-y-4'>
            <h2 className='text-2xl font-semibold'>Polecany przepis</h2>
            <FeaturedRecipeCard
              recipe={featuredRecipe}
              onClick={handleRecipeClick}
            />
          </section>
        )}

        {/* Filters */}
        <section className='space-y-4'>
          <h2 className='text-2xl font-semibold'>Wszystkie przepisy</h2>
          <RecipeFilters
            selectedMealTypes={filters.meal_types}
            onChange={updateMealTypes}
          />
        </section>

        {/* Recipes Grid */}
        <section className='space-y-6'>
          {isLoading && allRecipes.length === 0 ? (
            // Initial loading
            <div className='py-12 text-center'>
              <p className='text-muted-foreground'>Ładowanie przepisów...</p>
            </div>
          ) : isError ? (
            // Error state
            <div className='py-12 text-center'>
              <p className='mb-4 text-red-500'>
                Wystąpił błąd:{' '}
                {error?.message || 'Nie udało się załadować przepisów'}
              </p>
              <Button
                variant='outline'
                onClick={() => window.location.reload()}
              >
                Spróbuj ponownie
              </Button>
            </div>
          ) : allRecipes.length === 0 ? (
            // Empty state
            <div className='py-12 text-center'>
              <p className='text-muted-foreground mb-4 text-lg'>
                Brak przepisów spełniających kryteria
              </p>
              {filters.meal_types.length > 0 && (
                <Button variant='outline' onClick={resetFilters}>
                  Wyczyść filtry
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Grid z przepisami (bez featured - skip pierwszy) */}
              <RecipesGrid
                recipes={allRecipes.slice(1)}
                onRecipeClick={handleRecipeClick}
              />

              {/* Load More Button */}
              <LoadMoreButton
                hasMore={!!hasNextPage}
                isLoading={isFetchingNextPage}
                onLoadMore={() => fetchNextPage()}
              />
            </>
          )}
        </section>
      </div>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onOpenChange={(open) => !open && closePrompt()}
        redirectRecipeId={redirectRecipeId}
      />
    </>
  )
}
