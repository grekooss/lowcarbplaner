/**
 * MSW (Mock Service Worker) Handlers
 *
 * Mockowane endpointy API dla testów integracyjnych.
 * MSW interceptuje requesty HTTP i zwraca mockowane odpowiedzi.
 */

import { http, HttpResponse } from 'msw'

export const handlers = [
  // Supabase Auth endpoints
  http.post('*/auth/v1/signup', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      },
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      },
    })
  }),

  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
    })
  }),

  // Supabase REST API endpoints
  http.get('*/rest/v1/profiles', () => {
    return HttpResponse.json([
      {
        id: 'test-user-id',
        target_calories: 1800,
        target_protein_g: 158,
        target_carbs_g: 68,
        target_fats_g: 100,
        macro_ratio: '60_25_15',
      },
    ])
  }),

  http.get('*/rest/v1/planned_meals', () => {
    return HttpResponse.json([])
  }),

  http.get('*/rest/v1/recipes', () => {
    return HttpResponse.json([])
  }),

  // Fallback dla innych requestów
  http.all('*', () => {
    return HttpResponse.json(
      { error: 'Unhandled request in MSW' },
      { status: 404 }
    )
  }),
]
