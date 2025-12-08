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
}: RecipeDetailClientProps) {
  const router = useRouter()
  // Track checked ingredients (local state, resets on modal close)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  )

  const handleBack = () => {
    router.back()
  }

  const toggleIngredient = (ingredientId: number) => {
    setCheckedIngredients((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(ingredientId)) {
        newSet.delete(ingredientId)
      } else {
        newSet.add(ingredientId)
      }
      return newSet
    })
  }

  // Oblicz total steps z instrukcji
  const totalSteps = Array.isArray(recipe.instructions)
    ? recipe.instructions.length
    : 0
  // Prep time i cook time pobierane z bazy danych
  const prepTime = recipe.prep_time_minutes ?? 0
  const cookTime = recipe.cook_time_minutes ?? 0

  return (
    <div className='mx-auto max-w-[1440px] space-y-6 px-2 py-6 md:px-3 lg:px-4'>
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

      {/* Layout 3 kolumny */}
      <div className='grid gap-6 lg:grid-cols-[320px_1fr_420px]'>
        {/* LEWA KOLUMNA - Zdjęcie + Metadata */}
        <div className='h-fit rounded-[20px] border-2 border-white bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]'>
          {/* Zdjęcie przepisu */}
          <div className='relative mb-4 aspect-square w-full overflow-hidden rounded-[12px]'>
            {recipe.image_url ? (
              <Image
                src={recipe.image_url}
                alt={recipe.name}
                fill
                className='object-cover'
                sizes='(max-width: 1024px) 100vw, 800px'
                priority
              />
            ) : (
              <RecipeImagePlaceholder recipeName={recipe.name} />
            )}
          </div>

          {/* Metadata grid 2x2 */}
          <div className='grid grid-cols-2 gap-3'>
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

          {/* Reviews */}
          {recipe.average_rating && recipe.reviews_count > 0 && (
            <div className='mt-4 space-y-2'>
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

          {/* Macro Badges - jedna linia */}
          <div className='mt-4 flex flex-wrap items-center gap-3 text-sm font-medium'>
            {/* Calories Badge */}
            <div className='flex items-center gap-1.5 rounded-sm bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm shadow-red-500/20'>
              <Flame className='h-3.5 w-3.5' />
              {Math.round(
                adjustedNutrition?.calories ?? recipe.total_calories ?? 0
              )}{' '}
              kcal
            </div>

            {/* Carbs */}
            <div className='flex items-center gap-1.5' title='Węglowodany'>
              <Wheat className='h-4 w-4 text-gray-900' />
              <span className='font-bold text-gray-700'>
                {Math.round(
                  adjustedNutrition?.carbs_g ?? recipe.total_carbs_g ?? 0
                )}
                g
              </span>
            </div>

            {/* Protein */}
            <div className='flex items-center gap-1.5' title='Białko'>
              <Beef className='h-4 w-4 text-gray-900' />
              <span className='font-bold text-gray-700'>
                {Math.round(
                  adjustedNutrition?.protein_g ?? recipe.total_protein_g ?? 0
                )}
                g
              </span>
            </div>

            {/* Fat */}
            <div className='flex items-center gap-1.5' title='Tłuszcze'>
              <Droplet className='h-4 w-4 text-gray-900' />
              <span className='font-bold text-gray-700'>
                {Math.round(
                  adjustedNutrition?.fats_g ?? recipe.total_fats_g ?? 0
                )}
                g
              </span>
            </div>
          </div>
        </div>

        {/* ŚRODKOWA KOLUMNA - Tytuł + Directions */}
        <div className='space-y-6'>
          {/* Tytuł przepisu + badge */}
          <div className='space-y-3'>
            <h2 className='text-2xl font-bold'>{recipe.name}</h2>
            {recipe.meal_types.length > 0 && recipe.meal_types[0] && (
              <Badge className={getMealTypeBadgeClasses(recipe.meal_types[0])}>
                {MEAL_TYPE_LABELS[recipe.meal_types[0]]}
              </Badge>
            )}
          </div>

          {/* Directions */}
          <div className='space-y-3'>
            <h3 className='text-lg font-bold text-gray-800'>Kroki</h3>
            <InstructionsList instructions={recipe.instructions} />
          </div>
        </div>

        {/* PRAWA KOLUMNA - Składniki + Makro */}
        <div className='space-y-6'>
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
            {enableIngredientEditing && (
              <p className='text-muted-foreground mb-3 text-xs'>
                Dostosuj gramatury składników (ostrzeżenie przy &gt;15%)
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
                      isChecked={checkedIngredients.has(ingredient.id)}
                      onToggleChecked={toggleIngredient}
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

                    const isChecked = checkedIngredients.has(ingredient.id)

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
    </div>
  )
}
