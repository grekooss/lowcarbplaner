/**
 * API Route Handler for a Single Recipe
 *
 * Endpoint: GET /api/recipes/{id}
 *
 * Ten endpoint udostępnia logikę z Server Action `getRecipeById` jako
 * standardowy REST API.
 *
 * @see /src/lib/actions/recipes.ts
 * @see /docs/10-api-plan.md
 */

import { getRecipeById } from '@/lib/actions/recipes'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Pobierz ID z parametrów ścieżki i zwaliduj
  const id = parseInt(params.id, 10)
  if (isNaN(id) || id <= 0) {
    return NextResponse.json(
      { error: 'Nieprawidłowe ID przepisu' },
      { status: 400 }
    )
  }

  // 2. Wywołaj istniejącą logikę z Server Action
  const result = await getRecipeById(id)

  // 3. Zwróć odpowiedź w formacie JSON
  if (result.error) {
    // Jeśli przepis nie został znaleziony, zwróć status 404
    const status = result.error === 'Przepis nie został znaleziony' ? 404 : 500
    return NextResponse.json({ error: result.error }, { status })
  }

  return NextResponse.json(result.data)
}
