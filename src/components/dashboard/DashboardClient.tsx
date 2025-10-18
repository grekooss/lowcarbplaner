/**
 * DashboardClient (client component)
 *
 * Manages selected date, data fetching and coordinates dashboard sub-components.
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

export function DashboardClient({
  initialMeals,
  targetMacros,
  initialDate,
}: DashboardClientProps) {
  const { selectedDate, setSelectedDate } = useDashboardStore()

  // Initialize the selected date once from server data
  useEffect(() => {
    const initial = new Date(initialDate)
    setSelectedDate(initial)
  }, [initialDate, setSelectedDate])

  // Normalize value coming from zustand persist (rehydrates as string)
  const normalizedSelectedDate =
    selectedDate instanceof Date
      ? selectedDate
      : selectedDate
        ? new Date(selectedDate)
        : new Date()

  const selectedDateStr = !Number.isNaN(normalizedSelectedDate.getTime())
    ? normalizedSelectedDate.toISOString().split('T')[0] || ''
    : ''

  const {
    data: meals,
    isLoading,
    error,
    refetch,
  } = usePlannedMealsQuery(selectedDateStr, selectedDateStr)

  const displayMeals = meals ?? initialMeals

  if (isLoading && displayMeals.length === 0) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className='container mx-auto space-y-6 px-4 py-8'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Blad ladowania danych</AlertTitle>
          <AlertDescription className='space-y-2'>
            <p>
              {error instanceof Error
                ? error.message
                : 'Nie udalo sie pobrac posilkow. Sprobuj ponownie.'}
            </p>
            <Button variant='outline' size='sm' onClick={() => refetch()}>
              Sprobuj ponownie
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className='container mx-auto space-y-8 px-4 py-8'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Twoj Plan Dnia</h1>
        <p className='text-muted-foreground'>
          Sledz swoje posilki i realizacje celow zywieniowych
        </p>
      </div>

      <div className='grid gap-8 lg:grid-cols-[minmax(0,_2.75fr)_minmax(0,_1fr)]'>
        {/* Column 1 - calendar and meals of the day */}
        <div className='space-y-6'>
          <CalendarStrip
            selectedDate={normalizedSelectedDate}
            onDateChange={setSelectedDate}
          />
          <MealsList meals={displayMeals} date={selectedDateStr} />
        </div>

        {/* Column 2 - calories / macros */}
        <div className='space-y-6'>
          <MacroProgressSection
            meals={displayMeals}
            targetMacros={targetMacros}
          />
        </div>
      </div>
    </div>
  )
}
