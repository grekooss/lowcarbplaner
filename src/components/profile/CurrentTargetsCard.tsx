/**
 * CurrentTargetsCard component
 *
 * Displays user's current daily nutrition targets (read-only)
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
    <div className='card-soft rounded-3xl border-0 p-6 shadow-sm'>
      <div className='mb-6'>
        <h2 className='text-xl font-bold'>Twoje dzienne cele</h2>
        <p className='text-muted-foreground text-sm'>
          Wartości obliczone na podstawie Twoich parametrów
        </p>
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <MacroCard
          label='Kalorie'
          value={targets.target_calories}
          unit='kcal'
          icon='flame'
          color='orange'
        />
        <MacroCard
          label='Białko'
          value={targets.target_protein_g}
          unit='g'
          icon='beef'
          color='red'
        />
        <MacroCard
          label='Węglowodany'
          value={targets.target_carbs_g}
          unit='g'
          icon='wheat'
          color='yellow'
        />
        <MacroCard
          label='Tłuszcze'
          value={targets.target_fats_g}
          unit='g'
          icon='droplet'
          color='blue'
        />
      </div>
    </div>
  )
}
