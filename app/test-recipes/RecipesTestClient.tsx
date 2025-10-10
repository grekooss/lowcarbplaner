'use client'

/**
 * Client Component do testowania API endpointów /api/recipes
 */

import { useState } from 'react'
import type { RecipeDTO } from '@/types/dto.types'

type PaginatedResponse = {
  count: number
  next: string | null
  previous: string | null
  results: RecipeDTO[]
}

type ApiError = {
  error: {
    message: string
    code: string
  }
}

export default function RecipesTestClient() {
  // Stan dla testowania GET /api/recipes
  const [listParams, setListParams] = useState({
    limit: '20',
    offset: '0',
    tags: '',
    meal_types: '',
  })
  const [listLoading, setListLoading] = useState(false)
  const [listResponse, setListResponse] = useState<PaginatedResponse | null>(
    null
  )
  const [listError, setListError] = useState<string | null>(null)

  // Stan dla testowania GET /api/recipes/[id]
  const [recipeId, setRecipeId] = useState('1')
  const [singleLoading, setSingleLoading] = useState(false)
  const [singleResponse, setSingleResponse] = useState<RecipeDTO | null>(null)
  const [singleError, setSingleError] = useState<string | null>(null)

  // Handler dla testowania GET /api/recipes
  const handleTestList = async () => {
    setListLoading(true)
    setListError(null)
    setListResponse(null)

    try {
      // Buduj URL z query params
      const params = new URLSearchParams()
      if (listParams.limit) params.append('limit', listParams.limit)
      if (listParams.offset) params.append('offset', listParams.offset)
      if (listParams.tags) params.append('tags', listParams.tags)
      if (listParams.meal_types)
        params.append('meal_types', listParams.meal_types)

      const url = `/api/recipes?${params.toString()}`
      const response = await fetch(url)

      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(
          errorData.error?.message ||
            `HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data: PaginatedResponse = await response.json()
      setListResponse(data)
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Nieznany błąd')
    } finally {
      setListLoading(false)
    }
  }

  // Handler dla testowania GET /api/recipes/[id]
  const handleTestSingle = async () => {
    setSingleLoading(true)
    setSingleError(null)
    setSingleResponse(null)

    try {
      const url = `/api/recipes/${recipeId}`
      const response = await fetch(url)

      if (!response.ok) {
        const errorData: ApiError = await response.json()
        throw new Error(
          errorData.error?.message ||
            `HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data: RecipeDTO = await response.json()
      setSingleResponse(data)
    } catch (err) {
      setSingleError(err instanceof Error ? err.message : 'Nieznany błąd')
    } finally {
      setSingleLoading(false)
    }
  }

  return (
    <div className='space-y-8'>
      {/* Sekcja 1: Test GET /api/recipes */}
      <div className='rounded-lg border p-6'>
        <h2 className='mb-4 text-2xl font-bold'>
          Test: GET /api/recipes (Lista)
        </h2>

        <div className='mb-4 grid grid-cols-2 gap-4'>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Limit (1-100)
            </label>
            <input
              type='number'
              value={listParams.limit}
              onChange={(e) =>
                setListParams({ ...listParams, limit: e.target.value })
              }
              className='w-full rounded border px-3 py-2'
              min='1'
              max='100'
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Offset (≥0)
            </label>
            <input
              type='number'
              value={listParams.offset}
              onChange={(e) =>
                setListParams({ ...listParams, offset: e.target.value })
              }
              className='w-full rounded border px-3 py-2'
              min='0'
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Tags (oddzielone przecinkami)
            </label>
            <input
              type='text'
              value={listParams.tags}
              onChange={(e) =>
                setListParams({ ...listParams, tags: e.target.value })
              }
              className='w-full rounded border px-3 py-2'
              placeholder='np. szybkie,wegetariańskie'
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Meal Types (breakfast, lunch, dinner)
            </label>
            <input
              type='text'
              value={listParams.meal_types}
              onChange={(e) =>
                setListParams({ ...listParams, meal_types: e.target.value })
              }
              className='w-full rounded border px-3 py-2'
              placeholder='np. breakfast,lunch'
            />
          </div>
        </div>

        <button
          onClick={handleTestList}
          disabled={listLoading}
          className='rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400'
        >
          {listLoading ? 'Ładowanie...' : 'Testuj GET /api/recipes'}
        </button>

        {/* Wynik dla listy */}
        {listError && (
          <div className='mt-4 rounded bg-red-100 p-4 text-red-700'>
            <strong>❌ Błąd:</strong> {listError}
          </div>
        )}

        {listResponse && (
          <div className='mt-4 space-y-4'>
            <div className='rounded bg-green-100 p-4'>
              <p>
                <strong>✅ Sukces!</strong>
              </p>
              <p>
                <strong>Znaleziono:</strong> {listResponse.count} przepisów
              </p>
              <p>
                <strong>Zwrócono:</strong> {listResponse.results.length}{' '}
                przepisów
              </p>
              {listResponse.next && (
                <p>
                  <strong>Next:</strong> {listResponse.next}
                </p>
              )}
              {listResponse.previous && (
                <p>
                  <strong>Previous:</strong> {listResponse.previous}
                </p>
              )}
            </div>

            <div className='grid gap-4'>
              {listResponse.results.map((recipe) => (
                <div key={recipe.id} className='rounded border p-4 shadow'>
                  <h3 className='text-xl font-semibold'>{recipe.name}</h3>
                  <p className='text-sm text-gray-600'>ID: {recipe.id}</p>
                  <p className='text-sm'>
                    <strong>Typy:</strong> {recipe.meal_types.join(', ')}
                  </p>
                  {recipe.tags && recipe.tags.length > 0 && (
                    <p className='text-sm'>
                      <strong>Tagi:</strong> {recipe.tags.join(', ')}
                    </p>
                  )}
                  <div className='mt-2 text-sm'>
                    <strong>Makro:</strong> {recipe.total_calories}kcal | P:{' '}
                    {recipe.total_protein_g}g | C: {recipe.total_carbs_g}g | F:{' '}
                    {recipe.total_fats_g}g
                  </div>
                  <p className='mt-2 text-sm'>
                    <strong>Składniki:</strong> {recipe.ingredients.length}
                  </p>
                </div>
              ))}
            </div>

            {/* Raw JSON Response */}
            <details className='rounded bg-gray-100 p-4'>
              <summary className='cursor-pointer font-medium'>
                Raw JSON Response
              </summary>
              <pre className='mt-2 overflow-auto text-xs'>
                {JSON.stringify(listResponse, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Sekcja 2: Test GET /api/recipes/[id] */}
      <div className='rounded-lg border p-6'>
        <h2 className='mb-4 text-2xl font-bold'>
          Test: GET /api/recipes/[id] (Szczegóły)
        </h2>

        <div className='mb-4'>
          <label className='mb-1 block text-sm font-medium'>Recipe ID</label>
          <input
            type='number'
            value={recipeId}
            onChange={(e) => setRecipeId(e.target.value)}
            className='w-full max-w-xs rounded border px-3 py-2'
            min='1'
          />
        </div>

        <button
          onClick={handleTestSingle}
          disabled={singleLoading}
          className='rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:bg-gray-400'
        >
          {singleLoading
            ? 'Ładowanie...'
            : `Testuj GET /api/recipes/${recipeId}`}
        </button>

        {/* Wynik dla pojedynczego przepisu */}
        {singleError && (
          <div className='mt-4 rounded bg-red-100 p-4 text-red-700'>
            <strong>❌ Błąd:</strong> {singleError}
          </div>
        )}

        {singleResponse && (
          <div className='mt-4 space-y-4'>
            <div className='rounded bg-green-100 p-4'>
              <strong>✅ Sukces! Pobrano przepis.</strong>
            </div>

            <div className='rounded border p-4 shadow'>
              <h3 className='text-2xl font-semibold'>{singleResponse.name}</h3>
              <p className='text-sm text-gray-600'>ID: {singleResponse.id}</p>
              <p className='text-sm'>
                <strong>Typy:</strong> {singleResponse.meal_types.join(', ')}
              </p>
              {singleResponse.tags && singleResponse.tags.length > 0 && (
                <p className='text-sm'>
                  <strong>Tagi:</strong> {singleResponse.tags.join(', ')}
                </p>
              )}
              <div className='mt-2 text-sm'>
                <strong>Makro:</strong> {singleResponse.total_calories}kcal | P:{' '}
                {singleResponse.total_protein_g}g | C:{' '}
                {singleResponse.total_carbs_g}g | F:{' '}
                {singleResponse.total_fats_g}g
              </div>

              {/* Instrukcje */}
              <div className='mt-4'>
                <strong className='text-lg'>Instrukcje:</strong>
                <ol className='mt-2 ml-6 list-decimal'>
                  {singleResponse.instructions.map((instr) => (
                    <li key={instr.step} className='mb-1'>
                      {instr.description}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Składniki */}
              <div className='mt-4'>
                <strong className='text-lg'>
                  Składniki ({singleResponse.ingredients.length}):
                </strong>
                <ul className='mt-2 ml-6 list-disc'>
                  {singleResponse.ingredients.map((ing) => (
                    <li key={ing.id} className='mb-1'>
                      <strong>{ing.name}</strong> - {ing.amount} {ing.unit} (
                      {ing.calories}kcal, P: {ing.protein_g}g, C: {ing.carbs_g}
                      g, F: {ing.fats_g}g)
                      {ing.is_scalable && (
                        <span className='ml-2 text-xs text-gray-600'>
                          [skalowalne]
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Raw JSON Response */}
            <details className='rounded bg-gray-100 p-4'>
              <summary className='cursor-pointer font-medium'>
                Raw JSON Response
              </summary>
              <pre className='mt-2 overflow-auto text-xs'>
                {JSON.stringify(singleResponse, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className='rounded-lg bg-blue-50 p-6'>
        <h3 className='mb-3 font-bold'>🔗 Quick Test Links</h3>
        <div className='grid grid-cols-2 gap-2 text-sm'>
          <div>
            <strong>Lista przepisów:</strong>
            <ul className='mt-1 space-y-1'>
              <li>
                <button
                  onClick={() => {
                    setListParams({
                      limit: '5',
                      offset: '0',
                      tags: '',
                      meal_types: '',
                    })
                  }}
                  className='text-blue-600 hover:underline'
                >
                  Limit: 5
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setListParams({
                      limit: '20',
                      offset: '20',
                      tags: '',
                      meal_types: '',
                    })
                  }}
                  className='text-blue-600 hover:underline'
                >
                  Strona 2 (offset=20)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setListParams({
                      limit: '20',
                      offset: '0',
                      tags: '',
                      meal_types: 'breakfast',
                    })
                  }}
                  className='text-blue-600 hover:underline'
                >
                  Tylko śniadania
                </button>
              </li>
            </ul>
          </div>
          <div>
            <strong>Pojedynczy przepis:</strong>
            <ul className='mt-1 space-y-1'>
              <li>
                <button
                  onClick={() => setRecipeId('1')}
                  className='text-blue-600 hover:underline'
                >
                  Recipe ID: 1
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRecipeId('2')}
                  className='text-blue-600 hover:underline'
                >
                  Recipe ID: 2
                </button>
              </li>
              <li>
                <button
                  onClick={() => setRecipeId('999')}
                  className='text-blue-600 hover:underline'
                >
                  Recipe ID: 999 (test 404)
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
