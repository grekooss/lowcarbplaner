/**
 * CalendarStrip - Test Suite
 *
 * Tests for 7-day range validation and date navigation
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CalendarStrip } from '../CalendarStrip'
import { vi } from 'vitest'

// Mock the useCalendarDays hook
vi.mock('@/hooks/useCalendarDays', () => ({
  useCalendarDays: (selectedDate: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      days.push({
        date,
        dayName:
          ['Ndz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'][date.getDay()] ??
          'Ndz',
        dayNumber: date.getDate(),
        monthName: 'Sty',
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
      })
    }
    return days
  },
}))

describe('CalendarStrip - 7-day range validation', () => {
  const mockOnDateChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should disable previous arrow when on today (first day)', () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    render(
      <CalendarStrip selectedDate={today} onDateChange={mockOnDateChange} />
    )

    const prevButton = screen.getByLabelText('Poprzedni dzień')
    expect(prevButton).toBeDisabled()
  })

  it('should disable next arrow when on day 6 (last day)', () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const lastDay = new Date(today)
    lastDay.setDate(today.getDate() + 6)

    render(
      <CalendarStrip selectedDate={lastDay} onDateChange={mockOnDateChange} />
    )

    const nextButton = screen.getByLabelText('Następny dzień')
    expect(nextButton).toBeDisabled()
  })

  it('should enable both arrows when on day 3 (middle)', () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const middleDay = new Date(today)
    middleDay.setDate(today.getDate() + 3)

    render(
      <CalendarStrip selectedDate={middleDay} onDateChange={mockOnDateChange} />
    )

    const prevButton = screen.getByLabelText('Poprzedni dzień')
    const nextButton = screen.getByLabelText('Następny dzień')

    expect(prevButton).not.toBeDisabled()
    expect(nextButton).not.toBeDisabled()
  })

  it('should not call onDateChange when clicking disabled previous arrow', async () => {
    const user = userEvent.setup()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    render(
      <CalendarStrip selectedDate={today} onDateChange={mockOnDateChange} />
    )

    const prevButton = screen.getByLabelText('Poprzedni dzień')
    await user.click(prevButton)

    expect(mockOnDateChange).not.toHaveBeenCalled()
  })

  it('should not call onDateChange when clicking disabled next arrow', async () => {
    const user = userEvent.setup()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const lastDay = new Date(today)
    lastDay.setDate(today.getDate() + 6)

    render(
      <CalendarStrip selectedDate={lastDay} onDateChange={mockOnDateChange} />
    )

    const nextButton = screen.getByLabelText('Następny dzień')
    await user.click(nextButton)

    expect(mockOnDateChange).not.toHaveBeenCalled()
  })

  it('should allow navigation within valid range', async () => {
    const user = userEvent.setup()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const middleDay = new Date(today)
    middleDay.setDate(today.getDate() + 3)

    render(
      <CalendarStrip selectedDate={middleDay} onDateChange={mockOnDateChange} />
    )

    const nextButton = screen.getByLabelText('Następny dzień')
    await user.click(nextButton)

    expect(mockOnDateChange).toHaveBeenCalledTimes(1)
    const calledDate = mockOnDateChange.mock.calls[0][0]
    expect(calledDate.getDate()).toBe(middleDay.getDate() + 1)
  })
})
