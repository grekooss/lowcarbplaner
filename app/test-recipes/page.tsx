/**
 * Strona testowa dla API endpointów /api/recipes
 *
 * Testuje:
 * - GET /api/recipes (z parametrami query)
 * - GET /api/recipes/[id]
 *
 * Uruchom: npm run dev
 * Otwórz: http://localhost:3000/test-recipes
 */

import RecipesTestClient from './RecipesTestClient'

export default function TestRecipesPage() {
  return (
    <div className='container mx-auto p-8'>
      <h1 className='mb-2 text-3xl font-bold'>Test API Endpointów</h1>
      <p className='mb-8 text-gray-600'>
        Testowanie endpointów <code>/api/recipes</code> i{' '}
        <code>/api/recipes/[id]</code>
      </p>

      <RecipesTestClient />
    </div>
  )
}
