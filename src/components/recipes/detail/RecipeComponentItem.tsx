/**
 * Komponent wyświetlający przepis-składnik (sub-recipe)
 *
 * Gdy przepis używa innego przepisu jako składnika (np. "Chleb keto"),
 * ten komponent wyświetla go w stylu identycznym ze zwykłymi składnikami,
 * z dodatkowym linkiem do przepisu.
 */

import Link from 'next/link'
import { Check, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RecipeComponentDTO } from '@/types/dto.types'

interface RecipeComponentItemProps {
  component: RecipeComponentDTO
  isChecked?: boolean
  onToggle?: () => void
  /** Compact mode for mobile view */
  compact?: boolean
}

/**
 * Formatuje ilość z jednostką
 */
function formatAmount(amount: number, unit: string): string {
  // Zaokrąglij do 1 miejsca po przecinku jeśli potrzeba
  const displayAmount = amount % 1 === 0 ? amount.toString() : amount.toFixed(1)

  // Mapowanie jednostek
  const unitLabels: Record<string, string> = {
    g: 'g',
    ml: 'ml',
    szt: 'szt.',
    porcja: 'porcja',
  }

  return `${displayAmount}${unitLabels[unit] || unit}`
}

/**
 * Komponent prezentacyjny składnika-przepisu
 * Wygląda identycznie jak zwykły składnik, ale z linkiem do przepisu
 *
 * @example
 * ```tsx
 * <RecipeComponentItem
 *   component={{
 *     recipe_id: 5,
 *     recipe_slug: 'chleb-keto',
 *     recipe_name: 'Chleb keto',
 *     required_amount: 60,
 *     unit: 'g',
 *     calories: 120,
 *     protein_g: 5,
 *     carbs_g: 2,
 *     fats_g: 10
 *   }}
 * />
 * ```
 */
export function RecipeComponentItem({
  component,
  isChecked = false,
  onToggle,
  compact = false,
}: RecipeComponentItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Nie wywołuj onToggle gdy klikamy w link
    if ((e.target as HTMLElement).closest('a')) {
      return
    }
    onToggle?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggle?.()
    }
  }

  return (
    <div
      className={cn(
        'group flex items-center rounded-lg border border-white bg-white/70 shadow-sm transition-all duration-200',
        compact ? 'gap-2 px-2 py-2' : 'gap-3 px-3 py-3',
        isChecked ? 'opacity-50' : '',
        onToggle ? 'cursor-pointer' : ''
      )}
      onClick={onToggle ? handleClick : undefined}
      role={onToggle ? 'button' : undefined}
      tabIndex={onToggle ? 0 : undefined}
      onKeyDown={onToggle ? handleKeyDown : undefined}
      aria-pressed={onToggle ? isChecked : undefined}
    >
      {/* Checkbox */}
      {onToggle && (
        <div
          className={cn(
            'flex flex-shrink-0 items-center justify-center rounded-md border-2 shadow-md transition-all duration-200',
            compact ? 'h-4 w-4 rounded' : 'h-6 w-6',
            isChecked
              ? 'border-primary bg-primary'
              : 'hover:border-primary border-white bg-white'
          )}
        >
          {isChecked && (
            <Check
              className={cn(compact ? 'h-2.5 w-2.5' : 'h-4 w-4', 'text-white')}
              strokeWidth={3}
            />
          )}
        </div>
      )}

      {/* Nazwa przepisu jako link */}
      <div className='min-w-0 flex-1'>
        <Link
          href={`/recipes/${component.recipe_slug}`}
          className={cn(
            'inline-flex items-center gap-1 font-medium break-words transition-all duration-200',
            compact ? 'text-[13px] leading-tight' : 'text-sm',
            isChecked
              ? 'pointer-events-none text-gray-400 line-through'
              : 'hover:text-primary text-gray-800 hover:underline'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {component.recipe_name}
          <ExternalLink
            className={cn(
              'opacity-0 transition-opacity group-hover:opacity-100',
              compact ? 'h-2.5 w-2.5' : 'h-3 w-3'
            )}
          />
        </Link>
      </div>

      {/* Ilość */}
      <div className='flex items-baseline whitespace-nowrap'>
        <span
          className={cn(
            'font-bold text-gray-800',
            compact ? 'text-sm' : 'text-lg'
          )}
        >
          {formatAmount(component.required_amount, '')}
        </span>
        <span
          className={cn(
            'ml-0.5 text-gray-500',
            compact ? 'text-[10px]' : 'text-sm'
          )}
        >
          {component.unit}
        </span>
      </div>
    </div>
  )
}
