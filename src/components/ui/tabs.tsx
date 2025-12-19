import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

const tabsListVariants = cva(
  'bg-bg-secondary inline-flex items-center justify-center gap-2 rounded-[8px] p-1',
  {
    variants: {
      variant: {
        default: 'bg-bg-secondary',
        transparent: 'bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
    VariantProps<typeof tabsListVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const tabsTriggerVariants = cva(
  'focus-visible:ring-primary inline-flex items-center justify-center rounded-[8px] px-6 py-3 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-background data-[state=inactive]:text-text-muted hover:data-[state=inactive]:bg-bg-tertiary data-[state=active]:font-semibold',
        breakfast:
          'data-[state=active]:bg-breakfast data-[state=active]:text-breakfast-foreground data-[state=inactive]:bg-background data-[state=inactive]:text-text-muted hover:data-[state=inactive]:bg-breakfast/30 data-[state=active]:font-semibold',
        lunch:
          'data-[state=active]:bg-lunch data-[state=active]:text-lunch-foreground data-[state=inactive]:bg-background data-[state=inactive]:text-text-muted hover:data-[state=inactive]:bg-lunch/30 data-[state=active]:font-semibold',
        snack:
          'data-[state=active]:bg-snack data-[state=active]:text-snack-foreground data-[state=inactive]:bg-background data-[state=inactive]:text-text-muted hover:data-[state=inactive]:bg-snack/30 data-[state=active]:font-semibold',
        dinner:
          'data-[state=active]:bg-dinner data-[state=active]:text-dinner-foreground data-[state=inactive]:bg-background data-[state=inactive]:text-text-muted hover:data-[state=inactive]:bg-dinner/30 data-[state=active]:font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
    VariantProps<typeof tabsTriggerVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant }), className)}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'ring-offset-background focus-visible:ring-primary mt-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
