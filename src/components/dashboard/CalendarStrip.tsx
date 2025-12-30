/**
 * CalendarStrip
 *
 * Weekly calendar selector styled to match the dashboard hero mock.
 * Displays current week (Mon-Sun) with day buttons and navigation arrows.
 * Memoized to prevent re-renders when parent state changes.
 */

'use client'

import { memo, type KeyboardEvent } from 'react'

import { useCalendarDays } from '@/hooks/useCalendarDays'
import { cn } from '@/lib/utils'

interface CalendarStripProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export const CalendarStrip = memo(function CalendarStrip({
  selectedDate,
  onDateChange,
}: CalendarStripProps) {
  const days = useCalendarDays(selectedDate)

  // Definiuj zakres 7 dni od dzisiaj
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maxDate = new Date(today)
  maxDate.setDate(today.getDate() + 6)

  const handlePrevDay = () => {
    const prev = new Date(selectedDate)
    prev.setDate(prev.getDate() - 1)
    // Nie pozwól przejść przed dzisiaj
    if (prev >= today) {
      onDateChange(prev)
    }
  }

  const handleNextDay = () => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 1)
    // Nie pozwól przejść poza 6 dni od dzisiaj
    if (next <= maxDate) {
      onDateChange(next)
    }
  }

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    date: Date
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onDateChange(date)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      handlePrevDay()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      handleNextDay()
    }
  }

  // Sprawdź czy tydzień obejmuje dwa miesiące/lata
  const firstDay = days[0]?.date ?? today
  const lastDay = days[days.length - 1]?.date ?? today

  const firstMonth = firstDay.toLocaleDateString('pl-PL', { month: 'long' })
  const lastMonth = lastDay.toLocaleDateString('pl-PL', { month: 'long' })
  const firstYear = firstDay.getFullYear()
  const lastYear = lastDay.getFullYear()

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  // Jeśli miesiące są różne, pokaż oba
  const monthLabel =
    firstMonth === lastMonth
      ? capitalize(firstMonth)
      : `${capitalize(firstMonth)}-${capitalize(lastMonth)}`

  // Jeśli lata są różne, pokaż oba
  const yearLabel =
    firstYear === lastYear ? String(firstYear) : `${firstYear}-${lastYear}`

  return (
    <section className='flex flex-col gap-1 rounded-md border-2 border-white bg-white/40 px-3 py-2 shadow-sm backdrop-blur-xl sm:gap-2 sm:gap-3 sm:rounded-3xl sm:px-6 sm:py-3 sm:py-4'>
      <div className='flex flex-col items-center px-1'>
        <h2 className='text-base font-bold tracking-tight text-gray-800 sm:text-2xl'>
          {monthLabel}{' '}
          <span className='text-xs text-gray-500 sm:text-lg'>{yearLabel}</span>
        </h2>
      </div>

      <div className='grid w-full grid-cols-7 gap-2 sm:gap-4'>
        {days.map((day) => {
          const isSelected = day.isSelected
          const isToday = day.isToday

          return (
            <button
              key={day.date.toISOString()}
              type='button'
              onClick={() => onDateChange(day.date)}
              onKeyDown={(event) => handleKeyDown(event, day.date)}
              className={cn(
                'flex h-12 flex-col items-center justify-center rounded-sm border-2 transition-all sm:h-16 sm:rounded-md',
                isSelected
                  ? 'border-primary bg-primary shadow-primary/30 text-white shadow-lg'
                  : 'text-text-secondary hover:border-primary hover:text-primary border-transparent bg-white hover:bg-white',
                isToday && !isSelected && 'border-primary/30'
              )}
              aria-pressed={isSelected}
              aria-label={`${day.dayName} ${day.dayNumber} ${day.monthName}`}
            >
              <span
                className={cn(
                  'text-[10px] font-bold tracking-wide uppercase opacity-90',
                  isSelected ? 'text-white' : 'text-gray-500'
                )}
              >
                {day.dayName}
              </span>
              <span
                className={cn(
                  'text-lg font-bold',
                  isSelected ? 'text-white' : 'text-gray-800'
                )}
              >
                {day.dayNumber}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
})

CalendarStrip.displayName = 'CalendarStrip'
