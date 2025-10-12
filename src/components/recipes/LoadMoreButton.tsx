/**
 * Komponent przycisku "Załaduj więcej"
 *
 * Przycisk do infinite loading z loading state i disabled state.
 * Używany w RecipesBrowserClient.
 */

'use client'

import { Button } from '@/components/ui/button'
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
      <Button
        variant='outline'
        size='lg'
        onClick={onLoadMore}
        disabled={isLoading || !hasMore}
        className='min-w-[200px]'
      >
        {isLoading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Ładowanie...
          </>
        ) : (
          'Załaduj więcej'
        )}
      </Button>
    </div>
  )
}
