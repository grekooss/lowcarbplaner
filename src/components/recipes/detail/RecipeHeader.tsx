/**
 * Komponent nagłówka szczegółów przepisu
 *
 * Wyświetla zdjęcie hero, nazwę przepisu, tagi i meal types.
 * Używany na górze strony szczegółów przepisu.
 */

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { MEAL_TYPE_LABELS } from '@/types/recipes-view.types'
import type { Enums } from '@/types/database.types'
import { getMealTypeBadgeClasses } from '@/lib/styles/mealTypeBadge'

interface RecipeHeaderProps {
  name: string
  imageUrl: string | null
  tags: string[] | null
  mealTypes: Enums<'meal_type_enum'>[]
}

/**
 * Komponent prezentacyjny nagłówka przepisu
 *
 * @example
 * ```tsx
 * <RecipeHeader
 *   name="Jajecznica z boczkiem"
 *   imageUrl="/images/recipes/jajecznica.jpg"
 *   tags={['jajka', 'szybkie', 'patelnia']}
 *   mealTypes={['breakfast']}
 * />
 * ```
 */
export function RecipeHeader({
  name,
  imageUrl,
  tags,
  mealTypes,
}: RecipeHeaderProps) {
  return (
    <div className='space-y-6'>
      {/* Hero Image */}
      {imageUrl && (
        <div className='relative aspect-video w-full overflow-hidden rounded-lg'>
          <Image
            src={imageUrl}
            alt={name}
            fill
            className='object-cover'
            priority
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px'
          />
        </div>
      )}

      {/* Nazwa przepisu */}
      <div className='space-y-4'>
        <h1 className='text-3xl font-bold tracking-tight md:text-4xl'>
          {name}
        </h1>

        {/* Meal Types i Tagi */}
        <div className='flex flex-wrap gap-2'>
          {/* Meal Types - primary badges */}
          {mealTypes.map((type) => (
            <Badge key={type} className={getMealTypeBadgeClasses(type)}>
              {MEAL_TYPE_LABELS[type]}
            </Badge>
          ))}

          {/* Tags - secondary badges */}
          {tags &&
            tags.length > 0 &&
            tags.slice(0, 5).map((tag) => (
              <Badge
                key={tag}
                variant='secondary'
                className='rounded-full px-2.5 py-0.5 text-xs font-medium'
              >
                {tag}
              </Badge>
            ))}
        </div>
      </div>
    </div>
  )
}
