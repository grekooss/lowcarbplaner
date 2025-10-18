import { Skeleton } from '@/components/ui/skeleton'

/**
 * ShoppingListLoading - Loading state dla strony Lista Zakupów
 *
 * Wyświetla skeleton UI podczas ładowania danych z API.
 */
export default function ShoppingListLoading() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <Skeleton className='mb-2 h-10 w-64' /> {/* h1 */}
      <Skeleton className='mb-6 h-5 w-48' /> {/* date range */}
      {/* InfoBanner skeleton */}
      <Skeleton className='mb-6 h-14 w-full' />
      {/* Accordion skeleton */}
      <div className='space-y-2'>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className='h-16 w-full' />
        ))}
      </div>
    </div>
  )
}
