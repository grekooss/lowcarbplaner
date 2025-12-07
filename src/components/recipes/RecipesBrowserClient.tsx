/**
 * Client wrapper dla przeglądarki przepisów
 *
 * Główny komponent orchestrujący cały widok /recipes.
 * Zarządza stanem filtrów, paginacją, auth check i modalem rejestracji.
 */

'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeaturedRecipeCard } from './FeaturedRecipeCard'
import { RecipeFilters } from './RecipeFilters'
import { RecipesGrid } from './RecipesGrid'
import { RecipeListItem } from './RecipeListItem'
import { RecipeAdPlaceholder } from './RecipeAdPlaceholder'
import { ViewToggle, type ViewMode } from './ViewToggle'
import { SortSelect, type SortOption, type SortDirection } from './SortSelect'
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
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

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
    isFetching,
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
    const multiplier = sortDirection === 'asc' ? 1 : -1

    switch (sortBy) {
      case 'calories':
        return ((a.total_calories || 0) - (b.total_calories || 0)) * multiplier
      case 'protein':
        return (
          ((a.total_protein_g || 0) - (b.total_protein_g || 0)) * multiplier
        )
      case 'carbs':
        return ((a.total_carbs_g || 0) - (b.total_carbs_g || 0)) * multiplier
      case 'fats':
        return ((a.total_fats_g || 0) - (b.total_fats_g || 0)) * multiplier
      case 'name':
        return a.name.localeCompare(b.name) * multiplier
      default:
        return 0
    }
  })

  // Losowy indeks dla featured recipe - losowany raz przy renderze (używamy initialData)
  const [featuredRandomId] = useState(() => {
    const recipes = initialData.results
    if (recipes.length === 0) return null
    const randomIndex = Math.floor(Math.random() * recipes.length)
    const recipe = recipes[randomIndex]
    return recipe?.id ?? null
  })

  // Featured recipe - znajdź przepis po ID w aktualnej liście
  const featuredRecipe = useMemo(() => {
    if (!featuredRandomId) return sortedRecipes[0] || null
    return (
      sortedRecipes.find((r) => r.id === featuredRandomId) ||
      sortedRecipes[0] ||
      null
    )
  }, [sortedRecipes, featuredRandomId])

  // Przepisy do wyświetlenia w siatce (bez featured)
  const recipesForGrid = useMemo(() => {
    if (!featuredRecipe) return sortedRecipes
    return sortedRecipes.filter((r) => r.id !== featuredRecipe.id)
  }, [sortedRecipes, featuredRecipe])

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
      <main className='w-full space-y-6'>
        {/* Featured Recipe */}
        {featuredRecipe && (
          <section className='w-full'>
            <FeaturedRecipeCard
              recipe={featuredRecipe}
              onClick={handleRecipeClick}
            />
          </section>
        )}

        {/* Filters, Sort i View Toggle */}
        <section className='w-full'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <RecipeFilters
              selectedMealTypes={filters.meal_types}
              onChange={updateMealTypes}
            />
            <div className='flex flex-wrap items-center gap-3'>
              <SortSelect
                value={sortBy}
                direction={sortDirection}
                onChange={setSortBy}
                onDirectionChange={setSortDirection}
              />
              <ViewToggle mode={viewMode} onChange={setViewMode} />
            </div>
          </div>
        </section>

        {/* Recipes Grid/List */}
        <section className='w-full space-y-6'>
          {isLoading || (isFetching && !isFetchingNextPage) ? (
            // Initial loading or filtering (not load more)
            <div className='flex justify-center pt-16'>
              <Loader2
                className='h-14 w-14 animate-spin text-red-600'
                strokeWidth={3}
              />
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
              {/* Ukryj badge meal type gdy filtr jest aktywny */}
              {viewMode === 'grid' ? (
                <RecipesGrid
                  recipes={recipesForGrid}
                  onRecipeClick={handleRecipeClick}
                  hideMealTypeBadge={filters.meal_types.length > 0}
                />
              ) : (
                <div className='grid w-full grid-cols-1 gap-6'>
                  {recipesForGrid.map((recipe, index) => (
                    <div key={recipe.id}>
                      <RecipeListItem
                        recipe={recipe}
                        onClick={handleRecipeClick}
                        onAddToMealPlan={handleAddToMealPlan}
                        isAuthenticated={isAuthenticated ?? undefined}
                        hideMealTypeBadge={filters.meal_types.length > 0}
                      />
                      {(index + 1) % 4 === 0 && (
                        <div className='mt-6'>
                          <RecipeAdPlaceholder variant='list' />
                        </div>
                      )}
                    </div>
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
      </main>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onOpenChange={(open) => !open && closePrompt()}
        redirectRecipeId={redirectRecipeId}
      />
    </>
  )
}
