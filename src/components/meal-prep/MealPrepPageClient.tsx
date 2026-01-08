'use client'

/**
 * MealPrepPageClient - Główny komponent strony Meal Prep
 *
 * Wyświetla:
 * - Statystyki sesji
 * - Listę ostatnich/aktywnych sesji
 * - Planner nowej sesji
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  ChefHat,
  Calendar as CalendarIcon,
  Clock,
  Play,
  CheckCircle2,
  Timer,
  Plus,
  Utensils,
} from 'lucide-react'
import {
  getUserSessionsAction,
  getMealsForBatchCookingAction,
  createSessionAction,
} from '@/lib/actions/cooking-sessions'
import type { CookingSessionDTO, CookingSessionStatus } from '@/types/dto.types'

// Pomocnicza funkcja formatowania daty
function formatDate(
  dateStr: string,
  options: { weekday?: boolean } = {}
): string {
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

  if (options.weekday) {
    return `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`
  }
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

// Pomocnicza funkcja formatowania daty do ISO (lokalna strefa czasowa)
function toISODateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface MealPrepPageClientProps {
  userId: string
}

export function MealPrepPageClient({ userId }: MealPrepPageClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [selectedDate, setSelectedDate] = useState<string>(
    toISODateString(new Date())
  )

  // Fetch user sessions
  const { data: sessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['cooking-sessions', userId],
    queryFn: async () => {
      const result = await getUserSessionsAction()
      if ('error' in result) {
        throw new Error(result.error)
      }
      return result.data
    },
  })

  // Fetch meals for selected date
  const { data: mealsForDate, isLoading: isLoadingMeals } = useQuery({
    queryKey: ['meals-for-batch', selectedDate],
    queryFn: async () => {
      const result = await getMealsForBatchCookingAction(selectedDate)
      if ('error' in result) {
        throw new Error(result.error)
      }
      return result.data
    },
  })

  // Create session mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!mealsForDate?.length) {
        throw new Error('Brak posiłków do przygotowania')
      }

      const result = await createSessionAction({
        planned_date: selectedDate,
        planned_meal_ids: mealsForDate.map((m) => m.planned_meal_id),
      })

      if ('error' in result) {
        throw new Error(result.error)
      }

      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cooking-sessions'] })
      router.push(`/cooking/${data.sessionId}`)
    },
  })

  // Calculate stats
  const stats = {
    active: sessions?.filter((s) => s.status === 'in_progress').length || 0,
    planned: sessions?.filter((s) => s.status === 'planned').length || 0,
    completed: sessions?.filter((s) => s.status === 'completed').length || 0,
  }

  const activeSessions =
    sessions?.filter(
      (s) => s.status === 'in_progress' || s.status === 'paused'
    ) || []
  const plannedSessions = sessions?.filter((s) => s.status === 'planned') || []
  const recentCompletedSessions =
    sessions?.filter((s) => s.status === 'completed').slice(0, 3) || []

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h1 className='flex items-center gap-2 text-2xl font-bold'>
          <ChefHat className='h-7 w-7' />
          Sesje gotowania
        </h1>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <StatsCard
          icon={<Play className='h-5 w-5 text-green-600' />}
          label='Aktywne'
          value={stats.active}
          color='green'
        />
        <StatsCard
          icon={<Timer className='h-5 w-5 text-blue-600' />}
          label='Zaplanowane'
          value={stats.planned}
          color='blue'
        />
        <StatsCard
          icon={<CheckCircle2 className='h-5 w-5 text-gray-600' />}
          label='Ukończone'
          value={stats.completed}
          color='gray'
        />
      </div>

      {/* Active sessions */}
      {activeSessions.length > 0 && (
        <Card className='border-2 border-green-300/50 bg-green-50/30 backdrop-blur-md'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Play className='h-5 w-5 text-green-600' />
              Aktywne sesje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {activeSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onOpen={() => router.push(`/cooking/${session.id}`)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planned sessions */}
      {plannedSessions.length > 0 && (
        <Card className='border-2 border-white/30 bg-white/20 backdrop-blur-md'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Timer className='h-5 w-5 text-blue-600' />
              Zaplanowane sesje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {plannedSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onOpen={() => router.push(`/cooking/${session.id}`)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New session planner */}
      <Card className='border-2 border-white/30 bg-white/20 backdrop-blur-md'>
        <CardHeader className='pb-2'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Plus className='h-5 w-5' />
            Zaplanuj nową sesję
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {/* Date picker - simplified */}
            <div className='flex items-center gap-4'>
              <span className='text-sm font-medium'>Data:</span>
              <Input
                type='date'
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className='w-auto'
              />
            </div>

            {/* Meals for date */}
            {isLoadingMeals ? (
              <div className='py-8 text-center text-gray-500'>
                Ładowanie posiłków...
              </div>
            ) : mealsForDate?.length ? (
              <div className='space-y-3'>
                <p className='text-sm text-gray-600'>
                  Posiłki do przygotowania na {formatDate(selectedDate)}:
                </p>
                <div className='grid gap-3 sm:grid-cols-2'>
                  {mealsForDate.map((meal) => (
                    <div
                      key={meal.planned_meal_id}
                      className='flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 p-3'
                    >
                      {meal.recipe_image_url ? (
                        <Image
                          src={meal.recipe_image_url}
                          alt={meal.recipe_name}
                          width={40}
                          height={40}
                          className='h-10 w-10 rounded-lg object-cover'
                        />
                      ) : (
                        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-white/30'>
                          <Utensils className='h-5 w-5 text-gray-600' />
                        </div>
                      )}
                      <div>
                        <p className='font-medium'>{meal.recipe_name}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending}
                  className='w-full bg-green-600 hover:bg-green-700'
                >
                  {createMutation.isPending ? (
                    'Tworzenie sesji...'
                  ) : (
                    <>
                      <ChefHat className='mr-2 h-4 w-4' />
                      Utwórz sesję gotowania
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className='rounded-lg border border-dashed border-gray-300 py-8 text-center'>
                <Utensils className='mx-auto mb-2 h-8 w-8 text-gray-400' />
                <p className='text-gray-500'>
                  Brak zaplanowanych posiłków na ten dzień
                </p>
                <p className='mt-1 text-sm text-gray-400'>
                  Dodaj posiłki w planie żywienia, aby móc utworzyć sesję
                  gotowania
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent completed */}
      {recentCompletedSessions.length > 0 && (
        <Card className='border-2 border-white/30 bg-white/20 backdrop-blur-md'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <CheckCircle2 className='h-5 w-5 text-gray-600' />
              Ostatnio ukończone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {recentCompletedSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onOpen={() => router.push(`/cooking/${session.id}`)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoadingSessions && (
        <div className='py-8 text-center text-gray-500'>Ładowanie sesji...</div>
      )}
    </div>
  )
}

// Stats card component
function StatsCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'green' | 'blue' | 'gray'
}) {
  return (
    <Card className='border-2 border-white/30 bg-white/20 backdrop-blur-md'>
      <CardContent className='flex items-center gap-4 p-4'>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-lg',
            color === 'green' && 'bg-green-100',
            color === 'blue' && 'bg-blue-100',
            color === 'gray' && 'bg-gray-100'
          )}
        >
          {icon}
        </div>
        <div>
          <p className='text-sm text-gray-600'>{label}</p>
          <p className='text-2xl font-bold'>{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Session card component
function SessionCard({
  session,
  onOpen,
}: {
  session: CookingSessionDTO
  onOpen: () => void
}) {
  const statusConfig: Record<
    CookingSessionStatus,
    { label: string; color: string }
  > = {
    planned: {
      label: 'Zaplanowana',
      color: 'bg-blue-100 text-blue-700',
    },
    in_progress: {
      label: 'W trakcie',
      color: 'bg-green-100 text-green-700',
    },
    paused: {
      label: 'Wstrzymana',
      color: 'bg-yellow-100 text-yellow-700',
    },
    completed: {
      label: 'Ukończona',
      color: 'bg-gray-100 text-gray-700',
    },
    cancelled: {
      label: 'Anulowana',
      color: 'bg-red-100 text-red-700',
    },
  }

  const config = statusConfig[session.status]

  return (
    <div className='flex items-center justify-between rounded-lg border border-white/20 bg-white/10 p-4'>
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <CalendarIcon className='h-4 w-4 text-gray-500' />
          <span className='font-medium'>
            {formatDate(session.planned_date, { weekday: true })}
          </span>
          <Badge className={config.color}>{config.label}</Badge>
        </div>
        <div className='flex items-center gap-4 text-sm text-gray-500'>
          <span className='flex items-center gap-1'>
            <Utensils className='h-3 w-3' />
            {session.meals?.length || 0} przepisów
          </span>
          {(session.estimated_total_minutes ?? 0) > 0 && (
            <span className='flex items-center gap-1'>
              <Clock className='h-3 w-3' />~{session.estimated_total_minutes}{' '}
              min
            </span>
          )}
        </div>
      </div>
      <Button onClick={onOpen} variant='outline' size='sm'>
        {session.status === 'in_progress' || session.status === 'paused'
          ? 'Kontynuuj'
          : session.status === 'planned'
            ? 'Rozpocznij'
            : 'Zobacz'}
      </Button>
    </div>
  )
}
