/**
 * Komponent listy instrukcji przygotowania przepisu
 *
 * Wyświetla kroki przygotowania w formie numerowanej listy (step by step).
 * Kroki są sortowane według numeru.
 */

import { InstructionStep } from './InstructionStep'
import type { RecipeInstructions } from '@/types/dto.types'

interface InstructionsListProps {
  instructions: RecipeInstructions
}

/**
 * Komponent prezentacyjny listy instrukcji
 *
 * @example
 * ```tsx
 * <InstructionsList
 *   instructions={[
 *     { step: 1, description: 'Pokrój boczek w kostkę.' },
 *     { step: 2, description: 'Podsmaż boczek na patelni.' }
 *   ]}
 * />
 * ```
 */
export function InstructionsList({ instructions }: InstructionsListProps) {
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
        />
      ))}
    </div>
  )
}
