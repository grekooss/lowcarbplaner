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
}: EditableIngredientRowProps) {
  const [localValue, setLocalValue] = useState(currentAmount.toString())
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  // Sync local value when currentAmount changes externally
  useEffect(() => {
    setLocalValue(currentAmount.toString())
  }, [currentAmount])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalValue(value)
    setError(null)
    setWarning(null)

    // Parse and validate
    const numValue = parseFloat(value)
    if (!value || isNaN(numValue)) {
      return
    }

    const result = onAmountChange(ingredient.id, numValue)
    if (!result.success && result.error) {
      setError(result.error)
    } else if (result.warning) {
      setWarning(result.warning)
    }
  }

  const handleIncrement = () => {
    const result = onIncrement(ingredient.id)
    setError(null)
    setWarning(null)
    if (!result.success && result.error) {
      setError(result.error)
    } else if (result.warning) {
      setWarning(result.warning)
    }
  }

  const handleDecrement = () => {
    const result = onDecrement(ingredient.id)
    setError(null)
    setWarning(null)
    if (!result.success && result.error) {
      setError(result.error)
    } else if (result.warning) {
      setWarning(result.warning)
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
        'space-y-1 rounded-lg px-3 py-3',
        isChecked && 'bg-red-50/50'
      )}
    >
      <div className='flex items-center gap-3'>
        {/* Checkbox */}
        <div
          className={cn(
            'flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded-md border-2 transition-all duration-200',
            isChecked
              ? 'border-red-500 bg-red-500'
              : 'border-gray-300 bg-white hover:border-red-600'
          )}
          onClick={handleCheckboxClick}
          onKeyDown={handleCheckboxKeyDown}
          role='checkbox'
          aria-checked={isChecked}
          tabIndex={0}
        >
          {isChecked && (
            <Check className='h-4 w-4 text-white' strokeWidth={3} />
          )}
        </div>

        {/* Ingredient name */}
        <div className='flex-1'>
          <p
            className={cn(
              'text-sm font-medium transition-all duration-200',
              isChecked ? 'text-gray-400 line-through' : 'text-gray-800'
            )}
          >
            {ingredient.name}
            {isChanged && !isAutoAdjusted && (
              <span className='ml-2 text-xs text-red-500'>(zmieniono)</span>
            )}
          </p>
        </div>

        {/* Amount display + controls */}
        {ingredient.is_scalable ? (
          <div
            className={cn(
              'flex items-center gap-1 transition-all duration-200',
              isChecked ? 'opacity-50' : ''
            )}
          >
            {/* Minus button */}
            <button
              type='button'
              onClick={handleDecrement}
              disabled={currentAmount <= 0}
              className='flex h-6 w-6 items-center justify-center rounded-md border-2 border-gray-300 bg-white transition-all duration-200 hover:border-red-600 disabled:opacity-50'
            >
              <Minus className='h-3.5 w-3.5 text-gray-600' />
            </button>

            {/* Amount display */}
            <div className='flex items-baseline whitespace-nowrap'>
              <Input
                type='number'
                value={localValue}
                onChange={handleInputChange}
                className={cn(
                  'h-auto w-14 [appearance:textfield] border-0 bg-transparent p-0 text-center text-lg font-bold text-gray-800 shadow-none focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                  error && 'text-red-500'
                )}
                step='1'
                min='0'
              />
              <span className='-ml-1 text-sm text-gray-500'>
                {ingredient.unit}
              </span>
            </div>

            {/* Plus button */}
            <button
              type='button'
              onClick={handleIncrement}
              className='flex h-6 w-6 items-center justify-center rounded-md border-2 border-gray-300 bg-white transition-all duration-200 hover:border-red-600'
            >
              <Plus className='h-3.5 w-3.5 text-gray-600' />
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
            <span className='text-lg font-bold text-gray-800'>
              {currentAmount}
            </span>
            <span className='text-sm text-gray-500'>{ingredient.unit}</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <p className='pl-10 text-xs text-red-500'>{error}</p>}

      {/* Warning message */}
      {warning && <p className='pl-10 text-xs text-red-500'>{warning}</p>}
    </div>
  )
}
