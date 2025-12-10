/**
 * CalendarStrip
 *
 * Weekly calendar selector styled to match the dashboard hero mock.
 * Displays current week (Mon-Sun) with day buttons and navigation arrows.
 */

'use client'

import type { KeyboardEvent } from 'react'

import { useCalendarDays } from '@/hooks/useCalendarDays'
import { cn } from '@/lib/utils'

interface CalendarStripProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export function CalendarStrip({
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

  const monthLabelRaw = selectedDate.toLocaleDateString('pl-PL', {
    month: 'long',
  })
  const monthLabel =
    monthLabelRaw.charAt(0).toUpperCase() + monthLabelRaw.slice(1)
  const yearLabel = selectedDate.getFullYear()

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
                  ? 'border-red-600 bg-red-600 text-white shadow-lg shadow-red-500/30'
                  : 'border-transparent bg-white text-gray-600 hover:border-red-600 hover:bg-white hover:text-red-600',
                isToday && !isSelected && 'border-red-300'
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
}
