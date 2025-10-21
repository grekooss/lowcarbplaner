'use client'

/**
 * DisclaimerStep Component
 *
 * Step 9: Disclaimer acceptance
 * User must accept disclaimer before proceeding to meal plan generation
 */

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

interface DisclaimerStepProps {
  value: boolean
  onChange: (value: boolean) => void
}

export function DisclaimerStep({ value, onChange }: DisclaimerStepProps) {
  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h2 className='text-foreground text-2xl font-semibold'>Oświadczenie</h2>
        <p className='text-muted-foreground text-sm'>
          Przed kontynuowaniem przeczytaj i zaakceptuj poniższe oświadczenie.
        </p>
      </div>

      <Alert>
        <AlertTriangle className='h-4 w-4' />
        <AlertTitle>Ważne informacje</AlertTitle>
        <AlertDescription className='mt-2 space-y-2'>
          <p>
            Aplikacja LowCarbPlaner służy wyłącznie celom edukacyjnym i nie
            zastępuje profesjonalnej porady medycznej, diagnozy ani leczenia.
          </p>
          <p>
            Przed rozpoczęciem jakiejkolwiek diety lub programu ćwiczeń,
            szczególnie jeśli masz jakiekolwiek schorzenia lub obawy dotyczące
            zdrowia, skonsultuj się z lekarzem lub wykwalifikowanym dietetykiem.
          </p>
          <p>
            Plany żywieniowe generowane przez aplikację są obliczane na
            podstawie ogólnych formuł i mogą nie być odpowiednie dla każdego
            użytkownika.
          </p>
          <p>
            Korzystając z tej aplikacji, przyjmujesz do wiadomości, że wszelkie
            decyzje dotyczące zdrowia i odżywiania podejmujesz na własną
            odpowiedzialność.
          </p>
        </AlertDescription>
      </Alert>

      <div className='flex items-start space-x-3 rounded-lg border p-4'>
        <Checkbox
          id='disclaimer'
          checked={value}
          onCheckedChange={onChange}
          aria-describedby='disclaimer-label'
        />
        <Label
          id='disclaimer-label'
          htmlFor='disclaimer'
          className='cursor-pointer text-sm leading-relaxed font-normal'
        >
          Potwierdzam, że przeczytałem(-am) i rozumiem powyższe oświadczenie.
          Akceptuję, że aplikacja nie zastępuje profesjonalnej porady medycznej
          i biorę pełną odpowiedzialność za decyzje dotyczące mojego zdrowia i
          odżywiania.
        </Label>
      </div>
    </div>
  )
}
