/**
 * CurrentTargetsCard component
 *
 * Displays user's current daily nutrition targets (read-only)
 * Glassmorphism style
 */

import { MacroCard } from './MacroCard'

interface CurrentTargetsCardProps {
  targets: {
    target_calories: number
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  }
}

export const CurrentTargetsCard = ({ targets }: CurrentTargetsCardProps) => {
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
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        <MacroCard
          label='Kalorie'
          value={targets.target_calories}
          unit='kcal'
          variant='calories'
        />
        <MacroCard
          label='Węglowodany'
          value={targets.target_carbs_g}
          unit='g'
          variant='carbs'
        />
        <MacroCard
          label='Białko'
          value={targets.target_protein_g}
          unit='g'
          variant='protein'
        />
        <MacroCard
          label='Tłuszcze'
          value={targets.target_fats_g}
          unit='g'
          variant='fat'
        />
      </div>
    </div>
  )
}
