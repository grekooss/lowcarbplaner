/**
 * Client wrapper dla szczegółów przepisu
 *
 * Layout z printscreenu: 2 kolumny (lewa: szczegóły przepisu, prawa: składniki + makro)
 */

'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Star,
  Clock,
  Timer,
  BarChart3,
  ListOrdered,
} from 'lucide-react'
import { InstructionsList } from './InstructionsList'
import { MacroCard } from './MacroCard'
import { RecipeImagePlaceholder } from '@/components/recipes/RecipeImagePlaceholder'
import { EditableIngredientRow } from '@/components/dashboard/EditableIngredientRow'
import { MEAL_TYPE_LABELS } from '@/types/recipes-view.types'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipeDetailClientProps {
  recipe: RecipeDTO
  showBackButton?: boolean
  // Ingredient editing props (optional - only for Dashboard)
  enableIngredientEditing?: boolean
  getIngredientAmount?: (ingredientId: number) => number
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
}

/**
 * Client wrapper dla widoku szczegółów przepisu
 */
export function RecipeDetailClient({
  recipe,
  showBackButton = true,
  enableIngredientEditing = false,
  getIngredientAmount,
  updateIngredientAmount,
  incrementAmount,
  decrementAmount,
  adjustedNutrition,
}: RecipeDetailClientProps) {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  // Oblicz total steps z instrukcji
  const totalSteps = Array.isArray(recipe.instructions)
    ? recipe.instructions.length
    : 0
  // Prep time i cook time są obecnie niedostępne w nowym formacie
  const prepTime = 0
  const cookTime = 0

  return (
    <div className='mx-auto max-w-[1440px] space-y-6 px-4 py-6 md:px-6 lg:px-8'>
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
      <div className='grid gap-6 lg:grid-cols-[320px_1fr_380px]'>
        {/* LEWA KOLUMNA - Zdjęcie + Metadata */}
        <div className='rounded-3xl bg-[#F5EFE7] p-6'>
          {/* Zdjęcie przepisu - pełna szerokość, wychodzi poza padding */}
          <div className='relative -mx-6 -mt-6 mb-4 aspect-square w-[calc(100%+3rem)] overflow-hidden rounded-t-3xl'>
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

          {/* Metadata grid */}
          <div className='space-y-3'>
            {/* Difficulty */}
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-green-100 p-2.5'>
                <BarChart3 className='h-5 w-5 text-green-600' />
              </div>
              <div className='space-y-0.5'>
                <p className='text-muted-foreground text-xs'>Trudność</p>
                <p className='text-sm font-semibold'>
                  {recipe.difficulty_level === 'easy'
                    ? 'Medium'
                    : recipe.difficulty_level === 'medium'
                      ? 'Medium'
                      : 'Hard'}
                </p>
              </div>
            </div>

            {/* Total Steps */}
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-green-100 p-2.5'>
                <ListOrdered className='h-5 w-5 text-green-600' />
              </div>
              <div className='space-y-0.5'>
                <p className='text-muted-foreground text-xs'>Kroki</p>
                <p className='text-sm font-semibold'>
                  {totalSteps > 0 ? `${totalSteps}` : '—'}
                </p>
              </div>
            </div>
            {/* Prep Time */}
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-green-100 p-2.5'>
                <Clock className='h-5 w-5 text-green-600' />
              </div>
              <div className='space-y-0.5'>
                <p className='text-muted-foreground text-xs'>
                  Czas przygotowania
                </p>
                <p className='text-sm font-semibold'>
                  {prepTime > 0 ? `${prepTime} min` : '—'}
                </p>
              </div>
            </div>

            {/* Cook Time */}
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-green-100 p-2.5'>
                <Timer className='h-5 w-5 text-green-600' />
              </div>
              <div className='space-y-0.5'>
                <p className='text-muted-foreground text-xs'>Czas gotowania</p>
                <p className='text-sm font-semibold'>
                  {cookTime > 0 ? `${cookTime} min` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          {recipe.average_rating && recipe.reviews_count > 0 && (
            <div className='space-y-2'>
              <h3 className='text-sm font-semibold'>Reviews</h3>
              <div className='flex items-center gap-2'>
                <div className='flex items-center gap-1'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(recipe.average_rating ?? 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className='text-xs font-medium'>
                  {recipe.average_rating.toFixed(1)}/5
                </span>
                <span className='text-muted-foreground text-xs'>
                  · {recipe.reviews_count} Reviews
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ŚRODKOWA KOLUMNA - Tytuł + Directions */}
        <div className='space-y-6'>
          {/* Tytuł przepisu + badge */}
          <div className='space-y-3'>
            <h2 className='text-2xl font-bold'>{recipe.name}</h2>
            {recipe.meal_types.length > 0 && recipe.meal_types[0] && (
              <Badge
                variant='secondary'
                className='rounded-full bg-yellow-400 px-4 py-1.5 text-sm font-medium text-gray-900 hover:bg-yellow-500'
              >
                {MEAL_TYPE_LABELS[recipe.meal_types[0]]}
              </Badge>
            )}
          </div>

          {/* Directions */}
          <div className='space-y-3'>
            <h3 className='font-semibold'>Kroki</h3>
            <InstructionsList instructions={recipe.instructions} />
          </div>
        </div>

        {/* PRAWA KOLUMNA - Składniki + Makro */}
        <div className='space-y-6'>
          {/* Ingredients */}
          <div className='space-y-3'>
            <h3 className='font-semibold'>Składniki</h3>
            {enableIngredientEditing && (
              <p className='text-muted-foreground text-xs'>
                Dostosuj gramatury składników (±10%)
              </p>
            )}
            <div className='space-y-2'>
              {enableIngredientEditing &&
              getIngredientAmount &&
              updateIngredientAmount &&
              incrementAmount &&
              decrementAmount ? (
                // Editable mode - Dashboard
                recipe.ingredients.map((ingredient, idx) => (
                  <EditableIngredientRow
                    key={ingredient.id}
                    ingredient={ingredient}
                    currentAmount={getIngredientAmount(ingredient.id)}
                    onAmountChange={updateIngredientAmount}
                    onIncrement={incrementAmount}
                    onDecrement={decrementAmount}
                    index={idx}
                  />
                ))
              ) : (
                // Read-only mode - MealPlan / Recipes
                <>
                  {recipe.ingredients.map((ingredient, idx) => {
                    // Show adjusted amount if available, otherwise original
                    const displayAmount = getIngredientAmount
                      ? getIngredientAmount(ingredient.id)
                      : ingredient.amount

                    return (
                      <div
                        key={ingredient.id}
                        className='flex items-start gap-3'
                      >
                        <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium'>
                          {idx + 1}
                        </div>
                        <p className='pt-0.5 text-sm'>
                          {displayAmount} {ingredient.unit} {ingredient.name}
                        </p>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          </div>

          {/* 4 Macro Cards (kolorowe) */}
          <div className='grid grid-cols-2 gap-3'>
            <MacroCard
              label='Calories'
              value={adjustedNutrition?.calories ?? recipe.total_calories}
              unit='kcal'
              variant='calories'
              size='compact'
            />
            <MacroCard
              label='Fats'
              value={adjustedNutrition?.fats_g ?? recipe.total_fats_g}
              unit='gr'
              variant='fat'
              size='compact'
            />
            <MacroCard
              label='Carbs'
              value={adjustedNutrition?.carbs_g ?? recipe.total_carbs_g}
              unit='gr'
              variant='carbs'
              size='compact'
            />
            <MacroCard
              label='Protein'
              value={adjustedNutrition?.protein_g ?? recipe.total_protein_g}
              unit='gr'
              variant='protein'
              size='compact'
            />
          </div>
        </div>
      </div>
    </div>
  )
}
