/**
 * EditableRecipeComponentRow - Editable row for recipe-as-ingredient
 *
 * Displays recipe component (sub-recipe) with editable quantity
 * Similar to EditableIngredientRow but with link to the recipe
 *
 * Features:
 * - Link to component recipe
 * - Editable amount (grams)
 * - Checkbox for visual toggle
 * - Trash icon for exclusion
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Minus, Plus, Check, Trash2, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { RecipeComponentDTO } from '@/types/dto.types'

interface EditableRecipeComponentRowProps {
  component: RecipeComponentDTO
  currentAmount: number
  onAmountChange: (
    recipeId: number,
    newAmount: number
  ) => { success: boolean; error?: string; warning?: string }
  onIncrement: (recipeId: number) => {
    success: boolean
    error?: string
    warning?: string
  }
  onDecrement: (recipeId: number) => {
    success: boolean
    error?: string
    warning?: string
  }
  /** Visual checkbox state */
  isChecked?: boolean
  /** Toggle visual checkbox */
  onToggleChecked?: (recipeId: number) => void
  /** Exclude component callback - sets amount to 0 */
  onExclude?: (recipeId: number) => void
  /** Compact mode for mobile view */
  compact?: boolean
}

export function EditableRecipeComponentRow({
  component,
  currentAmount,
  onAmountChange,
  onIncrement,
  onDecrement,
  isChecked = false,
  onToggleChecked,
  onExclude,
  compact = false,
}: EditableRecipeComponentRowProps) {
  const [localValue, setLocalValue] = useState(currentAmount.toString())
  const [error, setError] = useState<string | null>(null)

  // Check if component is excluded (amount = 0)
  const isExcluded = currentAmount === 0

  // Sync local value when currentAmount changes externally
  useEffect(() => {
    setLocalValue(currentAmount.toString())
  }, [currentAmount])

  const handleIncrement = () => {
    const result = onIncrement(component.recipe_id)
    setError(null)
    if (!result.success && result.error) {
      setError(result.error)
    }
  }

  const handleDecrement = () => {
    if (currentAmount <= 0) return

    if (currentAmount <= 1) {
      onExclude?.(component.recipe_id)
      return
    }

    const result = onDecrement(component.recipe_id)
    setError(null)
    if (!result.success && result.error) {
      setError(result.error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalValue(value)
    setError(null)

    const numValue = parseFloat(value)
    if (!value || isNaN(numValue)) {
      return
    }

    if (numValue <= 0) {
      onExclude?.(component.recipe_id)
      return
    }

    const result = onAmountChange(component.recipe_id, numValue)
    if (!result.success && result.error) {
      setError(result.error)
    }
  }

  const isChanged = Math.abs(currentAmount - component.required_amount) > 0.01

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isExcluded) return
    onToggleChecked?.(component.recipe_id)
  }

  const handleCheckboxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      if (isExcluded) return
      onToggleChecked?.(component.recipe_id)
    }
  }

  const handleExcludeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isChecked && !isExcluded) return
    if (isExcluded) {
      onAmountChange(component.recipe_id, component.required_amount)
    } else {
      onExclude?.(component.recipe_id)
    }
  }

  return (
    <div
      data-testid='recipe-component-row'
      className={cn(
        'space-y-1 rounded-lg border border-white bg-white/70 shadow-sm',
        compact ? 'px-2 py-2' : 'px-3 py-3',
        isExcluded && 'bg-gray-100/50'
      )}
    >
      <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-3')}>
        {/* Checkbox - visual only */}
        <div
          className={cn(
            'flex flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200',
            compact ? 'h-4 w-4 rounded' : 'h-6 w-6',
            isExcluded
              ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-50'
              : isChecked
                ? 'border-primary bg-primary cursor-pointer shadow-md'
                : 'hover:border-primary cursor-pointer border-white bg-white shadow-md'
          )}
          onClick={handleCheckboxClick}
          onKeyDown={handleCheckboxKeyDown}
          role='checkbox'
          aria-checked={isChecked}
          aria-disabled={isExcluded}
          tabIndex={isExcluded ? -1 : 0}
        >
          {isChecked && (
            <Check
              className={cn(compact ? 'h-2.5 w-2.5' : 'h-4 w-4', 'text-white')}
              strokeWidth={3}
            />
          )}
        </div>

        {/* Recipe name with link */}
        <div className='min-w-0 flex-1'>
          <Link
            href={`/recipes/${component.recipe_slug}`}
            className={cn(
              'group inline-flex items-center gap-1 font-medium break-words transition-all duration-200',
              compact ? 'text-[13px] leading-tight' : 'text-sm',
              isExcluded
                ? 'pointer-events-none text-gray-400 line-through'
                : isChanged
                  ? 'text-primary hover:underline'
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

        {/* Amount display + controls */}
        <div className='flex items-center gap-1'>
          <div
            className={cn(
              'flex items-center gap-1 transition-all duration-200',
              isExcluded ? 'pointer-events-none opacity-50' : ''
            )}
          >
            <div className='flex items-center gap-1 whitespace-nowrap'>
              {/* Minus button */}
              <button
                type='button'
                onClick={handleDecrement}
                disabled={isExcluded}
                className={cn(
                  'hover:border-primary flex items-center justify-center rounded-md border border-white bg-white shadow-md transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50',
                  compact ? 'h-5 w-5' : 'h-6 w-6'
                )}
              >
                <Minus
                  className={cn(
                    compact ? 'h-3 w-3' : 'h-3.5 w-3.5',
                    'text-gray-600'
                  )}
                />
              </button>

              {/* Amount input */}
              <div className='flex items-baseline'>
                <Input
                  type='number'
                  value={localValue}
                  onChange={handleInputChange}
                  disabled={isExcluded}
                  className={cn(
                    'h-auto [appearance:textfield] border-0 bg-transparent p-0 text-center font-bold text-gray-800 shadow-none focus-visible:ring-0 disabled:cursor-not-allowed [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                    compact ? 'w-10 text-sm' : 'w-14 text-lg',
                    error && 'text-error'
                  )}
                  step='1'
                  min='0'
                />
                <span
                  className={cn(
                    '-ml-1 text-gray-500',
                    compact ? 'text-[10px]' : 'text-sm'
                  )}
                >
                  {component.unit}
                </span>
              </div>

              {/* Plus button */}
              <button
                type='button'
                onClick={handleIncrement}
                disabled={isExcluded}
                className={cn(
                  'hover:border-primary flex items-center justify-center rounded-md border border-white bg-white shadow-md transition-all duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50',
                  compact ? 'h-5 w-5' : 'h-6 w-6'
                )}
              >
                <Plus
                  className={cn(
                    compact ? 'h-3 w-3' : 'h-3.5 w-3.5',
                    'text-gray-600'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Trash button */}
          {onExclude && (
            <button
              type='button'
              onClick={handleExcludeClick}
              disabled={isChecked && !isExcluded}
              className={cn(
                'ml-1 flex items-center justify-center rounded-md border shadow-md transition-all duration-200',
                compact ? 'h-5 w-5' : 'h-6 w-6',
                isChecked && !isExcluded
                  ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-50'
                  : isExcluded
                    ? 'border-primary bg-primary/10 hover:bg-primary/20'
                    : 'border-white bg-white hover:border-red-400 hover:bg-red-50'
              )}
              title={
                isChecked && !isExcluded
                  ? 'Odznacz checkbox aby wykluczyć'
                  : isExcluded
                    ? 'Przywróć składnik'
                    : 'Wyklucz składnik'
              }
            >
              <Trash2
                className={cn(
                  compact ? 'h-3 w-3' : 'h-3.5 w-3.5',
                  isChecked && !isExcluded
                    ? 'text-gray-300'
                    : isExcluded
                      ? 'text-primary'
                      : 'text-gray-400'
                )}
              />
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className={cn('text-error text-xs', compact ? 'pl-6' : 'pl-10')}>
          {error}
        </p>
      )}
    </div>
  )
}
