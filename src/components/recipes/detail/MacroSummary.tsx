/**
 * Komponent podsumowania makroskładników przepisu
 *
 * Wyświetla 4 karty z makroskładnikami: Kalorie, Białko, Węglowodany, Tłuszcze.
 * Używany w widoku szczegółów przepisu na górze strony.
 */

import { Card, CardContent } from '@/components/ui/card'
import { formatMacro } from '@/types/recipes-view.types'

interface MacroSummaryProps {
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fats_g: number | null
}

/**
 * Komponent prezentacyjny wyświetlający podsumowanie makroskładników
 *
 * @example
 * ```tsx
 * <MacroSummary
 *   calories={450}
 *   protein_g={25.5}
 *   carbs_g={3.2}
 *   fats_g={35.8}
 * />
 * ```
 */
export function MacroSummary({
  calories,
  protein_g,
  carbs_g,
  fats_g,
}: MacroSummaryProps) {
  const macros = [
    {
      label: 'Kalorie',
      value: formatMacro(calories, ' kcal'),
      color: 'text-orange-600',
    },
    {
      label: 'Tłuszcze',
      value: formatMacro(fats_g, 'g'),
      color: 'text-purple-600',
    },
    {
      label: 'Węglowodany',
      value: formatMacro(carbs_g, 'g'),
      color: 'text-green-600',
    },
    {
      label: 'Białko',
      value: formatMacro(protein_g, 'g'),
      color: 'text-blue-600',
    },
  ]

  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
      {macros.map((macro) => (
        <Card key={macro.label}>
          <CardContent className='p-4 text-center'>
            <p className='text-muted-foreground text-sm font-medium'>
              {macro.label}
            </p>
            <p className={`mt-2 text-2xl font-bold ${macro.color}`}>
              {macro.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
