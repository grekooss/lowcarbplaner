/**
 * Funkcje pomocnicze dla widoku Plan Posiłków
 */

import type { PlannedMealDTO } from '@/types/dto.types'
import type {
  WeekPlanViewModel,
  DayPlanViewModel,
} from '@/types/meal-plan-view.types'
import { DAY_NAMES, MONTH_NAMES } from '@/types/meal-plan-view.types'

/**
 * Transformuje listę posiłków na model tygodniowego planu
 * @param meals - Lista zaplanowanych posiłków
 * @param startDate - Data początkowa (YYYY-MM-DD)
 * @returns Model tygodniowego planu z 7 dniami
 */
export function transformToWeekPlan(
  meals: PlannedMealDTO[],
  startDate: string
): WeekPlanViewModel {
  const start = new Date(startDate)
  const days: DayPlanViewModel[] = []

  // Generuj 7 dni
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(start)
    currentDate.setDate(start.getDate() + i)

    const dateStr = currentDate.toISOString().split('T')[0] || ''
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    currentDate.setHours(0, 0, 0, 0)

    // Filtruj posiłki dla tego dnia
    const dayMeals = meals.filter((meal) => meal.meal_date === dateStr)

    days.push({
      date: dateStr,
      dayName: DAY_NAMES[currentDate.getDay()] || '',
      dayNumber: currentDate.getDate(),
      monthName: MONTH_NAMES[currentDate.getMonth()] || '',
      isToday: currentDate.getTime() === today.getTime(),
      breakfast: dayMeals.find((m) => m.meal_type === 'breakfast') || null,
      lunch: dayMeals.find((m) => m.meal_type === 'lunch') || null,
      dinner: dayMeals.find((m) => m.meal_type === 'dinner') || null,
    })
  }

  const endDate = new Date(start)
  endDate.setDate(start.getDate() + 6)

  return {
    days,
    startDate,
    endDate: endDate.toISOString().split('T')[0] || '',
  }
}
