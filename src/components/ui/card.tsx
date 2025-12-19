import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const cardVariants = cva(
  'bg-background text-foreground rounded-[12px] transition-all',
  {
    variants: {
      variant: {
        // Standard Recipe Card
        default: 'border-border-light border',
        // Hero Card (Featured Recipe)
        hero: 'border-none',
        // Elevated Card (Modals, Dropdowns)
        elevated: 'border-none',
        // Flat Panel (bez cienia)
        flat: 'border-border-light border shadow-none',
        // Meal Card Categories
        breakfast: 'bg-breakfast border-none shadow-none',
        lunch: 'bg-lunch border-none shadow-none',
        snack: 'bg-snack border-none shadow-none',
        dinner: 'bg-dinner border-none shadow-none',
        // Info Panel (szare tło)
        panel: 'bg-bg-secondary border-border-light border shadow-none',
      },
      hoverable: {
        true: 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      hoverable: false,
    },
  }
)

export interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hoverable, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, hoverable, className }))}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-4', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-text-main text-base leading-tight font-semibold tracking-tight',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-text-secondary text-sm leading-relaxed', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-4 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-4 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
}
