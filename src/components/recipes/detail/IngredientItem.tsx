/**
 * Komponent pojedynczego składnika przepisu
 *
 * Wyświetla nazwę składnika, ilość z jednostką oraz makroskładniki.
 * Zgodnie z US-013: przy każdym składniku pokazuje jego wkład w makro.
 *
 * Format wyświetlania:
 * - Jeśli jest konwersja: "1 sztuka (60g)"
 * - Jeśli brak konwersji: "60g"
 */

import { formatMacro, formatIngredientAmount } from '@/types/recipes-view.types'
import type { IngredientDTO } from '@/types/dto.types'

interface IngredientItemProps {
  ingredient: IngredientDTO
}

/**
 * Komponent prezentacyjny pojedynczego składnika
 *
 * @example
 * ```tsx
 * <IngredientItem
 *   ingredient={{
 *     id: 5,
 *     name: 'Jajko',
 *     amount: 60,
 *     unit: 'g',
 *     display_amount: 1,
 *     display_unit: 'sztuka',
 *     calories: 234,
 *     protein_g: 21.0,
 *     carbs_g: 1.5,
 *     fats_g: 15.0,
 *     category: 'eggs',
 *     is_scalable: false
 *   }}
 * />
 * // Renders: "1 sztuka (60g)"
 * ```
 */
export function IngredientItem({ ingredient }: IngredientItemProps) {
  return (
    <div className='border-border flex items-start justify-between gap-4 border-b py-3 last:border-0'>
      {/* Nazwa i ilość */}
      <div className='flex-1'>
        <p className='font-medium'>{ingredient.name}</p>
        <p className='text-muted-foreground text-sm'>
          {formatIngredientAmount(ingredient)}
        </p>
      </div>

      {/* Makroskładniki (kompaktowo) */}
      <div className='text-right text-sm'>
        <p className='font-medium'>
          {formatMacro(ingredient.calories, ' kcal')}
        </p>
        <p className='text-muted-foreground text-xs'>
          B: {formatMacro(ingredient.protein_g, 'g')} | W:{' '}
          {formatMacro(ingredient.carbs_g, 'g')} | T:{' '}
          {formatMacro(ingredient.fats_g, 'g')}
        </p>
      </div>
    </div>
  )
}
