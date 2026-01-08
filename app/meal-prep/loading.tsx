import { MealPrepSkeleton } from '@/components/meal-prep/MealPrepSkeleton'

export default function MealPrepLoading() {
  return (
    <div className='container mx-auto max-w-5xl px-4 py-6'>
      <MealPrepSkeleton />
    </div>
  )
}
