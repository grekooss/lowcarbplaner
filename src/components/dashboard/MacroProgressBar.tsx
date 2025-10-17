/**
 * Komponent paska postępu dla makroskładnika
 *
 * Wyświetla pasek postępu z semantycznym HTML (<progress>),
 * ARIA labels i kolorowaniem zależnym od procentu realizacji.
 */

'use client'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface MacroProgressBarProps {
  label: string // "Kalorie", "Białko", "Węglowodany", "Tłuszcze"
  current: number
  target: number
  unit: string // "kcal", "g"
  variant?: 'calories' | 'protein' | 'carbs' | 'fat'
}

/**
 * Helper: Określa kolor paska na podstawie procentu realizacji
 * - < 90%: zielony (sukces)
 * - 90-100%: żółty (blisko celu)
 * - > 100%: czerwony (przekroczenie)
 */
function getProgressColor(current: number, target: number): string {
  if (target === 0) return 'bg-muted'

  const percent = (current / target) * 100

  if (percent < 90) return 'bg-green-500'
  if (percent <= 100) return 'bg-yellow-500'
  return 'bg-red-500'
}

/**
 * Helper: Mapowanie variant na kolor paska (alternatywna wersja)
 */
const variantColors = {
  calories: 'bg-green-500',
  protein: 'bg-orange-500',
  carbs: 'bg-yellow-500',
  fat: 'bg-gray-500',
}

/**
 * Komponent paska postępu makroskładnika
 *
 * @example
 * ```tsx
 * <MacroProgressBar
 *   label="Kalorie"
 *   current={1200}
 *   target={1800}
 *   unit="kcal"
 *   variant="calories"
 * />
 * ```
 */
export function MacroProgressBar({
  label,
  current,
  target,
  unit,
  variant,
}: MacroProgressBarProps) {
  // Oblicz procent realizacji (clamp do 100% dla paska wizualnego)
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const actualPercent = target > 0 ? (current / target) * 100 : 0

  // Kolor paska (warunkowy na podstawie procentu lub wariantu)
  const progressColor = variant
    ? variantColors[variant]
    : getProgressColor(current, target)

  return (
    <div className='space-y-2'>
      {/* Górna sekcja: label i wartości */}
      <div className='flex items-center justify-between'>
        <span className='text-foreground text-sm font-medium'>{label}</span>
        <span className='text-muted-foreground text-sm'>
          <span className='text-foreground font-semibold'>
            {Math.round(current)}
          </span>{' '}
          / {Math.round(target)} {unit}
        </span>
      </div>

      {/* Pasek postępu */}
      <Progress
        value={percent}
        className='h-2'
        aria-label={`${label}: ${Math.round(current)} z ${Math.round(target)} ${unit}`}
        aria-valuenow={Math.round(current)}
        aria-valuemin={0}
        aria-valuemax={Math.round(target)}
        indicatorClassName={cn(progressColor)}
      />

      {/* Procent realizacji */}
      <div className='flex justify-end'>
        <span
          className={cn(
            'text-xs font-semibold',
            actualPercent < 90 && 'text-green-600',
            actualPercent >= 90 && actualPercent <= 100 && 'text-yellow-600',
            actualPercent > 100 && 'text-red-600'
          )}
        >
          {Math.round(actualPercent)}%
        </span>
      </div>
    </div>
  )
}
