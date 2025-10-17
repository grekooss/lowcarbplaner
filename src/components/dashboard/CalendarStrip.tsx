/**
 * Komponent nawigacji kalendarzowej (7 dni)
 *
 * Wyświetla 7 przycisków dni (dziś ± 3 dni) z scroll-snap CSS.
 * Fully keyboard accessible (Tab, Enter, Space, Arrow keys).
 */

'use client'

import { useCalendarDays } from '@/hooks/useCalendarDays'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CalendarStripProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

/**
 * Komponent nawigacji kalendarzowej
 *
 * @example
 * ```tsx
 * <CalendarStrip
 *   selectedDate={selectedDate}
 *   onDateChange={(date) => setSelectedDate(date)}
 * />
 * ```
 */
export function CalendarStrip({
  selectedDate,
  onDateChange,
}: CalendarStripProps) {
  const days = useCalendarDays(selectedDate)

  // Helper: Przejdź do poprzedniego dnia
  const handlePrevDay = () => {
    const currentIndex = days.findIndex((d) => d.isSelected)
    const prevDay = days[currentIndex - 1]
    if (currentIndex > 0 && prevDay) {
      onDateChange(prevDay.date)
    }
  }

  // Helper: Przejdź do następnego dnia
  const handleNextDay = () => {
    const currentIndex = days.findIndex((d) => d.isSelected)
    const nextDay = days[currentIndex + 1]
    if (currentIndex < days.length - 1 && nextDay) {
      onDateChange(nextDay.date)
    }
  }

  // Keyboard navigation dla przycisków dni
  const handleKeyDown = (e: React.KeyboardEvent, date: Date) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onDateChange(date)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      handlePrevDay()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      handleNextDay()
    }
  }

  return (
    <section className='space-y-4'>
      {/* Nagłówek z nawigacją */}
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>
          {selectedDate.toLocaleDateString('pl-PL', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>

        {/* Przyciski nawigacji (opcjonalne dla mobile) */}
        <div className='flex gap-1'>
          <Button
            variant='outline'
            size='icon'
            onClick={handlePrevDay}
            disabled={days.findIndex((d) => d.isSelected) === 0}
            aria-label='Poprzedni dzień'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            onClick={handleNextDay}
            disabled={days.findIndex((d) => d.isSelected) === days.length - 1}
            aria-label='Następny dzień'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Scroll container z dniami */}
      <div className='relative'>
        <div
          className='scrollbar-hide flex gap-2 overflow-x-auto pb-2'
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {days.map((day) => (
            <button
              key={day.date.toISOString()}
              onClick={() => onDateChange(day.date)}
              onKeyDown={(e) => handleKeyDown(e, day.date)}
              className={cn(
                'flex min-w-[80px] flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all',
                'scroll-snap-align-center',
                'hover:bg-accent hover:shadow-md',
                'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
                day.isSelected &&
                  'border-primary bg-primary text-primary-foreground shadow-md',
                !day.isSelected && 'border-border bg-card',
                day.isToday && !day.isSelected && 'border-primary'
              )}
              role='button'
              tabIndex={0}
              aria-label={`${day.dayName}, ${day.dayNumber} ${day.monthName}`}
              aria-pressed={day.isSelected}
            >
              {/* Nazwa dnia */}
              <span
                className={cn(
                  'text-xs font-medium',
                  day.isSelected
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {day.dayName}
              </span>

              {/* Numer dnia */}
              <span
                className={cn(
                  'text-2xl font-bold',
                  day.isSelected && 'text-primary-foreground'
                )}
              >
                {day.dayNumber}
              </span>

              {/* Oznaczenie "Dziś" */}
              {day.isToday && !day.isSelected && (
                <span className='text-primary text-xs font-semibold'>Dziś</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
