/**
 * Client wrapper dla szczegółów przepisu
 *
 * Layout z printscreenu: 2 kolumny (lewa: szczegóły przepisu, prawa: składniki + makro)
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Star,
  Clock,
  Timer,
  BarChart3,
  ListOrdered,
  Flame,
  Wheat,
  Beef,
  Droplet,
  Check,
  Save,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { InstructionsList } from './InstructionsList'
import { RecipeImagePlaceholder } from '@/components/recipes/RecipeImagePlaceholder'
import { EditableIngredientRow } from '@/components/dashboard/EditableIngredientRow'
import { MEAL_TYPE_LABELS } from '@/types/recipes-view.types'
import { getMealTypeBadgeClasses } from '@/lib/styles/mealTypeBadge'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipeDetailClientProps {
  recipe: RecipeDTO
  showBackButton?: boolean
  // Ingredient editing props (optional - only for Dashboard)
  enableIngredientEditing?: boolean
  getIngredientAmount?: (ingredientId: number) => number
  isAutoAdjusted?: (ingredientId: number) => boolean
  updateIngredientAmount?: (
    ingredientId: number,
    newAmount: number
  ) => { success: boolean; error?: string }
  incrementAmount?: (ingredientId: number) => {
    success: boolean
    error?: string
  }
  decrementAmount?: (ingredientId: number) => {
    success: boolean
    error?: string
  }
  adjustedNutrition?: {
    calories: number
    protein_g: number
    carbs_g: number
    fats_g: number
  }
  // Save button props (for Dashboard editing)
  hasChanges?: boolean
  isSaving?: boolean
  onSave?: () => void
  saveError?: string | null
  isSaveSuccessful?: boolean
  // Step mode props (controlled from parent - RecipeModal)
  isStepMode?: boolean
  currentStep?: number
  // Step mode callbacks (for modal)
  onOpenStepMode?: () => void
  totalSteps?: number
  // Hide steps button (when parent handles it in fixed footer)
  hideStepsButton?: boolean
  // Excluded ingredients management (for checkbox exclusion feature)
  excludedIngredients?: Map<number, number>
  onToggleIngredientExcluded?: (ingredientId: number) => void
  // External checkbox state (visual only, managed by parent)
  checkedIngredients?: Set<number>
  onToggleChecked?: (ingredientId: number) => void
}

/**
 * Client wrapper dla widoku szczegółów przepisu
 */
