/**
 * EditableIngredientRow - Single editable ingredient row
 *
 * Displays ingredient with editable quantity (numeric input + +/- buttons)
 * Only allows editing for ingredients with is_scalable: true
 *
 * Features:
 * - Checkbox: visual toggle only (no effect on amount)
 * - Trash icon: excludes ingredient (sets amount to 0, strikes through name)
 */

'use client'

import { useState, useEffect } from 'react'
import { Minus, Plus, Check, Trash2 } from 'lucide-react'
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
  /** Visual checkbox state (no effect on amount) */
  isChecked?: boolean
  /** Toggle visual checkbox (no effect on amount) */
  onToggleChecked?: (ingredientId: number) => void
  /** Exclude ingredient callback - sets amount to 0 */
  onExclude?: (ingredientId: number) => void
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
  onExclude,
  compact = false,
}: EditableIngredientRowProps) {
  const [localValue, setLocalValue] = useState(currentAmount.toString())
  const [error, setError] = useState<string | null>(null)

  // Check if ingredient is excluded (amount = 0)
  const isExcluded = currentAmount === 0

  // Sync local value when currentAmount changes externally
  useEffect(() => {
    setLocalValue(currentAmount.toString())
  }, [currentAmount])

  const handleIncrement = () => {
    const result = onIncrement(ingredient.id)
    setError(null)
    if (!result.success && result.error) {
      setError(result.error)
    }
  }

  // Increment/decrement by display unit (e.g., +1 sztuka = +60g)
  const handleDisplayUnitIncrement = () => {
    if (!ingredient.display_unit || ingredient.display_amount <= 0) return
    // Oblicz ile gramów odpowiada 1 jednostce display
    const gramsPerUnit = ingredient.amount / ingredient.display_amount
    const newAmount = currentAmount + gramsPerUnit
    const result = onAmountChange(ingredient.id, Math.round(newAmount))
    setError(null)
    if (!result.success && result.error) {
      setError(result.error)
    }
  }

  const handleDisplayUnitDecrement = () => {
    if (!ingredient.display_unit || ingredient.display_amount <= 0) return
    // Oblicz ile gramów odpowiada 1 jednostce display
    const gramsPerUnit = ingredient.amount / ingredient.display_amount
    const newAmount = currentAmount - gramsPerUnit

    // Jeśli wynik <= 0, wyklucz składnik (ustaw na 0)
    if (newAmount <= 0) {
      onExclude?.(ingredient.id)
      return
    }

    const result = onAmountChange(ingredient.id, Math.round(newAmount))
    setError(null)
    if (!result.success && result.error) {
      setError(result.error)
    }
  }

  // Decrement gramów z możliwością wyzerowania (wykluczenia)
  const handleGramDecrement = () => {
    // Jeśli już jest 0 lub wyzerowany - nic nie rób
    if (currentAmount <= 0) return

    // Jeśli wartość jest bardzo mała (<=1g), od razu wyklucz
    if (currentAmount <= 1) {
      onExclude?.(ingredient.id)
      return
    }

    // Standardowy decrement
    const result = onDecrement(ingredient.id)
    setError(null)
    if (!result.success && result.error) {
      setError(result.error)
    }
  }

  // Pozwala na ustawienie 0 w input - wtedy wykluczy składnik
  const handleInputChangeWithExclude = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setLocalValue(value)
    setError(null)

    // Parse and validate
    const numValue = parseFloat(value)
    if (!value || isNaN(numValue)) {
      return
    }

    // Jeśli wartość = 0, wyklucz składnik
    if (numValue <= 0) {
      onExclude?.(ingredient.id)
      return
    }

    const result = onAmountChange(ingredient.id, numValue)
    if (!result.success && result.error) {
      setError(result.error)
    }
  }

  const isChanged = Math.abs(currentAmount - ingredient.amount) > 0.01

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Cannot toggle checkbox when ingredient is excluded
    if (isExcluded) return
    onToggleChecked?.(ingredient.id)
  }

  const handleCheckboxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      // Cannot toggle checkbox when ingredient is excluded
      if (isExcluded) return
      onToggleChecked?.(ingredient.id)
    }
  }

  const handleExcludeClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Cannot exclude when checkbox is checked (unless restoring from excluded state)
    if (isChecked && !isExcluded) return
    if (isExcluded) {
      // Restore to original amount
      onAmountChange(ingredient.id, ingredient.amount)
    } else {
      // Exclude - set to 0
      onExclude?.(ingredient.id)
    }
  }

  return (
    <div
      data-testid='ingredient-row'
      className={cn(
        'space-y-1 rounded-lg',
        compact ? 'px-1 py-2' : 'px-3 py-3',
        isExcluded && 'bg-gray-100/50'
      )}
    >
      <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-3')}>
        {/* Checkbox - visual only, no effect on amount. Disabled when excluded */}
        <div
          className={cn(
            'flex flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200',
            compact ? 'h-4 w-4 rounded' : 'h-6 w-6',
            isExcluded
              ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-50'
              : isChecked
                ? 'border-primary bg-primary cursor-pointer'
                : 'border-border hover:border-primary cursor-pointer bg-white'
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

        {/* Ingredient name - strike through when excluded (amount = 0) */}
        <div className='min-w-0 flex-1'>
          <p
            className={cn(
              'font-medium break-words transition-all duration-200',
              compact ? 'text-[13px] leading-tight' : 'text-sm',
              isExcluded
                ? 'text-gray-400 line-through'
                : isChanged && !isAutoAdjusted
                  ? 'text-primary'
                  : 'text-gray-800'
            )}
          >
            {ingredient.name}
          </p>
        </div>

        {/* Amount display + controls */}
        {ingredient.is_scalable ? (
          <div className='flex items-center gap-1'>
            {/* Controls wrapper - disabled when excluded */}
            <div
              className={cn(
                'flex items-center gap-1 transition-all duration-200',
                isExcluded ? 'pointer-events-none opacity-50' : ''
              )}
            >
              {/* Amount display - pokazuje przyjazną jednostkę z +/- nad gramami z +/- */}
              <div className='flex flex-col items-center gap-1 whitespace-nowrap'>
                {/* Przyjazna jednostka (np. 1 szt) z przyciskami +/- - jeśli dostępna */}
                {ingredient.display_unit && (
                  <div className='flex items-center gap-1'>
                    <button
                      type='button'
                      onClick={handleDisplayUnitDecrement}
                      disabled={currentAmount <= 0 || isExcluded}
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
                    <div className='flex items-baseline'>
                      <span
                        className={cn(
                          'text-center font-bold text-gray-800',
                          compact ? 'text-sm' : 'text-lg'
                        )}
                      >
                        {ingredient.amount > 0
                          ? Math.round(
                              (currentAmount / ingredient.amount) *
                                ingredient.display_amount *
                                10
                            ) / 10
                          : ingredient.display_amount}
                        x
                      </span>
                      <span
                        className={cn(
                          'ml-1 text-gray-500',
                          compact ? 'text-[10px]' : 'text-sm'
                        )}
                      >
                        {ingredient.display_unit}
                      </span>
                    </div>
                    <button
                      type='button'
                      onClick={handleDisplayUnitIncrement}
                      disabled={isExcluded}
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
                )}
                {/* Oryginalna jednostka (g/ml) - edytowalna z przyciskami +/- */}
                <div className='flex items-center gap-1'>
                  <button
                    type='button'
                    onClick={handleGramDecrement}
                    disabled={isExcluded}
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
                  <div className='flex items-baseline'>
                    <Input
                      type='number'
                      value={localValue}
                      onChange={handleInputChangeWithExclude}
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
                      {ingredient.unit}
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={handleIncrement}
                    disabled={isExcluded}
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
              </div>
            </div>

            {/* Trash button - OUTSIDE the disabled wrapper. Disabled when checkbox is checked */}
            {onExclude && (
              <button
                type='button'
                onClick={handleExcludeClick}
                disabled={isChecked && !isExcluded}
                className={cn(
                  'ml-1 flex items-center justify-center rounded-md border-2 transition-all duration-200',
                  compact ? 'h-5 w-5' : 'h-6 w-6',
                  isChecked && !isExcluded
                    ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-50'
                    : isExcluded
                      ? 'border-primary bg-primary/10 hover:bg-primary/20'
                      : 'border-border bg-white hover:border-red-400 hover:bg-red-50'
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
        ) : (
          // Non-scalable ingredients - display only friendly unit (no grams) with trash button
          <div className='flex items-center gap-1'>
            <div
              className={cn(
                'flex items-baseline whitespace-nowrap transition-all duration-200',
                isExcluded ? 'opacity-50' : ''
              )}
            >
              {/* Tylko przyjazna jednostka (np. 2x szczypta) - bez gramów */}
              {ingredient.display_unit ? (
                <>
                  <span
                    className={cn(
                      'font-bold text-gray-800',
                      compact ? 'text-sm' : 'text-lg'
                    )}
                  >
                    {ingredient.amount > 0
                      ? Math.round(
                          (currentAmount / ingredient.amount) *
                            ingredient.display_amount *
                            10
                        ) / 10
                      : ingredient.display_amount}
                    x
                  </span>
                  <span
                    className={cn(
                      'ml-1 text-gray-500',
                      compact ? 'text-[10px]' : 'text-sm'
                    )}
                  >
                    {ingredient.display_unit}
                  </span>
                </>
              ) : (
                // Fallback jeśli brak display_unit - pokaż gramy
                <>
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
                      'ml-1 text-gray-500',
                      compact ? 'text-[10px]' : 'text-sm'
                    )}
                  >
                    {ingredient.unit}
                  </span>
                </>
              )}
            </div>

            {/* Trash button for non-scalable ingredients. Disabled when checkbox is checked */}
            {onExclude && (
              <button
                type='button'
                onClick={handleExcludeClick}
                disabled={isChecked && !isExcluded}
                className={cn(
                  'ml-1 flex items-center justify-center rounded-md border-2 transition-all duration-200',
                  compact ? 'h-5 w-5' : 'h-6 w-6',
                  isChecked && !isExcluded
                    ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-50'
                    : isExcluded
                      ? 'border-primary bg-primary/10 hover:bg-primary/20'
                      : 'border-border bg-white hover:border-red-400 hover:bg-red-50'
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
