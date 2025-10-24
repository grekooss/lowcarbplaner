/**
 * Hook: useCalendarDays
 *
 * Generuje tablice 7 dni (od dzis + 6 nastepnych dni)
 * dla komponentu CalendarStrip.
 */

import { useMemo } from 'react'
import type { CalendarDayViewModel } from '@/types/viewmodels'
import { DAY_NAMES, MONTH_NAMES } from '@/types/viewmodels'

/**
 * Generuje 7 dni kalendarza (od dzis + 6 nastepnych dni)
 *
 * @param selectedDate - Aktualnie wybrana data
 * @returns Tablica 7 dni z metadanymi dla UI
 */
export function useCalendarDays(selectedDate: Date): CalendarDayViewModel[] {
  return useMemo(() => {
    // Zacznij od dzisiaj
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const normalizedSelected = new Date(selectedDate)
    normalizedSelected.setHours(0, 0, 0, 0)

    const days: CalendarDayViewModel[] = []

    // Generuj 7 dni od dzisiaj
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

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
