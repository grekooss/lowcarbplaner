/**
 * Client wrapper dla przeglądarki przepisów
 *
 * Główny komponent orchestrujący cały widok /recipes.
 * Zarządza stanem filtrów, paginacją, auth check i modalem przepisu.
 */

'use client'

import { useState, useMemo } from 'react'
import { Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { FeaturedRecipeCard } from './FeaturedRecipeCard'
import { RecipeFilters } from './RecipeFilters'
import { RecipesGrid } from './RecipesGrid'
import { RecipeListItem } from './RecipeListItem'
import { RecipeAdPlaceholder } from './RecipeAdPlaceholder'
import { ViewToggle, type ViewMode } from './ViewToggle'
import { SortSelect, type SortOption, type SortDirection } from './SortSelect'
import { LoadMoreButton } from './LoadMoreButton'
import { AuthPromptModal } from './AuthPromptModal'
import { RecipeDetailWithViewer } from './RecipeDetailWithViewer'
import { useRecipesFilter } from '@/lib/hooks/useRecipesFilter'
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

  // Mobile step-by-step mode state
  const [isStepMode, setIsStepMode] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

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
  const handleRecipeModalClose = (open: boolean) => {
    if (!open) {
      setRecipeModal({ isOpen: false, recipeId: null })
      // Reset step mode when modal closes
      setIsStepMode(false)
      setCurrentStep(1)
    }
  }

  // Step mode navigation
  const totalSteps = selectedRecipe?.instructions
    ? Array.isArray(selectedRecipe.instructions)
      ? selectedRecipe.instructions.length
      : 0
    : 0

  const sortedInstructions = selectedRecipe?.instructions
    ? Array.isArray(selectedRecipe.instructions)
      ? [...selectedRecipe.instructions].sort((a, b) => a.step - b.step)
      : []
    : []

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const openStepMode = () => {
    console.log('openStepMode called! totalSteps:', totalSteps)
    setCurrentStep(1)
    setIsStepMode(true)
  }

  // DEBUG
  console.log('RecipesBrowserClient DEBUG:', {
    isStepMode,
    totalSteps,
    currentStep,
  })

  const closeStepMode = () => {
    setIsStepMode(false)
  }

  // Handle Add to Meal Plan
  const handleAddToMealPlan = (recipeId: number) => {
    // TODO: Implementacja dodawania do planu posiłków
    console.log('Add to meal plan:', recipeId)
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
      <Dialog open={recipeModal.isOpen} onOpenChange={handleRecipeModalClose}>
        <DialogContent
          coverMainPanel
          hideCloseButton
          className='flex flex-col overflow-hidden rounded-md border-2 border-white bg-white/40 p-0 shadow-2xl backdrop-blur-md sm:rounded-2xl md:rounded-3xl'
        >
          {/* Fixed Header */}
          <div className='relative flex-shrink-0 border-b-2 border-white bg-[var(--bg-card)] p-4 pb-3'>
            <DialogTitle className='pr-8 text-base font-bold text-gray-800 sm:text-lg lg:pr-0 lg:text-center lg:text-2xl'>
              {selectedRecipe?.name ?? ''}
            </DialogTitle>
            <DialogClose className='absolute top-1/2 right-3 -translate-y-1/2 opacity-70 transition-opacity hover:opacity-100'>
              <X className='h-5 w-5' />
              <span className='sr-only'>Zamknij</span>
            </DialogClose>
          </div>

          {/* Scrollable Content */}
          <div className='custom-scrollbar flex-1 overflow-y-auto'>
            {isRecipeLoading ? (
              <div className='flex min-h-[400px] items-center justify-center'>
                <Loader2 className='h-12 w-12 animate-spin text-red-600' />
              </div>
            ) : selectedRecipe ? (
              <RecipeDetailWithViewer
                recipe={selectedRecipe}
                isStepMode={isStepMode}
                currentStep={currentStep}
                onOpenStepMode={openStepMode}
                totalSteps={totalSteps}
                hideStepsButton={true}
              />
            ) : null}
          </div>

          {/* Fixed Footer - przycisk KROKI lub panel kroków (tylko mobile) */}
          {totalSteps > 0 && (
            <div className='flex-shrink-0 lg:hidden'>
              {!isStepMode ? (
                /* Przycisk KROKI */
                <div className='flex justify-center border-t-2 border-white bg-[var(--bg-card)] p-3'>
                  <Button
                    onClick={openStepMode}
                    className='h-7 rounded-sm bg-red-600 px-6 text-sm font-bold tracking-wide text-white shadow-lg shadow-red-500/30 transition-transform hover:bg-red-700 active:scale-95'
                  >
                    KROKI
                  </Button>
                </div>
              ) : (
                /* Panel kroków */
                <div className='border-t-2 border-white bg-[var(--bg-card)] p-4 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]'>
                  {/* Header: numer kroku + przycisk zamknięcia */}
                  <div className='mb-3 flex items-center justify-between'>
                    <h3 className='text-base font-bold text-gray-800'>
                      Krok {currentStep} z {totalSteps}
                    </h3>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={closeStepMode}
                      className='h-8 w-8 rounded-full p-0'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>

                  {/* Opis kroku */}
                  <div className='mb-4 flex items-start gap-3'>
                    <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-600 text-sm font-bold text-white'>
                      {currentStep}
                    </div>
                    <p className='flex-1 text-sm leading-relaxed font-medium text-gray-800'>
                      {sortedInstructions[currentStep - 1]?.description}
                    </p>
                  </div>

                  {/* Nawigacja: strzałka lewa + kropki + strzałka prawa */}
                  <div className='flex items-center justify-between'>
                    <Button
                      variant='outline'
                      onClick={goToPrevStep}
                      disabled={currentStep === 1}
                      className='flex h-10 w-10 items-center justify-center rounded-full p-0 disabled:opacity-30'
                    >
                      <ChevronLeft className='h-5 w-5' />
                    </Button>

                    <div className='flex items-center gap-1.5'>
                      {sortedInstructions.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentStep(index + 1)}
                          className={cn(
                            'h-2 rounded-full transition-all',
                            index + 1 === currentStep
                              ? 'w-5 bg-red-600'
                              : 'w-2 bg-gray-300 hover:bg-gray-400'
                          )}
                          aria-label={`Krok ${index + 1}`}
                        />
                      ))}
                    </div>

                    <Button
                      variant='outline'
                      onClick={goToNextStep}
                      disabled={currentStep === totalSteps}
                      className='flex h-10 w-10 items-center justify-center rounded-full p-0 disabled:opacity-30'
                    >
                      <ChevronRight className='h-5 w-5' />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
