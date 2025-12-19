/**
 * Komponent przełączania między widokiem siatki i listy
 *
 * Toggle buttons dla Grid/List view.
 */

'use client'

import { Grid3x3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ViewMode = 'grid' | 'list'

interface ViewToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

/**
 * Komponent przełączania widoku przepisów
 *
 * @example
 * ```tsx
 * <ViewToggle
 *   mode={viewMode}
 *   onChange={(mode) => setViewMode(mode)}
 * />
 * ```
 */
export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className='flex h-[34px] items-center gap-0.5 rounded-sm border border-white bg-white px-1'>
      <Button
        variant='ghost'
        size='icon-sm'
        onClick={() => onChange('grid')}
        aria-label='Widok siatki'
        className={`h-6 w-6 rounded-sm transition-all ${
          mode === 'grid'
            ? 'bg-primary shadow-primary/20 hover:bg-primary text-white shadow-sm'
            : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-main'
        }`}
      >
        <Grid3x3 className='h-3.5 w-3.5' />
      </Button>
      <Button
        variant='ghost'
        size='icon-sm'
        onClick={() => onChange('list')}
        aria-label='Widok listy'
        className={`h-6 w-6 rounded-sm transition-all ${
          mode === 'list'
            ? 'bg-primary shadow-primary/20 hover:bg-primary text-white shadow-sm'
            : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-main'
        }`}
      >
        <List className='h-3.5 w-3.5' />
      </Button>
    </div>
  )
}
