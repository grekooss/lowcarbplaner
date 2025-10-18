/**
 * Komponent pojedynczego kroku instrukcji
 *
 * Wyświetla numer kroku i opis. Używany w InstructionsList.
 */

interface InstructionStepProps {
  step: number
  description: string
}

/**
 * Komponent prezentacyjny pojedynczego kroku instrukcji
 *
 * @example
 * ```tsx
 * <InstructionStep
 *   step={1}
 *   description="Pokrój boczek w kostkę."
 * />
 * ```
 */
export function InstructionStep({ step, description }: InstructionStepProps) {
  return (
    <div className='flex items-start gap-3'>
      {/* Numer kroku - żółte kółko */}
      <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-semibold text-gray-900'>
        {step}
      </div>

      {/* Opis kroku */}
      <div className='flex-1 pt-1'>
        <p className='text-sm leading-relaxed'>{description}</p>
      </div>
    </div>
  )
}
