/**
 * Komponent pojedynczego kroku instrukcji
 *
 * Wyświetla numer kroku i opis. Używany w InstructionsList.
 * Automatycznie wykrywa nazwy przepisów-składników i linkuje do nich.
 */

import Link from 'next/link'
import type { RecipeComponentDTO } from '@/types/dto.types'

interface InstructionStepProps {
  step: number
  description: string
  /** Lista przepisów-składników używanych w przepisie głównym */
  components?: RecipeComponentDTO[]
}

/**
 * Parsuje tekst i zamienia nazwy przepisów na linki
 */
function parseDescriptionWithLinks(
  description: string,
  components: RecipeComponentDTO[]
): React.ReactNode {
  if (!components || components.length === 0) {
    return description
  }

  // Sortuj komponenty od najdłuższych nazw do najkrótszych
  // aby uniknąć problemów z częściowym dopasowaniem
  const sortedComponents = [...components].sort(
    (a, b) => b.recipe_name.length - a.recipe_name.length
  )

  // Utwórz regex dla wszystkich nazw przepisów (case-insensitive)
  const escapedNames = sortedComponents.map((c) =>
    c.recipe_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  )
  const pattern = new RegExp(`(${escapedNames.join('|')})`, 'gi')

  // Podziel tekst na części
  const parts = description.split(pattern)

  return parts.map((part, index) => {
    // Sprawdź czy ta część to nazwa przepisu
    const matchedComponent = sortedComponents.find(
      (c) => c.recipe_name.toLowerCase() === part.toLowerCase()
    )

    if (matchedComponent) {
      return (
        <Link
          key={index}
          href={`/recipes/${matchedComponent.recipe_slug}`}
          className='text-primary font-bold hover:underline'
        >
          {part}
        </Link>
      )
    }

    return <span key={index}>{part}</span>
  })
}

/**
 * Komponent prezentacyjny pojedynczego kroku instrukcji
 *
 * @example
 * ```tsx
 * <InstructionStep
 *   step={1}
 *   description="Pokrój chleb keto w kromki (~1cm grubości)."
 *   components={[{ recipe_id: 5, recipe_slug: 'chleb-keto', recipe_name: 'chleb keto', ... }]}
 * />
 * // Renders: "Pokrój <Link>chleb keto</Link> w kromki (~1cm grubości)."
 * ```
 */
export function InstructionStep({
  step,
  description,
  components = [],
}: InstructionStepProps) {
  return (
    <div className='flex items-start gap-3'>
      {/* Numer kroku - czerwony kwadrat z zaokrągleniami */}
      <div className='bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm text-sm font-bold text-white'>
        {step}
      </div>

      {/* Opis kroku */}
      <div className='flex-1 pt-1'>
        <p className='text-base leading-relaxed font-medium'>
          {parseDescriptionWithLinks(description, components)}
        </p>
      </div>
    </div>
  )
}
