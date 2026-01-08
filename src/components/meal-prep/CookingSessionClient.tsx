'use client'

/**
 * CookingSessionClient - Komponent klienta dla aktywnej sesji gotowania
 *
 * Wyświetla:
 * - Nagłówek z informacjami o sesji
 * - Wake Lock status
 * - CookingTimeline z krokami
 * - Kontrolki sesji
 */

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// Helper function for date formatting (replaces date-fns)
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const dayNames = [
    'Niedziela',
    'Poniedziałek',
    'Wtorek',
    'Środa',
    'Czwartek',
    'Piątek',
    'Sobota',
  ]
  const monthNames = [
    'stycznia',
    'lutego',
    'marca',
    'kwietnia',
    'maja',
    'czerwca',
    'lipca',
    'sierpnia',
    'września',
    'października',
    'listopada',
    'grudnia',
  ]
  return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`
}
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Smartphone, WifiOff, AlertTriangle } from 'lucide-react'
import { CookingTimeline } from './CookingTimeline'
import { useCookingSession } from '@/hooks/useCookingSession'
import { MealPrepSkeleton } from './MealPrepSkeleton'
import type { CookingSessionStatus } from '@/types/dto.types'

interface CookingSessionClientProps {
  sessionId: string
}

export function CookingSessionClient({ sessionId }: CookingSessionClientProps) {
  const router = useRouter()
  const {
    session,
    timeline,
    currentStepIndex,
    isLoading,
    isError,
    error,
    status,
    wakeLockSupported,
    wakeLockActive,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    completeStep,
    isStarting,
    isPausing,
    isResuming,
    isCompleting,
  } = useCookingSession({
    sessionId,
    enableRealtime: true,
    enableWakeLock: true,
  })

  if (isLoading) {
    return <MealPrepSkeleton />
  }

  if (isError) {
    return (
      <Card className='border-2 border-red-300 bg-red-50/50 backdrop-blur-md'>
        <CardContent className='flex flex-col items-center gap-4 py-8'>
          <AlertTriangle className='h-12 w-12 text-red-500' />
          <div className='text-center'>
            <h2 className='text-lg font-semibold text-red-700'>
              Błąd ładowania sesji
            </h2>
            <p className='text-sm text-red-600'>
              {error?.message || 'Nie udało się załadować sesji gotowania'}
            </p>
          </div>
          <Button onClick={() => router.push('/cooking')} variant='outline'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Wróć do listy sesji
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!session) {
    return (
      <Card className='border-2 border-white/30 bg-white/20 backdrop-blur-md'>
        <CardContent className='flex flex-col items-center gap-4 py-8'>
          <div className='text-center'>
            <h2 className='text-lg font-semibold'>Sesja nie znaleziona</h2>
            <p className='text-sm text-gray-500'>
              Sesja o podanym ID nie istnieje lub została usunięta
            </p>
          </div>
          <Button onClick={() => router.push('/cooking')} variant='outline'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Wróć do listy sesji
          </Button>
        </CardContent>
      </Card>
    )
  }

  const handleStepComplete = (stepId: string) => {
    completeStep(stepId)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <Button
          onClick={() => router.push('/cooking')}
          variant='ghost'
          size='sm'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Powrót
        </Button>

        {/* Wake Lock indicator */}
        <div className='flex items-center gap-2'>
          {wakeLockSupported ? (
            wakeLockActive ? (
              <Badge
                variant='outline'
                className='border-green-300 text-green-700'
              >
                <Smartphone className='mr-1 h-3 w-3' />
                Ekran aktywny
              </Badge>
            ) : (
              <Badge
                variant='outline'
                className='border-gray-300 text-gray-500'
              >
                <WifiOff className='mr-1 h-3 w-3' />
                Ekran może zgasnąć
              </Badge>
            )
          ) : null}
        </div>
      </div>

      {/* Session info */}
      <Card className='border-2 border-white/30 bg-white/20 backdrop-blur-md'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-xl font-bold'>
                Sesja: {formatDate(session.planned_date)}
              </h1>
              <p className='text-sm text-gray-500'>
                {session.meals?.length || 0} przepisów do przygotowania
              </p>
            </div>
            <SessionStatusBadge status={status} />
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {timeline ? (
        <CookingTimeline
          timeline={timeline}
          sessionStatus={status || 'planned'}
          currentStepIndex={currentStepIndex}
          onStepComplete={handleStepComplete}
          onStartSession={startSession}
          onPauseSession={pauseSession}
          onResumeSession={resumeSession}
          onCompleteSession={completeSession}
        />
      ) : (
        <Card className='border-2 border-amber-300 bg-amber-50/50 backdrop-blur-md'>
          <CardContent className='py-8 text-center'>
            <AlertTriangle className='mx-auto mb-4 h-12 w-12 text-amber-500' />
            <h2 className='text-lg font-semibold text-amber-800'>
              Nie można wygenerować osi czasu
            </h2>
            <p className='text-sm text-amber-600'>
              Upewnij się, że przepisy mają zdefiniowane instrukcje gotowania
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading states for mutations */}
      {(isStarting || isPausing || isResuming || isCompleting) && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm'>
          <Card className='border-2 border-white/30 bg-white/90 backdrop-blur-md'>
            <CardContent className='py-6 text-center'>
              <div className='mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-green-600' />
              <p className='text-sm text-gray-600'>
                {isStarting && 'Rozpoczynanie sesji...'}
                {isPausing && 'Wstrzymywanie sesji...'}
                {isResuming && 'Wznawianie sesji...'}
                {isCompleting && 'Kończenie sesji...'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Status badge component
function SessionStatusBadge({
  status,
}: {
  status: CookingSessionStatus | null
}) {
  if (!status) return null

  const config: Record<
    CookingSessionStatus,
    { label: string; className: string }
  > = {
    planned: {
      label: 'Zaplanowana',
      className: 'bg-blue-100 text-blue-700',
    },
    in_progress: {
      label: 'W trakcie',
      className: 'bg-green-100 text-green-700 animate-pulse',
    },
    paused: {
      label: 'Wstrzymana',
      className: 'bg-yellow-100 text-yellow-700',
    },
    completed: {
      label: 'Ukończona',
      className: 'bg-gray-100 text-gray-700',
    },
    cancelled: {
      label: 'Anulowana',
      className: 'bg-red-100 text-red-700',
    },
  }

  const { label, className } = config[status]

  return <Badge className={cn('text-sm', className)}>{label}</Badge>
}
