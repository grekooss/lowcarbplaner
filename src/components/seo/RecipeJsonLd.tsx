/**
 * JSON-LD Structured Data Component for Recipe Schema
 *
 * Generates schema.org Recipe markup for Google Rich Results.
 * @see https://developers.google.com/search/docs/appearance/structured-data/recipe
 */

import type { RecipeDTO } from '@/types/dto.types'

interface RecipeJsonLdProps {
  recipe: RecipeDTO
}

/**
 * Difficulty level mapping to schema.org text
 * Used for potential future integration with schema.org
 */
const _DIFFICULTY_TEXT: Record<RecipeDTO['difficulty_level'], string> = {
  easy: 'Łatwy',
  medium: 'Średni',
  hard: 'Trudny',
}
// Suppress unused variable warning - kept for future use
void _DIFFICULTY_TEXT

/**
 * Convert minutes to ISO 8601 duration format
 * @example 30 -> "PT30M"
 */
function formatDuration(minutes: number | null): string | undefined {
  if (!minutes || minutes <= 0) return undefined
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0 && mins > 0) {
    return `PT${hours}H${mins}M`
  } else if (hours > 0) {
    return `PT${hours}H`
  } else {
    return `PT${mins}M`
  }
}

/**
 * Recipe JSON-LD Component
 *
 * Renders structured data for Google Rich Results.
 * Supports:
 * - Recipe basic info (name, image, description)
 * - Nutrition information
 * - Ingredients list
 * - Instructions steps
 * - Prep/cook time
 * - Ratings
 * - Diet suitability (LowCarbohydrateDiet)
 */
export function RecipeJsonLd({ recipe }: RecipeJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lowcarbplaner.pl'

  // Format ingredients for schema
  const recipeIngredient = recipe.ingredients.map((ing) => {
    const displayAmount = ing.display_unit
      ? `${ing.display_amount} ${ing.display_unit}`
      : `${ing.amount}${ing.unit}`
    return `${displayAmount} ${ing.name}`
  })

  // Format instructions for schema
  const recipeInstructions = recipe.instructions.map((step) => ({
    '@type': 'HowToStep',
    position: step.step,
    text: step.description,
  }))

  // Calculate total time
  const prepTime = formatDuration(recipe.prep_time_minutes)
  const cookTime = formatDuration(recipe.cook_time_minutes)
  const totalMinutes =
    (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)
  const totalTime = formatDuration(totalMinutes > 0 ? totalMinutes : null)

  // Build nutrition information
  const nutrition = {
    '@type': 'NutritionInformation',
    ...(recipe.total_calories && {
      calories: `${Math.round(recipe.total_calories)} kcal`,
    }),
    ...(recipe.total_protein_g && {
      proteinContent: `${Math.round(recipe.total_protein_g)} g`,
    }),
    ...(recipe.total_carbs_g && {
      carbohydrateContent: `${Math.round(recipe.total_carbs_g)} g`,
    }),
    ...(recipe.total_net_carbs_g !== null && {
      // Custom field for net carbs (not standard schema.org but useful)
      '@context': 'https://schema.org',
    }),
    ...(recipe.total_fiber_g && {
      fiberContent: `${Math.round(recipe.total_fiber_g)} g`,
    }),
    ...(recipe.total_fats_g && {
      fatContent: `${Math.round(recipe.total_fats_g)} g`,
    }),
    ...(recipe.total_saturated_fat_g && {
      saturatedFatContent: `${Math.round(recipe.total_saturated_fat_g)} g`,
    }),
  }

  // Build the JSON-LD object
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.name,
    url: `${siteUrl}/przepisy/${recipe.slug}`,
    ...(recipe.image_url && { image: [recipe.image_url] }),
    description: `Przepis niskowęglowodanowy: ${recipe.name}. ${
      recipe.total_calories
        ? `Kalorie: ${Math.round(recipe.total_calories)} kcal.`
        : ''
    } ${
      recipe.total_net_carbs_g !== null
        ? `Węglowodany netto: ${Math.round(recipe.total_net_carbs_g)}g.`
        : ''
    } Idealny na dietę keto i low-carb.`,

    // Recipe category and cuisine
    recipeCategory: recipe.meal_types
      .map((type) => {
        const labels: Record<string, string> = {
          breakfast: 'Śniadanie',
          lunch: 'Obiad',
          dinner: 'Kolacja',
          snack: 'Przekąska',
        }
        return labels[type] || type
      })
      .join(', '),
    recipeCuisine: 'Polish',

    // Keywords from tags
    ...(recipe.tags &&
      recipe.tags.length > 0 && {
        keywords: [
          ...recipe.tags,
          'keto',
          'low-carb',
          'niskowęglowodanowy',
        ].join(', '),
      }),

    // Diet suitability
    suitableForDiet: [
      'https://schema.org/LowCarbohydrateDiet',
      'https://schema.org/DiabeticDiet',
    ],

    // Times
    ...(prepTime && { prepTime }),
    ...(cookTime && { cookTime }),
    ...(totalTime && { totalTime }),

    // Yield (servings) - default to 1 portion
    recipeYield: '1 porcja',

    // Difficulty as text (not standard but useful)
    // Using review or comment for this
    ...(recipe.difficulty_level &&
      {
        // Alternative: add to description
      }),

    // Ingredients
    recipeIngredient,

    // Instructions
    recipeInstructions,

    // Nutrition
    nutrition,

    // Ratings (if available)
    ...(recipe.average_rating &&
      recipe.reviews_count > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: recipe.average_rating.toFixed(1),
          ratingCount: recipe.reviews_count,
          bestRating: 5,
          worstRating: 1,
        },
      }),

    // Author (website)
    author: {
      '@type': 'Organization',
      name: 'LowCarbPlaner',
      url: siteUrl,
    },

    // Publisher
    publisher: {
      '@type': 'Organization',
      name: 'LowCarbPlaner',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.ico`,
      },
    },

    // Date (use current date as we don't track creation)
    datePublished: new Date().toISOString().split('T')[0],
    dateModified: new Date().toISOString().split('T')[0],
  }

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 0) }}
    />
  )
}
