/**
 * useIsMobile
 *
 * Hook detecting if viewport is mobile-sized (< 640px, matches Tailwind 'sm' breakpoint).
 * Uses window.matchMedia for efficient resize detection.
 */

'use client'

import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 640 // Tailwind 'sm' breakpoint

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    )

    // Set initial value
    setIsMobile(mediaQuery.matches)

    // Listen for changes
    const handler = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return isMobile
}
