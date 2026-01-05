/**
 * VisuallyHidden component
 * Ukrywa element wizualnie, ale pozostawia go dostępnym dla screen readers
 * Uses Tailwind's sr-only class for CSP compliance
 */

import * as React from 'react'

interface VisuallyHiddenProps {
  children: React.ReactNode
}

export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return <span className='sr-only'>{children}</span>
}
