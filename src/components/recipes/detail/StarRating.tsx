/**
 * Interaktywny komponent oceny gwiazdkami
 *
 * Pozwala użytkownikom oceniać przepisy od 1 do 5 gwiazdek.
 * Obsługuje hover preview i zapisywanie oceny przez Server Action.
 */

'use client'

import { useState, useTransition } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { rateRecipe } from '@/lib/actions/recipe-ratings'

interface StarRatingProps {
  /** ID przepisu do oceny */
  recipeId: number
  /** Aktualna ocena użytkownika (1-5) lub null jeśli nie oceniał */
  userRating: number | null
  /** Średnia ocena przepisu (do wyświetlenia) */
  averageRating?: number | null
  /** Liczba wszystkich ocen */
  reviewsCount?: number
  /** Callback po zapisaniu oceny (opcjonalny) */
  onRatingChange?: (newRating: number) => void
  /** Czy użytkownik jest zalogowany */
  isAuthenticated?: boolean
  /** Rozmiar gwiazdek: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg'
  /** Czy pokazywać tylko odczyt (bez interakcji) */
  readOnly?: boolean
  /** Dodatkowe klasy CSS */
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

/**
 * Interaktywny komponent gwiazdek do oceniania przepisów
 */
export function StarRating({
  recipeId,
  userRating,
  averageRating,
  reviewsCount = 0,
  onRatingChange,
  isAuthenticated = false,
  size = 'md',
  readOnly = false,
  className,
}: StarRatingProps) {
  // Stan dla hover preview
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  // Stan dla animacji zapisu
  const [isPending, startTransition] = useTransition()
  // Lokalny stan oceny (optimistic update)
  const [localRating, setLocalRating] = useState<number | null>(userRating)
  // Błąd zapisu
  const [error, setError] = useState<string | null>(null)

  // Aktualna ocena do wyświetlenia (hover > local > user > average)
  const displayRating = hoverRating ?? localRating ?? averageRating ?? 0

  // Czy gwiazdki są interaktywne
  const isInteractive = !readOnly && isAuthenticated && !isPending

  const handleClick = (rating: number) => {
    if (!isInteractive) return

    setError(null)
    setLocalRating(rating) // Optimistic update

    startTransition(async () => {
      const result = await rateRecipe(recipeId, rating)

      if (result.error) {
        setError(result.error)
        setLocalRating(userRating) // Rollback
      } else {
        onRatingChange?.(rating)
      }
    })
  }

  const handleMouseEnter = (rating: number) => {
    if (isInteractive) {
      setHoverRating(rating)
    }
  }

  const handleMouseLeave = () => {
    setHoverRating(null)
  }

  return (
    <div className={cn('space-y-1', className)}>
      {/* Gwiazdki */}
      <div className='flex items-center gap-1'>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= Math.round(displayRating)
          const isUserRated = localRating !== null && star <= localRating

          return (
            <button
              key={star}
              type='button'
              disabled={!isInteractive}
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              className={cn(
                'transition-all duration-150',
                isInteractive
                  ? 'cursor-pointer hover:scale-110'
                  : 'cursor-default',
                isPending && 'opacity-50'
              )}
              aria-label={`Oceń na ${star} ${star === 1 ? 'gwiazdkę' : star < 5 ? 'gwiazdki' : 'gwiazdek'}`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-colors duration-150',
                  isFilled || (hoverRating && star <= hoverRating)
                    ? isUserRated || hoverRating
                      ? 'fill-red-500 text-red-500' // Użytkownik ocenił lub hover
                      : 'fill-red-400 text-red-400' // Średnia ocena
                    : 'fill-gray-200 text-gray-200'
                )}
              />
            </button>
          )
        })}

        {/* Loading indicator */}
        {isPending && (
          <Loader2 className='ml-1 h-4 w-4 animate-spin text-gray-400' />
        )}
      </div>

      {/* Informacje o ocenie */}
      <div className='flex items-center gap-2 text-xs'>
        {/* Średnia ocena */}
        {averageRating && averageRating > 0 && (
          <span className='font-semibold text-gray-700'>
            {averageRating.toFixed(1)}/5
          </span>
        )}

        {/* Liczba ocen */}
        {reviewsCount > 0 && (
          <span className='text-gray-500'>
            ({reviewsCount}{' '}
            {reviewsCount === 1 ? 'ocena' : reviewsCount < 5 ? 'oceny' : 'ocen'}
            )
          </span>
        )}

        {/* Twoja ocena */}
        {localRating && !readOnly && (
          <span className='text-red-600'>Twoja ocena: {localRating}</span>
        )}

        {/* Zachęta do logowania */}
        {!isAuthenticated && !readOnly && (
          <span className='text-gray-400'>Zaloguj się, aby ocenić</span>
        )}
      </div>

      {/* Błąd */}
      {error && (
        <p className='text-xs text-red-500' role='alert'>
          {error}
        </p>
      )}
    </div>
  )
}
