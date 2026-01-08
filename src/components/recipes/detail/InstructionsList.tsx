/**
 * Komponent listy instrukcji przygotowania przepisu
 *
 * Wyświetla kroki przygotowania w formie numerowanej listy (step by step).
 * Kroki są sortowane według numeru.
 * Automatycznie linkuje do przepisów-składników w tekście kroków.
 */

import { InstructionStep } from './InstructionStep'
import type { RecipeInstructions, RecipeComponentDTO } from '@/types/dto.types'

interface InstructionsListProps {
  instructions: RecipeInstructions
  /** Lista przepisów-składników używanych w przepisie głównym */
  components?: RecipeComponentDTO[]
}

/**
 * Komponent prezentacyjny listy instrukcji
 *
 * @example
 * ```tsx
 * <InstructionsList
 *   instructions={[
 *     { step: 1, description: 'Pokrój chleb keto w kromki.' },
 *     { step: 2, description: 'Podsmaż na patelni.' }
 *   ]}
 *   components={[{ recipe_id: 5, recipe_slug: 'chleb-keto', recipe_name: 'chleb keto', ... }]}
 * />
 * ```
 */
export function InstructionsList({
  instructions,
  components = [],
}: InstructionsListProps) {
  // instructions jest teraz bezpośrednio tablicą kroków
  const steps = Array.isArray(instructions) ? instructions : []

  // Sortuj kroki według numeru (ascending)
  const sortedSteps = [...steps].sort((a, b) => a.step - b.step)

  // Empty state
  if (sortedSteps.length === 0) {
    return <p className='text-muted-foreground text-sm'>Brak instrukcji</p>
  }

  return (
    <div className='space-y-4'>
      {sortedSteps.map((instruction) => (
        <InstructionStep
          key={instruction.step}
          step={instruction.step}
          description={instruction.description}
          components={components}
        />
      ))}
    </div>
  )
}
