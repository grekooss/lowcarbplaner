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
  // Wyciągnij kroki z nowej struktury
  const steps = instructions.steps || []

  // Sortuj kroki według numeru (ascending)
  const sortedSteps = [...steps].sort((a, b) => a.step - b.step)

  // Empty state
  if (sortedSteps.length === 0) {
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

      {/* Wyświetl czasy przygotowania i gotowania (jeśli dostępne) */}
      {(instructions.prep_time_minutes || instructions.cook_time_minutes) && (
        <div className='text-muted-foreground flex gap-4 text-sm'>
          {instructions.prep_time_minutes && (
            <div className='flex items-center gap-2'>
              <span className='font-medium'>Przygotowanie:</span>
              <span>{instructions.prep_time_minutes} min</span>
            </div>
          )}
          {instructions.cook_time_minutes && (
            <div className='flex items-center gap-2'>
              <span className='font-medium'>Gotowanie:</span>
              <span>{instructions.cook_time_minutes} min</span>
            </div>
          )}
        </div>
      )}

      {/* Lista kroków */}
      <div className='space-y-6'>
        {sortedSteps.map((instruction) => (
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
