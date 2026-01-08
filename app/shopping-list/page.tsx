import { getShoppingList } from '@/lib/actions/shopping-list'
import { ShoppingListClient } from '@/components/shopping-list/ShoppingListClient'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDateToLocalString } from '@/lib/utils'

// Force dynamic rendering because of Supabase auth (cookies)
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Lista Zakupów - LowCarbPlaner',
  description: 'Twoja zagregowana lista zakupów na nadchodzący tydzień',
}

/**
 * ShoppingListPage - Główna strona widoku Listy Zakupów
 *
 * Server Component odpowiedzialny za:
 * - Sprawdzenie autentykacji
 * - Obliczenie zakresu dat (jutro + 5 dni = 6 dni)
 * - Wywołanie Server Action getShoppingList
 * - Przekazanie danych do ShoppingListClient
 */
export default async function ShoppingListPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Oblicz zakres dat (jutro + 5 dni = 6 dni)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const endDate = new Date(tomorrow)
  endDate.setDate(tomorrow.getDate() + 5)

  const startDateStr = formatDateToLocalString(tomorrow)
  const endDateStr = formatDateToLocalString(endDate)

  // Pobierz listę zakupów
  const shoppingListResult = await getShoppingList({
    start_date: startDateStr,
    end_date: endDateStr,
  })

  const shoppingList = shoppingListResult.error
    ? []
    : shoppingListResult.data || []

  return (
    <main className='w-full space-y-6'>
      <ShoppingListClient initialShoppingList={shoppingList} />
    </main>
  )
}
