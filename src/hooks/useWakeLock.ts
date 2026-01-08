/**
 * Hook dla Screen Wake Lock API
 *
 * Zapobiega wygaszeniu ekranu podczas sesji gotowania.
 * Automatycznie ponawia blokadę po powrocie z innej karty/aplikacji.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
 */

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseWakeLockReturn {
  /** Czy Wake Lock API jest wspierane przez przeglądarkę */
  isSupported: boolean
  /** Czy blokada ekranu jest aktualnie aktywna */
  isActive: boolean
  /** Żądanie blokady ekranu */
  request: () => Promise<boolean>
  /** Zwolnienie blokady ekranu */
  release: () => Promise<void>
  /** Błąd jeśli wystąpił */
  error: Error | null
}

/**
 * Hook do zarządzania Screen Wake Lock API
 *
 * @example
 * ```tsx
 * function CookingSession() {
 *   const { isSupported, isActive, request, release, error } = useWakeLock()
 *
 *   useEffect(() => {
 *     // Aktywuj blokadę przy starcie sesji
 *     request()
 *     return () => {
 *       // Zwolnij przy końcu sesji
 *       release()
 *     }
 *   }, [request, release])
 *
 *   return (
 *     <div>
 *       {!isSupported && (
 *         <p>Twoja przeglądarka nie wspiera Wake Lock API</p>
 *       )}
 *       {isActive && <p>Ekran nie zgaśnie</p>}
 *     </div>
 *   )
 * }
 * ```
 */
export function useWakeLock(): UseWakeLockReturn {
  const [isSupported] = useState(() => {
    // Sprawdź na kliencie czy API jest dostępne
    if (typeof window === 'undefined') return false
    return 'wakeLock' in navigator
  })

  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const request = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError(
        new Error('Wake Lock API nie jest wspierane przez tę przeglądarkę')
      )
      return false
    }

    // Jeśli już mamy aktywną blokadę, nie żądaj ponownie
    if (wakeLockRef.current) {
      return true
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
      setIsActive(true)
      setError(null)

      // Nasłuchuj na zwolnienie blokady (np. przez system)
      wakeLockRef.current.addEventListener('release', () => {
        setIsActive(false)
        wakeLockRef.current = null
      })

      return true
    } catch (err) {
      const error = err as Error
      setError(error)
      setIsActive(false)
      wakeLockRef.current = null

      // Typowe błędy:
      // - NotAllowedError: strona nie jest widoczna lub brak uprawnień
      // - AbortError: żądanie zostało przerwane
      console.warn('Wake Lock request failed:', error.message)

      return false
    }
  }, [isSupported])

  const release = useCallback(async (): Promise<void> => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
      } catch (err) {
        // Ignoruj błędy przy zwalnianiu (może już być zwolniona)
        console.warn('Wake Lock release warning:', err)
      } finally {
        wakeLockRef.current = null
        setIsActive(false)
      }
    }
  }, [])

  // Automatyczne ponowne żądanie blokady po powrocie na stronę
  useEffect(() => {
    const handleVisibilityChange = async () => {
      // Strona stała się widoczna
      if (document.visibilityState === 'visible') {
        // Jeśli blokada była aktywna ale została zwolniona (przez zmianę karty),
        // spróbuj ją ponownie uzyskać
        if (isActive && !wakeLockRef.current) {
          await request()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive, request])

  // Cleanup przy odmontowaniu komponentu
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {
          // Ignoruj błędy przy cleanup
        })
        wakeLockRef.current = null
      }
    }
  }, [])

  return {
    isSupported,
    isActive,
    request,
    release,
    error,
  }
}
