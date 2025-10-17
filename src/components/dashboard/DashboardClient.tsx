/**
 * Komponent główny Dashboard (Client Component)
 *
 * Zarządza stanem wybranej daty, fetchingiem danych i koordynacją
 * między wszystkimi komponentami potomnymi.
 */

'use client'

import { useEffect } from 'react'
import { CalendarStrip } from './CalendarStrip'
import { MacroProgressSection } from './MacroProgressSection'
import { MealsList } from './MealsList'
import { DashboardSkeleton } from './DashboardSkeleton'
import { useDashboardStore } from '@/lib/zustand/stores/useDashboardStore'
import { usePlannedMealsQuery } from '@/hooks/usePlannedMealsQuery'
import type { PlannedMealDTO } from '@/types/dto.types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardClientProps {
  initialMeals: PlannedMealDTO[]
  targetMacros: {
    target_calories: number
    target_protein_g: number
    target_carbs_g: number
    target_fats_g: number
  }
  initialDate: string // YYYY-MM-DD
}

/**
 * Główny komponent kliencki Dashboard
 *
 * @example
 * ```tsx
 * <DashboardClient
 *   initialMeals={meals}
 *   targetMacros={profile}
 *   initialDate="2025-10-15"
 * />
 * ```
 */
export function DashboardClient({
  initialMeals,
  targetMacros,
  initialDate,
}: DashboardClientProps) {
  // Stan z Zustand (wybrana data)
  const { selectedDate, setSelectedDate } = useDashboardStore()

  // Inicjalizacja selectedDate z initialDate (tylko raz)
  useEffect(() => {
    const initial = new Date(initialDate)
    setSelectedDate(initial)
  }, [initialDate, setSelectedDate])

  // Format daty do YYYY-MM-DD dla query
  const selectedDateStr = selectedDate.toISOString().split('T')[0] ?? ''

  // Query dla posiłków (automatyczny re-fetch przy zmianie daty)
  const {
    data: meals,
    isLoading,
    error,
    refetch,
  } = usePlannedMealsQuery(selectedDateStr, selectedDateStr)

  // Use initial meals as fallback
  const displayMeals = meals ?? initialMeals

  // Loading state
  if (isLoading && displayMeals.length === 0) {
    return <DashboardSkeleton />
  }

  // Error state
  if (error) {
    return (
      <div className='container mx-auto space-y-6 px-4 py-8'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Błąd ładowania danych</AlertTitle>
          <AlertDescription className='space-y-2'>
            <p>
              {error instanceof Error
                ? error.message
                : 'Nie udało się pobrać posiłków. Spróbuj ponownie.'}
            </p>
            <Button variant='outline' size='sm' onClick={() => refetch()}>
              Spróbuj ponownie
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className='container mx-auto space-y-8 px-4 py-8'>
      {/* Nagłówek */}
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Twój Plan Dnia</h1>
        <p className='text-muted-foreground'>
          Śledź swoje posiłki i realizację celów żywieniowych
        </p>
      </div>

      {/* Kalendarz */}
      <CalendarStrip
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      {/* Paski postępu makroskładników */}
      <MacroProgressSection meals={displayMeals} targetMacros={targetMacros} />

      {/* Lista posiłków */}
      <MealsList meals={displayMeals} date={selectedDateStr} />
    </div>
  )
}
