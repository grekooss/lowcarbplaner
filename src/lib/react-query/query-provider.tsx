/**
 * React Query Provider
 *
 * Client Component wrapper dla QueryClientProvider.
 * Konfiguruje QueryClient z domyślnymi opcjami dla całej aplikacji.
 *
 * WAŻNE:
 * - Używaj w root layout (app/layout.tsx)
 * - Konfiguracja staleTime i gcTime dla optymalnego cachingu
 */

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

/**
 * Tworzy nową instancję QueryClient z domyślną konfiguracją
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Dane są świeże przez 5 minut
        staleTime: 5 * 60 * 1000, // 5 minutes

        // Cache trzymany w pamięci przez 30 minut
        gcTime: 30 * 60 * 1000, // 30 minutes (była cacheTime w v4)

        // Nie refetch automatycznie przy focus window (publiczny widok)
        refetchOnWindowFocus: false,

        // Retry 3 razy przy błędzie
        retry: 3,

        // Exponential backoff dla retry
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Retry tylko raz dla mutations
        retry: 1,
      },
    },
  })
}

// Browser: tworzymy QueryClient tylko raz per session
let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: zawsze twórz nowy QueryClient
    return makeQueryClient()
  } else {
    // Browser: użyj singleton pattern
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

/**
 * Provider komponent dla React Query
 *
 * Wrap całą aplikację w tym komponencie aby umożliwić używanie
 * TanStack Query hooks (useQuery, useMutation, etc.)
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { QueryProvider } from '@/lib/react-query/query-provider'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <QueryProvider>{children}</QueryProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // NOTE: Używamy useState aby uniknąć re-creation przy każdym render
  // Dla SSR, QueryClient jest tworzony per request
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
