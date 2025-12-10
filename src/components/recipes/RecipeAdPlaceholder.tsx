/**
 * Placeholder reklamy Google Ads w liście/siatce przepisów
 *
 * Automatycznie dostosowuje się do kontekstu:
 * - W widoku listy: poziomy układ
 * - W widoku siatki: pionowy układ (pełna wysokość karty)
 */

'use client'

import { MonitorPlay } from 'lucide-react'

interface RecipeAdPlaceholderProps {
  /** Wymusza układ pionowy (dla widoku siatki) */
  variant?: 'list' | 'grid'
}

export function RecipeAdPlaceholder({
  variant = 'grid',
}: RecipeAdPlaceholderProps) {
  if (variant === 'list') {
    return (
      <div className='group flex cursor-pointer flex-col gap-6 rounded-md border-2 border-white bg-white/40 p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl transition-colors hover:bg-white/50 sm:rounded-2xl md:flex-row'>
        {/* Ad Content - pełna szerokość jak zdjęcie w przepisie */}
        <div className='flex h-32 w-full flex-shrink-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-md border-2 border-dashed border-white/50 bg-white/60 transition-colors group-hover:border-red-400/50'>
          <MonitorPlay className='h-10 w-10 text-gray-500 transition-colors group-hover:text-red-500' />
          <div className='text-lg font-bold text-gray-600 transition-colors group-hover:text-red-600'>
            Google Ads
          </div>
          <span className='text-xs font-medium text-gray-400'>
            Treść sponsorowana
          </span>
        </div>
      </div>
    )
  }

  // Widok grid - dopasowany do wysokości RecipeCard
  return (
    <div className='group flex h-full cursor-pointer flex-col rounded-md border-2 border-white bg-white/40 p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] backdrop-blur-xl transition-transform duration-300 hover:scale-[1.01] sm:rounded-2xl'>
      {/* Ad Content - dopasowany do proporcji karty przepisu */}
      <div className='flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden rounded-md border-2 border-dashed border-white/50 bg-white/60 transition-colors group-hover:border-red-400/50'>
        <MonitorPlay className='h-12 w-12 text-gray-500 transition-colors group-hover:text-red-500' />
        <div className='text-xl font-bold text-gray-600 transition-colors group-hover:text-red-600'>
          Google Ads
        </div>
        <span className='text-sm font-medium text-gray-400'>
          Treść sponsorowana
        </span>
      </div>
    </div>
  )
}
