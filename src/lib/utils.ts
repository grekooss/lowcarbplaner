import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates time options with 30-minute intervals for time picker
 * @returns Array of time strings in HH:MM format
 */
export function generateTimeOptions(): string[] {
  const options: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour.toString().padStart(2, '0')
      const m = minute.toString().padStart(2, '0')
      options.push(`${h}:${m}`)
    }
  }
  return options
}

// Re-export formatLocalDate jako formatDateToLocalString dla kompatybilności wstecznej
// Główna funkcja znajduje się w @/lib/utils/date-formatting
export { formatLocalDate as formatDateToLocalString } from '@/lib/utils/date-formatting'
