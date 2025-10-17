/**
 * Zustand Store: useDashboardStore
 *
 * Zarządza stanem klienckim widoku Dashboard:
 * - Wybrana data (selectedDate)
 * - Optymistyczne aktualizacje posiłków (do usunięcia jeśli niepotrzebne)
 *
 * Używa middleware persist do zapisywania selectedDate w localStorage.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DashboardState {
  // Wybrana data w widoku kalendarza
  selectedDate: Date

  // Akcje
  setSelectedDate: (date: Date) => void
  resetToToday: () => void
}

/**
 * Store dla widoku Dashboard
 *
 * @example
 * ```tsx
 * const { selectedDate, setSelectedDate } = useDashboardStore()
 *
 * <CalendarStrip
 *   selectedDate={selectedDate}
 *   onDateChange={setSelectedDate}
 * />
 * ```
 */
export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      // Initial state: dzisiaj
      selectedDate: new Date(),

      // Akcje
      setSelectedDate: (date) => set({ selectedDate: date }),

      resetToToday: () => set({ selectedDate: new Date() }),
    }),
    {
      name: 'dashboard-storage', // Klucz w localStorage
      partialize: (state) => ({
        // Zapisuj tylko selectedDate (serializacja Date → string)
        selectedDate: state.selectedDate,
      }),
    }
  )
)
