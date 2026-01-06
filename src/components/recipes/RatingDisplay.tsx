/**
 * Komponent wyświetlający ocenę przepisu (read-only)
 *
 * Pokazuje gwiazdki i średnią ocenę bez możliwości interakcji.
 * Używany na kartach przepisów w widoku listy/siatki.
 */

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingDisplayProps {
  /** Średnia ocena (1-5) lub null jeśli brak ocen */
  rating: number | null
  /** Liczba ocen */
  reviewsCount?: number
  /** Rozmiar gwiazdek */
  size?: 'xs' | 'sm' | 'md'
  /** Czy pokazywać liczbę ocen */
  showCount?: boolean
  /** Dodatkowe klasy CSS */
  className?: string
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
}

const textSizeClasses = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
}

/**
 * Wyświetla gwiazdki oceny (read-only)
 *
 * @example
 * ```tsx
 * <RatingDisplay rating={4.5} reviewsCount={12} />
 * <RatingDisplay rating={3.8} size="sm" showCount={false} />
 * ```
 */
export function RatingDisplay({
  rating,
  reviewsCount = 0,
  size = 'sm',
  showCount = true,
  className,
}: RatingDisplayProps) {
  // Nie pokazuj nic jeśli brak ocen
  if (rating === null || reviewsCount === 0) {
    return null
  }

  const fullStars = Math.floor(rating)
  const hasHalfStar = rating - fullStars >= 0.5

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Gwiazdki */}
      <div className='flex items-center'>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = star <= fullStars
          const isHalf = star === fullStars + 1 && hasHalfStar

          return (
            <Star
              key={star}
              className={cn(
                sizeClasses[size],
                isFull || isHalf
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200'
              )}
            />
          )
        })}
      </div>

      {/* Średnia i liczba ocen */}
      <span className={cn(textSizeClasses[size], 'font-medium text-gray-600')}>
        {rating.toFixed(1)}
        {showCount && <span className='text-gray-400'> ({reviewsCount})</span>}
      </span>
    </div>
  )
}
