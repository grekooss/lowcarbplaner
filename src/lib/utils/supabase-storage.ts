/**
 * Supabase Storage URL Helper
 *
 * Generuje poprawne URL-e do plików w Supabase Storage.
 * Obsługuje zarówno publiczne buckety jak i signed URLs dla prywatnych bucketów.
 */

import { logErrorLevel } from '@/lib/error-logger'

/**
 * Konfiguracja Storage
 */
const STORAGE_CONFIG = {
  /**
   * Nazwa bucket-a dla zdjęć przepisów
   * UWAGA: Zmień na rzeczywistą nazwę bucket-a w Supabase Dashboard
   */
  RECIPE_IMAGES_BUCKET: 'recipe-images',

  /**
   * Bazowy URL Supabase
   */
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
} as const

/**
 * Generuje publiczny URL dla pliku w Supabase Storage
 *
 * Format URL: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
 *
 * @param bucketName - Nazwa bucket-a w Supabase Storage
 * @param filePath - Ścieżka do pliku w buckecie (np. "recipe-1.jpg" lub "breakfast/omlet.jpg")
 * @returns Pełny URL do pliku lub null jeśli brak danych
 *
 * @example
 * ```typescript
 * const url = getPublicStorageUrl('recipe-images', 'omlet.jpg')
 * // => 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe-images/omlet.jpg'
 * ```
 */
export function getPublicStorageUrl(
  bucketName: string,
  filePath: string | null | undefined
): string | null {
  if (!filePath || !bucketName) return null
  if (!STORAGE_CONFIG.SUPABASE_URL) {
    logErrorLevel('NEXT_PUBLIC_SUPABASE_URL is not set', {
      source: 'supabase-storage.getPublicStorageUrl',
      metadata: { bucketName, filePath },
    })
    return null
  }

  // Usuń leading slash jeśli istnieje
  const cleanPath = filePath.replace(/^\/+/, '')

  // Buduj URL
  const url = `${STORAGE_CONFIG.SUPABASE_URL}/storage/v1/object/public/${bucketName}/${cleanPath}`

  return url
}

/**
 * Generuje URL dla zdjęcia przepisu
 *
 * Używa domyślnego bucket-a dla przepisów.
 * Obsługuje różne formaty ścieżek:
 * - Pełny URL (normalizuje i zwraca)
 * - Relatywna ścieżka (generuje URL)
 * - Null/undefined (zwraca null)
 *
 * @param imagePath - Ścieżka do zdjęcia lub pełny URL
 * @returns Pełny URL do zdjęcia lub null
 *
 * @example
 * ```typescript
 * // Relatywna ścieżka
 * getRecipeImageUrl('omlet.jpg')
 * // => 'https://pkjdgaqwdletfkvniljx.supabase.co/storage/v1/object/public/recipe-images/omlet.jpg'
 *
 * // Pełny URL (normalizuje - usuwa trailing ?)
 * getRecipeImageUrl('https://example.com/image.jpg?')
 * // => 'https://example.com/image.jpg'
 *
 * // Null/undefined
 * getRecipeImageUrl(null)
 * // => null
 * ```
 */
export function getRecipeImageUrl(
  imagePath: string | null | undefined
): string | null {
  if (!imagePath) return null

  // Jeśli to już pełny URL (http/https), normalizuj i zwróć
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // Usuń trailing ? i query params
    return imagePath.replace(/\?.*$/, '').trim()
  }

  // Jeśli to ścieżka relatywna, wygeneruj URL
  return getPublicStorageUrl(STORAGE_CONFIG.RECIPE_IMAGES_BUCKET, imagePath)
}

/**
 * Normalizuje ścieżkę do pliku
 *
 * Usuwa zbędne znaki, leading/trailing slashes, query params
 *
 * @param path - Ścieżka do normalizacji
 * @returns Znormalizowana ścieżka
 *
 * @example
 * ```typescript
 * normalizeStoragePath('/omlet.jpg?')
 * // => 'omlet.jpg'
 *
 * normalizeStoragePath('//breakfast//omlet.jpg')
 * // => 'breakfast/omlet.jpg'
 * ```
 */
export function normalizeStoragePath(
  path: string | null | undefined
): string | null {
  if (!path) return null

  return (
    path
      .trim()
      // Usuń query params
      .replace(/\?.*$/, '')
      // Usuń leading slashes
      .replace(/^\/+/, '')
      // Usuń trailing slashes
      .replace(/\/+$/, '')
      // Zastąp wielokrotne slashes pojedynczym
      .replace(/\/+/g, '/')
  )
}
