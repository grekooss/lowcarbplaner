/**
 * Komponent pustego stanu (brak posiłków)
 *
 * Wyświetlany gdy użytkownik nie ma zaplanowanych posiłków na dany dzień.
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  date: string // YYYY-MM-DD dla kontekstu
}

/**
 * Komponent pustego stanu dla braku posiłków
 *
 * @example
 * ```tsx
 * <EmptyState date="2025-10-15" />
 * ```
 */
export function EmptyState({ date }: EmptyStateProps) {
  // Formatuj datę dla wyświetlenia
  const formattedDate = new Date(date).toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <Card className='border-dashed'>
      <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
        {/* Ikona */}
        <div className='bg-muted text-muted-foreground mb-4 rounded-full p-4'>
          <UtensilsCrossed className='h-12 w-12' />
        </div>

        {/* Tytuł */}
        <h3 className='mb-2 text-xl font-semibold'>
          Brak posiłków na ten dzień
        </h3>

        {/* Opis */}
        <p className='text-muted-foreground mb-6 max-w-sm text-sm'>
          Nie masz jeszcze zaplanowanych posiłków na {formattedDate}. Wygeneruj
          plan, aby móc śledzić swoje postępy.
        </p>

        {/* CTA Button */}
        <Button asChild>
          <Link href='/profile'>Wygeneruj plan posiłków</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
