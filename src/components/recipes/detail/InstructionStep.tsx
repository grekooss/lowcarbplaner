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
      {/* Numer kroku - czerwony kwadrat z zaokrągleniami */}
      <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm bg-red-600 text-sm font-bold text-white'>
        {step}
      </div>

      {/* Opis kroku */}
      <div className='flex-1 pt-1'>
        <p className='text-base leading-relaxed font-medium'>{description}</p>
      </div>
    </div>
  )
}
