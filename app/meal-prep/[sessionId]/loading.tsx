import { MealPrepSkeleton } from '@/components/meal-prep/MealPrepSkeleton'

export default function CookingSessionLoading() {
  return (
    <div className='container mx-auto max-w-4xl px-4 py-6'>
      <MealPrepSkeleton />
    </div>
  )
}