export function RecipeDetailClient({
  recipe,
  showBackButton = true,
  enableIngredientEditing = false,
  getIngredientAmount,
  isAutoAdjusted,
  updateIngredientAmount,
  incrementAmount,
  decrementAmount,
  adjustedNutrition,
  hasChanges = false,
  isSaving = false,
  onSave,
  saveError,
  isSaveSuccessful = false,
  isStepMode = false,
  currentStep = 1,
  onOpenStepMode,
  totalSteps: totalStepsProp,
  hideStepsButton = false,
  excludedIngredients,
  onToggleIngredientExcluded,
  checkedIngredients,
  onToggleChecked,
}: RecipeDetailClientProps) {
  const router = useRouter()

  // Track checked ingredients (local state for visual-only mode without exclusion)
  const [localCheckedIngredients, setLocalCheckedIngredients] = useState<
    Set<number>
  >(new Set())

  const handleBack = () => {
    router.back()
  }

  // Use external checkbox state if provided, otherwise use local state
  const isIngredientChecked = (ingredientId: number) => {
    // Priority: external checkedIngredients > excludedIngredients > local state
    if (checkedIngredients) {
      return checkedIngredients.has(ingredientId)
    }
    if (excludedIngredients) {
      return excludedIngredients.has(ingredientId)
    }
    return localCheckedIngredients.has(ingredientId)
  }

  const toggleIngredient = (ingredientId: number) => {
    // Priority: external onToggleChecked > onToggleIngredientExcluded > local state
    if (onToggleChecked) {
      onToggleChecked(ingredientId)
      return
    }
    if (onToggleIngredientExcluded) {
      onToggleIngredientExcluded(ingredientId)
      return
    }

    // Otherwise use local state (visual only, no macro update)
    setLocalCheckedIngredients((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(ingredientId)) {
        newSet.delete(ingredientId)
      } else {
        newSet.add(ingredientId)
      }
      return newSet
    })
  }

  // Oblicz total steps z instrukcji (lub użyj prop)
  const totalSteps =
    totalStepsProp ??
    (Array.isArray(recipe.instructions) ? recipe.instructions.length : 0)
  // Prep time i cook time pobierane z bazy danych
  const prepTime = recipe.prep_time_minutes ?? 0
  const cookTime = recipe.cook_time_minutes ?? 0

  // Sortowane instrukcje dla step mode
  const sortedInstructions = Array.isArray(recipe.instructions)
    ? [...recipe.instructions].sort((a, b) => a.step - b.step)
    : []

  // Znajdź składniki pasujące do aktualnego kroku (szukaj nazwy składnika w opisie kroku)
  const getCurrentStepIngredients = () => {
    if (sortedInstructions.length === 0) return []
    const currentInstruction = sortedInstructions[currentStep - 1]
    if (!currentInstruction) return []

    const description = currentInstruction.description.toLowerCase()
    return recipe.ingredients.filter((ingredient) =>
      description.includes(ingredient.name.toLowerCase())
    )
  }

  // Składniki do wyświetlenia - w step mode tylko te z kroku, inaczej wszystkie
  const displayIngredients = isStepMode
    ? getCurrentStepIngredients()
    : recipe.ingredients

  return (
    <div
      className={cn(
        'relative mx-auto max-w-[1440px] space-y-3 overflow-x-hidden px-3 py-3 lg:space-y-6 lg:px-4 lg:py-6 lg:pb-6',
        // pb-16 only when steps button is visible inside this component
        !hideStepsButton && 'pb-16'
      )}
    >
      {/* Przycisk powrotu - tylko gdy showBackButton = true */}
      {showBackButton && (
        <Button
          variant='ghost'
          size='sm'
          onClick={handleBack}
          className='gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Powrót do przepisów
        </Button>
      )}

      {/* Mobile: Tytuł przepisu nad panelem - ukryty gdy showBackButton=false (modal ma własny header) */}
      {showBackButton && (
        <div className='mb-1.5 lg:hidden'>
          <h2 className='text-lg leading-tight font-bold'>{recipe.name}</h2>
        </div>
      )}

      {/* Mobile Step Mode: Mini panel z kaloriami i makro */}
      {isStepMode && (
        <div className='flex items-center justify-center gap-4 rounded-[12px] border-2 border-white bg-[var(--bg-card)] p-2 shadow-[var(--shadow-card)] lg:hidden'>
          {/* Kalorie */}
          <div className='flex h-[22px] items-center gap-1 rounded-sm bg-red-600 px-2 text-[10px] text-white shadow-sm shadow-red-500/20'>
            <Flame className='h-3 w-3' />
            <span className='font-bold'>
              {Math.round(
                adjustedNutrition?.calories ?? recipe.total_calories ?? 0
              )}
            </span>
            <span className='font-normal'>kcal</span>
          </div>
          {/* Makro */}
          <div className='flex items-center gap-3 text-sm'>
            <div className='flex items-center gap-1.5' title='Węglowodany'>
              <div className='flex h-5 w-5 items-center justify-center rounded-sm bg-orange-400'>
                <Wheat className='h-3 w-3 text-white' />
              </div>
              <span className='text-[11px] text-gray-700'>
                <span className='font-bold'>
                  {Math.round(
                    adjustedNutrition?.carbs_g ?? recipe.total_carbs_g ?? 0
                  )}
                </span>{' '}
                g
              </span>
            </div>
            <div className='flex items-center gap-1.5' title='Białko'>
              <div className='flex h-5 w-5 items-center justify-center rounded-sm bg-blue-400'>
                <Beef className='h-3 w-3 text-white' />
              </div>
              <span className='text-[11px] text-gray-700'>
                <span className='font-bold'>
                  {Math.round(
                    adjustedNutrition?.protein_g ?? recipe.total_protein_g ?? 0
                  )}
                </span>{' '}
                g
              </span>
            </div>
            <div className='flex items-center gap-1.5' title='Tłuszcze'>
              <div className='flex h-5 w-5 items-center justify-center rounded-sm bg-green-400'>
                <Droplet className='h-3 w-3 text-white' />
              </div>
              <span className='text-[11px] text-gray-700'>
                <span className='font-bold'>
                  {Math.round(
                    adjustedNutrition?.fats_g ?? recipe.total_fats_g ?? 0
                  )}
                </span>{' '}
                g
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Layout 3 kolumny */}
      <div className='grid gap-3 lg:grid-cols-[380px_1fr_420px] lg:gap-6'>
        {/* LEWA KOLUMNA - Zdjęcie + Metadata */}
        <div
          className={cn(
            'h-fit rounded-[16px] border-2 border-white bg-[var(--bg-card)] p-3 shadow-[var(--shadow-card)] lg:rounded-[20px] lg:p-4',
            // W step mode na mobile - ukryj cały panel (tylko desktop widoczny)
            isStepMode && 'hidden lg:block'
          )}
        >
          {/* Mobile: zdjęcie + dane obok | Desktop: wszystko pod sobą */}
          <div className='flex gap-4 lg:block'>
            {/* Zdjęcie przepisu */}
            <div className='relative aspect-square w-[120px] flex-shrink-0 overflow-hidden rounded-[12px] lg:mb-4 lg:w-full'>
              {recipe.image_url ? (
                <Image
                  src={recipe.image_url}
                  alt={recipe.name}
                  fill
                  className='object-cover'
                  sizes='(max-width: 1024px) 120px, 800px'
                  priority
                />
              ) : (
                <RecipeImagePlaceholder recipeName={recipe.name} />
              )}
            </div>

            {/* Mobile: dane po prawej stronie zdjęcia */}
            <div className='flex flex-1 flex-col justify-between lg:hidden'>
              {/* Badge posiłku + kalorie na górze */}
              <div className='mb-1 flex items-center gap-2'>
                {recipe.meal_types.length > 0 && recipe.meal_types[0] && (
                  <Badge
                    className={`${getMealTypeBadgeClasses(recipe.meal_types[0])} h-[22px] w-fit px-2 text-[10px]`}
                  >
                    {MEAL_TYPE_LABELS[recipe.meal_types[0]]}
                  </Badge>
                )}
                <div className='flex h-[22px] items-center gap-1 rounded-sm bg-red-600 px-2 text-[10px] text-white shadow-sm shadow-red-500/20'>
                  <Flame className='h-3 w-3' />
                  <span className='font-bold'>
                    {Math.round(
                      adjustedNutrition?.calories ?? recipe.total_calories ?? 0
                    )}
                  </span>
                  <span className='font-normal'>kcal</span>
                </div>
              </div>

              {/* Metadata - kompaktowa wersja (bez opisów) */}
              <div className='grid grid-cols-2 gap-2'>
                {/* Difficulty */}
                <div className='flex items-center gap-1.5'>
                  <div className='rounded-[6px] bg-white p-1.5 shadow-sm'>
                    <BarChart3 className='size-3 text-[var(--text-main)]' />
                  </div>
                  <p className='text-[11px] font-semibold text-[var(--text-main)]'>
                    {recipe.difficulty_level === 'easy'
                      ? 'Łatwy'
                      : recipe.difficulty_level === 'medium'
                        ? 'Średni'
                        : 'Trudny'}
                  </p>
                </div>

                {/* Prep Time */}
                <div className='flex items-center gap-1.5'>
                  <div className='rounded-[6px] bg-white p-1.5 shadow-sm'>
                    <Clock className='size-3 text-[var(--text-main)]' />
                  </div>
                  <p className='text-[11px] font-semibold text-[var(--text-main)]'>
                    {prepTime > 0 ? `${prepTime} min` : '—'}
                  </p>
                </div>

                {/* Cook Time */}
                <div className='flex items-center gap-1.5'>
                  <div className='rounded-[6px] bg-white p-1.5 shadow-sm'>
                    <Timer className='size-3 text-[var(--text-main)]' />
                  </div>
                  <p className='text-[11px] font-semibold text-[var(--text-main)]'>
                    {cookTime > 0 ? `${cookTime} min` : '—'}
                  </p>
                </div>

                {/* Total Steps */}
                <div className='flex items-center gap-1.5'>
                  <div className='rounded-[6px] bg-white p-1.5 shadow-sm'>
                    <ListOrdered className='size-3 text-[var(--text-main)]' />
                  </div>
                  <p className='text-[11px] font-semibold text-[var(--text-main)]'>
                    {totalSteps > 0 ? `${totalSteps}` : '—'}
                  </p>
                </div>
              </div>

              {/* Macro Badges - mobile compact (bez kalorii - są przy badge posiłku) */}
              <div className='mt-2 flex items-center gap-2 text-sm font-medium'>
                <div className='flex items-center gap-1.5' title='Węglowodany'>
                  <div className='flex h-5 w-5 items-center justify-center rounded-sm bg-orange-500'>
                    <Wheat className='h-3 w-3 text-white' />
                  </div>
                  <span className='text-[11px] text-gray-700'>
                    <span className='font-bold'>
                      {Math.round(
                        adjustedNutrition?.carbs_g ?? recipe.total_carbs_g ?? 0
                      )}
                    </span>{' '}
                    <span>g</span>
                  </span>
                </div>
                <div className='flex items-center gap-1.5' title='Białko'>
                  <div className='flex h-5 w-5 items-center justify-center rounded-sm bg-blue-500'>
                    <Beef className='h-3 w-3 text-white' />
                  </div>
                  <span className='text-[11px] text-gray-700'>
                    <span className='font-bold'>
                      {Math.round(
                        adjustedNutrition?.protein_g ??
                          recipe.total_protein_g ??
                          0
                      )}
                    </span>{' '}
                    <span>g</span>
                  </span>
                </div>
                <div className='flex items-center gap-1.5' title='Tłuszcze'>
                  <div className='flex h-5 w-5 items-center justify-center rounded-sm bg-green-500'>
                    <Droplet className='h-3 w-3 text-white' />
                  </div>
                  <span className='text-[11px] text-gray-700'>
                    <span className='font-bold'>
                      {Math.round(
                        adjustedNutrition?.fats_g ?? recipe.total_fats_g ?? 0
                      )}
                    </span>{' '}
                    <span>g</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Metadata grid 2x2 (hidden on mobile) */}
          <div className='hidden grid-cols-2 gap-3 lg:grid'>
            {/* Difficulty */}
            <div className='flex items-center gap-2'>
              <div className='rounded-[8px] bg-white p-2 shadow-sm'>
                <BarChart3 className='size-4 text-[var(--text-main)]' />
              </div>
              <div className='space-y-0'>
                <p className='text-[10px] text-[var(--text-muted)] uppercase'>
                  Trudność
                </p>
                <p className='text-xs font-semibold text-[var(--text-main)]'>
                  {recipe.difficulty_level === 'easy'
                    ? 'Łatwy'
                    : recipe.difficulty_level === 'medium'
                      ? 'Średni'
                      : 'Trudny'}
                </p>
              </div>
            </div>

            {/* Prep Time */}
            <div className='flex items-center gap-2'>
              <div className='rounded-[8px] bg-white p-2 shadow-sm'>
                <Clock className='size-4 text-[var(--text-main)]' />
              </div>
              <div className='space-y-0'>
                <p className='text-[10px] text-[var(--text-muted)] uppercase'>
                  Przygotowanie
                </p>
                <p className='text-xs font-semibold text-[var(--text-main)]'>
                  {prepTime > 0 ? `${prepTime} min` : '—'}
                </p>
              </div>
            </div>

            {/* Cook Time */}
            <div className='flex items-center gap-2'>
              <div className='rounded-[8px] bg-white p-2 shadow-sm'>
                <Timer className='size-4 text-[var(--text-main)]' />
              </div>
              <div className='space-y-0'>
                <p className='text-[10px] text-[var(--text-muted)] uppercase'>
                  Gotowanie
                </p>
                <p className='text-xs font-semibold text-[var(--text-main)]'>
                  {cookTime > 0 ? `${cookTime} min` : '—'}
                </p>
              </div>
            </div>

            {/* Total Steps */}
            <div className='flex items-center gap-2'>
              <div className='rounded-[8px] bg-white p-2 shadow-sm'>
                <ListOrdered className='size-4 text-[var(--text-main)]' />
              </div>
              <div className='space-y-0'>
                <p className='text-[10px] text-[var(--text-muted)] uppercase'>
                  Kroki
                </p>
                <p className='text-xs font-semibold text-[var(--text-main)]'>
                  {totalSteps > 0 ? `${totalSteps}` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Reviews (both mobile and desktop) */}
          {recipe.average_rating && recipe.reviews_count > 0 && (
            <div className='mt-4 hidden space-y-2 lg:block'>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < Math.round(recipe.average_rating ?? 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className='text-sm font-semibold text-[var(--text-main)]'>
                  {recipe.average_rating.toFixed(1)}/5
                </span>
                <span className='text-xs text-[var(--text-muted)]'>
                  ({recipe.reviews_count} reviews)
                </span>
              </div>
            </div>
          )}

          {/* Desktop: Macro - siatka 2x2 */}
          <div className='mt-4 hidden grid-cols-2 gap-2 lg:grid'>
            {/* Calories - czerwony panel */}
            <div className='flex flex-col items-center rounded-sm bg-red-600 px-3 py-2 shadow-sm shadow-red-500/20'>
              <span className='text-[10px] font-bold tracking-wide text-white/80 uppercase'>
                Kalorie
              </span>
              <div className='flex items-center gap-1'>
                <Flame className='h-4 w-4 text-white' />
                <span className='flex items-baseline gap-0.5'>
                  <span className='text-lg font-bold text-white'>
                    {Math.round(
                      adjustedNutrition?.calories ?? recipe.total_calories ?? 0
                    )}
                  </span>
                  <span className='text-xs text-white/80'>kcal</span>
                </span>
              </div>
            </div>

            {/* Carbs - biały panel */}
            <div className='flex flex-col items-center rounded-sm border-2 border-white bg-white px-3 py-2 shadow-sm'>
              <span className='text-[10px] font-bold tracking-wide text-gray-400 uppercase'>
                Węglowodany
              </span>
              <div className='flex items-center gap-1.5'>
                <div className='flex h-6 w-6 items-center justify-center rounded-sm bg-orange-400'>
                  <Wheat className='h-4 w-4 text-white' />
                </div>
                <span className='flex items-baseline gap-0.5'>
                  <span className='text-lg font-bold text-gray-800'>
                    {Math.round(
                      adjustedNutrition?.carbs_g ?? recipe.total_carbs_g ?? 0
                    )}
                  </span>
                  <span className='text-xs text-gray-500'>g</span>
                </span>
              </div>
            </div>

            {/* Protein - biały panel */}
            <div className='flex flex-col items-center rounded-sm border-2 border-white bg-white px-3 py-2 shadow-sm'>
              <span className='text-[10px] font-bold tracking-wide text-gray-400 uppercase'>
                Białko
              </span>
              <div className='flex items-center gap-1.5'>
                <div className='flex h-6 w-6 items-center justify-center rounded-sm bg-blue-400'>
                  <Beef className='h-4 w-4 text-white' />
                </div>
                <span className='flex items-baseline gap-0.5'>
                  <span className='text-lg font-bold text-gray-800'>
                    {Math.round(
                      adjustedNutrition?.protein_g ??
                        recipe.total_protein_g ??
                        0
                    )}
                  </span>
                  <span className='text-xs text-gray-500'>g</span>
                </span>
              </div>
            </div>

            {/* Fat - biały panel */}
            <div className='flex flex-col items-center rounded-sm border-2 border-white bg-white px-3 py-2 shadow-sm'>
              <span className='text-[10px] font-bold tracking-wide text-gray-400 uppercase'>
                Tłuszcze
              </span>
              <div className='flex items-center gap-1.5'>
                <div className='flex h-6 w-6 items-center justify-center rounded-sm bg-green-400'>
                  <Droplet className='h-4 w-4 text-white' />
                </div>
                <span className='flex items-baseline gap-0.5'>
                  <span className='text-lg font-bold text-gray-800'>
                    {Math.round(
                      adjustedNutrition?.fats_g ?? recipe.total_fats_g ?? 0
                    )}
                  </span>
                  <span className='text-xs text-gray-500'>g</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ŚRODKOWA KOLUMNA - Tytuł + Składniki (mobile) + Directions */}
        <div className='space-y-4 lg:space-y-6'>
          {/* Tytuł przepisu + badge (tylko desktop i tylko gdy showBackButton=true - w modalu tytuł jest w headerze) */}
          {showBackButton && (
            <div className='hidden space-y-3 lg:block'>
              <h2 className='text-2xl font-bold'>{recipe.name}</h2>
              {recipe.meal_types.length > 0 && recipe.meal_types[0] && (
                <Badge
                  className={getMealTypeBadgeClasses(recipe.meal_types[0])}
                >
                  {MEAL_TYPE_LABELS[recipe.meal_types[0]]}
                </Badge>
              )}
            </div>
          )}

          {/* Mobile: Składniki w panelu z możliwością zmiany gramatury */}
          <div className='lg:hidden'>
            <div className='mb-2 pl-1'>
              <h3 className='text-sm font-bold text-gray-800'>Składniki</h3>
            </div>
            <div className='relative rounded-[12px] border-2 border-white bg-[var(--bg-card)] p-2 shadow-[var(--shadow-card)]'>
              {/* Save button - absolute positioned in top right corner */}
              {enableIngredientEditing &&
                hasChanges &&
                !isSaveSuccessful &&
                onSave && (
                  <Button
                    onClick={onSave}
                    disabled={isSaving}
                    size='sm'
                    className='absolute top-2 right-2 h-[22px] rounded-sm bg-red-600 px-2 text-[10px] font-bold text-white shadow-sm shadow-red-500/20 hover:bg-red-700'
                  >
                    {isSaving ? 'Zapisuję...' : 'Zapisz'}
                  </Button>
                )}
              {isSaveSuccessful && (
                <span className='absolute top-2 right-2 text-[10px] font-bold text-red-600'>
                  ✓ Zapisano
                </span>
              )}
              {enableIngredientEditing &&
                onSave &&
                !(isStepMode && displayIngredients.length === 0) && (
                  <p className='text-muted-foreground mb-2 text-[10px]'>
                    Dostosuj gramatury składników
                  </p>
                )}
              <div data-testid='mobile-ingredients-list'>
                {enableIngredientEditing &&
                getIngredientAmount &&
                updateIngredientAmount &&
                incrementAmount &&
                decrementAmount ? (
                  displayIngredients.length > 0 ? (
                    <ul className='divide-y divide-gray-100'>
                      {displayIngredients.map((ingredient) => (
                        <EditableIngredientRow
                          key={ingredient.id}
                          ingredient={ingredient}
                          currentAmount={getIngredientAmount(ingredient.id)}
                          isAutoAdjusted={
                            isAutoAdjusted
                              ? isAutoAdjusted(ingredient.id)
                              : false
                          }
                          onAmountChange={updateIngredientAmount}
                          onIncrement={incrementAmount}
                          onDecrement={decrementAmount}
                          isChecked={isIngredientChecked(ingredient.id)}
                          onToggleChecked={toggleIngredient}
                          onExclude={(id) => updateIngredientAmount(id, 0)}
                          compact
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className='py-3 text-center text-xs text-gray-500'>
                      Ten krok nie wymaga konkretnych składników
                    </p>
                  )
                ) : displayIngredients.length > 0 ? (
                  <ul className='divide-y divide-gray-100'>
                    {displayIngredients.map((ingredient) => {
                      const displayAmount = getIngredientAmount
                        ? getIngredientAmount(ingredient.id)
                        : ingredient.amount

                      const formatAmount = (amount: number): string => {
                        const rounded = Math.round(amount * 100) / 100
                        return rounded % 1 === 0
                          ? rounded.toFixed(0)
                          : rounded.toFixed(2)
                      }

                      const isChecked = isIngredientChecked(ingredient.id)

                      return (
                        <li
                          key={ingredient.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 py-2 transition-all duration-200',
                            isChecked ? 'opacity-50' : ''
                          )}
                          onClick={() => toggleIngredient(ingredient.id)}
                          role='button'
                          tabIndex={0}
                          aria-pressed={isChecked}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              toggleIngredient(ingredient.id)
                            }
                          }}
                        >
                          {/* Mini Checkbox */}
                          <div
                            className={cn(
                              'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-all duration-200',
                              isChecked
                                ? 'border-red-500 bg-red-500'
                                : 'border-gray-300 bg-white'
                            )}
                          >
                            {isChecked && (
                              <Check
                                className='h-2.5 w-2.5 text-white'
                                strokeWidth={3}
                              />
                            )}
                          </div>

                          {/* Item Name + Amount */}
                          <span
                            className={cn(
                              'text-[13px] break-words transition-all duration-200',
                              isChecked
                                ? 'text-gray-400 line-through'
                                : 'text-gray-700'
                            )}
                          >
                            <span className='font-medium'>
                              {ingredient.name}
                            </span>
                            <span className='ml-1 whitespace-nowrap text-gray-500'>
                              {formatAmount(displayAmount)} {ingredient.unit}
                            </span>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className='py-3 text-center text-xs text-gray-500'>
                    Ten krok nie wymaga konkretnych składników
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Directions - ukryte na mobile (używamy step mode), widoczne na desktop */}
          <div className='hidden space-y-3 lg:block'>
            <h3 className='text-base font-bold text-gray-800 lg:text-lg'>
              Kroki
            </h3>
            <InstructionsList instructions={recipe.instructions} />
          </div>
        </div>

        {/* PRAWA KOLUMNA - Składniki + Makro (tylko desktop) */}
        <div className='hidden space-y-6 lg:block'>
          {/* Ingredients - Panel style like image card */}
          <div className='rounded-[20px] border-2 border-white bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]'>
            {/* Header with title and save button */}
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='text-lg font-bold text-gray-800'>Składniki</h3>
              {enableIngredientEditing &&
                hasChanges &&
                !isSaveSuccessful &&
                onSave && (
                  <Button
                    onClick={onSave}
                    disabled={isSaving}
                    size='sm'
                    className='gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-red-500/20 hover:bg-red-700'
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className='h-3.5 w-3.5 animate-spin' />
                        Zapisywanie...
                      </>
                    ) : (
                      <>
                        <Save className='h-3.5 w-3.5' />
                        Zapisz zmiany
                      </>
                    )}
                  </Button>
                )}
              {isSaveSuccessful && (
                <span className='text-xs font-bold text-red-600'>
                  ✓ Zapisano
                </span>
              )}
            </div>
            {saveError && (
              <p className='mb-3 text-xs font-medium text-red-600'>
                {saveError}
              </p>
            )}
            <div data-testid='ingredients-list'>
              {enableIngredientEditing &&
              getIngredientAmount &&
              updateIngredientAmount &&
              incrementAmount &&
              decrementAmount ? (
                // Editable mode - Dashboard (with checkboxes)
                <ul className='divide-y divide-gray-100'>
                  {recipe.ingredients.map((ingredient) => (
                    <EditableIngredientRow
                      key={ingredient.id}
                      ingredient={ingredient}
                      currentAmount={getIngredientAmount(ingredient.id)}
                      isAutoAdjusted={
                        isAutoAdjusted ? isAutoAdjusted(ingredient.id) : false
                      }
                      onAmountChange={updateIngredientAmount}
                      onIncrement={incrementAmount}
                      onDecrement={decrementAmount}
                      isChecked={isIngredientChecked(ingredient.id)}
                      onToggleChecked={toggleIngredient}
                      onExclude={(id) => updateIngredientAmount(id, 0)}
                    />
                  ))}
                </ul>
              ) : (
                // Read-only mode - MealPlan / Recipes (Shopping list style with checkboxes)
                <ul className='divide-y divide-gray-100'>
                  {recipe.ingredients.map((ingredient) => {
                    // Show adjusted amount if available, otherwise original
                    const displayAmount = getIngredientAmount
                      ? getIngredientAmount(ingredient.id)
                      : ingredient.amount

                    // Format amount: remove unnecessary decimals (.00)
                    const formatAmount = (amount: number): string => {
                      const rounded = Math.round(amount * 100) / 100
                      return rounded % 1 === 0
                        ? rounded.toFixed(0)
                        : rounded.toFixed(2)
                    }

                    const isChecked = isIngredientChecked(ingredient.id)

                    return (
                      <li
                        key={ingredient.id}
                        className={cn(
                          'group flex cursor-pointer items-center gap-4 rounded-lg px-3 py-3 transition-all duration-200',
                          isChecked ? 'bg-red-50/50' : 'hover:bg-gray-50/50'
                        )}
                        onClick={() => toggleIngredient(ingredient.id)}
                        role='button'
                        tabIndex={0}
                        aria-pressed={isChecked}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            toggleIngredient(ingredient.id)
                          }
                        }}
                      >
                        {/* Custom Checkbox */}
                        <div
                          className={cn(
                            'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200',
                            isChecked
                              ? 'border-red-500 bg-red-500'
                              : 'border-gray-300 bg-white group-hover:border-red-600'
                          )}
                        >
                          {isChecked && (
                            <Check
                              className='h-4 w-4 text-white'
                              strokeWidth={3}
                            />
                          )}
                        </div>

                        {/* Item Name */}
                        <span
                          className={cn(
                            'flex-1 text-base font-medium transition-all duration-200',
                            isChecked
                              ? 'text-gray-400 line-through'
                              : 'text-gray-800'
                          )}
                        >
                          {ingredient.name}
                        </span>

                        {/* Amount */}
                        <div
                          className={cn(
                            'flex items-baseline gap-1 whitespace-nowrap transition-all duration-200',
                            isChecked ? 'opacity-50' : ''
                          )}
                        >
                          <span className='text-lg font-bold text-gray-800'>
                            {formatAmount(displayAmount)}
                          </span>
                          <span className='text-sm text-gray-500'>
                            {ingredient.unit}
                          </span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Arrow to enter step mode - sticky na dole (tylko gdy nie w step mode i nie ukryty) */}
      {!isStepMode && totalSteps > 0 && !hideStepsButton && (
        <div className='sticky right-0 bottom-0 left-0 z-50 flex justify-end pr-4 pb-4 lg:hidden'>
          <Button
            variant='outline'
            onClick={onOpenStepMode}
            className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white/60 p-0 shadow-md backdrop-blur-sm'
          >
            <ChevronRight className='h-5 w-5' />
          </Button>
        </div>
      )}
    </div>
  )
}
