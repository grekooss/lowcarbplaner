/**
 * CalendarStrip
 *
 * Weekly calendar selector styled to match the dashboard hero mock.
 * Displays current week (Mon-Sun) with day buttons and navigation arrows.
 */

'use client'

import type { KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
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

  // Sprawdź czy możemy nawigować
  const normalizedSelected = new Date(selectedDate)
  normalizedSelected.setHours(0, 0, 0, 0)
  const canGoPrev = normalizedSelected > today
  const canGoNext = normalizedSelected < maxDate

  return (
    <section className='card-soft rounded-3xl p-6 shadow-sm'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-baseline gap-2'>
          <span className='text-lg font-semibold capitalize'>{monthLabel}</span>
          <span className='text-muted-foreground text-sm font-medium'>
            {yearLabel}
          </span>
        </div>

        <div className='flex gap-2'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={handlePrevDay}
            disabled={!canGoPrev}
            className='text-muted-foreground hover:text-foreground h-9 w-9 rounded-xl bg-white shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50'
            aria-label='Poprzedni dzień'
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={handleNextDay}
            disabled={!canGoNext}
            className='text-muted-foreground hover:text-foreground h-9 w-9 rounded-xl bg-white shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50'
            aria-label='Następny dzień'
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='mt-6 grid grid-cols-7 gap-2'>
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
                'focus-visible:ring-primary flex flex-col items-center gap-1 rounded-2xl px-3 py-3 text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                'text-muted-foreground border border-transparent bg-white shadow-sm hover:shadow-md',
                isSelected &&
                  'bg-primary text-primary-foreground border-transparent shadow-md',
                isToday && !isSelected && 'border-primary/30 text-foreground'
              )}
              aria-pressed={isSelected}
              aria-label={`${day.dayName} ${day.dayNumber} ${day.monthName}`}
            >
              <span
                className={cn(
                  'text-xs font-semibold uppercase',
                  isSelected
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {day.dayName}
              </span>
              <span
                className={cn(
                  'text-lg leading-none font-semibold',
                  isSelected ? 'text-primary-foreground' : 'text-foreground'
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
