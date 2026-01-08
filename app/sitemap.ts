/**
 * Dynamiczna Sitemap dla SEO
 *
 * Generuje sitemap.xml z:
 * - Stronami statycznymi (recipes, auth)
 * - Dynamicznymi stronami przepisów (/recipes/[slug])
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Pobiera wszystkie slugi przepisów z bazy danych
 */
async function getAllRecipeSlugs(): Promise<string[]> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('recipes')
      .select('slug')
      .not('slug', 'is', null)
      .order('id', { ascending: true })

    if (error) {
      console.error('Sitemap: Error fetching recipe slugs:', error)
      return []
    }

    return data?.map((r) => r.slug).filter(Boolean) || []
  } catch (err) {
    console.error('Sitemap: Unexpected error:', err)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lowcarbplaner.pl'
  const currentDate = new Date()

  // Strony statyczne
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/recipes`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/auth`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/auth/forgot-password`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.2,
    },
  ]

  // Dynamiczne strony przepisów
  const recipeSlugs = await getAllRecipeSlugs()
  const recipePages: MetadataRoute.Sitemap = recipeSlugs.map((slug) => ({
    url: `${siteUrl}/recipes/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...recipePages]
}
