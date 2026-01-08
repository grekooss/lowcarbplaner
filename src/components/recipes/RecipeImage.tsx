/**
 * Komponent obrazka przepisu z obsługą błędów
 *
 * Automatycznie wyświetla placeholder gdy:
 * - brak URL obrazka
 * - błąd ładowania (400, 404, itp.)
 */

'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { RecipeImagePlaceholder } from '@/components/recipes/RecipeImagePlaceholder'

interface RecipeImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  /** URL obrazka lub null/undefined */
  src: string | null | undefined
  /** Nazwa przepisu - używana do generowania placeholdera */
  recipeName: string
}

/**
 * Obrazek przepisu z automatycznym fallback do placeholdera
 *
 * @example
 * ```tsx
 * <RecipeImage
 *   src={recipe.image_url}
 *   recipeName={recipe.name}
 *   alt={recipe.name}
 *   fill
 *   className="object-cover"
 * />
 * ```
 */
export function RecipeImage({
  src,
  recipeName,
  alt,
  ...props
}: RecipeImageProps) {
  const [hasError, setHasError] = useState(false)

  // Brak URL lub błąd ładowania → placeholder
  if (!src || hasError) {
    return <RecipeImagePlaceholder recipeName={recipeName} />
  }

  return (
    <Image src={src} alt={alt} onError={() => setHasError(true)} {...props} />
  )
}
