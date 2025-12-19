import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        // Meal Category Badges
        breakfast: 'bg-breakfast text-breakfast-foreground border-none',
        lunch: 'bg-lunch text-lunch-foreground border-none',
        snack: 'bg-snack text-snack-foreground border-none',
        dinner: 'bg-dinner text-dinner-foreground border-none',

        // Status Badges
        success: 'bg-success/20 text-success border-none',
        pending: 'bg-bg-tertiary text-text-muted border-none',
        warning: 'bg-warning/20 text-warning border-none',
        error: 'text-error bg-error-bg border-none',
        destructive: 'text-error bg-error-bg border-none',

        // Standard Variants
        default: 'bg-primary text-primary-foreground border-none',
        secondary: 'bg-secondary text-secondary-foreground border-none',
        tertiary: 'bg-tertiary text-tertiary-foreground border-none',
        outline: 'text-text-main border-border border bg-transparent',

        // Difficulty Levels
        easy: 'bg-success/20 text-success border-none',
        medium: 'bg-warning/20 text-warning border-none',
        hard: 'bg-error/20 text-error border-none',

        // Grocery Categories
        grains: 'bg-lunch text-lunch-foreground border-none',
        veggies: 'bg-breakfast text-breakfast-foreground border-none',
        protein: 'bg-snack text-snack-foreground border-none',
        fruits: 'bg-lunch text-lunch-foreground border-none',
        dairy: 'bg-snack text-snack-foreground border-none',
        others: 'bg-dinner text-dinner-foreground border-none',
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
  extends
    React.HTMLAttributes<HTMLDivElement>,
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
