/**
 * Komponent sekcji pasków postępu makroskładników
 *
 * Kontener dla 4 pasków postępu (kalorie, białko, węglowodany, tłuszcze).
 * Automatycznie oblicza consumed z posiłków oznaczonych jako is_eaten.
 */

'use client'

import { MacroProgressBar } from './MacroProgressBar'
import { useDailyMacros } from '@/hooks/useDailyMacros'
import type { PlannedMealDTO } from '@/types/dto.types'

interface MacroProgressSectionProps {
  meals: PlannedMealDTO[]
  targetMacros: {
    target_calories: number
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  }
}

/**
 * Sekcja pasków postępu dla makroskładników
 *
 * Automatycznie agreguje consumed z posiłków is_eaten: true
 * i wyświetla 4 paski postępu w responsywnym gridzie.
 *
 * @example
 * ```tsx
 * <MacroProgressSection
 *   meals={plannedMeals}
 *   targetMacros={{
 *     target_calories: 1800,
 *     target_protein_g: 120,
 *     target_carbs_g: 30,
 *     target_fats_g: 140
 *   }}
 * />
 * ```
 */
export function MacroProgressSection({
  meals,
  targetMacros,
}: MacroProgressSectionProps) {
  // Hook obliczający consumed i target
  const macros = useDailyMacros({
    meals,
    targetCalories: targetMacros.target_calories,
    targetProteinG: targetMacros.target_protein_g,
    targetCarbsG: targetMacros.target_carbs_g,
    targetFatsG: targetMacros.target_fats_g,
  })

  return (
    <section className='space-y-4'>
      {/* Nagłówek sekcji */}
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Postęp dzienny</h2>
        <p className='text-muted-foreground text-sm'>
          {meals.filter((m) => m.is_eaten).length} / {meals.length} posiłków
        </p>
      </div>

      {/* Grid z paskami postępu */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <MacroProgressBar
          label='Kalorie'
          current={macros.consumed.calories}
          target={macros.target.calories}
          unit='kcal'
          variant='calories'
        />

        <MacroProgressBar
          label='Białko'
          current={macros.consumed.protein_g}
          target={macros.target.protein_g}
          unit='g'
          variant='protein'
        />

        <MacroProgressBar
          label='Węglowodany'
          current={macros.consumed.carbs_g}
          target={macros.target.carbs_g}
          unit='g'
          variant='carbs'
        />

        <MacroProgressBar
          label='Tłuszcze'
          current={macros.consumed.fats_g}
          target={macros.target.fats_g}
          unit='g'
          variant='fat'
        />
      </div>
    </section>
  )
}
