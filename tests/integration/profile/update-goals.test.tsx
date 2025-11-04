/**
 * Profile Update & Goals Recalculation - Integration Tests
 *
 * Testy integracyjne dla aktualizacji profilu:
 * - Aktualizacja wagi
 * - Zmiana poziomu aktywności
 * - Automatyczne przeliczanie celów makro
 * - Walidacja danych wejściowych
 * - Feedback mechanism
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../helpers/test-utils'
import userEvent from '@testing-library/user-event'
import ProfileClient from '@/components/profile/ProfileClient'
import { testProfile } from '../../fixtures/profiles'
import { updateProfile } from '@/lib/actions/profile'
import * as feedbackActions from '@/lib/actions/feedback'

// Mock server actions
vi.mock('@/lib/actions/profile', () => ({
  getMyProfile: vi.fn().mockResolvedValue({
    data: testProfile,
    error: null,
  }),
  updateProfile: vi.fn().mockResolvedValue({
    data: { ...testProfile, weight_kg: 83 },
    error: null,
  }),
}))

vi.mock('@/lib/actions/feedback', () => ({
  createFeedback: vi.fn().mockResolvedValue({
    data: { id: 1 },
    error: null,
  }),
}))

describe('Profile Update & Goals Recalculation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Profile Form Display', () => {
    test('renders profile form with current values', async () => {
      render(<ProfileClient initialProfile={testProfile} />)

      await waitFor(() => {
        const weightInput = screen.getByLabelText(/waga/i) as HTMLInputElement
        expect(weightInput.value).toBe('85')

        const activitySelect = screen.getByLabelText(
          /poziom aktywności/i
        ) as HTMLSelectElement
        expect(activitySelect.value).toBe('moderate')
      })
    })

    test('displays current macro targets', () => {
      render(<ProfileClient initialProfile={testProfile} />)

      expect(screen.getByText(/1800.*kcal/i)).toBeInTheDocument()
      expect(screen.getByText(/158.*g.*białko/i)).toBeInTheDocument()
      expect(screen.getByText(/68.*g.*węglowodany/i)).toBeInTheDocument()
      expect(screen.getByText(/100.*g.*tłuszcze/i)).toBeInTheDocument()
    })

    test('shows all profile fields', () => {
      render(<ProfileClient initialProfile={testProfile} />)

      expect(screen.getByLabelText(/waga/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/poziom aktywności/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /zapisz zmiany/i })
      ).toBeInTheDocument()
    })

    test('displays user info (age, gender, height)', () => {
      render(<ProfileClient initialProfile={testProfile} />)

      expect(screen.getByText(/30 lat/i)).toBeInTheDocument()
      expect(screen.getByText(/mężczyzna/i)).toBeInTheDocument()
      expect(screen.getByText(/180 cm/i)).toBeInTheDocument()
    })
  })

  describe('Weight Update', () => {
    test('updates weight successfully', async () => {
      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      const weightInput = screen.getByLabelText(/waga/i)
      const saveButton = screen.getByRole('button', { name: /zapisz zmiany/i })

      await user.clear(weightInput)
      await user.type(weightInput, '83')
      await user.click(saveButton)

      await waitFor(() => {
        expect(updateProfile).toHaveBeenCalledWith(
          expect.objectContaining({ weight_kg: 83 })
        )
      })
    })

    test('validates weight is a positive number', async () => {
      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      const weightInput = screen.getByLabelText(/waga/i)
      const saveButton = screen.getByRole('button', { name: /zapisz zmiany/i })

      await user.clear(weightInput)
      await user.type(weightInput, '-10')
      await user.click(saveButton)

      await waitFor(() => {
        expect(
          screen.getByText(/waga musi być większa od 0/i)
        ).toBeInTheDocument()
      })
    })

    test('validates weight minimum (30kg)', async () => {
      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      const weightInput = screen.getByLabelText(/waga/i)
      const saveButton = screen.getByRole('button', { name: /zapisz zmiany/i })

      await user.clear(weightInput)
      await user.type(weightInput, '25')
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/minimalna waga to 30 kg/i)).toBeInTheDocument()
      })
    })

    test('validates weight maximum (300kg)', async () => {
      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      const weightInput = screen.getByLabelText(/waga/i)
      const saveButton = screen.getByRole('button', { name: /zapisz zmiany/i })

      await user.clear(weightInput)
      await user.type(weightInput, '350')
      await user.click(saveButton)

      await waitFor(() => {
        expect(
          screen.getByText(/maksymalna waga to 300 kg/i)
        ).toBeInTheDocument()
      })
    })

    test('recalculates goals after weight update', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        data: {
          ...testProfile,
          weight_kg: 80,
          target_calories: 1750, // Przeliczone
          target_protein_g: 153,
        },
        error: null,
      })

      vi.mocked(updateProfile).mockImplementation(mockUpdate)

      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      const weightInput = screen.getByLabelText(/waga/i)
      await user.clear(weightInput)
      await user.type(weightInput, '80')
      await user.click(screen.getByRole('button', { name: /zapisz zmiany/i }))

      await waitFor(() => {
        // Nowe cele powinny być wyświetlone
        expect(screen.getByText(/1750.*kcal/i)).toBeInTheDocument()
        expect(screen.getByText(/153.*g.*białko/i)).toBeInTheDocument()
      })
    })

    test('shows success message after update', async () => {
      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      const weightInput = screen.getByLabelText(/waga/i)
      await user.clear(weightInput)
      await user.type(weightInput, '83')
      await user.click(screen.getByRole('button', { name: /zapisz zmiany/i }))

      await waitFor(() => {
        expect(screen.getByText(/profil zaktualizowany/i)).toBeInTheDocument()
      })
    })
  })

  describe('Activity Level Update', () => {
    test('changes activity level', async () => {
      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      const activitySelect = screen.getByLabelText(/poziom aktywności/i)
      await user.selectOptions(activitySelect, 'active')

      const saveButton = screen.getByRole('button', { name: /zapisz zmiany/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(updateProfile).toHaveBeenCalledWith(
          expect.objectContaining({ activity_level: 'active' })
        )
      })
    })

    test('recalculates TDEE with new activity multiplier', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        data: {
          ...testProfile,
          activity_level: 'active',
          target_calories: 2100, // Wyższe TDEE
          target_protein_g: 184,
        },
        error: null,
      })

      vi.mocked(updateProfile).mockImplementation(mockUpdate)

      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      await user.selectOptions(
        screen.getByLabelText(/poziom aktywności/i),
        'active'
      )
      await user.click(screen.getByRole('button', { name: /zapisz zmiany/i }))

      await waitFor(() => {
        expect(screen.getByText(/2100.*kcal/i)).toBeInTheDocument()
      })
    })

    test('displays activity level descriptions', async () => {
      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      const activitySelect = screen.getByLabelText(/poziom aktywności/i)
      await user.click(activitySelect)

      expect(screen.getByText(/siedzący tryb życia/i)).toBeInTheDocument()
      expect(screen.getByText(/lekka aktywność/i)).toBeInTheDocument()
      expect(screen.getByText(/umiarkowana aktywność/i)).toBeInTheDocument()
      expect(screen.getByText(/wysoka aktywność/i)).toBeInTheDocument()
      expect(screen.getByText(/bardzo wysoka aktywność/i)).toBeInTheDocument()
    })
  })

  describe('Combined Updates', () => {
    test('updates both weight and activity level', async () => {
      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      await user.clear(screen.getByLabelText(/waga/i))
      await user.type(screen.getByLabelText(/waga/i), '80')
      await user.selectOptions(
        screen.getByLabelText(/poziom aktywności/i),
        'active'
      )
      await user.click(screen.getByRole('button', { name: /zapisz zmiany/i }))

      await waitFor(() => {
        expect(updateProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            weight_kg: 80,
            activity_level: 'active',
          })
        )
      })
    })

    test('recalculates all macros together', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        data: {
          ...testProfile,
          weight_kg: 80,
          activity_level: 'active',
          target_calories: 2050,
          target_protein_g: 179,
          target_carbs_g: 77,
          target_fats_g: 114,
        },
        error: null,
      })

      vi.mocked(updateProfile).mockImplementation(mockUpdate)

      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      await user.clear(screen.getByLabelText(/waga/i))
      await user.type(screen.getByLabelText(/waga/i), '80')
      await user.selectOptions(
        screen.getByLabelText(/poziom aktywności/i),
        'active'
      )
      await user.click(screen.getByRole('button', { name: /zapisz zmiany/i }))

      await waitFor(() => {
        expect(screen.getByText(/2050.*kcal/i)).toBeInTheDocument()
        expect(screen.getByText(/179.*g.*białko/i)).toBeInTheDocument()
        expect(screen.getByText(/77.*g.*węglowodany/i)).toBeInTheDocument()
        expect(screen.getByText(/114.*g.*tłuszcze/i)).toBeInTheDocument()
      })
    })
  })

  describe('Feedback Mechanism', () => {
    test('renders feedback textarea', () => {
      render(<ProfileClient initialProfile={testProfile} />)

      expect(screen.getByLabelText(/twoja opinia/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /wyślij opinię/i })
      ).toBeInTheDocument()
    })

    test('validates feedback length (10-1000 characters)', async () => {
      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      const textarea = screen.getByLabelText(/twoja opinia/i)
      const submitButton = screen.getByRole('button', {
        name: /wyślij opinię/i,
      })

      await user.type(textarea, 'Za krótk')
      await user.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText(/opinia musi mieć co najmniej 10 znaków/i)
        ).toBeInTheDocument()
      })
    })

    test('submits feedback successfully', async () => {
      const mockCreateFeedback = vi.fn().mockResolvedValue({
        data: { id: 1 },
        error: null,
      })

      vi.mocked(feedbackActions.createFeedback).mockImplementation(
        mockCreateFeedback
      )

      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      const textarea = screen.getByLabelText(/twoja opinia/i)
      await user.type(
        textarea,
        'Świetna aplikacja! Bardzo pomocna w planowaniu posiłków.'
      )
      await user.click(screen.getByRole('button', { name: /wyślij opinię/i }))

      await waitFor(() => {
        expect(mockCreateFeedback).toHaveBeenCalledWith({
          content: expect.stringContaining('Świetna aplikacja'),
        })
      })
    })

    test('shows character count', async () => {
      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      const textarea = screen.getByLabelText(/twoja opinia/i)
      await user.type(textarea, 'Test')

      expect(screen.getByText(/4 \/ 1000/)).toBeInTheDocument()
    })

    test('clears feedback after successful submission', async () => {
      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      const textarea = screen.getByLabelText(
        /twoja opinia/i
      ) as HTMLTextAreaElement
      await user.type(textarea, 'Dziękuję za aplikację!')
      await user.click(screen.getByRole('button', { name: /wyślij opinię/i }))

      await waitFor(() => {
        expect(textarea.value).toBe('')
      })
    })

    test('shows success toast after feedback submission', async () => {
      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      await user.type(
        screen.getByLabelText(/twoja opinia/i),
        'Dziękuję za aplikację!'
      )
      await user.click(screen.getByRole('button', { name: /wyślij opinię/i }))

      await waitFor(() => {
        expect(screen.getByText(/opinia wysłana/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form State Management', () => {
    test('disables save button when no changes', () => {
      render(<ProfileClient initialProfile={testProfile} />)

      const saveButton = screen.getByRole('button', { name: /zapisz zmiany/i })
      expect(saveButton).toBeDisabled()
    })

    test('enables save button after changes', async () => {
      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      const weightInput = screen.getByLabelText(/waga/i)
      const saveButton = screen.getByRole('button', { name: /zapisz zmiany/i })

      expect(saveButton).toBeDisabled()

      await user.clear(weightInput)
      await user.type(weightInput, '83')

      expect(saveButton).toBeEnabled()
    })

    test('shows loading state during save', async () => {
      const mockUpdate = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 1000))
        )

      vi.mocked(updateProfile).mockImplementation(mockUpdate)

      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      await user.clear(screen.getByLabelText(/waga/i))
      await user.type(screen.getByLabelText(/waga/i), '83')
      await user.click(screen.getByRole('button', { name: /zapisz zmiany/i }))

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    })

    test('disables form during save', async () => {
      const mockUpdate = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 1000))
        )

      vi.mocked(updateProfile).mockImplementation(mockUpdate)

      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      await user.clear(screen.getByLabelText(/waga/i))
      await user.type(screen.getByLabelText(/waga/i), '83')
      await user.click(screen.getByRole('button', { name: /zapisz zmiany/i }))

      expect(screen.getByLabelText(/waga/i)).toBeDisabled()
      expect(screen.getByLabelText(/poziom aktywności/i)).toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    test('displays error message on save failure', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        error: { message: 'Failed to update profile' },
        data: null,
      })

      vi.mocked(updateProfile).mockImplementation(mockUpdate)

      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      await user.clear(screen.getByLabelText(/waga/i))
      await user.type(screen.getByLabelText(/waga/i), '83')
      await user.click(screen.getByRole('button', { name: /zapisz zmiany/i }))

      await waitFor(() => {
        expect(
          screen.getByText(/błąd aktualizacji profilu/i)
        ).toBeInTheDocument()
      })
    })

    test('retains form values after error', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        error: { message: 'Failed' },
        data: null,
      })

      vi.mocked(updateProfile).mockImplementation(mockUpdate)

      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      const weightInput = screen.getByLabelText(/waga/i) as HTMLInputElement
      await user.clear(weightInput)
      await user.type(weightInput, '83')
      await user.click(screen.getByRole('button', { name: /zapisz zmiany/i }))

      await waitFor(() => {
        expect(weightInput.value).toBe('83')
      })
    })

    test('allows retry after error', async () => {
      const mockUpdate = vi
        .fn()
        .mockResolvedValueOnce({ error: { message: 'Failed' }, data: null })
        .mockResolvedValueOnce({
          data: { ...testProfile, weight_kg: 83 },
          error: null,
        })

      vi.mocked(updateProfile).mockImplementation(mockUpdate)

      const user = userEvent.setup()
      render(<ProfileClient initialProfile={testProfile} />)

      await user.clear(screen.getByLabelText(/waga/i))
      await user.type(screen.getByLabelText(/waga/i), '83')

      // First attempt - fails
      await user.click(screen.getByRole('button', { name: /zapisz zmiany/i }))
      await waitFor(() => {
        expect(screen.getByText(/błąd/i)).toBeInTheDocument()
      })

      // Second attempt - succeeds
      await user.click(screen.getByRole('button', { name: /zapisz zmiany/i }))
      await waitFor(() => {
        expect(screen.getByText(/profil zaktualizowany/i)).toBeInTheDocument()
      })
    })
  })
})
