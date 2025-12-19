import * as React from 'react'

import { cn } from '@/lib/utils'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'border-border text-text-main placeholder:text-text-disabled flex h-10 w-full rounded-[8px] border-[1.5px] bg-white px-4 py-2.5 text-sm transition-all',
          'focus:border-primary focus:ring-0 focus:outline-none',
          'disabled:bg-bg-tertiary disabled:border-border disabled:cursor-not-allowed',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
