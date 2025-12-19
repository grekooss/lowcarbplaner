/**
 * PasswordStrengthIndicator Component
 *
 * Displays password strength meter and requirements checklist
 * Updates in real-time as user types password
 */

'use client'

import { useMemo } from 'react'
import { Check, X } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import {
  calculatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText,
} from '@/lib/utils/password-strength'
import { cn } from '@/lib/utils'

interface PasswordStrengthIndicatorProps {
  /** Current password value to evaluate */
  password: string
  /** Optional className for styling */
  className?: string
}

/**
 * Komponent wizualizujący siłę hasła i wymagania bezpieczeństwa
 *
 * Wyświetla:
 * - Progress bar z kolorowaniem (weak/medium/strong)
 * - Lista wymagań z checkmarkami (✅/❌)
 *
 * @example
 * ```tsx
 * <PasswordStrengthIndicator password={passwordValue} />
 * ```
 */
export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  // Oblicz siłę hasła i wymagania
  const { strength, score, requirements } = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  )

  // Nie pokazuj wskaźnika, jeśli hasło jest puste
  if (!password) {
    return null
  }

  const strengthColor = getPasswordStrengthColor(strength)
  const strengthText = getPasswordStrengthText(strength)

  return (
    <div className={cn('space-y-3', className)} aria-live='polite'>
      {/* Progress bar */}
      <div className='space-y-1.5'>
        <div className='flex items-center justify-between text-sm'>
          <span className='text-muted-foreground'>Siła hasła:</span>
          <span
            className={cn(
              'font-medium',
              strength === 'strong' && 'text-success',
              strength === 'medium' && 'text-warning',
              strength === 'weak' && 'text-error'
            )}
          >
            {strengthText}
          </span>
        </div>
        <Progress
          value={score}
          className='h-2'
          indicatorClassName={strengthColor}
          aria-label={`Siła hasła: ${strengthText}`}
        />
      </div>

      {/* Requirements checklist */}
      <div className='space-y-2'>
        <p className='text-muted-foreground text-sm font-medium'>Wymagania:</p>
        <ul className='space-y-1.5' role='list'>
          <RequirementItem
            met={requirements.minLength}
            text='Co najmniej 8 znaków'
          />
          <RequirementItem
            met={requirements.hasUppercase}
            text='Co najmniej 1 wielka litera'
          />
          <RequirementItem
            met={requirements.hasLowercase}
            text='Co najmniej 1 mała litera'
          />
          <RequirementItem
            met={requirements.hasNumber}
            text='Co najmniej 1 cyfra'
          />
        </ul>
      </div>
    </div>
  )
}

/**
 * Single requirement item with check/cross icon
 */
interface RequirementItemProps {
  met: boolean
  text: string
}

function RequirementItem({ met, text }: RequirementItemProps) {
  const Icon = met ? Check : X
  const iconColor = met ? 'text-success' : 'text-error'
  const textColor = met ? 'text-foreground' : 'text-muted-foreground'

  return (
    <li className='flex items-center gap-2 text-sm' role='listitem'>
      <Icon
        className={cn('h-4 w-4 flex-shrink-0', iconColor)}
        aria-hidden='true'
      />
      <span className={cn('transition-colors', textColor)}>{text}</span>
    </li>
  )
}
