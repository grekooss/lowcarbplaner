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
    <div className='flex items-center gap-1 rounded-lg border p-1'>
      <Button
        variant={mode === 'grid' ? 'default' : 'ghost'}
        size='sm'
        onClick={() => onChange('grid')}
        className='gap-2'
        aria-label='Widok siatki'
      >
        <Grid3x3 className='h-4 w-4' />
      </Button>
      <Button
        variant={mode === 'list' ? 'default' : 'ghost'}
        size='sm'
        onClick={() => onChange('list')}
        className='gap-2'
        aria-label='Widok listy'
      >
        <List className='h-4 w-4' />
      </Button>
    </div>
  )
}
