/**
 * Komponent listy składników z grupowaniem według kategorii
 *
 * Wyświetla wszystkie składniki przepisu pogrupowane według kategorii
 * (Nabiał, Mięso, Warzywa, etc.) zgodnie z US-013.
 */

import { useMemo } from 'react'
import { IngredientCategory } from './IngredientCategory'
import { groupIngredientsByCategory } from '@/types/recipes-view.types'
import type { IngredientDTO } from '@/types/dto.types'

interface IngredientsListProps {
  ingredients: IngredientDTO[]
}

/**
 * Komponent prezentacyjny listy składników z grupowaniem
 *
 * @example
 * ```tsx
 * <IngredientsList
 *   ingredients={[
 *     { id: 5, name: 'Jajko', category: 'eggs', ... },
 *     { id: 22, name: 'Boczek', category: 'meat', ... }
 *   ]}
 * />
 * ```
 */
export function IngredientsList({ ingredients }: IngredientsListProps) {
  // Grupuj składniki według kategorii (memo dla performance)
  const groupedIngredients = useMemo(() => {
    if (!ingredients || ingredients.length === 0) return []
    return groupIngredientsByCategory(ingredients)
  }, [ingredients])

  // Empty state
  if (groupedIngredients.length === 0) {
    return (
      <div className='space-y-4'>
        <h2 className='text-2xl font-bold'>Składniki</h2>
        <p className='text-muted-foreground'>Brak składników</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Nagłówek sekcji */}
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold'>Składniki</h2>
        <p className='text-muted-foreground text-sm'>
          ⚠️ Sprawdź składniki pod kątem swoich alergii i nietolerancji
          pokarmowych
        </p>
      </div>

      {/* Kategorie składników */}
      <div className='space-y-6'>
        {groupedIngredients.map((group) => (
          <IngredientCategory
            key={group.category}
            category={group.category}
            items={group.items}
          />
        ))}
      </div>
    </div>
  )
}
