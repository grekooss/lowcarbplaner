/**
 * Hook: useCalendarDays
 *
 * Generuje tablicę 7 dni (dziś ± 3 dni) dla komponentu CalendarStrip.
 * Używa useMemo dla optymalizacji.
 */

import { useMemo } from 'react'
import type { CalendarDayViewModel } from '@/types/viewmodels'
import { DAY_NAMES, MONTH_NAMES } from '@/types/viewmodels'

/**
 * Generuje 7 dni kalendarza (dziś ± 3 dni)
 *
 * @param selectedDate - Aktualnie wybrana data
 * @returns Tablica 7 dni z metadanymi dla UI
 *
 * @example
 * ```tsx
 * const days = useCalendarDays(new Date('2025-10-15'))
 * // Zwraca: [
 * //   { date: Date('2025-10-12'), dayName: 'Ndz', dayNumber: 12, ... },
 * //   { date: Date('2025-10-13'), dayName: 'Pon', dayNumber: 13, ... },
 * //   ...
 * //   { date: Date('2025-10-18'), dayName: 'Sob', dayNumber: 18, ... }
 * // ]
 * ```
 */
export function useCalendarDays(selectedDate: Date): CalendarDayViewModel[] {
  return useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const days: CalendarDayViewModel[] = []

    // Generuj 7 dni: dziś ± 3 dni
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // Normalizuj selectedDate do porównania (bez godzin)
      const normalizedSelected = new Date(selectedDate)
      normalizedSelected.setHours(0, 0, 0, 0)

      days.push({
        date,
        dayName: DAY_NAMES[date.getDay()] ?? 'Ndz',
        dayNumber: date.getDate(),
        monthName: MONTH_NAMES[date.getMonth()] ?? 'Sty',
        isToday: i === 0,
        isSelected: date.toDateString() === normalizedSelected.toDateString(),
      })
    }

    return days
  }, [selectedDate])
}
