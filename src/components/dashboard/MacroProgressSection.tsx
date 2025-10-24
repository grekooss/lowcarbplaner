/**
 * MacroProgressSection
 *
 * Daily calorie intake card matching dashboard mock.
 * Displays circular calorie progress and macro rows.
 */

'use client'

import { Flame, UtensilsCrossed } from 'lucide-react'

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

export function MacroProgressSection({
  meals,
  targetMacros,
}: MacroProgressSectionProps) {
  const macros = useDailyMacros({
    meals,
    targetCalories: targetMacros.target_calories,
    targetProteinG: targetMacros.target_protein_g,
    targetCarbsG: targetMacros.target_carbs_g,
    targetFatsG: targetMacros.target_fats_g,
  })

  const eatenMealsCount = meals.filter((meal) => meal.is_eaten).length

  const caloriesConsumed = macros.consumed.calories
  const caloriesTarget = Math.max(macros.target.calories, 0)
  const caloriesLeft = Math.max(caloriesTarget - caloriesConsumed, 0)
  const caloriesPercent =
    caloriesTarget > 0 ? Math.min(caloriesConsumed / caloriesTarget, 1) : 0
  const caloriesAngle = Math.round(caloriesPercent * 360)

  const macroRows = [
    {
      key: 'carbs',
      label: 'Weglowodany',
      consumed: macros.consumed.carbs_g,
      target: macros.target.carbs_g,
      unit: 'g',
      color: '#b9e57d',
    },
    {
      key: 'protein',
      label: 'Bialko',
      consumed: macros.consumed.protein_g,
      target: macros.target.protein_g,
      unit: 'g',
      color: '#8bd6ff',
    },
    {
      key: 'fat',
      label: 'Tluszcze',
      consumed: macros.consumed.fats_g,
      target: macros.target.fats_g,
      unit: 'g',
      color: '#f6cb76',
    },
  ]

  const statItems = [
    {
      key: 'eaten',
      icon: UtensilsCrossed,
      value: Math.round(caloriesConsumed),
      unit: 'kcal',
      label: 'Zjedzone kalorie',
      accent: '#c9ea84',
    },
  ]

  return (
    <section className='card-soft rounded-3xl p-6 shadow-sm'>
      <div className='flex flex-col gap-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-foreground text-lg font-semibold'>
              Bilans kalorii
            </h2>
            <p className='text-muted-foreground text-xs'>
              {eatenMealsCount} / {meals.length} posilkow zjedzonych
            </p>
          </div>
          <span className='text-muted-foreground text-2xl leading-none'>
            ...
          </span>
        </div>

        <div className='-mt-2 flex flex-col items-center gap-5'>
          <div
            className='relative flex h-60 w-60 items-center justify-center rounded-full'
            style={{
              background: `conic-gradient(#f5ac4b ${caloriesAngle}deg, #f0e6dd ${caloriesAngle}deg 360deg)`,
            }}
          >
            <div className='absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner'>
              <Flame className='-mt-5 mb-1 h-10 w-10 text-[#f5ac4b]' />
              <div className='mt-1 flex items-baseline gap-2'>
                <span className='text-foreground text-5xl font-bold'>
                  {Math.round(caloriesLeft)}
                </span>
                <span className='text-muted-foreground text-md font-medium'>
                  kcal
                </span>
              </div>
              <span className='text-muted-foreground mt-1 text-xs font-semibold tracking-wide uppercase'>
                Pozostalo kalorii
              </span>
            </div>
          </div>

          <div className='flex w-full flex-wrap justify-center gap-4 lg:max-w-[420px]'>
            {statItems.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.key}
                  className='flex min-w-[180px] flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm'
                >
                  <div
                    className='text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full'
                    style={{ backgroundColor: item.accent }}
                  >
                    <Icon className='text-foreground h-5 w-5' />
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-foreground text-base font-semibold'>
                      {item.value}{' '}
                      <span className='text-muted-foreground text-sm font-medium'>
                        {item.unit}
                      </span>
                    </span>
                    <span className='text-muted-foreground text-xs tracking-wide uppercase'>
                      {item.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className='w-full space-y-3'>
            {macroRows.map((row) => {
              const targetValue = Math.max(row.target, 0)
              const percent =
                targetValue > 0
                  ? Math.min((row.consumed / targetValue) * 100, 999)
                  : 0

              return (
                <div
                  key={row.key}
                  className='flex items-center gap-4 rounded-2xl bg-white px-4 py-3 shadow-sm'
                >
                  <div className='min-w-[70px] text-center'>
                    <div className='text-foreground text-2xl font-bold'>
                      {Math.round(row.consumed)}
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      /{Math.round(targetValue)}
                      {row.unit}
                    </div>
                  </div>
                  <div className='flex flex-1 flex-col gap-2'>
                    <div className='text-foreground flex items-center justify-between text-sm font-semibold'>
                      <span>{row.label}</span>
                      <span>{Math.round(percent)}%</span>
                    </div>
                    <div className='bg-muted h-2 w-full rounded-full'>
                      <div
                        className='h-2 rounded-full'
                        style={{
                          width: `${Math.min(percent, 100)}%`,
                          backgroundColor: row.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
