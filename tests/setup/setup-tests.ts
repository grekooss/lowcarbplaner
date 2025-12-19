/**
 * Global Test Setup
 *
 * Konfiguracja globalna dla wszystkich testów:
 * - @testing-library/jest-dom matchers
 * - MSW (Mock Service Worker) server
 * - window.matchMedia mock
 * - Cleanup po każdym teście
 */

import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { handlers } from './msw-handlers'

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// MSW server setup
export const server = setupServer(...handlers)

// Start MSW server przed wszystkimi testami
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})

// Cleanup po każdym teście
afterEach(() => {
  cleanup() // React Testing Library cleanup
  server.resetHandlers() // Reset MSW handlers
})

// Stop MSW server po wszystkich testach
afterAll(() => {
  server.close()
})
