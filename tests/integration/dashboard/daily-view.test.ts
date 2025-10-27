/**
 * Dashboard Daily View - Integration Tests
 *
 * Testy integracyjne dla widoku dashboardu:
 * - Wyświetlanie posiłków na dzisiaj
 * - Nawigacja kalendarzem
 * - Paski postępu makro
 * - Auto-generowanie brakujących posiłków
 * - Interakcje z posiłkami
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '../../helpers/test-utils'
import userEvent from '@testing-library/user-event'
import DashboardClient from '@/components/dashboard/DashboardClient'
import { testPlannedMeals, generateWeekPlan } from '../../fixtures/planned-meals'
import { testProfile } from '../../fixtures/profiles'

// Mock hooks
vi.mock('@/hooks/usePlannedMealsQuery', () => ({
  usePlannedMealsQuery: () => ({
    data: testPlannedMeals.slice(0, 3), // 3 posiłki na dzisiaj
    isLoading: false,
    error: null,
  }),
}))

vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
  }),
}))

vi.mock('@/hooks/useDailyMacros', () => ({
  useDailyMacros: () => ({
    totals: {
      calories: 1800,
      protein_g: 176,
      carbs_g: 68,
      fats_g: 97,
    },
    targets: testProfile,
  }),
}))

describe('Dashboard Daily View', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Render', () => {
    test('renders dashboard with today meals', async () => {
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      await waitFor(() => {
        expect(screen.getByText(/twój plan na dzisiaj/i)).toBeInTheDocument()
      })

      // Sprawdź czy są 3 posiłki
      expect(screen.getByText(/śniadanie/i)).toBeInTheDocument()
      expect(screen.getByText(/obiad/i)).toBeInTheDocument()
      expect(screen.getByText(/kolacja/i)).toBeInTheDocument()
    })

    test('displays correct date', () => {
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      const today = new Date().toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })

      expect(screen.getByText(new RegExp(today, 'i'))).toBeInTheDocument()
    })

    test('shows loading state initially', () => {
      vi.mocked(require('@/hooks/usePlannedMealsQuery').usePlannedMealsQuery).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      })

      render(<DashboardClient initialMeals={[]} />)

      expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument()
    })

    test('displays empty state when no meals', () => {
      vi.mocked(require('@/hooks/usePlannedMealsQuery').usePlannedMealsQuery).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      })

      render(<DashboardClient initialMeals={[]} />)

      expect(screen.getByText(/brak posiłków na dzisiaj/i)).toBeInTheDocument()
    })
  })

  describe('Meal Cards', () => {
    test('displays meal details', () => {
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      const breakfastCard = screen.getByText('Omlet z warzywami').closest('[data-meal-card]')

      within(breakfastCard!).getByText(/500 kcal/i)
      within(breakfastCard!).getByText(/40g/i) // Protein
      within(breakfastCard!).getByText(/10g/i) // Carbs
      within(breakfastCard!).getByText(/35g/i) // Fats
    })

    test('shows recipe image or placeholder', () => {
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      const images = screen.getAllByRole('img')
      expect(images.length).toBeGreaterThan(0)
    })

    test('displays meal type badge', () => {
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      expect(screen.getByText(/śniadanie/i)).toBeInTheDocument()
      expect(screen.getByText(/obiad/i)).toBeInTheDocument()
      expect(screen.getByText(/kolacja/i)).toBeInTheDocument()
    })

    test('shows action buttons on meal card', () => {
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      // Każda karta powinna mieć przyciski akcji
      const viewButtons = screen.getAllByLabelText(/zobacz przepis/i)
      expect(viewButtons).toHaveLength(3)

      const swapButtons = screen.getAllByLabelText(/zamień posiłek/i)
      expect(swapButtons).toHaveLength(3)

      const editButtons = screen.getAllByLabelText(/edytuj składniki/i)
      expect(editButtons).toHaveLength(3)
    })
  })

  describe('Macro Progress Section', () => {
    test('displays macro progress bars', () => {
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      expect(screen.getByText(/kalorie/i)).toBeInTheDocument()
      expect(screen.getByText(/białko/i)).toBeInTheDocument()
      expect(screen.getByText(/węglowodany/i)).toBeInTheDocument()
      expect(screen.getByText(/tłuszcze/i)).toBeInTheDocument()
    })

    test('shows current vs target values', () => {
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      // Kalorie: 1800 / 1800 (100%)
      expect(screen.getByText(/1800.*\/ 1800/)).toBeInTheDocument()
    })

    test('calculates progress percentage correctly', () => {
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      // Białko: 176g / 158g = 111%
      const proteinBar = screen.getByTestId('protein-progress-bar')
      expect(proteinBar).toHaveAttribute('aria-valuenow', '111')
    })

    test('shows color coding for progress (green/yellow/red)', () => {
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      const caloriesBar = screen.getByTestId('calories-progress-bar')
      // 100% → zielony
      expect(caloriesBar).toHaveClass('bg-green-500')
    })

    test('handles over-target progress (>100%)', () => {
      vi.mocked(require('@/hooks/useDailyMacros').useDailyMacros).mockReturnValue({
        totals: {
          calories: 2000, // Przekroczenie o 200 kcal
          protein_g: 176,
          carbs_g: 68,
          fats_g: 97,
        },
        targets: testProfile,
      })

      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      const caloriesBar = screen.getByTestId('calories-progress-bar')
      expect(caloriesBar).toHaveAttribute('aria-valuenow', '111') // 2000/1800
    })
  })

  describe('Calendar Navigation', () => {
    test('renders calendar strip with days', () => {
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      expect(screen.getByTestId('calendar-strip')).toBeInTheDocument()

      // Powinno być 7 dni
      const dayButtons = screen.getAllByRole('button', { name: /\d{1,2}/ })
      expect(dayButtons.length).toBeGreaterThanOrEqual(7)
    })

    test('highlights current day', () => {
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      const today = new Date().getDate()
      const todayButton = screen.getByRole('button', { name: String(today) })

      expect(todayButton).toHaveClass('bg-primary')
    })

    test('changes date on day click', async () => {
      const user = userEvent.setup()
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowDay = tomorrow.getDate()

      const tomorrowButton = screen.getByRole('button', { name: String(tomorrowDay) })
      await user.click(tomorrowButton)

      await waitFor(() => {
        expect(tomorrowButton).toHaveClass('bg-primary')
      })
    })

    test('updates meals when date changes', async () => {
      const user = userEvent.setup()

      const mockQuery = vi.fn()
        .mockReturnValueOnce({
          data: testPlannedMeals.slice(0, 3), // Today
          isLoading: false,
          error: null,
        })
        .mockReturnValueOnce({
          data: testPlannedMeals.slice(3, 6), // Tomorrow
          isLoading: false,
          error: null,
        })

      vi.mocked(require('@/hooks/usePlannedMealsQuery').usePlannedMealsQuery).mockImplementation(mockQuery)

      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowButton = screen.getByRole('button', { name: String(tomorrow.getDate()) })

      await user.click(tomorrowButton)

      await waitFor(() => {
        expect(mockQuery).toHaveBeenCalledTimes(2)
      })
    })

    test('shows navigation arrows for week navigation', () => {
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      expect(screen.getByLabelText(/poprzedni tydzień/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/następny tydzień/i)).toBeInTheDocument()
    })

    test('navigates to previous week', async () => {
      const user = userEvent.setup()
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      const prevButton = screen.getByLabelText(/poprzedni tydzień/i)
      await user.click(prevButton)

      // Powinien załadować posiłki z poprzedniego tygodnia
      await waitFor(() => {
        expect(vi.mocked(require('@/hooks/usePlannedMealsQuery').usePlannedMealsQuery)).toHaveBeenCalled()
      })
    })
  })

  describe('Meal Interactions', () => {
    test('opens recipe modal on view button click', async () => {
      const user = userEvent.setup()
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      const viewButton = screen.getAllByLabelText(/zobacz przepis/i)[0]
      await user.click(viewButton!)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText(/omlet z warzywami/i)).toBeInTheDocument()
      })
    })

    test('opens swap dialog on swap button click', async () => {
      const user = userEvent.setup()
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      const swapButton = screen.getAllByLabelText(/zamień posiłek/i)[0]
      await user.click(swapButton!)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText(/wybierz zamiennik/i)).toBeInTheDocument()
      })
    })

    test('opens ingredient editor on edit button click', async () => {
      const user = userEvent.setup()
      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      const editButton = screen.getAllByLabelText(/edytuj składniki/i)[0]
      await user.click(editButton!)

      await waitFor(() => {
        expect(screen.getByText(/edytuj składniki/i)).toBeInTheDocument()
      })
    })

    test('marks meal as eaten', async () => {
      const user = userEvent.setup()
      const mockMutation = vi.fn().mockResolvedValue({ error: null })

      vi.mock('@/hooks/useMealToggle', () => ({
        useMealToggle: () => ({
          toggleMeal: mockMutation,
          isLoading: false,
        }),
      }))

      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      const checkbox = screen.getAllByRole('checkbox', { name: /zjedzony/i })[0]
      await user.click(checkbox!)

      await waitFor(() => {
        expect(mockMutation).toHaveBeenCalled()
      })
    })
  })

  describe('Auto-generation of Missing Meals', () => {
    test('detects incomplete week plan (< 21 meals)', async () => {
      const incompletePlan = testPlannedMeals.slice(0, 18) // 18/21

      vi.mocked(require('@/hooks/usePlannedMealsQuery').usePlannedMealsQuery).mockReturnValue({
        data: incompletePlan,
        isLoading: false,
        error: null,
      })

      render(<DashboardClient initialMeals={incompletePlan} />)

      await waitFor(() => {
        expect(screen.getByText(/generowanie brakujących posiłków/i)).toBeInTheDocument()
      })
    })

    test('calls auto-generation hook for missing meals', async () => {
      const mockAutoGenerate = vi.fn()

      vi.mock('@/hooks/useAutoGenerateMealPlan', () => ({
        useAutoGenerateMealPlan: mockAutoGenerate,
      }))

      const incompletePlan = testPlannedMeals.slice(0, 18)

      render(<DashboardClient initialMeals={incompletePlan} />)

      await waitFor(() => {
        expect(mockAutoGenerate).toHaveBeenCalled()
      })
    })

    test('shows success message after generation', async () => {
      const mockAutoGenerate = vi.fn().mockResolvedValue({
        data: { generated: 3 },
        error: null,
      })

      vi.mock('@/hooks/useAutoGenerateMealPlan', () => ({
        useAutoGenerateMealPlan: () => ({
          generate: mockAutoGenerate,
          isGenerating: false,
        }),
      }))

      const incompletePlan = testPlannedMeals.slice(0, 18)

      render(<DashboardClient initialMeals={incompletePlan} />)

      await waitFor(() => {
        expect(screen.getByText(/wygenerowano 3 posiłki/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    test('displays error message when query fails', () => {
      vi.mocked(require('@/hooks/usePlannedMealsQuery').usePlannedMealsQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch meals'),
      })

      render(<DashboardClient initialMeals={[]} />)

      expect(screen.getByText(/błąd pobierania posiłków/i)).toBeInTheDocument()
    })

    test('shows retry button on error', async () => {
      const mockRefetch = vi.fn()

      vi.mocked(require('@/hooks/usePlannedMealsQuery').usePlannedMealsQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch meals'),
        refetch: mockRefetch,
      })

      const user = userEvent.setup()
      render(<DashboardClient initialMeals={[]} />)

      const retryButton = screen.getByRole('button', { name: /spróbuj ponownie/i })
      await user.click(retryButton)

      expect(mockRefetch).toHaveBeenCalled()
    })
  })

  describe('Responsive Design', () => {
    test('renders mobile layout on small screens', () => {
      // Mock window.innerWidth
      global.innerWidth = 375
      global.dispatchEvent(new Event('resize'))

      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      const container = screen.getByTestId('dashboard-container')
      expect(container).toHaveClass('flex-col')
    })

    test('renders desktop layout on large screens', () => {
      global.innerWidth = 1024
      global.dispatchEvent(new Event('resize'))

      render(<DashboardClient initialMeals={testPlannedMeals.slice(0, 3)} />)

      const container = screen.getByTestId('dashboard-container')
      expect(container).toHaveClass('grid-cols-2')
    })
  })
})
