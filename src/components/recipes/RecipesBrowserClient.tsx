/**
 * Client wrapper dla przeglądarki przepisów
 *
 * Główny komponent orchestrujący cały widok /recipes.
 * Zarządza stanem filtrów, paginacją, auth check i modalem rejestracji.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FeaturedRecipeCard } from './FeaturedRecipeCard'
import { RecipeFilters } from './RecipeFilters'
import { RecipesGrid } from './RecipesGrid'
import { RecipeListItem } from './RecipeListItem'
import { ViewToggle, type ViewMode } from './ViewToggle'
import { SortSelect, type SortOption } from './SortSelect'
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

  // Stan lokalny dla widoku i sortowania
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortBy, setSortBy] = useState<SortOption>('calories')

  // Hooks dla state management
  const { filters, updateMealTypes, resetFilters } = useRecipesFilter({
    initialFilters,
  })

  const {
    isOpen: isAuthModalOpen,
    redirectRecipeId,
    // openPrompt, // TYMCZASOWO WYŁĄCZONE
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

  // Sortowanie przepisów
  const sortedRecipes = [...allRecipes].sort((a, b) => {
    switch (sortBy) {
      case 'calories':
        return (b.total_calories || 0) - (a.total_calories || 0)
      case 'protein':
        return (b.total_protein_g || 0) - (a.total_protein_g || 0)
      case 'carbs':
        return (a.total_carbs_g || 0) - (b.total_carbs_g || 0)
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  // Featured recipe - pierwszy przepis z listy (lub można losowy)
  const featuredRecipe = sortedRecipes[0] || initialData.results[0]

  // Handle recipe click - TYMCZASOWO WYŁĄCZONE - zawsze nawiguj
  const handleRecipeClick = (recipeId: number) => {
    if (authLoading) return // Nie pozwól na klik podczas ładowania

    // TYMCZASOWO WYŁĄCZONE - autoryzacja
    // if (!isAuthenticated) {
    //   // Niezalogowany - otwórz modal
    //   openPrompt(recipeId)
    // } else {
    //   // Zalogowany - nawiguj do szczegółów
    //   router.push(`/recipes/${recipeId}`)
    // }

    // Zawsze nawiguj do szczegółów (bez sprawdzania auth)
    router.push(`/recipes/${recipeId}`)
  }

  // Handle Add to Meal Plan
  const handleAddToMealPlan = (recipeId: number) => {
    // TODO: Implementacja dodawania do planu posiłków
    console.log('Add to meal plan:', recipeId)
  }

  return (
    <>
      <div className='mx-auto w-full space-y-8'>
        {/* Featured Recipe */}
        {featuredRecipe && (
          <section className='w-full space-y-4'>
            <FeaturedRecipeCard
              recipe={featuredRecipe}
              onClick={handleRecipeClick}
            />
          </section>
        )}

        {/* Filters, Sort i View Toggle */}
        <section className='w-full space-y-4'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <RecipeFilters
              selectedMealTypes={filters.meal_types}
              onChange={updateMealTypes}
            />
            <div className='flex flex-wrap items-center gap-3'>
              <SortSelect value={sortBy} onChange={setSortBy} />
              <ViewToggle mode={viewMode} onChange={setViewMode} />
            </div>
          </div>
        </section>

        {/* Recipes Grid/List */}
        <section className='w-full space-y-6'>
          {isLoading && allRecipes.length === 0 ? (
            // Initial loading
            <div className='py-12 text-center'>
              <p className='text-text-muted'>Ładowanie przepisów...</p>
            </div>
          ) : isError ? (
            // Error state
            <div className='py-12 text-center'>
              <p className='text-error mb-4'>
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
              <p className='text-text-muted mb-4 text-lg'>
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
              {/* Grid lub List view */}
              {viewMode === 'grid' ? (
                <RecipesGrid
                  recipes={sortedRecipes.slice(1)}
                  onRecipeClick={handleRecipeClick}
                />
              ) : (
                <div className='w-full space-y-4'>
                  {sortedRecipes.slice(1).map((recipe) => (
                    <RecipeListItem
                      key={recipe.id}
                      recipe={recipe}
                      onClick={handleRecipeClick}
                      onAddToMealPlan={handleAddToMealPlan}
                      isAuthenticated={isAuthenticated ?? undefined}
                    />
                  ))}
                </div>
              )}

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
