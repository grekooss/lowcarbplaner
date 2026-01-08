'use client'

/**
 * TimelineStep - Pojedynczy krok na osi czasu
 *
 * Wyświetla:
 * - Opis kroku
 * - Timer (dla kroków pasywnych)
 * - Wskazówki sensoryczne
 * - Status (pending/active/completed)
 */

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Eye,
  Volume2,
  Thermometer,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react'
import type { TimelineStepDTO } from '@/types/dto.types'

interface TimelineStepProps {
  step: TimelineStepDTO
  isActive: boolean
  onComplete: () => void
  className?: string
}

export function TimelineStep({
  step,
  isActive,
  onComplete,
  className,
}: TimelineStepProps) {
  const [timerSeconds, setTimerSeconds] = useState(
    (step.passive_duration || 0) * 60
  )
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerAdjustment, setTimerAdjustment] = useState(0)

  const isCompleted = step.status === 'completed'
  const hasTimer = step.passive_duration > 0
  const hasSensoryCues =
    step.sensory_cues &&
    (step.sensory_cues.visual ||
      step.sensory_cues.sound ||
      step.sensory_cues.smell ||
      step.sensory_cues.texture)

  // Timer logic
  useEffect(() => {
    if (!isTimerRunning || timerSeconds <= 0) return

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false)
          // TODO: Trigger notification
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isTimerRunning, timerSeconds])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  const adjustTimer = useCallback((seconds: number) => {
    setTimerSeconds((prev) => Math.max(0, prev + seconds))
    setTimerAdjustment((prev) => prev + seconds)
  }, [])

  const startTimer = useCallback(() => {
    if (timerSeconds > 0) {
      setIsTimerRunning(true)
    }
  }, [timerSeconds])

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false)
  }, [])

  // Icon based on action type
  const ActionIcon =
    step.action_type === 'passive'
      ? Clock
      : step.action_type === 'checkpoint'
        ? AlertCircle
        : Flame

  return (
    <Card
      className={cn(
        'border-2 transition-all duration-200',
        isCompleted && 'border-green-300 bg-green-50/50',
        isActive && !isCompleted && 'border-blue-400 bg-blue-50/50 shadow-lg',
        !isActive && !isCompleted && 'border-white/30 bg-white/20',
        className
      )}
    >
      <CardContent className='p-4'>
        <div className='flex items-start gap-3'>
          {/* Status icon */}
          <div className='mt-1'>
            {isCompleted ? (
              <CheckCircle2 className='h-6 w-6 text-green-600' />
            ) : isActive ? (
              <div className='relative'>
                <Circle className='h-6 w-6 text-blue-500' />
                <div className='absolute inset-0 animate-ping'>
                  <Circle className='h-6 w-6 text-blue-400' />
                </div>
              </div>
            ) : (
              <Circle className='h-6 w-6 text-gray-300' />
            )}
          </div>

          {/* Content */}
          <div className='flex-1 space-y-2'>
            {/* Header */}
            <div className='flex items-start justify-between'>
              <div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-gray-500'>
                    Krok {step.step_number}
                  </span>
                  <Badge variant='secondary' className='text-xs'>
                    {step.recipe_name}
                  </Badge>
                </div>
                <p
                  className={cn(
                    'mt-1 text-base',
                    isCompleted && 'text-gray-500 line-through'
                  )}
                >
                  {step.description}
                </p>
              </div>

              {/* Action type badge */}
              <Badge
                variant='outline'
                className={cn(
                  'shrink-0',
                  step.action_type === 'passive' &&
                    'border-blue-300 text-blue-700',
                  step.action_type === 'active' &&
                    'border-orange-300 text-orange-700',
                  step.action_type === 'checkpoint' &&
                    'border-red-300 text-red-700',
                  step.action_type === 'prep' &&
                    'border-green-300 text-green-700'
                )}
              >
                <ActionIcon className='mr-1 h-3 w-3' />
                {step.action_type === 'passive' && 'Pasywne'}
                {step.action_type === 'active' && 'Aktywne'}
                {step.action_type === 'checkpoint' && 'Checkpoint'}
                {step.action_type === 'prep' && 'Przygotowanie'}
                {step.action_type === 'assembly' && 'Składanie'}
              </Badge>
            </div>

            {/* Time info */}
            <div className='flex flex-wrap items-center gap-4 text-sm text-gray-600'>
              {step.active_duration > 0 && (
                <span className='flex items-center gap-1'>
                  <Flame className='h-4 w-4 text-orange-500' />
                  {step.scaled_active_duration} min aktywnie
                </span>
              )}
              {step.passive_duration > 0 && (
                <span className='flex items-center gap-1'>
                  <Clock className='h-4 w-4 text-blue-500' />
                  {step.scaled_passive_duration} min pasywnie
                </span>
              )}
            </div>

            {/* Equipment */}
            {step.equipment_names.length > 0 && (
              <div className='flex flex-wrap gap-1'>
                {step.equipment_names.map((name, index) => (
                  <Badge key={index} variant='outline' className='text-xs'>
                    {name}
                  </Badge>
                ))}
                {step.required_temperature && (
                  <Badge
                    variant='outline'
                    className='border-red-200 text-xs text-red-600'
                  >
                    <Thermometer className='mr-1 h-3 w-3' />
                    {step.required_temperature}°C
                  </Badge>
                )}
              </div>
            )}

            {/* Sensory cues */}
            {hasSensoryCues && (
              <div className='flex flex-wrap gap-2 rounded-lg bg-amber-50 p-2 text-sm'>
                {step.sensory_cues.visual && (
                  <span className='flex items-center gap-1 text-amber-700'>
                    <Eye className='h-4 w-4' />
                    {step.sensory_cues.visual}
                  </span>
                )}
                {step.sensory_cues.sound && (
                  <span className='flex items-center gap-1 text-amber-700'>
                    <Volume2 className='h-4 w-4' />
                    {step.sensory_cues.sound}
                  </span>
                )}
                {step.sensory_cues.smell && (
                  <span className='flex items-center gap-1 text-amber-700'>
                    🌿 {step.sensory_cues.smell}
                  </span>
                )}
                {step.sensory_cues.texture && (
                  <span className='flex items-center gap-1 text-amber-700'>
                    ✋ {step.sensory_cues.texture}
                  </span>
                )}
              </div>
            )}

            {/* Checkpoint condition */}
            {step.checkpoint_type && step.checkpoint_condition && (
              <div className='flex items-center gap-2 rounded-lg bg-red-50 p-2 text-sm text-red-700'>
                <AlertCircle className='h-4 w-4 shrink-0' />
                <span>{step.checkpoint_condition}</span>
              </div>
            )}

            {/* Timer */}
            {hasTimer && isActive && !isCompleted && (
              <div className='mt-3 flex items-center gap-3 rounded-lg bg-blue-50 p-3'>
                <div className='font-mono text-3xl font-bold text-blue-700'>
                  {formatTime(timerSeconds)}
                </div>

                <div className='flex gap-1'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => adjustTimer(-60)}
                    disabled={timerSeconds < 60}
                  >
                    <Minus className='h-4 w-4' />
                    1min
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => adjustTimer(60)}
                  >
                    <Plus className='h-4 w-4' />
                    1min
                  </Button>
                </div>

                {!isTimerRunning ? (
                  <Button
                    size='sm'
                    onClick={startTimer}
                    className='bg-blue-600 hover:bg-blue-700'
                  >
                    Start
                  </Button>
                ) : (
                  <Button size='sm' variant='outline' onClick={pauseTimer}>
                    Pauza
                  </Button>
                )}

                {timerAdjustment !== 0 && (
                  <span className='text-xs text-gray-500'>
                    ({timerAdjustment > 0 ? '+' : ''}
                    {Math.round(timerAdjustment / 60)} min)
                  </span>
                )}
              </div>
            )}

            {/* Complete button */}
            {isActive && !isCompleted && (
              <Button
                onClick={onComplete}
                className='mt-2 bg-green-600 hover:bg-green-700'
              >
                <CheckCircle2 className='mr-2 h-4 w-4' />
                Oznacz jako ukończone
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
