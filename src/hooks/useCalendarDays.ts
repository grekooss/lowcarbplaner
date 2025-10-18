/**
 * Hook: useCalendarDays
 *
 * Generuje tablice 7 dni (tydzien od poniedzialku do niedzieli)
 * dla komponentu CalendarStrip.
 */

import { useMemo } from 'react'
import type { CalendarDayViewModel } from '@/types/viewmodels'
import { DAY_NAMES, MONTH_NAMES } from '@/types/viewmodels'

/**
 * Generuje 7 dni kalendarza (tydzien od poniedzialku do niedzieli)
 *
 * @param selectedDate - Aktualnie wybrana data
 * @returns Tablica 7 dni z metadanymi dla UI
 */
export function useCalendarDays(selectedDate: Date): CalendarDayViewModel[] {
  return useMemo(() => {
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setHours(0, 0, 0, 0)

    const dayOfWeek = startOfWeek.getDay() || 7
    startOfWeek.setDate(startOfWeek.getDate() - (dayOfWeek - 1))

    const normalizedSelected = new Date(selectedDate)
    normalizedSelected.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const days: CalendarDayViewModel[] = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)

      days.push({
        date,
        dayName: DAY_NAMES[date.getDay()] ?? 'Ndz',
        dayNumber: date.getDate(),
        monthName: MONTH_NAMES[date.getMonth()] ?? 'Sty',
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === normalizedSelected.toDateString(),
      })
    }

    return days
  }, [selectedDate])
}
