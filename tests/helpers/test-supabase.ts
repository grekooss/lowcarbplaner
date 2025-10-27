/**
 * Mock Supabase Client dla testów
 *
 * Mockowane metody Supabase używane w aplikacji.
 * Umożliwia testowanie bez rzeczywistego połączenia z bazą danych.
 */

import { vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Tworzy mockowany Supabase client
 */
export function createMockSupabaseClient(): Partial<SupabaseClient> {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            created_at: new Date().toISOString(),
          },
        },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
          session: {
            access_token: 'mock-access-token',
          },
        },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
          session: {
            access_token: 'mock-access-token',
          },
        },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({
        error: null,
      }),
    } as any,

    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  } as any
}

/**
 * Mock dla createServerClient
 */
export const mockCreateServerClient = vi.fn(createMockSupabaseClient)

/**
 * Mock dla createAdminClient
 */
export const mockCreateAdminClient = vi.fn(createMockSupabaseClient)
