import { cn } from '@/lib/utils'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | string | null

const badgeTheme: Record<string, { bg: string; text: string }> = {
  breakfast: { bg: 'bg-white', text: 'text-black' },
  lunch: { bg: 'bg-white', text: 'text-black' },
  dinner: { bg: 'bg-white', text: 'text-black' },
  snack: { bg: 'bg-white', text: 'text-black' },
}

const baseClasses =
  'inline-flex items-center justify-center rounded-sm border border-white bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-gray-800'

export const getMealTypeBadgeClasses = (mealType: MealType) => {
  const theme = (mealType && badgeTheme[mealType]) || {
    bg: 'bg-[#F7F2EB]',
    text: 'text-black',
  }

  return cn(baseClasses, theme.bg, theme.text)
}
