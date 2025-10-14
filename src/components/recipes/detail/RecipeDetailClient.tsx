/**
 * Client wrapper dla szczegółów przepisu
 *
 * Integruje wszystkie komponenty detail (Header, Macro, Ingredients, Instructions).
 * Dodaje interaktywne elementy (przycisk powrotu, CTA dla niezalogowanych).
 */

'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft } from 'lucide-react'
import { RecipeDetailHero } from './RecipeDetailHero'
import { IngredientsList } from './IngredientsList'
import { InstructionsList } from './InstructionsList'
import { useAuthCheck } from '@/lib/hooks/useAuthCheck'
import type { RecipeDTO } from '@/types/dto.types'

interface RecipeDetailClientProps {
  recipe: RecipeDTO
}

/**
 * Client wrapper dla widoku szczegółów przepisu
 *
 * @example
 * ```tsx
 * // W Server Component (page.tsx)
 * const recipe = await getRecipeById(id)
 *
 * <RecipeDetailClient recipe={recipe} />
 * ```
 */
export function RecipeDetailClient({ recipe }: RecipeDetailClientProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuthCheck()

  const handleBack = () => {
    router.back()
  }

  const handleSignup = () => {
    router.push(`/signup?redirect=/przepisy/${recipe.id}`)
  }

  const handleAddToMealPlan = () => {
    // TODO: Implementacja dodawania do planu posiłków
    console.log('Add to meal plan:', recipe.id)
  }

  return (
    <div className='mx-auto max-w-5xl space-y-8 px-4 py-8 md:px-6 lg:px-8'>
      {/* Przycisk powrotu */}
      <Button variant='ghost' size='sm' onClick={handleBack} className='gap-2'>
        <ArrowLeft className='h-4 w-4' />
        Powrót do przepisów
      </Button>

      {/* Hero section z kolorowymi kartami makro */}
      <RecipeDetailHero
        recipe={recipe}
        onAddToMealPlan={isAuthenticated ? handleAddToMealPlan : undefined}
        isAuthenticated={isAuthenticated ?? undefined}
      />

      <Separator />

      {/* CTA dla niezalogowanych użytkowników */}
      {!authLoading && !isAuthenticated && (
        <div className='border-primary/50 bg-primary/5 rounded-lg border p-6 text-center'>
          <h3 className='mb-2 text-lg font-semibold'>
            Chcesz dodać ten przepis do swojego planu?
          </h3>
          <p className='text-muted-foreground mb-4 text-sm'>
            Zarejestruj się i uzyskaj dostęp do automatycznego planowania
            posiłków
          </p>
          <Button size='lg' onClick={handleSignup}>
            Rozpocznij dietę
          </Button>
        </div>
      )}

      {/* Lista składników */}
      <IngredientsList ingredients={recipe.ingredients} />

      <Separator />

      {/* Instrukcje przygotowania */}
      <InstructionsList instructions={recipe.instructions} />

      {/* Sticky CTA na mobile (tylko dla niezalogowanych) */}
      {!authLoading && !isAuthenticated && (
        <div className='border-border bg-background fixed right-0 bottom-0 left-0 border-t p-4 md:hidden'>
          <Button size='lg' className='w-full' onClick={handleSignup}>
            Rozpocznij dietę
          </Button>
        </div>
      )}
    </div>
  )
}
