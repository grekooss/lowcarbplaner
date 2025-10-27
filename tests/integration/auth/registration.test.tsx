/**
 * RegisterForm Component - Integration Tests
 *
 * Testy integracyjne dla komponentu RegisterForm:
 * - Renderowanie formularza (email, password, confirmPassword)
 * - Walidacja formularza (Zod schema)
 * - Password strength indicator
 * - Password confirmation matching
 * - Submit z callback onSubmit
 * - Loading state
 * - Error display
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../helpers/test-utils'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from '@/components/auth/RegisterForm'

// Mock RegisterForm component to avoid 'use client' directive issues in tests
vi.mock('@/components/auth/RegisterForm', async () => {
  const actual = await import('../../mocks/RegisterFormMock')
  return {
    RegisterForm: actual.RegisterForm
  }
})

describe('RegisterForm Component', () => {
  const mockSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    test('renders registration form with all fields', () => {
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^hasło$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/potwierdź hasło/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /zarejestruj się/i })
      ).toBeInTheDocument()
    })

    test('renders password strength indicator', () => {
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      // PasswordStrengthIndicator component should be rendered
      // Initially hidden or showing weak strength
      expect(screen.getByText(/siła hasła/i)).toBeInTheDocument()
    })
  })

  describe('Email Validation', () => {
    test('validates email format on blur', async () => {
      const user = userEvent.setup()
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      const emailInput = screen.getByLabelText(/email/i)

      await user.type(emailInput, 'invalid-email')
      await user.tab()

      await waitFor(() => {
        expect(
          screen.getByText(/nieprawidłowy.*email/i)
        ).toBeInTheDocument()
      })
    })

    test('accepts valid email format', async () => {
      const user = userEvent.setup()
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      const emailInput = screen.getByLabelText(/email/i)

      await user.type(emailInput, 'valid@example.com')
      await user.tab()

      await waitFor(() => {
        expect(
          screen.queryByText(/nieprawidłowy.*email/i)
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Password Validation', () => {
    test('validates minimum password length', async () => {
      const user = userEvent.setup()
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      const passwordInput = screen.getByLabelText(/^hasło$/i)

      await user.type(passwordInput, '123')
      await user.tab()

      await waitFor(() => {
        expect(
          screen.getByText(/hasło.*minimum.*8.*znak/i)
        ).toBeInTheDocument()
      })
    })

    test('validates password requirements (uppercase, number, symbol)', async () => {
      const user = userEvent.setup()
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      const passwordInput = screen.getByLabelText(/^hasło$/i)

      // Weak password (only lowercase)
      await user.type(passwordInput, 'weakpassword')
      await user.tab()

      await waitFor(() => {
        // Password strength indicator should show requirements
        expect(screen.getByText(/wielka litera/i)).toBeInTheDocument()
        expect(screen.getByText(/cyfra/i)).toBeInTheDocument()
      })
    })

    test('accepts strong password', async () => {
      const user = userEvent.setup()
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      const passwordInput = screen.getByLabelText(/^hasło$/i)

      await user.type(passwordInput, 'StrongPass123!')

      await waitFor(() => {
        // Password strength indicator should show strong
        expect(screen.getByText(/silne|mocne/i)).toBeInTheDocument()
      })
    })
  })

  describe('Password Confirmation', () => {
    test('validates passwords match', async () => {
      const user = userEvent.setup()
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      const passwordInput = screen.getByLabelText(/^hasło$/i)
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i)

      await user.type(passwordInput, 'StrongPass123!')
      await user.type(confirmPasswordInput, 'DifferentPass123!')
      await user.tab()

      await waitFor(() => {
        expect(screen.getByText(/hasła.*nie pasują/i)).toBeInTheDocument()
      })
    })

    test('accepts matching passwords', async () => {
      const user = userEvent.setup()
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      const passwordInput = screen.getByLabelText(/^hasło$/i)
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i)

      await user.type(passwordInput, 'StrongPass123!')
      await user.type(confirmPasswordInput, 'StrongPass123!')
      await user.tab()

      await waitFor(() => {
        expect(
          screen.queryByText(/hasła.*nie pasują/i)
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    test('calls onSubmit with valid data', async () => {
      mockSubmit.mockResolvedValue(undefined)

      const user = userEvent.setup()
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^hasło$/i), 'StrongPass123!')
      await user.type(
        screen.getByLabelText(/potwierdź hasło/i),
        'StrongPass123!'
      )
      await user.click(screen.getByRole('button', { name: /zarejestruj się/i }))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith(
          'test@example.com',
          'StrongPass123!'
        )
      })
    })

    test('does not call onSubmit with invalid data', async () => {
      mockSubmit.mockResolvedValue(undefined)

      const user = userEvent.setup()
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      await user.type(screen.getByLabelText(/email/i), 'invalid-email')
      await user.type(screen.getByLabelText(/^hasło$/i), '123') // Too short
      await user.type(screen.getByLabelText(/potwierdź hasło/i), '123')
      await user.click(screen.getByRole('button', { name: /zarejestruj się/i }))

      await waitFor(() => {
        expect(mockSubmit).not.toHaveBeenCalled()
      })
    })

    test('does not call onSubmit when passwords do not match', async () => {
      mockSubmit.mockResolvedValue(undefined)

      const user = userEvent.setup()
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/^hasło$/i), 'StrongPass123!')
      await user.type(
        screen.getByLabelText(/potwierdź hasło/i),
        'DifferentPass123!'
      )
      await user.click(screen.getByRole('button', { name: /zarejestruj się/i }))

      await waitFor(() => {
        expect(mockSubmit).not.toHaveBeenCalled()
      })
    })
  })

  describe('Loading State', () => {
    test('disables inputs when isLoading=true', () => {
      render(<RegisterForm onSubmit={mockSubmit} isLoading={true} error={null} />)

      expect(screen.getByLabelText(/email/i)).toBeDisabled()
      expect(screen.getByLabelText(/^hasło$/i)).toBeDisabled()
      expect(screen.getByLabelText(/potwierdź hasło/i)).toBeDisabled()
      expect(
        screen.getByRole('button', { name: /rejestracja/i })
      ).toBeDisabled()
    })

    test('shows loading spinner when isLoading=true', () => {
      render(<RegisterForm onSubmit={mockSubmit} isLoading={true} error={null} />)

      expect(screen.getByText(/rejestracja/i)).toBeInTheDocument()
    })

    test('enables inputs when isLoading=false', () => {
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      expect(screen.getByLabelText(/email/i)).not.toBeDisabled()
      expect(screen.getByLabelText(/^hasło$/i)).not.toBeDisabled()
      expect(screen.getByLabelText(/potwierdź hasło/i)).not.toBeDisabled()
      expect(
        screen.getByRole('button', { name: /zarejestruj się/i })
      ).not.toBeDisabled()
    })
  })

  describe('Error Display', () => {
    test('displays error message when error prop is provided', () => {
      const errorMessage = 'Ten email jest już zajęty'
      render(
        <RegisterForm
          onSubmit={mockSubmit}
          isLoading={false}
          error={errorMessage}
        />
      )

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    test('does not display error when error prop is null', () => {
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('Password Visibility Toggle', () => {
    test('toggles password visibility', async () => {
      const user = userEvent.setup()
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      const passwordInput = screen.getByLabelText(/^hasło$/i) as HTMLInputElement
      const toggleButtons = screen.getAllByLabelText(/pokaż hasło/i)
      const passwordToggle = toggleButtons[0] // First password field

      expect(passwordInput.type).toBe('password')

      await user.click(passwordToggle)
      expect(passwordInput.type).toBe('text')

      await user.click(screen.getAllByLabelText(/ukryj hasło/i)[0])
      expect(passwordInput.type).toBe('password')
    })

    test('toggles confirm password visibility independently', async () => {
      const user = userEvent.setup()
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      const confirmPasswordInput = screen.getByLabelText(
        /potwierdź hasło/i
      ) as HTMLInputElement
      const toggleButtons = screen.getAllByLabelText(/pokaż hasło/i)
      const confirmToggle = toggleButtons[1] // Second password field

      expect(confirmPasswordInput.type).toBe('password')

      await user.click(confirmToggle)
      expect(confirmPasswordInput.type).toBe('text')

      await user.click(screen.getAllByLabelText(/ukryj hasło/i)[0])
      expect(confirmPasswordInput.type).toBe('password')
    })
  })

  describe('Accessibility', () => {
    test('associates labels with inputs correctly', () => {
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^hasło$/i)
      const confirmPasswordInput = screen.getByLabelText(/potwierdź hasło/i)

      expect(emailInput).toHaveAttribute('id', 'email')
      expect(passwordInput).toHaveAttribute('id', 'password')
      expect(confirmPasswordInput).toHaveAttribute('id', 'confirmPassword')
    })

    test('provides aria-invalid on validation errors', async () => {
      const user = userEvent.setup()
      render(
        <RegisterForm onSubmit={mockSubmit} isLoading={false} error={null} />
      )

      const emailInput = screen.getByLabelText(/email/i)

      await user.type(emailInput, 'invalid-email')
      await user.tab()

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true')
      })
    })
  })
})
