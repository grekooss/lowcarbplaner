import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'

/**
 * InfoBanner - Banner informacyjny o bazie listy zakupów
 *
 * Wyświetla informację, że lista bazuje na oryginalnych przepisach
 * bez uwzględnienia modyfikacji użytkownika (ingredient_overrides).
 */
export const InfoBanner = () => {
  return (
    <Alert>
      <Info className='h-4 w-4' />
      <AlertDescription>
        Lista zakupów bazuje na oryginalnym planie i nie uwzględnia Twoich
        modyfikacji składników.
      </AlertDescription>
    </Alert>
  )
}
