/**
 * Client wrapper dla przeglądarki przepisów
 *
 * Główny komponent orchestrujący cały widok /recipes.
 * Zarządza stanem filtrów, paginacją, auth check i modalem przepisu.
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
import { RecipeViewModal } from '@/components/shared/RecipeViewModal'
import { useRecipesFilter } from '@/lib/hooks/useRecipesFilter'
import { useRecipeViewModal } from '@/hooks/useRecipeViewModal'
import { useAuthPrompt } from '@/lib/hooks/useAuthPrompt'
import { useAuthCheck } from '@/lib/hooks/useAuthCheck'
import { useRecipesQuery } from '@/lib/react-query/queries/useRecipesQuery'
import { useRecipeQuery } from '@/lib/react-query/queries/useRecipeQuery'
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
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Stan modala przepisu
  const [recipeModal, setRecipeModal] = useState<{
    isOpen: boolean
    recipeId: number | null
  }>({
    isOpen: false,
    recipeId: null,
  })

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

  // Query dla szczegółów przepisu w modalu
  const { data: selectedRecipe, isLoading: isRecipeLoading } = useRecipeQuery({
    recipeId: recipeModal.recipeId ?? 0,
    enabled: recipeModal.isOpen && !!recipeModal.recipeId,
  })

  // Hook for ingredient amount management in modal
  const { ingredientEditor } = useRecipeViewModal({
    recipe: selectedRecipe,
  })

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

  // Handle recipe click - otwórz modal z przepisem
  const handleRecipeClick = (recipeId: number) => {
    if (authLoading) return // Nie pozwól na klik podczas ładowania

    // Otwórz modal z przepisem
    setRecipeModal({
      isOpen: true,
      recipeId,
    })
  }

  // Zamknij modal przepisu
  const handleRecipeModalClose = () => {
    setRecipeModal({ isOpen: false, recipeId: null })
  }

  // Handle Add to Meal Plan
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddToMealPlan = (_recipeId: number) => {
    // TODO: Implementacja dodawania do planu posiłków
  }

  // Initial loading - show spinner for entire page
  if (isLoading) {
    return (
      <main className='flex min-h-[60vh] items-center justify-center'>
        <Loader2 className='h-12 w-12 animate-spin text-red-600' />
      </main>
    )
  }

  return (
    <>
      <main className='w-full space-y-3'>
        {/* Featured Recipe - hidden on mobile */}
        {featuredRecipe && (
          <section className='hidden w-full md:block'>
            <FeaturedRecipeCard
              recipe={featuredRecipe}
              onClick={handleRecipeClick}
            />
          </section>
        )}

        {/* Filters, Sort i View Toggle */}
        <section className='w-full'>
          <div className='flex items-center justify-between gap-2'>
            <RecipeFilters
              selectedMealTypes={filters.meal_types}
              onChange={updateMealTypes}
            />
            <div className='flex shrink-0 items-center gap-2'>
              <SortSelect
                value={sortBy}
                direction={sortDirection}
                onChange={setSortBy}
                onDirectionChange={setSortDirection}
              />
              <div className='hidden md:block'>
                <ViewToggle mode={viewMode} onChange={setViewMode} />
              </div>
            </div>
          </div>
        </section>

        {/* Recipes Grid/List */}
        <section className='w-full space-y-3'>
          {isFetching && !isFetchingNextPage ? (
            // Filtering/refetching (not load more)
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
              <Button variant='outline' onClick={() => router.refresh()}>
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
              {/* Grid view - always on mobile, conditional on desktop */}
              {/* Ukryj badge meal type gdy filtr jest aktywny */}
              <div className={viewMode === 'list' ? 'block md:hidden' : ''}>
                <RecipesGrid
                  recipes={recipesForGrid}
                  onRecipeClick={handleRecipeClick}
                  hideMealTypeBadge={filters.meal_types.length > 0}
                />
              </div>

              {/* List view - only on desktop when selected */}
              {viewMode === 'list' && (
                <div className='hidden md:block'>
                  <div className='grid w-full grid-cols-1 gap-3'>
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
                          <div className='mt-3'>
                            <RecipeAdPlaceholder variant='list' />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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

      {/* Recipe Detail Modal */}
      {selectedRecipe && !isRecipeLoading && (
        <RecipeViewModal
          recipe={selectedRecipe}
          isOpen={recipeModal.isOpen}
          onClose={handleRecipeModalClose}
          ingredientEditor={ingredientEditor}
          testId='recipes-browser-modal'
        />
      )}
    </>
  )
}
