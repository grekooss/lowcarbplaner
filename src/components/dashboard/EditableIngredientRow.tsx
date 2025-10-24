/**
 * EditableIngredientRow - Single editable ingredient row
 *
 * Displays ingredient with editable quantity (numeric input + +/- buttons)
 * Only allows editing for ingredients with is_scalable: true
 */

'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { IngredientDTO } from '@/types/dto.types'

interface EditableIngredientRowProps {
  ingredient: IngredientDTO
  currentAmount: number
  onAmountChange: (
    ingredientId: number,
    newAmount: number
  ) => { success: boolean; error?: string }
  onIncrement: (ingredientId: number) => { success: boolean; error?: string }
  onDecrement: (ingredientId: number) => { success: boolean; error?: string }
  index: number
}

export function EditableIngredientRow({
  ingredient,
  currentAmount,
  onAmountChange,
  onIncrement,
  onDecrement,
  index,
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
    if (!result.success && result.error) {
      setError(result.error)
    } else {
      setError(null)
    }
  }

  const handleDecrement = () => {
    const result = onDecrement(ingredient.id)
    if (!result.success && result.error) {
      setError(result.error)
    } else {
      setError(null)
    }
  }

  const isChanged = Math.abs(currentAmount - ingredient.amount) > 0.01

  return (
    <div className='space-y-1'>
      <div className='flex items-center gap-3'>
        {/* Index */}
        <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium'>
          {index + 1}
        </div>

        {/* Ingredient name */}
        <div className='flex-1'>
          <p className='text-sm font-medium'>
            {ingredient.name}
            {isChanged && (
              <span className='ml-2 text-xs text-amber-600'>(zmieniono)</span>
            )}
          </p>
        </div>

        {/* Amount controls */}
        {ingredient.is_scalable ? (
          <div className='flex items-center gap-2'>
            {/* Decrement button */}
            <Button
              type='button'
              variant='outline'
              size='icon-sm'
              onClick={handleDecrement}
              disabled={currentAmount <= 0}
              className='h-8 w-8'
            >
              <Minus className='h-4 w-4' />
            </Button>

            {/* Numeric input */}
            <Input
              type='number'
              value={localValue}
              onChange={handleInputChange}
              className={cn(
                'h-8 w-20 text-center text-sm',
                error && 'border-red-500'
              )}
              step='1'
              min='0'
            />

            {/* Unit */}
            <span className='text-muted-foreground w-8 text-sm'>
              {ingredient.unit}
            </span>

            {/* Increment button */}
            <Button
              type='button'
              variant='outline'
              size='icon-sm'
              onClick={handleIncrement}
              className='h-8 w-8'
            >
              <Plus className='h-4 w-4' />
            </Button>
          </div>
        ) : (
          // Non-scalable ingredients - display only
          <div className='text-muted-foreground text-sm'>
            {currentAmount} {ingredient.unit}
            <span className='ml-2 text-xs'>(stała ilość)</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <p className='pl-10 text-xs text-red-500'>{error}</p>}
    </div>
  )
}
