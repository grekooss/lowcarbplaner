'use client'

/**
 * Hook do zarządzania sesją gotowania
 *
 * Obsługuje:
 * - Pobieranie i cache'owanie danych sesji
 * - Aktualizacje stanu sesji (start, pause, resume, complete)
 * - Kompletowanie kroków
 * - Subskrypcję Realtime dla multi-device sync
 * - Wake Lock podczas aktywnej sesji
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClientComponentClient } from '@/lib/supabase/client'
import {
  getSessionAction,
  startSessionAction,
  pauseSessionAction,
  resumeSessionAction,
  completeSessionAction,
  completeStepAction,
  addTimeAdjustmentAction,
} from '@/lib/actions/cooking-sessions'
import { useWakeLock } from './useWakeLock'
import type {
  CookingSessionDTO,
  CookingSessionStatus,
  CookingTimelineDTO,
  TimelineStepDTO,
} from '@/types/dto.types'

interface UseCookingSessionOptions {
  sessionId: string
  enableRealtime?: boolean
  enableWakeLock?: boolean
}

interface UseCookingSessionReturn {
  // Data
  session: CookingSessionDTO | null
  timeline: CookingTimelineDTO | null
  currentStep: TimelineStepDTO | null
  currentStepIndex: number

  // Status
  isLoading: boolean
  isError: boolean
  error: Error | null
  status: CookingSessionStatus | null

  // Wake Lock
  wakeLockSupported: boolean
  wakeLockActive: boolean

  // Actions
  startSession: () => Promise<void>
  pauseSession: () => Promise<void>
  resumeSession: () => Promise<void>
  completeSession: () => Promise<void>
  completeStep: (stepId: string) => Promise<void>
  adjustStepTime: (
    stepId: number | null,
    adjustmentType: 'time_add' | 'time_subtract' | 'skip' | 'repeat',
    value?: number,
    reason?: string
  ) => Promise<void>

  // Mutations status
  isStarting: boolean
  isPausing: boolean
  isResuming: boolean
  isCompleting: boolean
  isCompletingStep: boolean

  // Refetch
  refetch: () => void
}

export function useCookingSession({
  sessionId,
  enableRealtime = true,
  enableWakeLock = true,
}: UseCookingSessionOptions): UseCookingSessionReturn {
  const queryClient = useQueryClient()
  const supabase = createClientComponentClient()

  // Wake Lock
  const {
    isSupported: wakeLockSupported,
    isActive: wakeLockActive,
    request: requestWakeLock,
    release: releaseWakeLock,
  } = useWakeLock()

  // Local state for current step
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  // Query keys - wrapped in useMemo to prevent unnecessary re-renders
  const sessionQueryKey = useMemo(
    () => ['cooking-session', sessionId],
    [sessionId]
  )

  // Fetch session data
  const {
    data: session,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      const result = await getSessionAction(sessionId)
      if ('error' in result) {
        throw new Error(result.error)
      }
      return result.data
    },
    enabled: !!sessionId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  })

  // Generate timeline from session data
  // TODO: Timeline generation wymaga pełnych danych przepisów (z instrukcjami).
  // W przyszłości: pobierz timeline z serwera lub rozszerz session.meals o pełne dane.
  // Na razie zwracamy null - timeline będzie generowany po stronie serwera.
  const timeline = useMemo<CookingTimelineDTO | null>(() => {
    if (!session?.meals?.length) return null

    // Placeholder timeline z podstawowymi danymi
    return {
      session_id: session.id,
      total_estimated_minutes: session.estimated_total_minutes || 0,
      active_minutes: 0,
      passive_minutes: 0,
      steps: [],
      mise_place_groups: [],
      resource_conflicts: [],
      required_equipment: [],
      equipment_utilization: {},
      recipe_components: [],
      component_production_order: [],
    }
  }, [session])

  // Current step
  const currentStep = useMemo(() => {
    if (!timeline?.steps?.length) return null
    return timeline.steps[currentStepIndex] || null
  }, [timeline, currentStepIndex])

  // Sync current step index from session
  useEffect(() => {
    if (session?.current_step_index !== undefined) {
      setCurrentStepIndex(session.current_step_index)
    }
  }, [session?.current_step_index])

  // Wake Lock management
  useEffect(() => {
    if (!enableWakeLock || !wakeLockSupported) return

    if (session?.status === 'in_progress') {
      requestWakeLock()
    } else {
      releaseWakeLock()
    }

    return () => {
      releaseWakeLock()
    }
  }, [
    session?.status,
    enableWakeLock,
    wakeLockSupported,
    requestWakeLock,
    releaseWakeLock,
  ])

  // Realtime subscription
  useEffect(() => {
    if (!enableRealtime || !sessionId) return

    // Subscribe to session changes
    const channel = supabase
      .channel(`cooking_session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cooking_sessions',
          filter: `id=eq.${sessionId}`,
        },
        () => {
          // Invalidate and refetch
          queryClient.invalidateQueries({ queryKey: sessionQueryKey })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_step_progress',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: sessionQueryKey })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, enableRealtime, supabase, queryClient, sessionQueryKey])

  // Mutations
  const startMutation = useMutation({
    mutationFn: async () => {
      const result = await startSessionAction(sessionId)
      if ('error' in result) {
        throw new Error(result.error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKey })
    },
  })

  const pauseMutation = useMutation({
    mutationFn: async () => {
      const result = await pauseSessionAction(sessionId)
      if ('error' in result) {
        throw new Error(result.error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKey })
    },
  })

  const resumeMutation = useMutation({
    mutationFn: async () => {
      const result = await resumeSessionAction(sessionId)
      if ('error' in result) {
        throw new Error(result.error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKey })
    },
  })

  const completeMutation = useMutation({
    mutationFn: async () => {
      const result = await completeSessionAction(sessionId)
      if ('error' in result) {
        throw new Error(result.error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKey })
    },
  })

  const completeStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      // Parse step ID to get recipe_id and step_number (format: "123-1")
      const parts = stepId.split('-')
      const recipeIdStr = parts[0] || '0'
      const stepNumStr = parts[1] || '0'
      const recipeId = parseInt(recipeIdStr, 10)
      const stepNumber = parseInt(stepNumStr, 10)

      const result = await completeStepAction(sessionId, recipeId, stepNumber)
      if ('error' in result) {
        throw new Error(result.error)
      }

      // Move to next step
      setCurrentStepIndex((prev) => prev + 1)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKey })
    },
  })

  const adjustTimeMutation = useMutation({
    mutationFn: async ({
      stepId,
      adjustmentType,
      value,
      reason,
    }: {
      stepId: number | null
      adjustmentType: 'time_add' | 'time_subtract' | 'skip' | 'repeat'
      value?: number
      reason?: string
    }) => {
      const result = await addTimeAdjustmentAction(
        sessionId,
        stepId,
        adjustmentType,
        value,
        reason
      )
      if ('error' in result) {
        throw new Error(result.error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionQueryKey })
    },
  })

  // Action handlers
  const startSession = useCallback(async () => {
    await startMutation.mutateAsync()
  }, [startMutation])

  const pauseSession = useCallback(async () => {
    await pauseMutation.mutateAsync()
  }, [pauseMutation])

  const resumeSession = useCallback(async () => {
    await resumeMutation.mutateAsync()
  }, [resumeMutation])

  const completeSession = useCallback(async () => {
    await completeMutation.mutateAsync()
  }, [completeMutation])

  const handleCompleteStep = useCallback(
    async (stepId: string) => {
      await completeStepMutation.mutateAsync(stepId)
    },
    [completeStepMutation]
  )

  const adjustStepTime = useCallback(
    async (
      stepId: number | null,
      adjustmentType: 'time_add' | 'time_subtract' | 'skip' | 'repeat',
      value?: number,
      reason?: string
    ) => {
      await adjustTimeMutation.mutateAsync({
        stepId,
        adjustmentType,
        value,
        reason,
      })
    },
    [adjustTimeMutation]
  )

  return {
    // Data
    session: session || null,
    timeline,
    currentStep,
    currentStepIndex,

    // Status
    isLoading,
    isError,
    error: error as Error | null,
    status: session?.status || null,

    // Wake Lock
    wakeLockSupported,
    wakeLockActive,

    // Actions
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    completeStep: handleCompleteStep,
    adjustStepTime,

    // Mutations status
    isStarting: startMutation.isPending,
    isPausing: pauseMutation.isPending,
    isResuming: resumeMutation.isPending,
    isCompleting: completeMutation.isPending,
    isCompletingStep: completeStepMutation.isPending,

    // Refetch
    refetch,
  }
}
