/**
 * Komponent siatki przepisów
 *
 * Responsive grid layout wyświetlający karty przepisów.
 * 1 kolumna mobile, 2 tablet, 3 desktop.
 * Reklama Google Ads wstawiana na pozycję 4 (środkową) co 6 elementów.
 */

'use client'

import { RecipeCard } from './RecipeCard'
import { RecipeAdPlaceholder } from './RecipeAdPlaceholder'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipesGridProps {
  recipes: RecipeDTO[]
  onRecipeClick: (recipeId: number) => void
  /** Ukryj badge z typem posiłku (gdy filtr jest aktywny) */
  hideMealTypeBadge?: boolean
}

/**
 * Buduje listę elementów grid z reklamami wstawionymi na środkowe pozycje
 * W układzie 3-kolumnowym reklama pojawia się jako 4 element każdego wiersza z reklamą
 * (pozycje 4, 10, 16... licząc od 1, czyli indeksy 3, 9, 15... po wstawieniu reklam)
 */
function buildGridItems(
  recipes: RecipeDTO[],
  onRecipeClick: (recipeId: number) => void,
  hideMealTypeBadge: boolean
) {
  const items: React.ReactNode[] = []
  let recipeIndex = 0

  // Reklama pojawia się co 6 pozycji w renderze (5 przepisów + 1 reklama)
  // Na pozycji 5 (index 4) każdego takiego cyklu - środek drugiego wiersza
  const AD_INTERVAL = 6 // co ile pozycji w renderze pojawia się cykl
  const AD_POSITION_IN_CYCLE = 4 // pozycja reklamy w cyklu (0-indexed, czyli 5 pozycja)

  let renderPosition = 0

  while (recipeIndex < recipes.length) {
    const positionInCycle = renderPosition % AD_INTERVAL

    if (positionInCycle === AD_POSITION_IN_CYCLE && renderPosition > 0) {
      // Wstaw reklamę na środkową pozycję
      items.push(<RecipeAdPlaceholder key={`ad-${renderPosition}`} />)
    } else {
      // Wstaw przepis
      const recipe = recipes[recipeIndex]
      if (recipe) {
        items.push(
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={onRecipeClick}
            hideMealTypeBadge={hideMealTypeBadge}
          />
        )
        recipeIndex++
      }
    }
    renderPosition++
  }

  return items
}

/**
 * Komponent prezentacyjny siatki przepisów
 *
 * @example
 * ```tsx
 * <RecipesGrid
 *   recipes={recipesArray}
 *   onRecipeClick={(id) => handleRecipeClick(id)}
 * />
 * ```
 */
export function RecipesGrid({
  recipes,
  onRecipeClick,
  hideMealTypeBadge = false,
}: RecipesGridProps) {
  if (recipes.length === 0) {
    return (
      <div className='py-12 text-center'>
        <p className='text-muted-foreground text-lg'>
          Brak przepisów do wyświetlenia
        </p>
      </div>
    )
  }

  const gridItems = buildGridItems(recipes, onRecipeClick, hideMealTypeBadge)

  return (
    <div className='grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
      {gridItems}
    </div>
  )
}
