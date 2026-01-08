'use client'

/**
 * CookingTimeline - Główny komponent osi czasu sesji gotowania
 *
 * Wyświetla:
 * - Pasek postępu całej sesji
 * - Listę kroków z timerami
 * - Grupowanie Mise en Place
 * - Konflikty zasobów
 */

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Clock,
  ChefHat,
  Pause,
  Play,
  CheckCircle2,
  AlertTriangle,
  Timer,
  Flame,
} from 'lucide-react'
import { TimelineStep } from './TimelineStep'
import { MisePlaceGroup } from './MisePlaceGroup'
import type {
  CookingTimelineDTO,
  CookingSessionStatus,
} from '@/types/dto.types'

interface CookingTimelineProps {
  timeline: CookingTimelineDTO
  sessionStatus: CookingSessionStatus
  currentStepIndex: number
  onStepComplete: (stepId: string) => void
  onStartSession: () => void
  onPauseSession: () => void
  onResumeSession: () => void
  onCompleteSession: () => void
  className?: string
}

export function CookingTimeline({
  timeline,
  sessionStatus,
  currentStepIndex,
  onStepComplete,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onCompleteSession,
  className,
}: CookingTimelineProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0)

  // Oblicz postęp
  const completedSteps = timeline.steps.filter(
    (s) => s.status === 'completed'
  ).length
  const totalSteps = timeline.steps.length
  const progressPercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0

  // Timer elapsed time
  useEffect(() => {
    if (sessionStatus !== 'in_progress') return

    const interval = setInterval(() => {
      setElapsedMinutes((prev) => prev + 1)
    }, 60000) // co minutę

    return () => clearInterval(interval)
  }, [sessionStatus])

  // Grupuj kroki - prep jest obsługiwany przez MisePlaceGroup
  const otherSteps = timeline.steps.filter((s) => s.action_type !== 'prep')

  const remainingMinutes = Math.max(
    0,
    timeline.total_estimated_minutes - elapsedMinutes
  )

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header z postępem */}
      <Card className='border-2 border-white/30 bg-white/20 backdrop-blur-md'>
        <CardHeader className='pb-2'>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-xl'>
              <ChefHat className='h-6 w-6' />
              Sesja gotowania
            </CardTitle>
            <Badge
              variant={
                sessionStatus === 'in_progress' ? 'default' : 'secondary'
              }
              className={cn(
                sessionStatus === 'in_progress' && 'animate-pulse bg-green-500'
              )}
            >
              {sessionStatus === 'planned' && 'Zaplanowana'}
              {sessionStatus === 'in_progress' && 'W trakcie'}
              {sessionStatus === 'paused' && 'Wstrzymana'}
              {sessionStatus === 'completed' && 'Zakończona'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className='mb-4 space-y-2'>
            <div className='flex justify-between text-sm text-gray-600'>
              <span>Postęp: {progressPercent}%</span>
              <span>
                {completedSteps} / {totalSteps} kroków
              </span>
            </div>
            <Progress value={progressPercent} className='h-3' />
          </div>

          {/* Time info */}
          <div className='flex flex-wrap gap-4 text-sm'>
            <div className='flex items-center gap-1'>
              <Timer className='h-4 w-4 text-gray-500' />
              <span>
                Szacowany czas: {timeline.total_estimated_minutes} min
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <Clock className='h-4 w-4 text-gray-500' />
              <span>Pozostało: ~{remainingMinutes} min</span>
            </div>
            <div className='flex items-center gap-1'>
              <Flame className='h-4 w-4 text-orange-500' />
              <span>Aktywny czas: {timeline.active_minutes} min</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className='mt-4 flex gap-2'>
            {sessionStatus === 'planned' && (
              <Button
                onClick={onStartSession}
                className='bg-green-600 hover:bg-green-700'
              >
                <Play className='mr-2 h-4 w-4' />
                Rozpocznij gotowanie
              </Button>
            )}
            {sessionStatus === 'in_progress' && (
              <Button onClick={onPauseSession} variant='outline'>
                <Pause className='mr-2 h-4 w-4' />
                Wstrzymaj
              </Button>
            )}
            {sessionStatus === 'paused' && (
              <Button
                onClick={onResumeSession}
                className='bg-green-600 hover:bg-green-700'
              >
                <Play className='mr-2 h-4 w-4' />
                Wznów
              </Button>
            )}
            {(sessionStatus === 'in_progress' ||
              sessionStatus === 'paused') && (
              <Button onClick={onCompleteSession} variant='default'>
                <CheckCircle2 className='mr-2 h-4 w-4' />
                Zakończ sesję
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Konflikty zasobów */}
      {timeline.resource_conflicts.length > 0 && (
        <Card className='border-2 border-amber-300 bg-amber-50/50 backdrop-blur-md'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-lg text-amber-800'>
              <AlertTriangle className='h-5 w-5' />
              Konflikty zasobów ({timeline.resource_conflicts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-2 text-sm'>
              {timeline.resource_conflicts.map((conflict, index) => (
                <li key={index} className='flex items-start gap-2'>
                  <span className='font-medium'>
                    {conflict.equipment_name}:
                  </span>
                  <span className='text-gray-600'>
                    {conflict.resolution_suggestion}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Mise en Place */}
      {timeline.mise_place_groups.length > 0 && (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>
            Przygotowanie (Mise en Place)
          </h3>
          <div className='grid gap-4 md:grid-cols-2'>
            {timeline.mise_place_groups.map((group) => (
              <MisePlaceGroup key={group.id} group={group} />
            ))}
          </div>
        </div>
      )}

      {/* Lista kroków */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Kroki gotowania</h3>
        <div className='space-y-3'>
          {otherSteps.map((step, index) => (
            <TimelineStep
              key={step.id}
              step={step}
              isActive={
                sessionStatus === 'in_progress' && index === currentStepIndex
              }
              onComplete={() => onStepComplete(step.id)}
            />
          ))}
        </div>
      </div>

      {/* Wymagany sprzęt */}
      {timeline.required_equipment.length > 0 && (
        <Card className='border-2 border-white/30 bg-white/20 backdrop-blur-md'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg'>Wymagany sprzęt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {timeline.required_equipment.map((eq) => (
                <Badge key={eq.id} variant='outline' className='text-sm'>
                  {eq.name}
                  {eq.quantity > 1 && ` (×${eq.quantity})`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
