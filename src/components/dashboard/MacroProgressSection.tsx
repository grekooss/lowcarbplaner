/**
 * MacroProgressSection
 *
 * Daily calorie intake card matching glassmorphism design.
 * Displays circular calorie progress and macro rows with Recharts animations.
 */

'use client'

import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts'
import { Flame, Wheat, Beef, Droplet } from 'lucide-react'

import { useDailyMacros } from '@/hooks/useDailyMacros'
import { calculateRecipeNutritionWithOverrides } from '@/lib/utils/recipe-calculator'
import type { PlannedMealDTO } from '@/types/dto.types'

const COLORS = ['#dc2626', '#ffffff'] // Red-600 and White

// Color mapping for macros
const MACRO_COLORS = {
  carbs: '#f97316', // orange-500
  protein: '#3b82f6', // blue-500
  fat: '#22c55e', // green-500
  calories: '#dc2626', // red-600
}

interface AnimatedProgressBarProps {
  value: number
  max: number
  color: string
  height?: number
}

function AnimatedProgressBar({
  value,
  max,
  color,
  height = 12,
}: AnimatedProgressBarProps) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0

  const data = [
    {
      name: 'progress',
      value: percent,
      remaining: 100 - percent,
    },
  ]

  return (
    <div
      className='w-full overflow-hidden rounded-full border border-gray-100 bg-gray-100'
      style={{ height }}
    >
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart
          data={data}
          layout='vertical'
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          barCategoryGap={0}
        >
          <XAxis type='number' domain={[0, 100]} hide />
          <YAxis type='category' dataKey='name' hide />
          <Bar
            dataKey='value'
            stackId='progress'
            fill={color}
            radius={[6, 6, 6, 6]}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={800}
            animationEasing='ease-out'
          />
          <Bar
            dataKey='remaining'
            stackId='progress'
            fill='transparent'
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

interface MacroProgressSectionProps {
  meals: PlannedMealDTO[]
  targetMacros: {
    target_calories: number
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  }
  isToday?: boolean
}

export function MacroProgressSection({
  meals,
  targetMacros,
  isToday = true,
}: MacroProgressSectionProps) {
  const macros = useDailyMacros({
    meals,
    targetCalories: targetMacros.target_calories,
    targetProteinG: targetMacros.target_protein_g,
    targetCarbsG: targetMacros.target_carbs_g,
    targetFatsG: targetMacros.target_fats_g,
  })

  const eatenMealsCount = meals.filter((meal) => meal.is_eaten).length

  // Oblicz sumy z WSZYSTKICH posiłków (zaplanowanych) - dla dni innych niż dzisiaj
  const plannedTotals = useMemo(() => {
    return meals.reduce(
      (acc, meal) => {
        const nutrition = calculateRecipeNutritionWithOverrides(
          meal.recipe,
          meal.ingredient_overrides
        )
        return {
          calories: acc.calories + nutrition.calories,
          protein_g: acc.protein_g + nutrition.protein_g,
          carbs_g: acc.carbs_g + nutrition.carbs_g,
          fats_g: acc.fats_g + nutrition.fats_g,
        }
      },
      { calories: 0, protein_g: 0, carbs_g: 0, fats_g: 0 }
    )
  }, [meals])

  const caloriesConsumed = macros.consumed.calories
  const caloriesTarget = Math.max(macros.target.calories, 0)
  const remainingCalories = Math.max(0, caloriesTarget - caloriesConsumed)

  const chartData = [
    { name: 'Consumed', value: caloriesConsumed },
    { name: 'Remaining', value: remainingCalories },
  ]

  const macroRows = [
    {
      key: 'carbs' as const,
      label: 'Węglowodany',
      consumed: macros.consumed.carbs_g,
      target: macros.target.carbs_g,
      unit: 'g',
      bgColor: 'bg-orange-500',
      icon: Wheat,
      iconColor: 'text-white',
    },
    {
      key: 'protein' as const,
      label: 'Białko',
      consumed: macros.consumed.protein_g,
      target: macros.target.protein_g,
      unit: 'g',
      bgColor: 'bg-blue-500',
      icon: Beef,
      iconColor: 'text-white',
    },
    {
      key: 'fat' as const,
      label: 'Tłuszcze',
      consumed: macros.consumed.fats_g,
      target: macros.target.fats_g,
      unit: 'g',
      bgColor: 'bg-green-500',
      icon: Droplet,
      iconColor: 'text-white',
    },
  ]

  // Dane makroskładników dla wariantu non-today (z wszystkich posiłków)
  const plannedMacroRows = [
    {
      key: 'carbs' as const,
      label: 'Węglowodany',
      value: plannedTotals.carbs_g,
      target: macros.target.carbs_g,
      unit: 'g',
      bgColor: 'bg-orange-500',
      icon: Wheat,
      iconColor: 'text-white',
    },
    {
      key: 'protein' as const,
      label: 'Białko',
      value: plannedTotals.protein_g,
      target: macros.target.protein_g,
      unit: 'g',
      bgColor: 'bg-blue-500',
      icon: Beef,
      iconColor: 'text-white',
    },
    {
      key: 'fat' as const,
      label: 'Tłuszcze',
      value: plannedTotals.fats_g,
      target: macros.target.fats_g,
      unit: 'g',
      bgColor: 'bg-green-500',
      icon: Droplet,
      iconColor: 'text-white',
    },
  ]

  // Wariant dla dni innych niż dzisiaj - jeden wspólny panel
  if (!isToday) {
    return (
      <div className='h-full rounded-3xl border-2 border-white bg-white/40 p-6 shadow-sm backdrop-blur-xl'>
        <h3 className='mb-6 text-lg font-bold text-gray-800'>
          Kalorie i makroskładniki
        </h3>
        <div className='space-y-6'>
          {/* Kalorie jako pasek postępu */}
          <div>
            <div className='mb-2 flex items-end justify-between gap-2'>
              <div className='flex min-w-0 flex-1 items-center gap-3'>
                <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm bg-red-600'>
                  <Flame className='h-4 w-4 text-white' />
                </div>
                <span className='truncate font-bold text-gray-700'>
                  Kalorie
                </span>
              </div>
              <div className='flex-shrink-0 text-right whitespace-nowrap'>
                <span className='text-sm font-bold text-gray-800'>
                  {Math.round(plannedTotals.calories)}
                </span>
                <span className='ml-1 text-xs text-gray-600'>
                  / {Math.round(caloriesTarget)} kcal
                </span>
              </div>
            </div>
            <AnimatedProgressBar
              value={plannedTotals.calories}
              max={caloriesTarget}
              color={MACRO_COLORS.calories}
            />
          </div>

          {/* Makroskładniki */}
          {plannedMacroRows.map((row) => {
            const targetValue = Math.max(row.target, 0)
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
                      {Math.round(row.value)}g
                    </span>
                    <span className='ml-1 text-xs text-gray-600'>
                      / {Math.round(targetValue)}g
                    </span>
                  </div>
                </div>
                <AnimatedProgressBar
                  value={row.value}
                  max={targetValue}
                  color={MACRO_COLORS[row.key]}
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Wariant dla dzisiaj - dwa panele (okrąg kalorii + makroskładniki)
  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-1'>
      {/* Calorie Balance Card */}
      <div className='h-full rounded-3xl border-2 border-white bg-white/40 p-6 shadow-sm backdrop-blur-xl'>
        <h3 className='mb-1 text-lg font-bold text-gray-800'>Bilans kalorii</h3>
        <p className='mb-2 text-sm text-gray-500'>
          {eatenMealsCount} / {meals.length} posiłków zjedzonych
        </p>

        <div className='relative flex h-56 items-center justify-center'>
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
                isAnimationActive={true}
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
          <div className='absolute inset-0 flex flex-col items-center justify-center pb-4'>
            <Flame className='h-6 w-6 text-red-600' />
            <span className='mb-1 text-sm font-bold text-red-600'>kcal</span>
            <div className='flex items-baseline gap-1'>
              <span className='text-4xl font-bold text-gray-800'>
                {Math.round(caloriesConsumed)}
              </span>
              <span className='text-lg text-gray-400'>
                / {Math.round(caloriesTarget)}
              </span>
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
                <AnimatedProgressBar
                  value={row.consumed}
                  max={targetValue}
                  color={MACRO_COLORS[row.key]}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
