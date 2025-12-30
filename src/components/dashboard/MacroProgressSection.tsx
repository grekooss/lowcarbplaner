/**
 * MacroProgressSection
 *
 * Daily calorie intake card matching glassmorphism design.
 * Displays circular calorie progress and macro rows with Recharts animations.
 */

'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from '@/components/ui/charts'
import { Cell } from 'recharts'
import { Flame, Wheat, Beef, Droplet } from 'lucide-react'

import { useDailyMacros } from '@/hooks/useDailyMacros'
import { calculateRecipeNutritionWithOverrides } from '@/lib/utils/recipe-calculator'
import type { PlannedMealDTO } from '@/types/dto.types'

const COLORS = ['#dc2626', '#ffffff'] // Red (progress) and White (background)

// Color mapping for macros (using CSS variables for consistency)
const MACRO_COLORS = {
  carbs: 'var(--tertiary)', // orange/tertiary
  protein: 'var(--info)', // blue/info
  fat: 'var(--success)', // green/success
  calories: 'var(--primary)', // red/primary
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
  const [isMounted, setIsMounted] = useState(false)
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const data = [
    {
      name: 'progress',
      value: percent,
      remaining: 100 - percent,
    },
  ]

  return (
    <div
      className='border-border-light bg-bg-tertiary w-full overflow-hidden rounded-full border'
      style={{ height }}
    >
      {isMounted && (
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
      )}
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
  isMobile?: boolean
}

export function MacroProgressSection({
  meals,
  targetMacros,
  isToday = true,
  isMobile = false,
}: MacroProgressSectionProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
      key: 'fat' as const,
      label: 'Tłuszcze',
      consumed: macros.consumed.fats_g,
      target: macros.target.fats_g,
      unit: 'g',
      bgColor: 'bg-success',
      icon: Droplet,
      iconColor: 'text-white',
    },
    {
      key: 'carbs' as const,
      label: 'Węglowodany',
      consumed: macros.consumed.carbs_g,
      target: macros.target.carbs_g,
      unit: 'g',
      bgColor: 'bg-tertiary',
      icon: Wheat,
      iconColor: 'text-white',
    },
    {
      key: 'protein' as const,
      label: 'Białko',
      consumed: macros.consumed.protein_g,
      target: macros.target.protein_g,
      unit: 'g',
      bgColor: 'bg-info',
      icon: Beef,
      iconColor: 'text-white',
    },
  ]

  // Dane makroskładników dla wariantu non-today (z wszystkich posiłków)
  const plannedMacroRows = [
    {
      key: 'fat' as const,
      label: 'Tłuszcze',
      value: plannedTotals.fats_g,
      target: macros.target.fats_g,
      unit: 'g',
      bgColor: 'bg-success',
      icon: Droplet,
      iconColor: 'text-white',
    },
    {
      key: 'carbs' as const,
      label: 'Węglowodany',
      value: plannedTotals.carbs_g,
      target: macros.target.carbs_g,
      unit: 'g',
      bgColor: 'bg-tertiary',
      icon: Wheat,
      iconColor: 'text-white',
    },
    {
      key: 'protein' as const,
      label: 'Białko',
      value: plannedTotals.protein_g,
      target: macros.target.protein_g,
      unit: 'g',
      bgColor: 'bg-info',
      icon: Beef,
      iconColor: 'text-white',
    },
  ]

  // Wariant z jednym panelem i paskami postępu:
  // - Dla dni innych niż dzisiaj: pokazuje wszystkie zaplanowane wartości
  // - Dla dzisiaj na mobile: pokazuje wartości z posiłków oznaczonych jako zjedzone
  const showSinglePanel = !isToday || isMobile

  // Wybierz wartości do wyświetlenia w zależności od kontekstu
  const displayCalories = isToday ? caloriesConsumed : plannedTotals.calories
  const displayMacroRows = isToday ? macroRows : plannedMacroRows

  if (showSinglePanel) {
    return (
      <div className='h-full rounded-md border-2 border-white bg-white/40 p-3 shadow-sm backdrop-blur-xl sm:rounded-3xl sm:p-6'>
        <h3 className='mb-3 text-sm font-bold text-gray-800 sm:mb-6 sm:text-lg'>
          Kalorie i makroskładniki
        </h3>
        <div className='space-y-3 sm:space-y-6'>
          {/* Kalorie jako pasek postępu */}
          <div>
            <div className='mb-1 flex items-end justify-between gap-2 sm:mb-2'>
              <div className='flex min-w-0 flex-1 items-center gap-2 sm:gap-3'>
                <div className='bg-primary flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-sm sm:h-8 sm:w-8'>
                  <Flame className='h-3 w-3 text-white sm:h-4 sm:w-4' />
                </div>
                <span className='truncate text-xs font-bold text-gray-700 sm:text-base'>
                  Kalorie
                </span>
              </div>
              <div className='flex-shrink-0 text-right whitespace-nowrap'>
                <span className='text-xs font-bold text-gray-800 sm:text-sm'>
                  {Math.round(displayCalories)}
                </span>
                <span className='ml-1 text-[10px] text-gray-600 sm:text-xs'>
                  / {Math.round(caloriesTarget)} kcal
                </span>
              </div>
            </div>
            <AnimatedProgressBar
              value={displayCalories}
              max={caloriesTarget}
              color={MACRO_COLORS.calories}
              height={isMobile ? 8 : 12}
            />
          </div>

          {/* Makroskładniki */}
          {displayMacroRows.map((row) => {
            const targetValue = Math.max(row.target, 0)
            const Icon = row.icon
            // Dla dzisiaj używamy consumed, dla innych dni value (plannedTotals)
            const displayValue = 'consumed' in row ? row.consumed : row.value

            return (
              <div key={row.key}>
                <div className='mb-1 flex items-end justify-between gap-2 sm:mb-2'>
                  <div className='flex min-w-0 flex-1 items-center gap-2 sm:gap-3'>
                    <div
                      className={`h-6 w-6 rounded-sm sm:h-8 sm:w-8 ${row.bgColor} flex flex-shrink-0 items-center justify-center`}
                    >
                      <Icon
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${row.iconColor}`}
                      />
                    </div>
                    <span className='truncate text-xs font-bold text-gray-700 sm:text-base'>
                      {row.label}
                    </span>
                  </div>
                  <div className='flex-shrink-0 text-right whitespace-nowrap'>
                    <span className='text-xs font-bold text-gray-800 sm:text-sm'>
                      {Math.round(displayValue)}
                    </span>
                    <span className='ml-1 text-[10px] text-gray-600 sm:text-xs'>
                      / {Math.round(targetValue)}g
                    </span>
                  </div>
                </div>
                <AnimatedProgressBar
                  value={displayValue}
                  max={targetValue}
                  color={MACRO_COLORS[row.key]}
                  height={isMobile ? 8 : 12}
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
      <div className='h-full rounded-md border-2 border-white bg-white/40 p-6 shadow-sm backdrop-blur-xl sm:rounded-3xl'>
        <h3 className='mb-1 text-lg font-bold text-gray-800'>Bilans kalorii</h3>
        <p className='mb-2 text-sm text-gray-500'>
          {eatenMealsCount} / {meals.length} posiłków zjedzonych
        </p>

        <div className='relative flex h-56 items-center justify-center'>
          {isMounted && (
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
          )}
          <div className='absolute inset-0 flex flex-col items-center justify-center pb-4'>
            <Flame className='text-primary h-6 w-6' />
            <span className='text-primary mb-1 text-sm font-bold'>kcal</span>
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
      <div className='h-full rounded-md border-2 border-white bg-white/40 p-6 shadow-sm backdrop-blur-xl sm:rounded-3xl'>
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
                      {Math.round(row.consumed)}
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
