import { cn } from '@/lib/utils'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | string | null

const badgeTheme: Record<string, { bg: string; text: string }> = {
  breakfast: { bg: 'bg-[#E8F5D8]', text: 'text-[#4A6B2A]' },
  lunch: { bg: 'bg-[#FFE08A]', text: 'text-[#8A4700]' },
  dinner: { bg: 'bg-[#FFBEA6]', text: 'text-[#8F3011]' },
  snack: { bg: 'bg-[#FFE5D9]', text: 'text-[#9B4B2C]' },
}

const baseClasses =
  'inline-flex min-w-[96px] items-center justify-center rounded-[16px] px-4 py-1.5 text-sm font-semibold shadow-[0_6px_18px_rgba(24,24,24,0.08)]'

export const getMealTypeBadgeClasses = (mealType: MealType) => {
  const theme = (mealType && badgeTheme[mealType]) || {
    bg: 'bg-[#F7F2EB]',
    text: 'text-slate-900',
  }

  return cn(baseClasses, theme.bg, theme.text)
}
