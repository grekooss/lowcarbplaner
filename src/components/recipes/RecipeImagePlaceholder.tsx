/**
 * Komponent placeholder dla brakujących zdjęć przepisów
 *
 * Wyświetla ładny gradient z ikoną zamiast pustego miejsca.
 */

'use client'

import { ChefHat } from 'lucide-react'

interface RecipeImagePlaceholderProps {
  recipeName?: string
}

/**
 * Placeholder dla przepisów bez zdjęcia
 *
 * @example
 * ```tsx
 * <RecipeImagePlaceholder recipeName="Jajecznica" />
 * ```
 */
export function RecipeImagePlaceholder({
  recipeName,
}: RecipeImagePlaceholderProps) {
  // Losowy gradient na podstawie nazwy przepisu (deterministyczny)
  const gradients = [
    'from-green-400 to-green-600',
    'from-orange-400 to-orange-600',
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-yellow-400 to-yellow-600',
    'from-teal-400 to-teal-600',
    'from-indigo-400 to-indigo-600',
  ]

  // Hash prostej nazwy do indeksu gradientu (deterministyczny)
  const hash =
    recipeName?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) ||
    0
  const gradientClass = gradients[hash % gradients.length]

  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-3xl bg-gradient-to-br ${gradientClass}`}
    >
      <div className='flex flex-col items-center gap-2 text-white'>
        <ChefHat className='h-12 w-12 opacity-90' strokeWidth={1.5} />
        <p className='text-sm font-medium opacity-80'>Low Carb Recipe</p>
      </div>
    </div>
  )
}
