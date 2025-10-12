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
    <div className='flex gap-4'>
      {/* Numer kroku - duża wyróżniona cyfra */}
      <div className='bg-primary text-primary-foreground flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold'>
        {step}
      </div>

      {/* Opis kroku */}
      <div className='flex-1 pt-2'>
        <p className='text-base leading-relaxed'>{description}</p>
      </div>
    </div>
  )
}
