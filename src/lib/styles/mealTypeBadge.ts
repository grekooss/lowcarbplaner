import { cn } from '@/lib/utils'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | string | null

const badgeTheme: Record<string, { bg: string; text: string }> = {
  breakfast: { bg: 'bg-primary', text: 'text-black' },
  lunch: { bg: 'bg-tertiary', text: 'text-black' },
  dinner: { bg: 'bg-secondary', text: 'text-black' },
  snack: { bg: 'bg-[#FFE5D9]', text: 'text-black' },
}

const baseClasses =
  'inline-flex min-w-[96px] items-center justify-center rounded-[16px] px-4 py-1.5 text-sm font-semibold'

export const getMealTypeBadgeClasses = (mealType: MealType) => {
  const theme = (mealType && badgeTheme[mealType]) || {
    bg: 'bg-[#F7F2EB]',
    text: 'text-black',
  }

  return cn(baseClasses, theme.bg, theme.text)
}
