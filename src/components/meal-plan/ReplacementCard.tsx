'use client'

/**
 * ReplacementCard - Karta pojedynczego zamiennika przepisu
 * Wyświetla informację o różnicy kalorycznej (color-coded badge)
 */

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { UtensilsCrossed } from 'lucide-react'
import type { ReplacementRecipeDTO } from '@/types/dto.types'

interface ReplacementCardProps {
  recipe: ReplacementRecipeDTO
  onSelect: (recipeId: number) => void
  isLoading?: boolean
}

/**
 * Helper do określenia koloru badge na podstawie różnicy kalorycznej
 */
const getCalorieDiffBadge = (diff: number) => {
  const absValue = Math.abs(diff)
  const sign = diff > 0 ? '+' : ''

  // Określ wariant badge na podstawie różnicy
  let variant: 'default' | 'secondary' | 'destructive' = 'default'
  if (absValue <= 50)
    variant = 'default' // zielony - dobry zamiennik
  else if (absValue <= 100)
    variant = 'secondary' // żółty - akceptowalny
  else variant = 'destructive' // czerwony - duża różnica (nie powinno się zdarzyć)

  return (
    <Badge variant={variant} className='text-xs'>
      {sign}
      {diff} kcal
    </Badge>
  )
}

/**
 * Karta zamiennika przepisu
 * Compact layout z miniaturką, nazwą, makro i akcją wyboru
 */
export const ReplacementCard = ({
  recipe,
  onSelect,
  isLoading = false,
}: ReplacementCardProps) => {
  return (
    <Card className='transition-shadow hover:shadow-md'>
      <CardContent className='p-4'>
        <div className='flex gap-4'>
          {/* Miniatura obrazu */}
          <div className='relative h-20 w-24 flex-shrink-0 overflow-hidden rounded'>
            {recipe.image_url ? (
              <Image
                src={recipe.image_url}
                alt={recipe.name}
                fill
                className='object-cover'
                sizes='100px'
              />
            ) : (
              <div className='bg-muted flex h-full w-full items-center justify-center'>
                <UtensilsCrossed className='text-muted-foreground h-8 w-8' />
              </div>
            )}
          </div>

          {/* Content */}
          <div className='min-w-0 flex-1'>
            <h4 className='mb-2 line-clamp-2 text-sm font-medium'>
              {recipe.name}
            </h4>

            {/* Makro summary */}
            <div className='text-muted-foreground mb-2 flex flex-wrap items-center gap-2 text-xs'>
              <span className='font-medium'>
                {recipe.total_calories || 0} kcal
              </span>
              <span>•</span>
              <span>B: {recipe.total_protein_g || 0}g</span>
              <span>W: {recipe.total_carbs_g || 0}g</span>
              <span>T: {recipe.total_fats_g || 0}g</span>
            </div>

            {/* Akcje - badge różnicy i przycisk wyboru */}
            <div className='flex items-center gap-2'>
              {getCalorieDiffBadge(recipe.calorie_diff)}
              <Button
                size='sm'
                onClick={() => onSelect(recipe.id)}
                disabled={isLoading}
                className='ml-auto'
              >
                {isLoading ? 'Zamieniam...' : 'Wybierz'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
