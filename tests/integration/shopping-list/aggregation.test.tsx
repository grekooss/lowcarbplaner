/**
 * Shopping List Aggregation - Integration Tests
 *
 * Testy integracyjne dla agregacji listy zakupów:
 * - Agregacja składników z 6-dniowego zakresu
 * - Uwzględnienie ingredient_overrides
 * - Grupowanie po kategoriach
 * - Offline persistence (localStorage)
 * - Checkbox state management
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '../../helpers/test-utils'
import userEvent from '@testing-library/user-event'
import ShoppingListClient from '@/components/shopping-list/ShoppingListClient'
import { getShoppingList } from '@/lib/actions/shopping-list'

const mockShoppingList = [
  {
    ingredient_id: 1,
    ingredient_name: 'Kurczak (pierś)',
    category: 'meat',
    total_amount: 1200, // 6 × 200g
    unit: 'g',
  },
  {
    ingredient_id: 2,
    ingredient_name: 'Brokuły',
    category: 'vegetables',
    total_amount: 900, // 6 × 150g
    unit: 'g',
  },
  {
    ingredient_id: 3,
    ingredient_name: 'Oliwa z oliwek',
    category: 'oils',
    total_amount: 90, // 6 × 15ml
    unit: 'ml',
  },
  {
    ingredient_id: 4,
    ingredient_name: 'Jaja',
    category: 'dairy',
    total_amount: 18, // 6 × 3 szt
    unit: 'szt',
  },
]

vi.mock('@/lib/actions/shopping-list', () => ({
  getShoppingList: vi.fn().mockResolvedValue({
    data: mockShoppingList,
    error: null,
  }),
}))

describe('Shopping List Aggregation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Date Range Calculation', () => {
    test('calculates 6-day range (tomorrow + 5 days)', async () => {
      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(getShoppingList).toHaveBeenCalled()
      })

      const callArgs = vi.mocked(getShoppingList).mock.calls[0]
      const startDate = new Date(callArgs[0]!)
      const endDate = new Date(callArgs[1]!)

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const sixDaysLater = new Date()
      sixDaysLater.setDate(sixDaysLater.getDate() + 6)
      sixDaysLater.setHours(0, 0, 0, 0)

      expect(startDate.toDateString()).toBe(tomorrow.toDateString())
      expect(endDate.toDateString()).toBe(sixDaysLater.toDateString())
    })

    test('displays date range info banner', async () => {
      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(
          screen.getByText(/lista na najbliższe 6 dni/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Ingredient Aggregation', () => {
    test('displays aggregated ingredients', async () => {
      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(screen.getByText('Kurczak (pierś)')).toBeInTheDocument()
        expect(screen.getByText('Brokuły')).toBeInTheDocument()
        expect(screen.getByText('Oliwa z oliwek')).toBeInTheDocument()
        expect(screen.getByText('Jaja')).toBeInTheDocument()
      })
    })

    test('shows correct quantities', async () => {
      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(screen.getByText(/1200 g/)).toBeInTheDocument() // Kurczak
        expect(screen.getByText(/900 g/)).toBeInTheDocument() // Brokuły
        expect(screen.getByText(/90 ml/)).toBeInTheDocument() // Oliwa
        expect(screen.getByText(/18 szt/)).toBeInTheDocument() // Jaja
      })
    })

    test('groups ingredients by category', async () => {
      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(screen.getByText(/mięso/i)).toBeInTheDocument()
        expect(screen.getByText(/warzywa/i)).toBeInTheDocument()
        expect(screen.getByText(/oleje/i)).toBeInTheDocument()
        expect(screen.getByText(/nabiał/i)).toBeInTheDocument()
      })
    })

    test('displays categories in accordion', async () => {
      render(<ShoppingListClient />)

      await waitFor(() => {
        const meatAccordion = screen.getByTestId('category-meat')
        expect(meatAccordion).toBeInTheDocument()
      })
    })

    test('shows item count per category', async () => {
      render(<ShoppingListClient />)

      await waitFor(() => {
        const meatHeader = screen
          .getByText(/mięso/i)
          .closest('[data-category-header]')
        within(meatHeader!).getByText(/1 pozycja/i)
      })
    })
  })

  describe('Ingredient Overrides Handling', () => {
    test('accounts for modified quantities', async () => {
      const mockListWithOverrides = [
        {
          ingredient_id: 1,
          ingredient_name: 'Kurczak (pierś)',
          category: 'meat',
          total_amount: 1080, // Zredukowane z 1200g (180g zamiast 200g × 6)
          unit: 'g',
        },
      ]

      vi.mocked(getShoppingList).mockResolvedValue({
        data: mockListWithOverrides,
        error: null,
      })

      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(screen.getByText(/1080 g/)).toBeInTheDocument()
      })
    })

    test('combines base and modified amounts correctly', async () => {
      // Scenariusz: 4 posiłki z 200g, 2 posiłki z 180g
      // Suma: 4×200 + 2×180 = 800 + 360 = 1160g
      const mockCombined = [
        {
          ingredient_id: 1,
          ingredient_name: 'Kurczak (pierś)',
          category: 'meat',
          total_amount: 1160,
          unit: 'g',
        },
      ]

      vi.mocked(getShoppingList).mockResolvedValue({
        data: mockCombined,
        error: null,
      })

      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(screen.getByText(/1160 g/)).toBeInTheDocument()
      })
    })
  })

  describe('Checkbox State & LocalStorage', () => {
    test('renders checkboxes for all items', async () => {
      render(<ShoppingListClient />)

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes).toHaveLength(4) // 4 składniki
      })
    })

    test('toggles checkbox on click', async () => {
      const user = userEvent.setup()
      render(<ShoppingListClient />)

      await waitFor(() => {
        const checkbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement
        expect(checkbox.checked).toBe(false)
      })

      const checkbox = screen.getAllByRole('checkbox')[0] as HTMLInputElement
      await user.click(checkbox)

      expect(checkbox.checked).toBe(true)
    })

    test('saves checked state to localStorage', async () => {
      const user = userEvent.setup()
      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox')).toHaveLength(4)
      })

      const checkbox = screen.getAllByRole('checkbox')[0]
      await user.click(checkbox)

      const savedState = localStorage.getItem('shopping-list-purchased')
      expect(savedState).toBeTruthy()

      const parsed = JSON.parse(savedState!)
      expect(parsed).toContain(1) // ingredient_id 1
    })

    test('restores checked state from localStorage', async () => {
      // Ustawienie localStorage przed renderowaniem
      localStorage.setItem('shopping-list-purchased', JSON.stringify([1, 3]))

      render(<ShoppingListClient />)

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[]

        // Kurczak (id: 1) i Oliwa (id: 3) powinny być zaznaczone
        const kurczakCheckbox = checkboxes.find(
          (cb) =>
            cb
              .closest('[data-ingredient-id]')
              ?.getAttribute('data-ingredient-id') === '1'
        )
        const oliwaCheckbox = checkboxes.find(
          (cb) =>
            cb
              .closest('[data-ingredient-id]')
              ?.getAttribute('data-ingredient-id') === '3'
        )

        expect(kurczakCheckbox?.checked).toBe(true)
        expect(oliwaCheckbox?.checked).toBe(true)
      })
    })

    test('persists state across remounts', async () => {
      const user = userEvent.setup()

      // First render
      const { unmount } = render(<ShoppingListClient />)

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox')).toHaveLength(4)
      })

      const checkbox = screen.getAllByRole('checkbox')[0]
      await user.click(checkbox)

      unmount()

      // Second render
      render(<ShoppingListClient />)

      await waitFor(() => {
        const restoredCheckbox = screen.getAllByRole(
          'checkbox'
        )[0] as HTMLInputElement
        expect(restoredCheckbox.checked).toBe(true)
      })
    })

    test('clears checked items when list changes', async () => {
      const { rerender } = render(<ShoppingListClient />)

      await waitFor(() => {
        const checkbox = screen.getAllByRole('checkbox')[0]
        expect(checkbox).toBeInTheDocument()
      })

      // Zaznacz kilka itemów
      const user = userEvent.setup()
      await user.click(screen.getAllByRole('checkbox')[0]!)

      // Zmień listę (nowy tydzień)
      const newList = [
        {
          ingredient_id: 5,
          ingredient_name: 'Ryż',
          category: 'grains',
          total_amount: 600,
          unit: 'g',
        },
      ]

      vi.mocked(getShoppingList).mockResolvedValue({
        data: newList,
        error: null,
      })

      rerender(<ShoppingListClient />)

      await waitFor(() => {
        // Stare zaznaczenia powinny zostać wyczyszczone
        const savedState = localStorage.getItem('shopping-list-purchased')
        expect(savedState).toBe('[]')
      })
    })
  })

  describe('Empty State', () => {
    test('displays empty state when no items', async () => {
      vi.mocked(getShoppingList).mockResolvedValue({
        data: [],
        error: null,
      })

      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(
          screen.getByText(/lista zakupów jest pusta/i)
        ).toBeInTheDocument()
      })
    })

    test('shows message to generate meal plan', async () => {
      vi.mocked(getShoppingList).mockResolvedValue({
        data: [],
        error: null,
      })

      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(screen.getByText(/wygeneruj plan posiłków/i)).toBeInTheDocument()
      })
    })
  })

  describe('Loading & Error States', () => {
    test('shows loading skeleton initially', () => {
      render(<ShoppingListClient />)

      expect(screen.getByTestId('shopping-list-skeleton')).toBeInTheDocument()
    })

    test('displays error message on fetch failure', async () => {
      vi.mocked(getShoppingList).mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch shopping list' },
      })

      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(
          screen.getByText(/błąd pobierania listy zakupów/i)
        ).toBeInTheDocument()
      })
    })

    test('shows retry button on error', async () => {
      vi.mocked(getShoppingList).mockResolvedValue({
        data: null,
        error: { message: 'Failed' },
      })

      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /spróbuj ponownie/i })
        ).toBeInTheDocument()
      })
    })

    test('retries on button click', async () => {
      const mockGetList = vi
        .fn()
        .mockResolvedValueOnce({ data: null, error: { message: 'Failed' } })
        .mockResolvedValueOnce({ data: mockShoppingList, error: null })

      vi.mocked(getShoppingList).mockImplementation(mockGetList)

      const user = userEvent.setup()
      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /spróbuj ponownie/i })
        ).toBeInTheDocument()
      })

      await user.click(
        screen.getByRole('button', { name: /spróbuj ponownie/i })
      )

      await waitFor(() => {
        expect(mockGetList).toHaveBeenCalledTimes(2)
        expect(screen.getByText('Kurczak (pierś)')).toBeInTheDocument()
      })
    })
  })

  describe('Category Expansion', () => {
    test('expands category on click', async () => {
      const user = userEvent.setup()
      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(screen.getByText(/mięso/i)).toBeInTheDocument()
      })

      const categoryHeader = screen.getByText(/mięso/i).closest('button')
      await user.click(categoryHeader!)

      await waitFor(() => {
        expect(screen.getByText('Kurczak (pierś)')).toBeVisible()
      })
    })

    test('collapses category on second click', async () => {
      const user = userEvent.setup()
      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(screen.getByText(/mięso/i)).toBeInTheDocument()
      })

      const categoryHeader = screen.getByText(/mięso/i).closest('button')

      // Expand
      await user.click(categoryHeader!)
      await waitFor(() => {
        expect(screen.getByText('Kurczak (pierś)')).toBeVisible()
      })

      // Collapse
      await user.click(categoryHeader!)
      await waitFor(() => {
        expect(screen.queryByText('Kurczak (pierś)')).not.toBeVisible()
      })
    })

    test('shows expand/collapse icon', async () => {
      render(<ShoppingListClient />)

      await waitFor(() => {
        const categoryHeader = screen.getByText(/mięso/i).closest('button')
        const icon = within(categoryHeader!).getByTestId('chevron-icon')
        expect(icon).toBeInTheDocument()
      })
    })
  })

  describe('Print Functionality', () => {
    test('renders print button', async () => {
      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /drukuj/i })
        ).toBeInTheDocument()
      })
    })

    test('triggers print dialog on click', async () => {
      const mockPrint = vi.fn()
      window.print = mockPrint

      const user = userEvent.setup()
      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /drukuj/i })
        ).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /drukuj/i }))

      expect(mockPrint).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA labels for checkboxes', async () => {
      render(<ShoppingListClient />)

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox')
        checkboxes.forEach((checkbox) => {
          expect(checkbox).toHaveAttribute('aria-label')
        })
      })
    })

    test('keyboard navigation works', async () => {
      const user = userEvent.setup()
      render(<ShoppingListClient />)

      await waitFor(() => {
        expect(screen.getAllByRole('checkbox')).toHaveLength(4)
      })

      const firstCheckbox = screen.getAllByRole('checkbox')[0]
      firstCheckbox.focus()

      await user.keyboard('{Space}')

      expect(firstCheckbox).toBeChecked()
    })
  })
})
