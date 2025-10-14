import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        // Meal Category Badges
        breakfast: 'bg-breakfast-bg text-breakfast-text border-none',
        lunch: 'bg-lunch-bg text-lunch-text border-none',
        snack: 'bg-snack-bg text-snack-text border-none',
        dinner: 'bg-dinner-bg text-dinner-text border-none',

        // Status Badges
        success: 'bg-breakfast-bg text-breakfast-text border-none',
        pending: 'bg-bg-tertiary text-text-muted border-none',
        warning: 'bg-lunch-bg text-lunch-text border-none',
        error: 'text-error border-none bg-[#ffe5e5]',
        destructive: 'text-error border-none bg-[#ffe5e5]',

        // Standard Variants
        default: 'bg-primary text-primary-foreground border-none',
        secondary: 'bg-secondary text-secondary-foreground border-none',
        tertiary: 'bg-tertiary text-tertiary-foreground border-none',
        outline: 'text-text-main border-border border bg-transparent',

        // Difficulty Levels
        easy: 'bg-breakfast-bg text-breakfast-text border-none',
        medium: 'bg-lunch-bg text-lunch-text border-none',
        hard: 'bg-snack-bg text-snack-text border-none',

        // Grocery Categories
        grains: 'bg-lunch-bg text-lunch-text border-none',
        veggies: 'bg-breakfast-bg text-breakfast-text border-none',
        protein: 'bg-snack-bg text-snack-text border-none',
        fruits: 'border-none bg-[#fff4d6] text-[#b8860b]',
        dairy: 'border-none bg-[#f0d9b5] text-[#8b6914]',
        others: 'bg-dinner-bg text-dinner-text border-none',
      },
      size: {
        default: 'h-7 px-3 text-xs',
        sm: 'h-6 px-2 text-[11px]',
        lg: 'h-8 px-4 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
