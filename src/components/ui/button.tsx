import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'focus-visible:ring-primary/10 disabled:bg-border disabled:text-text-muted inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-all focus-visible:ring-3 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Primary Button (Zielony)
        default:
          'bg-primary text-primary-foreground hover:bg-primary-dark active:bg-primary-hover rounded-[8px] shadow-sm hover:shadow-md active:shadow-none',
        // Secondary Button (Outlined)
        outline:
          'border-border text-text-main hover:border-primary hover:text-primary active:border-primary-dark rounded-[8px] border-[1.5px] bg-white hover:bg-white active:bg-white',
        // Ghost Button
        ghost:
          'text-text-secondary hover:bg-bg-tertiary active:bg-border rounded-[8px] bg-transparent',
        // Destructive Button
        destructive:
          'bg-error hover:bg-error-hover rounded-[8px] text-white shadow-sm hover:shadow-md active:shadow-none',
        // Link Button
        link: 'text-primary font-medium underline-offset-4 hover:underline',
        // Secondary Filled (żółty)
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary-dark rounded-[8px] shadow-sm hover:shadow-md active:shadow-none',
        // Tertiary Filled (pomarańczowy)
        tertiary:
          'bg-tertiary text-tertiary-foreground hover:bg-tertiary-dark rounded-[8px] shadow-sm hover:shadow-md active:shadow-none',
      },
      size: {
        default: 'h-10 px-6 py-2.5 text-sm',
        sm: 'h-9 px-4 py-2 text-xs',
        lg: 'h-11 px-8 py-3 text-base',
        icon: 'h-9 w-9 p-2',
        'icon-sm': 'h-8 w-8 p-1.5',
        'icon-lg': 'h-10 w-10 p-2.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
