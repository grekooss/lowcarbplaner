'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

interface RangeSliderProps extends Omit<
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
  'value' | 'onValueChange'
> {
  value: [number, number]
  onValueChange: (value: [number, number]) => void
}

const RangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  RangeSliderProps
>(({ className, value, onValueChange, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full touch-none items-center select-none',
      className
    )}
    value={value}
    onValueChange={(vals) => onValueChange(vals as [number, number])}
    {...props}
  >
    <SliderPrimitive.Track className='bg-border relative h-2 w-full grow overflow-hidden rounded-full'>
      <SliderPrimitive.Range className='bg-primary absolute h-full' />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className='border-primary ring-offset-background focus-visible:ring-ring block h-5 w-5 rounded-full border-2 bg-white shadow transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50' />
    <SliderPrimitive.Thumb className='border-primary ring-offset-background focus-visible:ring-ring block h-5 w-5 rounded-full border-2 bg-white shadow transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50' />
  </SliderPrimitive.Root>
))
RangeSlider.displayName = 'RangeSlider'

export { RangeSlider }
