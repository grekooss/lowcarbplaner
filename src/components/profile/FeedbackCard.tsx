/**
 * FeedbackCard component
 *
 * Form for submitting user feedback and bug reports
 */

'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createFeedback } from '@/lib/actions/feedback'

const MIN_LENGTH = 10
const MAX_LENGTH = 1000

export const FeedbackCard = () => {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedContent = content.trim()

    // Walidacja
    if (trimmedContent.length < MIN_LENGTH) {
      toast.error('Zbyt krótka treść', {
        description: `Wpisz co najmniej ${MIN_LENGTH} znaków`,
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createFeedback({ content: trimmedContent })

      if (result.error) {
        toast.error('Błąd', {
          description: result.error,
        })
        return
      }

      toast.success('Dziękujemy za opinię!', {
        description: 'Twoja wiadomość została wysłana do zespołu.',
      })

      // Reset formularza
      setContent('')
    } catch {
      toast.error('Błąd', {
        description: 'Nie udało się wysłać opinii',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const charCount = content.length
  const isValid = content.trim().length >= MIN_LENGTH

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zgłoś problem lub prześlij opinię</CardTitle>
        <CardDescription>
          Pomóż nam ulepszyć aplikację - napisz o swoich doświadczeniach
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Textarea
              placeholder='Opisz swój problem lub sugestię...'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              maxLength={MAX_LENGTH}
              className='resize-none'
            />
            <div className='text-muted-foreground flex justify-between text-xs'>
              <span>Minimum {MIN_LENGTH} znaków</span>
              <span
                className={
                  charCount > MAX_LENGTH * 0.9 ? 'text-destructive' : ''
                }
              >
                {charCount} / {MAX_LENGTH}
              </span>
            </div>
          </div>
          <Button
            type='submit'
            disabled={!isValid || isSubmitting}
            className='w-full'
          >
            {isSubmitting ? 'Wysyłanie...' : 'Wyślij opinię'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
