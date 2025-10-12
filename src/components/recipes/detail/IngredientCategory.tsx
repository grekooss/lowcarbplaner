/**
 * Komponent kategorii składników
 *
 * Wyświetla nazwę kategorii (przetłumaczoną na PL) i listę składników w tej kategorii.
 * Używany w IngredientsList do grupowania składników.
 */

import { IngredientItem } from './IngredientItem'
import { INGREDIENT_CATEGORY_LABELS } from '@/types/recipes-view.types'
import type { IngredientDTO } from '@/types/dto.types'
import type { Enums } from '@/types/database.types'

interface IngredientCategoryProps {
  category: Enums<'ingredient_category_enum'>
  items: IngredientDTO[]
}

/**
 * Komponent prezentacyjny kategorii składników
 *
 * @example
 * ```tsx
 * <IngredientCategory
 *   category="eggs"
 *   items={[
 *     { id: 5, name: 'Jajko', amount: 3, unit: 'sztuka', ... }
 *   ]}
 * />
 * ```
 */
export function IngredientCategory({
  category,
  items,
}: IngredientCategoryProps) {
  // Pobierz przetłumaczoną nazwę kategorii
  const categoryLabel = INGREDIENT_CATEGORY_LABELS[category] || category

  return (
    <div className='space-y-2'>
      {/* Nagłówek kategorii */}
      <h3 className='text-foreground text-lg font-semibold'>{categoryLabel}</h3>

      {/* Lista składników w kategorii */}
      <div className='border-border bg-card rounded-lg border p-4'>
        {items.map((ingredient) => (
          <IngredientItem key={ingredient.id} ingredient={ingredient} />
        ))}
      </div>
    </div>
  )
}
