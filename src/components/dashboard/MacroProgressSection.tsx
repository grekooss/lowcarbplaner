/**
 * MacroProgressSection
 *
 * Daily calorie intake card matching glassmorphism design.
 * Displays circular calorie progress and macro rows.
 */

'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Flame, Wheat, Beef, Droplet } from 'lucide-react'

import { useDailyMacros } from '@/hooks/useDailyMacros'
import type { PlannedMealDTO } from '@/types/dto.types'

const COLORS = ['#dc2626', '#ffffff'] // Red-600 and White

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
  const [mounted] = useState(true)

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
  const remainingCalories = Math.max(0, caloriesTarget - caloriesConsumed)

  const chartData = [
    { name: 'Consumed', value: caloriesConsumed },
    { name: 'Remaining', value: remainingCalories },
  ]

  const macroRows = [
    {
      key: 'carbs',
      label: 'Węglowodany',
      consumed: macros.consumed.carbs_g,
      target: macros.target.carbs_g,
      unit: 'g',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-500',
      icon: Wheat,
      iconColor: 'text-white',
    },
    {
      key: 'protein',
      label: 'Białko',
      consumed: macros.consumed.protein_g,
      target: macros.target.protein_g,
      unit: 'g',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-500',
      icon: Beef,
      iconColor: 'text-white',
    },
    {
      key: 'fat',
      label: 'Tłuszcze',
      consumed: macros.consumed.fats_g,
      target: macros.target.fats_g,
      unit: 'g',
      color: 'bg-green-500',
      bgColor: 'bg-green-500',
      icon: Droplet,
      iconColor: 'text-white',
    },
  ]

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-1'>
      {/* Calorie Balance Card */}
      <div className='h-full rounded-3xl border-2 border-white bg-white/40 p-6 shadow-sm backdrop-blur-xl'>
        <h3 className='mb-2 text-lg font-bold text-gray-800'>Bilans kalorii</h3>
        <p className='mb-6 text-sm text-gray-500'>
          {eatenMealsCount} / {meals.length} posiłków zjedzonych
        </p>

        <div className='relative flex h-64 items-center justify-center'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={80}
                outerRadius={100}
                startAngle={90}
                endAngle={-270}
                dataKey='value'
                stroke='none'
                cornerRadius={10}
                isAnimationActive={mounted}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            <Flame className='mb-2 h-8 w-8 text-red-500' />
            <div className='flex items-baseline gap-1'>
              <span className='text-4xl font-bold text-gray-800'>
                {Math.round(caloriesConsumed)}
              </span>
              <span className='text-lg font-bold text-gray-500'>kcal</span>
            </div>
            <span className='mt-1 text-xs font-bold tracking-wide text-gray-400 uppercase'>
              zjedzonych
            </span>
          </div>
        </div>
      </div>

      {/* Macro Breakdown Card */}
      <div className='h-full rounded-3xl border-2 border-white bg-white/40 p-6 shadow-sm backdrop-blur-xl'>
        <h3 className='mb-6 text-lg font-bold text-gray-800'>Makroskładniki</h3>
        <div className='space-y-6'>
          {macroRows.map((row) => {
            const targetValue = Math.max(row.target, 0)
            const percent =
              targetValue > 0
                ? Math.min((row.consumed / targetValue) * 100, 100)
                : 0
            const Icon = row.icon

            return (
              <div key={row.key}>
                <div className='mb-2 flex items-end justify-between gap-2'>
                  <div className='flex min-w-0 flex-1 items-center gap-3'>
                    <div
                      className={`h-8 w-8 rounded-sm ${row.bgColor} flex flex-shrink-0 items-center justify-center`}
                    >
                      <Icon className={`h-4 w-4 ${row.iconColor}`} />
                    </div>
                    <span className='truncate font-bold text-gray-700'>
                      {row.label}
                    </span>
                  </div>
                  <div className='flex-shrink-0 text-right whitespace-nowrap'>
                    <span className='text-sm font-bold text-gray-800'>
                      {Math.round(row.consumed)}g
                    </span>
                    <span className='ml-1 text-xs text-gray-600'>
                      / {Math.round(targetValue)}g
                    </span>
                  </div>
                </div>
                <div className='h-3 overflow-hidden rounded-full border border-gray-100 bg-gray-100'>
                  <div
                    className={`h-full ${row.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: mounted ? `${percent}%` : '0%' }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
