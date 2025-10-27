/**
 * React Testing Library Utilities
 *
 * Custom render function z providers:
 * - QueryClientProvider (TanStack Query)
 * - Themed wrapper (opcjonalnie)
 */

import React, { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Custom render with QueryClientProvider
 *
 * @param ui - Component to render
 * @param options - RTL render options
 * @returns RTL render result
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Utwórz nowy QueryClient dla każdego testu (izolacja)
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Wyłącz retry w testach
        gcTime: 0, // Wyłącz cache między testami
      },
      mutations: {
        retry: false,
      },
    },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  }
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
export { renderWithProviders as render }
