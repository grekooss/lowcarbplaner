'use client'

/**
 * MisePlaceGroup - Grupa zadań przygotowawczych
 *
 * Wyświetla grupę podobnych czynności (np. krojenie warzyw)
 * z wieloma przepisami w jednym miejscu.
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Clock, ChevronDown, ChevronUp } from 'lucide-react'
import type { MisePlaceGroupDTO } from '@/types/dto.types'

interface MisePlaceGroupProps {
  group: MisePlaceGroupDTO
  className?: string
}

// Mapowanie nazw kategorii na ikony
const categoryIcons: Record<string, string> = {
  knife: '🔪',
  meat: '🥩',
  scale: '⚖️',
  'measuring-cup': '🧪',
  spices: '🧂',
  snowflake: '❄️',
  water: '💧',
  whisk: '🥄',
}

export function MisePlaceGroup({ group, className }: MisePlaceGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

  const allCompleted = completedTasks.size === group.tasks.length
  const completedCount = completedTasks.size

  const icon = group.category.icon_name
    ? categoryIcons[group.category.icon_name] || '📋'
    : '📋'

  return (
    <Card
      className={cn(
        'border-2 transition-all',
        allCompleted
          ? 'border-green-300 bg-green-50/50'
          : 'border-white/30 bg-white/20 backdrop-blur-md',
        className
      )}
    >
      <CardHeader
        className='cursor-pointer pb-2'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <span className='text-xl'>{icon}</span>
            {group.category.name}
          </CardTitle>
          <div className='flex items-center gap-2'>
            <Badge variant='secondary' className='text-xs'>
              {completedCount}/{group.tasks.length}
            </Badge>
            <Badge variant='outline' className='text-xs'>
              <Clock className='mr-1 h-3 w-3' />
              {group.total_estimated_minutes} min
            </Badge>
            {isExpanded ? (
              <ChevronUp className='h-4 w-4 text-gray-500' />
            ) : (
              <ChevronDown className='h-4 w-4 text-gray-500' />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className='pt-0'>
          <ul className='space-y-2'>
            {group.tasks.map((task) => {
              const taskId = `${task.recipe_id}-${task.step_number}`
              const isChecked = completedTasks.has(taskId)

              return (
                <li
                  key={taskId}
                  className={cn(
                    'flex items-start gap-3 rounded-lg p-2 transition-colors',
                    isChecked && 'bg-green-100/50'
                  )}
                >
                  <Checkbox
                    id={taskId}
                    checked={isChecked}
                    onCheckedChange={() => toggleTask(taskId)}
                    className='mt-0.5'
                  />
                  <label
                    htmlFor={taskId}
                    className={cn(
                      'flex-1 cursor-pointer text-sm',
                      isChecked && 'text-gray-500 line-through'
                    )}
                  >
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>{task.recipe_name}:</span>
                      <span>{task.description}</span>
                    </div>
                    {task.ingredients.length > 0 && (
                      <div className='mt-1 flex flex-wrap gap-1'>
                        {task.ingredients.map((ing, i) => (
                          <Badge
                            key={i}
                            variant='outline'
                            className='text-xs font-normal'
                          >
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </label>
                  <span className='shrink-0 text-xs text-gray-500'>
                    ~{task.estimated_minutes} min
                  </span>
                </li>
              )
            })}
          </ul>
        </CardContent>
      )}
    </Card>
  )
}
