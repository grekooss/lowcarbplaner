/**
 * Komponent przycisku "Załaduj więcej"
 *
 * Przycisk do infinite loading z loading state i disabled state.
 * Używany w RecipesBrowserClient.
 */

'use client'

import { Loader2 } from 'lucide-react'

interface LoadMoreButtonProps {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
}

/**
 * Komponent interaktywny przycisku "Załaduj więcej"
 *
 * @example
 * ```tsx
 * <LoadMoreButton
 *   hasMore={hasNextPage}
 *   isLoading={isFetchingNextPage}
 *   onLoadMore={() => fetchNextPage()}
 * />
 * ```
 */
export function LoadMoreButton({
  hasMore,
  isLoading,
  onLoadMore,
}: LoadMoreButtonProps) {
  // Nie pokazuj przycisku jeśli nie ma więcej wyników
  if (!hasMore && !isLoading) {
    return null
  }

  return (
    <div className='flex justify-center py-8'>
      <button
        type='button'
        onClick={onLoadMore}
        disabled={isLoading || !hasMore}
        className='text-text-main hover:border-primary hover:text-primary disabled:hover:text-text-main min-w-[200px] rounded-sm border-2 border-transparent bg-white px-6 py-3 text-sm font-bold tracking-wider uppercase transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-transparent'
      >
        {isLoading ? (
          <span className='flex items-center justify-center'>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Ładowanie...
          </span>
        ) : (
          'Załaduj więcej'
        )}
      </button>
    </div>
  )
}
