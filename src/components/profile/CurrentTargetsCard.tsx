/**
 * CurrentTargetsCard component
 *
 * Displays user's current daily nutrition targets (read-only)
 * Glassmorphism style with macro percentages on cards
 */

import { MacroCard } from './MacroCard'
import { parseMacroRatio } from '@/types/onboarding-view.types'
import type { Enums } from '@/types/database.types'

interface CurrentTargetsCardProps {
  targets: {
    target_calories: number
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
    macro_ratio: Enums<'macro_ratio_enum'>
  }
}

export const CurrentTargetsCard = ({ targets }: CurrentTargetsCardProps) => {
  // Parse macro ratio to get percentages
  const ratios = parseMacroRatio(targets.macro_ratio)

  return (
    <div className='rounded-[16px] border-2 border-[var(--glass-border)] bg-white/40 p-6 shadow-[var(--shadow-elevated)] backdrop-blur-[20px]'>
      <div className='mb-6'>
        <h2 className='text-foreground text-xl font-bold'>
          Twoje dzienne cele
        </h2>
        <p className='text-muted-foreground text-sm'>
          Wartości obliczone na podstawie Twoich parametrów
        </p>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <MacroCard
          label='Kalorie'
          value={targets.target_calories}
          unit='kcal'
          variant='calories'
        />
        <MacroCard
          label='Tłuszcze'
          value={targets.target_fats_g}
          unit='g'
          variant='fat'
          percentage={Math.round(ratios.fats * 100)}
        />
        <MacroCard
          label='Węgl. netto'
          value={targets.target_carbs_g}
          unit='g'
          variant='carbs'
          percentage={Math.round(ratios.carbs * 100)}
        />
        <MacroCard
          label='Białko'
          value={targets.target_protein_g}
          unit='g'
          variant='protein'
          percentage={Math.round(ratios.protein * 100)}
        />
      </div>
    </div>
  )
}
