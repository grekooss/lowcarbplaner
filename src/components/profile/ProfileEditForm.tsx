/**
 * ProfileEditForm component
 *
 * Form for editing profile data with validation and submission
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useProfileForm } from '@/hooks/useProfileForm'
import type { ProfileDTO } from '@/types/dto.types'
import {
  ACTIVITY_LEVEL_LABELS,
  GOAL_LABELS,
  WEIGHT_LOSS_RATE_OPTIONS,
} from '@/types/profile-view.types'

interface ProfileEditFormProps {
  initialData: ProfileDTO
}

export const ProfileEditForm = ({ initialData }: ProfileEditFormProps) => {
  const { form, isSubmitting, onSubmit } = useProfileForm(initialData)
  const goalValue = form.watch('goal')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edycja profilu</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className='space-y-6'>
            {/* Waga */}
            <FormField
              control={form.control}
              name='weight_kg'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waga (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.1'
                      min='40'
                      max='300'
                      placeholder='Wpisz swoją wagę'
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Poziom aktywności */}
            <FormField
              control={form.control}
              name='activity_level'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poziom aktywności</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Wybierz poziom aktywności' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ACTIVITY_LEVEL_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cel */}
            <FormField
              control={form.control}
              name='goal'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cel</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Wybierz swój cel' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(GOAL_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tempo utraty wagi (warunkowe) */}
            {goalValue === 'weight_loss' && (
              <FormField
                control={form.control}
                name='weight_loss_rate_kg_week'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo utraty wagi</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(parseFloat(value))
                      }
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Wybierz tempo' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WEIGHT_LOSS_RATE_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value.toString()}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
