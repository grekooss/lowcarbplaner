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
  // Sortuj kroki według numeru (ascending)
  const sortedInstructions = [...instructions].sort((a, b) => a.step - b.step)

  // Empty state
  if (sortedInstructions.length === 0) {
    return (
      <div className='space-y-4'>
        <h2 className='text-2xl font-bold'>Instrukcje przygotowania</h2>
        <p className='text-muted-foreground'>Brak instrukcji</p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Nagłówek sekcji */}
      <h2 className='text-2xl font-bold'>Instrukcje przygotowania</h2>

      {/* Lista kroków */}
      <div className='space-y-6'>
        {sortedInstructions.map((instruction) => (
          <InstructionStep
            key={instruction.step}
            step={instruction.step}
            description={instruction.description}
          />
        ))}
      </div>
    </div>
  )
}
