import { getShoppingList } from '@/lib/actions/shopping-list'
import { ShoppingListClient } from '@/components/shopping-list/ShoppingListClient'

export const metadata = {
  title: 'Lista Zakupów - LowCarbPlaner',
  description: 'Twoja zagregowana lista zakupów na nadchodzący tydzień',
}

/**
 * ShoppingListPage - Główna strona widoku Listy Zakupów
 *
 * Server Component odpowiedzialny za:
 * - Obliczenie zakresu dat (jutro + 5 dni = 6 dni)
 * - Wywołanie Server Action getShoppingList
 * - Przekazanie danych do ShoppingListClient
 *
 * @note Tymczasowo dostępne bez logowania (dla testów)
 */
export default async function ShoppingListPage() {
  // TODO: Przywrócić autentykację po testach
  // const supabase = await createServerClient()
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) redirect('/login')

  // Oblicz zakres dat (jutro + 5 dni = 6 dni)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const endDate = new Date(tomorrow)
  endDate.setDate(tomorrow.getDate() + 5)

  const startDateStr = tomorrow.toISOString().split('T')[0] as string
  const endDateStr = endDate.toISOString().split('T')[0] as string

  // Pobierz listę zakupów
  const shoppingListResult = await getShoppingList({
    start_date: startDateStr,
    end_date: endDateStr,
  })

  const shoppingList = shoppingListResult.error
    ? []
    : shoppingListResult.data || []

  return (
    <main className='container mx-auto px-4 py-8'>
      <h1 className='mb-2 text-3xl font-bold'>Lista Zakupów</h1>
      <p className='text-muted-foreground mb-6'>
        {startDateStr} - {endDateStr}
      </p>
      <ShoppingListClient initialShoppingList={shoppingList} />
    </main>
  )
}
