/**
 * EditableIngredientRow - Single editable ingredient row
 *
 * Displays ingredient with editable quantity (numeric input + +/- buttons)
 * Only allows editing for ingredients with is_scalable: true
 */

'use client'

import { useState, useEffect } from 'react'
import { Minus, Plus, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { IngredientDTO } from '@/types/dto.types'

interface EditableIngredientRowProps {
  ingredient: IngredientDTO
  currentAmount: number
  isAutoAdjusted?: boolean
  onAmountChange: (
    ingredientId: number,
    newAmount: number
  ) => { success: boolean; error?: string; warning?: string }
  onIncrement: (ingredientId: number) => {
    success: boolean
    error?: string
    warning?: string
  }
  onDecrement: (ingredientId: number) => {
    success: boolean
    error?: string
    warning?: string
  }
  isChecked?: boolean
  onToggleChecked?: (ingredientId: number) => void
  /** Compact mode for mobile view */
  compact?: boolean
}

export function EditableIngredientRow({
  ingredient,
  currentAmount,
  isAutoAdjusted = false,
  onAmountChange,
  onIncrement,
  onDecrement,
  isChecked = false,
  onToggleChecked,
  compact = false,
}: EditableIngredientRowProps) {
  const [localValue, setLocalValue] = useState(currentAmount.toString())
  const [error, setError] = useState<string | null>(null)

  // Sync local value when currentAmount changes externally
  useEffect(() => {
    setLocalValue(currentAmount.toString())
  }, [currentAmount])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalValue(value)
    setError(null)

    // Parse and validate
    const numValue = parseFloat(value)
    if (!value || isNaN(numValue)) {
      return
    }

    const result = onAmountChange(ingredient.id, numValue)
    if (!result.success && result.error) {
      setError(result.error)
    }
  }

  const handleIncrement = () => {
    const result = onIncrement(ingredient.id)
    setError(null)
    if (!result.success && result.error) {
      setError(result.error)
    }
  }

  const handleDecrement = () => {
    const result = onDecrement(ingredient.id)
    setError(null)
    if (!result.success && result.error) {
      setError(result.error)
    }
  }

  const isChanged = Math.abs(currentAmount - ingredient.amount) > 0.01

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleChecked?.(ingredient.id)
  }

  const handleCheckboxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      onToggleChecked?.(ingredient.id)
    }
  }

  return (
    <div
      data-testid='ingredient-row'
      className={cn(
        'space-y-1 rounded-lg',
        compact ? 'px-1 py-2' : 'px-3 py-3',
        isChecked && 'bg-primary/5'
      )}
    >
      <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-3')}>
        {/* Checkbox */}
        <div
          className={cn(
            'flex flex-shrink-0 cursor-pointer items-center justify-center rounded-md border-2 transition-all duration-200',
            compact ? 'h-4 w-4 rounded' : 'h-6 w-6',
            isChecked
              ? 'border-primary bg-primary'
              : 'border-border hover:border-primary bg-white'
          )}
          onClick={handleCheckboxClick}
          onKeyDown={handleCheckboxKeyDown}
          role='checkbox'
          aria-checked={isChecked}
          tabIndex={0}
        >
          {isChecked && (
            <Check
              className={cn(compact ? 'h-2.5 w-2.5' : 'h-4 w-4', 'text-white')}
              strokeWidth={3}
            />
          )}
        </div>

        {/* Ingredient name */}
        <div className='min-w-0 flex-1'>
          <p
            className={cn(
              'font-medium break-words transition-all duration-200',
              compact ? 'text-[13px] leading-tight' : 'text-sm',
              isChecked ? 'text-gray-400 line-through' : 'text-gray-800'
            )}
          >
            {ingredient.name}
            {isChanged && !isAutoAdjusted && !compact && (
              <span className='text-primary ml-2 text-xs'>(zmieniono)</span>
            )}
          </p>
        </div>

        {/* Amount display + controls */}
        {ingredient.is_scalable ? (
          <div
            className={cn(
              'flex items-center gap-1 transition-all duration-200',
              isChecked ? 'pointer-events-none opacity-50' : ''
            )}
          >
            {/* Minus button */}
            <button
              type='button'
              onClick={handleDecrement}
              disabled={currentAmount <= 0 || isChecked}
              className={cn(
                'border-border hover:border-primary flex items-center justify-center rounded-md border-2 bg-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
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

            {/* Amount display */}
            <div className='flex items-baseline whitespace-nowrap'>
              <Input
                type='number'
                value={localValue}
                onChange={handleInputChange}
                disabled={isChecked}
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
                {ingredient.unit}
              </span>
            </div>

            {/* Plus button */}
            <button
              type='button'
              onClick={handleIncrement}
              disabled={isChecked}
              className={cn(
                'border-border hover:border-primary flex items-center justify-center rounded-md border-2 bg-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
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
        ) : (
          // Non-scalable ingredients - display only (shopping list style)
          <div
            className={cn(
              'flex items-baseline gap-1 whitespace-nowrap transition-all duration-200',
              isChecked ? 'opacity-50' : ''
            )}
          >
            <span
              className={cn(
                'font-bold text-gray-800',
                compact ? 'text-sm' : 'text-lg'
              )}
            >
              {currentAmount}
            </span>
            <span
              className={cn(
                'text-gray-500',
                compact ? 'text-[10px]' : 'text-sm'
              )}
            >
              {ingredient.unit}
            </span>
          </div>
        )}
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
